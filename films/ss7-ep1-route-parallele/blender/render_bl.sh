#!/bin/bash
S=/tmp/claude-0/-home-user-try-evena/64205151-2ef2-57d7-97dc-a054bebbe157/scratchpad/ss7
cd $S
for pair in "mic:bl_mic.py" "res:bl_reseaux.py" "pile:bl_pile.py"; do
  d=${pair%%:*}; f=${pair##*:}
  echo "=== $d $(date +%H:%M:%S)"
  OUT="$S/bl/$d/" W=1920 H=1080 SAMP=24 NF=144 FRAMES=1-144 \
    blender -b -noaudio --factory-startup -P "$f" > /dev/null 2>&1
  ls $S/bl/$d | wc -l
done
echo "FINI $(date +%H:%M:%S)"
