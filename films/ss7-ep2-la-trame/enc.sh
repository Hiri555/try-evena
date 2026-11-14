#!/bin/bash
set -e
S=/tmp/claude-0/-home-user-try-evena/64205151-2ef2-57d7-97dc-a054bebbe157/scratchpad
F=$S/frames5
O=$S/ss7b/out
T=$S/ep2/ttf
mkdir -p $O

echo "=== MASTER (CRF 17)"
ffmpeg -y -loglevel error -framerate 24 -i $F/%05d.jpg -i $S/ss7b/audio/mix.wav \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -profile:v high -level 4.1 \
  -x264-params "keyint=48:min-keyint=24" -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest \
  $O/SS7_Ep2_MASTER_1080p.mp4

echo "=== WEB (CRF 21)"
ffmpeg -y -loglevel error -framerate 24 -i $F/%05d.jpg -i $S/ss7b/audio/mix.wav \
  -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -profile:v high -level 4.0 \
  -x264-params "keyint=48:min-keyint=24" -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest \
  $O/SS7_Ep2_WEB_1080p.mp4

echo "=== WEB sous-titré"
ffmpeg -y -loglevel error -i $O/SS7_Ep2_WEB_1080p.mp4 \
  -vf "subtitles=$O/SS7_Ep2_FR.srt:fontsdir=$T:force_style='FontName=IBM Plex Sans SemiBold,FontSize=21,PrimaryColour=&H00332B1C,OutlineColour=&H00D2E4ED,BorderStyle=1,Outline=2,Shadow=0,MarginV=52,Alignment=2'" \
  -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -c:a copy -movflags +faststart \
  $O/SS7_Ep2_WEB_1080p_SOUSTITRE.mp4

echo "=== affiche"
cp $F/00340.jpg $O/SS7_Ep2_poster.jpg

ls -la $O
