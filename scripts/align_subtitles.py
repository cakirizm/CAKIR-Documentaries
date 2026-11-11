#!/usr/bin/env python3
"""Word-accurate subtitle timing. For every sentence, recognises the spoken
words (faster-whisper, local) and moves each cue's start/end to the actual
first/last spoken word it contains. Rewrites timeline.json cues and the SRT.
Usage: python scripts/align_subtitles.py airport
"""
import json, re, sys
from pathlib import Path

import numpy as np
import scipy.signal as ss
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent


def fmt_ts(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    ep_id = sys.argv[1]
    d = ROOT / "episodes" / ep_id
    ep = json.loads((d / "episode.json").read_text())
    tlp = d / "build" / "timeline.json"
    tl = json.loads(tlp.read_text())
    from faster_whisper import WhisperModel
    model = WhisperModel("small.en", device="cpu", compute_type="int8")
    audio, sr = sf.read(ROOT / "public/episodes" / ep_id / "audio/narration.wav", dtype="float32")
    moved = 0
    for seg in tl["segments"]:
        new = []
        cues = seg["cues"]
        for s in seg["sentences"]:
            sc = [c for c in cues if c["start"] >= s["start"] - 1e-3 and c["end"] <= s["end"] + 1e-3]
            if len(sc) <= 1:
                for c in sc:
                    new.append(dict(c, start=s["start"], end=s["end"]))
                continue
            t0 = s["start"] - 0.05
            clip = ss.resample_poly(audio[int(t0 * sr): int((s["end"] + 0.1) * sr)], 16000, sr).astype(np.float32)
            res, _ = model.transcribe(clip, language="en", word_timestamps=True, beam_size=5, condition_on_previous_text=False)
            words = [w for r in res for w in (r.words or [])]
            script_words = [len(c["text"].split()) for c in sc]
            total = sum(script_words)
            if not words:
                new += sc
                continue
            k = 0
            for ci, c in enumerate(sc):
                a = round(k / total * len(words)); k += script_words[ci]
                b = max(a + 1, round(k / total * len(words)))
                st = s["start"] if ci == 0 else t0 + words[min(a, len(words) - 1)].start
                en = s["end"] if ci == len(sc) - 1 else t0 + words[min(b, len(words)) - 1].end
                if abs(st - c["start"]) > 0.05 or abs(en - c["end"]) > 0.05:
                    moved += 1
                new.append(dict(c, start=round(st, 3), end=round(max(en, st + 0.6), 3)))
        seg["cues"] = new
    tlp.write_text(json.dumps(tl, indent=1))
    srt, n = [], 1
    for seg in tl["segments"]:
        for c in seg["cues"]:
            srt.append(f'{n}\n{fmt_ts(c["start"])} --> {fmt_ts(c["end"])}\n{c["text"]}\n'); n += 1
    (d / "build" / f'{ep["slug"]}_English.srt').write_text("\n".join(srt))
    print(f"{n-1} cues, {moved} cue boundaries moved to spoken-word times")


if __name__ == "__main__":
    main()
