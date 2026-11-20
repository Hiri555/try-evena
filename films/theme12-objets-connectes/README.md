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

## Les images

Dix plans photographiques générés (`nano-banana-pro`, 2752×1536, puis JPEG 2400 px),
sur une seule direction : nuit, ombres indigo, une lampe ambre dans le champ, contre-jour cyan.
Les invites exactes sont dans `outils/generer_plans.py` — rien n'est irreproductible.

Le film n'est pas en typographie : chaque beat est porté par une photo plein cadre avec
un léger travelling avant ou latéral, et la data-viz se pose dessus. Le plan 33–43 s est
scindé en deux pour que l'opposition *occupant / entreprise* soit littéralement à l'écran.

---

## Mesures

| | |
|---|---|
| durée | 98,40 s (brief : 1 min 50 maximum) |
| image | 1920×1080, 30 i/s, H.264 high@4.0 |
| son | −12,4 LUFS intégré, crête −0,8 dBTP (référence : son film multiplexage, −11,9 LUFS) |
| contrôle HyperFrames | 0 erreur ; contraste 30/30 WCAG AA ; mise en page 0 problème sur 9 échantillons |
| version allégée | 42,0 Mo, SSIM 0,99985 contre le master (38,2 dB) |

Deux fichiers : le master (97,9 Mo, pour la projection) et `_whatsapp` (42,0 Mo, pour l'envoi).
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

La bande son `assets/audio/mix.mp3` contient déjà la voix et la musique mixées
(ducking par `sidechaincompress` sous la voix, limiteur, master à −12 LUFS).
