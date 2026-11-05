# Épisode 2 — « Le signal »

Sources de fabrication du film **TÉLÉCOMS PAR SATELLITE · épisode 2** (5 min 51 s, 1080p24, FR).
Les fichiers vidéo eux-mêmes ne sont pas versionnés ici (≈ 850 Mo) : seules les sources
qui permettent de les reconstruire le sont.

```
SCRIPT.md                 script de production, chapitre par chapitre
NOTES_DE_PRODUCTION.md    ce qui a été fabriqué, comment, et pourquoi
Telecoms_Satellite_Ep2_FR.srt
render/                   rendu canvas déterministe (HTML + Chromium, image par image)
blender/                  les trois plans 3D, scènes construites en Python
audio/                    bruitage de synthèse et génération des sous-titres
```

## Reconstruire

Prérequis : la chaîne d'outils de `tools/video/install.sh` (Blender, Playwright, ffmpeg).

```bash
bash blender/render_bl.sh
ROOT=<dossier de travail> BLCOUNTS='{"cross":144,"polar":144,"rep":144}' node render/shoot.mjs
```

Le rendu est déterministe : chaque image ne dépend que de son numéro, donc deux
exécutions donnent des fichiers identiques.
