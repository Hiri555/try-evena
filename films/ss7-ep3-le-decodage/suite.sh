#!/bin/bash
S=/tmp/claude-0/-home-user-try-evena/64205151-2ef2-57d7-97dc-a054bebbe157/scratchpad
echo "=== CANVAS $(date +%H:%M:%S)"
rm -rf $S/frames6; mkdir -p $S/frames6
cd $S/render6
export BLCOUNTS='{"cahier":190,"rondpoint":190}'
for i in 0 1 2 3; do
  FROM=$(( i * 3099 )) TO=$(( i==3 ? 12393 : (i+1)*3099 )) node shoot.mjs > $S/ss7c/canvas$i.log 2>&1 &
done
wait
N=$(ls $S/frames6 | wc -l); echo "canvas : $N images  $(date +%H:%M:%S)"
[ "$N" -eq 12393 ] || { echo "ABANDON : $N images"; exit 1; }
echo "=== ENCODAGE $(date +%H:%M:%S)"
bash $S/ss7c/enc.sh
echo "TOUT EST FINI $(date +%H:%M:%S)"
