#!/usr/bin/env python3
"""Export the narration script (with chapter timestamps) and YouTube chapter
list from the episode + timeline. Usage: python scripts/export_docs.py airport"""
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
ep_id = sys.argv[1]
d = ROOT / "episodes" / ep_id
ep = json.loads((d / "episode.json").read_text())
tl = json.loads((d / "build" / "timeline.json").read_text())
segs = {s["id"]: s for s in ep["segments"]}
mmss = lambda t: f"{int(t//60):02d}:{int(t%60):02d}"
lines = [ep["title"].upper(), f'A CAKIR documentary · Narration script · runtime {mmss(tl["durationSec"])}', "",
         "Narration: synthetic voice (Kokoro TTS, voice am_michael). Source references [S#] point to "
         f'{ep["slug"]}_Sources.md.', ""]
chapters = []
for i, ts in enumerate(tl["segments"]):
    s = segs[ts["id"]]
    t = 0 if i == 0 else ts["start"]
    chapters.append(f'{mmss(t)} {s["chapter"]}')
    lines += [f'[{mmss(t)}]  CHAPTER {i+1} — {s["chapter"].upper()}   sources: {", ".join(s.get("sources", []))}', ""]
    for sent in ts["sentences"]:
        lines.append(f'  {mmss(sent["start"])}  {sent["text"]}')
    lines.append("")
lines += [f'[{mmss(tl["endCardStart"])}]  END CARD — CAKIR', ""]
(d / "build" / f'{ep["slug"]}_Script.txt').write_text("\n".join(lines))
(d / "build" / "chapters.txt").write_text("\n".join(chapters))
print("\n".join(chapters))
