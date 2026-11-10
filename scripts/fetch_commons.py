#!/usr/bin/env python3
"""Fetch Wikimedia Commons media listed in an episode's asset register.

For each entry with "commons": "File:..." and status "pending":
  * reads author / licence / date / description from the Commons API
  * refuses files whose licence is not on the free-licence allow-list
  * downloads the original (or a standard 1920px thumbnail if larger)
  * videos: downloads the 1080p transcode to media_raw/ and encodes the
    chosen "clip" [start, duration] to H.264 MP4 under public/
  * sets status "review" — a person checks the frames and sets "approved"

Usage: python scripts/fetch_commons.py airport [--reclip id]
"""
import json, re, subprocess, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / "lib"))
import commons

ROOT = Path(__file__).resolve().parent.parent
RAW = Path.home() / "media_raw"
FREE = re.compile(r"^(CC BY(-SA)? [1-4]\.\d.*|CC0|Public domain|PD.*|GFDL.*)$", re.I)


def encode_clip(raw, out, start, dur, crop=None):
    vf = (f"crop={crop}," if crop else "") + "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,format=yuv420p"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(start), "-i", str(raw), "-t", str(dur), "-an",
                    "-vf", vf, "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-movflags", "+faststart", str(out)], check=True)


def main():
    ep = sys.argv[1]
    reclip = sys.argv[3] if len(sys.argv) > 3 and sys.argv[2] == "--reclip" else None
    p = ROOT / "episodes" / ep / "assets.json"
    reg = json.loads(p.read_text())
    RAW.mkdir(exist_ok=True)
    for a in reg:
        if "commons" not in a:
            continue
        dest = ROOT / "public" / a["file"]
        dest.parent.mkdir(parents=True, exist_ok=True)
        if reclip:
            if a["id"] == reclip:
                encode_clip(RAW / (a["id"] + ".webm"), dest, *a["clip"], crop=a.get("crop")); print("reclipped", a["id"])
            continue
        if a["status"] != "pending":
            continue
        info = commons.fileinfo([a["commons"]], width=1920)[0]
        a.update(sourcePage=info["page"], originalUrl=info["url"].split("?")[0], author=info["artist"], authorCredit=info["credit"],
                 license=info["license"], licenseUrl=info["licenseUrl"], attributionRequired=info["attributionRequired"],
                 date=info["date"], description=info["description"], originalSize=f'{info["width"]}x{info["height"]}')
        if not FREE.match(a["license"] or "") or info["restrictions"]:
            a["status"] = "rejected"; a["notes"] += f' REJECTED: licence "{a["license"]}" restrictions "{info["restrictions"]}"'
            print("REJECT", a["id"], a["license"]); continue
        lic = a["license"]
        a["credit"] = f'{a["author"]} · {lic} · Wikimedia Commons'
        if a["kind"] == "photo":
            # Wikimedia only serves standard thumbnail widths without throttling
            std = [w for w in (3840, 1920, 1280, 960, 500, 330, 250) if w <= info["width"]]
            w = 1920 if info["width"] > 1920 else (std[0] if std else None)
            url = commons.fileinfo([a["commons"]], width=w)[0]["thumb"] if w and w != info["width"] else info["url"].split("?")[0]
            commons.download(url, dest)
            a["downloadedWidth"] = w or info["width"]
        else:
            r = commons.api(action="query", prop="videoinfo", viprop="derivatives", titles=a["commons"])
            ders = next(iter(r["query"]["pages"].values()))["videoinfo"][0]["derivatives"]
            best = max((d for d in ders if d["src"].endswith(".webm")), key=lambda d: d["height"])
            raw = RAW / (a["id"] + ".webm")
            if not raw.exists():
                commons.download(best["src"], raw)
            encode_clip(raw, dest, *a["clip"], crop=a.get("crop"))
        a["status"] = "review"
        print("ok", a["id"], "|", lic, "|", a["author"][:40])
        p.write_text(json.dumps(reg, indent=1, ensure_ascii=False))
        time.sleep(1.5)
    p.write_text(json.dumps(reg, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
