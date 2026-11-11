#!/usr/bin/env python3
"""Resolve the asset register into what the renderer may use.

Only assets with status "approved" AND a file on disk under public/ are
passed to Remotion; everything else falls back to the shot's graphic.
Also exports the register as CSV for the release package.
Usage: python scripts/resolve_assets.py airport
"""
import csv, json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
ep = sys.argv[1]
reg = json.loads((ROOT / "episodes" / ep / "assets.json").read_text())
out, used = {}, []
for a in reg:
    ok = a["status"] == "approved" and (ROOT / "public" / a["file"]).exists() and a.get("license") and a.get("credit")
    if ok:
        out[a["id"]] = {k: a[k] for k in ("id", "kind", "file", "credit")} | {k: a[k] for k in ("modern", "focus", "caption") if k in a}
        # brief on-screen caption only for genuine historical photographs
        out[a["id"]]["showCaption"] = a["kind"] == "photo" and not a.get("modern")
    used.append((a["id"], "USED" if ok else "NOT USED (" + a["status"] + ")"))
b = ROOT / "episodes" / ep / "build"; b.mkdir(exist_ok=True)
(b / "assets.resolved.json").write_text(json.dumps(out, indent=1))
for i, s in used: print(f"  {i:28s} {s}")
