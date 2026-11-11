#!/usr/bin/env python3
"""Final technical QC for a rendered episode. Writes out/<slug>_QC_Report.md.

Checks: container/codec/resolution/fps, full decode, loudness, frozen frames,
black frames, narration sync (cross-correlation with the narration stem),
real motion inside every video shot (frame difference), SRT ↔ timeline
consistency, and a contact sheet per chapter for visual inspection.
Usage: python scripts/qc_final.py airport out/CAKIR_Airport_FINAL.mp4
"""
import json, re, subprocess, sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
LEAD = 0.18


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def frame(mp4, t, w=96):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", mp4, "-frames:v", "1", "-vf", f"scale={w}:-2,format=gray",
                          "-f", "rawvideo", "-"], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.uint8).astype(np.float32)


def main():
    ep_id, mp4 = sys.argv[1], sys.argv[2]
    d = ROOT / "episodes" / ep_id
    ep = json.loads((d / "episode.json").read_text())
    tl = json.loads((d / "build" / "timeline.json").read_text())
    assets = json.loads((d / "build" / "assets.resolved.json").read_text())
    rep, fails = [f"# QC report — {Path(mp4).name}", ""], []

    pr = json.loads(run(["ffprobe", "-v", "error", "-show_entries", "format=duration,size,bit_rate:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels,pix_fmt",
                         "-of", "json", mp4]).stdout)
    v = next(s for s in pr["streams"] if s["codec_type"] == "video"); a = next(s for s in pr["streams"] if s["codec_type"] == "audio")
    dur = float(pr["format"]["duration"])
    rep += ["## Container", f"- Duration {dur:.2f}s ({int(dur//60)}:{dur%60:05.2f}); expected {tl['durationSec']:.2f}s",
            f"- Video {v['codec_name']} {v['width']}x{v['height']} {v['r_frame_rate']} {v['pix_fmt']}",
            f"- Audio {a['codec_name']} {a['sample_rate']} Hz, {a['channels']} ch",
            f"- Size {int(pr['format']['size'])/1e6:.1f} MB, {int(pr['format']['bit_rate'])/1e6:.2f} Mbit/s", ""]
    if not (v["codec_name"] == "h264" and v["width"] == 1920 and v["height"] == 1080 and v["r_frame_rate"] == "30/1" and a["codec_name"] == "aac"):
        fails.append("codec/resolution/fps mismatch")
    if abs(dur - tl["durationSec"]) > 0.2:
        fails.append("duration mismatch")

    dec = run(["ffmpeg", "-v", "error", "-i", mp4, "-f", "null", "-"])
    rep += ["## Decode", "- Full decode: " + ("OK" if not dec.stderr.strip() else "ERRORS: " + dec.stderr[:300]), ""]
    if dec.stderr.strip():
        fails.append("decode errors")

    lo = run(["ffmpeg", "-hide_banner", "-i", mp4, "-af", "ebur128=framelog=quiet:peak=true", "-f", "null", "-"]).stderr
    I = float(re.search(r"I:\s+(-?[\d.]+) LUFS", lo).group(1)); LRA = float(re.search(r"LRA:\s+([\d.]+) LU", lo).group(1))
    TP = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", lo).group(1))
    rep += ["## Loudness", f"- Integrated {I} LUFS (target -14), LRA {LRA} LU, true peak {TP} dBTP", ""]
    if abs(I + 14) > 1 or TP > -1.0:
        fails.append("loudness out of range")

    fz = run(["ffmpeg", "-i", mp4, "-vf", "freezedetect=n=0.003:d=2", "-map", "0:v", "-f", "null", "-"]).stderr
    freezes = re.findall(r"freeze_start: ([\d.]+).*?freeze_duration: ([\d.]+)", fz, re.S)
    bl = run(["ffmpeg", "-i", mp4, "-vf", "blackdetect=d=0.5:pix_th=0.06", "-an", "-f", "null", "-"]).stderr
    blacks = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", bl)
    rep += ["## Frozen / black frames", f"- Freezes ≥2s: {len(freezes)} " + str([(float(s), float(x)) for s, x in freezes]),
            f"- Black ≥0.5s: {len(blacks)} " + str(blacks), ""]

    # sync: correlate the mix with the narration stem
    def pcm(src, t0, t1):
        raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t0), "-t", str(t1 - t0), "-i", src, "-ac", "1", "-ar", "8000", "-f", "f32le", "-"], capture_output=True).stdout
        return np.frombuffer(raw, dtype=np.float32)
    lags = []
    for t0 in (30, dur / 2, dur - 60):
        x = pcm(mp4, t0, t0 + 20); y = pcm(str(ROOT / "public/episodes" / ep_id / "audio/narration.wav"), t0 + 2, t0 + 12)
        c = np.correlate(x, y, "valid"); lags.append((np.argmax(c) / 8000 - 2) * 1000)
    rep += ["## Audio/video sync", f"- Narration offset in the final file at 3 points: {', '.join(f'{l:+.0f} ms' for l in lags)} (AAC priming ≈ +20–45 ms)", ""]
    if max(abs(l) for l in lags) > 120:
        fails.append("sync offset > 120 ms")

    # motion inside each video shot + contact sheets per chapter
    segs = {s["id"]: s for s in ep["segments"]}
    rows, static = [], []
    sheets = ROOT / "out" / "qc_frames"; sheets.mkdir(exist_ok=True)
    for si, ts in enumerate(tl["segments"]):
        seg = segs[ts["id"]]
        nxt = tl["segments"][si + 1]["start"] if si + 1 < len(tl["segments"]) else tl["endCardStart"]
        st = [0.0 if (si == 0 and i == 0) else (ts["start"] if sh["from"] == 0 and not sh.get("offset") else max(ts["start"], ts["sentences"][sh["from"]]["start"] - LEAD + sh.get("offset", 0)))
              for i, sh in enumerate(seg["shots"])]
        mids = []
        for i, sh in enumerate(seg["shots"]):
            s0, s1 = st[i], (st[i + 1] if i + 1 < len(st) else nxt)
            mid = (s0 + s1) / 2; mids.append(mid)
            if sh["type"] == "media" and sh["asset"] in assets and assets[sh["asset"]]["kind"] == "video":
                f1, f2 = frame(mp4, s0 + 0.6), frame(mp4, max(s0 + 0.7, s1 - 0.6))
                diff = float(np.mean(np.abs(f1 - f2)))
                rows.append((ts["id"], i, sh["asset"], s0, s1, diff))
                if diff < 1.0:
                    static.append(f'{ts["id"]} shot {i} {sh["asset"]} ({s0:.1f}-{s1:.1f}s) diff {diff:.2f}')
        ins = []
        for k, m in enumerate(mids[:8]):
            out = sheets / f'{ts["id"]}_{k}.jpg'
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{m:.2f}", "-i", mp4, "-frames:v", "1", "-vf", "scale=480:-2", str(out)])
            ins += ["-i", str(out)]
        n = len(ins) // 2
        subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", "".join(f"[{k}]" for k in range(n)) + f"hstack={n}" if n > 1 else "null",
                        str(sheets / f'sheet_{si+1:02d}_{ts["id"]}.jpg')])
    rep += ["## Real moving footage", f"- Video shots checked: {len(rows)}; mean frame difference between shot start and end (0–255 scale):"]
    rep += [f"  - {r[0]} #{r[1]} `{r[2]}` {r[3]:.1f}–{r[4]:.1f}s: {r[5]:.1f}" for r in rows]
    rep += ["- Shots without visible motion: " + (", ".join(static) if static else "none"), ""]

    srt = (d / "build" / f'{ep["slug"]}_English.srt').read_text()
    n_srt = len(re.findall(r"^\d+$", srt, re.M))
    n_cues = sum(len(s.get("cues", [])) for s in tl["segments"])
    last = re.findall(r"--> (\d\d):(\d\d):(\d\d),(\d\d\d)", srt)[-1]
    last_t = int(last[0]) * 3600 + int(last[1]) * 60 + int(last[2]) + int(last[3]) / 1000
    rep += ["## Subtitles", f"- SRT cues {n_srt}; burned-in cues {n_cues} (same source); last cue ends {last_t:.1f}s of {dur:.1f}s", ""]
    if n_srt != n_cues or last_t > dur:
        fails.append("subtitle mismatch")

    rep += ["## Result", "PASS" if not fails else "FAIL: " + "; ".join(fails)]
    out = ROOT / "out" / f'{ep["slug"]}_QC_Report.md'
    out.write_text("\n".join(rep))
    print("\n".join(rep[:30])); print("..."); print(rep[-1])


if __name__ == "__main__":
    main()
