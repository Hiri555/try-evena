#!/bin/bash
S=/tmp/claude-0/-home-user-try-evena/64205151-2ef2-57d7-97dc-a054bebbe157/scratchpad
echo "=== CANVAS $(date +%H:%M:%S)"
rm -rf $S/frames5; mkdir -p $S/frames5
cd $S/render5
export BLCOUNTS='{"trame":336,"tampons":384,"appel":336}'
for i in 0 1 2 3; do
  FROM=$(( i * 4212 )) TO=$(( (i+1) * 4212 )) node shoot.mjs > $S/ss7b/canvas$i.log 2>&1 &
done
wait
N=$(ls $S/frames5 | wc -l)
echo "canvas : $N images  $(date +%H:%M:%S)"
[ "$N" -eq 16848 ] || { echo "ABANDON : $N images"; exit 1; }
echo "=== ENCODAGE $(date +%H:%M:%S)"
bash $S/ss7b/enc.sh
echo "TOUT EST FINI $(date +%H:%M:%S)"
