#!/usr/bin/env python3
"""TEK BİR BANKNOT · Bölüm 1 — multi-voice narration (ElevenLabs v3, cached),
synthesised sound design, ducked music -> mix.wav + timeline.json + SRT."""
import hashlib, json, subprocess, urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
SR = 44100
CACHE = ROOT / ".cache/tts"
OUT = ROOT / "public/episodes/banknot1/audio"
BUILD = ROOT / "episodes/banknot1/build"
VOICES = {
    "N": ("J2FGlQG8Gd7x8uEDt2H8", 0.5),   # banknote narrator (Turkish male)
    "A": ("onwK4e9ZLuTAKqWW03F9", 0.5),   # TV news anchor (dramatised)
    "J": ("EXAVITQu4vr4xnSDxMaL", 0.5),   # Jewell's quote (Turkish rendering)
}
# (scene, role, text-for-tts, subtitle, gap after)
LINES = [
    ("hook", "N", "[whispers] Ben bir banknotum. [pause] Ve şimdiye kadar beni taşıyan herkes... [dramatic] bir şey kaybetti.", "Ben bir banknotum. Ve şimdiye kadar beni taşıyan herkes… bir şey kaybetti.", 0.7),
    ("date", "N", "Yirmi beş Aralık, iki bin iki. Noel sabahı. Batı Virginia.", "25 Aralık 2002. Noel sabahı. Batı Virginia.", 0.25),
    ("ticket", "N", "Jack Whittaker adında bir müteahhit, bir benzin istasyonundan piyango bileti alıyor.", "Jack Whittaker adında bir müteahhit, bir benzin istasyonundan piyango bileti alıyor.", 0.35),
    ("news", "A", "[excited] Son dakika! Batı Virginia'da tek bir bilet, üç yüz on dört virgül dokuz milyon dolarlık ikramiyeyi kazandı!", "“Son dakika! Batı Virginia'da tek bir bilet 314,9 milyon dolarlık ikramiyeyi kazandı!”", 0.4),
    ("cash", "N", "O güne kadar tek bilete çıkan en büyük ikramiye. Vergilerden sonra elinde... yüz on üç milyon dolar nakit.", "O güne kadar tek bilete çıkan en büyük ikramiye. Vergilerden sonra elinde 113 milyon dolar nakit.", 0.35),
    ("good", "N", "Kiliselere bağış yapıyor. Vakıf kuruyor. Herkes onu seviyor.", "Kiliselere bağış yapıyor. Vakıf kuruyor. Herkes onu seviyor.", 0.2),
    ("turn", "N", "[serious] Ama para... kendi kurallarını koyar.", "Ama para… kendi kurallarını koyar.", 0.5),
    ("robbery", "N", "Bir gece arabası soyuluyor. Çantasında, beş yüz kırk beş bin dolar.", "Bir gece arabası soyuluyor. Çantasında 545 bin dolar.", 0.3),
    ("fall", "N", "Sonra davalar. Skandallar. [sad] Ve en ağırı... çok sevdiği torunu Brandi, iki yıl sonra hayatını kaybediyor.", "Sonra davalar. Skandallar. Ve en ağırı… çok sevdiği torunu Brandi, iki yıl sonra hayatını kaybediyor.", 0.6),
    ("quote", "N", "Karısı Jewell, yıllar sonra şunu söyleyecekti:", "Karısı Jewell yıllar sonra şunu söyleyecekti:", 0.35),
    ("quote", "J", "[sad] Keşke... o bileti yırtıp atsaydım.", "“Keşke o bileti yırtıp atsaydım.”", 0.9),
    ("casino", "N", "Ben mi? Atlantic City'de, bir kumarhane masasında elinden çıktım. O kumarhane sonra ona, bir buçuk milyon dolarlık karşılıksız çek için dava açacaktı.", "Ben mi? Atlantic City'de bir kumarhane masasında elinden çıktım. O kumarhane sonra ona 1,5 milyon dolarlık karşılıksız çek için dava açacaktı.", 0.5),
    ("next", "N", "[whispers] Yeni sahibim, yüz elli sekiz yıllık bir bankada çalışıyordu... [pause] ve o banka, yakında yok olacaktı.", "Yeni sahibim 158 yıllık bir bankada çalışıyordu… ve o banka yakında yok olacaktı.", 0.6),
    ("end", "N", "Tek Bir Banknot. Bölüm iki: Yüz elli sekiz yıl.", "", 1.8),
]


def tts(role, text):
    vid, stab = VOICES[role]
    key = hashlib.sha1(json.dumps([vid, text, stab, "v3"]).encode()).hexdigest()[:16]
    p = CACHE / f"bank_{key}.wav"
    if not p.exists():
        body = {"text": text, "model_id": "eleven_v3", "voice_settings": {"stability": stab}, "language_code": "tr"}
        req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128",
                                     data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
        mp3 = urllib.request.urlopen(req, timeout=180).read()
        pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "pipe:0", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], input=mp3, capture_output=True).stdout
        sf.write(p, np.frombuffer(pcm, np.float32), SR)
    x, _ = sf.read(p, dtype="float32")
    thr = 10 ** (-42 / 20); idx = np.where(np.abs(x) > thr)[0]
    x = x[max(0, idx[0] - 800): idx[-1] + 2000] if len(idx) else x
    return x


def norm_rms(x, db):
    r = np.sqrt(np.mean(x ** 2)) + 1e-9
    return x * (10 ** (db / 20) / r)


def radio(x):
    import scipy.signal as ss
    b, a = ss.butter(4, [350, 3400], btype="band", fs=SR)
    y = ss.lfilter(b, a, x); y = np.tanh(y * 3) / 3
    return y.astype(np.float32)


# ---------------- synthesised SFX ----------------
rng = np.random.default_rng(7)


def env(n, a, d):
    e = np.ones(n); ai = int(a * SR); di = int(d * SR)
    e[:ai] = np.linspace(0, 1, ai) if ai else 1
    if di: e[-di:] *= np.linspace(1, 0, di) ** 2
    return e


def bandnoise(n, lo, hi):
    import scipy.signal as ss
    b, a = ss.butter(2, [lo, hi], btype="band", fs=SR)
    return ss.lfilter(b, a, rng.standard_normal(n))


def sfx_whoosh(d=0.9):
    n = int(d * SR); import scipy.signal as ss
    x = rng.standard_normal(n); out = np.zeros(n); seg = 512
    for i in range(0, n, seg):
        f = 300 + 4000 * np.sin(np.pi * i / n)
        b, a = ss.butter(2, [f * 0.6, min(f * 1.4, 20000)], btype="band", fs=SR)
        out[i:i + seg] = ss.lfilter(b, a, x[i:i + seg])
    return out * np.sin(np.linspace(0, np.pi, n)) ** 2


def sfx_paper(d=0.5):
    n = int(d * SR); x = bandnoise(n, 1500, 9000)
    crack = (rng.random(n) < 0.004) * rng.standard_normal(n) * 4
    return (x + bandnoise(n, 2000, 8000) * 0 + crack) * env(n, 0.02, 0.25)


def sfx_boom(d=2.2):
    n = int(d * SR); t = np.arange(n) / SR
    f = 55 * np.exp(-t * 0.8) + 28
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    return x + bandnoise(n, 40, 200) * np.exp(-t * 4) * 0.5


def sfx_ding():
    n = int(1.6 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1318 * t + 2 * np.sin(2 * np.pi * 3290 * t) * np.exp(-t * 3)) * np.exp(-t * 3.5)
            + 0.5 * np.sin(2 * np.pi * 2637 * t) * np.exp(-t * 5))


def sfx_coins(d=1.6):
    n = int(d * SR); x = np.zeros(n)
    for _ in range(26):
        s = int(rng.random() * (n - SR * 0.2)); f = 2500 + rng.random() * 3500; m = int(0.12 * SR); t = np.arange(m) / SR
        x[s:s + m] += np.sin(2 * np.pi * f * t) * np.exp(-t * 40) * (0.3 + rng.random() * 0.7)
    return x


def sfx_siren(d=3.0):
    n = int(d * SR); t = np.arange(n) / SR
    f = 700 + 250 * np.sign(np.sin(2 * np.pi * 1.2 * t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.6, 1.2) * 0.4


def sfx_static(d=0.5):
    n = int(d * SR); return bandnoise(n, 1000, 7000) * env(n, 0.01, 0.2)


def sfx_heartbeat(d=3.0):
    n = int(d * SR); x = np.zeros(n); t = np.arange(int(0.18 * SR)) / SR
    thump = np.sin(2 * np.pi * 50 * t) * np.exp(-t * 25)
    for s in np.arange(0, d - 0.3, 0.9):
        for o, g in ((0, 1), (0.22, 0.7)):
            i = int((s + o) * SR); x[i:i + len(thump)] += thump * g
    return x


def sfx_casino(d):
    n = int(d * SR); x = bandnoise(n, 200, 2000) * 0.3
    for _ in range(int(d * 2)):
        s = int(rng.random() * (n - SR)); m = int(0.5 * SR); t = np.arange(m) / SR; f = rng.choice([1046, 1318, 1568, 2093])
        x[s:s + m] += np.sin(2 * np.pi * f * t) * np.exp(-t * 6) * 0.6
    return x * env(n, 0.8, 1.0)


def sfx_tear(d=0.7):
    n = int(d * SR); x = bandnoise(n, 800, 6000) * (0.6 + 0.4 * np.sign(np.sin(np.linspace(0, 90, n))))
    return x * env(n, 0.05, 0.2)


def music(name, n):
    p = ROOT / "public/episodes/alvarenga/music" / name
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    m = np.frombuffer(pcm, np.float32).copy()
    return np.tile(m, int(np.ceil(n / len(m))) + 1)[:n]


def fmt(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def main():
    for d in (CACHE, OUT, BUILD): d.mkdir(parents=True, exist_ok=True)
    clips = []
    for scene, role, text, sub, gap in LINES:
        x = tts(role, text)
        x = norm_rms(x, -20 if role != "A" else -21)
        if role == "A": x = radio(x)
        clips.append(x)
    t = 0.6; lines = []
    for (scene, role, text, sub, gap), c in zip(LINES, clips):
        d = len(c) / SR
        lines.append({"scene": scene, "role": role, "start": round(t, 3), "end": round(t + d, 3), "sub": sub})
        t += d + gap
    total = t + 0.4
    n = int(total * SR)
    voice = np.zeros(n, np.float32)
    for l, c in zip(lines, clips):
        a = int(l["start"] * SR); voice[a:a + len(c)] += c[: n - a]
    # scenes: start at first line of scene
    scenes = []
    for l in lines:
        if not scenes or scenes[-1]["id"] != l["scene"]:
            scenes.append({"id": l["scene"], "start": l["start"] - (0.6 if not scenes else 0.25)})
    scenes[0]["start"] = 0
    for i, s in enumerate(scenes):
        s["end"] = scenes[i + 1]["start"] if i + 1 < len(scenes) else total
    S = {s["id"]: s["start"] for s in scenes}
    L = {}
    for l in lines: L.setdefault(l["scene"] + l["role"], l)

    fx = np.zeros(n)

    def put(x, at, db):
        a = int(max(0, at) * SR); x = norm_rms(np.asarray(x, float), db) if db is not None else x
        m = min(len(x), n - a); fx[a:a + m] += x[:m]

    put(sfx_paper(0.6), 0.05, -24); put(sfx_boom(), 0.0, -22)
    put(sfx_whoosh(), S["date"] - 0.35, -26); put(sfx_paper(0.5), S["ticket"] - 0.1, -27)
    put(sfx_static(0.6), S["news"] - 0.15, -24); put(sfx_ding(), L["newsA"]["end"] - 0.6, -22)
    put(sfx_coins(1.8), S["cash"] + 0.3, -27); put(sfx_whoosh(0.7), S["good"] - 0.3, -28)
    put(sfx_boom(2.6), S["turn"] - 0.05, -18)
    put(sfx_siren(3.4), S["robbery"] + 0.2, -30); put(sfx_whoosh(0.8), S["robbery"] - 0.35, -26)
    put(sfx_heartbeat(4.5), S["fall"] + 1.5, -24)
    put(sfx_tear(0.8), L["quoteJ"]["end"] + 0.05, -24)
    put(sfx_casino(L["casinoN"]["end"] - S["casino"] + 0.5), S["casino"] - 0.2, -32); put(sfx_coins(1.2), S["casino"] + 1.0, -30)
    put(sfx_boom(2.4), S["next"] + 0.1, -22); put(sfx_whoosh(1.0), S["end"] - 0.4, -24); put(sfx_boom(2.4), S["end"] + 0.2, -19)

    # music: tension intro -> uplift (win) -> dark (fall) ; ducked under speech
    m1 = music("Lightless_Dawn.mp3", n); m2 = music("Rising.mp3", n); m3 = music("Dark_Times.mp3", n)

    def xf(a, b, fade=1.2):
        g = np.clip((np.arange(n) / SR - a) / fade, 0, 1) * np.clip((b - np.arange(n) / SR) / fade, 0, 1)
        return g
    mus = m1 * xf(-1, S["news"] - 0.2) + m2 * xf(S["news"] - 0.6, S["turn"] + 0.2, 0.8) + m3 * xf(S["turn"], total + 2)
    mus = norm_rms(mus, -20)
    e = np.abs(voice); w = int(0.25 * SR); cs = np.cumsum(np.r_[0, e]); ev = (cs[w:] - cs[:-w]) / w; ev = np.r_[ev, np.zeros(n - len(ev))]
    g = np.where(ev > 0.004, 10 ** (-12 / 20), 10 ** (-4 / 20))
    k = int(0.35 * SR); cs = np.cumsum(np.r_[0, g]); gs = (cs[k:] - cs[:-k]) / k; g = np.r_[gs, np.full(n - len(gs), gs[-1])]
    # music almost silent during the quote moment
    qa, qb = L["quoteN"]["start"], L["quoteJ"]["end"] + 0.8
    g = g * np.where((np.arange(n) / SR > qa) & (np.arange(n) / SR < qb), 0.3, 1.0)
    fade = np.clip(np.arange(n) / SR / 0.8, 0, 1) * np.clip((total - np.arange(n) / SR) / 1.5, 0, 1)
    mus = (mus * g * fade).astype(np.float32)
    mix = voice + mus + fx.astype(np.float32)
    import pyloudnorm as pyln
    lo = pyln.Meter(SR).integrated_loudness(mix); mix = mix * 10 ** ((-14 - lo) / 20)
    mix = np.tanh(mix * 1.2) / 1.2
    for name, arr in (("voice", voice), ("music", mus), ("sfx", fx), ("mix", mix)):
        sf.write(OUT / f"{name}.wav", arr.astype(np.float32), SR)
    (BUILD / "timeline.json").write_text(json.dumps({"durationSec": round(total, 3), "scenes": scenes, "lines": lines}, ensure_ascii=False, indent=1))
    srt = [f"{i}\n{fmt(l['start'])} --> {fmt(l['end'])}\n{l['sub']}\n" for i, l in enumerate([l for l in lines if l['sub']], 1)]
    (BUILD / "Tek_Bir_Banknot_B1.srt").write_text("\n".join(srt))
    for s in scenes: print(f"{s['id']:8} {s['start']:6.2f} -> {s['end']:6.2f}")
    print("total", round(total, 2))


if __name__ == "__main__":
    main()
