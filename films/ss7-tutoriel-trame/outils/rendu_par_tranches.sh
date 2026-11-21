#!/bin/bash
# Rendu par tranches : borne l'espace disque occupe par les frames intermediaires.
# Chaque tranche est rendue seule, muette, puis la bande son complete est remuxee.
set -e
cd "$(dirname "$0")"
mkdir -p tr
BORNES=(0 90 180 270 360 439)
LISTE=tr/liste.txt
: > "$LISTE"
for ((i=0; i<${#BORNES[@]}-1; i++)); do
  A=${BORNES[$i]}; B=${BORNES[$((i+1))]}
  OUT="tr/part$i.mp4"
  if [ -s "$OUT" ]; then echo "tranche $i deja faite"; else
    echo "=== tranche $i : ${A}s -> ${B}s ==="
    npx hyperframes render --output "$OUT" --start "$A" --end "$B" --quiet
    # les frames intermediaires partent avec le dossier de travail
    rm -rf renders/work-* renders/.hf-segments 2>/dev/null || true
    df -h / | tail -1
  fi
  echo "file '$(pwd)/$OUT'" >> "$LISTE"
done
echo "=== raccord ==="
ffmpeg -y -v error -f concat -safe 0 -i "$LISTE" -an -c:v copy tr/video.mp4
ffmpeg -y -v error -i tr/video.mp4 -i assets/audio/mix.mp3 \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest \
  -movflags +faststart renders/ss7_tuto.mp4
ffprobe -v error -show_entries format=duration,size -of default=nw=1 renders/ss7_tuto.mp4
