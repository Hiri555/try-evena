# 13 — QA report · Épisode 2 « La petite boucle qui peut détruire un LAN »

## Fiche technique

| | |
|---|---|
| Durée | **7 min 40 s** (460 s) |
| Débit de parole | ~150 mots/min (1 063 mots) |
| Image | 1920×1080 · 30 fps · H.264 (blocs CRF 17, livrables CRF 23 preset slow) |
| Voix | ElevenLabs **v3** (`eleven_v3`), voix « Anaïs – Instructor », balises d'intention v3 (`[dramatic]`, `[curious]`, `[excited]`, pauses) · best-of-2 par section avec retranscription Scribe |
| Musique | Suno (chirp v5.5), 2 pistes instrumentales « Circuit Rescue » (dark electro, 118 bpm), enchaînées A→B→A en fondu, sidechain sous la voix |
| SFX | ElevenLabs sound-generation (17 sons) · 50 cues manuels + cues auto (bumpers, slams, shakes, transitions) |
| Art IA (KIE) | Seedream 5 Pro : tempête, ronds-points, couronne, tournoi, barrière, bascule, autoroute · Kling 3.0 : 2 plans vidéo (tempête, ronds-points) intégrés image par image |
| Loudness | voix −16 LUFS (EBU R128), musique en sidechain, limiteur. **Mix final mesuré : −17,2 LUFS · true peak −3,4 dBTP · LRA 4,9** |
| Sous-titres | 167 répliques · ≤ 2 lignes · ≤ 43 car./ligne · notation technique rétablie (STP, RSTP, BPDU, SW1/SW2/SW3, SW-A/SW-B, 32769, 28673, coût 19/23/4/8) |
| Rendu | 31 blocs de 15 s · 4 workers Playwright · 1 planche contact par bloc (1 image / 2,5 s) → `09-contact-sheets/` |

## Pipeline exécuté

```
03-script.md ─► voice.mjs (eleven_v3, best-of-2 + Scribe) ─► 07-audio/NN-*.mp3 + alignement
             ─► timeline.mjs (holds + gaps de bumpers) ─► 07-audio/voice.wav + 05-timeline.json (30 scènes, 93 événements)
             ─► episode.js (13 plans) + juice.json (8 bumpers, 14 slams, 27 punchs) ─► render.mjs ─► blocs + planches
             ─► sfx.mjs ─► sfx.wav · subtitles.mjs ─► 12-subtitles.srt + .ass · master.mjs ─► 10-final.mp4 / 11-final-subtitles.mp4
```

## Corrections faites pendant la production

| Problème | Détection | Correction |
|---|---|---|
| 4 sections sans « — » dans leur titre fusionnées avec la précédente (03+04, 09→12 dans une seule prise de 130 s) | durée/longueur des prises | regex d'en-tête corrigée dans `voice.mjs`, 6 sections régénérées |
| Découpage de scène faux en S06 (« le switch deux » apparaît deux fois) | ancres non résolues | début de scène reconnu sur 5 mots au lieu de 3, recherche après la scène précédente |
| Ancres élidées (« L'arbre », « l'EtherChannel ») | warnings timeline | ancres corrigées dans storyboard / episode.js / sfx.json |
| `E()` limité aux ancres du storyboard | vérif automatique des 91 appels | repli sur n'importe quel mot prononcé de la scène (0 ancre manquante) |
| **Clignotement des images IA** (couronne, encart autoroute absents une image sur deux) | planches contact | la capture attend le décodage + 2 frames de peinture de chaque `<image>` avant la photo ; **rendu complet refait** |
| Câbles EtherChannel invisibles (filtre glow sur un tracé de hauteur 0) | planche contact | halo dessiné par un trait large translucide ; barrières décalées |
| Étiquettes SW doublées dans la tempête | still | pastilles recentrées sur les étiquettes |
| Câbles d'hôtes « dans le vide » quand les PC sont masqués | still | câbles d'hôtes masqués avec les PC |
| Tracés de coût traversant les étiquettes des switches | still | chemins port à port |
| Emoji ciseaux non rendu (pas de police emoji) | still | coupure dessinée en SVG (trait + onde) |
| S03.2 statique ~8 s | planche contact | boucle jaune animée + « ↻ la même boucle » |
| Carte « Épisode 3 » visible < 2 s | still | queue portée à 5 s |

## Voice QA (retranscription vs script)

Voir `09-contact-sheets/voice-qa.md`. Concordance **93,7 – 100 %** sur les 12 pistes. Écarts restants : sigles épelés retranscrits collés (« s-t-p » → « stp »), « root » entendu « route » par le STT (prononciation anglaise correcte), homophones (vue/vu, leurs/leur).

## Les 8 checks

| # | Check | Verdict | Commentaire |
|---|---|---|---|
| 1 | Concept réseau exact ? | ✅ | Pas de TTL en Ethernet ; tempête + copies multiples + instabilité MAC ; Bridge ID = priorité (32768 + VLAN 1 = 32769) puis MAC ; coûts 802.1D courts 100 Mb/s = 19, 1 Gb/s = 4 ; Root Port = coût min (SW2 passe par SW3 : 8 < 19) ; un DP par segment (SW3 Gi0/2 : 4 < 8) ; le port restant bloqué écoute les BPDU ; 802.1D ~50 s (20 max-age + 2×15) vs RSTP port Alternate quasi instantané ; EtherChannel = 1 lien logique pour STP. Quiz : SW-B root (28673) ; égalité A/C départagée par le BID (MAC …0C < …AA) → port de A bloqué. |
| 2 | Animation = explication ? | ✅ | 93 événements storyboard + 91 appels d'ancrage, tous résolus sur la voix. |
| 3 | Compréhensible sans le son ? | ✅ (partiel) | Badges RP/DP/ALT, coûts, sommes de chemins, horloges 50 s / 1 s, compteur de copies, quiz. L'analogie des ronds-points dépend de la voix → version sous-titrée. |
| 4 | Le son seul suffit ? | ✅ | Script oral ; chiffres dits en toutes lettres ; retranscription ≥ 93 %. |
| 5 | Analogies trompeuses ? | ✅ | Compteur de la tempête : copies **cumulées** transmises (pas un doublement par tour), en temps accéléré (« ⏱ temps ×1000 »). Ronds-points → aussitôt ramenés au triangle. Autoroute = répartition du trafic, pas addition magique d'un flux unique. |
| 6 | Progression ? | ✅ | Carte de quête en 4 étapes, chaque étape reprise dans un chapitre, puis quiz et récap. |
| 7 | Rythme ? | ⚠️ | Quiz : attente volontaire (anneau de réflexion ~1,6 s par question). S02.2 (rebond des 2 copies) reste sobre ~10 s. |
| 8 | Scène supprimable ? | ⚠️ | Voir 80/20. |

## Compression 80/20 (proposée, non appliquée)

1. **S02.2** (les copies reviennent, ~15 s) : pourrait être fusionnée avec S02.3. *Gain ~6 s.*
2. **Commande `spanning-tree vlan 1 priority`** (S05.3) : utile pour l'examen → garder.
3. **Seconde phrase du teaser** : garder.

## Points ouverts

- Livre source toujours non fourni : références de section présumées (Odom ICND2 / CCNA 200-301 Vol. 1, ch. STP).
- Les coûts « courts » 802.1D sont utilisés (19/4) ; les coûts longs (200 000 / 20 000) ne sont pas mentionnés, pour rester dans le programme de l'examen.
