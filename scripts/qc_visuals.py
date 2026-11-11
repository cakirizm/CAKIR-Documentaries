#!/usr/bin/env python3
"""Visual-composition QC: how much of the runtime is real moving video,
real photography and graphics — per chapter and overall.

Counts what will actually render: a media shot whose asset is not approved
falls back to its graphic and is counted as graphics. Title cards drawn over
a photo count as graphics (they are not footage). The end card counts as
graphics.

Usage: python scripts/qc_visuals.py airport [--tag _sample] [--min-video 0.6]
Exit code 1 if the video share is below --min-video.
"""
import argparse, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEAD = 0.18


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--tag", default="")
    ap.add_argument("--min-video", type=float, default=0.6)
    ap.add_argument("--max-graphics", type=float, default=0.15)
    a = ap.parse_args()
    d = ROOT / "episodes" / a.episode
    ep = json.loads((d / "episode.json").read_text())
    tl = json.loads((d / "build" / f"timeline{a.tag}.json").read_text())
    assets = json.loads((d / "build" / "assets.resolved.json").read_text())
    segs = {s["id"]: s for s in ep["segments"]}
    reg = {x["id"]: x for x in json.loads((d / "assets.json").read_text())}
    freeze = []
    tot = {"video": 0.0, "photo": 0.0, "graphic": 0.0}
    missing = []
    print(f'{"chapter":14s} {"dur":>6s} {"video":>6s} {"photo":>6s} {"graph":>6s}')
    for si, ts in enumerate(tl["segments"]):
        seg = segs[ts["id"]]
        nxt = tl["segments"][si + 1]["start"] if si + 1 < len(tl["segments"]) else tl["endCardStart"]
        starts = [ts["start"] if (sh["from"] == 0 and not sh.get("offset")) else max(ts["start"], ts["sentences"][sh["from"]]["start"] - LEAD + sh.get("offset", 0)) for sh in seg["shots"]]
        if si == 0:
            starts[0] = 0.0
        acc = {"video": 0.0, "photo": 0.0, "graphic": 0.0}
        for i, sh in enumerate(seg["shots"]):
            end = starts[i + 1] if i + 1 < len(starts) else nxt
            dur = max(0.0, end - starts[i])
            if sh["type"] == "media" and sh["asset"] in assets:
                acc[assets[sh["asset"]]["kind"]] += dur
                r = reg[sh["asset"]]
                if r["kind"] == "video":
                    avail = r["clip"][1] / r.get("speed", 1) - sh.get("clipStart", 0)
                    if dur + 0.5 > avail:  # + transition overlap
                        freeze.append(f'{ts["id"]} shot {i} {sh["asset"]}: needs {dur + 0.5:.1f}s, clip has {avail:.1f}s')
            else:
                if sh["type"] == "media":
                    missing.append(sh["asset"])
                acc["graphic"] += dur
        seg_d = nxt - (0.0 if si == 0 else ts["start"])
        print(f'{ts["id"]:14s} {seg_d:6.1f} {acc["video"]/seg_d:6.0%} {acc["photo"]/seg_d:6.0%} {acc["graphic"]/seg_d:6.0%}')
        for k in tot:
            tot[k] += acc[k]
    tot["graphic"] += tl["endCardSec"]
    T = sum(tot.values())
    print(f'{"TOTAL":14s} {T:6.1f} {tot["video"]/T:6.0%} {tot["photo"]/T:6.0%} {tot["graphic"]/T:6.0%}   (end card counted as graphics)')
    if missing:
        print("media shots falling back to graphics (asset not approved):", sorted(set(missing)))
    for f in freeze:
        print("FROZEN-FRAME RISK:", f)
    ok = not freeze and tot["video"] / T >= a.min_video and tot["graphic"] / T <= a.max_graphics + 1e-9
    print("PASS" if ok else "FAIL", f'video {tot["video"]/T:.1%} (min {a.min_video:.0%}), graphics {tot["graphic"]/T:.1%} (max {a.max_graphics:.0%})')
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
