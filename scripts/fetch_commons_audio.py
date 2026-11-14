#!/usr/bin/env python3
"""Fetch free-licensed Commons media (photos via standard thumb, audio as original) for an asset register."""
import json, re, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / "lib"))
import commons
ROOT = Path(__file__).resolve().parent.parent
FREE = re.compile(r"^(CC BY(-SA)? [1-4]\.\d.*|CC0|Public domain|PD.*|GFDL.*)$", re.I)
p = ROOT / "episodes" / sys.argv[1] / "assets.json"
reg = json.loads(p.read_text())
for a in reg:
    if a["status"] != "pending": continue
    try:
        w = 2560 if a["kind"] == "photo" else None
        info = commons.fileinfo([a["commons"]], width=w)[0]
        a.update(sourcePage=info["page"], author=info["artist"], license=info["license"], licenseUrl=info["licenseUrl"], description=info["description"][:200])
        if not FREE.match(a["license"] or "") or info["restrictions"]:
            a["status"] = "rejected"; print("REJECT", a["id"], a["license"]); continue
        url = info["thumb"] if a["kind"] == "photo" and info["width"] > 2560 else info["url"].split("?")[0]
        dest = ROOT / "public" / a["file"]; dest.parent.mkdir(parents=True, exist_ok=True)
        commons.download(url, dest); a["status"] = "review"
        print("ok", a["id"], "|", a["license"], "|", (a["author"] or "")[:40], flush=True)
    except Exception as e:
        print("FAILED", a["id"], e)
    p.write_text(json.dumps(reg, indent=1, ensure_ascii=False)); time.sleep(5)
