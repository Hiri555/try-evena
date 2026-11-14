#!/bin/bash
S=/tmp/claude-0/-home-user-try-evena/64205151-2ef2-57d7-97dc-a054bebbe157/scratchpad/ss7
for d in mic res pile; do
  echo "=== $d $(date +%H:%M:%S)"
  ffmpeg -v error -y -framerate 24 -i $S/bl/$d/%04d.png \
    -c:v libx264 -crf 8 -preset fast -pix_fmt yuv444p $S/bl2/$d.src.mp4
  /opt/vfx/bin/rife -i $S/bl2/$d.src.mp4 -o $S/bl2/$d.x2.mp4 --exp 1 --scale 1.0 \
    --threads 4 --crf 10 --preset fast > $S/bl2/$d.log 2>&1
  ffmpeg -v error -y -i $S/bl2/$d.x2.mp4 -qscale:v 2 $S/bl2/$d/%04d.jpg
  echo "  $d -> $(ls $S/bl2/$d | wc -l) images  $(date +%H:%M:%S)"
  rm -f $S/bl2/$d.src.mp4
done
echo "INTERPOLATION FINIE $(date +%H:%M:%S)"
