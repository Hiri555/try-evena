#!/bin/bash
S=/tmp/claude-0/-home-user-try-evena/64205151-2ef2-57d7-97dc-a054bebbe157/scratchpad/ss7
cd $S
# on laisse « mic » finir, puis on lance les deux autres en parallèle, moins d'échantillons
while [ "$(ls $S/bl/mic | wc -l)" -lt 144 ]; do sleep 20; done
pkill -f render_bl.sh 2>/dev/null; sleep 3; pkill -x blender 2>/dev/null; sleep 2
echo "=== mic fini, on lance res + pile $(date +%H:%M:%S)"
OUT="$S/bl/res/"  W=1920 H=1080 SAMP=20 NF=144 FRAMES=1-144 \
  blender -b -noaudio --factory-startup -P bl_reseaux.py > /dev/null 2>&1 &
P1=$!
OUT="$S/bl/pile/" W=1920 H=1080 SAMP=20 NF=144 FRAMES=1-144 \
  blender -b -noaudio --factory-startup -P bl_pile.py > /dev/null 2>&1 &
P2=$!
wait $P1 $P2
echo "FINI $(date +%H:%M:%S)  res=$(ls $S/bl/res|wc -l) pile=$(ls $S/bl/pile|wc -l)"
