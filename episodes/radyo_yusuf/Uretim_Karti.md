# Hz. Yusuf – Bir Rüyanın İzinde · Üretim Kartı (Bölüm 01)

## Sabit karakter sesleri (bütün bölümlerde aynı kalır)
Model: ElevenLabs eleven_v3, dil: tr, stability 0.5, tempo ×1.05.

| Karakter | Ses ID | Not |
|---|---|---|
| ANLATICI | `J2FGlQG8Gd7x8uEDt2H8` | Tok, sıcak, sade anlatıcı |
| YUSUF | `TX3LPaxmHKxFdv7VOQHJ` | Genç, berrak, samimi |
| YAKUP | `JBFqnCBsd6RMkjVDRZzb` | Olgun, derin, şefkatli |
| BUNYAMIN | `SOYHLrjzK2X1ezoPC6cr` | Küçük kardeş, neşeli, ince |
| KARDES_A | `iP95p4xoKVk53GoZ742B` | Sivri, alaycı |
| KARDES_B | `bIHbv24MWmeRgasZH58o` | Tereddütlü, yumuşak |
| KARDES_C | `nPczCjzI2devNBz1zQrb` | Otoriter, düşük ton |
| KARDES_D | `onwK4e9ZLuTAKqWW03F9` | Vicdanlı, sakin |

## Arka plan fotoğrafları (gerçek fotoğraf, Wikimedia Commons)
Fotoğraflar yalnızca atmosfer içindir; Hz. Yusuf döneminden değildir.

- bg1_desert: Jordan, Wadi Rum Desert, Infinite Spaces.jpg — Vyacheslav Argenberg — CC BY 4.0 — https://commons.wikimedia.org/wiki/File:Jordan,_Wadi_Rum_Desert,_Infinite_Spaces.jpg
- bg2_ksar: Ksar Aït Benhaddou, Marocco (أيت بن حدو، المغرب, ⴰⵢⵜ ⵃⴰⴷⴷⵓ).jpg — Petar Milošević — CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File%3AKsar_A%C3%AFt_Benhaddou%2C_Marocco_%28%D8%A3%D9%8A%D8%AA_%D8%A8%D9%86_%D8%AD%D8%AF%D9%88%D8%8C_%D8%A7%D9%84%D9%85%D8%BA%D8%B1%D8%A8%2C_%E2%B4%B0%E2%B5%A2%E2%B5%9C_%E2%B5%83%E2%B4%B0%E2%B4%B7%E2%B4%B7%E2%B5%93%29.jpg
- bg3_well: PikiWiki Israel 33680 Well and trough in Tel Beer Sheva.JPG — Dr. Avishai Teicher — CC BY 2.5 — https://commons.wikimedia.org/wiki/File%3APikiWiki_Israel_33680_Well_and_trough_in_Tel_Beer_Sheva.JPG
- bg4_sunset: Wadi Rum at Sunset.jpg — Dos332 — CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File%3AWadi_Rum_at_Sunset.jpg

## Ses kayıtları (efekt kaynakları, Wikimedia Commons)

- crickets: Field cricket unedited.ogg — Thatcher — CC BY-SA 3.0
- sheep1: Sheep bleating.ogg — earthcalling — Public domain
- sheep2: Sheep bleat.ogg — Eviatar Bach — CC0
- goats: Herd of goats bleating.ogg — stephan — Public domain
- footstep: Footstep on Gravel (Gravity Sound).mp3 — Gravity Sound — CC BY 4.0
- door: LL-Q1860 (eng)-Knites-Sound recording. Door creaks.wav — Speaker: Knites Recorder: Knites — CC0
- birds2: Birds singing in Fribourg 01.ogg — Martin Thurnherr — CC BY-SA 4.0

Diğer efektler (rüzgâr, ateş, kumaş, nefes, kapı vurma, taş) ve tüm müzik özgün olarak üretildi.

## Müzik
Özgün tema, Hicaz makamı (ney, ud, yaylılar, bendir). Dosyalar: Jenerik_Giris_Muzik.wav, Jenerik_Kapanis_Muzik.wav, Gecis_Muzik.wav — sonraki bölümlerde aynen kullanılacak.

## Kapak
Kullanıcının kapak görseli (çadır) ön plan katmanı olarak korunur; çadır açıklığına gerçek fotoğraflar yerleşir. Yazılar ayrı katmandır; yeni bölümde yalnızca bölüm numarası ve adı değişir.

## Yeni bölüm üretimi
1. episodes/radyo_yusuf/ep02_script.py yaz (ep01 biçiminde).
2. python3 scripts/radyo_tts.py ep02_script
3. python3 scripts/radyo_mix.py ep02_script
4. node scripts/radyo_overlay.js 2 "Karanlık Kuyu" public/episodes/radyo_yusuf/cover
5. scripts/radyo_video.sh public/episodes/radyo_yusuf/audio/ep02/mix.wav 15 out/....mp4