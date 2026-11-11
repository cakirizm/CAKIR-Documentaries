#!/usr/bin/env python3
"""CAKIR framework — narration builder.

Reads episodes/<id>/episode.json, synthesises every sentence with the
configured TTS voice (Kokoro, Apache-2.0, runs locally, no API key), lays the
sentences out on a single timeline and writes:

  public/episodes/<id>/audio/narration.wav   (48 kHz mono)
  episodes/<id>/build/timeline.json          (segment + sentence timings)
  episodes/<id>/build/<slug>_English.srt     (subtitles, sentence-synchronised)

Usage:  python scripts/build_narration.py airport [--only s01_hook,s02_who]
"""
import argparse, hashlib, json, os, re, sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

ROOT = Path(__file__).resolve().parent.parent
TTS_DIR = Path(os.environ.get("CAKIR_TTS_DIR", "/home/user/tts"))


def load_json(p):
    return json.loads(Path(p).read_text())


class Kokoro:
    def __init__(self):
        from kokoro_onnx import Kokoro as K
        self.k = K(str(TTS_DIR / "kokoro-v1.0.onnx"), str(TTS_DIR / "voices-v1.0.bin"))

    def say(self, text, voice, speed):
        samples, sr = self.k.create(text, voice=voice, speed=speed, lang="en-us")
        return np.asarray(samples, dtype=np.float32), sr


def tts_text(sentence, repl):
    out = sentence
    # longest keys first so "Terminal 2F" wins over "2F"
    for k in sorted(repl, key=len, reverse=True):
        out = out.replace(k, repl[k])
    return out


def trim(x, sr, thr_db):
    thr = 10 ** (thr_db / 20)
    win = int(sr * 0.01)
    env = np.convolve(np.abs(x), np.ones(win) / win, mode="same")
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(sr * 0.03))
    b = min(len(x), idx[-1] + int(sr * 0.08))
    y = x[a:b].copy()
    f = int(sr * 0.01)
    y[:f] *= np.linspace(0, 1, f)
    y[-f:] *= np.linspace(1, 0, f)
    return y


def wrap_lines(text, max_chars):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + (1 if cur else 0) <= max_chars:
            cur = f"{cur} {w}" if cur else w
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def chunk_sentence(text, max_chars, max_lines):
    """Split a sentence into subtitle cues of at most max_lines lines."""
    lines = wrap_lines(text, max_chars)
    cues = []
    for i in range(0, len(lines), max_lines):
        cues.append("\n".join(lines[i:i + max_lines]))
    # rebalance a dangling short last cue
    return cues


def fmt_ts(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--only", default="", help="comma-separated segment ids (sample builds)")
    ap.add_argument("--tag", default="", help="suffix for outputs, e.g. _sample")
    ap.add_argument("--endcard", type=float, default=None, help="override end-card seconds (samples)")
    args = ap.parse_args()

    ep_dir = ROOT / "episodes" / args.episode
    ep = load_json(ep_dir / "episode.json")
    cfg = load_json(ROOT / "framework/config/audio.json")
    ncfg, scfg = cfg["narration"], cfg["subtitles"]
    SR = cfg["sampleRate"]
    voice = ep["voice"]
    only = set(filter(None, args.only.split(",")))

    cache = ROOT / ".cache" / "tts"
    cache.mkdir(parents=True, exist_ok=True)
    engine = None

    segments_out, pieces, cursor = [], [], ncfg["introPadSec"]
    pieces.append(np.zeros(int(SR * cursor), dtype=np.float32))

    for seg in ep["segments"]:
        if only and seg["id"] not in only:
            continue
        seg_start = cursor
        pieces.append(np.zeros(int(SR * ncfg["segmentHeadSec"]), dtype=np.float32))
        cursor += ncfg["segmentHeadSec"]
        sents = []
        for i, s in enumerate(seg["sentences"]):
            t = tts_text(s, ep.get("ttsReplacements", {}))
            key = hashlib.sha1(f'{voice["engine"]}|{voice["voice"]}|{voice["speed"]}|{t}'.encode()).hexdigest()[:16]
            cpath = cache / f"{key}.wav"
            if cpath.exists():
                audio, sr = sf.read(cpath, dtype="float32")
            else:
                if engine is None:
                    engine = Kokoro()
                audio, sr = engine.say(t, voice["voice"], voice["speed"])
                sf.write(cpath, audio, sr)
            audio = trim(audio, sr, ncfg["trimThresholdDb"])
            if sr != SR:
                audio = resample_poly(audio, SR, sr).astype(np.float32)
            dur = len(audio) / SR
            sents.append({"i": i, "text": s, "start": round(cursor, 3), "end": round(cursor + dur, 3)})
            pieces.append(audio)
            cursor += dur
            gap = ncfg["sentenceGapSec"] if i < len(seg["sentences"]) - 1 else 0
            if gap:
                pieces.append(np.zeros(int(SR * gap), dtype=np.float32))
                cursor += gap
            print(f'  {seg["id"]}[{i}] {dur:5.2f}s  {s[:60]}')
        pieces.append(np.zeros(int(SR * ncfg["segmentTailSec"]), dtype=np.float32))
        cursor += ncfg["segmentTailSec"]
        segments_out.append({"id": seg["id"], "chapter": seg["chapter"], "start": round(seg_start, 3),
                             "end": round(cursor, 3), "sentences": sents})

    end_card = args.endcard if args.endcard is not None else ep.get("endCard", {}).get("seconds", 5)
    pieces.append(np.zeros(int(SR * end_card), dtype=np.float32))
    total = cursor + end_card
    narration = np.concatenate(pieces)
    # normalise narration peak to -3 dBFS; loudness is handled at master stage
    narration *= (10 ** (-3 / 20)) / max(1e-6, np.max(np.abs(narration)))

    out_audio = ROOT / "public" / "episodes" / args.episode / "audio"
    out_audio.mkdir(parents=True, exist_ok=True)
    sf.write(out_audio / f"narration{args.tag}.wav", narration, SR, subtype="PCM_16")

    build = ep_dir / "build"
    build.mkdir(exist_ok=True)
    timeline = {"episode": ep["id"], "durationSec": round(total, 3), "endCardSec": end_card,
                "endCardStart": round(cursor, 3), "segments": segments_out}
    (build / f"timeline{args.tag}.json").write_text(json.dumps(timeline, indent=1))

    # subtitles — each sentence split into 1–2 line cues, time shared by character
    # count; the same cues drive the burned-in captions and the .srt file
    cues, n = [], 1
    for seg in segments_out:
        seg["cues"] = []
        for s in seg["sentences"]:
            parts = chunk_sentence(s["text"], scfg["maxCharsPerLine"], scfg["maxLines"])
            total_chars = sum(len(p) for p in parts)
            t = s["start"]
            for p in parts:
                d = (s["end"] - s["start"]) * len(p) / total_chars
                seg["cues"].append({"start": round(t, 3), "end": round(t + d, 3), "text": p})
                cues.append(f"{n}\n{fmt_ts(t)} --> {fmt_ts(t + d)}\n{p}\n")
                n += 1
                t += d
    (build / f"timeline{args.tag}.json").write_text(json.dumps(timeline, indent=1))
    (build / f'{ep["slug"]}_English{args.tag}.srt').write_text("\n".join(cues))
    print(f"total {total:.2f}s  ({total/60:.2f} min), {n-1} subtitle cues")


if __name__ == "__main__":
    main()
