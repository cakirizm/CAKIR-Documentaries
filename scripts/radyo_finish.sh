#!/bin/bash
# Finish one episode: mix -> title card -> 1080p master -> YouTube pack + phone preview -> zip -> cleanup
# Usage: scripts/radyo_finish.sh <NN> "<Title>" "<Next title>" "<summary>" "<ayet>" "<tags>" <Slug>
set -e
cd "$(dirname "$0")/.."
NN=$1; TITLE=$2; NEXT=$3; SUM=$4; AYET=$5; TAGS=$6; SLUG=$7
P=public/episodes/radyo_yusuf; EP=ep$NN
python3 scripts/radyo_mix.py ${EP}_script | tail -1
mkdir -p $P/cover/$EP; node scripts/radyo_overlay.js $((10#$NN)) "$TITLE" "$NEXT" $P/cover/$EP
D=out/youtube_$EP; mkdir -p $D
OV=$P/cover/$EP scripts/radyo_video.sh $P/audio/$EP/mix.wav 15 $D/Hz_Yusuf_Bolum${NN}_${SLUG}_1080p.mp4 > /dev/null
python3 scripts/radyo_youtube_pack.py ${EP}_script $D "$SUM" "$AYET" "$TAGS"
ffmpeg -y -v error -i $D/Hz_Yusuf_Bolum${NN}_${SLUG}_1080p.mp4 -vf "scale=1280:720,fps=15" -c:v libx264 -profile:v main -level 3.1 -crf 32 -maxrate 180k -bufsize 360k -preset slow -tune stillimage -pix_fmt yuv420p -c:a aac -b:a 96k -ac 2 -movflags +faststart out/release_radyo/Hz_Yusuf_Bolum${NN}_onizleme.mp4
(cd out && rm -f Hz_Yusuf_Bolum${NN}_YouTube_Paketi.zip && zip -q -r -0 Hz_Yusuf_Bolum${NN}_YouTube_Paketi.zip youtube_$EP && rm -rf youtube_$EP)
echo "FINISHED $EP"
