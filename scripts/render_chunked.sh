#!/bin/bash
# Restart-safe final render: silent video chunks (one bundle, finished chunks
# skipped on re-run), lossless concat, then the mastered mix muxed once as AAC.
# Usage: scripts/render_chunked.sh CAKIR-Airport public/episodes/airport/audio/mix.wav out/CAKIR_Airport_FINAL.mp4 [chunks]
set -e
ID=$1; AUDIO=$2; OUT=$3; N=${4:-6}
W=out/chunks/$ID
node scripts/render.mjs $ID $W --chunks=$N
ffmpeg -v error -y -f concat -safe 0 -i $W/list.txt -i $AUDIO -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart $OUT
echo "wrote $OUT"
