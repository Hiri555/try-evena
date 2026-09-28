# Présenz — Storyboard du pitch 3 min (Phase 2 · Partie C)

**Identité visuelle**, reprise du produit réel :
- vert `#2d6a4f` (principal), `#40916c` (accent), `#1b4332` (fond sombre) ;
- fond `#f6f8f7`, police **Inter**, cartes blanches à rayon 16 px ;
- le pictogramme QR du logo.

**Règles de mise en page**
- Une idée par écran.
- Texte à l'écran : 7 mots maximum, hors captures.
- Aucune statistique qui ne soit pas marquée comme hypothèse.

**Format des captures.** Elles sont montrées dans un cadre sobre : navigateur pour le desktop, téléphone pour le mobile. Un zoom animé lent (Ken Burns de 5 %) se pose sur la zone utile, et le reste de l'image est assombri à 40 %.

| # | Temps | Visuel | Texte à l'écran | Mouvement / transition | Son |
|---|---|---|---|---|---|
| **H1** | 0:00 | Écran noir | `08:00:00` (Inter Mono, 280 px, blanc) | L'horloge avance en temps réel | tic-tac discret |
| **H2** | 0:05 | Noir, horloge en haut à droite (petite) | Lignes qui apparaissent : « Diallo ? — Présent. » · « Sow ? — … » · « Mbaye ? — Présente. » · « Faye ? » · une feuille illustrée circule | Chaque ligne entre toutes les 1,2 s. L'horloge accélère jusqu'à `08:03:12`, qui passe en rouge. | tic-tac qui s'accélère |
| **H3** | 0:18 | Fond clair | `3 min × 6 cours × 5 jours × 30 semaines` puis **`= 45 h`** (très grand). En petit : *« hypothèse : 3 min d'appel par cours »* | Les facteurs tombent un par un, le total grossit | clic sec sur le total |
| **R1** | 0:30 | Blanc pur | « Et si l'appel disparaissait ? » | Fondu depuis H3. Le texte reste 2 s seul. | silence |
| **R2** | 0:36 | Blanc | Logo Présenz (pictogramme QR vert) + « L'étudiant scanne. Son téléphone confirme. Le cours commence. » | Le pictogramme se dessine, puis la phrase apparaît en 3 temps | note basse, montée légère |
| **D1** | 0:45 | **Live** : navigateur, Professeur › Projeter QR › cours du jour, plein écran | *(UI réelle)* | Bascule franche vers le navigateur | — |
| | | *Repli :* `professeur/04-projection-plein-ecran.png` | | Zoom sur le QR et le code | |
| **D1b** | 0:55 | *(Si caméra de document disponible)* le téléphone du complice | *(UI réelle)* `etudiant/04-pointage-valider.png`, puis `05-presence-validee.png` | — | son de confirmation du téléphone |
| **D1c** | 1:10 | **Live** : onglet `/professeur/suivi/{id}` | *(UI réelle)* | Alt+Tab. La ligne passe de « En attente » à « Présent » au rafraîchissement suivant (≤ 5 s). | notification douce |
| | | *Repli :* `professeur/05-suivi-direct.png` | | Cadrage sur les 3 premières lignes + le compteur « 5 Présents » | |
| **D2** | 1:25 | Fond clair, écran divisé | À gauche, « AVANT » : 6 pastilles grises « appeler · répondre · faire circuler · signer · ramasser · ressaisir ». À droite, « AVEC PRÉSENZ » : une seule pastille verte **« 1 geste »** | Les 6 pastilles se replient une à une dans la pastille verte (≈ 2 s) | glissements très doux |
| **J1** | 1:45 | `professeur/03-projection-qr.png` dans un cadre navigateur | `08:00` (coin haut gauche, vert) · « Le prof projette » | Zoom sur le QR et les compteurs | tic |
| **J2** | 1:52 | `professeur/06-invalidation-motif.png` | `10:15` · « Un doute ? Il invalide. » | Zoom sur la fenêtre « Invalider le pointage » | tic |
| **J3** | 1:59 | `scolarite/06-import-pdf.png` | `14:00` · « L'emploi du temps, depuis le PDF » | Zoom sur la zone de dépôt | tic |
| **J4** | 2:06 | `scolarite/08-reporting.png` | `17:00` · « Les absents. Une relance. » | Zoom sur « Étudiants les plus absents », avec un halo sur le bouton « Relancer » | tic + confirmation |
| **O1** | 2:15 | Fond clair, 3 lignes | « Et la triche ? » → « Appareil personnel · code éphémère · le prof valide » ; « Sans smartphone ? » → « Pointage manuel par la scolarité » ; « Vie privée ? » → « La biométrie ne quitte jamais le téléphone » | Chaque question entre, puis sa réponse glisse dessous, grisée | — |
| **F1** | 2:40 | Noir, comme H1 | `08:00:00`, puis le QR apparaît au centre, puis `08:00:30` et le mot **« Cours »** qui s'allume en vert | Même composition que H1 : effet de boucle | tic-tac qui s'arrête net |
| **F2** | 2:47 | Blanc | **« Le cours commence à 08:00. Vraiment. »** | « Vraiment. » arrive 0,8 s après | silence |
| **F3** | 2:52 | Blanc | Logo · URL de démo · QR vers la démo · « Testez-le dans une de vos classes » | Fondu doux | — |

**Captures non utilisées dans le pitch 3 min**, gardées pour les questions :
- `etudiant/01-dashboard.png` : taux de présence, bouton Pointer ;
- `etudiant/00-enrolement-premier-login.png` : premier login ;
- `admin/03-devices.png` : appareils révocables ;
- `admin/04-configuration.png` : réglages ;
- `admin/05-monitoring-logs.png` : journal ;
- `scolarite/03-etudiants.png` : statut Enrôlé / Non enrôlé ;
- `scolarite/09-export.csv` et `.pdf` : exports réels.

**À ne pas montrer tant que les correctifs ne sont pas en ligne :**
- `scolarite/02b` et `02c` : liste d'appel, bug de sauvegarde (CORRECTIONS 0.5) ;
- `professeur/07-apres-invalidation.png` : l'invalidation a été refusée (CORRECTIONS 0.4) ;
- `landing/*` : tant que les textes corrigés ne sont pas publiés.
