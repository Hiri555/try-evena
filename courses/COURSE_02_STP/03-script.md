# 03 — Script · Épisode 2 : « La petite boucle qui peut détruire un LAN »

**Durée cible :** ~6 min 45 · **Voix :** ElevenLabs **v3** (`eleven_v3`), française, énergique, complice.
**Nouveauté v3 :** balises d'expression entre crochets dans `VOICE` (`[dramatic]`, `[curious]`, `[excited]`, `[whispers]`, `[short pause]`, `[long pause]`). Elles ne sont pas prononcées ; elles sont retirées des sous-titres.

### Conventions
- `VOICE` = texte envoyé à ElevenLabs · `DISPLAY` = notation technique à l'écran · `[V: …]` = intention visuelle · **gras** = ancre de timing.
- Lexique : SW1/SW2/SW3 → « le switch un / deux / trois » · « Fa0/1 » jamais lu · 32769 → « trente-deux mille sept cent soixante-neuf » · RSTP → « R-S-T-P » · BPDU → « B-P-D-U » · STP → « S-T-P ».

---

## S01 · HOOK — la tempête

`audio/01-hook.mp3`

> [V: Frame 1 pleine : triangle SW1 (haut) · SW2 (bas gauche) · SW3 (bas droite), 2 PC par switch. PC-A (sur SW2) émet UNE trame jaune. Compteur « 1 COPIE ».]
> VOICE : [dramatic] Une seule trame. Un seul petit **broadcast**.

> [V: La trame se divise, tourne dans les deux sens, chaque passage crache des copies vers les PC ; le compteur s'emballe (ralenti → temps réel), l'écran se remplit de jaune, alarme rouge, secousse.]
> VOICE : [short pause] Et regarde ce qu'elle **devient**.

> [V: Freeze sur l'écran saturé. Compteur ~48 000.]
> VOICE : [long pause] Une seule trame vient de déclencher **ça**.

> [V: Zoom dans une trame : en-tête DST | SRC | TYPE… et un emplacement « TTL » barré, vide.]
> VOICE : Et contrairement à un paquet IP, une trame Ethernet n'a pas de **TTL**. Rien ne la fait mourir. [whispers] Elle tourne… pour **toujours**.
> DISPLAY : Paquet IP : TTL ✓ · Trame Ethernet : pas de TTL ✗

*(Titre qui claque ensuite : « LA PETITE BOUCLE QUI PEUT DÉTRUIRE UN LAN ».)*

---

## S02 · POURQUOI — la mécanique de la tempête

`audio/02-tempete.mp3`

> [V: Rewind rapide. Ralenti : PC-A → SW2.]
> VOICE : Rembobinons. PC A envoie un broadcast. Le switch deux fait exactement ce qu'on lui a appris : il **l'inonde**. Une copie vers le switch un. Une copie vers le switch trois.

> [V: SW1 renvoie vers SW3, SW3 renvoie vers SW1 ; les deux copies se croisent.]
> VOICE : Le switch un reçoit sa copie… et l'inonde à son tour, vers le switch trois. Le switch trois fait pareil, vers le switch un.

> [V: Les deux copies reviennent à SW2, repartent, en boucle, deux flèches circulaires.]
> VOICE : Et les deux copies **reviennent**. Puis repartent. Dans les deux sens. [short pause] Sans fin.

> [V: Chaque passage éjecte une copie vers chaque PC ; chrono « 1 tour ≈ quelques µs ».]
> VOICE : À chaque tour, chaque PC en reçoit une nouvelle copie. À un gigabit, un tour prend quelques **microsecondes**. Des dizaines de milliers de copies… par seconde.

> [V: D'autres PC envoient ARP/DHCP : nouvelles trames jaunes qui rejoignent la ronde ; jauges « lien 100 % » et « CPU 100 % » en rouge.]
> VOICE : Et chaque nouveau broadcast, une requête ARP, une demande DHCP, vient **s'ajouter** à la tempête. Les liens saturent. Les processeurs aussi.

> [V: Table MAC de SW1 en gros : ligne AA:AA dont le port bascule Fa0/1 ↔ Gi0/2, clignote rouge.]
> VOICE : [curious] Pire : regarde la **table MAC** du switch un. La même adresse source arrive tantôt par un port… tantôt par l'autre. Le switch réécrit sa table sans arrêt. Il ne sait plus où se trouve PC A.
> DISPLAY : instabilité de la table MAC

> [V: Trois icônes : tempête · copies multiples · table MAC folle → convergent vers une seule boucle rouge.]
> VOICE : Trois symptômes. Une seule cause : une **boucle**.

---

## S03 · MÉTAPHORE — les trois ronds-points

`audio/03-metaphore.mp3`

> [V: Morph : le triangle devient trois ronds-points (clip vidéo IA), une voiture jaune tourne sans fin, traînées lumineuses.]
> VOICE : Imagine trois **ronds-points** reliés en triangle. Et une voiture sans destination. Elle tourne. Et tourne. [short pause] Et ne sort jamais.

> [V: Retour aux switches.]
> VOICE : Dans le vrai réseau, il n'y a pas de conducteur fatigué : aucun compteur n'arrête la trame, et le switch ne se souvient pas de l'avoir **déjà vue**.

---

## S04 · L'IDÉE DE STP

`audio/04-idee.mp3`

> [V: Une paire de ciseaux coupe le lien SW1–SW2 ; puis un éclair casse SW1–SW3 → SW2 isolé, voyant rouge.]
> VOICE : Alors, on retire un câble ? [short pause] Mauvaise idée. Ce câble, c'est ton **plan B**. Le jour où un autre lien casse, tu es coupé.

> [V: Rewind : les 3 câbles reviennent. Une barrière fantôme violette apparaît sur un lien.]
> VOICE : La vraie solution : garder **tous** les câbles… mais en désactiver un, logiquement. C'est le travail du **Spanning Tree Protocol**. S-T-P.

> [V: Carte de quête en 4 étapes (icônes) : couronne · chemin vert · câble un-par-un · barrière.]
> VOICE : Son plan tient en quatre étapes : élire un **chef**. Trouver le meilleur chemin vers lui. Choisir un port par câble. Et **bloquer** le reste.

---

## S05 · ÉTAPE 1 — L'ÉLECTION DU ROOT BRIDGE

`audio/05-election.mp3`

> [V: Les switches s'envoient des enveloppes violettes (BPDU) ; chacun lève une carte « BRIDGE ID ».]
> VOICE : Étape un : l'élection du chef, le **Root Bridge**. Les switches s'envoient des messages de contrôle, des B-P-D-U. Chacun y annonce son identifiant : le **Bridge ID**.

> [V: La carte se déplie en deux cases : PRIORITÉ | MAC.]
> VOICE : Un Bridge ID, c'est deux choses : une **priorité**… et l'adresse **MAC** du switch.

> [V: Tournoi : trois podiums. Round 1 : les priorités se retournent : 32769 / 32769 / 32769 → bandeau « ÉGALITÉ ».]
> VOICE : Premier round : la priorité. Le plus **petit** gagne. [short pause] Trente-deux mille sept cent soixante-neuf partout : la valeur par défaut. **Égalité**.
> DISPLAY : 32769 = 32768 + VLAN 1

> [V: Round 2 : les MAC s'affichent, se comparent (…0001 < …0002 < …0003) ; SW1 s'illumine ; la couronne (image IA) descend sur SW1.]
> VOICE : Deuxième round, le départage : l'adresse MAC. La plus petite l'emporte. [excited] Le switch un reçoit la **couronne**. C'est lui, le Root Bridge.

> [V: Bandeau géant « LE PLUS PETIT GAGNE ». CLI discret : `spanning-tree vlan 1 priority 24576`.]
> VOICE : Retiens-le : dans S-T-P, c'est **toujours** le plus petit qui gagne. Et si tu veux choisir ton chef toi-même, il suffit de baisser sa priorité.

---

## S06 · ÉTAPE 2 — LE ROOT PORT

`audio/06-root-port.mp3`

> [V: Les câbles s'étiquettent : SW1–SW2 « 100 Mb/s · coût 19 », SW1–SW3 et SW2–SW3 « 1 Gb/s · coût 4 ».]
> VOICE : Étape deux. Chaque switch qui n'est pas root cherche son **meilleur chemin** vers la couronne. Mais « meilleur » ne veut pas dire « le plus court ». Chaque lien a un **coût** : un gigabit coûte quatre, cent mégabits coûtent dix-neuf.
> DISPLAY : 1 Gb/s = 4 · 100 Mb/s = 19

> [V: Depuis SW3, deux chemins s'animent avec leur somme : direct 4 / détour 4+19 = 23. Le direct devient vert.]
> VOICE : Le switch trois d'abord. Chemin direct : **quatre**. Détour par le switch deux : quatre plus dix-neuf, vingt-trois. Le direct gagne. Ce port devient son **Root Port**.

> [V: Depuis SW2 : direct 19 (rouge-orangé) / détour 4+4 = 8. Suspense 1 s, puis le détour s'allume en vert.]
> VOICE : Le switch deux, maintenant. Direct vers le root… mais c'est le lien lent : **dix-neuf**. Par le switch trois : quatre, plus quatre… **huit**. [excited] Surprise : c'est le **détour** qui gagne !

> [V: Badge « RP » posé sur SW2 Gi0/2 et SW3 Gi0/1.]
> VOICE : Un Root Port, c'est le port au **coût le plus faible** vers le root. Un seul par switch.

---

## S07 · ÉTAPE 3 — LE PORT DÉSIGNÉ, CÂBLE PAR CÂBLE

`audio/07-designated.mp3`

> [V: Le reste de l'écran s'assombrit ; seul le câble SW1–SW3 reste allumé.]
> VOICE : Étape trois. On regarde chaque **câble**, un par un. Sur chaque câble, un seul port a le droit de transmettre : le **port désigné**.

> [V: Segment SW1–SW3 : côté SW1 → badge « DP ». Puis segment SW1–SW2 : côté SW1 → « DP ».]
> VOICE : Câble entre le switch un et le switch trois. D'un côté, le root. Tous les ports du root sont désignés. Facile. Câble entre le un et le deux : même chose.

> [V: Segment SW2–SW3 : badges de coût « 8 » côté SW2, « 4 » côté SW3 ; le 4 gagne → « DP » côté SW3.]
> VOICE : Dernier câble, entre le deux et le trois. Qui est le plus proche du root ? Le switch trois, à **quatre**. Le switch deux est à huit. Le port du switch trois devient **désigné**. [short pause] En cas d'égalité ? On départage au Bridge ID. Le plus petit, toujours.

---

## S08 · ÉTAPE 4 — LE BLOCAGE

`audio/08-blocage.mp3`

> [V: Tous les badges visibles (RP, DP) ; un seul port sans badge clignote : SW2 Fa0/1.]
> VOICE : Étape quatre. Il reste un port qui n'est ni root, ni désigné : celui du switch deux, sur le lien lent. Ce port-là, S-T-P le **bloque**.

> [V: Une barrière rouge tombe (impact). Le câble reste visible, en pointillés derrière.]
> VOICE : [serious] Le câble existe toujours. S-T-P a simplement **retiré** ce chemin de la topologie active.

> [V: Des BPDU violettes arrivent sur la barrière et sont « lues ».]
> VOICE : Un port bloqué ne transmet aucune trame de données… mais il **écoute** toujours les B-P-D-U. Il reste en veille.

> [V: Replay du broadcast de PC-A : chaque PC le reçoit une fois, puis plus rien. Compteur figé à 6.]
> VOICE : Relançons le même broadcast. Chaque PC le reçoit… **une seule fois**. Et il s'arrête. [short pause] La boucle a disparu. L'arbre est formé.

---

## S09 · LA PANNE — REDONDANCE ≠ BOUCLE ACTIVE

`audio/09-panne.mp3`

> [V: Le lien SW2–SW3 casse : étincelles, rouge, secousse.]
> VOICE : Et maintenant, le vrai test. [dramatic] Le lien entre le switch deux et le switch trois **casse**.

> [V: SW2 perd son badge RP ; point d'interrogation.]
> VOICE : Le switch deux perd son Root Port. Il est coupé du root ?

> [V: La barrière se lève, le lien lent devient vert, badge « RP » ; le trafic repasse.]
> VOICE : **Non**. Le port bloqué se réveille. Il devient le nouveau Root Port, et le trafic **repasse**.

> [V: Deux chronos côte à côte : « 802.1D : jusqu'à 50 s » / « RSTP : ~1 s ».]
> VOICE : Avec le S-T-P d'origine, cette bascule peut prendre jusqu'à **cinquante secondes**. Avec sa version rapide, le **R-S-T-P**, ce port était déjà prévu comme remplaçant : on l'appelle le port **Alternate**. La bascule est quasi **instantanée**.
> DISPLAY : 802.1D ≈ 30–50 s · RSTP (802.1w) ≈ 1 s · rôle Alternate

> [V: Slam géant : « REDONDANCE ≠ BOUCLE ACTIVE ».]
> VOICE : Voilà l'idée clé : la **redondance**, c'est bien. Une boucle **active**, c'est la catastrophe. S-T-P te donne l'une… sans l'autre.

---

## S10 · ETHERCHANNEL

`audio/10-etherchannel.mp3`

> [V: SW1 et SW2 seuls, quatre câbles parallèles se tirent.]
> VOICE : Dernier cas. Tu veux plus de bande passante entre deux switches : tu branches **quatre** câbles.

> [V: Trois barrières tombent en rafale (3 impacts). Compteur « 1 / 4 liens utilisés ».]
> VOICE : Pour S-T-P, quatre câbles parallèles… ce sont des boucles. Il en **bloque trois**. Tu as payé quatre liens, tu en utilises un.

> [V: Les quatre câbles se rapprochent et fusionnent dans une gaine lumineuse « Port-channel 1 » ; les barrières disparaissent ; image IA autoroute en insert.]
> VOICE : La solution : l'**EtherChannel**. On regroupe les quatre liens en un seul lien logique : un **Port-Channel**. Comme les quatre voies d'une autoroute : une seule route… mais le trafic se répartit sur toutes les voies.
> DISPLAY : `channel-group 1 mode active`

> [V: STP ne voit plus qu'un lien : badge unique ; des flux de couleurs différentes empruntent des câbles différents.]
> VOICE : S-T-P ne voit plus qu'**un seul** lien. Plus rien à bloquer. Les quatre câbles travaillent.

---

## S11 · QUIZ

`audio/11-quiz.mp3`

> [V: Nouveau triangle SW-A / SW-B / SW-C, tous « 1 Gb/s · coût 4 », cartes BID visibles : A 32769 · …00AA · B 28673 · …00BB · C 32769 · …000C.]
> VOICE : À toi de jouer. Trois switches, tous reliés à un gigabit. Voici leurs Bridge ID.

> [V: Q1, chrono circulaire. Réponse : couronne sur SW-B.]
> VOICE : Question un : qui est le **Root Bridge** ? [long pause] Le switch B. Sa priorité est plus basse : vingt-huit mille six cent soixante-treize. Sa MAC n'a même pas besoin d'être comparée.

> [V: Q2. Deux chemins depuis SW-A : direct 4 / détour 8 → direct vert.]
> VOICE : Question deux : quel est le **Root Port** du switch A ? [long pause] Son port direct vers B : coût quatre, contre huit par le détour.

> [V: Q3. Segment A–C : « 4 = 4 » égalité → cartes BID comparées → C gagne → DP côté C, barrière côté A.]
> VOICE : Question trois : quel port est **bloqué** ? [long pause] Regarde le câble entre A et C. Les deux sont à quatre du root : égalité. On départage au Bridge ID : même priorité, mais la MAC de C est plus petite. Le port de C est désigné… et celui de **A** est bloqué.

---

## S12 · RÉCAP + TEASER

`audio/12-recap.mp3`

> [V: Vignettes qui s'empilent : tempête · couronne · chemin vert · câble + DP · barrière · Port-channel.]
> VOICE : Récapitulons. Une boucle, c'est une tempête de broadcasts et une table MAC qui devient folle. S-T-P élit un **Root Bridge** : le plus petit Bridge ID. Chaque switch garde un **Root Port** : le coût le plus bas. Chaque câble, un **port désigné**. Tout le reste est **bloqué**… mais prêt à servir. Et l'**EtherChannel** fait de plusieurs câbles un seul lien.

> [V: Le triangle s'éloigne, un routeur apparaît au loin, lumineux.]
> VOICE : [curious] Prochain épisode : on quitte le switch… pour entrer dans le **routeur**.
