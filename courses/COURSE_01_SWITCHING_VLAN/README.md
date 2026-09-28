# COURSE_01_SWITCHING_VLAN — Épisode 1 : « Comment un switch sait où envoyer tes données ? »

**Statut : ✅ V2 rendue** (6 min 05 s) — voix plus énergique, musique, 117 bruitages, bumpers illustrés IA, caméra et typo dynamiques.

| Livrable | Fichier |
|---|---|
| Recherche | `01-research-notes.md` (⚠️ livre source toujours non fourni) |
| Carte pédagogique | `02-learning-map.md` |
| Script parlé | `03-script.md` |
| Storyboard (30 scènes) | `04-storyboard.json` |
| Timeline (1 021 mots, 143 événements) | `05-timeline.json` |
| Assets | `06-assets/ai/` — 10 illustrations IA (bumpers, analogie, fin) ; tout le technique reste vectoriel |
| Audio | `07-audio/` — 13 pistes voix + alignements, bibliothèque SFX |
| Sources d'animation | `08-source/` (`episode.js`, `timing.json`, `sfx.json`, styleframes) |
| Planches contact | `09-contact-sheets/contact-sheet-block-XX.jpg` (1 image / 2,5 s) + `voice-qa.md` |
| Vidéo | `10-final.mp4` · `11-final-subtitles.mp4` (non commitées : trop lourdes pour le dépôt, régénérables) |
| Sous-titres | `12-subtitles.srt` |
| QA | `13-qa-report.md` |

## Tout régénérer

```bash
cd courses
npm install
export ELEVENLABS_API_KEY=…            # uniquement pour la voix et les SFX (déjà en cache dans 07-audio/)
node engine/voice.mjs --best-of 3     # pistes manquantes seulement (--force pour tout refaire)
node engine/voice-qa.mjs              # retranscription Scribe vs script → 09-contact-sheets/voice-qa.md
node engine/timeline.mjs              # voice.wav + 05-timeline.json
node engine/render.mjs --workers 4    # blocs MP4 + planches contact → renders/video.mp4
node engine/render.mjs --stills 12.5,80   # aperçus ponctuels
node engine/sfx.mjs                   # sfx.wav
node engine/subtitles.mjs             # 12-subtitles.srt + renders/subtitles.ass
node engine/master.mjs                # 10-final.mp4 + 11-final-subtitles.mp4
```

Aucune clé API dans le code : les scripts lisent `ELEVENLABS_API_KEY` depuis l'environnement.
