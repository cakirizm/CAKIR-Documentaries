#!/usr/bin/env python3
"""ÇAKIR RADYO TİYATROSU — episode mixer.
Places every line, pause, effect and ambience from episodes/radyo_yusuf/epXX_script.py on a stereo
timeline with per-character panning, distance, room acoustics; adds fixed intro/outro music; masters to -14 LUFS.
Usage: python scripts/radyo_mix.py ep01_script"""
import importlib, json, re, subprocess, sys
from pathlib import Path

import numpy as np
import scipy.signal as ss
import soundfile as sf

sys.path.insert(0, str(Path(__file__).parent))
import radyo_tts as R  # noqa: E402

ROOT = R.ROOT
SR = 48000
PUB = ROOT / "public/episodes/radyo_yusuf"
rng = np.random.default_rng(7)


def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(np.square(x))) + 1e-12
def norm(x, d): return x * (db(d) / rms(x))


def norm_active(x, d):
    w = int(0.05 * SR)
    e = np.sqrt(np.convolve(np.square(x), np.ones(w) / w, "same"))
    act = x[e > 0.1 * e.max()] if e.max() > 0 else x
    return x * (db(d) / rms(act))
def sos(kind, f): return ss.butter(2, f, kind, fs=SR, output="sos")
def bp(x, lo, hi): return ss.sosfilt(ss.butter(2, [lo, hi], "band", fs=SR, output="sos"), x)


def load(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(pcm, np.float32).astype(np.float64)


def env(n, a, r):
    e = np.ones(n); ai, ri = max(1, int(a * SR)), max(1, int(r * SR))
    e[:ai] = np.linspace(0, 1, ai); e[-ri:] *= np.linspace(1, 0, ri)
    return e


SRC = {}
def src(name):
    if name not in SRC:
        f = next(PUB.glob(f"sfx_src/{name}.*"), None)
        SRC[name] = load(f) if f else None
    return SRC[name]


# ---------------- synthesised + recorded effects ----------------

def noise(n): return rng.standard_normal(n)


def wind(d, level=1.0, bright=900):
    n = int(d * SR); x = noise(n)
    mod = 0.55 + 0.45 * np.sin(2 * np.pi * np.cumsum(0.05 + 0.04 * np.sin(np.linspace(0, 9, n))) / SR + 1.3)
    y = bp(x, 120, bright) * mod
    return y * level


def crickets_bed(d):
    s = src("crickets")
    if s is not None and len(s) > SR:
        s = ss.sosfilt(sos("high", 2500), s)
        return loop(s, d)
    n = int(d * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for k in range(3):
        f = 4200 + 300 * k; rate = 2.1 + 0.4 * k
        gate = (np.sin(2 * np.pi * rate * t + k) > 0.6) * (np.sin(2 * np.pi * 30 * t) > 0)
        x += np.sin(2 * np.pi * f * t) * gate * (0.4 + 0.2 * k)
    return ss.sosfilt(sos("low", 7000), x)


def loop(s, d, xf=1.0):
    n = int(d * SR); out = np.zeros(n); pos = 0; f = int(xf * SR)
    s = s[int(0.2 * SR): -int(0.2 * SR)] if len(s) > 2 * SR else s
    while pos < n:
        start = int(rng.uniform(0, max(1, len(s) // 3)))
        seg = s[start:].copy()
        if len(seg) > 2 * f:
            seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        m = min(len(seg), n - pos); out[pos:pos + m] += seg[:m]
        pos += max(len(seg) - f, SR)
    return out


def sporadic(clips, d, every=(4, 9), gain_jitter=4):
    n = int(d * SR); out = np.zeros(n); t = rng.uniform(0.5, every[0])
    while t < d:
        c = clips[rng.integers(len(clips))]
        a = int(t * SR); m = min(len(c), n - a)
        out[a:a + m] += c[:m] * db(rng.uniform(-gain_jitter, 0))
        t += rng.uniform(*every)
    return out


def chunks(s, k=6, dur=(0.6, 1.8)):
    if s is None or len(s) < SR: return [np.zeros(10)]
    out = []
    e = np.abs(s); w = int(0.05 * SR); e = np.convolve(e, np.ones(w) / w, "same")
    loud = np.where(e > np.percentile(e, 85))[0]
    for _ in range(k):
        c = int(rng.choice(loud)); L = int(rng.uniform(*dur) * SR)
        a = max(0, c - L // 3); seg = s[a:a + L].copy(); seg *= env(len(seg), 0.05, 0.25); out.append(seg)
    return out


def fire(d):
    n = int(d * SR); x = bp(noise(n), 200, 2500) * 0.15
    t = 0.0
    while t < d:
        a = int(t * SR); L = int(rng.uniform(0.004, 0.02) * SR)
        if a + L < n: x[a:a + L] += bp(noise(L), 1500, 8000) * np.exp(-np.arange(L) / L * 5) * rng.uniform(0.5, 2.5)
        t += rng.exponential(0.12)
    return x


def fabric(d=0.9):
    n = int(d * SR); x = bp(noise(n), 1800, 9000)
    am = np.abs(ss.sosfilt(sos("low", 18), noise(n))); am /= am.max() + 1e-9
    return x * am * env(n, 0.08, 0.3)


def breath(d=1.2, lo=300, hi=1800):
    n = int(d * SR); x = bp(noise(n), lo, hi)
    e = np.sin(np.linspace(0, np.pi, n)) ** 2
    return x * e


def footstep(var=0, surface="dirt"):
    s = src("footstep")
    if s is not None and len(s) > 0.2 * SR:
        e = np.abs(s); on = np.where(e > 0.25 * e.max())[0]
        a = on[0] if len(on) else 0
        st = s[max(0, a - 200): a + int(0.35 * SR)].copy()
        st = ss.resample(st, int(len(st) * (1 + 0.06 * (var % 5 - 2))))
    else:
        L = int(0.25 * SR); st = bp(noise(L), 300, 5000) * np.exp(-np.arange(L) / SR * 25)
        st += np.sin(2 * np.pi * 90 * np.arange(L) / SR) * np.exp(-np.arange(L) / SR * 40) * 0.6
    if surface == "floor": st = ss.sosfilt(sos("low", 2500), st) + 0.5 * np.sin(2 * np.pi * 120 * np.arange(len(st)) / SR) * np.exp(-np.arange(len(st)) / SR * 30)
    if surface == "stone": st = ss.sosfilt(sos("high", 600), st)
    return st * db(rng.uniform(-3, 0))


def steps(count, interval, surface="dirt", accel=1.0, fade=None):
    total = count * interval + 0.6
    x = np.zeros(int(total * SR)); t = 0.05
    for i in range(count):
        s = footstep(i, surface); a = int(t * SR); m = min(len(s), len(x) - a); x[a:a + m] += s[:m]
        t += interval * (accel ** i) * rng.uniform(0.92, 1.08)
    if fade == "out": x *= np.linspace(1, 0.05, len(x))
    if fade == "in": x *= np.linspace(0.15, 1, len(x))
    return x


def door(kind="open"):
    s = src("door")
    if s is not None and len(s) > 0.3 * SR:
        e = np.abs(s); on = np.where(e > 0.1 * e.max())[0]
        seg = s[on[0]: on[0] + int(1.6 * SR)].copy() if len(on) else s[:int(1.6 * SR)].copy()
        seg *= env(len(seg), 0.01, 0.4)
    else:
        L = int(1.2 * SR); t = np.arange(L) / SR
        seg = np.sin(2 * np.pi * (300 + 120 * np.sin(2 * np.pi * 3 * t)) * t) * bp(noise(L), 200, 3000) * 0.5 * env(L, 0.1, 0.4)
    if kind == "close":
        L = int(0.5 * SR); thud = bp(noise(L), 60, 800) * np.exp(-np.arange(L) / SR * 18) + np.sin(2 * np.pi * 85 * np.arange(L) / SR) * np.exp(-np.arange(L) / SR * 14)
        seg = np.r_[seg[: int(0.7 * SR)] * 0.6, thud * 1.5]
    return seg


def knock():
    x = np.zeros(int(1.4 * SR))
    for t in (0.0, 0.32, 0.6):
        L = int(0.12 * SR); k = bp(noise(L), 150, 2500) * np.exp(-np.arange(L) / SR * 60) + 0.8 * np.sin(2 * np.pi * 190 * np.arange(L) / SR) * np.exp(-np.arange(L) / SR * 45)
        a = int(t * SR); x[a:a + L] += k
    return x


def stone_click():
    x = np.zeros(int(0.6 * SR))
    for t in (0.0, 0.14):
        L = int(0.03 * SR); a = int(t * SR); x[a:a + L] += bp(noise(L), 2500, 9000) * np.exp(-np.arange(L) / L * 6)
    return x


def owl():
    L = int(1.4 * SR); t = np.arange(L) / SR; x = np.zeros(L)
    for st, du in ((0.0, 0.35), (0.55, 0.6)):
        a, b = int(st * SR), int((st + du) * SR); tt = np.arange(b - a) / SR
        x[a:b] += np.sin(2 * np.pi * (390 - 30 * tt / du) * tt) * np.sin(np.linspace(0, np.pi, b - a)) ** 2
    return ss.sosfilt(sos("low", 1200), x) * 0.6


def gust(d=3.0): return wind(d, 1.0, 1400) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2


def rope():
    x = np.zeros(int(1.8 * SR)); t = 0.0
    while t < 1.6:
        L = int(rng.uniform(0.08, 0.2) * SR); a = int(t * SR); tt = np.arange(L) / SR
        f = rng.uniform(220, 420)
        x[a:a + L] += np.sin(2 * np.pi * f * tt + 3 * np.sin(2 * np.pi * 40 * tt)) * bp(noise(L), 200, 2500) * np.sin(np.linspace(0, np.pi, L)) * 0.8
        t += rng.uniform(0.15, 0.35)
    return x + 0.3 * fabric(1.8)[: len(x)]


def splash():
    L = int(0.9 * SR); t = np.arange(L) / SR
    return bp(noise(L), 400, 6000) * np.exp(-t * 7) + 0.4 * np.sin(2 * np.pi * (300 + 600 * np.exp(-t * 20)) * t) * np.exp(-t * 12)


def drips(d):
    n = int(d * SR); x = np.zeros(n); t = rng.uniform(0.3, 1.5)
    while t < d:
        L = int(0.12 * SR); a = int(t * SR); tt = np.arange(L) / SR; f = rng.uniform(900, 1600)
        if a + L < n: x[a:a + L] += np.sin(2 * np.pi * f * (1 + 0.6 * tt) * tt) * np.exp(-tt * 45)
        t += rng.uniform(1.2, 3.5)
    return x


def camel_bells(d=6.0):
    n = int(d * SR); x = np.zeros(n); t = 0.2
    while t < d - 1.4:
        L = int(1.2 * SR); a = int(t * SR); tt = np.arange(L) / SR; f = rng.choice([620, 740, 830])
        x[a:a + L] += (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 2.76 * tt)) * np.exp(-tt * 4) * rng.uniform(0.5, 1)
        t += rng.uniform(0.45, 0.8)
    return x * env(n, 1.5, 2.0)


def camel_groan():
    L = int(1.3 * SR); t = np.arange(L) / SR
    f = 90 + 40 * np.sin(np.pi * t / 1.3)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * bp(noise(L), 80, 900) * 0.4 + 0.3 * bp(noise(L), 100, 600)
    return ss.sosfilt(sos("low", 700), x) * np.sin(np.linspace(0, np.pi, L)) ** 1.5


def fit(x, n):
    return x[:n] if len(x) >= n else np.r_[x, np.zeros(n - len(x))]


def caravan_bed(d):
    n = int(d * SR)
    return fit(camel_bells(d), n) * 0.6 + fit(ss.sosfilt(sos("low", 900), sporadic([camel_groan() for _ in range(3)], d, (6, 12))), n) + fit(steps(max(1, int(d / 0.9)), 0.9, "dirt"), n) * 0.25


def fire_pop():
    return np.r_[fire(1.5)]


def coins():
    x = np.zeros(int(1.6 * SR))
    for _ in range(18):
        a = int(rng.uniform(0, 1.3) * SR); L = int(0.12 * SR); t = np.arange(L) / SR; f = rng.uniform(2500, 6000)
        x[a:a + L] += np.sin(2 * np.pi * f * t) * np.exp(-t * 40) * rng.uniform(0.3, 1)
    return x


def goat_single():
    c = chunks(src("goats"), 1, (0.8, 1.3))
    return c[0]


FX = {
    "fabric": lambda: fabric(0.9), "sit_fabric": lambda: np.r_[fabric(0.7), fabric(0.5) * 0.6],
    "breaths_wake": lambda: np.r_[breath(0.5, 400, 2200), np.zeros(int(0.15 * SR)), breath(0.6, 400, 2200), np.zeros(int(0.1 * SR)), breath(0.5, 400, 2200)],
    "breath_soft": lambda: breath(1.4), "breath_slow": lambda: np.r_[breath(1.3), breath(1.6, 250, 1400) * 0.8],
    "bed_step": lambda: np.r_[fabric(0.7), np.zeros(int(0.2 * SR)), steps(2, 0.55, "floor")],
    "steps_slow": lambda: steps(5, 0.75, "floor"), "steps_few": lambda: steps(4, 0.5, "floor"),
    "steps_dirt": lambda: steps(6, 0.45, "dirt", fade="in"), "steps_heavy": lambda: steps(5, 0.62, "dirt"),
    "steps_near": lambda: steps(4, 0.55, "dirt", fade="in"), "steps_away": lambda: steps(8, 0.55, "dirt", fade="out"),
    "steps_stone": lambda: steps(5, 0.6, "stone"),
    "run_two": lambda: (steps(14, 0.22, "dirt", fade="out") + np.r_[np.zeros(int(0.11 * SR)), steps(14, 0.23, "dirt", fade="out")][: int((14 * 0.22 + 0.6) * SR)]),
    "door_open": lambda: door("open"), "door_close": lambda: door("close"), "door_far": lambda: door("close"),
    "knock": knock, "gust": gust, "stone_click": stone_click, "rope": rope, "splash_small": splash, "camel_bells": camel_bells, "goat_single": goat_single, "fire_pop": fire_pop, "coins": coins,
}


# ---------------- acoustics ----------------

def make_ir(decay, pre=0.004, density_lp=6000):
    n = int(decay * SR)
    out = []
    for ch in range(2):
        ir = noise(n) * np.exp(-np.arange(n) / SR * (6.9 / decay))
        ir = ss.sosfilt(sos("low", density_lp), ir); ir[: int(pre * SR)] = 0
        out.append(ir / np.sqrt(np.sum(ir ** 2)))
    return out


ROOMS = {"bedroom": (make_ir(0.45, 0.003, 5000), 0.16), "house": (make_ir(0.6, 0.005, 5500), 0.18),
         "outdoor": (make_ir(0.35, 0.012, 3500), 0.06), "well": (make_ir(1.4, 0.018, 2500), 0.38), "none": (None, 0.0)}


def spatial(mono, pan=0.0, dist=0.0, room="none"):
    x = mono.copy()
    if dist > 0:
        x = ss.sosfilt(sos("low", 9000 - 7000 * dist), x) * db(-14 * dist)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    st = np.stack([x * l, x * r], 1) * np.sqrt(2)
    ir, wet = ROOMS.get(room, (None, 0))
    if ir is not None:
        wet = wet + 0.25 * dist
        rv = np.stack([ss.fftconvolve(x, ir[0])[: len(x) + int(0.6 * SR)], ss.fftconvolve(x, ir[1])[: len(x) + int(0.6 * SR)]], 1)
        st = np.r_[st, np.zeros((len(rv) - len(st), 2))] * (1 - wet * 0.5) + rv * wet
    return st


AMB = {
    "night_wind": (lambda d: wind(d, 1.0, 700), -40), "night_wind_far": (lambda d: ss.sosfilt(sos("low", 500), wind(d)), -44),
    "crickets": (lambda d: crickets_bed(d), -42), "fire_crackle": (fire, -40),
    "morning_birds": (lambda d: loop(next((s for s in (src("birds"), src("birds2")) if s is not None), np.zeros(SR)) if True else None, d), -38),
    "sheep_goats": (lambda d: sporadic(chunks(src("goats"), 8) + chunks(src("sheep1"), 4) + chunks(src("sheep2"), 2, (0.5, 1.2)), d, (3, 8)), -38),
    "open_field": (lambda d: wind(d, 1.0, 1100), -41),
    "sheep_far": (lambda d: ss.sosfilt(sos("low", 1800), sporadic(chunks(src("sheep1"), 4) + chunks(src("goats"), 4), d, (5, 11))), -44),
    "distant_kids": (None, 0),  # built from Yusuf/Bünyamin laugh lines
    "afternoon_house": (lambda d: ss.sosfilt(sos("low", 600), noise(int(d * SR))), -52),
    "few_birds": (lambda d: ss.sosfilt(sos("low", 3500), sporadic(chunks(next((s for s in (src("birds"), src("birds2")) if s is not None), None), 6, (0.8, 2.0)), d, (4, 9))), -44),
    "evening_wind": (lambda d: wind(d, 1.0, 900), -39),
    "well_drip": (drips, -40),
    "caravan": (lambda d: caravan_bed(d), -40),
    "caravan_night": (lambda d: ss.sosfilt(sos("low", 2500), sporadic([camel_bells(2.0) for _ in range(2)] + [camel_groan()], d, (8, 16))), -44), "well_wind": (lambda d: ss.sosfilt(sos("low", 350), wind(d, 1.0, 600)), -44),
    "lone_bird": (lambda d: sporadic(chunks(next((s for s in (src("birds2"), src("birds")) if s is not None), None), 3, (0.6, 1.2)), d, (8, 15)), -46),
}


def main():
    mod = sys.argv[1] if len(sys.argv) > 1 else "ep01_script"
    sys.path.insert(0, str(ROOT / "episodes/radyo_yusuf"))
    E = importlib.import_module(mod)
    out = PUB / "audio" / mod.split("_")[0]; out.mkdir(parents=True, exist_ok=True)

    intro = sf.read(PUB / "music/theme_intro.wav")[0]; outro = sf.read(PUB / "music/theme_outro.wav")[0]
    sting = sf.read(PUB / "music/sting.wav")[0]; trans = sf.read(PUB / "music/transition.wav")[0]
    MAXT = 900
    N = MAXT * SR
    V = np.zeros((N, 2)); F = np.zeros((N, 2)); Mu = np.zeros((N, 2))
    cues = []; scenes = []; laughs = []

    def add(buf, st, t):
        a = int(t * SR); m = min(len(st), N - a); buf[a:a + m] += st[:m]

    # INTRO
    add(Mu, intro, 0.0)
    t = 2.0
    for e in E.INTRO:
        x = norm(R.tts(e[1], e[2]), -19); add(V, spatial(x), t); cues.append((t, t + len(x) / SR, e[1], e[2])); t += len(x) / SR
    t = max(t + 0.8, len(intro) / SR - 1.5)

    room = "none"; prev_who = None
    for e in E.SCRIPT:
        k = e[0]
        if k == "SCENE":
            room = e[2]["room"]; scenes.append({"id": e[1], "start": t, "amb": e[2]["amb"], "title": e[2]["title"]}); prev_who = None
        elif k == "P":
            t += e[1]
        elif k in ("FX", "FXW"):
            o = e[3]
            if e[1] == "kids_laugh_far":
                x = norm(np.r_[laughs[-1][: int(1.6 * SR)], np.zeros(int(0.3 * SR)), laughs[0][: int(1.4 * SR)]] if laughs else np.zeros(SR) + 1e-6, e[2])
            else:
                x = norm_active(FX[e[1]](), e[2] - 9)
            st = spatial(x, o.get("pan", 0), o.get("dist", 0), room)
            add(F, st, t)
            if k == "FXW": t += len(x) / SR * 0.85
        elif k == "MUS":
            m = {"sting": sting, "transition": trans}[e[1]]
            add(Mu, m * db(-6), t); t += len(m) / SR - 1.2
        elif k == "L":
            who, txt, o = e[1], e[2], e[3]
            x = R.tts(who, txt)
            x = norm(x, -19 if who == "ANLATICI" else -20)
            gap = 0.0 if prev_who is None else (0.32 if who == prev_who else 0.48)
            if who == "ANLATICI" and prev_who not in (None, "ANLATICI"): gap += 0.3
            if prev_who and prev_who != who and cues and cues[-1][3].rstrip().endswith("?"): gap += 0.1
            t += gap
            st = spatial(x, o.get("pan", 0), o.get("dist", 0), "none" if who == "ANLATICI" else room)
            add(V, st, t)
            cues.append((t, t + len(x) / SR, who, txt))
            if who in ("YUSUF", "BUNYAMIN") and re.search(r"laugh", txt): laughs.append(x)
            t += len(x) / SR; prev_who = who
    end_story = t + 1.0
    # OUTRO
    to = end_story + 0.5
    add(Mu, outro, to)
    t2 = to + 2.5
    for e in E.OUTRO:
        x = norm(R.tts(e[1], e[2]), -19); add(V, spatial(x), t2); cues.append((t2, t2 + len(x) / SR, e[1], e[2])); t2 += len(x) / SR
    total = max(to + len(outro) / SR, t2 + 1.5)
    n = int(total * SR)

    # AMBIENCE beds per scene with 1.5 s crossfades
    A = np.zeros((n, 2))
    for i, s in enumerate(scenes):
        a = s["start"] - 0.8; b = scenes[i + 1]["start"] + 0.8 if i + 1 < len(scenes) else end_story + 1.5
        d = b - a
        for name in s["amb"]:
            if name == "distant_kids":
                clips = [ss.sosfilt(sos("low", 1500), c) * 0.5 for c in laughs] or [np.zeros(10)]
                bed = sporadic(clips, d, (5, 10)); lvl = -42
            else:
                fn, lvl = AMB[name]; bed = fn(d)
            if not np.any(bed): continue
            bed = norm(bed, lvl + 2) * env(len(bed), 1.5, 1.5) * (0.8 + 0.2 * np.sin(2 * np.pi * np.arange(len(bed)) / SR / rng.uniform(14, 30) + rng.uniform(0, 6)))
            w = rng.uniform(-0.3, 0.3)
            st = np.stack([bed * np.cos((w + 1) * np.pi / 4), bed * np.sin((w + 1) * np.pi / 4)], 1) * np.sqrt(2)
            # gentle stereo width: delay right channel a little
            st[:, 1] = np.r_[np.zeros(int(0.012 * SR)), st[:-int(0.012 * SR), 1]]
            aa = int(max(0, a) * SR); m = min(len(st), n - aa); A[aa:aa + m] += st[:m]

    # DETAIL layer: sparse, varied background events so scenes never sound the same
    for i, s_ in enumerate(scenes):
        a = s_["start"] - 0.5; b = scenes[i + 1]["start"] + 0.5 if i + 1 < len(scenes) else end_story + 1.0
        d = b - a; amb = s_["amb"]; pool = []
        if any(x in amb for x in ("morning_birds", "few_birds", "lone_bird")): pool += chunks(src("birds2"), 6, (0.5, 1.5))
        if any(x in amb for x in ("sheep_goats", "sheep_far", "open_field")): pool += [ss.sosfilt(sos("low", 2200), c) for c in chunks(src("goats"), 4) + chunks(src("sheep1"), 3)]
        if any(x in amb for x in ("night_wind", "crickets", "night_wind_far", "evening_wind")): pool += [gust(rng.uniform(2, 4)) * 0.6 for _ in range(3)] + [owl() for _ in range(2)]
        if "fire_crackle" in amb or "afternoon_house" in amb: pool += [fabric(rng.uniform(0.4, 0.8)) * 0.5 for _ in range(3)] + [ss.sosfilt(sos("low", 1800), c) for c in chunks(src("birds2"), 2, (0.5, 1.0))]
        if "well_drip" in amb: pool += [drips(1.5) for _ in range(3)] + [ss.sosfilt(sos("low", 400), gust(3.0)) for _ in range(2)]
        if not pool: continue
        ev_ = sporadic([norm_active(c, -38) if np.any(c) else c for c in pool], d, (4, 9), 6)
        for k_ in range(0, len(ev_), int(3 * SR)):
            pass
        pan = rng.uniform(-0.6, 0.6)
        st = np.stack([ev_ * np.cos((pan + 1) * np.pi / 4), ev_ * np.sin((pan + 1) * np.pi / 4)], 1) * np.sqrt(2)
        aa = int(max(0, a) * SR); m = min(len(st), n - aa); A[aa:aa + m] += st[:m]

    V, F, Mu = V[:n], F[:n], Mu[:n]
    # duck ambience + music under dialogue
    e = np.abs(V).mean(1); w = int(0.2 * SR); cs = np.cumsum(np.r_[0, e]); ev = (cs[w:] - cs[:-w]) / w; ev = np.r_[ev, np.zeros(n - len(ev))]
    g = np.where(ev > 0.003, db(-6), 1.0); k2 = int(0.3 * SR); cs = np.cumsum(np.r_[0, g]); gs = (cs[k2:] - cs[:-k2]) / k2; g = np.r_[gs, np.full(n - len(gs), gs[-1])]
    gm = np.where(ev > 0.003, db(-9), 1.0); cs = np.cumsum(np.r_[0, gm]); gs = (cs[k2:] - cs[:-k2]) / k2; gm = np.r_[gs, np.full(n - len(gs), gs[-1])]
    A *= g[:, None]; Mu *= gm[:, None] * db(-3)
    mix = V + F + A + Mu
    import pyloudnorm as pyln
    lo = pyln.Meter(SR).integrated_loudness(mix)
    gain = db(-14 - lo)
    mix *= gain
    # look-ahead peak limiter: gain never lets a 4x-oversampled peak exceed -1.5 dBFS
    up = np.abs(ss.resample_poly(mix, 4, 1, axis=0)).max(1).reshape(-1, 4).max(1)[: len(mix)]
    need = np.minimum(1.0, db(-1.6) / np.maximum(up, 1e-9))
    w = int(0.004 * SR)
    need = -ss.minimum_filter1d(-need, 1) if False else need
    from scipy.ndimage import minimum_filter1d
    need = minimum_filter1d(need, size=2 * w + 1)
    k = np.ones(w) / w
    need = np.convolve(need, k, "same")
    need = minimum_filter1d(need, size=w)
    mix *= need[:, None]
    for name, arr in (("dialog", V), ("sfx", F), ("ambience", A), ("music", Mu)):
        sf.write(out / f"stem_{name}.flac", (arr * gain).astype(np.float32), SR, subtype="PCM_24")
    sf.write(out / "mix.wav", mix.astype(np.float32), SR, subtype="PCM_16")
    meta = {"durationSec": round(total, 2), "outroStart": round(to, 2), "scenes": [{"id": s["id"], "start": round(s["start"], 2), "title": s["title"]} for s in scenes]}
    (out / "timeline.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))
    names = {"ANLATICI": "Anlatıcı", "YUSUF": "Yusuf", "YAKUP": "Yakup", "BUNYAMIN": "Bünyamin", "KARDES_A": "Lavi", "KARDES_B": "Rubil", "KARDES_C": "Şem'un", "KARDES_D": "Yahuda",
             "MALIK": "Mâlik", "SUCU": "Sucu", "BUSRA": "Büşrâ"}
    names = {k: names.get(k, k.replace("_", " ").title()) for k in R.VOICES} | names
    def ts(x):
        ms = int(x * 1000); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000); return f"{h:02}:{m:02}:{s:02},{ms:03}"
    clean = lambda x: re.sub(r"\s+", " ", re.sub(r"\[[^\]]*\]", "", x)).strip()
    srt = "\n".join(f"{i}\n{ts(a)} --> {ts(b)}\n{names[w]}: {clean(x)}\n" for i, (a, b, w, x) in enumerate(cues, 1))
    (out / "altyazi.srt").write_text(srt)
    print(f"total {total/60:.0f}:{total%60:04.1f}  LUFS in {lo:.1f}  scenes", [(s['id'], round(s['start'], 1)) for s in scenes])


if __name__ == "__main__":
    main()
