# SS7 — Décoder la trame du TD, de droite à gauche

Film de **6 min 58**, tiré du TD de signalisation sémaphore CCITT n°7 (ESMT) et du
polycopié de cours. Signé Big Magass.

## La découverte qui a tout changé

La trame de l'énoncé est écrite ainsi :

```
7E…….2B0975030477122C957CA21667762B77B04D808087E
```

Entre les deux fanions il y a **43 chiffres**. Quarante-trois est **impair**, or un
octet s'écrit avec deux chiffres hexadécimaux. **Cette chaîne ne se découpe donc pas
en octets si on part de la gauche.**

C'est cohérent : les points de suspension sont à gauche, le prof n'a pas réécrit le
début. Le seul bord sur lequel on peut s'appuyer est le **bord droit** — qui est
aussi, en signalisation sémaphore, le côté du **premier bit émis** (cours p. 5 et 7,
la flèche part vers la droite).

En alignant depuis la droite, tout tombe juste :

```
7E ……2 B0 97 50 30 47 71 22 C9 57 CA 21 66 77 62 B7 7B 04 D8 08 08 7E
```

Une première version de ce film affichait l'alignement depuis la gauche — décalé d'un
chiffre — et affirmait que `08 08` et `D8` étaient dans la partie non réécrite. C'était
faux : ce sont les trois derniers octets avant le fanion de fermeture. Le décodage est
désormais vérifié champ par champ par calcul (`outils/`), contre les tables du cours.

## Lecture, de droite à gauche

| Octets | Champ | Lecture | Table |
|--------|-------|---------|-------|
| `7E` | fanion | 0111 1110 | p. 5 |
| `08` | BIR + NSR | BIR = 0 · NSR = 8 | p. 7 |
| `08` | BIA + NSA | BIA = 0 · NSA = 8 | p. 7 |
| | | BIR = BIA → aucune erreur, aucune retransmission | p. 8 |
| `D8` | 2 réservés + INL | `011000` = 24 → INL > 2 → **TSM**, information = 24 octets | p. 6 |
| `04` | SER | INS `0100` = **SSUT niveau 4** · DSS `0000` → D C = 00 = **international** | p. 13 |
| `7B B7 62 77 66` | étiquette, 40 bits | **CPD = 14203** · **CPO = 7562** · **SCS = 7** · **CIC = 1639** | p. 12, 14 |
| `21 CA` | entête + catégorie | H0 `0001` · H1 `0010` → **MIA + infos suppl.** · catégorie `001010` = **abonné ordinaire** | p. 20, 21, 22, 24 |
| `57 C9` | indicateurs + nb signaux | **957** · **12 chiffres** | p. 22, 25, 26 |
| `22 71 47 30 50 97` | signaux d'adresse | **+221 77 403 05 79** | p. 27 |
| `B0` | 1er octet d'indicateurs | présent parce que H1 = MIA avec infos supplémentaires | p. 23 |
| `……2` | non réécrit | reste de l'information + CRT 16 bits + fanion d'ouverture | p. 5 |

**Question 2 — le trajet.** SCS = 7 = `0111`, un bit par carrefour depuis le poids
faible : PSA → PTS6 → PTS2 → PTS3 → PSB.

## Les 28 bits des codes de points, montrés et non assénés

C'est le cœur du film. Les dix chiffres hexadécimaux de l'étiquette sont posés
**chacun au-dessus de ses quatre bits**, et les cinq octets sont ombrés en alternance.
Les accolades de découpage — 14 / 14 / 4 / 8, prises depuis la droite — **traversent
visiblement les zones ombrées**. On voit donc que 14 + 14 = 28 bits = 7 chiffres hexa
ne tombent pas sur des frontières d'octets, et qu'il faut obligatoirement passer par
le binaire. Les 14 bits du CPD s'allument ensuite en vert, les 14 du CPO en ambre.

L'interprétation suit : « ce CPD, est-ce moi ? **oui** → je distribue à mon niveau 4 ;
**non** → je ne l'ouvre pas, je l'achemine plus loin. » Ici 14203 ≠ 7562, donc la trame
est en voyage entre deux points distincts.

## Le fil conducteur

La trame reste à l'écran du début à la fin. Un curseur **part du bord droit et remonte**,
champ par champ, sans sauter d'étape. Chaque octet **prend sa couleur au moment où il
est décodé** — cyan pour le niveau 2, ambre pour le niveau 3, vert pour le niveau 4.
On voit la trame se remplir.

## Les pages du cours à l'écran

Dix pages du polycopié apparaissent à droite, au moment exact où la table est ouverte :
5 (fanion), 7 (BIR/NSR), 6 (types de trame), 13 (INS et DSS), 12 (étiquette),
14 (CIC/SCS), 22 (structure du MIA), 20 et 21 (H0/H1), 24 (catégorie), 25 (indicateurs).

## Fabrication

- **Voix** — ElevenLabs `eleven_v4`, voix Florian, 3 parties (443 s), accélérées de
  **8,5 %** pour tenir sous les 7 minutes sans rien couper du contenu.
- **Synchronisation** — chaque partie retranscrite par `eleven_scribe_v1` en horodatage
  mot à mot ; les timestamps sont divisés par le facteur d'accélération, ce qui est exact
  puisque `atempo` est linéaire. **152 ancres** relevées par recherche de phrase dans la
  transcription normalisée (`ancres.py`). Aucune n'est estimée.
- **Plans** — 7 plans continus générés puis vérifiés (`ffmpeg scdet`) : zéro coupe interne.
- **Mixage** — voix compressée, musique en `sidechaincompress`, `alimiter`, double passe
  `loudnorm`. Rendu : **−14,5 LUFS / −2,7 dBTP**, 1920×1080, 30 fps, 418,0 s, 54 Mo.
- **Contrôle HyperFrames** — 1085 échantillons (`--at-transitions`), 0 erreur, 0 avertissement.

## Vérifier le décodage soi-même

```bash
python3 outils/verifier_trame.py
```

## Règles apprises (à ne pas réapprendre)

- **Un `tl.set()` sans position s'ajoute à la FIN de la timeline**, pas au début. Poser
  une géométrie calculée en JS se fait avec `gsap.set()`, hors timeline — sinon les
  éléments gardent leur position CSS initiale pendant toute la lecture et se superposent.
- **Les hauteurs de table se mesurent, elles ne se calculent pas** : un titre qui passe
  à la ligne décale tout ce qui suit.
- **`hyperframes check --at-transitions`** échantillonne à chaque début et fin de fondu
  (ici 1085 points au lieu de 9). Les trois défauts de la version précédente — une
  virgule orpheline sur la première image, deux tables superposées, un titre croisant un
  schéma — étaient tous invisibles aux 9 échantillons par défaut.
- **Jamais deux familles d'éléments avec le même préfixe d'identifiant** dans une
  composition : GSAP applique alors les tweens aux mauvais nœuds, et le lint ne le voit pas.
- Le plancher typographique est **28 px**. Un `<video>` se place sur la timeline lui-même,
  jamais son conteneur.
