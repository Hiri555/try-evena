# SS7 — Épisode 1 · « La route parallèle »

Sources de fabrication du film **SIGNALISATION SÉMAPHORE N°7 · épisode 1**
(7 min 50, 1080p24, FR), d'après la séance 01 du cours.
Les fichiers vidéo (~1 Go) ne sont pas versionnés : seules les sources le sont.

```
SCRIPT_VO.md              le texte dit, avec les citations du prof
NOTES_DE_PRODUCTION.md    ce qui a été fabriqué, comment, pourquoi
SS7_Ep1_FR.srt
render/                   rendu canvas déterministe « cahier » (HTML + Chromium)
blender/                  les trois plans 3D, scènes construites en Python
audio/                    bruitage de synthèse et génération des sous-titres
```

## Identité

Papier crème à petits carreaux, marge rouge, encre.
**Rouge vermillon = la parole. Bleu encre = la signalisation.
Jaune = le surligneur. Vert = validé.** Une règle, tenue sur dix chapitres.

## Reconstruire

Prérequis : la chaîne d'outils de `tools/video/install.sh` (Blender, Playwright, ffmpeg).

```bash
bash blender/render_bl.sh
ROOT=<dossier de travail> BLCOUNTS='{"mic":144,"res":144,"pile":144}' node render/shoot.mjs
```

Le rendu est déterministe : chaque image ne dépend que de son numéro.
