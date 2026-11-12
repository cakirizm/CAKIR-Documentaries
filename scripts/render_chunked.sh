#!/bin/bash
# Restart-safe final render: silent video chunks (one bundle, finished chunks
# skipped on re-run), lossless concat, then the mix is mastered (two-pass
# loudnorm to -14 LUFS with true-peak headroom for the AAC encoder) and muxed
# once as AAC 256k. The encoded true peak is verified and trimmed if needed.
# Usage: scripts/render_chunked.sh CAKIR-Airport public/episodes/airport/audio/mix.wav out/CAKIR_Airport_FINAL.mp4 [chunks]
set -e
ID=$1; AUDIO=$2; OUT=$3; N=${4:-6}
W=out/chunks/$ID
node scripts/render.mjs $ID $W --chunks=$N

M=$W/master.wav
J=$(ffmpeg -hide_banner -nostats -i $AUDIO -af loudnorm=I=-14:TP=-2.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i $AUDIO -af "loudnorm=I=-14:TP=-2.5:LRA=11:linear=true:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset),alimiter=limit=0.708:level=false" -ar 48000 $M

trim=0
for attempt in 1 2 3; do
	ffmpeg -v error -y -f concat -safe 0 -i $W/list.txt -i $M -map 0:v -map 1:a -c:v copy -af "volume=${trim}dB" -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart $OUT
	TP=$(ffmpeg -hide_banner -nostats -i $OUT -map 0:a -af ebur128=peak=true -f null - 2>&1 | grep -A1 "True peak" | tail -1 | awk '{print $2}')
	echo "master true peak ${TP} dBTP (trim ${trim} dB)"
	if python3 -c "import sys; sys.exit(0 if float('$TP') <= -1.0 else 1)"; then break; fi
	trim=$(python3 -c "print(round($trim - (float('$TP') + 1.2), 2))")
done
echo "wrote $OUT"
