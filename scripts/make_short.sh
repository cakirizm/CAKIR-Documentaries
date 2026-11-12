#!/bin/bash
# Vertical 1080x1920 Short from a finished film: two cuts (A and B, seconds),
# crossfaded; the 16:9 frame (centre 4:3 crop) sits over a blurred fill with a
# headline above and the channel name below.
# Usage: scripts/make_short.sh in.mp4 out.mp4 A_START A_END B_START B_END "LINE 1" "LINE 2"
set -e
IN=$1; OUT=$2; AS=$3; AE=$4; BS=$5; BE=$6; L1=$7; L2=$8
FB=/usr/share/fonts/opentype/inter/Inter-Bold.otf; FM=/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf
AD=$(python3 -c "print($AE-$AS)")
ffmpeg -v error -y -ss $AS -t $(python3 -c "print($AE-$AS)") -i $IN -ss $BS -t $(python3 -c "print($BE-$BS)") -i $IN -filter_complex "
[0:v]fps=30,format=yuv420p,setpts=PTS-STARTPTS[a];[1:v]fps=30,format=yuv420p,setpts=PTS-STARTPTS[b];
[a][b]xfade=transition=fade:duration=0.6:offset=$(python3 -c "print($AD-0.6)")[v];
[0:a]asetpts=PTS-STARTPTS[aa];[1:a]asetpts=PTS-STARTPTS[ba];[aa][ba]acrossfade=d=0.6[au];
[v]split[v1][v2];
[v1]scale=-2:1920,crop=1080:1920,boxblur=30:3,eq=brightness=-0.18[bg];
[v2]crop=1440:1080,scale=1080:810[fg];
[bg][fg]overlay=0:520,
drawtext=fontfile=$FB:text='$L1':fontsize=118:fontcolor=white:x=(w-tw)/2:y=250,
drawtext=fontfile=$FB:text='$L2':fontsize=118:fontcolor=0xE8A33D:x=(w-tw)/2:y=380,
drawtext=fontfile=$FM:text='CAKIR  ·  Real Stories. Beyond the Headlines.':fontsize=34:fontcolor=white@0.85:x=(w-tw)/2:y=1440[out]" \
 -map "[out]" -map "[au]" -c:v libx264 -crf 19 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart $OUT
echo "wrote $OUT"
