# TÉLÉCOMS PAR SATELLITE — ÉPISODE 2 · « LE SIGNAL »

**5 min 51 s · 1920×1080 · 24 i/s · français**
Épisode 1 : *Le miroir immobile* (on met le satellite en place).
Épisode 2 : **ce qui passe réellement à travers.**

---

## Les livrables

| Fichier | Rôle |
|---|---|
| `Telecoms_Satellite_Ep2_MASTER_1080p.mp4` | Master d'archive, CRF 17, AAC 320 kb/s. C'est la copie dont on repart. |
| `Telecoms_Satellite_Ep2_WEB_1080p.mp4` | Diffusion, **sans** sous-titres incrustés. |
| `Telecoms_Satellite_Ep2_WEB_1080p_SOUSTITRE.mp4` | Même film, sous-titres FR incrustés (IBM Plex Sans). |
| `Telecoms_Satellite_Ep2_FR.srt` | Sous-titres en fichier séparé — YouTube, montage, révision. |
| `Telecoms_Satellite_Ep2_poster.jpg` | Vignette 1920×1080. |

---

## Ce que l'épisode 1 laissait de côté

L'épisode 1 répondait à *« comment on tient un satellite immobile »*. Il ne disait rien
du signal lui-même. Les six manques, et où ils sont comblés :

1. **Le répéteur** — on n'avait jamais ouvert la boîte → chapitre 01
2. **La transposition de fréquence** — pourquoi 6 GHz devient 4 → chapitre 01
3. **Le plan de bande C et son piège** — la fin de bande qui se replie → chapitre 02
4. **La polarisation circulaire** — doubler sans une fréquence de plus → chapitre 03
5. **Le choix de 6/4 GHz** — la fenêtre de silence → chapitre 04
6. **VSAT et facteur de mérite** — le sol → chapitres 07 et 08

---

## Découpage

| # | Chapitre | Durée | Ce qu'on retient |
|---|---|---|---|
| 00 | L'accroche | 0:11 | « Qu'est-ce qui passe réellement à travers ? » |
| 01 | Le répéteur | 0:34 | reçoit · amplifie · **décale de −2225 MHz** · renvoie |
| 02 | Le plan de bande C | 0:56 | **le piège** : la fin de montante descend de −3025 et file tout en bas |
| 03 | La polarisation | 0:38 | RHCP et LHCP s'ignorent → ×2 sur la même fréquence |
| 04 | Pourquoi 6 et 4 GHz | 0:30 | la fenêtre entre le bruit galactique et l'absorption atmosphérique |
| 05 | Les faisceaux | 0:33 | global / hémisphérique / zone / spot → réutilisation par l'espace |
| 06 | Intelsat, I à IX | 0:44 | 50 MHz et 18 mois → 3450 MHz et 13 ans |
| 07 | La VSAT | 0:32 | < 4 m, étoile ou maillage, 99,99 % |
| 08 | Les deux chiffres | 0:38 | A = 22 + 20 log(D/λ) · G/T = G − 10 log T |
| 09 | La fiche | 0:35 | récapitulatif à l'image, lisible en pause |

**Le cœur de l'épisode est le chapitre 02.** C'est la seule chose vraiment contre-intuitive
du programme : les deux extrémités de la bande se croisent. Tout le reste du film est
construit pour que ce moment-là tombe juste.

---

## Comment c'est fabriqué

**Rien n'est filmé, rien n'est une boucle d'animation lue au hasard.** Chaque image
porte un numéro, et ce numéro décide de tout. Concrètement :

- **Le dessin** — une page HTML, un `<canvas>` 1920×1080, piloté image par image par
  Chromium. Aucune animation CSS : le temps est une variable. Les courbes
  d'accélération viennent de GSAP, en timelines **en pause** qu'on déplace à la main
  (`timeline.pause(t)`) — donc parfaitement déterministes, et re-rendables à l'identique.
- **Les trois plans 3D** — Blender 4.0, Cycles CPU, scènes construites en Python
  (aucun fichier .blend à la main) :
  - `bl_repeteur.py` — la chaîne réception / amplification / conversion, la sinusoïde
    serrée à 6 GHz qui en ressort plus lâche à 4 GHz ;
  - `bl_crossing.py` — **le croisement**. Les deux rails de bande dans l'espace, et le
    ruban ambre qui part de la fin de la montante pour atterrir au bas de la descendante ;
  - `bl_polar.py` — deux hélices contrarotatives sur le même axe. La caméra est placée
    en hauteur et pivote : sans ce léger survol, deux hélices se lisent comme une
    simple sinusoïde.
  432 images au total, composées sous le canvas avec des fenêtres de retiming.
- **Le plan d'ouverture** reprend la plaque spatiale de l'épisode 1, jouée à l'envers —
  on s'éloigne de la Terre au lieu de s'en approcher. Petit raccord de série.
- **La texture** — grain argentique, grain de papier et trame demi-teinte sont
  recalculés à chaque image à partir de son numéro. Ça évite le « tapis » fixe qui
  trahit les fonds numériques.

## La voix et le son

- **Voix** : ElevenLabs `eleven_v4`, voix Nicolas, 10 prises dirigées par balises
  (`[curious]`, `[calm]`, `[satisfied]`, `[pause]`). Le texte est écrit pour être dit,
  pas pour être lu : phrases courtes, un seul chiffre par phrase.
- **Musique** : Suno. Tempo mesuré après coup à **95,7 BPM** (demandé : 96) — les
  points de montage sont calés sur la mesure réelle, pas sur la valeur demandée.
- **Bruitage** : ~90 effets synthétisés en NumPy (souffles par filtre passe-bande
  balayé, blips, impacts, risers) et posés à des timecodes absolus. Le riser descendant
  à 28,2 s du chapitre 02 accompagne le repli de −3025 MHz : on *entend* la bande
  tomber.
- **Mixage** : ducking latéral de la musique et des ambiances sous la voix, compression
  de bus, puis limitation vraie-crête **suréchantillonnée à 192 kHz** avant retour en
  48 kHz. Mesure finale du master : **−13,71 LUFS · −1,20 dBTP · LRA 2,40**.
  (Un `loudnorm` simple écrêtait à +0,7 dBTP — d'où le détour par 192 kHz.)

---

## Deux choix assumés

1. **Peu de chiffres, et toujours une raison avant le chiffre.** Tu avais dit : pas trop
   mathématique. Donc −2225 n'arrive jamais seul, il arrive après « le satellite émet et
   reçoit en même temps ; s'il réémettait sur sa fréquence d'écoute, il se rendrait
   sourd ». Les deux formules du chapitre 08 sont énoncées puis **traduites en une
   phrase** chacune — c'est leur traduction qu'il faut retenir, pas leur forme.

2. **Aucune image d'archive inventée.** Pas de faux portrait, pas de fausse photo
   d'Intelsat I. Le chapitre 06 est un graphique honnête : bande totale et durée de vie,
   de I à IX, avec les deux générations charnières en ambre (IV-A : réutilisation par
   l'espace ; V : réutilisation par la polarisation).

---

## Les fichiers de fabrication

```
render3/     chapters.js (10 chapitres), lib.js, lib2.js, index.html, shoot.mjs
ep2/         bl_repeteur.py, bl_crossing.py, bl_polar.py, render_bl.sh
ep2/audio/   sfx3.py (bruitage), srt3.py (sous-titres)
ep2/vo/      v0…v9.mp3 (les 10 prises)
ep2/SCRIPT_EPISODE_2.md
```

Tout est reproductible : relancer `shoot.mjs` redonne exactement les mêmes 8430 images.

---

## Note de sécurité

La clé **Kie AI** que tu as collée en clair dans la conversation est à considérer comme
compromise : **révoque-la et régénère-la**. Elle n'est écrite dans aucun fichier du dépôt.
