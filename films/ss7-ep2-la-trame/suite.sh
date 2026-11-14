#!/bin/bash
S=/tmp/claude-0/-home-user-try-evena/64205151-2ef2-57d7-97dc-a054bebbe157/scratchpad
cd $S/ss7b
# 1 · attendre la fin des rendus 3D
while ! grep -q "RENDUS 3D FINIS" bl.log 2>/dev/null; do sleep 20; done
A=$(ls bl/trame|wc -l); B=$(ls bl/tampons|wc -l); C=$(ls bl/appel|wc -l)
echo "3D : trame $A / tampons $B / appel $C  $(date +%H:%M:%S)"
[ "$A" -eq 336 ] && [ "$B" -eq 384 ] && [ "$C" -eq 336 ] || { echo "ABANDON : compte 3D incorrect"; exit 1; }

# 2 · les 16 848 images du canvas, sur 4 ouvriers
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
[ "$N" -eq 16848 ] || { echo "ABANDON : $N images au lieu de 16848"; exit 1; }

# 3 · encodage
echo "=== ENCODAGE $(date +%H:%M:%S)"
bash $S/ss7b/enc.sh
echo "TOUT EST FINI $(date +%H:%M:%S)"
