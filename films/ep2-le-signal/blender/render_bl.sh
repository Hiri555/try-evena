set -u
S=/tmp/claude-0/-home-user-try-evena/64205151-2ef2-57d7-97dc-a054bebbe157/scratchpad
cd $S/ep2
run(){ echo "=== $1 $(date +%T)"; OUT="$S/ep2/bl/$1/" W=1920 H=1080 SAMP=28 NF=144 FRAMES=1-144 \
  blender -b -noaudio --factory-startup -P "$2" 2>&1 | grep -cE "^Saved:" ; }
run cross bl_crossing.py
run polar bl_polar.py
run rep   bl_repeteur.py
echo "FINI $(date +%T)"
