#!/bin/bash
S=/tmp/claude-0/-home-user-try-evena/64205151-2ef2-57d7-97dc-a054bebbe157/scratchpad/ss7b
cd $S
for pair in "trame:bl_trame.py:336" "tampons:bl_tampons.py:384" "appel:bl_appel.py:336"; do
  d=${pair%%:*}; rest=${pair#*:}; f=${rest%%:*}; n=${rest##*:}
  echo "=== $d ($n images) $(date +%H:%M:%S)"
  OUT="$S/bl/$d/" W=1920 H=1080 SAMP=6 NF=$n FRAMES=1-$n \
    blender -b -noaudio --factory-startup -P "$f" > /dev/null 2>&1
  echo "  $d -> $(ls $S/bl/$d | wc -l) images  $(date +%H:%M:%S)"
done
echo "RENDUS 3D FINIS $(date +%H:%M:%S)"
