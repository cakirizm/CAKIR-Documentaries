#!/usr/bin/env python3
"""ÇAKIR RADYO TİYATROSU — fixed character voice library + cached v3 TTS.
The voice table below is the series' permanent casting: do not change it between episodes."""
import hashlib, json, subprocess, sys, urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".cache/radyo_tts"
SR = 48000

# --- SERIES CASTING (sabit ses kimlikleri) ---------------------------------
VOICES = {
    "ANLATICI": {"id": "J2FGlQG8Gd7x8uEDt2H8", "stability": 0.5, "note": "Tok, sıcak, sade anlatıcı"},
    "YUSUF":    {"id": "TX3LPaxmHKxFdv7VOQHJ", "stability": 0.5, "note": "Genç, berrak, samimi"},
    "YAKUP":    {"id": "JBFqnCBsd6RMkjVDRZzb", "stability": 0.5, "note": "Olgun, derin, şefkatli"},
    "BUNYAMIN": {"id": "FGY2WhTYpPnrIDTdsKH5", "stability": 0.5, "note": "Küçük kardeş (çocuk sesi, dublajdaki gibi kadın sanatçı), neşeli", "prefix": "[young boy, about ten years old] "},
    "KARDES_A": {"id": "iP95p4xoKVk53GoZ742B", "stability": 0.5, "note": "Sivri, alaycı"},
    "KARDES_B": {"id": "bIHbv24MWmeRgasZH58o", "stability": 0.5, "note": "Tereddütlü, yumuşak"},
    "KARDES_C": {"id": "nPczCjzI2devNBz1zQrb", "stability": 0.5, "note": "Otoriter, düşük ton"},
    "KARDES_D": {"id": "onwK4e9ZLuTAKqWW03F9", "stability": 0.5, "note": "Vicdanlı, sakin"},
}
MODEL = "eleven_v3"
TEMPO = 1.05   # gentle pace tightening (pitch preserved)


TAKES_FILE = ROOT / "episodes/radyo_yusuf/takes.json"
TAKES = json.loads(TAKES_FILE.read_text()) if TAKES_FILE.exists() else {}


def tts(who, text, take=None):
    v = VOICES[who]
    text = v.get("prefix", "") + text
    if take is None:
        take = TAKES.get(f"{who}|{text}", 1)
    k = [v["id"], v["stability"], MODEL, text] + ([take] if take > 1 else [])
    key = hashlib.sha1(json.dumps(k).encode()).hexdigest()[:20]
    p = CACHE / f"{who}_{key}.flac"
    if not p.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        body = {"text": text, "model_id": MODEL, "language_code": "tr", "voice_settings": {"stability": v["stability"]}}
        req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{v['id']}?output_format=mp3_44100_128",
                                     data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
        mp3 = urllib.request.urlopen(req, timeout=240).read()
        pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "pipe:0", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], input=mp3, capture_output=True).stdout
        sf.write(p, np.frombuffer(pcm, np.float32), SR, subtype="PCM_24")
    x, _ = sf.read(p, dtype="float32")
    if TEMPO != 1.0:
        x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0", "-af", f"atempo={TEMPO}", "-f", "f32le", "-"], input=x.astype(np.float32).tobytes(), capture_output=True).stdout, np.float32).copy()
    thr = 10 ** (-48 / 20)
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx):
        x = x[max(0, idx[0] - int(0.03 * SR)): idx[-1] + int(0.12 * SR)]
    return x


if __name__ == "__main__":
    sys.path.insert(0, str(ROOT / "episodes/radyo_yusuf"))
    import importlib
    m = importlib.import_module(sys.argv[1] if len(sys.argv) > 1 else "ep01_script")
    lines = [e for e in m.INTRO + m.SCRIPT + m.OUTRO if e[0] == "L"]
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(3) as ex:
        res = list(ex.map(lambda e: len(tts(e[1], e[2])) / SR, lines))
    print(f"{len(lines)} lines, speech {sum(res):.1f}s")
