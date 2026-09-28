# COURSE_01_SWITCHING_VLAN — Épisode 1 : « Comment un switch sait où envoyer tes données ? »

**Statut : ⏸ EN ATTENTE DE VALIDATION** (script + storyboard + 3 styleframes).
Aucun appel API (ElevenLabs / KIE) n'a été lancé.

| Livrable | État |
|---|---|
| `01-research-notes.md` | ✅ — ⚠️ livre source introuvable, références de section à remapper |
| `02-learning-map.md` | ✅ |
| `03-script.md` | ✅ ~1 260 mots, ~8 min, 13 sections audio |
| `04-storyboard.json` | ✅ 30 scènes, animations accrochées à des mots-ancres |
| `08-source/styleframes/` | ✅ SF01 hook · SF02 MAC learning · SF03 trunk 802.1Q |
| `09-contact-sheets/styleframes/*.png` | ✅ rendus 1920×1080 |
| `05-timeline.json`, `07-audio/`, rendu vidéo | ⏳ après validation |

## Re-rendre les styleframes

```bash
cd courses
npm install          # polices Inter + JetBrains Mono vendorisées
npm run styleframes  # → 09-contact-sheets/styleframes/*.png
```

Le moteur (`courses/engine/`) est partagé par toute la série :
- `tokens.css` : couleurs sémantiques, polices, style des sous-titres
- `components.js` : bibliothèque SVG (Switch, PC, Router, Cable, Trunk, EthernetFrame, VLANTag, MACTable, pastilles, bulles, encarts…)
- `render-styleframes.mjs` : serveur statique + Playwright → PNG

## Clés API

Jamais dans le code. Le pipeline lira `ELEVENLABS_API_KEY` et `KIE_API_KEY` depuis l'environnement.
