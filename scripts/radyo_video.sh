#!/bin/bash
# ÇAKIR RADYO TİYATROSU — video template (Asr-ı Saadet style title card):
# full-frame real photos, softened + tinted + textured, dissolving very slowly behind a fixed title card.
# Usage: scripts/radyo_video.sh <audio.wav> <seconds_end_card> <out.mp4>
set -e
cd "$(dirname "$0")/.."
A=$1; ENDCARD=${2:-15}; OUT=$3
P=public/episodes/radyo_yusuf
W=.cache/radyo_video_$$; rm -rf $W; mkdir -p $W
FPS=25; SEG=28; XF=4
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$A")
GRADE="gblur=sigma=3,eq=saturation=0.62:contrast=0.92:brightness=-0.02,colorbalance=rs=0.10:bs=0.14:rm=0.06:bm=0.05:rh=0.06:gh=-0.02:bh=0.02"
i=0
for name in bg1_desert bg2_ksar bg3_well bg4_sunset; do
  i=$((i+1))
  if [ $((i % 2)) = 1 ]; then Z="1+0.03*t/$SEG"; else Z="1.03-0.03*t/$SEG"; fi
  ffmpeg -y -v error -loop 1 -framerate $FPS -t $SEG -i $P/media/$name.jpg -vf \
    "scale=1980:1114:force_original_aspect_ratio=increase,crop=1980:1114,$GRADE,scale=w='trunc(1980*($Z)/2)*2':h='trunc(1114*($Z)/2)*2':eval=frame,crop=1920:1080,format=yuv420p" \
    -c:v libx264 -crf 18 -preset veryfast -r $FPS $W/c$i.mp4
done
O1=$((SEG-XF)); O2=$((2*SEG-2*XF)); O3=$((3*SEG-3*XF)); O4=$((4*SEG-4*XF)); CYC=$((O4+XF))
ffmpeg -y -v error -i $W/c1.mp4 -i $W/c2.mp4 -i $W/c3.mp4 -i $W/c4.mp4 -i $W/c1.mp4 -filter_complex \
  "[0][1]xfade=duration=$XF:offset=$O1[a];[a][2]xfade=duration=$XF:offset=$O2[b];[b][3]xfade=duration=$XF:offset=$O3[c];[c][4]xfade=duration=$XF:offset=$O4,trim=0:$CYC,setpts=PTS-STARTPTS[v]" \
  -map "[v]" -c:v libx264 -crf 18 -preset veryfast $W/cycle.mp4
ffmpeg -y -v error -ss $XF -i $W/cycle.mp4 -t $O4 -c:v libx264 -crf 18 -preset veryfast $W/loop.mp4
ffmpeg -y -v error -i $W/cycle.mp4 -t $XF -c:v libx264 -crf 18 -preset veryfast $W/head.mp4
N=$(python3 -c "import math;print(math.ceil(($DUR)/$O4)+1)")
{ echo "file 'head.mp4'"; for k in $(seq $N); do echo "file 'loop.mp4'"; done; } > $W/list.txt
ENDT=$(python3 -c "print(max(0,$DUR-$ENDCARD))")
ffmpeg -y -v error -f concat -safe 0 -i $W/list.txt -loop 1 -framerate $FPS -i $P/cover/style.png -loop 1 -framerate $FPS -i ${OV:-$P/cover}/overlay.png -loop 1 -framerate $FPS -i ${OV:-$P/cover}/overlay_end.png -i "$A" -filter_complex \
  "[0][1]overlay=shortest=1[b];[b][2]overlay=enable='lt(t,$ENDT)':shortest=1[c];[c][3]overlay=enable='gte(t,$ENDT)':shortest=1,fade=t=in:st=0:d=1.5,fade=t=out:st=$(python3 -c "print($DUR-2)"):d=2,format=yuv420p[v]" \
  -map "[v]" -map 4:a -t $DUR -r $FPS -c:v libx264 -crf ${VCRF:-18} -maxrate ${VMAX:-8M} -bufsize 16M -preset slow -tune stillimage -profile:v high -c:a aac -b:a ${ABR:-320k} -ar 48000 -ac 2 -movflags +faststart "$OUT"
rm -rf $W
echo "video ok: $OUT"
