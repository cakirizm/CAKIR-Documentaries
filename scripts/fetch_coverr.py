#!/usr/bin/env python3
"""Fetch Coverr stock clips listed in the asset register (source "coverr").
Re-verifies on download that each clip is NOT AI-generated and NOT premium
(per Coverr's own page data) before using it. Coverr licence: free for
commercial use, no attribution required (credited anyway).
Usage: python scripts/fetch_coverr.py airport"""
import json, subprocess, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / "lib")); sys.path.insert(0, str(Path(__file__).parent))
import coverr
from fetch_commons import encode_clip, RAW
ROOT = Path(__file__).resolve().parent.parent

ep = sys.argv[1]
p = ROOT / "episodes" / ep / "assets.json"
reg = json.loads(p.read_text())
for a in reg:
    if a.get("source") != "coverr" or a["status"] != "pending":
        continue
    try:
        f = coverr.flags(a["sourcePage"], a["sourcePage"].rsplit("/", 1)[1])
        if f is None or f[0] or f[1]:
            a["status"] = "rejected"; a["notes"] = f"rejected: AI/premium flags {f}"; print("REJECT", a["id"], f); continue
        raw = RAW / (a["id"] + ".mp4")
        if not raw.exists():
            raw.write_bytes(coverr.get(f'https://cdn.coverr.co/videos/{a["slug"]}/1080p.mp4'))
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout or 0)
        a["clip"] = [0, round(min(dur, a.get("clip", [0, 14])[1]), 2)]
        dest = ROOT / "public" / a["file"]; dest.parent.mkdir(parents=True, exist_ok=True)
        encode_clip(raw, dest, *a["clip"])
        a.update(author="Coverr", license="Coverr License (free, commercial use)", licenseUrl="https://coverr.co/license",
                 attributionRequired="false", credit="Coverr · Coverr License", originalUrl=f'https://cdn.coverr.co/videos/{a["slug"]}/1080p.mp4',
                 aiGenerated=False, premium=False, sourceDuration=round(dur, 2), status="review")
        print("ok", a["id"], round(dur, 1), "s", flush=True)
    except Exception as e:
        print("FAILED", a["id"], e)
    p.write_text(json.dumps(reg, indent=1, ensure_ascii=False))
    time.sleep(1)
p.write_text(json.dumps(reg, indent=1, ensure_ascii=False))
