#!/usr/bin/env bash
# Boîte à outils vidéo/audio — réinstallation complète et idempotente.
# Testé sur ce conteneur : Ubuntu, Python 3.13, Node 22, ffmpeg 6.1 (libvidstab inclus).
#   bash install.sh
set -uo pipefail
export PATH="/root/.local/bin:/opt/vfx/bin:$PATH"
log(){ printf '\n\033[1m== %s\033[0m\n' "$*"; }

log "uv"
command -v uv >/dev/null || curl -LsSf https://astral.sh/uv/install.sh | sh

log "ffmpeg (doit déjà contenir libvidstab = vid.stab)"
ffmpeg -hide_banner -filters 2>/dev/null | grep -q vidstabtransform \
  && echo "  libvidstab OK" \
  || echo "  !! ffmpeg sans libvidstab : la stabilisation ne marchera pas"

log "CLI isolées (uv tool)"
uv tool install -q "scenedetect[opencv]"                                  # PySceneDetect
uv tool install -q auto-editor                                            # Auto-Editor
uv tool install -q color-matcher                                          # color-matcher
uv tool install -q --with onnxruntime "rembg[cli]"                        # rembg
uv tool install -q --torch-backend=cpu --with numpy demucs                # Demucs

log "venv partagé : librosa + APIs Python"
uv venv -q --python 3.13 /opt/vfx/py
uv pip install -q --python /opt/vfx/py librosa soundfile color-matcher "scenedetect[opencv]"

log "venv torch (Real-ESRGAN + RIFE)"
uv venv -q --python 3.13 /opt/vfx/esrgan
uv pip install -q --python /opt/vfx/esrgan --torch-backend=cpu \
  torch torchvision spandrel pillow numpy opencv-python-headless tqdm

log "poids Real-ESRGAN"
mkdir -p /opt/vfx/models /opt/vfx/bin
R=https://github.com/xinntao/Real-ESRGAN/releases/download
[ -s /opt/vfx/models/RealESRGAN_x4plus.pth ] || \
  curl -sSL -o /opt/vfx/models/RealESRGAN_x4plus.pth "$R/v0.1.0/RealESRGAN_x4plus.pth"
[ -s /opt/vfx/models/realesr-general-x4v3.pth ] || \
  curl -sSL -o /opt/vfx/models/realesr-general-x4v3.pth "$R/v0.2.5.0/realesr-general-x4v3.pth"

log "RIFE HDv3 (archi + poids)"
# Le dépôt officiel livre l'architecture dans le zip Google Drive, pas dans git.
# On prend le même couple archi+poids depuis un Space HuggingFace public.
H=https://huggingface.co/spaces/AItool/RIFE_Interpolation/resolve/main
mkdir -p /opt/vfx/rife/train_log /opt/vfx/rife/model
for f in train_log/IFNet_HDv3.py train_log/RIFE_HDv3.py train_log/flownet.pkl; do
  [ -s "/opt/vfx/rife/$f" ] || curl -sSL -o "/opt/vfx/rife/$f" "$H/$f"
done
for f in model/warplayer.py model/loss.py; do
  [ -s "/opt/vfx/rife/$f" ] || curl -sSL -o "/opt/vfx/rife/$f" "$H/$f"
done
touch /opt/vfx/rife/model/__init__.py /opt/vfx/rife/train_log/__init__.py

log "HyperFrames (CLI + skills Claude)"
npm i -g --silent hyperframes
mkdir -p ~/.claude/skills /opt/vfx/src
[ -d /opt/vfx/src/hyperframes ] || \
  git clone --depth 1 -q https://github.com/heygen-com/hyperframes.git /opt/vfx/src/hyperframes
for d in figma hyperframes hyperframes-cli hyperframes-registry media-use \
         remotion-to-hyperframes reverse-any-video slideshow style-sampling; do
  s=/opt/vfx/src/hyperframes/skills/$d
  [ -f "$s/SKILL.md" ] && { rm -rf ~/.claude/skills/$d; cp -r "$s" ~/.claude/skills/; }
done
# télémétrie activée par défaut ; décommenter pour la couper :
# hyperframes telemetry disable

log "Lemo-Opuscar (66 styles d'animation en code) — skill Claude"
[ -d /opt/vfx/src/lemo-opuscar ] || \
  git clone --depth 1 -q https://github.com/lemomo-ai/lemo-opuscar.git /opt/vfx/src/lemo-opuscar
s=/opt/vfx/src/lemo-opuscar/plugin/skills/lemo-opuscar
[ -f "$s/SKILL.md" ] && { rm -rf ~/.claude/skills/lemo-opuscar; cp -r "$s" ~/.claude/skills/; }
# note : lemo-opuscar recommande ffmpeg 7+, ce conteneur a 6.1 (voir AIDE-MEMOIRE)

log "wrappers CLI"
# realesrgan et rife sont des scripts maison (le paquet pip Real-ESRGAN dépend de
# basicsr, cassé sur Python 3.13 ; RIFE dépend de sk-video, abandonné).
cp -f "$(dirname "$0")/realesrgan" /opt/vfx/bin/realesrgan 2>/dev/null || true
cp -f "$(dirname "$0")/rife"       /opt/vfx/bin/rife       2>/dev/null || true
chmod +x /opt/vfx/bin/* 2>/dev/null || true

log "PATH"
grep -q '/opt/vfx/bin' ~/.bashrc 2>/dev/null || \
  echo 'export PATH="/root/.local/bin:/opt/vfx/bin:$PATH"' >> ~/.bashrc

log "vérification"
for c in scenedetect auto-editor color-matcher rembg demucs hyperframes ffmpeg; do
  printf '  %-14s %s\n' "$c" "$(command -v $c || echo MANQUANT)"
done
printf '  %-14s %s\n' realesrgan "$(command -v realesrgan || echo MANQUANT)"
printf '  %-14s %s\n' rife       "$(command -v rife       || echo MANQUANT)"
/opt/vfx/py/bin/python -I -c "import librosa;print('  librosa       ',librosa.__version__)"
echo
echo "Terminé. Les modèles rembg (~1 Go) se téléchargent au premier appel."
