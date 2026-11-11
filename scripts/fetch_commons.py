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


def encode_clip(raw, out, start, dur, crop=None, speed=1.0):
    """Cut [start, start+dur] from the source, optionally crop and speed up
    (timelapse), and normalise to 1920x1080 / 30 fps / H.264 without audio."""
    vf = (f"crop={crop}," if crop else "") + (f"setpts=PTS/{speed}," if speed != 1 else "") + \
        "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,format=yuv420p"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(start), "-t", str(dur), "-i", str(raw), "-an",
                    "-vf", vf, "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-movflags", "+faststart", str(out)], check=True)


def main():
    ep = sys.argv[1]
    reclip = sys.argv[3] if len(sys.argv) > 3 and sys.argv[2] == "--reclip" else None
    p = ROOT / "episodes" / ep / "assets.json"
    reg = json.loads(p.read_text())
    RAW.mkdir(exist_ok=True)
    for a in reg:
        if "commons" not in a and not a.get("raw"):
            continue
        dest = ROOT / "public" / a["file"]
        dest.parent.mkdir(parents=True, exist_ok=True)
        if reclip:
            if reclip in (a["id"], "all") and a["kind"] == "video" and a["status"] in ("review", "approved"):
                raw = RAW / (a.get("raw", a["id"]) + (".mp4" if a.get("source") == "coverr" else ".webm"))
                encode_clip(raw, dest, *a["clip"], crop=a.get("crop"), speed=a.get("speed", 1)); print("reclipped", a["id"], a["clip"])
            continue
        if a["status"] != "pending":
            continue
        if a.get("raw"):  # another cut of an already-downloaded source
            src = next(x for x in reg if x["id"] == a["raw"])
            if src["status"] in ("review", "approved"):
                for k in ("sourcePage", "originalUrl", "author", "authorCredit", "license", "licenseUrl", "attributionRequired", "date", "description", "originalSize", "credit", "commons"):
                    if k in src: a[k] = src[k]
                encode_clip(RAW / (a["raw"] + (".mp4" if a.get("source") == "coverr" else ".webm")), dest, *a["clip"], crop=a.get("crop"), speed=a.get("speed", 1))
                a["status"] = "review"; print("ok (cut)", a["id"])
            continue
        try:
            fetch_one(a, dest)
        except Exception as e:
            print("FAILED", a["id"], e); a["notes"] = (a.get("notes") or "") + f" fetch failed: {e}"
        p.write_text(json.dumps(reg, indent=1, ensure_ascii=False))
        time.sleep(6)
    p.write_text(json.dumps(reg, indent=1, ensure_ascii=False))


def fetch_one(a, dest):
    if True:
        info = commons.fileinfo([a["commons"]], width=1920)[0]
        a.update(sourcePage=info["page"], originalUrl=info["url"].split("?")[0], author=info["artist"], authorCredit=info["credit"],
                 license=info["license"], licenseUrl=info["licenseUrl"], attributionRequired=info["attributionRequired"],
                 date=info["date"], description=info["description"], originalSize=f'{info["width"]}x{info["height"]}')
        if not FREE.match(a["license"] or "") or info["restrictions"]:
            a["status"] = "rejected"; a["notes"] += f' REJECTED: licence "{a["license"]}" restrictions "{info["restrictions"]}"'
            print("REJECT", a["id"], a["license"]); return
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
            best = max((d for d in ders if d["src"].endswith(".webm") and d["height"] <= 1080), key=lambda d: d["height"])
            raw = RAW / (a["id"] + ".webm")
            if not raw.exists():
                commons.download(best["src"], raw)
            encode_clip(raw, dest, *a["clip"], crop=a.get("crop"))
        a["status"] = "review"
        print("ok", a["id"], "|", lic, "|", a["author"][:40], flush=True)


if __name__ == "__main__":
    main()
