# SS7 — ÉPISODE 2 · « LA TRAME » — notes de production

**11 min 42 · 16 848 images · 1920×1080 · 24 i/s · français**
Réalisé par **Big Magass**, d'après les séances 02 et 03 du cours de
signalisation sémaphore N°7 (dossier technique + PPT officiel + TD).

---

## Ce que l'épisode couvre

L'épisode 1 a construit **la route** (pourquoi une voie à part, qui l'habite,
comment elle est empilée). L'épisode 2 monte dessus et ouvre **ce qui roule** :
la trame, octet par octet, puis les trois niveaux qui la manipulent.

| # | Chapitre | Ce qu'on retient |
|---|---|---|
| 00 | L'accroche | 300 octets qui doivent arriver **intacts** |
| 01 | Niveau 1 · la LSD | 64 kbit/s, semi-permanente — **canal sémaphore = TS + LSD + TS** |
| 02 | Niveau 2 · la trame | 6 champs, et **le piège** : correction au DÉBUT, détection à la FIN |
| 03 | L'INL | 0 remplissage · 1-2 état · >2 message — et 6 bits lus sur 8 |
| 04 | Le fanion | 7E, et le **bourrage** : un 0 forcé après cinq 1 |
| 05 | Le CRT | division par un diviseur commun, partagé avant la session |
| 06 | La correction ★ | NSA · NSR · BIA · BIR, expliqués par les **colis et les tampons** |
| 07 | Base ou cyclique ★ | le TD : erreur à la 10ᵉ → **1 retransmission** en base, **11** en cyclique |
| 08 | Supervision | 4 pour mille, et le **compteur-décompteur** (+1 / −1 tous les 256) |
| 09 | Niveau 3 | discrimination · distribution · acheminement — étiquette sur 32 bits |
| 10 | Niveau 4 | le MIA ouvre l'appel, la libération de garde le ferme |
| 11 | La fiche | récapitulatif lisible en pause |

**Les chapitres 06 et 07 sont le cœur.** C'est là que tout le monde décroche, et
c'est là que l'image sert vraiment à quelque chose : un numéro de colis, un
tampon de couleur, un reçu. Quand le tampon qui revient n'est pas de la même
couleur que celui qu'on a posé, on reprend à NSR + 1. Tout le mécanisme tient
dans cette phrase, et elle est **montrée**, pas récitée.

---

## La continuité avec l'épisode 1

Même cahier, même code couleur, tenu du début à la fin :

- **rouge vermillon = la parole**, le circuit téléphonique
- **bleu encre = la signalisation**
- **jaune = le surligneur** : ce qu'il faut retenir
- **vert = c'est validé**

Lisible aussi pour un daltonien (rouge/bleu, jamais rouge/vert porteur de sens).
Signature **Big Magass** en filigrane permanent (α 0,030) et en signature
manuscrite en bas à droite.

---

## Ce qui a changé par rapport à l'épisode 1

L'épisode 1 avait deux défauts signalés : des plans 3D trop lents, et des
transitions mal faites. Les deux sont corrigés **à la source**, pas rattrapés :

**1 · Les plans 3D sont rendus à la bonne cadence dès le départ.**
336, 384 et 336 images, c'est-à-dire 14 s, 16 s et 14 s de vrai 24 i/s.
Aucune interpolation n'a été nécessaire cette fois : pas de RIFE, pas de
rattrapage, donc aucun artefact de flux optique.

**2 · La caméra ne s'arrête jamais.**
Chaque chapitre a sa propre trajectoire (`addCam`), plus une dérive permanente,
plus la bascule de page entre chapitres (la feuille glisse sur le bureau et
tourne légèrement). Il n'y a pas un seul plan fixe dans le film.

**3 · Le zoom caméra est plafonné à 1,065.**
Mesuré : à z = 1,08, le numéro de chapitre posé dans la marge (x ≈ 54) sort du
cadre à gauche — il tombe à x = −21. Les onze mouvements concernés ont été
ramenés à 1,065 et le numéro décalé de 26 px vers l'intérieur.

---

## Les trois scènes 3D (Blender 4.0.2, Cycles CPU)

| Scène | Images | Ce qu'elle montre |
|---|---|---|
| `bl_trame.py` | 336 | les 6 champs de la trame, avec les deux annotations qui portent le chapitre |
| `bl_tampons.py` | 384 | 5 envois : colis 9 OK, colis 10 abîmé, reçu à tampon basculé, retransmission |
| `bl_appel.py` | 336 | les 6 messages d'un appel complet, du MIA à la libération de garde |

### Ce qui a été mesuré et corrigé

**La page doit remplir le cadre.** Avec une feuille finie, un tiers du haut de
l'image restait gris : la caméra (objectif 40 mm, inclinée de 18°) regarde
légèrement **au-dessus de l'horizon**, donc aucune feuille horizontale, si
grande soit-elle, ne peut remplir le cadre. Agrandir la feuille de 30×17 à
70×46 n'a rien changé — seulement coûté. La solution est un **fond de page
vertical** (`fond()` dans `bl_common.py`) : la page se relève derrière la scène.

**L'éclairage a été refait, et c'est le vrai gain.** Les deux sources de surface
de 16 m de l'épisode 1 ne convergent pas quand la page occupe tout le cadre :

| Échantillons | σ sur une zone de papier plat | Temps / image |
|---|---|---|
| 6 (area lights) | 4,90 | ~5 s |
| 12 (area lights) | 3,39 | ~12 s |
| 24 (area lights) | 2,22 | ~17 s |
| **6 (soleils)** | **0,00** | **~7 s** |

Remplacées par deux **soleils** (angles 7° et 16°), le bruit s'effondre à zéro
sur la page et 6 échantillons suffisent. Le débruiteur OpenImageDenoise n'était
pas disponible dans ce build de Blender — il a été essayé, et écarté sur
constat, pas par préférence.

**L'exposition a été calibrée à la mesure**, pas à l'œil : gain 0,44, ce qui
place la page à 211/255 (la référence de l'épisode 1 était à 215) avec 0,11 %
de pixels saturés.

**Trois erreurs de scène trouvées en regardant les images, pas le code :**

- `bl_tampons.py` : les colis s'arrêtaient à 1,3 unité du bord des tours, donc
  **le reçu traversait la tour B**. Arrêt porté à 2,2. Et l'objectif 40 mm
  coupait « TERMINAL A » et « TERMINAL B » : passé à 32 mm, balayage réduit à ±4°.
- `bl_appel.py` : les étiquettes projetaient leur ombre sur le fond vertical,
  ce qui dédoublait chaque texte en fantôme. Toutes les ombres portées sont
  désactivées dans cette scène — c'est un schéma plat, le relief vient des
  biseaux. Le fond reçoit une émission de 0,42 pour retrouver sa valeur de
  papier (228/255), sinon les soleils le frôlent et il vire au gris.
- `bl_appel.py` : la caméra descendait le long de l'échelle et coupait le haut.
  Erreur de calcul de ma part : Blender ajuste le capteur de 36 mm sur la
  **plus grande** dimension, donc le demi-angle vertical est de 14,9° et non
  19,6°. Recalculé, la descente est remplacée par un rapprochement, et les six
  messages tiennent ensemble dans le cadre à la fin.

---

## Le rendu des images

Canvas HTML5 piloté image par image par Playwright/Chromium. Rien n'est animé
par CSS : une fonction `renderFrame(n)` dessine l'image n, et des timelines GSAP
en pause sont « scrubbées » à l'instant voulu. Le film est donc **reproductible
à l'identique** — deux rendus successifs donnent les mêmes octets.

Espace logique 2000×1125, réduit de 0,96 à l'écriture : tout le code peut viser
le centre à x = 1000 sans se soucier de la résolution de sortie.

Les fichiers sont servis à Chromium par interception de requête
(`page.route`), sans aucun serveur HTTP.

---

## Le son

- **Voix** : Florian (ElevenLabs `eleven_v4`), 12 prises, 668 s.
- **Bruitages** : 193 repères synthétisés en NumPy (`audio/sfx.py`) — plume,
  surligneur, papier, déclic, tampon, souffle. Aucun échantillon importé.
- **Musique** : deux lits instrumentaux Suno, montés A→B→A→B avec fondus de 4 s.
- **Mixage** : ducking par chaîne latérale sous la voix, compression de bus,
  limitation à vrai pic suréchantillonnée (192 kHz → `alimiter` → retour en
  48 kHz par soxr).

**Mesuré sur le mixage final : −13,7 LUFS intégré, −1,5 dBTP, LRA 3,0.**
(YouTube normalise à −14 LUFS : le film ne sera donc quasiment pas retouché.)

---

## Reproduire

```bash
cd scratchpad/ss7b && bash render_bl.sh          # les 1 056 plans 3D
cd ../render5 && BLCOUNTS='{"trame":336,"tampons":384,"appel":336}' node shoot.mjs
cd ../ss7b/audio && python3 sfx.py && python3 srt.py
bash ../enc.sh
```
