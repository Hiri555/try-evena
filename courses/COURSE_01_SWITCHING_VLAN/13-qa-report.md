# 13 — QA report · Épisode 1 « Comment un switch sait où envoyer tes données ? »

## Fiche technique

| | |
|---|---|
| Durée | **6 min 35 s** (395 s) |
| Débit de parole | ~155 mots/min (1 021 mots) |
| Image | 1920×1080 · 30 fps · H.264 (CRF 17 blocs, CRF 18 version sous-titrée) |
| Son | voix ElevenLabs « Anaïs – Instructor » (`eleven_multilingual_v2`, vitesse 0,88) · 59 bruitages ElevenLabs · AAC 192 kb/s |
| Loudness | voix normalisée EBU R128 −16 LUFS, limiteur −1,5 dBTP ; SFX ~20 dB sous la voix. **Mesure du mix final : −16,3 LUFS intégrés · true peak −4,1 dBTP · LRA 5,8** |
| Sous-titres | 171 répliques · ≤ 2 lignes · ≤ 42 caractères/ligne · notation technique rétablie (802.1Q, AA:AA, SW2, VLAN 10) |
| Rendu | 27 blocs de 15 s, 4 workers Playwright, 1 planche contact par bloc (1 image / 2,5 s) → `09-contact-sheets/` |

## Pipeline réellement exécuté

```
03-script.md ─► voice.mjs (ElevenLabs, best-of-N + retranscription Scribe) ─► 07-audio/NN-*.mp3 + alignement mot à mot
             ─► timeline.mjs (silences de fin de phrase + « holds » d'animation épissés) ─► 07-audio/voice.wav + 05-timeline.json
             ─► episode.js (15 plans, 143 événements ancrés sur la voix) ─► render.mjs ─► blocs MP4 + planches contact
             ─► sfx.mjs ─► sfx.wav · subtitles.mjs ─► 12-subtitles.srt + .ass · master.mjs ─► 10-final.mp4 / 11-final-subtitles.mp4
```

**Écart assumé vs le brief :** Whisper n'est pas installé dans l'environnement. Le timing mot à mot vient de l'endpoint ElevenLabs `with-timestamps` (alignement caractère par caractère sur le texte exact, plus précis qu'une transcription), et la vérification « le son dit-il bien le script ? » est faite par retranscription avec ElevenLabs Scribe (`engine/voice-qa.mjs`).

## Corrections faites pendant la production

| Problème détecté | Détection | Correction |
|---|---|---|
| « SW2 » prononcé « SV2 » | retranscription | texte parlé « le switch deux » (affiché SW2) |
| « floode » entendu « flotte » (sens changé) | retranscription | verbe remplacé par « inonde » ; le nom « flooding » reste |
| Prise 05 : « euh », « ils jettent **non** la trame » (hallucination TTS) | retranscription (97 %) | phrase simplifiée + best-of-3 → 99,1 % |
| Prise 07 : « tu as » inventé | retranscription | régénération |
| Débit trop rapide (4:42 à vitesse 1.0) | durée | vitesse 0,88 + silences de fin de phrase + 26 holds ciblés |
| Alignement tronqué après « « » | nb de mots incohérent | l'alignement normalisé réécrit « en `<<` → passage à l'alignement brut |
| Ponctuation française perdue dans les sous-titres (« partout ? ») | lecture SRT | réinjection de la ponctuation depuis le script |
| Chevauchements de texte (FLOODING/PC-B, étiquettes/table, compteur/question, ancre d'encart/badge) | planches contact | repositionnement |
| Film final trop petit (moitié haute vide) | planche contact | mise à l'échelle ×1,08 + recentrage |

## Voice QA (retranscription vs script)

Voir `09-contact-sheets/voice-qa.md`. Concordance 95–100 % sur les 13 pistes ; les écarts restants sont des homophones (décider/décidé, au tag/aux tags, inconnue/inconnu) ou des chiffres (« dix » → « 10 »).

## Les 8 checks

| # | Check | Verdict | Commentaire |
|---|---|---|---|
| 1 | Le concept réseau est-il exact ? | ✅ | Apprentissage sur la source + port d'entrée ; décision sur la destination ; flooding **sans** le port d'entrée ; non-destinataires qui **jettent** ; broadcast traitée par tous ; VLAN = domaine de broadcast ; port d'accès **non tagué** ; tag 802.1Q de 4 octets inséré après la MAC source (TPID 0x8100, VID 12 bits), FCS recalculé ; tag retiré avant le port d'accès ; table MAC par VLAN ; inter-VLAN ⇒ routeur. Dans le film final, SW1 connaît déjà BB:BB (hypothèse écrite dans le storyboard) et SW2 **apprend** AA:AA sur Gi0/1 à l'arrivée de la trame. |
| 2 | L'animation correspond-elle à l'explication ? | ✅ | Chaque événement visuel est calé sur un mot de la voix (143 ancres, 0 non résolue). |
| 3 | Compréhensible sans le son ? | ✅ (partiel) | Tables, étiquettes (LEARNING, LOOKUP MISS/HIT, FLOODING, BROADCAST, TAG LU), HUD du film final et quiz portent l'essentiel. Le « pourquoi » (analogies) reste porté par la voix → la version sous-titrée couvre ce cas. |
| 4 | Le son seul reste-t-il compréhensible ? | ✅ | Script écrit pour l'oreille ; chiffres et sigles prononçables ; retranscription ≥ 95 %. |
| 5 | Les analogies créent-elles une idée fausse ? | ✅ | Enveloppe → aussitôt « dans le vrai réseau, ces champs sont dans l'en-tête » ; étages → « domaine de broadcast » ; ascenseur → question du marquage ; badge → « ce n'est pas un autocollant, c'est un champ ». |
| 6 | Chaque scène fait-elle progresser la compréhension ? | ✅ | Voir dépendances de `01-research-notes.md` : aucune notion utilisée avant d'être montrée. |
| 7 | Le rythme est-il trop lent ? | ⚠️ | Deux passages visuellement calmes (~7 s) : les « portes » (0:15–0:22) et la carte réseau (0:52–1:00). L'image évolue (ports, ?, 48 bits, abréviation) mais peu. |
| 8 | Une scène pourrait-elle être supprimée ? | ⚠️ | Candidats listés ci-dessous (étape 15). |

## Étape 15 — compression 80/20 (proposée, non appliquée)

Candidats, par gain décroissant, si la compréhension reste identique :

1. **S02 « le problème » (16 s)** : le hook pose déjà la question ; on pourrait enchaîner directement sur la trame. *Gain ~12 s.*
2. **S06.2 comparaison unknown unicast / broadcast (9 s)** : la distinction est déjà dite en S06.1… mais c'est la seule image qui montre « disparaît / revient ». → **garder**.
3. **Analogie ascenseur (S09.2, ~3 s)** : redondante avec l'immeuble (S07.3). *Gain ~3 s.*
4. **« Multiplie ça par des centaines de machines… » (S07.1, ~5 s)** : l'image des broadcasts répétés porte l'idée. *Gain ~5 s.*
5. **2ᵉ phrase du teaser** : garder (ouvre l'épisode 2).

Total possible : ~20 s (≈ 5 %). Je recommande 1 + 3 + 4 **après** ton visionnage.

## Points ouverts

- **Livre source** : toujours non fourni. Les références de section de `01-research-notes.md` restent présumées (Odom ICND1 100-105).
- **Broadcast dans la petite enveloppe** : affichée `FF:FF` (même abréviation que AA:AA) ; l'adresse complète `FFFF.FFFF.FFFF` est montrée en gros au moment où la voix la décrit.
- **Écrans partagés** (avant/après, unknown unicast/broadcast) : miniatures à 50 %, lisibles mais petites.

## Dernière passe (après lecture de toutes les planches)

- Récap : les 6 emplacements de vignettes sont visibles dès « Récapitulons » (plus d'écran vide de ~2 s entre le quiz et le récap).
- 6ᵉ vignette (trunk + tag) : +1,2 s de pause avant le teaser, elle n'était visible que ~0,7 s. Seuls les ~10 dernières secondes ont été décalées ; blocs 15, 25, 26 et 27 re-rendus.
- Port d'accès : l'étiquette « aucun tag » passe sous la trame (elle était masquée par la pastille PORT D'ACCÈS).
- Sous-titres incrustés vérifiés sur image (hook, règle source/destination, en-tête 802.1Q) : lisibles, contour noir, 2 lignes max.

---

# V2 — « plus dynamique, avec du son »

Retour utilisateur sur la V1 : trop plate. Diagnostic : caméra fixe, peu d'éléments en mouvement, grands aplats sombres, voix lente (0,88), aucune musique, bruitages à peine audibles.

## Ce qui change

| Axe | V1 | V2 |
|---|---|---|
| Voix | vitesse 0,88, style 0,15 | vitesse **1,0**, style **0,35** (plus expressive), best-of-2 retranscrit (91–100 % ; écarts = « PC A » écrit « PCA ») |
| Musique | aucune | **« Packet Trail »** (Suno, instrumental électro 110 bpm), A→B→A en fondus, **sidechain** : la musique baisse d'elle-même quand la voix parle |
| Bruitages | 59, ~20 dB sous la voix | **117** : + riser/impact sur chaque bumper, hit sur chaque mot géant, sub-drop sur les secousses, whip sur les transitions, glitch sur LOOKUP MISS |
| Illustrations | 0 | **10 illustrations IA** (ElevenLabs / gpt-image-2, style isométrique néon cohérent) : 9 bumpers de chapitre, immeuble (analogie VLAN), boucle (carte épisode 2) |
| Rythme visuel | chapitres enchaînés | **11 bumpers plein écran** (~2 s) : illustration en Ken Burns, « CHAPITRE 0X », titre qui claque |
| Caméra | fixe | dérive permanente + **25 punch-ins** sur les mots-clés + **secousses** (NON, MISS, broadcast, 50 câbles, boucle) |
| Typo | étiquettes | **12 mots géants** synchronisés (TRAME, MAC, LEARNING, DÉCIDER, MISS, FLOODING, BROADCAST, VLAN, ACCESS, TRUNK, 802.1Q, ROUTEUR) |
| Fond | grille statique | grille qui défile, 46 particules en parallaxe, halos teintés par la couleur du chapitre, vignettage |
| Transitions | fondu enchaîné | **zoom avant + flou de mouvement** |
| Repère | aucun | **barre de progression** par chapitre (couleurs sémantiques) |
| Durée | 6:35 | **6:05** (plus rapide malgré ~23 s de bumpers) |

## Mesures

- Mix : **−16,8 LUFS** intégrés · true peak **−2,9 dBTP** · LRA 4,9. Pendant la voix ≈ −16,3 LUFS ; bumpers ≈ −13,5 (volontairement plus « punchy »).
- Fichiers de livraison : H.264 CRF 23 preset slow, ~62 Mo chacun.

## Le contenu technique n'a pas changé

Les 30 scènes, les 143 ancres et toutes les vérifications réseau de la V1 restent valides : la V2 ajoute une couche (engine/juice.js) *autour* des plans, elle ne modifie pas ce qu'ils montrent. Les mots géants et bumpers ne portent aucune information technique nouvelle.

## Points encore perfectibles (V3 possible)

- Chapitre 01 (la trame) et le passage « problème » restent les plus « diagramme » : candidats pour une mise en scène plus illustrée.
- Écrans partagés (avant/après, unknown unicast/broadcast) : miniatures encore petites.
- Aucune vidéo IA (Higgsfield à 0 crédit ; pas de clé KIE dans l'environnement).
