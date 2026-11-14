#!/bin/bash
# ÇAKIR RADYO TİYATROSU — video template: fixed cover foreground + titles, 4 real photos slowly moving behind the tent opening.
# Usage: scripts/radyo_video.sh <audio.wav> <seconds_end_card> <out.mp4>
set -e
cd "$(dirname "$0")/.."
A=$1; ENDCARD=${2:-15}; OUT=$3
P=public/episodes/radyo_yusuf
W=.cache/radyo_video; mkdir -p $W
FPS=25
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$A")
# one 27 s clip per photo: gentle zoom/pan, light grade (realistic, no heavy colour)
i=0
for spec in "bg1_desert:in:0" "bg2_ksar:out:0" "bg3_well:in:right" "bg4_sunset:out:0"; do
  IFS=: read name mode side <<< "$spec"; i=$((i+1))
  if [ "$mode" = in ]; then Z="1+0.07*t/27"; else Z="1.07-0.07*t/27"; fi
  if [ "$side" = right ]; then X="(iw-1420)*0.75"; else X="(iw-1420)/2+sin(t/27*3.14)*20"; fi
  ffmpeg -y -v error -loop 1 -framerate $FPS -t 27 -i $P/media/$name.jpg -vf \
    "scale=1700:1200:force_original_aspect_ratio=increase,crop=1700:1200,scale=w='trunc(1700*($Z)/2)*2':h='trunc(1200*($Z)/2)*2':eval=frame,crop=1420:1000:x='$X':y='(ih-1000)/2',eq=brightness=-0.035:saturation=0.92:contrast=1.03,colorbalance=rm=0.03:bm=-0.03,format=yuv420p" \
    -c:v libx264 -crf 18 -preset veryfast -r $FPS $W/c$i.mp4
done
# cycle with 2 s crossfades, wrapping back to photo 1
ffmpeg -y -v error -i $W/c1.mp4 -i $W/c2.mp4 -i $W/c3.mp4 -i $W/c4.mp4 -i $W/c1.mp4 -filter_complex \
  "[0][1]xfade=transition=fade:duration=2:offset=25[a];[a][2]xfade=transition=fade:duration=2:offset=50[b];[b][3]xfade=transition=fade:duration=2:offset=75[c];[c][4]xfade=transition=fade:duration=2:offset=100,trim=0:102,setpts=PTS-STARTPTS[v]" \
  -map "[v]" -c:v libx264 -crf 18 -preset veryfast $W/cycle.mp4
ffmpeg -y -v error -ss 2 -i $W/cycle.mp4 -t 100 -c:v libx264 -crf 18 -preset veryfast $W/loop.mp4
ffmpeg -y -v error -i $W/cycle.mp4 -t 2 -c:v libx264 -crf 18 -preset veryfast $W/head.mp4
N=$(python3 -c "import math;print(math.ceil(($DUR)/100)+1)")
{ echo "file 'head.mp4'"; for k in $(seq $N); do echo "file 'loop.mp4'"; done; } > $W/list.txt
ENDT=$(python3 -c "print(max(0,$DUR-$ENDCARD))")
ffmpeg -y -v error -f concat -safe 0 -i $W/list.txt -loop 1 -framerate $FPS -i $P/cover/tent_fg.png -loop 1 -framerate $FPS -i $P/cover/overlay.png -loop 1 -framerate $FPS -i $P/cover/overlay_end.png -i "$A" -filter_complex \
  "color=black:s=1920x1080:r=$FPS[base];[base][0]overlay=470:-10:shortest=1[a];[a][1]overlay=shortest=1[b];[b][2]overlay=enable='lt(t,$ENDT)':shortest=1[c];[c][3]overlay=enable='gte(t,$ENDT)':shortest=1,fade=t=in:st=0:d=1.2,fade=t=out:st=$(python3 -c "print($DUR-2)"):d=2,format=yuv420p[v]" \
  -map "[v]" -map 4:a -t $DUR -r $FPS -c:v libx264 -crf 21 -preset medium -tune stillimage -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart "$OUT"
echo "video ok: $OUT"
