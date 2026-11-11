# CAKIR Documentaries

Production system for the CAKIR YouTube channel: footage-led documentaries
with researched narration, synthetic voice-over, original score, burned-in
subtitles and full licence tracking. Built on Remotion (React) and FFmpeg.

First episode: **The Man Who Lived in an Airport for 18 Years**
(Mehran Karimi Nasseri), `episodes/airport/`.

## Layout

```
framework/                 shared by every episode
  theme.ts                 colours, fonts, grade, subtitle style, safe areas
  config/audio.json        narration pacing, ducking, loudness target (-14 LUFS)
  config/render.json       1920x1080, 30 fps, H.264 CRF, browser, concurrency
  components/Film.tsx      assembles an episode: shots, overlays, subtitles, audio
  components/shots/        Media (photo/video, Ken Burns, framed prints, credits),
                           MapScene, Timeline, Counter, Board, Terminal, Typography…
  components/overlays/     Stamp, LowerThird, ChapterLabel, Quote, Disputed,
                           Logo, LogoBug, FilmLook (grain/vignette), EndCard
  components/Thumbnail.tsx YouTube thumbnail template
episodes/<id>/
  episode.json             script (sentences), chapters, shot list, overlays, sources
  assets.json              asset register: source, author, licence, caption, clip
  CAKIR_<Slug>_Sources.md  research file
  build/                   generated: timeline.json, SRT, script, CSV, metadata
scripts/
  build_narration.py       TTS per sentence → narration.wav, timeline.json, SRT
  build_mix.py             original score + ambience + ducking + loudnorm → mix.wav
  fetch_commons.py         Wikimedia Commons fetch with licence capture & clip cuts
  fetch_coverr.py          Coverr stock fetch (rejects AI-generated / premium)
  resolve_assets.py        only approved assets with files reach the renderer
  qc_visuals.py            real-video / photo / graphics share + frozen-frame check
  export_docs.py, export_licenses.py
  render.mjs               render video or still with framework/config/render.json
src/                       Remotion entry, composition registry (src/episodes.ts)
```

Media files, audio and renders are **not committed** (licensing and size);
they are re-created by the scripts. See `docs/NEW_EPISODE.md`.

## Requirements

Node 20+, FFmpeg, Python 3.11+, Chromium (or Remotion's own browser).
Python venv with `kokoro-onnx soundfile numpy scipy pillow`, plus the Kokoro
model files `kokoro-v1.0.onnx` and `voices-v1.0.bin` (GitHub release
`thewh1teagle/kokoro-onnx` model-files-v1.0). Set `CAKIR_TTS_DIR` to their folder.

## Rebuild the airport episode from scratch

```bash
npm ci
python3 -I scripts/fetch_commons.py airport && python3 -I scripts/fetch_coverr.py airport
python3 -I scripts/fetch_commons.py airport --reclip all
python scripts/build_narration.py airport && python scripts/build_mix.py airport
python3 scripts/resolve_assets.py airport && python3 scripts/qc_visuals.py airport
node scripts/render.mjs CAKIR-Airport out/CAKIR_Airport_FINAL.mp4
```

Draft render: add `--draft` (half resolution, fast preset).
