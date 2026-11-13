#!/usr/bin/env python3
"""Kamer Suresi Reels: narration (ElevenLabs, cached) + soft music bed -> mix.wav,
timeline.json (scene starts from real voice lengths) and SRT."""
import hashlib, json, subprocess, sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).parent))
from build_narration import ElevenLabs, trim, cap_pauses  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
SR = 44100
VOICE = {"id": "J2FGlQG8Gd7x8uEDt2H8", "model": "eleven_multilingual_v2", "stability": 0.45,
         "similarity": 0.8, "style": 0.3, "speed": 1.0}
SCENES = [
    ("page", "Kur'an'da bir ayet var... Aynı surede tam dört kez tekrar ediliyor. Peki neden?", 6.0),
    ("nuh", "Önce Nuh kavmi anlatılıyor. Uyarılar geldi... ama inanmadılar.", 7.0),
    ("ad", "Sonra Âd kavmi... Güçlerine güvendiler. Sonunda yıkıcı rüzgârla karşılaştılar.", 7.0),
    ("semud", "Ardından Semûd kavmi geliyor. Onlar da uyarıyı reddettiler.", 7.0),
    ("lut", "Ve Lût kavmi... Hikâye değişti, ama sonuç yine ibret oldu.", 7.0),
    ("final", "Dört farklı kavim... Dört farklı hikâye... Ama tek bir mesaj: Öğüt alan yok mu?", 11.0),
]
LEAD, FINAL_HOLD = 0.5, 2.6
CACHE = ROOT / ".cache/tts"
OUT = ROOT / "public/episodes/kamer/audio"
BUILD = ROOT / "episodes/kamer/build"


def tts(text, prev, nxt):
    key = hashlib.sha1(json.dumps([text, VOICE, prev, nxt]).encode()).hexdigest()[:16]
    p = CACHE / f"kamer_{key}.wav"
    if not p.exists():
        x, sr = ElevenLabs(VOICE).say(text, VOICE["id"], VOICE["speed"], prev, nxt)
        sf.write(p, x, sr)
    x, _ = sf.read(p, dtype="float32")
    return cap_pauses(trim(x, SR, -45), SR, 0.55)


def fmt(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def main():
    CACHE.mkdir(parents=True, exist_ok=True); OUT.mkdir(parents=True, exist_ok=True); BUILD.mkdir(parents=True, exist_ok=True)
    clips = [tts(t, SCENES[i - 1][1] if i else "", SCENES[i + 1][1] if i + 1 < len(SCENES) else "") for i, (_, t, _) in enumerate(SCENES)]
    t, scenes = 0.0, []
    for i, ((sid, text, plan), c) in enumerate(zip(SCENES, clips)):
        vd = len(c) / SR
        dur = max(plan if i < len(SCENES) - 1 else 0, LEAD + vd + 0.6) if i < len(SCENES) - 1 else LEAD + vd + FINAL_HOLD
        scenes.append({"id": sid, "start": round(t, 3), "dur": round(dur, 3), "voiceStart": round(t + LEAD, 3), "voiceEnd": round(t + LEAD + vd, 3), "text": text})
        t += dur
    total = t
    n = int(total * SR) + SR
    voice = np.zeros(n, np.float32)
    for s, c in zip(scenes, clips):
        a = int(s["voiceStart"] * SR); voice[a:a + len(c)] += c
    # music bed: calm, low, fades
    mp = ROOT / "public/episodes/alvarenga/music/Long_Note_Four.mp3"
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(mp), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    m = np.frombuffer(pcm, np.float32).copy()
    m = np.tile(m, int(np.ceil(n / len(m))))[:n]
    env = np.abs(voice); w = int(0.3 * SR); cs = np.cumsum(np.r_[0, env]); env = (cs[w:] - cs[:-w]) / w
    env = np.r_[env, np.zeros(n - len(env))]
    speak = env > 0.01
    rms_v = np.sqrt(np.mean(voice[voice != 0] ** 2)); rms_m = np.sqrt(np.mean(m ** 2)) + 1e-9
    g = np.where(speak, 10 ** (-24 / 20), 10 ** (-17 / 20)) * rms_v / rms_m
    k = int(0.4 * SR); cs = np.cumsum(np.r_[0, g]); gs = (cs[k:] - cs[:-k]) / k; g = np.r_[gs, np.full(n - len(gs), gs[-1])]
    fade = np.ones(n); fi = int(1.0 * SR); fo = int(2.5 * SR); end = int(total * SR)
    fade[:fi] = np.linspace(0, 1, fi); fade[end - fo:end] = np.linspace(1, 0, fo); fade[end:] = 0
    music = (m * g * fade).astype(np.float32)
    mix = voice + music
    import pyloudnorm as pyln
    lo = pyln.Meter(SR).integrated_loudness(mix[:end]); mix *= 10 ** ((-14 - lo) / 20)
    pk = np.max(np.abs(mix));  mix = mix / pk * 0.85 if pk > 0.85 else mix
    sf.write(OUT / "voice.wav", voice[:end], SR); sf.write(OUT / "music.wav", music[:end], SR); sf.write(OUT / "mix.wav", mix[:end], SR)
    (BUILD / "timeline.json").write_text(json.dumps({"durationSec": round(total, 3), "scenes": scenes}, ensure_ascii=False, indent=1))
    srt = []
    for i, s in enumerate(scenes, 1):
        srt.append(f"{i}\n{fmt(s['voiceStart'])} --> {fmt(s['voiceEnd'])}\n{s['text']}\n")
    (BUILD / "Kamer_Reels_Turkce.srt").write_text("\n".join(srt))
    print(json.dumps(scenes, ensure_ascii=False, indent=1)); print("total", round(total, 2))


if __name__ == "__main__":
    main()
