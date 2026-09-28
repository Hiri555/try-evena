# 02 — Learning map · COURSE_02_STP

## BIG QUESTION

> **Comment garder des câbles de secours entre switches… sans que le réseau s'auto-détruise ?**

## CORE MODEL

1. Plusieurs chemins actifs entre switches = boucle → une broadcast tourne pour toujours (pas de TTL).
2. STP garde tous les câbles mais **bloque logiquement** assez de ports pour obtenir un arbre.
3. Il élit un **Root Bridge** : plus petit Bridge ID (priorité, puis MAC).
4. Chaque autre switch garde **un Root Port** : coût cumulé le plus faible vers le root.
5. Chaque câble garde **un Designated Port** : côté le plus proche du root.
6. Tout le reste est **bloqué (Alternate en RSTP)** et prend le relais en cas de panne.
7. **EtherChannel** : plusieurs câbles parallèles = un seul lien logique pour STP.

## LEARNING OBJECTIVES (7)

1. Expliquer pourquoi une broadcast ne s'arrête jamais dans une boucle, et citer les 3 symptômes.
2. Désigner le Root Bridge à partir de Bridge IDs.
3. Calculer un root cost et en déduire le Root Port (même quand le détour gagne).
4. Désigner le port désigné de chaque segment.
5. Identifier le port bloqué/alternate.
6. Décrire la bascule en cas de panne et la différence 802.1D / RSTP.
7. Expliquer pourquoi l'EtherChannel évite que STP bloque des liens parallèles.

## 80/20

- **T1** : boucle, pas de TTL, storm, instabilité MAC, BID, root, coût, RP, DP, blocking/alternate, RSTP = bascule rapide, EtherChannel = 1 lien logique.
- **T2** (à l'écran, non lu) : `spanning-tree vlan 1 priority 24576` · `spanning-tree vlan 1 root primary` · `show spanning-tree` · `channel-group 1 mode active` · coûts 19/4 · timers 20/15/15.
- **T3** (reporté) : PVST+, PortFast, BPDU Guard, LACP vs PAgP, backup port.

## MISCONCEPTIONS

| Erreur | Où on la casse |
|---|---|
| « Le switch sait qu'il a déjà vu la trame » | S02 : en-tête Ethernet sans TTL, zoom |
| « Pour éviter la boucle, on retire un câble » | S04 : ciseaux → plan B perdu |
| « La plus grande priorité gagne » | S05 : « le plus petit gagne, toujours » |
| « Le lien direct vers le root est forcément le root port » | S06 : le détour à 8 bat le direct à 19 |
| « Chaque switch a un port désigné » | S07 : segment par segment |
| « Un port bloqué est éteint » | S08 : il écoute encore les BPDU, câble visible |
| « Redondance = boucle » | S09 : REDONDANCE ≠ BOUCLE ACTIVE |
| « 4 liens = STP en garde 4 » | S10 : 3 barrières, puis Port-channel |

## FINAL MENTAL MODEL

```
  plus petit BID ──► ROOT (couronne)
  chaque non-root ─► ROOT PORT (coût min)
  chaque câble ───► DESIGNATED PORT (côté le plus proche)
  le reste ───────► BLOQUÉ / ALTERNATE (le câble reste, prêt à servir)
  liens parallèles ► EtherChannel = 1 seul lien
```
