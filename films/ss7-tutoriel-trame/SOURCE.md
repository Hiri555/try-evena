# DÉCODER UNE TRAME SS7 DE A À Z
## Le tutoriel complet — on lit une vraie trame sémaphore ensemble, bit par bit

> **Script vidéo pédagogique — ESMT / LPTI2 / Signalisation Sémaphore SS7 (CCITT N°7).**
>
> Ce document est écrit pour être transformé en vidéo. Il va **lentement**, avec
> des **analogies de la vie de tous les jours** et, à chaque champ, la **méthode
> exacte** : *où je regarde dans la trame → je convertis → j'ouvre mon document à
> telle table → je lis le code → j'en déduis le sens.* C'est cette démarche
> « ouvre ton doc et cherche » qu'il faut reproduire en examen.
>
> 🎬 = note de mise en image.

---

## L'IDÉE EN UNE PHRASE (l'analogie maîtresse)

> **Une trame SS7, c'est une lettre recommandée qui voyage à travers le pays.**

- L'**enveloppe** protège et transporte (c'est le **niveau 2**).
- L'**adresse** écrite dessus dit d'où ça vient et où ça va (c'est le **niveau 3**).
- La **lettre à l'intérieur** contient le vrai message (c'est le **niveau 4**).

Décoder la trame, c'est jouer au **facteur du centre de tri** : on regarde
l'enveloppe, on lit l'adresse, puis on ouvre la lettre. On va faire exactement ça,
dans cet ordre.

🎬 **À l'écran :** une enveloppe fermée qui arrive. Trois étiquettes apparaissent :
« enveloppe = N2 », « adresse = N3 », « lettre = N4 ».

---

## 0. L'ÉNONCÉ

On reçoit une trame en hexadécimal, encadrée par deux **fanions** `7E` :

```
7E …. 2B 09 75 03 04 77 12 2C 95 7C A2 16 67 76 2B 77 B0 … 80 80 7E
```

**Questions :**
1. Déterminer et interpréter les champs des niveaux **N2, N3 et N4**.
2. Déterminer le **trajet** du message, de **PSA** vers **PSB**.
3. Expliquer les **transitions N2 → N3 → N4** (comment le message traverse les
   couches).

> *Le `….` au début, c'est juste un bout de trame que le prof n'a pas réécrit : on
> travaille avec les valeurs de la correction.*

🎬 **À l'écran :** la trame en grand. On entoure le premier et le dernier `7E` en
vert : « tout ce qui compte est entre ces deux balises ».

---

## 1. LES OUTILS AVANT DE COMMENCER

Deux réflexes de conversion, qu'on utilisera partout.

**a) Hexadécimal → binaire.** Chaque chiffre hexa = **4 bits**. On apprend cette
petite table une fois pour toutes :

| Hex | Binaire | Hex | Binaire | Hex | Binaire | Hex | Binaire |
|-----|---------|-----|---------|-----|---------|-----|---------|
| 0 | 0000 | 4 | 0100 | 8 | 1000 | C | 1100 |
| 1 | 0001 | 5 | 0101 | 9 | 1001 | D | 1101 |
| 2 | 0010 | 6 | 0110 | A | 1010 | E | 1110 |
| 3 | 0011 | 7 | 0111 | B | 1011 | F | 1111 |

> *Analogie : l'hexa, c'est juste une **écriture raccourcie** du binaire, comme «
> 1 douzaine » est un raccourci pour « 12 ». Un chiffre hexa = un paquet de 4 bits.*

**b) Un octet = 8 bits = 2 chiffres hexa.** Ex. `D8` = `1101 1000`.

🎬 **À l'écran :** montrer `D8 → 1101 1000` : le `D` devient `1101`, le `8` devient
`1000`, les deux se collent.

---

## 2. LA MÉTHODE GÉNÉRALE (l'algorithme à suivre)

À chaque champ, on fera **toujours les mêmes 4 gestes** :

```
1) JE REPÈRE   → quel(s) octet(s) / quels bits dans la trame ?
2) JE CONVERTIS→ hexa → binaire
3) J'OUVRE MON DOCUMENT → je cherche LA table de ce champ
4) JE LIS      → le code binaire → sa signification dans la table
```

> C'est ça, « savoir décoder » : ce n'est pas réciter par cœur, c'est **savoir dans
> quelle table aller chercher**. Tout le reste est de la lecture.

🎬 **À l'écran :** afficher ces 4 étapes comme une recette ; on les recochera à
chaque champ.

L'ordre de lecture suit les couches : **N2 (l'enveloppe) → N3 (l'adresse) → N4 (la
lettre)**.

---

## 3. NIVEAU 2 — L'ENVELOPPE (transport fiable)

Le niveau 2 ne s'occupe **pas** du contenu. Son travail : que la trame arrive
**entière, dans l'ordre, sans erreur**. Comme un service de livraison avec **numéro
de suivi** et **accusé de réception**.

### 3.1 La correction d'erreur = `08 08`

> **Analogie : les petits « ✓✓ » de WhatsApp.** Chacun dit « j'ai bien reçu ton
> message n°… ». C'est exactement le rôle de ces deux octets.

**Méthode :**
1. **Je repère :** les deux octets de correction = `08` et `08`.
2. **Je convertis :** `08 = 0000 1000`.
3. **Je découpe** chaque octet ainsi (règle du cours) : le **bit de poids fort = le
   bit indicateur**, les **7 autres bits = le numéro de séquence**.

```
08  =  0 0001000          08  =  0 0001000
       │ └──┬──┘                 │ └──┬──┘
      BIR  NSR = 8              BIA  NSA = 8
```

4. **Je lis :**

| Champ | Binaire | Valeur | Ce que ça veut dire |
|-------|---------|--------|---------------------|
| **NSR** (n° séquence arrière) | `0001000` | **8** | « la dernière trame que j'ai bien reçue, c'est la n°8 » |
| **BIR** (bit indicateur arrière) | `0` | **0** | — |
| **NSA** (n° séquence avant) | `0001000` | **8** | « la trame que j'envoie, c'est la n°8 » |
| **BIA** (bit indicateur avant) | `0` | **0** | — |

**Le raisonnement qui conclut :**
> On regarde si **BIR = BIA**. Ici `0 = 0` → **oui**. Règle : quand les deux bits
> indicateurs sont **égaux**, c'est un **fonctionnement normal : aucune
> retransmission** n'est demandée.
>
> *Pourquoi ? Si une erreur avait été détectée, le récepteur aurait **changé** son
> bit (BIR ≠ BIA) pour dire « recommence à partir de la trame fautive ». Les deux
> bits sont pareils → personne ne réclame rien → tout roule.*

🎬 **À l'écran :** deux bulles de chat avec « ✓✓ reçu n°8 » / « j'envoie n°8 », puis
`BIR = BIA` qui s'allume en vert avec « pas de reprise ».

### 3.2 L'indicateur de longueur `INL = D8` → **trame de message**

> **Analogie : l'épaisseur de l'enveloppe.** Rien que la toucher, le facteur sait
> si c'est une carte postale (vide), un petit mot, ou un gros dossier.

**Méthode :**
1. **Je repère :** l'octet INL = `D8`.
2. **Je convertis :** `D8 = 1101 1000`.
3. **La table du cours dit :** on **ignore les 2 bits de poids fort** (ils sont
   réservés), on ne garde que **les 6 bits de poids faible**.

```
D8  =  11 011000
       └┬┘ └──┬─┘
     ignorés  011000 (binaire) = 24
```

4. **Je lis :** `011000` = **24**.

**Conclusion avec la table « type de trame » :**

| INL | Type | Nom |
|-----|------|-----|
| 0 | remplissage | TSR |
| 1 ou 2 | état | TSE |
| **> 2** | **message** | **TSM** |

> `INL = 24`, donc `INL > 2` → c'est une **TSM (Trame Sémaphore de Message)**, et le
> **champ Information fait 24 octets**. Autrement dit : l'enveloppe contient bien
> une vraie lettre de 24 octets (le N3 + le N4).

### 3.3 La détection d'erreur (CRT) = 16 bits

> **Analogie : le sceau de cire / le code de sécurité.** On recalcule un petit
> code à partir de toute la trame ; s'il ne correspond pas à l'arrivée, c'est que
> la lettre a été abîmée en route → on la jette et on la redemande.

Ici, rien à calculer : on note juste que ce champ (16 bits) **garantit
l'intégrité** de la trame.

🎬 **À l'écran :** un cachet de cire sur l'enveloppe ; s'il se brise, flèche «
redemander la trame » qui renvoie vers la correction (3.1).

---

## 4. NIVEAU 3 — L'ADRESSE (où va la lettre ?)

On a lu l'enveloppe. Maintenant **l'adresse** écrite dessus : de qui, vers qui, par
quelle route.

### 4.1 L'octet de service `SER = 04` → quel « service » traite la lettre

> **Analogie : le tampon « service » sur un courrier administratif.** Il dit quel
> bureau doit ouvrir la lettre (service des impôts ? état civil ?). Ici il dit quel
> **sous-système** du réseau est concerné.

**Méthode :**
1. **Je repère :** l'octet SER = `04`.
2. **Je convertis :** `04 = 0000 0100`.
3. **Je découpe en deux quartets :** les 4 bits de poids faible = **INS**, les 4
   bits de poids fort = **DSS**.

```
04  =  0000 0100
       └┬─┘ └┬─┘
      DSS    INS
```

4. **J'ouvre mon document à deux tables :**

**Table INS (indicateur de service) :**

| INS (DCBA) | Service |
|-----------|---------|
| `0000` | Gestion du réseau — niveau 3 |
| `0001` | Essai du réseau — niveau 3 |
| **`0100`** | **SSUT — niveau 4** ✓ |
| `0110` | SSUD — niveau 4 |
| `1011` | CSN — niveau 4 |

→ `INS = 0100` = **SSUT** (Sous-Système Utilisateur Téléphonique, norme Q.723).
**La lettre à l'intérieur sera donc un message téléphonique.**

**Table DSS (bits D C = indicateur de réseau) :**

| DC | Réseau |
|----|--------|
| **`00`** | **International** ✓ |
| `01` | Réservé international |
| `10` | National |
| `11` | Réservé national |

→ `DSS = 0000` → DC = `00` → **réseau international** (les bits BA sont réservés à
00).

> **Résultat N3-SER : service = SSUT (niveau 4), réseau = international.**

🎬 **À l'écran :** l'octet `04` se coupe en deux ; chaque moitié file vers sa table
et surligne la bonne ligne.

### 4.2 L'étiquette d'acheminement = l'adresse « expéditeur / destinataire »

Juste après le SER, 32 bits portent les **codes des points sémaphores** et la
**route** :

> **Analogie : le « De: » et le « À: » sur l'enveloppe, plus le code de la tournée
> du facteur.**

**Méthode :** on met les octets qui suivent le SER bout à bout en binaire, puis on
**prélève dans l'ordre 14 bits, 14 bits, 4 bits** :

| Champ | Taille | Valeur (correction) | Analogie |
|-------|--------|---------------------|----------|
| **CPO** — Code Point d'Origine | 14 bits | **7562** | adresse de l'**expéditeur** = **PSA** |
| **CPD** — Code Point de Destination | 14 bits | **14203** | adresse du **destinataire** = **PSB** |
| **SCS** — Sélection du Canal Sémaphore | 4 bits | **7** (`0111`) | le **code de la route** choisie |

> **CPO = 7562** (qui envoie = PSA) · **CPD = 14203** (qui reçoit = PSB).
> Le SCS, on s'en servira à la **question 2** pour trouver le chemin exact.

🎬 **À l'écran :** une barre de 32 bits qui se découpe en 14 / 14 / 4, avec «
expéditeur PSA », « destinataire PSB », « route ».

---

## 5. NIVEAU 4 — LA LETTRE (le message téléphonique)

Le SER a dit « SSUT » → on ouvre enfin la lettre. C'est un **MIA — Message Initial
d'Adresse** : le tout premier message qu'un central envoie pour **demander
l'établissement d'un appel** (il contient le numéro à appeler).

### 5.1 L'entête H0 / H1 — « de quel type de lettre s'agit-il ? »

> **Analogie : l'objet d'un email** (« Facture », « Invitation »…). Deux petits
> codes disent la **catégorie** du message.

**Méthode :** je lis H0 puis H1, et j'ouvre **la table des entêtes**.

| Champ | Valeur | Table → signification |
|-------|--------|-----------------------|
| **H0** | `1` = `0001` | famille → **Messages d'adresse** (émis vers l'avant) |
| **H1** | `2` = `0010` | fonction → **MIA avec informations supplémentaires** |

> **Conclusion : c'est un Message Initial d'Adresse (MIA) avec informations
> supplémentaires.**
>
> *Méthode détaillée : H0 donne la **famille** (ici « messages d'adresse »). Une
> fois la famille connue, on va dans la **sous-table de H1** correspondant à
> H0=0001, où `0001`=MIA, `0010`=MIA avec infos supp., `0011`=MSS… On lit `0010` →
> « avec informations supplémentaires ». C'est un classement à deux niveaux, comme
> « rayon → sous-rayon » dans un magasin.*

### 5.2 Catégorie du demandeur = `CA` → « qui appelle ? »

> **Analogie : la case « qualité de l'appelant » sur un formulaire** (particulier ?
> opératrice ? ligne prioritaire ?).

**Méthode :**
1. **Je repère/convertis :** `CA = 1100 1010`.
2. **Je découpe :** 2 bits réservés devant, puis **6 bits** de catégorie (F E D C B A).

```
CA  =  11 001010
       └┬┘ └──┬─┘
   réservé  001010  ← la catégorie
```

3. **J'ouvre la table « catégorie du demandeur » et je cherche `001010` :**

| Code (FEDCBA) | Catégorie |
|---------------|-----------|
| `000001` | Opératrice langue française |
| `000010` | Opératrice langue anglaise |
| **`001010`** | **Abonné demandeur ordinaire** ✓ |
| `001011` | Abonné demandeur prioritaire |
| `001100` | Appel de données |

> **Résultat : c'est un abonné demandeur ordinaire** (un particulier lambda, ni
> opératrice, ni ligne prioritaire).

### 5.3 Les indicateurs de message = `957` — **le formulaire à cases à cocher**

C'est **le champ le plus riche**, et la meilleure illustration de « va chercher
dans ton document ». 12 bits, où **chaque groupe de bits = une case du formulaire**
avec sa propre mini-table.

> **Analogie : un formulaire avec des cases à cocher.** Appel international ? ☑.
> Circuit satellite ? ☑. Contrôle de continuité ? ☑… Chaque bit (ou paire de bits)
> est une case, et la table du cours dit ce que veut dire chaque case cochée.

**Méthode :**
1. **Je convertis :** `957 = 1001 0101 0111` (12 bits).
2. **Je range les bits** de droite à gauche en les nommant **A, B, C, …, L** (A =
   bit de poids faible) :

```
957 = 1   0   0   1   0   1   0   1   0   1   1   1
      L   K   J   I   H   G   F   E   D   C   B   A
```

3. **Pour CHAQUE case, j'ouvre la table correspondante et je lis.** Voici le
   détail — c'est exactement la démarche à reproduire :

| Je prends… | Bits | J'ouvre la table… | Je lis |
|-----------|------|-------------------|--------|
| **B A** | `11` | « nature de l'adresse » | **numéro international** |
| **D C** | `01` | « nature du circuit » | **un circuit satellite** fait partie de la connexion |
| **F E** | `01` | « contrôle de continuité » | **contrôle de continuité requis** sur ce circuit |
| **G** | `1` | « suppresseur d'écho départ » | **demi-suppresseur de départ inséré** |
| **H** | `0` | « appel international entrant » | **appel autre qu'international entrant** |
| **I** | `1` | « prolongement d'appel » | **appel prolongé** |
| **J** | `0` | « connexité numérique » | **appel ordinaire** |
| **K** | `0` | « trajet de signalisation » | **trajet quelconque** |
| **L** | `1` | réservé | — |

> **Exemple concret de méthode (la question que tu poses) : « comment je sais que
> ça passe par un circuit satellite ? »**
> 1. Je prends les bits **D et C** des indicateurs → ici `01`.
> 2. J'ouvre mon document à la table des indicateurs de message, rubrique **« bits
>    D C : indicateur de la nature du circuit »**.
> 3. J'y lis : `00` = pas de satellite · **`01` = un circuit satellite fait partie
>    de la connexion** · `10` = réservé.
> 4. Mon code est `01` → **donc oui, il y a un circuit satellite.** Je n'ai rien
>    deviné : j'ai **lu la table**.

> **Lecture en clair du formulaire complet :** appel vers un **numéro
> international**, qui emprunte un **circuit satellite**, avec **contrôle de
> continuité exigé**, **demi-suppresseur d'écho de départ inséré**, ce **n'est pas**
> un appel international entrant, l'appel est **prolongé**, c'est un **appel
> ordinaire** (pas de connexité numérique), sur un **trajet quelconque**.

🎬 **À l'écran :** afficher `957 → 1001 0101 0111`. Puis **éclater** le mot binaire
en cases colorées (BA, DC, FE, G, H, I, J, K, L). On clique une case → sa petite
table se déplie → la ligne lue se surligne. **C'est le moment fort de la vidéo.**

### 5.4 Le CIC — numéro du circuit téléphonique

> **Analogie : le numéro de la ligne/du « tuyau » de parole** qu'on est en train de
> réserver pour la conversation.

**Méthode :** je repère le CIC (`667`) et je le convertis en décimal.

```
CIC = 667 (hex) = 0110 0110 0111 = 1639 (décimal)
```

> **Le numéro de circuit est 1639.**
>
> *Détail utile : les **4 bits de poids faible du CIC** (`0111` = 7) sont exactement
> le **SCS** vu en 4.2. C'est logique : le « tuyau » de parole et la « route » de
> signalisation sont liés. C'est pour ça que SCS = 7.*

### 5.5 Nombre de signaux + le numéro demandé

> **Analogie : d'abord le nombre de lettres du mot, puis le mot lui-même** — sauf
> qu'ici le mot est **écrit à l'envers** (poids faible d'abord).

**Méthode :**
1. **Nombre de signaux d'adresse :** `C = 1100 = 12` → le numéro a **12 chiffres**.
2. **Signaux d'adresse :** les 12 chiffres, chacun en **BCD sur 4 bits** (`0000`=0 …
   `1001`=9), lus dans l'ordre de la trame :

```
dans la trame :  9 7 5 0 3 0 4 7 7 1 2 2
```

3. **Je remets à l'endroit** (l'ordre d'émission est inversé) :

```
à l'envers :  9 7 5 0 3 0 4 7 7 1 2 2
à l'endroit : 2 2 1 7 7 4 0 3 0 5 7 9
              └┬┘ └──────────┬────────┘
           indicatif      numéro
```

> **Numéro demandé : +221 77 403 05 79** (un numéro sénégalais).
>
> *Analogie : lire les chiffres comme dans un **miroir**. La machine les envoie
> poids faible d'abord ; nous, on les retourne pour retrouver le vrai numéro.*

🎬 **À l'écran :** les 12 chiffres dans l'ordre trame, puis une animation « miroir »
qui les retourne et fait apparaître `+221 77 403 05 79`.

---

## 6. QUESTION 2 — LE TRAJET DE PSA VERS PSB (décidé bit par bit par le SCS)

### 6.1 La direction
- **CPO = 7562 = PSA** (expéditeur).
- **CPD = 14203 = PSB** (destinataire).

Le message va donc **de PSA vers PSB**. Mais entre les deux il y a un **maillage de
points de transfert (PTS)** avec **plusieurs routes parallèles** : il faut dire
*laquelle*.

> **Analogie : un GPS.** Tu connais le départ (PSA) et l'arrivée (PSB). À chaque
> **carrefour**, le GPS dit « tourne ici ». Ici, le « GPS », c'est le **SCS** : ses
> bits disent, à chaque PTS, quelle sortie prendre.

### 6.2 Le réseau de l'énoncé

```
            XX0X            XX1X
      PTS1 ──────▶ PTS2 ──────▶ PTS3
     ╱    (croisements entre         ╲ XXX1
 XXX0      les deux rangées)          ╲
PSA                                    ▶ PSB
 XXX1                                 ╱
     ╲                               ╱ XXX0
      PTS6 ──────▶ PTS5 ──────▶ PTS4
            XX0X            XX1X
```

Chaque arête porte une **condition sur le SCS**. La notation dit **quel bit** le
nœud regarde :
- `XXX0` / `XXX1` → le nœud teste le **bit de poids faible (bit 0, le plus à
  droite)**.
- `XX0X` / `XX1X` → le nœud teste le **2ᵉ bit en partant de la droite (bit 1)**.

> *Les `X` veulent dire « peu importe » ; seul le bit indiqué compte à ce
> carrefour.*

### 6.3 On déroule avec SCS = 7

```
SCS = 7 = 0 1 1 1
          │ │ │ └─ bit 0 = 1
          │ │ └─── bit 1 = 1
          │ └───── bit 2 = 1
          └─────── bit 3 = 0
```

On avance **un carrefour à la fois**, chaque nœud lisant SON bit :

| Saut | On est à… | Bit regardé | Valeur | Arête prise | On arrive à… |
|------|-----------|-------------|--------|-------------|--------------|
| 1 | **PSA** | bit 0 (`XXX_`) | **1** | `XXX1` | **PTS6** |
| 2 | **PTS6** | bit 1 (`XX_X`) | **1** | `XX1X` | **PTS2** |
| 3 | **PTS2** | bit 1 (`XX_X`) | **1** | `XX1X` | **PTS3** |
| 4 | **PTS3** | bit 0 (`XXX_`) | **1** | `XXX1` | **PSB** |

À chaque PTS, la fonction **discrimination** constate que `CPD (14203) ≠ son
numéro` → elle **réachemine** (transit) vers le nœud suivant indiqué par le SCS.
Arrivé à **PSB**, `CPD = son numéro` → **distribution** : la lettre monte au
niveau 4.

> ### ✅ Réponse Q2
> **Trajet : PSA → PTS6 → PTS2 → PTS3 → PSB.**
>
> **Pourquoi celui-là, étape par étape :**
> - PSA regarde le **bit 0 = 1** → prend `XXX1` → **PTS6** (et pas PTS1, qui aurait
>   demandé `XXX0`).
> - PTS6 regarde le **bit 1 = 1** → prend `XX1X` → **PTS2**.
> - PTS2 regarde le **bit 1 = 1** → prend `XX1X` → **PTS3**.
> - PTS3 regarde le **bit 0 = 1** → prend `XXX1` → **PSB**.
>
> Le chemin n'est donc **pas choisi au hasard** : il est **écrit dans les bits du
> SCS**. Avantage : tous les messages portant le même SCS suivent **la même route**
> (→ ils arrivent **dans l'ordre**), et on peut **répartir la charge** en changeant
> de SCS.

> ⚠️ **Le piège classique :** ne jamais « sauter » de PSA directement à PTS2 — PSA
> n'est relié qu'à **PTS1 et PTS6**. On avance **nœud après nœud**, **un bit du SCS
> par carrefour**.

🎬 **À l'écran :** le maillage complet s'affiche, arêtes étiquetées. `SCS = 0111`
apparaît en haut. On **allume une arête à la fois** au rythme du tableau, un point
lumineux suivant PSA → PTS6 → PTS2 → PTS3 → PSB, avec le bit testé qui clignote à
chaque carrefour.

---

## 7. QUESTION 3 — LES TRANSITIONS N2 → N3 → N4

> **Analogie : les poupées russes (ou l'oignon).** À l'envoi, on **emboîte** la
> lettre dans l'adresse, puis dans l'enveloppe. À la réception, on **déboîte** dans
> l'autre sens. Chaque couche ne touche qu'à **sa** poupée.

### 7.1 À l'émission — on descend (on emboîte) : N4 → N3 → N2

```
N4  Le central écrit la LETTRE : type MIA, catégorie, indicateurs, numéro demandé.
        │  « voici mon message, débrouille-toi pour le livrer »
        ▼
N3  Il écrit l'ADRESSE autour : étiquette (CPD, CPO, SCS) + octet de service SER.
        │  « maintenant on sait où ça va et par quelle route »
        ▼
N2  Il met tout dans l'ENVELOPPE : correction (NSR/NSA/BIR/BIA), INL, détection
    (CRT), et scelle avec les deux FANIONS.
        │
        ▼
   La trame complète part sur le canal sémaphore.
```

### 7.2 À la réception — on remonte (on déboîte) : N2 → N3 → N4

```
N2  Vérifie les FANIONS, recalcule le CRT, contrôle la séquence (NSR/NSA).
    Si tout est bon → il RETIRE l'enveloppe et passe l'intérieur au N3.
        │
        ▼
N3  Lit le SER et l'ADRESSE → fonction DISCRIMINATION :
        • CPD = moi ?  OUI → DISTRIBUTION (remet la lettre au bon service, le SSUT)
        •              NON → ACHEMINEMENT (transit vers un PTS, route choisie par SCS)
        │  (quand c'est pour nous)
        ▼
N4  Reçoit enfin la LETTRE (le MIA) et traite l'appel : lit le numéro demandé,
    la catégorie, les indicateurs.
```

### 7.3 Ce qu'il faut retenir
- **Chaque niveau ne s'occupe que de SA couche** et rend service au voisin :
  **N2 = transport fiable**, **N3 = bon acheminement**, **N4 = sens de l'appel**.
- Les champs décodés aux questions 1 et 2 se **rangent** exactement dans ces trois
  couches :
  - **N2 :** correction, INL, détection.
  - **N3 :** SER, CPD, CPO, SCS.
  - **N4 :** H0·H1, catégorie, indicateurs, CIC, numéro demandé.

🎬 **À l'écran :** des poupées russes. À l'émission elles **s'emboîtent** (lettre →
adresse → enveloppe). À la réception elles **s'ouvrent** une à une jusqu'à la
lettre. Zoom sur l'aiguillage **discrimination → distribution / acheminement**.

---

## 8. RÉCAPITULATIF — TOUTE LA CORRECTION EN UN TABLEAU

| Niv. | Champ | Valeur | Interprétation |
|------|-------|--------|----------------|
| **N2** | Correction `08 08` | NSR=8, NSA=8, BIR=BIA=0 | Dernière trame reçue = 8, trame émise = 8 → **fonctionnement normal, pas de reprise** |
| **N2** | INL `D8` | 24 | `INL > 2` → **TSM** ; information = **24 octets** |
| **N2** | Détection | 16 bits | CRC d'intégrité |
| **N3** | SER `04` | INS=SSUT, DSS=0 | **SSUT niveau 4**, réseau **international** |
| **N3** | CPO | **7562** | PS d'origine = **PSA** |
| **N3** | CPD | **14203** | PS de destination = **PSB** |
| **N3** | SCS | **7** (`0111`) | sélection de la route |
| **N4** | H0·H1 `1`·`2` | — | **MIA avec informations supplémentaires** |
| **N4** | Catégorie `CA` | `001010` | **abonné demandeur ordinaire** |
| **N4** | Indicateurs `957` | — | international · circuit satellite · continuité requise · demi-suppresseur départ inséré · pas d'appel intl entrant · appel prolongé · appel ordinaire · trajet quelconque |
| **N4** | CIC `667` | **1639** | n° du circuit téléphonique |
| **N4** | Nb signaux `C` | 12 | **12 chiffres** |
| **N4** | Signaux d'adresse | `975030477122` | **numéro demandé : +221 77 403 05 79** |
| **Q2** | Trajet | **PSA→PTS6→PTS2→PTS3→PSB** | chaque saut décidé par un bit du **SCS = 0111** |
| **Q3** | Transitions | N4→N3→N2 (émission) / N2→N3→N4 (réception) | encapsulation / désencapsulation + discrimination |

---

## 9. PLAN DE LA VIDÉO (montage proposé)

1. **Ouverture** : l'analogie de la lettre recommandée (enveloppe / adresse /
   lettre). On montre la trame et on annonce : « on va la lire ensemble, pas à pas,
   et tu repartiras en sachant **où chercher** chaque réponse dans ton document. »
2. **Boîte à outils** : hexa → binaire (section 1) + la recette en 4 gestes
   (section 2).
3. **Niveau 2 — l'enveloppe** : correction `08 08`, INL `D8`, détection (section 3).
4. **Niveau 3 — l'adresse** : SER `04`, étiquette CPO/CPD/SCS (section 4).
5. **Niveau 4 — la lettre** : H0/H1, catégorie, **les indicateurs `957`** (le
   formulaire à cases, moment fort), CIC, puis **le numéro en miroir** (section 5).
6. **Question 2 — le GPS** : le maillage s'allume, le SCS=0111 trace la route
   **carrefour par carrefour** PSA→PTS6→PTS2→PTS3→PSB (section 6).
7. **Question 3 — les poupées russes** : on emboîte / on déboîte N2·N3·N4
   (section 7).
8. **Récap** : le tableau final (section 8), puis « voilà — tu viens de décoder une
   trame SS7 complète, et surtout tu sais **comment** le refaire. »

---

*Support de travail pour une vidéo tutorielle — ESMT / LPTI2 / Signalisation
Sémaphore SS7 (CCITT N°7). Toutes les valeurs proviennent de la correction au
tableau.*
