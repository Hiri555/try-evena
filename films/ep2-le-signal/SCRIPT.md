# 🎬 TÉLÉCOMS PAR SATELLITE — ÉPISODE 2
## **LE SIGNAL** · script de production

---

## Ce qui manque à l'épisode 1

J'ai relu ton manuel v2 (signé BIG MAGASS) contre ce que l'épisode 1 raconte.
L'épisode 1 traite de **mécanique orbitale** : comment on met l'objet là-haut et comment
on l'y garde. Il ne dit **rien** de trois modules entiers du manuel :

| Module manquant | Statut dans l'ép. 1 |
|---|---|
| **07 · INTELSAT** — séries I→IX, stabilisation, régions, faisceaux, bruit du ciel | absent |
| **08 · VSAT** — définition, étoile/maillé, G/T, applications | absent |
| **06 bis · Plan de bande C détaillé** — les 3 segments, la transposition, **le croisement** | absent |
| **Polarisation LHCP / RHCP** et la réutilisation ×2 | absent |
| **Pourquoi 6 et 4 GHz** (fenêtre micro-ondes, bruit du ciel) | absent |
| **A = 22 + 20·log(D/λ)** et **G/T = G − 10·log(T)** | absent |

Et surtout : le manuel marque d'un 🔑 **un seul point**, « le piège du bas de bande
descendant ». L'épisode 1 ne l'approche même pas. **C'est le cœur de l'épisode 2.**

L'épisode 1 répondait à *comment il tient en place*.
L'épisode 2 répond à **ce qui passe à travers, et pourquoi là précisément**.

---

## L'idée de mise en scène

L'épisode 1 était du motion design 2D éditorial. Le sujet de l'épisode 2 est un **plan de
fréquences** — c'est-à-dire, par nature, une ligne. Fait en barres 2D, c'est illisible et
oubliable.

**Donc : on le met en volume.** Les deux bandes deviennent deux rails physiques dans
l'espace, et on *voit* le segment de fin de bande plonger et traverser pour se ranger
tout en bas. Le croisement n'est plus une phrase à apprendre, c'est un geste.

Même logique pour la polarisation : un champ qui tourne, c'est une hélice. Deux hélices
contrarotatives sur le même axe, ça ne se dessine pas en 2D — ça se filme.

**Blender** prend donc 4 plans, chacun parce qu'il n'y a pas d'autre moyen de le montrer.
Le reste reste en canvas/GSAP, comme l'épisode 1. Cohérence de palette garantie : le
rendu Blender utilise exactement `#13243C` / `#F3ECE0` / `#C9792A` / `#2F7D78`.

---

## Découpage

| # | Chapitre | Durée | Outil |
|---|---|---|---|
| 00 | L'accroche | 0:13 | plate Veo + canvas |
| 01 | Le répéteur | 0:32 | **Blender** |
| 02 | **Le plan de bande — le croisement** | 0:58 | **Blender** ⭐ |
| 03 | **La polarisation** | 0:48 | **Blender** ⭐ |
| 04 | Pourquoi 6 et 4 GHz | 0:32 | canvas |
| 05 | Les faisceaux | 0:35 | canvas + **Blender** |
| 06 | Intelsat, I à IX | 0:36 | canvas |
| 07 | La VSAT | 0:32 | canvas |
| 08 | Les deux chiffres | 0:38 | canvas |
| 09 | La fiche | 0:34 | canvas |

**≈ 6 min 00** de voix, ~6 min 20 montés. C'est plus long que l'épisode 1 (4:31) parce
que le contenu l'est. Si tu veux rester sous 5 min, je coupe 06 et 08 — dis-le-moi.

---

## 00 · L'ACCROCHE — 0:13

> [curious] Épisode un : on l'a mis en place, et on l'y maintient. [pause] Maintenant la
> vraie question. [warm] Qu'est-ce qui passe réellement à travers ?

**Image** — le plan Veo de clôture de l'épisode 1, repris à l'envers : on repart de la
Terre lointaine et on se rapproche du satellite. Carton **ÉPISODE 2 · LE SIGNAL**.

---

## 01 · LE RÉPÉTEUR — 0:32

> À bord, le satellite n'a pas de cerveau. Il a des répéteurs. [pause] Chacun fait trois
> choses, toujours les mêmes : il reçoit la porteuse qui monte, il l'amplifie — elle est
> arrivée épuisée après trente-six mille kilomètres — et il la renvoie.
> [calm] Mais entre les deux, il la décale. Il la descend de deux mille deux cent
> vingt-cinq mégahertz. Six gigahertz deviennent quatre.
> [pause] Pourquoi ce décalage ? Parce que le satellite émet et reçoit en même temps.
> S'il réémettait sur sa fréquence d'écoute, [posé] il se rendrait sourd.

**Image — Blender.** La chaîne du répéteur comme un objet réel : une onde ambre entre par
une antenne, traverse trois blocs (RÉCEPTION → AMPLI → CONVERSION), et ressort sarcelle
par l'autre. Au moment de la conversion, le chiffre bascule 6 000 → 4 000 à l'écran.
Caméra en léger travelling latéral le long de la chaîne.

**Son** — un souffle qui entre, un « clac » de commutation sur la conversion.

---

## 02 · LE PLAN DE BANDE — 0:58 ⭐ *le cœur*

> La bande C, ce n'est pas un bloc. [pause] C'est trois morceaux, collés par l'histoire.
> Au début, cinq cents mégahertz. Puis on a ajouté soixante-quinze en bas. Puis deux cent
> vingt-cinq en haut. [pause] Total : huit cents mégahertz à la montée, huit cents à la
> descente.
> [calm] La bande principale descend de deux mille deux cent vingt-cinq. Le petit morceau
> du bas aussi. Tout va bien.
> [pause] Et puis il y a le dernier morceau. Celui tout en haut de la montante. Six mille
> quatre cent vingt-cinq à six mille six cent cinquante.
> Si on lui applique le même décalage, il atterrit au-dessus de quatre mille deux cents.
> [pause] Or la descendante s'arrête à quatre mille deux cents. Il n'y a plus de place.
> [posé] Alors on le replie. On le descend beaucoup plus bas — de trois mille vingt-cinq —
> et il va se loger tout en bas de la descendante. Trois mille quatre cents.
> [warm] Retiens ça, c'est le piège : la fin de la montante devient le bas de la
> descendante. Les deux extrêmes se croisent.

**Image — Blender, le plan signature.** Deux rails dans l'espace, montante en haut,
descendante en bas. Les trois segments se posent un par un pendant l'énumération. Les
deux rubans de translation « droits » descendent d'abord. Puis, sur « plus de place », le
bloc ambre de fin de bande essaie de se poser au-delà de 4200 et **bute** sur une butée
rouge. Alors il bascule, plonge, traverse tout le cadre en diagonale et se range tout en
bas à gauche. La caméra orbite lentement pour que le croisement se lise en profondeur.

**Son** — un « tonk » sourd sur la butée, un glissando descendant sur la plongée.

*(Ce plan est déjà monté et rendu — voir l'image jointe.)*

---

## 03 · LA POLARISATION — 0:48 ⭐

> Huit cents mégahertz, c'est peu. [pause] Alors on triche. Honnêtement.
> Le champ électrique de l'onde ne reste pas droit. Il tourne en avançant, comme un
> tire-bouchon. [calm] Vers la droite, on dit RHCP. Vers la gauche, LHCP.
> [pause] Et voilà l'astuce. Une antenne réglée à droite ne voit pas du tout le signal de
> gauche. Les deux sens s'ignorent complètement.
> Donc on envoie deux signaux différents, sur exactement la même fréquence, dans les deux
> sens de rotation. [satisfied] La capacité double. Sans une seule fréquence nouvelle.
> Huit cents deviennent mille six cents.

**Image — Blender.** Une seule hélice ambre d'abord, qui avance en tournant vers la
droite, avec le vecteur E qui pivote à sa pointe. Puis une seconde hélice sarcelle
apparaît sur **le même axe**, tournant à l'envers. Les deux s'interpénètrent sans jamais
se toucher. Caméra qui passe de profil à l'axe pour qu'on voie les deux cercles opposés
de face. Compteur **800 → 1600 MHz**.

**Son** — deux bourdons harmoniques, un par sens de rotation, qui se superposent sans
battement.

---

## 04 · POURQUOI 6 ET 4 GHz — 0:32

> Reste une question. [pause] Pourquoi six et quatre gigahertz, et pas ailleurs ?
> À cause du bruit. [calm] En dessous d'un gigahertz, la galaxie elle-même fait du bruit.
> Au-dessus de dix, c'est l'atmosphère qui absorbe — la vapeur d'eau pique à vingt-deux
> gigahertz, l'oxygène à soixante.
> [pause] Entre les deux, il y a une fenêtre. Un creux. C'est là qu'on s'installe.
> Et la descendante prend le bas de la fenêtre, à quatre : [posé] c'est elle qui arrive la
> plus faible.

**Image — canvas.** La courbe de température du ciel en fonction de la fréquence se trace
de gauche à droite. Le fond galactique monte à gauche, les deux pics d'absorption (eau
22, oxygène 60) montent à droite, et le creux entre les deux s'allume en ambre : **LA
FENÊTRE**. Deux curseurs viennent se planter à 4 et 6 GHz, pile dans le creux.

---

## 05 · LES FAISCEAUX — 0:35

> Dernière astuce, et c'est la plus belle. [pause] Le satellite ne crie pas partout pareil.
> Il a un faisceau global, qui couvre tout ce qu'il voit. Des faisceaux hémisphériques,
> une moitié chacun. Des faisceaux de zone, découpés par continent. Et des spots, étroits
> et puissants, pointés sur une région précise.
> [calm] Deux zones qui ne se touchent pas peuvent réutiliser la même fréquence. Elles ne
> se verront jamais.
> Avec ça, et la bande Ku, les huit cents mégahertz de départ finissent par en valoir
> trois mille cinq cents.

**Image** — le globe de l'épisode 1, revu : l'empreinte globale se pose, puis se divise en
hémisphères, puis en quatre zones, puis deux spots serrés s'allument. Deux zones opposées
clignotent de la **même** couleur pour dire la réutilisation. Compteur **800 → 1600 →
3500 MHz**.

---

## 06 · INTELSAT, I À IX — 0:36

> Tout ça ne s'est pas construit d'un coup. [pause] Intelsat un, mille neuf cent
> soixante-cinq : cinquante mégahertz, un an et demi de vie. Intelsat neuf : trois mille
> quatre cent cinquante mégahertz, treize ans.
> [calm] Entre les deux, chaque génération a apporté une idée. La quatre-A, la
> réutilisation par l'espace. La cinq, la réutilisation par la polarisation.
> Et la façon de tenir droit a changé : les premiers tournaient sur eux-mêmes comme une
> toupie. Les modernes sont stabilisés sur trois axes, et seuls les panneaux suivent le
> Soleil.
> [pause] Le monde est découpé en régions : Atlantique, Indien, Pacifique. Puis on en a
> ajouté une quatrième, Asie-Pacifique, parce que le trafic y débordait.

**Image — canvas.** Une frise horizontale I → IX ; pour chaque génération une barre dont
la hauteur est la bande totale, et la durée de vie en mono dessous. Les deux innovations
clés (IV-A, V) s'allument en ambre au passage. Puis un plan court : satellite cylindrique
qui tourne / satellite triaxial dont seuls les panneaux pivotent. Enfin le planisphère
avec AOR, IOR, POR et APR qui s'ajoute en dernier.

---

## 07 · LA VSAT — 0:32

> Et au sol ? [pause] Pas forcément une grande antenne fixe.
> Une VSAT, c'est un terminal à très petite ouverture. Moins de quatre mètres, souvent
> moins de deux. [calm] On les branche en étoile autour d'un concentrateur, ou en
> maillage, chacune avec chacune.
> Elles tiennent une disponibilité de quatre-vingt-dix-neuf virgule quatre-vingt-dix-neuf
> pour cent. [pause] Visioconférence, télémédecine, transfert de fichiers, télédétection.
> Et ce qui mesure leur qualité d'écoute a un nom : le facteur de mérite.

**Image — canvas.** Une grande parabole fixe à gauche, une petite VSAT à droite, à
l'échelle. Puis la topologie : étoile (tout passe par le hub) puis maillage (chacune avec
chacune), les liens se redessinant. Les applications arrivent en puces décalées.

---

## 08 · LES DEUX CHIFFRES — 0:38

> Justement. [pause] Deux formules suffisent à l'examen, et elles disent des choses très
> simples.
> La première : l'affaiblissement en espace libre. Vingt-deux, plus vingt log de la
> distance divisée par la longueur d'onde. [calm] Ça dit juste ceci : plus c'est loin,
> plus c'est haut en fréquence, plus ça s'affaiblit. Sur trente-six mille kilomètres, on
> perd environ deux cents décibels.
> La seconde : le facteur de mérite. Le gain de l'antenne, moins dix log de sa température
> de bruit. [pause] Un bon gain, un récepteur froid — [warm] et tu entends ce qui est
> presque inaudible.

**Image — canvas.** Les deux formules s'écrivent en grand, une à la fois. Sous chacune,
**une seule** phrase de traduction en français et **un seul** chiffre d'exemple (≈ 200 dB,
≈ 40 dB/K). Pas de dérivation, pas de calcul à l'écran.

---

## 09 · LA FICHE — 0:34

> [calm] Avant l'examen. [pause] Le répéteur reçoit, amplifie, décale, renvoie. Moins deux
> mille deux cent vingt-cinq — sauf la fin de bande, moins trois mille vingt-cinq, qui
> part tout en bas.
> La polarisation double la capacité. Les faisceaux la redoublent.
> Six et quatre gigahertz, parce que c'est là que le ciel est silencieux.
> La VSAT se juge à son facteur de mérite.
> [warm] Et tout ça pour une seule chose : faire tenir une conversation dans un creux de
> bruit, à trente-six mille kilomètres.

**Image** — la fiche crème, comme l'épisode 1, six lignes. Maintien long pour la pause.
Puis carton de fin.

---

## Production

Même chaîne que l'épisode 1, plus Blender :

- **Voix** ElevenLabs v4, voix « Nicolas » (continuité avec l'épisode 1), 10 prises.
- **Blender** Cycles CPU, 4 plans. Mesuré : 5 s par image en 960×540 / 64 échantillons,
  soit ~25 min pour les quatre plans en 1080p. Dé-bruitage désactivé (le build Ubuntu
  n'a pas OpenImageDenoise).
- **Canvas + GSAP** pour les 6 autres chapitres, bibliothèque de l'épisode 1 réutilisée.
- **Veo** pour le plan d'ouverture.
- **Suno** pour la musique, **bruitage synthétisé** calé à l'image.
- Mix à −14 LUFS, limiteur suréchantillonné, `.srt` en prime.

**Ce qui est déjà fait** : le plan signature du chapitre 02 est monté et rendu. Le reste
attend ton feu vert — c'est la voix off qui engage les crédits, donc c'est le bon moment
pour changer le texte si quelque chose te gêne.
