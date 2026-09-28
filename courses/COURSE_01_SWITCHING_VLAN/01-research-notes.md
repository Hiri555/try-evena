# 01 — Research notes · COURSE_01_SWITCHING_VLAN

> **Épisode 1 — « Comment un switch sait où envoyer tes données ? »**

## ⚠️ Statut de la source

Le livre CCNA Routing & Switching **n'a pas été trouvé** dans le dépôt (aucune branche) ni sur le Google Drive connecté.
Ces notes s'appuient sur le contenu standard du *CCENT/CCNA ICND1 100-105 Official Cert Guide* (W. Odom, Cisco Press), la référence CCNA R&S la plus répandue.
Les références de section ci-dessous sont **indicatives** : il faut les remapper sur l'édition exacte fournie avant le rendu final (voir la colonne *SOURCE SECTION*).
Le vocabulaire retenu est celui d'Odom : *forward/filter decision*, *MAC address table*, *flooding*, *unknown unicast*, *broadcast domain*, *access port*, *trunk*, *802.1Q*.

**Action requise :** ajoute le PDF/EPUB dans `COURSE_01_SWITCHING_VLAN/00-source/` (non commité si soumis au droit d'auteur, voir `.gitignore`). Je relirai alors les sections et corrigerai tout écart de vocabulaire ou de nuance.

---

## Sections pertinentes (édition présumée ICND1 100-105)

| Réf. présumée | Titre | Ce qu'on en tire |
|---|---|---|
| Part I, ch. 2 | *Fundamentals of Ethernet LANs* | Trame Ethernet, adresses MAC (48 bits, OUI), unicast / broadcast / multicast, champ EtherType, FCS |
| Part II, ch. 5 | *Analyzing Ethernet LAN Switching* | Les 3 fonctions d'un switch : apprendre (source), décider forward/filter (destination), éviter les boucles (STP) ; flooding des unknown unicast et broadcasts ; aging ; `show mac address-table` |
| Part II, ch. 8 | *Configuring and Verifying Switch Interfaces* | Contexte des interfaces (utile pour les ports d'accès) |
| Part III, ch. 10 | *Implementing Ethernet Virtual LANs* | Domaine de broadcast, VLAN, access vs trunk, 802.1Q, native VLAN, `switchport mode access/trunk`, `switchport access vlan`, `show vlan brief`, `show interfaces trunk` ; routage inter-VLAN (en aperçu) |
| Part III, ch. 11 | *Troubleshooting Ethernet LANs* | Erreurs de VLAN et de trunk classiques (erreurs fréquentes, quiz) |

---

## Inventaire des concepts

Légende *IMPORTANCE* : **T1** = modèle central · **T2** = savoir opérationnel · **T3** = détail pour plus tard.
*VISUAL POTENTIAL* : de ★ (peu visuel) à ★★★ (le concept *est* un mouvement).

| # | CONCEPT | SOURCE SECTION | IMPORTANCE | PREREQUISITES | MISCONCEPTIONS | VISUAL POTENTIAL |
|---|---|---|---|---|---|---|
| C1 | **Trame Ethernet** (en-tête + données + FCS) | ch. 2 | T1 | aucun | « trame = paquet » (le paquet IP est *dans* la trame) | ★★★ enveloppe qu'on ouvre |
| C2 | **Adresse MAC** (48 bits, écrite en hexa, ex. `0200.1111.1111`) | ch. 2 | T1 | C1 | « la MAC change à chaque réseau » (c'est l'IP qui est logique ; la MAC est liée à la carte réseau) | ★★ étiquette gravée sur la carte |
| C3 | **MAC source / MAC destination** | ch. 2 | T1 | C2 | ordre des champs : la destination vient **en premier** dans l'en-tête | ★★★ deux cases distinctes sur l'enveloppe |
| C4 | **Table d'adresses MAC** (VLAN, MAC, type, port) | ch. 5 | T1 | C3 | « le switch est configuré à la main avec les MAC » (c'est dynamique par défaut) | ★★★ tableau qui se remplit |
| C5 | **Apprentissage (learning) sur la MAC *source*** + port d'entrée | ch. 5 | **T1 — idée n°1** | C3, C4 | « le switch apprend la destination » ← **piège central de l'épisode** | ★★★ la MAC source glisse dans la table |
| C6 | **Décision forward / filter sur la MAC *destination*** | ch. 5 | T1 | C4, C5 | « le switch regarde l'IP » (switch L2 : non) | ★★★ ligne surlignée, flèche unique |
| C7 | **Flooding d'une unknown unicast** : tous les ports du VLAN **sauf le port d'entrée** | ch. 5 | T1 | C6 | « flooding = broadcast » ; « renvoyé aussi vers l'émetteur » | ★★★ copies qui se dupliquent |
| C8 | Les hôtes non destinataires **jettent** la trame (la carte compare la MAC destination) | ch. 2/5 | T2 | C7 | « tous les PC traitent la trame floodée » | ★★ trame qui se dissout |
| C9 | **Broadcast** (`FFFF.FFFF.FFFF`), toujours floodé, traité par tous (ex. ARP) | ch. 2/5 | T1 | C7 | « une broadcast finit par être apprise » (non, jamais) | ★★★ pulsation jaune |
| C10 | **Domaine de broadcast** | ch. 10 | T1 | C9 | « un switch = un domaine de collision ET de broadcast » (par défaut 1 domaine de broadcast pour tout le switch) | ★★★ onde qui s'arrête à une frontière |
| C11 | **VLAN** = un domaine de broadcast défini par configuration | ch. 10 | T1 | C10 | « VLAN = sous-réseau physique séparé » ; « VLAN = sécurité totale » | ★★★ zones colorées |
| C12 | **Port d'accès** : 1 VLAN, trames **non taguées**, le PC ignore le VLAN | ch. 10 | T1 | C11 | « le PC ajoute le tag 802.1Q » ← **piège n°2** | ★★ le port prend la couleur, pas le PC |
| C13 | **Trunk** : un lien, plusieurs VLAN | ch. 10 | T1 | C11 | « il faut un câble par VLAN » | ★★★ 4 câbles qui fusionnent |
| C14 | **802.1Q** : champ de 4 octets inséré après la MAC source, VLAN ID sur 12 bits | ch. 10 | T1/T2 | C13, C1 | « le tag est une étiquette extérieure » (c'est un champ de l'en-tête, FCS recalculé) | ★★★ badge coloré fixé à la trame |
| C15 | Le switch de sortie **lit le tag, puis le retire** avant un port d'accès | ch. 10 | T1 | C14 | « le tag reste jusqu'au PC » | ★★★ badge qui se détache |
| C16 | La table MAC est **par VLAN** et le flooding reste **dans le VLAN** | ch. 5/10 | T2 | C7, C11 | « une unknown unicast VLAN 10 part aussi dans le VLAN 20 » | ★★ colonne VLAN qui apparaît |
| C17 | Entre deux VLAN : **routeur / switch L3** obligatoire | ch. 10 | T2 (aperçu) | C11 | « même switch = communication directe » | ★★ mur entre deux couleurs |
| C18 | CLI : `show mac address-table`, `switchport mode access`, `switchport access vlan 10`, `switchport mode trunk`, `show interfaces trunk` | ch. 5/10 | T2 | C4, C12, C13 | copier des commandes sans comprendre le modèle | ★ bandeau terminal discret |
| C19 | Aging timer (300 s par défaut) | ch. 5 | T3 | C4 | « une entrée est éternelle » | ★ sablier sur une ligne |
| C20 | Native VLAN (non taguée sur trunk, VLAN 1 par défaut) | ch. 10 | T3 | C14 | — (source de nombreuses erreurs, épisode ultérieur) | ★ |
| C21 | DTP / négociation trunk, VTP, allowed VLAN list | ch. 10 | T3 | C13 | — | ★ |
| C22 | ISL (protocole Cisco historique) | ch. 10 | T3 | C14 | — | — |
| C23 | Boucles et STP (3ᵉ fonction du switch) | ch. 5 (renvoi) | T3 ici → **épisode 2** | C7, C9 | — | ★★★ (teaser de fin) |
| C24 | Collision domain, half/full duplex, CSMA/CD | ch. 2/5 | T3 | — | — | ★ |

---

## Dependency map

```
                        C1 Trame Ethernet
                               │
                        C2 Adresse MAC
                               │
                   C3 MAC source / MAC destination
                     ┌─────────┴──────────┐
              (source)                 (destination)
                  │                         │
          C5 Learning ──► C4 Table MAC ◄── C6 Forward/Filter
                                            │
                              lookup miss ──┴── lookup hit
                                   │                │
                        C7 Unknown unicast flood   forward 1 port
                                   │
                        C9 Broadcast (flood *par nature*)
                                   │
                        C10 Domaine de broadcast
                                   │
                        C11 VLAN  ─────────────── C17 Inter-VLAN = routeur (aperçu)
                        ┌──────────┴──────────┐
                C12 Port d'accès          C13 Trunk
                (non tagué)                    │
                        │                 C14 802.1Q (tag)
                        └──────┬──────────────┘
                        C15 Tag lu puis retiré
                               │
                   C16 Table MAC par VLAN (synthèse)
```

**Règle d'ordre retenue :** 802.1Q n'apparaît qu'une fois que *trame*, *MAC*, *flooding* et *broadcast* ont été **vus** en mouvement. Le VLAN est introduit comme réponse à un problème de broadcast, jamais comme définition.

---

## Choix du format d'adresse à l'écran

- Odom écrit les MAC au format Cisco : `0200.1111.1111`.
- Pour la lisibilité à l'écran (et la voix), on utilise des **alias courts** : `AA:AA`, `BB:BB`, `CC:CC`…
- Une seule fois (chapitre 1), on montre l'adresse complète `AAAA.AAAA.AAAA` avec le sous-titre « 48 bits — on abrège en AA:AA pour la suite ». Cela évite de faire croire qu'une MAC fait 2 octets.
- La broadcast est toujours affichée en entier : `FFFF.FFFF.FFFF` (le motif « que des F » est mémorable).

## Points de vigilance technique (à vérifier à chaque scène)

1. Le flooding **n'inclut jamais** le port d'entrée.
2. Les PC non destinataires d'une unknown unicast la **jettent** — ils ne la « traitent » pas.
3. Une broadcast n'est **jamais** apprise ni évitée : elle est floodée à chaque fois.
4. Sur un port d'accès, la trame est **non taguée** dans les deux sens.
5. Le tag 802.1Q s'insère **entre la MAC source et l'EtherType** ; c'est un champ, le FCS est recalculé.
6. Le flooding d'une trame VLAN 10 inclut les trunks qui transportent le VLAN 10 — pas les ports VLAN 20.
7. Dans la table MAC Cisco réelle, chaque entrée porte un **VLAN** : on révèle cette colonne au chapitre 7/8.
8. Deux PC dans deux VLAN différents d'un même switch L2 **ne communiquent pas directement** : il faut du routage.
9. La réponse de PC-B vers PC-A est un **unicast connu** (AA:AA est déjà dans la table) → pas de flooding pour la réponse.

## Ce qui est volontairement laissé hors de l'épisode

Native VLAN, DTP, VTP, allowed VLANs, ISL, aging, collision domains, STP.
STP sert de **teaser** final (épisode 2) : « et si deux switches étaient reliés deux fois ? »
