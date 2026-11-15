#!/usr/bin/env python3
"""Build the YouTube text pack (title, description with chapters, credits, tags), thumbnail and SRT for an episode.
Usage: python scripts/radyo_youtube_pack.py <ep_module> <outdir> "<summary>" "<ayet aralığı>" "<extra tags>" """
import importlib, json, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
mod, out, summary, ayet, tags = sys.argv[1:6]
sys.path.insert(0, str(ROOT / "episodes/radyo_yusuf"))
E = importlib.import_module(mod); n = E.EPISODE["no"]; tag = mod.split("_")[0]
out = Path(out); out.mkdir(parents=True, exist_ok=True)
P = ROOT / "public/episodes/radyo_yusuf"
t = json.loads((P / f"audio/{tag}/timeline.json").read_text())
reg = json.loads((ROOT / "episodes/radyo_yusuf/assets.json").read_text())
f = lambda s: f"{int(s // 60):02}:{int(s % 60):02}"
ch = ["00:00 Giriş"] + [f"{f(s['start'])} {s['title']}" for s in t["scenes"]] + [f"{f(t['outroStart'])} Kapanış"]
ph = [a for a in reg if a["kind"] == "photo" and a["status"] == "review"]
au = [a for a in reg if a["kind"] == "audio" and a["status"] == "review"]
cred = lambda L: "\n".join(f"• {a['commons'][5:].rsplit('.', 1)[0]} — {(a.get('author') or 'Wikimedia Commons').strip()[:60]} — {a['license']}" for a in L)
txt = f"""BAŞLIK:
Hz. Yusuf – Bir Rüyanın İzinde | {n}. Bölüm: {E.EPISODE['title']} | Çakır Radyo Tiyatrosu

AÇIKLAMA:
{summary}
Çakır Radyo Tiyatrosu sunar: Hz. Yusuf – Bir Rüyanın İzinde, {n}. Bölüm: {E.EPISODE['title']}.

Gözlerinizi kapatın, dinleyin.

BÖLÜMLER
""" + "\n".join(ch) + f"""

Gelecek bölüm: {E.EPISODE['next']}

Ana kaynak: Kur'an-ı Kerim, Yusuf Suresi {ayet}. ayetler. Bu yapım Kur'an'a dayalı dramatik bir uyarlamadır; gündelik konuşmalar ve sahne ayrıntıları kurgudur, tarihî konuşma olduğu iddia edilmez.

—
Seslendirme: yapay zekâ ses teknolojisi (ElevenLabs).
Müzik: Çakır Radyo Tiyatrosu özgün teması.
Arka plan fotoğrafları (atmosfer amaçlıdır, dönemden değildir) — Wikimedia Commons:
{cred(ph)}
Ses efektleri (bir kısmı) — Wikimedia Commons:
{cred(au)}

#HzYusuf #RadyoTiyatrosu #YusufSuresi #ÇakırRadyoTiyatrosu #Kıssa

ETİKETLER:
Hz Yusuf, radyo tiyatrosu, Yusuf suresi, Hz Yakup, peygamber kıssaları, sesli hikaye, Çakır Radyo Tiyatrosu, {tags}
"""
(out / "YouTube_Baslik_Aciklama.txt").write_text(txt)
(out / f"Hz_Yusuf_Bolum{n:02}_Altyazi_tr.srt").write_text((P / f"audio/{tag}/altyazi.srt").read_text())
ov = P / f"cover/{tag}/overlay.png"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(P / "media/bg2_ksar.jpg"), "-i", str(P / "cover/style.png"), "-i", str(ov), "-filter_complex",
                "[0]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,gblur=sigma=3,eq=saturation=0.62:contrast=0.92:brightness=-0.02,colorbalance=rs=0.10:bs=0.14:rm=0.06:bm=0.05:rh=0.06:gh=-0.02:bh=0.02[b];[b][1]overlay[c];[c][2]overlay,scale=1280:720",
                "-frames:v", "1", "-q:v", "2", str(out / "Kapak_Thumbnail_1280x720.jpg")], check=True)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(P / f"audio/{tag}/mix.wav"), "-c:a", "libmp3lame", "-b:a", "320k", str(out / f"Hz_Yusuf_Bolum{n:02}_Ses_320k.mp3")], check=True)
print("pack ok", out)
