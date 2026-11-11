#!/usr/bin/env python3
"""Narration QC with speech recognition (faster-whisper, local).

1. Transcribes every sentence clip and compares it with the script
   (catches skipped, repeated or hallucinated words from the TTS engine).
2. Checks subtitle timing against recognised word timings: a cue must not
   start before its first word is spoken or end before its last word.
3. Reports long internal silences inside sentences.
Usage: python scripts/qc_narration.py airport
"""
import difflib, json, re, sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent


def norm(s):
    s = s.lower().replace("’", "'")
    s = re.sub(r"[^a-z0-9' ]+", " ", s)
    return s.split()


def main():
    ep_id = sys.argv[1]
    d = ROOT / "episodes" / ep_id
    ep = json.loads((d / "episode.json").read_text())
    tl = json.loads((d / "build" / "timeline.json").read_text())
    rep = ep.get("ttsReplacements", {})
    from faster_whisper import WhisperModel
    model = WhisperModel("small.en", device="cpu", compute_type="int8")
    audio, sr = sf.read(ROOT / "public/episodes" / ep_id / "audio/narration.wav", dtype="float32")
    segs = {s["id"]: s for s in ep["segments"]}
    issues, scores, lines = [], [], []
    for ts in tl["segments"]:
        for s in ts["sentences"]:
            spoken = s["text"]
            for k in sorted(rep, key=len, reverse=True):
                spoken = spoken.replace(k, rep[k])
            clip = audio[int((s["start"] - 0.05) * sr): int((s["end"] + 0.1) * sr)]
            import scipy.signal as ss
            clip16 = ss.resample_poly(clip, 16000, sr).astype(np.float32)
            res, _ = model.transcribe(clip16, language="en", word_timestamps=True, beam_size=5, condition_on_previous_text=False)
            words = [w for r in res for w in (r.words or [])]
            hyp = " ".join(w.word for w in words)
            a, b = norm(spoken), norm(hyp)
            ratio = difflib.SequenceMatcher(None, a, b).ratio()
            scores.append(ratio)
            # internal silences
            env = np.convolve(np.abs(clip), np.ones(int(sr * 0.02)) / (sr * 0.02), mode="same")
            quiet = env < 10 ** (-45 / 20)
            longest, run = 0, 0
            for q in quiet[int(sr * 0.1): -int(sr * 0.1)]:
                run = run + 1 if q else 0
                longest = max(longest, run)
            gap = longest / sr
            flag = []
            if ratio < 0.85:
                flag.append(f"text match {ratio:.2f}")
            if gap > 0.9:
                flag.append(f"internal silence {gap:.2f}s")
            if words:
                first = s["start"] - 0.05 + words[0].start
                last = s["start"] - 0.05 + words[-1].end
                if first < s["start"] - 0.25 or last > s["end"] + 0.25:
                    flag.append(f"speech outside cue ({first:.2f}-{last:.2f} vs {s['start']:.2f}-{s['end']:.2f})")
            line = f'{ts["id"]}[{s["i"]}] {ratio:.2f}  "{hyp.strip()[:70]}"'
            lines.append(line)
            if flag:
                issues.append(line + "  <-- " + "; ".join(flag))
    out = ROOT / "out" / f"{ep['slug']}_Narration_QC.md"
    out.write_text("# Narration QC (speech recognition)\n\n" + f"Mean text match {np.mean(scores):.3f}, min {np.min(scores):.2f}\n\n## Issues\n" +
                   ("\n".join(issues) if issues else "none") + "\n\n## All sentences\n" + "\n".join(lines))
    print(f"sentences {len(scores)}, mean match {np.mean(scores):.3f}, min {np.min(scores):.2f}, issues {len(issues)}")
    for i in issues:
        print(i)


if __name__ == "__main__":
    main()
