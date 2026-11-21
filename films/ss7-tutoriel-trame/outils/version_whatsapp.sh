#!/bin/bash
# Version WhatsApp : deux passes x264, cible ~95 Mo, verifiee en SSIM contre le master.
set -e
cd "$(dirname "$0")"
SRC=renders/ss7_tuto.mp4
OUT=renders/SS7_tutoriel_trame_WhatsApp.mp4
CIBLE_MO=95

D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC")
# debit video = (cible - piste audio) / duree
BV=$(python3 -I -c "print(int((($CIBLE_MO*8*1024) - (128*$D/1024*8))/$D))")
echo "duree ${D}s -> debit video ${BV}k"

P="aq-mode=3:aq-strength=1.1:rc-lookahead=60"
ffmpeg -y -v error -i "$SRC" -c:v libx264 -preset slow -b:v ${BV}k \
  -x264-params "$P:pass=1" -pass 1 -passlogfile /tmp/hf2p -an -f mp4 /dev/null
ffmpeg -y -v error -i "$SRC" -c:v libx264 -preset slow -b:v ${BV}k \
  -x264-params "$P:pass=2" -pass 2 -passlogfile /tmp/hf2p \
  -c:a aac -b:a 128k -ac 2 -movflags +faststart "$OUT"
rm -f /tmp/hf2p*

echo "--- resultat ---"
ls -lh "$OUT"
echo "--- SSIM contre le master ---"
ffmpeg -v error -i "$OUT" -i "$SRC" -lavfi "[0:v][1:v]ssim" -f null - 2>&1 | tail -1
