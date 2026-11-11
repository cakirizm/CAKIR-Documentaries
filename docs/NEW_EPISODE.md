# Producing a new CAKIR episode

The framework is episode-agnostic. A new film needs **research, a script,
approved media and an episode entry**. Styling, maps, subtitles, audio and
rendering are reused unchanged.

## 1. Research → `episodes/<id>/CAKIR_<Slug>_Sources.md`
List every source (S1, S2…) and a claim table with a status for each claim
(verified / reported / disputed). Distinguish the subject's own account from
documented fact. Never invent dialogue; quote only published words, with
attribution.

## 2. Script → `episodes/<id>/episode.json`
- `segments[]`: one per chapter, each with `chapter`, `sentences[]` (the
  narration, one sentence per entry), `sources[]`, `shots[]` and `overlays[]`.
- `ttsReplacements`: how years, sums and names should be *spoken*. The
  sentences stay as subtitles should read.
- `voice`: TTS engine, voice and speed.

## 3. Media → `episodes/<id>/assets.json`
For Wikimedia Commons add `{"id", "kind": "photo"|"video", "source": "wikimedia",
"commons": "File:…", "file": "episodes/<id>/media/<id>.jpg|mp4", "clip": [start, dur],
"status": "pending"}` and run `scripts/fetch_commons.py <id>`. It fetches
author and licence, rejects non-free licences, and downloads at most 1080p.
For Coverr add `"source": "coverr", "slug", "sourcePage"` and run
`scripts/fetch_coverr.py <id>`. It rejects AI-generated and premium clips.

Then review every file by eye (`/home/user/media_review/strips.sh` makes a
frame strip), choose in-points (`clip`), optional `crop` and `speed` (timelapse),
and write a factual `caption` (place, year; "modern footage, illustrative"
where applicable). Set `status: "approved"`. Re-cut with
`--reclip <id>` or `--reclip all`. Extra cuts of the same source use
`"raw": "<source id>"`.

Rules:
- Never present modern footage as historical. Captions say so on screen.
- Avoid stock people who could be mistaken for the subject.
- No AI-generated footage. No watermarks. No news or film footage without a licence.

## 4. Shot list (in `episode.json`)
A shot starts at sentence `from` (+ optional `offset` seconds) and runs until
the next shot. Types:
- `media` (`asset`, optional `clipStart`, `kenBurns: "in"|"out"`,
  `fit: "framed"` for small or period photos, plus a `fallback` graphic)
- `map` (`view`, `points`, `routes`, `refused`)
- `timeline`, `counter`, `title` (optional `bg` photo), `statement`, `nameCard`,
  `myth`, `routine`, `works`, `filmCard`, `figure`, `identity`, `obituary`,
  `documents`, `board`, `terminal`, `crowd`

Overlays: `stamp`, `lowerThird` (optional `onlyWithAsset`), `quote`
(`text`, `attribution`), `disputed`. Each takes `at`, optional `offset` and `duration`.

New map places and views go in `framework/components/shots/MapScene.tsx`
(`PLACES`, `VIEWS`) or are passed as props.

## 5. Build
```bash
python scripts/build_narration.py <id>        # narration.wav, timeline.json, SRT
python scripts/build_mix.py <id>              # mix.wav at -14 LUFS
python3 scripts/resolve_assets.py <id>
python3 scripts/qc_visuals.py <id>            # must PASS: ≥60% video, ≤15% graphics, no freezes
```
Register the episode in `src/episodes.ts` (copy the airport entries).

## 6. Sample, then final
```bash
python scripts/build_narration.py <id> --only <first_segment> --tag _sample --endcard 0.5
python scripts/build_mix.py <id> --tag _sample
node scripts/render.mjs <Id>-Sample out/<Slug>_Sample.mp4
node scripts/render.mjs <Id> out/<Slug>_FINAL.mp4
node scripts/render.mjs --still <Id>-Thumbnail out/<Slug>_Thumbnail.png --props='{"headline":"…","subline":"…","photo":"…"}'
python3 scripts/export_docs.py <id> && python3 scripts/export_licenses.py <id>
```
Check the final with `ffprobe`, `ffmpeg -af ebur128` and
`ffmpeg -vf freezedetect`, and look at frames from the start, middle and end.

## Channel-wide changes
- Look: `framework/theme.ts` (colours, fonts, `grade`, subtitle size and position)
- Audio: `framework/config/audio.json`
- Render: `framework/config/render.json`
- Logo: `Logo` in `framework/components/overlays/Overlays.tsx`
