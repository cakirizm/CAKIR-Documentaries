#!/usr/bin/env python3
"""ÇAKIR RADYO TİYATROSU — original series theme (Hicaz on D): ney melody, oud, soft strings, bendir.
Writes fixed series music files (never change between episodes):
  theme_intro.wav (~11 s), theme_outro.wav (~14 s), sting.wav (~5 s), transition.wav (~5 s)"""
from pathlib import Path

import numpy as np
import scipy.signal as ss
import soundfile as sf

SR = 48000
OUT = Path(__file__).resolve().parents[1] / "public/episodes/radyo_yusuf/music"
rng = np.random.default_rng(1844)
D3 = 146.83
HICAZ = {"D": 0, "Eb": 1, "F#": 4, "G": 5, "A": 7, "Bb": 8, "C": 10}


def hz(note, octave=0):
    return D3 * 2 ** ((HICAZ[note] + 12 * octave) / 12)


def adsr(n, a, r, s=1.0):
    e = np.full(n, s); ai = max(1, int(a * SR)); ri = max(1, int(r * SR))
    e[:ai] = np.linspace(0, s, ai) ** 1.5
    e[-ri:] *= np.linspace(1, 0, ri) ** 2
    return e


def ney_phrase(notes, start_gap=0.0):
    """notes: list of (note, octave, dur). Continuous breath with portamento + delayed vibrato."""
    total = sum(d for _, _, d in notes) + 1.2
    n = int(total * SR); t = np.arange(n) / SR
    f = np.zeros(n); env = np.zeros(n); vib_amt = np.zeros(n)
    pos = 0.0; prev = None
    for note, octv, d in notes:
        a, b = int(pos * SR), int((pos + d) * SR)
        target = hz(note, octv)
        seg = np.full(b - a, target)
        if prev is not None:
            g = min(int(0.07 * SR), b - a)
            seg[:g] = prev + (target - prev) * (np.linspace(0, 1, g) ** 0.6)
        f[a:b] = seg
        local = np.arange(b - a) / SR
        vib_amt[a:b] = np.clip((local - 0.35) / 0.6, 0, 1) * 0.006
        env[a:b] = 1.0
        prev = target; pos += d
    f[int(pos * SR):] = prev
    env = ss.lfilter(*ss.butter(1, 6 / (SR / 2)), env)          # smooth phrasing
    env *= np.clip((pos + 0.9 - t) / 0.9, 0, 1)
    f = f * (1 + vib_amt * np.sin(2 * np.pi * 5.1 * t) + 0.0015 * np.sin(2 * np.pi * 0.7 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = sum(a * np.sin(k * ph) for k, a in enumerate([1, 0.28, 0.42, 0.10, 0.16, 0.05, 0.07], 1))
    breath = rng.standard_normal(n)
    breath = ss.lfilter(*ss.butter(2, [600 / (SR / 2), 4200 / (SR / 2)], "band"), breath)
    sig = (tone * 0.85 + breath * 0.22 * (0.6 + 0.4 * env)) * env
    sig = ss.lfilter(*ss.butter(2, 5200 / (SR / 2)), sig)
    return np.r_[np.zeros(int(start_gap * SR)), sig]


def oud(freq, dur=2.6, vel=1.0):
    n = int(dur * SR); period = int(SR / freq)
    buf = rng.uniform(-1, 1, period) * vel
    buf -= buf.mean()
    buf = ss.lfilter([0.5, 0.5], [1], buf)                      # softer pluck
    out = np.zeros(n); idx = 0
    for i in range(n):
        out[i] = buf[idx]
        nxt = (idx + 1) % period
        buf[idx] = 0.4985 * (buf[idx] + buf[nxt])
        idx = nxt
    b, a = ss.iirpeak(220 / (SR / 2), 1.5)
    out = out + 0.6 * ss.lfilter(b, a, out)
    out = ss.lfilter(*ss.butter(2, 90 / (SR / 2), 'high'), out - np.mean(buf))
    return out * np.exp(-np.arange(n) / SR * 1.2)


def strings(freqs, dur, att=1.6, rel=2.0):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for f0 in freqs:
        for det in (-0.004, -0.0015, 0.0, 0.0018, 0.0042):
            ph = rng.uniform(0, 1)
            x += ss.sawtooth(2 * np.pi * (f0 * (1 + det) * t + ph))
    x = ss.lfilter(*ss.butter(2, 1400 / (SR / 2)), x)
    return x * adsr(n, att, rel) / (len(freqs) * 5)


def bendir(vel=1.0):
    n = int(0.9 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (85 + 50 * np.exp(-t * 18)) * t) * np.exp(-t * 9)
    skin = ss.lfilter(*ss.butter(2, [180 / (SR / 2), 1800 / (SR / 2)], "band"), rng.standard_normal(n)) * np.exp(-t * 30) * 0.35
    return (body + skin) * vel


def reverb(x, secs=2.6, wet=0.32):
    n = int(secs * SR)
    out = []
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * (6.9 / secs))
        ir = ss.lfilter(*ss.butter(1, 4500 / (SR / 2)), ir)
        ir[: int(0.02 * SR)] = 0
        ir /= np.sqrt(np.sum(ir ** 2))
        xin = ss.lfilter(*ss.butter(2, 200 / (SR / 2), 'high'), x[:, ch])
        out.append(ss.fftconvolve(xin, ir)[: len(x)])
    return x * (1 - wet) + np.stack(out, 1) * wet * 1.4


def place(mix, sig, at, pan=0.0, gain=1.0):
    a = int(at * SR); sig = sig[: max(0, len(mix) - a)]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    mix[a:a + len(sig), 0] += sig * l * gain
    mix[a:a + len(sig), 1] += sig * r * gain


MELODY = [("A", 1, 1.4), ("Bb", 1, 0.45), ("A", 1, 0.9), ("G", 1, 0.9), ("F#", 1, 1.3), ("G", 1, 0.45), ("Eb", 1, 0.9), ("D", 1, 2.2)]


def theme(total, melody, ney_at, oud_pattern, pad_chords, drums, fade_out):
    mix = np.zeros((int(total * SR), 2))
    for at, freqs, dur in pad_chords:
        place(mix, strings(freqs, dur), at, 0.0, 0.42)
    for at, note, octv, vel, pan in oud_pattern:
        place(mix, oud(hz(note, octv), 2.8, vel), at, pan, 0.32)
    place(mix, ney_phrase(melody), ney_at, -0.12, 0.30)
    for at, vel in drums:
        place(mix, bendir(vel), at, 0.1, 0.16)
    mix = reverb(mix)
    mix = ss.lfilter(*ss.butter(2, 60 / (SR / 2), 'high'), mix, axis=0)
    fo = int(fade_out * SR)
    mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
    mix[: int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))[:, None]
    return mix / (np.max(np.abs(mix)) + 1e-9) * 0.7


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    arp = lambda t0, notes, step, vel=0.9: [(t0 + i * step, n, o, vel * (1 - 0.15 * (i % 2)), (-0.3 if i % 2 else 0.25)) for i, (n, o) in enumerate(notes)]
    D, A2 = hz("D", -1), hz("A", -1)
    # INTRO ~11 s: oud opens, ney melody, strings swell, two soft bendir hits
    intro = theme(11.5, MELODY, 1.3,
                  arp(0.0, [("D", 0), ("A", 0), ("D", 1), ("A", 0)], 0.32) + arp(4.6, [("G", 0), ("Bb", 0), ("D", 1)], 0.36, 0.7) + [(8.4, "D", 0, 1.0, 0.0), (8.42, "A", 0, 0.8, 0.2)],
                  [(0.0, [D, A2 * 2, D * 2], 11.5)], [(0.0, 0.9), (4.6, 0.6), (8.4, 1.0)], 2.6)
    sf.write(OUT / "theme_intro.wav", intro.astype(np.float32), SR)
    # OUTRO ~14 s: same melody, calmer and slower, last note held
    slow = [(n, o, d * 1.18) for n, o, d in MELODY[:-1]] + [("D", 1, 3.4)]
    outro = theme(15.0, slow, 1.8,
                  arp(0.0, [("D", 0), ("A", 0), ("D", 1)], 0.5, 0.75) + arp(6.0, [("G", 0), ("Bb", 0), ("D", 1)], 0.55, 0.6) + [(11.0, "D", 0, 0.8, 0.0)],
                  [(0.0, [D, A2 * 2, D * 2], 15.0)], [(0.0, 0.6), (11.0, 0.7)], 4.5)
    sf.write(OUT / "theme_outro.wav", outro.astype(np.float32), SR)
    # STING ~5 s: first motif of the theme, alone on ney over a low pad
    sting = theme(5.5, MELODY[:4] + [("G", 1, 1.4)], 0.2, [(0.0, "D", 0, 0.6, 0.0)], [(0.0, [D, A2 * 2], 5.5)], [], 2.2)
    sf.write(OUT / "sting.wav", sting.astype(np.float32), SR)
    # TRANSITION ~5 s: oud arpeggio + long ney D
    trans = theme(5.5, [("A", 1, 0.8), ("F#", 1, 0.6), ("G", 1, 0.6), ("D", 1, 2.0)], 0.9,
                  arp(0.0, [("D", 0), ("F#", 0), ("A", 0), ("D", 1)], 0.22, 0.8), [(0.0, [D, A2 * 2], 5.5)], [(0.0, 0.5)], 2.2)
    sf.write(OUT / "transition.wav", trans.astype(np.float32), SR)
    print("music ok")


if __name__ == "__main__":
    main()
