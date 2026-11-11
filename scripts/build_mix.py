#!/usr/bin/env python3
"""CAKIR framework — original score, ambience and final mix.

The music is composed procedurally here (original work, no third-party
samples or licences involved): slow ambient pads, a low drone and sparse
felt-piano-like notes, with chord changes aligned to chapter starts.
Ambience is a quiet filtered "large hall" room tone with occasional soft
three-note chimes (a generic sound motif, synthesised from sine tones).

Narration ducking uses the exact sentence timings from timeline.json.
Final loudness is normalised with ffmpeg loudnorm (two-pass) to the target
in framework/config/audio.json (YouTube: -14 LUFS).

Usage: python scripts/build_mix.py airport [--tag _sample]
"""
import argparse, json, subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

ROOT = Path(__file__).resolve().parent.parent
rng = np.random.default_rng(1988)

NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def hz(name, octave):
    return 440.0 * 2 ** ((NOTE[name] + 12 * (octave + 1) - 69) / 12)


# D minor world: i – VI – III – VII – iv – i  (voicings as (note, octave))
CHORDS = [
    [("D", 3), ("A", 3), ("E", 4), ("F", 4)],   # Dm(add9)
    [("A#", 2), ("F", 3), ("A", 3), ("D", 4)],  # Bbmaj7
    [("F", 3), ("C", 4), ("E", 4), ("A", 4)],   # Fmaj7
    [("C", 3), ("G", 3), ("D", 4), ("E", 4)],   # Cadd9
    [("G", 2), ("D", 3), ("A#", 3), ("F", 4)],  # Gm7
    [("D", 3), ("A", 3), ("C", 4), ("F", 4)],   # Dm7
]


def lp(x, sr, f, order=2):
    return sosfilt(butter(order, f, "low", fs=sr, output="sos"), x)


def bp(x, sr, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=sr, output="sos"), x)


def reverb(x, sr, seconds=3.5, wet=0.35):
    n = int(sr * seconds)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir = lp(ir, sr, 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    y = fftconvolve(x, ir)[: len(x)]
    return (1 - wet) * x + wet * y


def pad_voice(f, dur, sr):
    t = np.arange(int(dur * sr)) / sr
    vib = 1 + 0.0025 * np.sin(2 * np.pi * 0.17 * t + rng.uniform(0, 6))
    sig = np.zeros_like(t)
    for det in (-0.004, 0.0, 0.0045):
        ph = 2 * np.pi * f * (1 + det) * np.cumsum(vib) / sr
        # soft "string pad": a few odd/even partials with falling amplitude
        for k, a in ((1, 1.0), (2, 0.35), (3, 0.18), (4, 0.08), (5, 0.05)):
            sig += a * np.sin(k * ph + rng.uniform(0, 6))
    return sig / 6


def piano_note(f, sr, dur=4.5):
    t = np.arange(int(dur * sr)) / sr
    env = np.exp(-t * 1.6) * (1 - np.exp(-t * 300))
    s = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * k * 0.6)
            for k, a in ((1, 1), (2, 0.42), (3, 0.2), (4, 0.09), (6, 0.04)))
    return s * env


def chime(sr):
    out = np.zeros(int(sr * 4.5))
    for i, (n, o) in enumerate((("A", 5), ("F", 5), ("C", 6))):
        x = piano_note(hz(n, o), sr, 3.2) * 0.5
        st = int(i * 0.42 * sr)
        out[st:st + len(x)] += x
    return out


def build_music(total, seg_starts, sr):
    n = int(total * sr)
    music = np.zeros(n)
    # chord change at each chapter start, plus a mid-chapter change for long chapters
    marks = sorted(set([0.0] + seg_starts))
    expanded = []
    for i, m in enumerate(marks):
        nxt = marks[i + 1] if i + 1 < len(marks) else total
        expanded.append(m)
        if nxt - m > 34:
            expanded.append(m + (nxt - m) / 2)
    expanded.append(total)
    for ci in range(len(expanded) - 1):
        a, b = expanded[ci], expanded[ci + 1]
        chord = CHORDS[ci % len(CHORDS)]
        dur = (b - a) + 4.0  # overlap for crossfade
        seg = sum(pad_voice(hz(nm, oc), dur, sr) for nm, oc in chord) / len(chord)
        m = len(seg)
        env = np.ones(m)
        fade = int(3.5 * sr)
        env[:fade] = np.sin(np.linspace(0, np.pi / 2, fade)) ** 2
        env[-fade:] = np.cos(np.linspace(0, np.pi / 2, fade)) ** 2
        st = int(a * sr)
        e = min(n, st + m)
        music[st:e] += (seg * env)[: e - st]
        # sparse piano-like notes drawn from the chord, an octave up
        t = a + rng.uniform(1.5, 3.0)
        while t < b - 1:
            nm, oc = chord[rng.integers(len(chord))]
            x = piano_note(hz(nm, oc + 1), sr) * rng.uniform(0.18, 0.32)
            s0 = int(t * sr)
            e0 = min(n, s0 + len(x))
            music[s0:e0] += x[: e0 - s0]
            t += rng.uniform(2.6, 5.5)
    # low drone on D
    tt = np.arange(n) / sr
    drone = 0.22 * np.sin(2 * np.pi * hz("D", 2) * tt) + 0.08 * np.sin(2 * np.pi * hz("A", 2) * tt)
    drone *= 0.75 + 0.25 * np.sin(2 * np.pi * tt / 23)
    music += drone
    music = lp(music, sr, 4200)
    music = reverb(music, sr, 4.0, 0.45)
    music /= np.max(np.abs(music)) + 1e-9
    return music


def build_ambience(total, seg_starts, sr, chimes=True):
    n = int(total * sr)
    noise = np.cumsum(rng.standard_normal(n)) * 0.02  # brown-ish
    noise -= lp(noise, sr, 40)
    room = bp(noise, sr, 120, 1800)
    murmur = bp(rng.standard_normal(n), sr, 300, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * np.arange(n) / sr / 9.0))
    amb = room / (np.max(np.abs(room)) + 1e-9) + 0.25 * murmur / (np.max(np.abs(murmur)) + 1e-9)
    if chimes:
        c = reverb(np.pad(chime(sr), (0, int(sr * 3))), sr, 3.0, 0.6)
        for s in seg_starts[1:3] + seg_starts[-2:-1]:  # only a couple of times in the film
            st = int((s + 0.2) * sr)
            e = min(n, st + len(c))
            amb[st:e] += 0.8 * c[: e - st]
    return amb / (np.max(np.abs(amb)) + 1e-9)


def build_tracks(plan, total, seg_starts, sr, xfade=3.0, target_db=-20.0):
    """Licensed music tracks placed at chapter starts, each loudness-matched and
    crossfaded. plan: [{"segment": index, "file": path, "offset": seconds}]."""
    n = int(total * sr)
    out = np.zeros(n)
    marks = [seg_starts[p["segment"]] if p["segment"] < len(seg_starts) else total for p in plan] + [total]
    for i, p in enumerate(plan):
        a, b = marks[i], marks[i + 1]
        if b <= a:
            continue
        dur = (b - a) + xfade
        raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(p.get("offset", 0)), "-t", str(dur + 1), "-i", str(ROOT / p["file"]),
                              "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout
        x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
        if len(x) < int(dur * sr):  # loop if the track is shorter than the section
            reps = int(np.ceil(dur * sr / max(1, len(x))))
            x = np.tile(x, reps)
        x = x[: int(dur * sr)]
        rms = np.sqrt(np.mean(x ** 2)) + 1e-9
        x *= 10 ** (target_db / 20) / rms * (10 ** (p.get("gainDb", 0) / 20))
        f = int(xfade * sr)
        env = np.ones(len(x))
        if i > 0:
            env[:f] = np.sin(np.linspace(0, np.pi / 2, f)) ** 2
        env[-f:] = np.cos(np.linspace(0, np.pi / 2, f)) ** 2
        st = int(a * sr)
        e = min(n, st + len(x))
        out[st:e] += (x * env)[: e - st]
    return out / (10 ** (target_db / 20))  # back to ~0 dB reference for the bed gains


def process_voice(path, sr):
    """Broadcast-style narration: low-cut, presence lift, gentle compression."""
    af = ("highpass=f=75,equalizer=f=200:t=q:w=1:g=-1.5,equalizer=f=3200:t=q:w=1.2:g=2.5,"
          "acompressor=threshold=-20dB:ratio=3:attack=6:release=120:makeup=2.5")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-af", af, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def db(x):
    return 10 ** (x / 20)


def speech_mask(timeline, total, sr, ramp):
    n = int(total * sr)
    m = np.zeros(n)
    for seg in timeline["segments"]:
        for s in seg["sentences"]:
            m[int(s["start"] * sr): int(s["end"] * sr)] = 1
    # close short gaps between sentences so the bed doesn't pump
    k = int(sr * 1.3)  # bridge short pauses so the bed doesn't pump
    m = np.convolve(m, np.ones(k) / k, mode="same") > 0.001
    r = int(ramp * sr)
    return np.convolve(m.astype(float), np.ones(r) / r, mode="same")


def loudnorm(src, dst, cfg):
    I, TP, LRA = cfg["integratedLufs"], cfg["truePeakDb"], cfg["lra"]
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(src), "-af",
                        f"loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    js = json.loads(p.stderr[p.stderr.rfind("{"): p.stderr.rfind("}") + 1])
    af = (f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
          f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(src), "-af", af,
                    "-ar", "48000", "-c:a", "pcm_s16le", str(dst)], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--tag", default="")
    args = ap.parse_args()
    cfg = json.loads((ROOT / "framework/config/audio.json").read_text())
    sr = cfg["sampleRate"]
    tl = json.loads((ROOT / "episodes" / args.episode / "build" / f"timeline{args.tag}.json").read_text())
    total = tl["durationSec"]
    seg_starts = [s["start"] for s in tl["segments"]]
    adir = ROOT / "public" / "episodes" / args.episode / "audio"
    nar, nsr = sf.read(adir / f"narration{args.tag}.wav", dtype="float64")
    assert nsr == sr
    if cfg["narration"].get("broadcast", True):
        nar = process_voice(adir / f"narration{args.tag}.wav", sr)[: len(nar)]
        nar *= 10 ** (-3 / 20) / (np.max(np.abs(nar)) + 1e-9)
    n = len(nar)

    mcfg = cfg["music"]
    ep = json.loads((ROOT / "episodes" / args.episode / "episode.json").read_text())
    plan = ep.get("music")
    if plan:
        ids = [s["id"] for s in tl["segments"]]
        plan = [dict(p, segment=ids.index(p["segmentId"])) for p in plan if p["segmentId"] in ids]
        music = build_tracks(sorted(plan, key=lambda p: p["segment"]), total, seg_starts, sr)[:n]
    else:
        music = build_music(total, seg_starts, sr)[:n]
    amb = build_ambience(total, seg_starts, sr, mcfg.get("chimes", True))[:n]
    mask = speech_mask(tl, total, sr, mcfg["duckRampSec"])[:n]
    bed_gain = db(mcfg["bedDbBetweenSpeech"]) + (db(mcfg["bedDbUnderSpeech"]) - db(mcfg["bedDbBetweenSpeech"])) * mask
    # musical swell at each chapter opening (before the first line)
    for st in seg_starts[1:]:
        a0, a1 = int(st * sr), int((st + 1.6) * sr)
        sw = np.ones(n)
        k = np.linspace(0, np.pi, max(1, a1 - a0))
        sw[a0:a1] = 1 + 0.3 * np.sin(k)
        bed_gain *= sw[: len(bed_gain)]
    # fade music in at start and out under the end card
    fin = int(sr * 2.5)
    bed_gain[:fin] *= np.linspace(0, 1, fin)
    fo = int(sr * 4)
    bed_gain[-fo:] *= np.linspace(1, 0, fo)

    # stereo: slight width on music/ambience, narration centred
    def widen(x, d):
        return np.stack([x, np.roll(x, int(sr * d))], 1)

    n = min(len(nar), len(music), len(amb), len(bed_gain))
    nar, music, amb, bed_gain = nar[:n], music[:n], amb[:n], bed_gain[:n]
    mix = np.stack([nar, nar], 1) + widen(music * bed_gain, 0.012) + widen(amb * db(mcfg["ambienceDb"]) * (bed_gain / db(mcfg["bedDbBetweenSpeech"])), 0.02)
    # BALANCE report: voice vs music bed, under speech and in pauses
    r = lambda v: 20 * np.log10(np.sqrt(np.mean(v ** 2)) + 1e-12)
    sp = mask > 0.5
    bed = music * bed_gain
    print(f"BALANCE voice {r(nar[sp]):.1f} dB | music under voice {r(bed[sp]):.1f} dB (voice-to-music {r(nar[sp]) - r(bed[sp]):.1f} dB) | music in pauses {r(bed[~sp]):.1f} dB")
    mix /= max(1.0, np.max(np.abs(mix)) / 0.89)
    pre = adir / f"premix{args.tag}.wav"
    sf.write(pre, mix, sr, subtype="PCM_24")
    sf.write(adir / f"music{args.tag}.wav", np.stack([music, music], 1) * 0.5, sr, subtype="PCM_16")
    loudnorm(pre, adir / f"mix{args.tag}.wav", cfg["master"])
    pre.unlink()
    print("wrote", adir / f"mix{args.tag}.wav")


if __name__ == "__main__":
    main()
