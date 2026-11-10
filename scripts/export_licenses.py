#!/usr/bin/env python3
"""Export the asset register to the release-package CSV."""
import csv, json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
ep = sys.argv[1]; slug = json.loads((ROOT/"episodes"/ep/"episode.json").read_text())["slug"]
reg = json.loads((ROOT/"episodes"/ep/"assets.json").read_text())
cols = ["id","kind","status","caption","commons","sourcePage","originalUrl","author","license","licenseUrl","attributionRequired","date","originalSize","file","scenes","modern","notes"]
out = ROOT/"episodes"/ep/"build"/f"{slug}_Asset_Licenses.csv"
with open(out, "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore"); w.writeheader()
    for a in reg: w.writerow(a)
print(out)
