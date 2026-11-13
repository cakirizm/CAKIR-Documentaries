#!/usr/bin/env python3
"""Audio + timeline for episodes whose script mixes Turkish narration blocks
with Qur'an recitation blocks (episodes/<id>/episode.json, "blocks").

  narr  blocks: sentences synthesised with ElevenLabs (cached in .cache/tts)
  ayah  blocks: a recitation file placed untouched (never shortened)

Writes, under public/episodes/<id>/audio/:
  voice.wav     Turkish narration only
  tilavet.wav   recitation only
  music.wav     music layer (clean, full level, silent during recitation)
  music_ducked.wav  same layer, ducked under narration (as used in the mix)
  ambience.wav  quiet room/wind/rain bed (kept under recitation)
  mix.wav       mastered mix (-14 LUFS)
and episodes/<id>/build/timeline.json + <slug>_Turkce.srt

Rules enforced here: music is fully off during every recitation (fade out
before, fade in after); the music bed stays >= 9 dB below the narration.
Usage: python scripts/build_yusuf_audio.py yusuf
"""
import hashlib, json, subprocess, sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).parent))
from build_narration import ElevenLabs, trim, cap_pauses  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SR = 48000

MUSIC = {  # Kevin MacLeod (incompetech.com), CC BY 4.0
    "mystery": ("Lightless_Dawn.mp3", 4),
    "dream": ("Long_Note_Four.mp3", 40),
    "tension": ("Hiding_Your_Reality.mp3", 0),
    "hope": ("Healing.mp3", 20),
    "heavy": ("At_Rest.mp3", 0),
    "close": ("Lasting_Hope.mp3", 0),
}
MUSIC_DIR = ROOT / "public/episodes/alvarenga/music"


def load(path, sr=SR):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).astype(np.float64)


def resample(x, sr_in, sr_out=SR):
    import scipy.signal as ss
    from math import gcd
    g = gcd(sr_in, sr_out)
    return ss.resample_poly(x, sr_out // g, sr_in // g)


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)


def movavg(x, w):
    w = max(1, int(w)); c = np.cumsum(np.concatenate([[0.0], x]))
    h = w // 2; i = np.arange(len(x)); lo = np.clip(i - h, 0, len(x)); hi = np.clip(i - h + w, 0, len(x))
    return (c[hi] - c[lo]) / np.maximum(1, hi - lo)


def fmt(t):
    h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"


def wrap(text, n=32):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if cur and len(cur) + 1 + len(w) > n:
            lines.append(cur); cur = w
        else:
            cur = f"{cur} {w}".strip()
    if cur:
        lines.append(cur)
    return lines


def cues_for(text, start, end, max_chars=64):
    """Split a sentence into <=2-line cues (32 chars/line), time by length."""
    lines = wrap(text)
    groups = [" ".join(lines[i:i + 2]) for i in range(0, len(lines), 2)]
    tot = sum(len(g) for g in groups); t = start; out = []
    for g in groups:
        d = (end - start) * len(g) / tot
        out.append(dict(start=round(t, 3), end=round(t + d, 3), text="\n".join(wrap(g))))
        t += d
    return out


def main():
    ep_id = sys.argv[1]
    d = ROOT / "episodes" / ep_id
    ep = json.loads((d / "episode.json").read_text())
    voice = ep["voice"]
    tts = ElevenLabs(voice)
    cache = ROOT / ".cache" / "tts"; cache.mkdir(parents=True, exist_ok=True)

    lead_in = 0.6
    t = lead_in
    voice_parts, til_parts, timeline = [], [], []
    for bi, b in enumerate(ep["blocks"]):
        blk = dict(id=b["id"], type=b["type"], scene=b["scene"], mood=b.get("mood"), start=round(t, 3))
        if b["type"] == "narr":
            sents = []
            for si, s in enumerate(b["sentences"]):
                prev = b["sentences"][si - 1] if si else ""
                nxt = b["sentences"][si + 1] if si + 1 < len(b["sentences"]) else ""
                sp = voice.get("speeds", {}).get(f'{b["id"]}:{si}', voice.get("speed", 1.0))
                key = hashlib.sha1(f'{voice["voice"]}|{voice["model"]}|{sp}|{voice.get("stability")}|{voice.get("style")}|{s}|{prev}|{nxt}'.encode()).hexdigest()[:16]
                cp = cache / f"{key}.wav"
                if cp.exists():
                    x, sr = sf.read(cp)
                else:
                    x, sr = tts.say(s, voice["voice"], sp, prev, nxt)
                    sf.write(cp, x, sr)
                    print("tts", b["id"], si, f"{len(x) / sr:.1f}s", flush=True)
                x = cap_pauses(trim(np.asarray(x, dtype=np.float64), sr, -45), sr, 0.55)
                x = resample(x, sr)
                voice_parts.append((t, x))
                sents.append(dict(i=si, text=s, start=round(t, 3), end=round(t + len(x) / SR, 3)))
                t += len(x) / SR
                gap = 0.85 if s.rstrip().endswith("…") else (0.55 if si + 1 < len(b["sentences"]) else 0.0)
                t += gap
            blk["sentences"] = sents
            t += 0.9  # breath before the next scene
        else:
            x = load(ROOT / b["file"])
            t += 0.8  # music has faded out; a beat of silence before the recitation
            blk["recStart"] = round(t, 3)
            til_parts.append((t, x))
            blk["chunks"] = [dict(text=c["text"], meal=c["meal"], start=round(t + c["start"], 3)) for c in b["chunks"]]
            blk["mealSegments"] = b["mealSegments"]
            blk["ayah"] = b["ayah"]; blk["arabic"] = b["arabic"]; blk["meal"] = b["meal"]
            blk["recEnd"] = round(t + b["recitationEnd"], 3)
            t += b["recitationEnd"] + 1.4  # let the last word ring, then the narrator explains
        blk["end"] = round(t, 3)
        timeline.append(blk)
    tail = 6.0  # closing card with the verse reference
    total = t + tail
    n = int(total * SR)

    def place(parts):
        y = np.zeros(n)
        for st, x in parts:
            a = int(st * SR); e = min(n, a + len(x)); y[a:e] += x[: e - a]
        return y

    vo = place(voice_parts); til = place(til_parts)
    # level-match recitation to narration (speech RMS)
    vo_act = vo[np.abs(vo) > 1e-3]; til_act = til[np.abs(til) > 1e-3]
    til *= 10 ** ((rms_db(vo_act) - rms_db(til_act) + 0.5) / 20)

    # ---- music layer: per-mood tracks, crossfaded, silent during recitation
    music = np.zeros(n); cur = None; seg_start = None
    spans = []  # (mood, start, end) contiguous narration spans
    for blk in timeline:
        if blk["type"] == "ayah":
            if cur:
                spans.append((cur, seg_start, blk["start"])); cur = None
            continue
        if blk["mood"] != cur:
            if cur:
                spans.append((cur, seg_start, blk["start"]))
            cur, seg_start = blk["mood"], blk["start"]
    if cur:
        spans.append((cur, seg_start, total))
    spans[0] = (spans[0][0], 0.0, spans[0][2])
    xf = 2.5
    for mood, a, b in spans:
        f, off = MUSIC[mood]
        x = load(MUSIC_DIR / f)[int(off * SR):]
        L = int((b - a + xf) * SR)
        if len(x) < L:
            x = np.tile(x, int(np.ceil(L / len(x))))
        x = x[:L] * 10 ** ((-20 - rms_db(x[:L])) / 20)
        env = np.ones(L); k = int(xf * SR)
        env[:k] = np.sin(np.linspace(0, np.pi / 2, k)) ** 2
        env[-k:] = np.cos(np.linspace(0, np.pi / 2, k)) ** 2
        s = int(a * SR); e = min(n, s + L)
        music[s:e] += (x * env)[: e - s]
    # hard gate: zero during recitation (+ fades)
    gate = np.ones(n)
    for blk in timeline:
        if blk["type"] != "ayah":
            continue
        a, b = int((blk["start"] - 0.2) * SR), int((blk["end"] - 0.3) * SR)
        fo, fi = int(1.6 * SR), int(1.8 * SR)
        gate[a:b] = 0
        gate[max(0, a - fo):a] = np.minimum(gate[max(0, a - fo):a], np.linspace(1, 0, a - max(0, a - fo)))
        gate[b:b + fi] = np.minimum(gate[b:b + fi], np.linspace(0, 1, len(gate[b:b + fi])))
    music_clean = music * gate

    # ducking under narration + speech-safety (music >= 9 dB under voice)
    speech = (movavg(np.abs(vo), int(0.05 * SR)) > 2e-3).astype(float)
    mask = np.clip(movavg(speech, int(0.9 * SR)) * 1.6, 0, 1)
    bed = 10 ** ((-24 + (-29 + 24) * mask) / 20)  # -24 dB in pauses, -29 dB under speech
    ducked = music_clean * bed
    vr = np.sqrt(np.maximum(movavg(vo ** 2, int(1.5 * SR)), 0)) + 1e-9
    vr = np.maximum(vr, np.percentile(vr[mask > 0.5], 20))
    mr = np.sqrt(np.maximum(movavg(ducked ** 2, int(1.5 * SR)), 0)) + 1e-9
    over = 20 * np.log10(mr / vr) + 9
    red = movavg(np.where((mask > 0.3) & (over > 0), np.minimum(over, 8) * mask, 0), int(0.6 * SR))
    ducked *= 10 ** (-red / 20)

    # ambience: soft desert wind (own synthesis), a little rain under ayah 49
    rng = np.random.default_rng(7)
    import scipy.signal as ss
    wind = ss.lfilter(*ss.butter(2, [120 / (SR / 2), 900 / (SR / 2)], "band"), rng.standard_normal(n))
    wind *= 0.6 + 0.4 * np.sin(2 * np.pi * np.arange(n) / SR * 0.07) ** 2
    wind *= 10 ** ((-46 - rms_db(wind)) / 20)
    rain = ss.lfilter(*ss.butter(2, [1500 / (SR / 2), 9000 / (SR / 2)], "band"), rng.standard_normal(n))
    rain *= 10 ** ((-44 - rms_db(rain)) / 20)
    rmask = np.zeros(n)
    for blk in timeline:
        if blk.get("scene") in ("rainfall", "raindrop"):
            a, b = int(blk["start"] * SR), int(blk["end"] * SR); rmask[a:b] = 1
    rmask = movavg(rmask, int(2 * SR))
    amb = wind + rain * rmask

    adir = ROOT / "public/episodes" / ep_id / "audio"; adir.mkdir(parents=True, exist_ok=True)
    mix = vo + til + ducked + amb
    for name, y in [("voice", vo), ("tilavet", til), ("music", music_clean * 10 ** (-24 / 20)), ("music_ducked", ducked), ("ambience", amb)]:
        sf.write(adir / f"{name}.wav", np.stack([y, y], 1).astype(np.float32), SR, subtype="FLOAT")
    pre = adir / "premix.wav"
    sf.write(pre, np.stack([mix, mix], 1).astype(np.float32) / max(1, np.max(np.abs(mix)) / 0.9), SR, subtype="FLOAT")
    # two-pass loudness to -14 LUFS, true peak headroom for AAC
    js = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(pre), "-af", "loudnorm=I=-14:TP=-2:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(js[js.rindex("{"): js.rindex("}") + 1])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(pre), "-af",
                    f"loudnorm=I=-14:TP=-2:LRA=11:linear=true:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']},alimiter=limit=0.75:level=false",
                    "-ar", str(SR), "-c:a", "pcm_s16le", str(adir / "mix.wav")], check=True)
    pre.unlink()

    # subtitles: narration sentences; during recitation the Diyanet meal segments
    cues = []
    for blk in timeline:
        if blk["type"] == "narr":
            for s in blk["sentences"]:
                cues += cues_for(s["text"], s["start"], s["end"] + 0.25)
        else:
            ch = blk["chunks"]
            seg_t = {}
            for c in ch:
                seg_t.setdefault(c["meal"], c["start"])
            segs = sorted(seg_t)
            for k, si in enumerate(segs):
                a = seg_t[si]; b = seg_t[segs[k + 1]] if k + 1 < len(segs) else blk["recEnd"]
                cues.append(dict(start=round(a, 3), end=round(b, 3), text=f'[Yûsuf 12:{blk["ayah"]}] ' + blk["mealSegments"][si].strip(), kind="meal"))
    bd = d / "build"; bd.mkdir(exist_ok=True)
    out = dict(durationSec=round(total, 3), tailSec=tail, blocks=timeline, cues=cues)
    (bd / "timeline.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    srt = "\n".join(f"{i + 1}\n{fmt(c['start'])} --> {fmt(c['end'])}\n{c['text']}\n" for i, c in enumerate(cues))
    (bd / f"{ep['slug']}_Turkce.srt").write_text(srt)
    print(f"total {total:.1f}s; narration {sum(len(x) for _, x in voice_parts) / SR:.1f}s; recitation {sum(len(x) for _, x in til_parts) / SR:.1f}s; cues {len(cues)}")
    for blk in timeline:
        print(f'{blk["id"]:4s} {blk["type"]:4s} {blk["start"]:7.2f}-{blk["end"]:7.2f}  {blk["scene"]}')


if __name__ == "__main__":
    main()
