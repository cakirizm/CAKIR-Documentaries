#!/bin/bash
# Restart-safe final render: silent video in N chunks (each skipped if already
# complete), lossless concat, then the mastered mix muxed once as AAC.
# Usage: scripts/render_chunked.sh CAKIR-Airport public/episodes/airport/audio/mix.wav out/CAKIR_Airport_FINAL.mp4 [chunks]
set -e
ID=$1; AUDIO=$2; OUT=$3; N=${4:-6}
W=out/chunks/$ID; mkdir -p $W
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $AUDIO)
TOTAL=$(python3 -c "import math,json;print(math.ceil(float('$DUR')*30))")
FR=$TOTAL
STEP=$(( (FR + N - 1) / N ))
: > $W/list.txt
for i in $(seq 0 $((N-1))); do
  A=$(( i*STEP )); B=$(( (i+1)*STEP - 1 )); [ $B -ge $FR ] && B=$((FR-1))
  F=$W/part_$i.mp4
  if [ ! -f $F.done ]; then
    echo "chunk $i: frames $A-$B"
    node scripts/render.mjs $ID $F --frames=$A-$B --muted 2>&1 | grep -E "wrote|rror" || true
    [ -f $F ] && touch $F.done
  fi
  echo "file 'part_$i.mp4'" >> $W/list.txt
done
ffmpeg -v error -y -f concat -safe 0 -i $W/list.txt -i $AUDIO -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart $OUT
echo "wrote $OUT"
