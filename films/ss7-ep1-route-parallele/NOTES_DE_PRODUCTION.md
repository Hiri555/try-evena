# SIGNALISATION SÉMAPHORE N°7 — ÉPISODE 1 · « LA ROUTE PARALLÈLE »

**7 min 50 · 1920×1080 · 24 i/s · français**
Un cours mis en images par **Big Magass**, d'après la séance 01 du cours de
signalisation sémaphore N°7 (dossier technique + PPT officiel + TD).

---

## Les livrables

| Fichier | Rôle |
|---|---|
| `SS7_Ep1_MASTER_1080p.mp4` | Master d'archive, CRF 17, AAC 320. |
| `SS7_Ep1_WEB_1080p.mp4` | Diffusion, sans sous-titres incrustés. |
| `SS7_Ep1_WEB_1080p_SOUSTITRE.mp4` | Même film, sous-titres FR incrustés. |
| `SS7_Ep1_FR.srt` | Sous-titres séparés — YouTube, révision, montage. |
| `SS7_Ep1_poster.jpg` | Vignette 1920×1080. |

---

## Le parti pris visuel : **le cahier**

Rien à voir avec la série satellite. Ici, tout se passe **sur une page de cahier** :
papier crème, petits carreaux, marge rouge, encre, surligneur jaune, post-it,
tampon encreur, et les annotations à la main. C'est le support dans lequel tes
camarades vont réellement réviser — alors le film a la tête de leur cahier.

**Une seule règle de couleur, tenue du début à la fin :**

- **rouge vermillon = la parole**, le circuit téléphonique
- **bleu encre = la signalisation**, le réseau sémaphore
- **jaune = le surligneur** : ce qu'il faut retenir
- **vert = c'est validé**

Le spectateur apprend ce code en dix secondes, et il porte les dix chapitres.
(Rouge/bleu plutôt que rouge/vert : c'est lisible aussi pour un daltonien.)

---

## Découpage

| # | Chapitre | Ce qu'on retient |
|---|---|---|
| 00 | L'accroche | la signalisation arrive **avant** la parole, par une autre route |
| 01 | Signaler, c'est quoi | établir · superviser · rompre — et les 3 périmètres, un seul normalisé |
| 02 | La voie par voie | URA + enregistreurs, IT16, et le défaut : tout tombe ensemble |
| 03 | La voie commune | une route à part — l'observateur passe dans l'hélicoptère |
| 04 | Pourquoi le N°6 a échoué | **2,4 ne tombe pas juste dans 64** : 26 fois, et il reste un trou |
| 05 | Qui habite ce réseau | PS / PTS / canal / faisceau — **un PS ne transite jamais** |
| 06 | Les trois modes ★ | associé · non associé (hors séquence) · **quasi-associé** |
| 07 | Lire un code | 6-016-1, et les vrais codes du réseau sénégalais |
| 08 | La pile | SSTM en bas, SSU en haut, l'**INS** (4 bits) aiguille |
| 09 | La fiche | récapitulatif lisible en pause + la phrase de fin du prof |

**Le chapitre 06 est le cœur** : c'est le sujet d'évaluation le plus probable, et
c'est le seul endroit où on peut *montrer* pourquoi le non associé est interdit —
trois messages partent 1·2·3 et arrivent 2·1·3.

---

## Les mots du prof

Quatre citations sont reprises **mot pour mot**, écrites à la main dans la marge,
pour que la formulation de l'examen soit celle du cours :

1. « C'est l'URA qui injecte la signalisation… c'est les enregistreurs de l'unité
   de commande qui le lui envoient. » *(ch. 02)*
2. « Tant que les deux étaient embarqués dans le même cycle, je n'ai ni
   signalisation, ni données. Même si le réseau ne fonctionne pas, je ne saurais
   pas pourquoi. » *(ch. 02)*
3. « Si le CT reçoit un message dont la destination finale n'est pas lui, il le
   supprime. Il n'a pas les moyens de faire du transit. » *(ch. 05)*
4. « Deux CAA ne peuvent pas communiquer en mode associé si les deux PS ne sont
   pas liés directement. » *(ch. 06)*

Et le film se ferme sur la phrase par laquelle il a terminé la séance :
« On commence par les fonctions du SSTM. La prochaine fois. »

Ses deux analogies sont jouées à l'écran : **les gares et les bagages**, et
**la course de bateaux** — l'observateur qui coule avec son bateau, puis le même
observateur dans l'hélicoptère.

---

## Comment c'est fabriqué

- **Le dessin** : une page HTML, un `<canvas>`, piloté image par image par
  Chromium. Aucune animation CSS — le temps est une variable, et les courbes
  GSAP sont des timelines **en pause** qu'on déplace à la main. 11 277 images
  strictement reproductibles.
- **La caméra** : la page n'est **jamais immobile**. Chaque chapitre a ses
  mouvements (zoom, panoramique) calés sur le texte, plus une dérive permanente
  très lente. Les post-it et les fiches flottent légèrement. Le grain et la
  vignette, eux, restent fixes : ils appartiennent à l'image, pas à la page.
- **Les trois plans 3D** (Blender 4.0, Cycles, scènes construites en Python, look
  studio clair — des maquettes mates posées sur la feuille) :
  - `bl_mic.py` — la trame MIC : 32 intervalles, IT0 en jaune, IT16 surélevé en
    bleu, et un surligneur qui balaie la trame ;
  - `bl_reseaux.py` — **les deux réseaux superposés** : le téléphonique imprimé
    sur la feuille, le sémaphore flottant au-dessus sur son propre plan, avec sa
    propre topologie — et sa bille arrive avant celle de la parole ;
  - `bl_pile.py` — la pile SS7, le SSTM en dalles, les SSU au-dessus, et la bille
    qui marque un temps sur l'INS avant de filer vers le SSUT.
- **Les polices** : Archivo (titres), IBM Plex Sans (texte), IBM Plex Mono
  (codes et bits), **Caveat** (tout ce qui est écrit à la main).

## La voix et le son

- **Voix** : ElevenLabs `eleven_v4`, voix **Florian — Le Narrateur**. Elle n'a pas
  été choisie au hasard : j'ai fait dire la même phrase à quatre voix et j'ai
  mesuré leur expressivité. Florian sort devant avec un écart-type de hauteur de
  **6,22 demi-tons** (contre 4,40 pour la voix de la série satellite) et une
  étendue mélodique de **24,3 demi-tons** contre 14,4. C'est ça, une voix qui
  embarque — et c'est mesurable.
- **Musique** : Suno, lit documentaire à 92 BPM, monté A→B→A avec fondus.
- **Bruitage** : 159 effets synthétisés en NumPy — plume, surligneur, papier,
  déclics de relais, tampon encreur, et la chute dans la poubelle. Tous posés à
  des timecodes absolus, calés sur les animations.
- **Mixage** : ducking latéral de la musique et du bruitage sous la voix,
  compression de bus, limitation vraie-crête suréchantillonnée à 192 kHz.
  Mesure finale : **−13,9 LUFS · −1,5 dBTP · LRA 3,1**.

---

## Ta signature

Elle est à deux endroits, comme demandé :
- **en filigrane**, « BIG MAGASS » en très grand sur toute la page, à 3 %
  d'opacité — présent sur chacune des 11 277 images, visible si on le cherche,
  invisible sinon ;
- **en bas à droite**, « Big Magass » écrit à la main, discret mais lisible ;
- et en **carte de fin**, en grand, à la plume.

---

## Ce qui vient ensuite — épisode 2 · « LA TRAME »

Séances 02 et 03 du cours : la LSD et le canal sémaphore, l'anatomie de la trame,
les trois types par l'INL, le fanion et le bourrage de zéros, le CRT, puis le gros
morceau — **BIR, BIA, NSA, NSR**, méthode de base contre méthode cyclique (le TD1
des 20 trames), le niveau 3 (discrimination / distribution / acheminement), et
l'entrée dans le niveau 4 avec le MIA et la procédure d'appel complète
(MIA → MSS → ACO → RAT → FIN → LIG).
