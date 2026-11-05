# Boîte à outils vidéo / audio — aide-mémoire

Tout est installé et **testé sur de vrais fichiers** dans ce conteneur.
`export PATH="/root/.local/bin:/opt/vfx/bin:$PATH"` (déjà ajouté à `~/.bashrc`).

| Outil | Commande | État |
|---|---|---|
| PySceneDetect | `scenedetect` | ✅ testé |
| Auto-Editor | `auto-editor` | ✅ testé |
| vid.stab | filtres ffmpeg | ✅ testé |
| color-matcher | `color-matcher` | ✅ testé |
| rembg | `rembg` | ✅ testé |
| RIFE | `rife` | ✅ testé |
| Real-ESRGAN | `realesrgan` | ✅ testé |
| Demucs | `demucs` | ✅ testé |
| librosa | `/opt/vfx/py/bin/python` | ✅ testé |
| HyperFrames | `hyperframes` + 9 skills | ✅ rendu testé |
| Lemo-Opuscar | skill `/lemo-opuscar`, 66 styles | ✅ installée |
| FFmpeg | `ffmpeg` | ✅ préinstallé |

---

## Découper / monter

```bash
scenedetect -i film.mp4 detect-adaptive list-scenes split-video
```

```bash
auto-editor rush.mp4 --margin 0.2s --no-open -o monte.mp4
```

## Stabiliser (vid.stab, 2 passes)

```bash
ffmpeg -i bouge.mp4 -vf vidstabdetect=shakiness=5:result=transforms.trf -f null -
```

```bash
ffmpeg -i bouge.mp4 -vf vidstabtransform=input=transforms.trf:smoothing=30,unsharp=5:5:0.8 -c:a copy stable.mp4
```

## Étalonner tous les plans sur une référence

```bash
color-matcher -s plan.png -r reference.png -m mkl
```

Méthodes : `mkl` (rapide, sûr) · `hm-mvgd-hm` (le plus fidèle) · `reinhard` · `mvgd`.

## Détourer sans fond vert

```bash
rembg i photo.png sortie.png
```

```bash
rembg p dossier_in/ dossier_out/
```

## Ralenti / fluidité (RIFE)

```bash
rife -i clip.mp4 -o fluide.mp4 --exp 1
```

```bash
rife -i clip.mp4 -o fluide.mp4 --fps 60 --scale 0.5
```

## Upscale ×4

```bash
realesrgan -i petit.png -o grand.png -n general
```

```bash
realesrgan -i clip.mp4 -o clip_4x.mp4 -n general --outscale 2
```

`general` ≈ 3× plus rapide que `x4plus`, qualité très proche. `--tile 256` borne la RAM.

## Séparer une musique en stems

```bash
demucs -d cpu --mp3 -o stems morceau.wav
```

Sort `bass / drums / other / vocals`. `--two-stems=vocals` pour juste voix/instrumental.

## Trouver le tempo et caler les coupes

```bash
/opt/vfx/py/bin/python -c "
import librosa, numpy as np
y, sr = librosa.load('musique.mp3')
tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
print(float(np.atleast_1d(tempo)[0]), 'BPM')
print(librosa.frames_to_time(beats, sr=sr)[:20])
"
```

## Titres animés en HTML (HyperFrames)

```bash
hyperframes init projet --non-interactive && cd projet && hyperframes render
```

Les 9 skills sont dans `~/.claude/skills/` — je peux les invoquer directement
(`/hyperframes`, `/reverse-any-video`, `/media-use`, `/slideshow`…).

---

## Points d'attention

**Pas de GPU.** Mesures réelles ici (4 vCPU) :

| | vitesse |
|---|---|
| Real-ESRGAN `general` ×4 | ~5 s par image 320×180 |
| Real-ESRGAN `x4plus` ×4 | ~14 s par image 320×180 |
| Demucs | ~10× le temps réel |
| rembg | ~1 s par image |

Concrètement : Real-ESRGAN et RIFE sont utilisables sur des **photos et des plans
courts**, pas sur un film entier. Une minute de vidéo à 24 fps = 1 440 images.

**RIFE : validé.** L'architecture HDv3 n'est pas dans le git officiel (elle est livrée
dans le zip Google Drive) ; elle vient d'un Space HuggingFace public
(`AItool/RIFE_Interpolation`), code audité (aucun appel réseau, shell ou `eval`).
Mesure sur un plan rapide en 360p : écart entre deux images sources 1,026, image
interpolée à 0,315 de la moyenne naïve — bien sous la moitié, donc du vrai flux
optique et pas un fondu. Vitesse : ~0,5 s par image source en 360p.

**Lemo-Opuscar recommande ffmpeg 7+**, ce conteneur a 6.1.1. La plupart des styles
devraient passer ; en cas d'erreur d'encodage, il faut un build statique de ffmpeg 7
(le téléchargement d'un binaire étranger est bloqué par la politique de sécurité,
donc à faire manuellement).

**Deux paquets officiels sont cassés sur Python 3.13**, d'où les wrappers maison :
- `realesrgan` (pip) dépend de `basicsr`, qui utilise une API torchvision supprimée
  → remplacé par **spandrel**, qui charge les mêmes poids `.pth`.
- `inference_video.py` de RIFE dépend de `sk-video` (abandonné, incompatible numpy 2)
  → remplacé par un pipeline ffmpeg.

Les deux wrappers gèrent images **et** vidéo, avec report de la piste audio.

**HyperFrames envoie de la télémétrie par défaut** (anonyme hors connexion au compte) :

```bash
hyperframes telemetry disable
```

**Le conteneur est éphémère.** Pour tout remonter dans une nouvelle session :

```bash
bash /chemin/vers/vfx/install.sh
```

Encombrement : ~3,4 Go (dont 1 Go de modèle rembg, téléchargé au premier appel).
