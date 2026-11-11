#!/usr/bin/env python3
"""Export the asset register to the release-package CSV."""
import csv, json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
ep = sys.argv[1]; slug = json.loads((ROOT/"episodes"/ep/"episode.json").read_text())["slug"]
reg = json.loads((ROOT/"episodes"/ep/"assets.json").read_text())
LEAD = 0.18
tl = json.loads((ROOT/"episodes"/ep/"build"/"timeline.json").read_text())
segs = {x["id"]: x for x in json.loads((ROOT/"episodes"/ep/"episode.json").read_text())["segments"]}
mmss = lambda t: f"{int(t//60)}:{int(t%60):02d}"
usage = {}
for si, ts in enumerate(tl["segments"]):
    seg = segs[ts["id"]]
    nxt = tl["segments"][si+1]["start"] if si+1 < len(tl["segments"]) else tl["endCardStart"]
    st = [ts["start"] if (sh["from"] == 0 and not sh.get("offset")) else max(ts["start"], ts["sentences"][sh["from"]]["start"] - LEAD + sh.get("offset", 0)) for sh in seg["shots"]]
    for i, sh in enumerate(seg["shots"]):
        aid = sh.get("asset") or sh.get("bg")
        if aid:
            usage.setdefault(aid, []).append(f'{seg["chapter"]} {mmss(st[i])}-{mmss(st[i+1] if i+1 < len(st) else nxt)}')
for a in reg:
    a["usedAt"] = "; ".join(usage.get(a["id"], [])) if a["status"] == "approved" else ""
    a["localFile"] = "public/" + a["file"]
cols = ["id","kind","status","commons","sourcePage","originalUrl","author","license","licenseUrl","attributionRequired","date","originalSize","file","usedAt","localFile","credit","caption","modern","notes"]
out = ROOT/"episodes"/ep/"build"/f"{slug}_Asset_Licenses.csv"
with open(out, "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore"); w.writeheader()
    for a in reg: w.writerow(a)
print(out)
