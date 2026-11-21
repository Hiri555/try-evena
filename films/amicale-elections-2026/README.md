# Teaser — Présidence de l'Amicale des étudiants, ESMT 2026

Teaser vertical de **20 s** (1080×1920, 30 fps), refonte de la vidéo de la
commission électorale.

## Pourquoi l'originale ne décollait pas

Elle enchaînait « It's time » → « Who is next ? » → « Coming soon » → « Just stay
tuned ». Quatre façons de dire **attendez**. Le spectateur reste spectateur du
début à la fin : rien ne lui demande rien. Et le mouvement était un défilement de
panneaux, sans impact.

## La bascule

Le teaser installe d'abord le constat — **UN AN. UNE AMICALE. UNE SEULE PLACE.** —
puis resserre : **QUELQU'UN VA DÉCIDER… POUR TOI.** À la neuvième seconde, flash
blanc plein cadre, explosion de particules, l'image s'inverse en noir sur blanc :

> **ET SI C'ÉTAIT TOI ?**

C'est le retournement qui transforme un spectateur en candidat. Puis l'appel :
**CANDIDATE-TOI · OU VOTE · MAIS NE REGARDE PAS.** Enfin **DÉCEMBRE**, le tampon
**VOTE**, et la signature.

## Minutage

| t | ce qui se passe | son |
|---|---|---|
| 0,00 | affiche tenue : logo, « ? », Présidence 2026 — c'est la vignette du fichier | drone |
| 0,42 | flash + le « ? » s'écrase, deux ondes de choc | impact |
| 1,30 / 2,30 / 3,30 | UN AN. / UNE AMICALE. / UNE SEULE PLACE. | trois coups |
| 4,40 | les silhouettes montent, les rayons tournent | tom |
| 5,20 / 5,85 | PRÉSIDENCE / 2026 + balayage lumineux | impacts |
| 6,00 → 9,00 | riser, resserrement du cadre, secousse caméra | montée |
| **9,00** | **flash, inversion, 40 particules — ET SI C'ÉTAIT TOI ?** | **drop** |
| 11,00 / 12,50 / 14,00 | CANDIDATE-TOI. / OU VOTE. / MAIS NE REGARDE PAS. | accents |
| 15,50 | DÉCEMBRE, lettre par lettre | riser |
| 17,00 | le tampon VOTE s'abat avec rebond | impact final |
| 18,00 → 20,10 | logo ESMT, commission électorale, Présidence 2026 | chute |

## Effets

Aberration chromatique RVB (trois copies décalées, pilotées image par image),
barres de glitch à chaque frappe, texte qui s'écrase depuis l'échelle 3, ondes de
choc concentriques, rayons de lumière en rotation lente, balayage lumineux
masqué, secousse caméra sur la montée, explosion de 40 particules au drop,
composition lettre par lettre, tampon à rebond élastique.

## La bande-son est composée, pas cherchée

`outils/son.py` synthétise tout le lit sonore en numpy : drone, tic-tac,
impacts, riser à filtre glissant, puis au drop un groove à **120 BPM** avec kick,
clap, charleston, basse et stabs de cuivres filtrés. **Chaque impact est posé sur
une coupe du montage** — c'est l'avantage de composer plutôt que de chercher une
piste. Rendu final : **−13,1 LUFS / −2,9 dBTP**.

```bash
python3 outils/son.py        # réécrit son/bed.wav
```

## Éléments repris de l'originale

- **Le logo ESMT**, récupéré en bonne résolution depuis le polycopié de cours
  plutôt qu'upscalé depuis la vidéo source (464 px de large), et posé sur une
  pastille blanche pour rester lisible sur fond noir.
- **Les silhouettes** et le point d'interrogation rouge, détourés par seuillage
  puis nettoyés (la plus grande composante connexe, rien d'autre).
- **La date « Décembre »**, qui vient du tampon de la vidéo d'origine.

Rien d'autre n'a été inventé : ni date précise, ni lieu de dépôt des
candidatures, ni chiffre. Si la commission en fournit, ils se posent sur la carte
de fin.

## Contrôle

`npx hyperframes check --at-transitions` : 0 erreur, 0 avertissement.
Les dépassements de cadre et les superpositions pendant l'écrasement du texte
sont déclarés volontaires (`data-layout-allow-overflow` / `-occlusion` /
`-overlap`), ils durent deux à trois images.

## Note

L'image 0 est une affiche tenue 0,4 s, parce que c'est elle que WhatsApp et les
réseaux affichent en aperçu. L'originale démarrait sur du noir : l'aperçu était
vide. `renders/affiche.jpg` est cette image, utilisable telle quelle en flyer.
