# 03 — Script · Épisode 1 : « Comment un switch sait où envoyer tes données ? »

**Durée cible :** ~7 min 30 · **Débit :** ~150 mots/min · **Voix :** française, chaleureuse, posée, légèrement complice (pas de ton « pub »)
**Règle :** une idée par phrase. Chaque ligne `VOICE` a son `[V: …]`, l'intention visuelle qui l'accompagne (détail complet dans `04-storyboard.json`).

### Conventions

- `VOICE` = texte envoyé tel quel à ElevenLabs (orthographe pensée pour la prononciation).
- `DISPLAY` = texte technique exact affiché à l'écran / dans les sous-titres quand il diffère.
- `⏸` = silence volontaire (freeze). Se rend dans ElevenLabs avec `<break time="1.2s" />`.
- Les mots en **gras** sont des **ancres de timing** : Whisper les repère, et `05-timeline.json` y accroche un événement visuel.

### Lexique de prononciation (à valider sur le premier essai de voix)

| DISPLAY | VOICE | Note |
|---|---|---|
| PC-A / PC-B | PC A / PC B | vérifier que ce n'est pas lu « pc tiret a » |
| AA:AA | A-A | alias court de `AAAA.AAAA.AAAA` |
| BB:BB | B-B | |
| FFFF.FFFF.FFFF | que des F | jamais épelé |
| VLAN | VLAN | si mal prononcé → « vé-lanne » |
| VLAN 10 / 20 / 30 | VLAN dix / vingt / trente | |
| 802.1Q | huit cent deux point un Q | si ElevenLabs lit « point un cul » → « huit-cent-deux-point-un-Q » ou « dot one Q » |
| trunk | trunk | prononciation anglaise « treunk » |
| Gi0/1 | — | jamais lu, uniquement affiché |

---

## S01 · HOOK — 0:00 → 0:14

`audio/01-hook.mp3`

> [V: Frame 1 déjà pleine : PC-A à gauche, switch au centre, 7 machines en éventail à droite. PC-A émet une trame bleue.]
> VOICE : PC A envoie un message à PC B.

> [V: La trame entre dans le switch. Une bulle de pensée : « Destination inconnue ? ». La trame se duplique en 7 copies vers les 7 machines.]
> VOICE : Et le switch… fait ça.

> [V: FREEZE sur les 7 copies en vol. Compteur « 7 copies » en haut.]
> VOICE : ⏸ Pourquoi ce switch vient-il d'envoyer la même trame **presque partout** ?

> [V: Rewind visuel rapide, puis flash-forward : la même trame ne suit plus qu'un seul chemin, vert.]
> VOICE : Et comment va-t-il apprendre à **ne plus le faire** la prochaine fois ?

*(≈ 38 mots · 14 s — aucun titre avant la fin de cette phrase ; le titre de l'épisode s'inscrit en bas à gauche, discret, pendant la dernière demi-seconde.)*

---

## S02 · PROBLÈME — 0:14 → 0:36

`audio/02-probleme.mp3`

> [V: Caméra recule : le switch est une boîte noire, ses 8 ports sont des portes identiques.]
> VOICE : Un switch, c'est une boîte avec des ports. Des portes, si tu veux.

> [V: Une trame arrive devant les 8 portes. Point d'interrogation au-dessus de chacune.]
> VOICE : À chaque message qui arrive, il doit choisir : par quelle porte je le fais sortir ?

> [V: Le switch s'ouvre en coupe, révélant un petit « cerveau » vide : une table à deux colonnes.]
> VOICE : Pour choisir, il n'a qu'un outil. Une **table**. Et au départ… elle est **vide**.

> [V: La table vide pulse une fois.]
> VOICE : Alors voyons ce qu'il lit exactement dans chaque message.

*(≈ 60 mots · 22 s)*

---

## S03 · CHAPITRE 1 — LA TRAME — 0:36 → 1:10

`audio/03-trame.mp3`

> [V: La trame bleue grossit : c'est une enveloppe numérique.]
> VOICE : Sur un réseau Ethernet, un message voyage dans une **trame**.

> [V: Zoom caméra DANS l'enveloppe. Trois cases apparaissent l'une après l'autre.]
> VOICE : Imagine une enveloppe. Dessus, deux adresses. Dedans, le contenu.

> [V: Case « DESTINATION MAC » s'allume en premier, à gauche.]
> VOICE : D'abord, l'adresse **destination** : à qui c'est adressé.

> [V: Case « SOURCE MAC » s'allume.]
> VOICE : Ensuite, l'adresse **source** : qui l'envoie.

> [V: Case « DATA » s'allume, contenu flouté.]
> VOICE : Puis les **données**. Le switch ne les lit pas.

> [V: Sur la carte réseau de PC-A, gravure « AAAA.AAAA.AAAA » qui se compacte en « AA:AA ».]
> VOICE : Ces adresses s'appellent des adresses **MAC**. Chaque carte réseau a la sienne, sur quarante-huit bits. Pour rester lisibles, on va les abréger : A-A, B-B.
> DISPLAY : Adresse MAC · 48 bits · `AAAA.AAAA.AAAA` → « AA:AA »

> [V: Dézoom : on ressort de l'enveloppe, elle se referme et se replace devant PC-A.]
> VOICE : Dans le vrai réseau, ces champs sont dans l'en-tête Ethernet. Et c'est tout ce dont le switch a besoin.

*(≈ 95 mots · 34 s)*

---

## S04 · CHAPITRE 2 — MAC LEARNING — 1:10 → 1:58

`audio/04-apprentissage.mp3`

> [V: Topologie simplifiée : SW1 à 5 ports, PC-A sur port 1, PC-B sur port 2, PC-C/D/E sur ports 3–5. Table MAC vide à droite : PORT | MAC. Les ports sont nommés P1…P5 (les noms Cisco Fa0/x arrivent au film final).]
> VOICE : Simplifions. Cinq ports. PC A est sur le port **un**. PC B sur le port **deux**.

> [V: PC-A émet la trame (DST BB:BB · SRC AA:AA). Elle avance sur le câble jusqu'au port 1.]
> VOICE : PC A envoie une trame à PC B.

> [V: La trame passe le port 1. Le port 1 s'allume.]
> VOICE : Elle entre par le port un.

> [V: La case « SRC AA:AA » se détache de l'enveloppe et glisse physiquement jusque dans la table → nouvelle ligne « P1 | AA:AA ». Petit « tick ».]
> VOICE : Premier réflexe du switch : il regarde l'adresse **source**. Et il **note** : « A-A se trouve derrière le port un ».

> [V: La ligne de table se colore en vert pâle, étiquette « appris ».]
> VOICE : C'est ça, l'**apprentissage**. Le switch apprend où sont les machines en observant qui **parle**.

> [V: La case « DST BB:BB » clignote. Point d'interrogation. FREEZE.]
> VOICE : Question piège. Est-ce qu'il apprend aussi la **destination** ? ⏸

> [V: « DST BB:BB » tente d'entrer dans la table, rebondit. Gros « NON » rouge.]
> VOICE : **Non**. Jamais.

> [V: Texte à l'écran : « SOURCE → apprendre » / « DESTINATION → décider ».]
> VOICE : La destination dit où la trame *veut* aller. Pas où se trouve B-B. Le switch apprend avec la source. Il **décide** avec la destination.
> DISPLAY : SOURCE → apprendre · DESTINATION → décider

*(≈ 120 mots · 48 s)*

---

## S05 · CHAPITRE 3 — UNKNOWN UNICAST & FLOODING — 1:58 → 3:05

`audio/05-flooding.mp3`

> [V: La table n'a qu'une ligne (AA:AA). Un faisceau de recherche balaie la table pour « BB:BB ».]
> VOICE : Maintenant, décider. Le switch cherche B-B dans sa table.

> [V: Le balayage échoue. Bandeau rouge clignotant « LOOKUP MISS ».]
> VOICE : **Rien**. Destination inconnue.

> [V: Pause de 0,5 s. Puis la trame se duplique : 4 copies vers ports 2, 3, 4, 5. Le port 1 reste gris, cadenas « port d'entrée ».]
> VOICE : Alors il fait la seule chose raisonnable : il envoie une **copie** sur **tous les autres ports**. Sauf celui d'où elle vient.

> [V: Le mot « FLOODING » s'inscrit au-dessus des 4 flèches.]
> VOICE : Ça s'appelle le **flooding**. L'inondation.

> [V: Les copies arrivent. PC-C, D, E : la trame se dissout avec un petit « pas pour moi ». PC-B : la trame est acceptée, halo vert.]
> VOICE : C, D et E comparent la destination avec leur propre adresse. Ce n'est pas pour eux : ils **jettent** la trame. Seul B la garde.

> [V: PC-B répond : nouvelle trame (DST AA:AA · SRC BB:BB) qui entre par le port 2.]
> VOICE : Et maintenant, B **répond**.

> [V: « SRC BB:BB » glisse dans la table → ligne « P2 | BB:BB ». Tick.]
> VOICE : Sa réponse entre par le port deux. Source : B-B. Le switch **apprend** : « B-B, port deux ».

> [V: Lookup AA:AA → ligne 1 surlignée orange (hit). Une seule flèche verte vers le port 1.]
> VOICE : Et la destination, A-A ? Il la connaît déjà. Une seule sortie : le port un.

> [V: Écran partagé. Gauche : 1er échange, 4 flèches, étiquette « avant ». Droite : nouvel envoi A→B, lookup hit, UNE flèche verte vers le port 2. Les ports 3–5 restent silencieux.]
> VOICE : Et la prochaine fois que A parle à B ? **Une seule flèche**. Le switch a appris. Il ne floode plus.
> DISPLAY : Avant : 4 copies · Après : 1

*(≈ 170 mots · 67 s)*

---

## S06 · CHAPITRE 4 — BROADCAST — 3:05 → 3:40

`audio/06-broadcast.mp3`

> [V: Même topologie. PC-A émet une trame dont la destination est « FFFF.FFFF.FFFF », en jaune.]
> VOICE : Parfois, A **veut** parler à tout le monde. Par exemple pour demander : « qui a telle adresse IP ? »

> [V: Zoom sur la destination : que des F. Le mot « BROADCAST » en jaune.]
> VOICE : Il met alors une adresse destination spéciale : que des **F**. C'est une **broadcast**.
> DISPLAY : Destination `FFFF.FFFF.FFFF` = broadcast

> [V: Pulsation jaune concentrique depuis le switch vers les ports 2–5. Tous les PC s'allument en jaune (tous traitent).]
> VOICE : Le switch l'envoie sur tous les ports, sauf l'entrée. Et cette fois, **tout le monde** la lit.

> [V: Comparaison côte à côte. Gauche : UNKNOWN UNICAST (bleu, flèches, 1 seul PC garde). Droite : BROADCAST (jaune, pulsation, tous gardent). Deux lignes de légende.]
> VOICE : Donc, deux inondations différentes. L'une par **ignorance** : elle disparaît dès que le switch a appris. L'autre par **nature** : elle revient à chaque fois.
> DISPLAY : Unknown unicast → ignorance, disparaît après apprentissage · Broadcast → voulue, toujours floodée

*(≈ 85 mots · 35 s)*

---

## S07 · CHAPITRE 5 — POURQUOI LES VLAN — 3:40 → 4:32

`audio/07-vlan.mp3`

> [V: Zoom arrière. Un gros switch 24 ports. Trois groupes de PC étiquetés COMPTABILITÉ, GAMING, SUPPORT, tous gris.]
> VOICE : Agrandissons. Un gros switch. Trois équipes : la compta, le gaming, le support.

> [V: Un PC du gaming émet une broadcast. Pulsation jaune qui touche les 3 équipes. Compteur « 17 machines dérangées ».]
> VOICE : Un PC du gaming envoie une broadcast. Et la compta la reçoit. Le support aussi. **Tout le monde**.

> [V: Les pulsations se multiplient (plusieurs PC du gaming), la compta clignote de plus en plus. Icône « bruit ».]
> VOICE : Multiplie ça par des centaines de machines. Tout ce bruit arrive chez des gens qui n'en ont rien à faire.

> [V: Trois switches fantômes apparaissent en pointillé avec un prix, puis sont barrés.]
> VOICE : Et si on voulait **trois réseaux séparés**… sans acheter trois switches ?

> [V: Le switch se découpe en trois zones colorées : bleu VLAN 10 (compta), violet VLAN 20 (gaming), orange VLAN 30 (support).]
> VOICE : On découpe le switch. Trois **VLAN**. VLAN dix, vingt, trente.
> DISPLAY : VLAN 10 · Compta · VLAN 20 · Gaming · VLAN 30 · Support

> [V: Nouvelle broadcast du gaming : la pulsation jaune reste à l'intérieur de la zone violette, s'écrase contre la frontière.]
> VOICE : Relance la même broadcast. Elle reste dans le violet.

> [V: Analogie : les trois zones deviennent brièvement trois étages d'un immeuble, puis retour au switch.]
> VOICE : Un peu comme trois étages d'un même immeuble. Dans le vrai réseau, chaque VLAN est un **domaine de broadcast** séparé : le switch ne floode jamais une trame hors de son VLAN.

*(≈ 125 mots · 52 s)*

---

## S08 · CHAPITRE 6 — PORT D'ACCÈS — 4:32 → 5:02

`audio/08-access.mp3`

> [V: Gros plan : un PC gris relié au port Fa0/3. Le port prend la couleur bleue. Le PC reste gris.]
> VOICE : Mais comment le switch sait-il qu'un PC est dans le VLAN dix ? Ce n'est pas le PC qui le dit. C'est le **port**.

> [V: Petit bandeau terminal en bas : `switchport mode access` / `switchport access vlan 10`.]
> VOICE : L'administrateur configure le port en **port d'accès**, dans le VLAN dix.
> DISPLAY : `interface Fa0/3` · `switchport mode access` · `switchport access vlan 10`

> [V: Une trame sort du PC : aucune étiquette. Elle entre dans le port bleu et devient « bleue » à l'intérieur du switch (halo, pas d'étiquette).]
> VOICE : Le PC envoie une trame tout à fait normale. **Aucune** étiquette. Il ne sait même pas qu'il est dans un VLAN. C'est le switch qui fait le rattachement.

*(≈ 75 mots · 30 s)*

---

## S09 · CHAPITRE 7 — DEUX SWITCHES — 5:02 → 5:34

`audio/09-trunk.mp3`

> [V: Déplacement latéral : SW1 et SW2 côte à côte. Chacun a des ports bleus (VLAN 10) et violets (VLAN 20).]
> VOICE : Maintenant, deux switches. Des deux côtés, il y a du VLAN dix et du VLAN vingt.

> [V: Question en surimpression.]
> VOICE : Pour les relier, faut-il **un câble par VLAN** ?

> [V: Un câble bleu, un câble violet se tirent. Puis 30, 40… un faisceau qui déborde. Compteur de câbles/ports qui grimpe, voyant rouge.]
> VOICE : Avec deux VLAN, deux câbles. Avec cinquante VLAN… cinquante câbles. Et cinquante ports gaspillés.

> [V: Les câbles se fusionnent en un seul câble épais, rayé bleu/violet, étiquette « TRUNK ».]
> VOICE : La solution : un seul lien, qui transporte **tous** les VLAN. Un **trunk**.
> DISPLAY : `switchport mode trunk`

> [V: Analogie flash : l'ascenseur partagé entre les étages.]
> VOICE : Comme un ascenseur partagé par tous les étages. Mais alors… à l'arrivée, comment savoir de quel étage vient chaque trame ?

*(≈ 90 mots · 32 s)*

---

## S10 · CHAPITRE 8 — 802.1Q — 5:34 → 6:18

`audio/10-8021q.mp3`

> [V: Une trame bleue (VLAN 10) sort de SW1 vers le trunk. Juste avant l'entrée du trunk : la trame s'arrête.]
> VOICE : Réponse : au moment d'entrer dans le trunk, le switch **ajoute** une information à la trame.

> [V: Un petit badge bleu « VLAN 10 » se fixe sur la trame. Label « 802.1Q ».]
> VOICE : Un **tag**. C'est la norme **huit cent deux point un Q**.
> DISPLAY : Tag IEEE 802.1Q · VLAN ID = 10

> [V: Zoom dans l'en-tête : DST | SRC | TYPE | DATA. Les champs TYPE et DATA glissent vers la droite, un champ de 4 octets « 802.1Q · VLAN 10 » s'insère entre SRC et TYPE.]
> VOICE : Attention, ce n'est pas un autocollant. C'est un **champ** de quatre octets, inséré dans l'en-tête Ethernet, juste après l'adresse source. Il contient le numéro de VLAN.
> DISPLAY : 4 octets · inséré après la MAC source · VLAN ID sur 12 bits

> [V: Dézoom. La trame taguée traverse le trunk. SW2 lit le badge : scan orange « VLAN 10 ».]
> VOICE : De l'autre côté, SW2 **lit** le tag : VLAN dix.

> [V: SW2 ne considère que les ports bleus. Le badge se détache et tombe, la trame sort par un port d'accès bleu, sans tag.]
> VOICE : Il envoie la trame uniquement vers le VLAN dix. Et avant de la donner au PC, il **retire** le tag. Le PC reçoit une trame normale.

*(≈ 110 mots · 44 s)*

---

## S11 · FINAL MENTAL MOVIE — 6:18 → 7:08

`audio/11-film-final.mp3`

> [V: Topologie complète : PC-A (VLAN 10) — SW1 — trunk — SW2 — PC-B (VLAN 10), plus des PC violets distracteurs. Panneau HUD à droite : SRC MAC · DST MAC · VLAN · PORT · DÉCISION. La caméra suit la trame.]
> VOICE : Faisons tout le voyage d'un coup.

> [V: HUD : SRC AA:AA · DST BB:BB · VLAN — (non tagué) · PORT SW1 Fa0/1 · DÉCISION « entrée access VLAN 10 ».]
> VOICE : PC A envoie une trame normale, sans tag. Elle entre dans SW1 par un port d'accès du VLAN dix.

> [V: Table SW1 — ligne « 10 | AA:AA | Fa0/1 » s'insère. La colonne VLAN apparaît pour la première fois ; les ports prennent leur nom Cisco (P1 → Fa0/1), petite note « sur un vrai switch Cisco ».]
> VOICE : SW1 apprend A-A, dans le VLAN dix, port un. Tu remarques ? La vraie table a une colonne de plus : le **VLAN**.

> [V: Lookup BB:BB dans VLAN 10 → hit « 10 | BB:BB | Gi0/1 (trunk) ». HUD DÉCISION : « forward → trunk ».]
> VOICE : Il cherche B-B dans le VLAN dix. Connu, derrière le trunk.

> [V: Tag bleu VLAN 10 se fixe. HUD VLAN : 10 (tagué).]
> VOICE : Sur le trunk, il ajoute le tag : VLAN dix.

> [V: Caméra suit la trame sur le trunk jusqu'à SW2. Scan du tag. Lookup BB:BB VLAN 10 → Fa0/2.]
> VOICE : SW2 lit le tag, cherche B-B dans le VLAN dix. Port deux.

> [V: Le tag se détache. HUD VLAN : — (non tagué) · PORT SW2 Fa0/2 · DÉCISION « forward, tag retiré ». PC-B s'allume vert.]
> VOICE : Il retire le tag, et livre la trame à PC B. Source, destination, VLAN, port, décision. Tout le switching est là.

*(≈ 120 mots · 50 s)*

---

## S12 · MICRO QUIZ — 7:08 → 7:48

`audio/12-quiz.mp3`

> [V: Carte quiz Q1 : une trame SRC CC:CC → DST DD:DD entre par le port 3. « Que note le switch ? » Deux choix : « CC:CC / port 3 » · « DD:DD / port 3 ». FREEZE 2 s, puis bonne réponse en vert.]
> VOICE : Question un. Une trame de C-C vers D-D entre par le port trois. Qu'est-ce que le switch apprend ? ⏸ C-C, port trois. Toujours la **source**.

> [V: Q2 : un PC branché sur un port d'accès VLAN 20. « La trame sortant du PC porte-t-elle un tag ? » FREEZE, puis « NON » + PC gris.]
> VOICE : Question deux. Un PC est sur un port d'accès du VLAN vingt. Sa trame porte-t-elle un tag ? ⏸ Non. Sur un port d'accès, pas de tag.

> [V: Q3 : PC-A bleu VLAN 10 et PC-B violet VLAN 20 sur le même switch. « Peuvent-ils communiquer directement ? » FREEZE. Puis un mur apparaît entre bleu et violet ; silhouette d'un routeur au-dessus.]
> VOICE : Question trois. PC A dans le VLAN dix, PC B dans le VLAN vingt, sur le même switch. Peuvent-ils se parler directement ? ⏸ **Non**. Deux VLAN, deux réseaux. Pour passer de l'un à l'autre, il faut un **routeur**. Ce sera pour un prochain épisode.

*(≈ 110 mots · 40 s — chaque ⏸ = 1,8 s)*

---

## S13 · RÉCAP + CONCLUSION — 7:48 → 8:15

`audio/13-recap.mp3`

> [V: Les images-clés reviennent en miniature, une par phrase, et s'assemblent en un seul schéma (le FINAL MENTAL MODEL).]
> VOICE : Récapitulons. La source, pour **apprendre**. La destination, pour **décider**. Inconnue ? On **floode**. Broadcast ? On floode, toujours. Le VLAN garde chaque inondation dans sa couleur. Et le trunk transporte toutes les couleurs, grâce au tag.

> [V: Teaser : deux switches reliés par DEUX câbles. Une broadcast jaune part et commence à tourner en boucle, compteur 1, 2, 4, 8… Coupe nette.]
> VOICE : Mais que se passe-t-il si deux switches sont reliés… **deux fois** ? ⏸ Prochain épisode.

*(≈ 60 mots · 27 s)*

---

## Totaux

| Section | Mots (VOICE) | Durée estimée |
|---|---|---|
| S01 Hook | 38 | 0:14 |
| S02 Problème | 60 | 0:22 |
| S03 Trame | 95 | 0:34 |
| S04 Apprentissage | 120 | 0:48 |
| S05 Flooding | 170 | 1:07 |
| S06 Broadcast | 85 | 0:35 |
| S07 VLAN | 125 | 0:52 |
| S08 Port d'accès | 75 | 0:30 |
| S09 Trunk | 90 | 0:32 |
| S10 802.1Q | 110 | 0:44 |
| S11 Film final | 120 | 0:50 |
| S12 Quiz | 110 | 0:40 |
| S13 Récap | 60 | 0:27 |
| **Total** | **~1 260** | **~8:15** |

**Piste de compression (étape 15, après le premier rendu) :** candidats à couper si la compréhension tient sans eux : S02 phrase 4 (transition), S07 phrase 3 (« multiplie ça… »), l'analogie ascenseur en S09 (déjà portée par l'immeuble en S07), la 2ᵉ phrase de S13. Gain estimé : ~30 s → ~7:45.
