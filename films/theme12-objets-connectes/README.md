# Thème 12 — Réseaux d'objets connectés : SIM, identification, données

Film de 1 min 38 (98,4 s), 1920×1080, 30 i/s, pour l'exposé de **Big Magass** (ESMT, droit des TIC).

---

## Ce que le film raconte

Un seul objet — un compteur communicant — et trois corps de règles qui s'appliquent
**en même temps** sur lui. C'est cette superposition, et non chaque règle prise isolément,
qui fait la difficulté du sujet.

| Temps | Beat | Idée |
|---|---|---|
| 0 – 10 s | l'objet | des milliers de compteurs, chacun avec sa carte SIM, un index par heure |
| 10 – 21 s | le basculement | l'index aligné sur 24 h dessine le rythme de vie d'un foyer |
| 21 – 26 s | la thèse | trois régimes, un seul boîtier |
| 26 – 43 s | **01 identifier** | art. 36 ; la carte appartient à l'entreprise, pas à l'occupant |
| 43 – 58 s | **02 qualifier** | personnelle oui, sensible non (art. 40) — l'erreur est des deux côtés |
| 58 – 71 s | les deux leviers | agrégation, fréquence : ce que l'ingénieur peut faire et pas le juriste |
| 71 – 82 s | **03 faire vieillir** | mots de passe d'usine, chiffrement, fin de support, dépose |
| 82 – 90 s | le livrable | le registre de parc |
| 90 – 98 s | la clôture | identifier la carte, qualifier la donnée, faire vieillir le parc |

---

## Le calage, et pourquoi il est juste cette fois

Sur l'épisode 2 de SS7, les images arrivaient jusqu'à 2,3 s après les mots, parce que
j'avais **estimé** la durée des phrases au nombre de caractères. Ici, rien n'est estimé :

1. la voix est générée une fois (`eleven_v4`, voix « Florian ») ;
2. elle est **retranscrite** par `eleven_scribe_v1`, qui rend un horodatage **mot à mot** ;
3. chaque apparition à l'écran est écrite dans `index.html` à l'horodatage du mot
   qu'elle illustre, en clair dans le code.

Exemples repris tels quels du relevé :

| mot prononcé | à | ce qui apparaît |
|---|---|---|
| « lève, » | 13,200 s | le marqueur *elle se lève* |
| « part » | 13,840 s | le marqueur *elle part* |
| « rentre, » | 14,960 s | le marqueur *elle rentre* |
| « dort. » | 15,520 s | le marqueur *elle dort* |
| « distincts » | 39,600 s | le cartouche rouge |
| « réponse » | 56,080 s | le curseur se verrouille au centre, en vert |
| « objet, » | 85,520 s | la première colonne du registre |
| « Identifier » | 92,240 s | la première ligne de la clôture |

Vérifié après rendu sur dix points de contrôle extraits du MP4 lui-même, pas de la page.

`outils/caler_sur_la_voix.py` reste dans le dossier : c'est la méthode de repli
(détection de silences à −40 dB) si la transcription n'est pas disponible.

---

## Les images : 22 plans, tous animés, aucun répété

**Première version (abandonnée).** Dix photographies fixes, six d'entre elles réutilisées
deux fois, animées par un simple travelling avant en CSS. Le commanditaire a tranché :
« toutes les images sont statiques, aucune ne bouge ». Il avait raison — un zoom lent sur
une photo n'est pas de l'animation, et six images qui reviennent, c'est de la redondance.

**Version actuelle.** 22 plans vidéo distincts, aucun réemploi. Chaque plan est produit en
deux temps :

1. une photographie est générée (`nano-banana-pro`, 2752×1536) — elle fixe le cadre,
   la lumière et la composition ;
2. cette photographie est animée en image-to-video (`veo3_fast` / Veo 3.1, 8 s) avec une
   consigne qui interdit explicitement toute coupe, tout zoom et tout recadrage : seuls
   les éléments nommés bougent.

Ce qui bouge, plan par plan : la lampe-témoin rouge du pylône clignote · les DEL des
compteurs s'allument en ordre dispersé · la pince soulève une carte SIM du plateau · les
chiffres du compteur défilent et un papillon traverse le faisceau · une silhouette traverse
la fenêtre éclairée · le ventilateur tourne au-dessus du canapé · l'opérateur se penche et
tape · la main gantée enfonce la SIM puis se retire · une main tire le rideau · le tampon
descend sur le contrat · la lumière balaie la puce et révèle l'empreinte · le doigt descend
la colonne de la fiche · les phares traversent les avenues · les fenêtres de la rue
s'allument une à une · la toile d'araignée tremble sur le vieux compteur · le tournevis
dévisse et le compteur bascule · la plume écrit une ligne du registre · le tiroir de fiches
s'ouvre · l'aube monte sur la rangée de compteurs.

Les invites exactes sont dans `outils/animer_les_plans.py` et `outils/generer_plans.py`.

**Deux contrôles automatiques** sur chaque clip, avant montage :

- *coupe interne* : `scdet` cherche un changement de plan à l'intérieur du clip. Veo a
  tendance à se recadrer tout seul ; un clip qui coupe est relancé avec une consigne
  renforcée. Résultat final : **0 coupe sur les 22**.
- *mouvement réel* : différence moyenne entre images consécutives (`tblend=difference` +
  `signalstats`). **Aucun plan à zéro** — de 0,40 (le registre, volontairement calme) à
  2,46 (la dépose), moyenne 1,16 sur 255.

Le plan 32,8–39,5 s est scindé en deux moitiés d'écran : à gauche une main tire le rideau
chez l'occupant, à droite le tampon de l'entreprise tombe sur un contrat, à côté des bacs
de cartes SIM. L'opposition des deux sujets de droit est à l'écran avant d'être dite.

**Limite assumée :** Veo 3.1 rapide sort en 1280×720. Les clips sont agrandis en 1920×1080
(lanczos + accentuation légère) ; les graphiques, eux, sont rendus nativement en 1920.
Sur une image nocturne, granuleuse et à faible profondeur de champ, l'agrandissement ne se
voit pas en projection, mais il est réel et je préfère l'écrire.

---

## Mesures

| | |
|---|---|
| durée | 98,40 s (brief : 1 min 50 maximum) |
| plans | 22, tous différents, tous animés (0 réemploi, 0 image fixe) |
| image | 1920×1080, 30 i/s, H.264 high@4.0 |
| son | −12,4 LUFS intégré, crête −0,8 dBTP (référence : son film multiplexage, −11,9 LUFS) |
| contrôle HyperFrames | 0 erreur ; 0 alerte de contraste ; mise en page 0 problème |
| version allégée | 42,0 Mo, SSIM 0,99984 contre le master (38,0 dB) |
| coupes internes dans les clips | 0 sur 22 (détection `scdet`) |
| mouvement image par image | 0,40 à 2,46 sur 255 ; aucun plan à zéro |

Deux fichiers : le master (108,0 Mo, pour la projection) et `_whatsapp` (42,0 Mo, pour l'envoi).
Ils ne sont pas versionnés ici — ce dépôt garde la source, pas les rendus.

---

## ⚠ Ce que tu dois vérifier toi-même avant le jury

Je n'ai aucun moyen de contrôler les textes sénégalais depuis ici. Les deux références
chiffrées du film viennent **de ton propre exposé**, pas d'une source que j'ai pu ouvrir :

- **« l'article 36 oblige l'opérateur à identifier tous les utilisateurs de ses services »**
  (loi 2018-28 sur les communications électroniques) ;
- **« l'article 40 réserve "sensible" à la santé, aux opinions, à l'origine »**
  (loi 2008-12 sur la protection des données à caractère personnel).

Rouvre ton dossier et confirme les deux numéros d'article avant la projection. C'est
exactement le type d'erreur qui m'a fait écrire URA au lieu d'URM sur l'épisode 1 :
j'avais recopié une figure sans la recouper avec le reste du document.

Le reste du raisonnement — deux sujets de droit distincts, qualification entre les deux
bornes, agrégation et fréquence comme leviers d'ingénieur, registre de parc comme preuve —
est une construction, pas une citation. Rien n'est présenté entre guillemets à l'écran.

---

## Refaire le film

```bash
npx hyperframes check
npx hyperframes render --output out/t12.mp4
```

Les 22 clips ne sont **pas** versionnés (353 Mo). Pour les refabriquer :

```bash
KIE=<votre_cle> python3 outils/animer_les_plans.py   # genere et telecharge clips/
python3 outils/conditionner_les_clips.py             # decoupe vers assets/clips/
```

La bande son `assets/audio/mix.mp3` contient déjà la voix et la musique mixées
(ducking par `sidechaincompress` sous la voix, limiteur, master à −12 LUFS).
