# 02 — Learning map · COURSE_01_SWITCHING_VLAN

## BIG QUESTION

> **Quand PC-A envoie des données à PC-B, comment le switch décide-t-il *réellement* où envoyer la trame ?**

Sous-question qui porte la 2ᵉ moitié de l'épisode :
> *Et comment faire vivre plusieurs réseaux séparés sur les mêmes switches, sans qu'ils se mélangent ?*

---

## CORE MODEL (à retenir en une phrase par ligne)

1. Un switch lit **deux adresses** dans chaque trame.
2. Avec la **source**, il **apprend** : « cette MAC est derrière ce port ».
3. Avec la **destination**, il **décide** : un seul port s'il la connaît, **tous les autres ports du VLAN** sinon.
4. Une **broadcast** est toujours envoyée à tous — c'est voulu.
5. Un **VLAN** découpe le switch en plusieurs domaines de broadcast : **rien ne traverse une frontière de VLAN** sans routeur.
6. Entre deux switches, un **trunk** transporte plusieurs VLAN sur un seul lien grâce à un **tag 802.1Q** ajouté à la trame, puis retiré avant d'atteindre le PC.

---

## LEARNING OBJECTIVES (7)

À la fin de l'épisode, l'apprenant·e sait :

1. **Nommer** les deux adresses d'une trame Ethernet et dire laquelle sert à apprendre, laquelle sert à décider.
2. **Prédire** le contenu de la table MAC après un échange A→B puis B→A.
3. **Distinguer** unknown unicast et broadcast (cause, destinataires, qui traite la trame, est-ce que ça disparaît avec le temps).
4. **Expliquer** pourquoi un VLAN limite la portée d'une broadcast.
5. **Dire** si une trame est taguée ou non sur un port d'accès et sur un trunk.
6. **Suivre** une trame VLAN 10 de PC-A à PC-B à travers deux switches et un trunk, en indiquant à chaque saut : MAC source, MAC destination, VLAN, port, décision.
7. **Reconnaître** que deux PC de VLAN différents sur un même switch de niveau 2 ne peuvent pas communiquer directement.

---

## PREREQUISITES

| Requis | Comment on le couvre |
|---|---|
| Savoir qu'un PC a une carte réseau et un câble | supposé acquis |
| Notion de « message qui voyage » | l'enveloppe du chapitre 1 |
| Adresse MAC | introduite *dans* l'épisode (chapitre 1, 20 s) |
| IP / sous-réseaux | **non requis** — seulement évoqués au quiz Q3 (« il faut un routeur ») |

---

## 80/20 KNOWLEDGE

### TIER 1 — CORE MODEL (≈ 70 % du temps d'écran)
- Trame = MAC destination + MAC source + données
- Learning sur la **source** (+ port d'entrée)
- Forward/filter sur la **destination**
- Lookup miss ⇒ flooding (sauf port d'entrée)
- Broadcast `FFFF.FFFF.FFFF` ⇒ toujours floodée
- VLAN = domaine de broadcast
- Port d'accès = un VLAN, non tagué
- Trunk = plusieurs VLAN, tagué 802.1Q

### TIER 2 — WORKING KNOWLEDGE (≈ 25 %)
- Les hôtes non destinataires jettent une unknown unicast
- La table MAC est indexée **par VLAN**
- Le tag est un champ de 4 octets inséré dans l'en-tête ; VLAN ID sur 12 bits
- Le switch de sortie lit puis retire le tag
- Commandes (bandeau discret, jamais narrées mot à mot) :
  `show mac address-table` · `switchport mode access` · `switchport access vlan 10` · `switchport mode trunk` · `show interfaces trunk`
- Inter-VLAN ⇒ routeur ou switch L3

### TIER 3 — DETAILS (hors script, mentionnés en fin ou reportés)
- Aging 300 s · native VLAN · DTP · VTP · allowed VLAN list · ISL · collision domain · STP (→ épisode 2)

---

## COMMON MISCONCEPTIONS (traitées explicitement à l'écran)

| Erreur | Où on la casse | Comment |
|---|---|---|
| « Le switch apprend la destination » | Ch. 2 | Piège posé, **freeze**, puis gros **NON** rouge sur la MAC destination qui rebondit hors de la table |
| « Flooding = renvoyé partout, y compris à l'émetteur » | Ch. 3 | Port 1 reste éteint, petit cadenas gris « port d'entrée » |
| « Unknown unicast = broadcast » | Ch. 4 | Écran partagé côte à côte : 2 différences clés, dont « ça disparaît une fois appris / jamais » |
| « Tous les PC traitent la trame floodée » | Ch. 3 | Les PC C, D, E dissolvent la trame (« pas pour moi ») |
| « Le PC ajoute le tag VLAN » | Ch. 6 | Le PC reste neutre (gris), c'est le **port** qui porte la couleur ; la trame sort du PC sans tag |
| « Il faut un câble par VLAN » | Ch. 7 | La mauvaise solution est montrée puis **fusionnée** |
| « Le tag est une étiquette collée dessus » | Ch. 8 | Zoom dans l'en-tête : le tag s'insère *entre* deux champs, les champs se décalent |
| « Même switch = ils peuvent se parler » | Quiz Q3 | Freeze, puis mur entre bleu et violet, silhouette d'un routeur |

---

## FINAL MENTAL MODEL

L'image que l'apprenant·e doit garder en tête à la fin :

```
          apprend (SOURCE)               décide (DESTINATION)
PC-A ──► [ port ] ──────► TABLE MAC ──────► connu ? ── oui ──► 1 port
 (non tagué)                 │                        └─ non ──► tous les ports du VLAN
                             │                                   sauf l'entrée
                    une ligne = VLAN + MAC + port

      VLAN = une couleur = un domaine de broadcast
      access = 1 couleur, sans tag     trunk = toutes les couleurs, avec tag 802.1Q
```

Test de sortie : l'apprenant·e peut refaire le **Final Mental Movie** à voix haute sans la vidéo.
