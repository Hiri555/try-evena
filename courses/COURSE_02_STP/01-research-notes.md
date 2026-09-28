# 01 — Research notes · COURSE_02_STP

> **Épisode 2 — « La petite boucle qui peut détruire un LAN »**

## ⚠️ Source

Le livre n'est toujours pas dans le dépôt ni sur Drive. Référence utilisée : *CCNA R&S ICND2 200-105 Official Cert Guide* (Odom), partie I. Numéros de chapitre **présumés** :

| Réf. présumée | Titre | Ce qu'on en tire |
|---|---|---|
| ICND2 ch. 2 | *Spanning Tree Protocol Concepts* | Problèmes sans STP (broadcast storm, MAC table instability, multiple frame transmission), Bridge ID, élection du root, root cost, root port, designated port, états, timers 802.1D, RSTP (rôles alternate/backup, états discarding/learning/forwarding) |
| ICND2 ch. 3 | *Spanning Tree Protocol Implementation* | `spanning-tree vlan X priority`, `root primary`, coûts par défaut, EtherChannel (`channel-group`, LACP/PAgP), `show spanning-tree` |

---

## Concepts

| # | CONCEPT | IMPORTANCE | PREREQUISITES | MISCONCEPTIONS | VISUAL POTENTIAL |
|---|---|---|---|---|---|
| C1 | **Boucle Ethernet** : plusieurs chemins actifs entre switches | T1 | ép. 1 (flooding, broadcast) | « la redondance est une boucle » (non : seulement si les chemins sont *actifs*) | ★★★ triangle |
| C2 | **Pas de TTL** dans l'en-tête Ethernet → une trame ne meurt jamais seule | T1 | ép. 1 (trame) | « le switch détecte qu'il a déjà vu la trame » (non, il n'a aucune mémoire des trames) | ★★ en-tête sans champ TTL |
| C3 | **Broadcast storm** : les copies tournent, s'accumulent, saturent liens et CPU | T1 | C1, C2 | — | ★★★ écran qui se remplit de jaune |
| C4 | **Instabilité de la table MAC** : la MAC source arrive par des ports différents, la table est réécrite sans cesse | T1/T2 | ép. 1 (learning) | — | ★★★ ligne qui clignote entre deux ports |
| C5 | Réception de **copies multiples** par les hôtes | T2 | C3 | — | ★★ |
| C6 | **STP (802.1D)** : bloquer logiquement des ports pour obtenir un arbre sans boucle, en gardant la redondance | T1 | C1 | « STP coupe le câble » | ★★★ barrière |
| C7 | **BPDU** (Hello toutes les 2 s du root) | T2 | C6 | — | ★★ enveloppes violettes |
| C8 | **Bridge ID** = priorité (2 octets, défaut 32768 + VLAN → 32769 en VLAN 1) + MAC | T1 | C7 | « la plus grande priorité gagne » | ★★★ cartes de candidat |
| C9 | **Élection du Root Bridge** : plus petit BID (priorité, puis MAC) | T1 | C8 | idem | ★★★ tournoi + couronne |
| C10 | **Coût STP** : 10 Mb/s = 100, 100 Mb/s = 19, 1 Gb/s = 4, 10 Gb/s = 2 (802.1D révisé) | T1/T2 | — | « moins de sauts = meilleur » | ★★ badges de coût |
| C11 | **Root Port** : sur chaque non-root, port au plus faible coût vers le root (départage : BID voisin, puis priorité/n° de port voisin) | T1 | C9, C10 | « le lien direct vers le root est toujours le root port » ← **piège de l'épisode** | ★★★ chemins qui s'additionnent |
| C12 | **Designated Port** : un par segment, côté du switch au plus faible coût vers le root (départage : BID) ; tous les ports du root sont désignés | T1 | C11 | « chaque switch a un port désigné » (c'est par segment) | ★★★ segment par segment |
| C13 | **Blocking / Alternate** : le reste ; ne transmet pas de données, écoute les BPDU | T1 | C12 | « le port bloqué est éteint » | ★★★ barrière rouge, câble visible |
| C14 | **Convergence 802.1D** : MaxAge 20 s, Forward Delay 15 s (listening + learning) → jusqu'à ~50 s | T2 | C13 | — | ★★ chrono |
| C15 | **RSTP (802.1w)** : port Alternate = remplaçant pré-calculé du root port → bascule quasi immédiate ; états discarding/learning/forwarding | T1/T2 | C13 | « RSTP est un autre protocole sans rapport » | ★★★ barrière qui se lève instantanément |
| C16 | **EtherChannel** : jusqu'à 8 liens physiques = 1 lien logique (Port-channel) ; STP n'en voit qu'un ; répartition de charge par flux | T1/T2 | C13 | « le débit d'un flux unique est multiplié » (non : répartition par flux) | ★★★ 4 câbles qui fusionnent |
| C17 | PVST+ / Rapid PVST+ (une instance par VLAN), PortFast, BPDU Guard, LACP vs PAgP | T3 | — | — | ★ |

## Topologie de l'épisode (conçue pour créer un « aha »)

```
            SW1  (BID 32769 · 0200.0000.0001)  ← ROOT
     Fa0/1 /  \ Gi0/2
   100 Mb /    \ 1 Gb
  (coût 19)    (coût 4)
   Fa0/1 /      \ Gi0/1
       SW2 ———— SW3
  (…0002) Gi0/2  Gi0/2 (…0003)
          1 Gb (coût 4)
```

| Étape | Résultat | Pourquoi |
|---|---|---|
| Root | **SW1** | priorités égales (32769), plus petite MAC (…0001) |
| RP de SW3 | **Gi0/1** (direct, coût 4) | détour par SW2 = 4 + 19 = 23 |
| RP de SW2 | **Gi0/2** (vers SW3, coût 4 + 4 = 8) | direct vers SW1 = 19 ← **le détour gagne** |
| DP segment SW1–SW3 | SW1 Gi0/2 | port du root |
| DP segment SW1–SW2 | SW1 Fa0/1 | port du root |
| DP segment SW2–SW3 | **SW3 Gi0/2** | coût vers root : SW3 = 4 < SW2 = 8 |
| Bloqué / Alternate | **SW2 Fa0/1** | ni RP, ni DP |
| Failover (lien SW2–SW3 coupé) | SW2 Fa0/1 devient RP (coût 19) | RSTP : alternate → root port immédiatement |

### Quiz (autre triangle, tout en 1 Gb/s, coût 4)

| Switch | BID | Rôle attendu |
|---|---|---|
| SW-A | 32769 · 0200.0000.00AA | RP = port vers SW-B ; port vers SW-C **bloqué** |
| SW-B | **28673** · 0200.0000.00BB | **ROOT** (priorité plus basse, MAC non comparée) |
| SW-C | 32769 · 0200.0000.000C | RP = port vers SW-B ; port vers SW-A **désigné** (égalité de coût 4–4 → BID : même priorité, MAC 000C < 00AA) |

## Précision technique sur le hook (écart assumé vs le brief)

Le brief demande un compteur 1 → 2 → 4 → 8 → 16…
Dans un **triangle**, une broadcast ne double pas à chaque tour : SW2 en crée 2 copies (vers SW1 et SW3), puis ces 2 copies tournent **indéfiniment** en sens opposés, et **à chaque passage** chaque switch en délivre une copie à ses PC. Le doublement exact n'existe qu'avec ≥ 3 liens inter-switch par switch.
Ce qui est vrai — et plus impressionnant : un tour de boucle à 1 Gb/s dure quelques microsecondes → **des dizaines de milliers de copies par seconde**, et chaque nouvelle broadcast (ARP, DHCP…) s'ajoute sans jamais disparaître.
→ Le compteur affiche les **copies transmises (cumul)**, calculées par simulation fidèle du triangle, avec une accélération du temps (ralenti → temps réel). Visuellement, ça explose comme demandé ; techniquement, c'est juste.

## Points de vigilance

1. Le port bloqué **reçoit et écoute les BPDU**, il ne transmet pas de trames de données.
2. Le root port est choisi au **coût cumulé**, pas au nombre de sauts.
3. Le port désigné est défini **par segment**.
4. « Le plus petit gagne » partout (BID, coût, départages).
5. 32769 = 32768 + VLAN 1 (extension d'ID système) — affiché, pas développé.
6. RSTP : « alternate » est un **rôle**, « discarding » un **état**. On nomme le rôle.
7. EtherChannel : répartition **par flux**, pas un seul flux plus rapide.
