#!/usr/bin/env python3
"""TEK BİR BANKNOT — build audio + timeline for one episode spec.
Usage: python scripts/build_banknot_ep.py 2   (reads episodes/banknot/ep2.json)"""
import json, sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).parent))
import build_banknot_audio as B  # noqa: E402  (tts cache, sfx generators, music loader)

ROOT = B.ROOT
SR = B.SR
B.VOICES["Q"] = ("JBFqnCBsd6RMkjVDRZzb", 0.5)   # second male voice for quoted people (dramatised)
rng = np.random.default_rng(11)


def tone(f, d, decay):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * decay)


def sfx(name):
    n = lambda d: int(d * SR)
    if name == "boom": return B.sfx_boom()
    if name == "paper": return B.sfx_paper(0.6)
    if name == "whoosh": return B.sfx_whoosh(0.8)
    if name == "coins": return B.sfx_coins(1.6)
    if name == "siren": return B.sfx_siren(3.4)
    if name == "static": return B.sfx_static(0.6)
    if name == "heartbeat": return B.sfx_heartbeat(4.0)
    if name == "casino": return B.sfx_casino(5.0)
    if name == "ding": return B.sfx_ding()
    if name == "stamp":
        x = B.bandnoise(n(0.25), 80, 1200) * np.exp(-np.arange(n(0.25)) / SR * 30)
        return x + 0.8 * tone(70, 0.25, 14)
    if name == "gavel":
        x = np.zeros(n(1.2))
        for s in (0, 0.38):
            k = tone(180, 0.3, 30) + B.bandnoise(n(0.3), 200, 3000) * np.exp(-np.arange(n(0.3)) / SR * 50) * 0.6
            i = n(s); x[i:i + len(k)] += k
        return x
    if name == "typing":
        x = np.zeros(n(3.0))
        tt = 0.0
        while tt < 2.8:
            k = B.bandnoise(n(0.03), 1500, 7000) * np.exp(-np.arange(n(0.03)) / SR * 160)
            i = n(tt); x[i:i + len(k)] += k * (0.5 + rng.random() * 0.5)
            tt += 0.06 + rng.random() * 0.12
        return x
    if name == "riser":
        d = 2.4; t = np.arange(n(d)) / SR
        f = 120 + 900 * (t / d) ** 2
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + B.bandnoise(n(d), 500, 6000) * 0.6) * (t / d) ** 2
    if name == "glitch":
        x = np.zeros(n(0.9))
        for _ in range(9):
            i = int(rng.random() * n(0.8)); m = n(0.02 + rng.random() * 0.06)
            x[i:i + m] += np.sign(np.sin(2 * np.pi * (200 + rng.random() * 2000) * np.arange(m) / SR)) * 0.6
        return x
    if name == "clock":
        x = np.zeros(n(3.0))
        for s in np.arange(0, 2.9, 0.5): i = n(s); k = tone(2400, 0.05, 90); x[i:i + len(k)] += k
        return x
    if name == "ticks":
        x = np.zeros(n(1.6))
        for s in np.arange(0, 1.5, 0.045): i = n(s); k = tone(3000, 0.02, 200); x[i:i + len(k)] += k * 0.6
        return x
    if name == "phone":
        t = np.arange(n(2.4)) / SR
        ring = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * ((t % 1.2) < 0.8)
        return ring * 0.5
    if name == "beep":
        x = np.zeros(n(2.4))
        for s in (0, 0.8, 1.6): i = n(s); k = tone(1000, 0.25, 6); x[i:i + len(k)] += k
        return x
    if name == "flatline":
        t = np.arange(n(2.6)) / SR
        return np.sin(2 * np.pi * 1000 * t) * np.minimum(1, (2.6 - t) * 2) * 0.5
    if name == "lock":
        return np.r_[tone(900, 0.06, 80), np.zeros(n(0.05)), tone(600, 0.12, 40)]
    if name == "vaultdoor":
        d = 2.2; t = np.arange(n(d)) / SR
        return B.bandnoise(n(d), 60, 600) * np.minimum(1, t * 3) * np.exp(-t * 0.8) + 0.5 * tone(55, d, 1.2)
    if name == "wind":
        d = 4.0; return B.bandnoise(n(d), 200, 1400) * (0.6 + 0.4 * np.sin(np.linspace(0, 6, n(d)))) * B.env(n(d), 0.8, 1.2)
    if name in ("gulls",):
        x = np.zeros(n(3.0))
        for s in (0.1, 1.1, 1.9):
            d = 0.45; t = np.arange(n(d)) / SR; f = 1900 - 900 * t / d
            k = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d); i = n(s); x[i:i + len(k)] += k * 0.5
        return x
    if name == "trashbag": return B.bandnoise(n(1.0), 300, 5000) * B.env(n(1.0), 0.05, 0.4) * (0.5 + 0.5 * np.abs(np.sin(np.linspace(0, 40, n(1.0)))))
    if name == "truck": return B.bandnoise(n(3.5), 40, 400) * B.env(n(3.5), 0.8, 1.2) + 0.3 * tone(48, 3.5, 0.3)
    if name == "jet":
        d = 4.0; t = np.arange(n(d)) / SR
        return B.bandnoise(n(d), 300, 6000) * np.sin(np.pi * t / d) ** 2
    if name == "crowd":
        d = 4.0; x = B.bandnoise(n(d), 300, 3000) * 0.6
        for _ in range(60):
            i = int(rng.random() * n(d - 0.1)); k = B.bandnoise(n(0.05), 1000, 6000) * np.exp(-np.arange(n(0.05)) / SR * 60); x[i:i + len(k)] += k
        return x * B.env(n(d), 0.6, 1.0)
    if name == "alarm":
        t = np.arange(n(3.0)) / SR
        return np.sign(np.sin(2 * np.pi * 880 * t)) * ((t % 0.5) < 0.25) * 0.35
    raise KeyError(name)


def main():
    ep = int(sys.argv[1])
    spec = json.loads((ROOT / f"episodes/banknot/ep{ep}.json").read_text())
    out = ROOT / f"public/episodes/banknot/audio/ep{ep}"; out.mkdir(parents=True, exist_ok=True)
    build = ROOT / "episodes/banknot/build"; build.mkdir(parents=True, exist_ok=True)
    clips = []
    for scene, role, text, sub, gap in spec["lines"]:
        x = B.tts(role, text)
        x = B.norm_rms(x, -20 if role != "A" else -21)
        if role == "A": x = B.radio(x)
        clips.append(x)
    t = 0.6; lines = []
    for (scene, role, text, sub, gap), c in zip(spec["lines"], clips):
        d = len(c) / SR
        lines.append({"scene": scene, "role": role, "start": round(t, 3), "end": round(t + d, 3), "sub": sub})
        t += d + gap
    total = t + 0.4; n = int(total * SR)
    voice = np.zeros(n, np.float32)
    for l, c in zip(lines, clips):
        a = int(l["start"] * SR); voice[a:a + len(c)] += c[: n - a]
    scenes = []
    for l in lines:
        if not scenes or scenes[-1]["id"] != l["scene"]:
            scenes.append({"id": l["scene"], "start": round(l["start"] - (0.6 if not scenes else 0.25), 3)})
    scenes[0]["start"] = 0
    for i, s in enumerate(scenes):
        s["end"] = scenes[i + 1]["start"] if i + 1 < len(scenes) else round(total, 3)
    S = {s["id"]: s["start"] for s in scenes}
    fx = np.zeros(n)
    for sid, off, name, db in spec["sfx"]:
        x = B.norm_rms(np.asarray(sfx(name), float), db)
        a = int(max(0, S[sid] + off) * SR); m = min(len(x), n - a); fx[a:a + m] += x[:m]
    # music: segments switching at scene ids, crossfaded
    segs = spec["music"]; mus = np.zeros(n)
    tt = np.arange(n) / SR
    for i, (track, sid) in enumerate(segs):
        a = S[sid]; b = S[segs[i + 1][1]] if i + 1 < len(segs) else total + 2
        m = B.music(track, n)
        g = np.clip((tt - a + 0.6) / 1.2, 0, 1) * np.clip((b + 0.6 - tt) / 1.2, 0, 1)
        mus += m * g
    mus = B.norm_rms(mus, -20)
    e = np.abs(voice); w = int(0.25 * SR); cs = np.cumsum(np.r_[0, e]); ev = (cs[w:] - cs[:-w]) / w; ev = np.r_[ev, np.zeros(n - len(ev))]
    g = np.where(ev > 0.004, 10 ** (-12 / 20), 10 ** (-4 / 20))
    k = int(0.35 * SR); cs = np.cumsum(np.r_[0, g]); gs = (cs[k:] - cs[:-k]) / k; g = np.r_[gs, np.full(n - len(gs), gs[-1])]
    for l in lines:  # quotes: music almost out
        if l["role"] != "N":
            g[(tt > l["start"] - 0.4) & (tt < l["end"] + 0.4)] *= 0.35
    fade = np.clip(tt / 0.8, 0, 1) * np.clip((total - tt) / 1.5, 0, 1)
    mus = (mus * g * fade).astype(np.float32)
    mix = voice + mus + fx.astype(np.float32)
    import pyloudnorm as pyln
    lo = pyln.Meter(SR).integrated_loudness(mix); mix = mix * 10 ** ((-14 - lo) / 20)
    mix = np.tanh(mix * 1.2) / 1.2
    for name, arr in (("voice", voice), ("music", mus), ("sfx", fx), ("mix", mix)):
        sf.write(out / f"{name}.wav", arr.astype(np.float32), SR)
    (build / f"ep{ep}_timeline.json").write_text(json.dumps({"durationSec": round(total, 3), "scenes": scenes, "lines": lines}, ensure_ascii=False, indent=1))
    srt = [f"{i}\n{B.fmt(l['start'])} --> {B.fmt(l['end'])}\n{l['sub']}\n" for i, l in enumerate([l for l in lines if l['sub']], 1)]
    (build / f"Tek_Bir_Banknot_B{ep}.srt").write_text("\n".join(srt))
    print(f"ep{ep} total {total:.1f}s scenes {len(scenes)}")


if __name__ == "__main__":
    main()
