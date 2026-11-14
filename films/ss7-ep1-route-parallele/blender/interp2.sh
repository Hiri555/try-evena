#!/bin/bash
S=/tmp/claude-0/-home-user-try-evena/64205151-2ef2-57d7-97dc-a054bebbe157/scratchpad/ss7
while pgrep -f interp.sh >/dev/null; do sleep 20; done
echo "=== pile, deuxième passe $(date +%H:%M:%S)"
/opt/vfx/bin/rife -i $S/bl2/pile.x2.mp4 -o $S/bl2/pile.x4.mp4 --exp 1 --scale 1.0 \
  --threads 4 --crf 10 --preset fast > $S/bl2/pile2.log 2>&1
rm -f $S/bl2/pile/*.jpg
ffmpeg -v error -y -i $S/bl2/pile.x4.mp4 -qscale:v 2 $S/bl2/pile/%04d.jpg
echo "pile -> $(ls $S/bl2/pile | wc -l) images  $(date +%H:%M:%S)"
