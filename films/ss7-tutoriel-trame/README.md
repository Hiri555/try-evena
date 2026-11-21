# SS7 — Décoder une trame sémaphore, bit par bit

Film pédagogique de 7 min 19, tiré du TD de signalisation sémaphore (ESMT, LPTI2)
et de la correction rédigée par Big Magass.

## Ce que le film enseigne

Pas le résultat : **la méthode**. Les mêmes quatre gestes reviennent pour chaque
champ, sur une fiche identique à chaque fois —

1. **JE REPÈRE** — quel octet, quels bits dans la trame ?
2. **JE CONVERTIS** — hexadécimal → binaire
3. **J'OUVRE LA TABLE** — celle du cours, la bonne
4. **JE LIS** — la ligne qui correspond

C'est répété sept fois (correction d'erreur, INL, SER, H0/H1, catégorie,
indicateurs 957, CIC). La répétition est voulue : c'est ce qui fait entrer la
recette.

## Le fil conducteur

La trame reste **à l'écran en permanence**, en haut, avec un curseur qui se
déplace sur l'octet dont on parle. Les octets sont colorés par niveau :

| Couleur | Zone |
|---------|------|
| cyan | N2 — l'enveloppe (fanions, correction, INL, CRT) |
| ambre | N3 — l'adresse (SER + étiquette d'acheminement, 32 bits) |
| vert | N4 — la lettre (MIA : entête, catégorie, 957, CIC, numéro) |
| gris | tête de trame non détaillée dans l'énoncé |

À tout instant on sait **où on est** dans la trame. C'est la méthode relevée
dans les didacticiels Orange : un seul objet à l'écran, qu'on ré-entre en
changeant son état, plutôt qu'une pile de panneaux de texte.

## Note d'honnêteté sur la source

Le document écrit donne `… 2B 77 B0 … 80 80 7E` alors que la diapo du TD donne
`…2B77B0 4D 808087E` : l'octet `4D` manque dans le .md. Le film travaille sur la
trame complète de la diapo.

Les octets `08 08` (correction) et `D8` (INL) sont dans la partie de trame que
l'énoncé n'a pas réécrite (`….`). Le film le dit à l'écran à la section N2
plutôt que de leur inventer une position. Le curseur ne surligne que ce que
l'énoncé permet de situer : les fanions, le SER, l'étiquette (« juste après le
SER, 32 bits »), la zone N4 et les 16 bits de CRT en fin de trame.

## Résultats décodés

| Niveau | Champ | Lecture |
|--------|-------|---------|
| N2 | `08 08` | NSR = 8, NSA = 8, BIR = BIA = 0 → fonctionnement normal |
| N2 | INL `D8` | `011000` = 24 → INL > 2 → TSM, information = 24 octets |
| N2 | CRT | 16 bits de détection d'erreur |
| N3 | SER `04` | INS `0100` = SSUT · DSS `00` = international |
| N3 | étiquette | CPO = 7562 (PSA) · CPD = 14203 (PSB) · SCS = 7 |
| N4 | H0/H1 | `0001`/`0010` → MIA avec informations supplémentaires |
| N4 | catégorie `CA` | `001010` → abonné demandeur ordinaire |
| N4 | indicateurs `957` | international, circuit satellite, continuité exigée, … |
| N4 | CIC `667` | 1639 — ses 4 bits faibles `0111` = 7 = le SCS |
| N4 | numéro | 12 chiffres, lus à l'envers → **+221 77 403 05 79** |
| Q2 | trajet | SCS = `0111` → PSA → PTS6 → PTS2 → PTS3 → PSB |
| Q3 | transitions | émission N4→N3→N2 · réception N2→N3→N4 |

## Fabrication

- **Voix** — ElevenLabs `eleven_v4`, voix Florian, en 3 parties recollées (436,19 s).
- **Synchronisation** — chaque partie retranscrite par `eleven_scribe_v1` en
  horodatage mot à mot, puis **130 ancres** relevées par recherche de la phrase
  dans la transcription normalisée. Aucun repère n'est estimé au nombre de
  caractères : chaque événement à l'écran tombe sur l'horodatage réel du mot
  qu'il illustre.
- **Plans** — 7 images `nano-banana-pro` (2752×1536) animées en plans continus
  par `veo3_fast`, avec préambule anti-coupe. Chaque clip est vérifié
  automatiquement (`ffmpeg scdet`) : zéro coupe interne sur les sept.
  Conditionnés en 1920×1080, 30 fps, all-intra (`-g 1`) pour un seek exact.
- **Musique** — Suno, bouclée avec un creux de volume au raccord, masqué par la voix.
- **Mixage** — voix `highpass` + `acompressor`, musique en `sidechaincompress`,
  puis `alimiter` et double passe `loudnorm`.

## Fichiers

- `index.html` — la composition HyperFrames (439 s, 1920×1080, 30 fps)
- `SS7_tutoriel_FR.srt` — sous-titres mot à mot
- `cues.js` — les 130 ancres relevées sur la bande son
- `outils/` — génération des images, des plans, conditionnement

## Règles apprises (à ne pas réapprendre)

- **Jamais deux familles d'éléments avec le même préfixe d'identifiant** dans une
  composition. Sur le Thème 12, des pastilles `c1…c6` portaient les mêmes ids que
  les clips de chapitre : GSAP a mis les *clips* à `opacity:0` et cinq chapitres
  n'ont jamais été rendus. Le lint ne l'a pas vu — seule l'inspection d'images l'a vu.
- **Ne pas positionner un surlignage de tableau au pixel près.** Les hauteurs de
  ligne dépendent de la police et du retour à la ligne. Teindre la ligne elle-même.
- **Le plancher typographique est 28 px.** En dessous, le contrôle le signale et
  c'est illisible sur téléphone.
- Un `<video>` se place sur la timeline **lui-même**, jamais son conteneur.
