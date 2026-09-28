# 01 — PRODUCT AUDIT · Présenz ZéroContact

Audit fait le 28/09/2026 sur https://presenzzerocontact.shipiix.piitech.dev/.

**Méthode**
- Landing page rendue dans Chromium, en desktop 1440 et en mobile 390.
- Page de connexion.
- Lecture du bundle front de production (`/assets/index-Byk1HHNj.js`) :
  - routes et appels API ;
  - textes d'interface ;
  - valeurs par défaut de configuration.
- Sonde de l'API (`presenzzerocontact-api…/api`) : elle répond, les routes protégées redirigent sans authentification.

**Limite de l'audit :** sans compte, je n'ai pas pu voir les écrans connectés en fonctionnement. Tout ce qui les concerne ci-dessous vient du code du front : c'est le comportement programmé, pas une observation en direct.

Légende :
- ✅ vérifié ;
- 🟡 présent dans le code mais non observé en fonctionnement ;
- ❌ annoncé mais introuvable ou contredit par le code.

---

## PRODUCT IN ONE SENTENCE

Le professeur projette un QR code qui change en permanence. Chaque étudiant présent le scanne avec son téléphone et confirme avec l'empreinte ou Face ID de *son* appareil. La liste d'appel se remplit toute seule, en direct, pour le professeur, et la scolarité reçoit les données sans rien ressaisir.

## PROBLEM SOLVED

L'appel manuel, sur papier ou à voix haute, pose quatre problèmes :
- il prend du temps de cours ;
- il se fraude (« présent » pour un camarade, signature imitée) ;
- il produit des feuilles qu'il faut ensuite ressaisir ;
- la scolarité voit les absences tard, voire jamais.

## PRIMARY USERS

Rôles réels dans le code (routes `/etudiant`, `/professeur`, `/scolarite`, `/admin`, `/super-admin`) :

| Rôle | Écrans vérifiés dans le code |
|---|---|
| **Étudiant** | Dashboard (taux de présence, seuil minimum 75 %), `Pointer ma présence`, historique, emploi du temps, profil. |
| **Étudiant « Responsable »** (délégué) | `Diffuser le QR` : il peut afficher lui-même le QR de sa classe. |
| **Professeur** | Dashboard, `Projeter le QR Code` (plein écran vidéoprojecteur), suivi temps réel (rafraîchi toutes les 5 s), invalider ou restaurer un pointage avec motif, terminer la session, statistiques, cours. |
| **Scolarité** | Dashboard, étudiants, classes, cours, emploi du temps, liste d'appel, reporting. |

## SECONDARY USERS

| Rôle | Ce qu'il fait |
|---|---|
| **Administrateur** | Utilisateurs, import CSV, appareils enregistrés (révocation), configuration, logs de sécurité, monitoring. La configuration couvre : fenêtre de pointage, rotation du QR, domaine autorisé, SSO Azure, emails SMTP, logo. |
| **Direction** | Pas de rôle dédié. Elle utiliserait les vues admin ou reporting. |
| **Super-admin** (éditeur) | Multi-établissements, licences. **Données mockées dans le front** : ESMT, UCAD, EPT, Lycée Blaise Diagne… sont des exemples, pas des clients (voir UNVERIFIED CLAIMS). |

## CURRENT WORKFLOW (sans Présenz, déduit, à valider avec le terrain)

1. Le professeur fait l'appel à voix haute ou fait circuler une feuille.
2. Les étudiants répondent ou signent. Un absent peut être « couvert ».
3. Les retardataires interrompent le cours et font corriger la feuille.
4. Le professeur transmet la feuille à la scolarité.
5. La scolarité ressaisit les données (ou archive le papier).
6. Le calcul des taux et le repérage des absents chroniques se font plus tard, à la main.

## NEW WORKFLOW (vérifié dans le code)

1. Le professeur ouvre `Projeter le QR Code` et choisit son cours du jour. Le QR s'affiche en plein écran.
2. L'étudiant scanne avec l'appareil photo de son téléphone. Le QR contient un lien `/etudiant/pointage/{cours}?token=…`.
3. Il appuie sur « Valider ma présence » et confirme par biométrie (WebAuthn : Face ID, Touch ID, empreinte, Windows Hello, avec repli PIN ou clé de sécurité).
4. Le serveur vérifie le jeton QR en cours, la fenêtre de pointage et la passkey de l'appareil enregistré. C'est « Présence validée ! ».
5. Le professeur voit l'étudiant apparaître dans la liste en direct. Il peut invalider un pointage avec un motif (« Étudiant absent de la salle », « sorti avant la fin ») ou le restaurer.
6. En fin de séance, il clique sur « Terminer la session » : plus aucun pointage n'est possible.
7. La scolarité et l'admin retrouvent les données dans leur reporting : taux par classe et par cours, top absents, relance email, export CSV et PDF.

## CORE FEATURES (vérifiées dans le code)

- QR dynamique projeté, avec rotation configurable. **Défaut du formulaire admin : 30 s.** La landing annonce 10 s.
- WebAuthn / passkeys, liées à l'appareil. Enrôlement au premier accès (« enregistre ton appareil maintenant »). Appareils listés et révocables par l'admin.
- Fenêtre de pointage configurable. **Défaut admin : 120 min, maximum 2 h.** Un étudiant hors fenêtre est « marqué absent ».
- Suivi en direct côté professeur, par polling toutes les 5 s. Invalidation ou restauration avec motif.
- Pointage manuel par le professeur (« override ») : c'est le « pointage assisté » de la FAQ.
- Délégué de classe qui peut diffuser le QR.
- Import des étudiants et utilisateurs en CSV.
- **Import d'emploi du temps depuis un PDF par OCR**, avec vérification des cours extraits avant import.
- Reporting :
  - dashboard ;
  - vues par classe et par cours ;
  - top absents ;
  - relance par email ;
  - export **CSV** et **PDF**.
- Annulation de cours, avec notification des étudiants (texte UI).
- Journal d'événements et logs de sécurité.
- Seuil de présence minimum affiché à l'étudiant (75 %), avec alerte en dessous.

## CORE DIFFERENTIATORS

1. **Le téléphone de l'étudiant devient sa carte d'identité.** Le pointage exige la passkey de *son* appareil enregistré, plus un QR qui n'est valable que quelques secondes.
2. **Zéro matériel.** Il suffit du vidéoprojecteur de la salle et des smartphones des étudiants. Pas de badgeuse, pas d'app à installer (application web).
3. **Le professeur garde la main.** Il voit la liste se remplir en direct et peut invalider un pointage.
4. **La donnée arrive seule** à la scolarité, sans ressaisie.

## PROOFS AVAILABLE

- Mécanisme QR → lien → biométrie → check-in : visible dans le code (`/attendance/checkin {course_id, qr_token, credential}`).
- Écrans et libellés réels pour une démo : projection plein écran, suivi en direct, dashboard étudiant, reporting.
- Branding réel :
  - vert `#2d6a4f` (principal), `#40916c` (clair), `#1b4332` (foncé) ;
  - police Inter, cartes blanches arrondies, fond gris-vert très clair ;
  - logo en pictogramme QR sur carré vert.
- **Aucune preuve d'usage réel** : pas de client confirmé, pas de chiffres mesurés.

## UNVERIFIED CLAIMS (détail dans 03_CLAIMS_AUDIT en phase 2)

| Claim (landing / FAQ) | Constat |
|---|---|
| « …basé sur QR code dynamique, biométrie **et géolocalisation** » | ❌ Aucune géolocalisation dans le code front. |
| « **Fonctionne hors-ligne** » / « Mode hors-ligne intégré » / « Les scans continuent d'être enregistrés localement » | ❌ Rien dans le code : pas de stockage local des scans, pas de service worker, pas de détection hors-ligne. |
| « Le QR change toutes les **10 secondes** » | 🟡 La valeur est configurable ; le défaut admin est de 30 s. |
| « Impossible à partager ou à capturer en photo » / « **Aucune fraude possible** » | ❌ Trop fort. Une photo ou un lien reste valable pendant la durée de rotation. La biométrie peut retomber sur le code PIN du téléphone. Sans géolocalisation, rien ne prouve techniquement la présence dans la salle. La vraie défense : appareil enregistré + QR éphémère + contrôle visuel du professeur. |
| « Détection automatique des doubles pointages, **appareils non autorisés et anomalies** » | 🟡 Des logs de sécurité existent (« Activité suspecte récente »). Le moteur de détection est côté serveur, non vérifiable ici. |
| « Chiffrement AES-256 au repos, TLS 1.3, audit logs complets » | 🟡 / ❌ HTTPS actif. AES-256 et TLS 1.3 sont invérifiables depuis l'extérieur. |
| « Aucune donnée biométrique ne sort de l'appareil » | ✅ C'est le principe même de WebAuthn : le serveur ne reçoit qu'une signature. Cohérent avec le code. |
| « Pointage en < 5 s » / « classe entière en < 30 s » | 🟡 Plausible, jamais mesuré. |
| « Exports **Excel** & PDF » | 🟡 L'export est en CSV (ouvrable dans Excel) et en PDF. |
| « Notifications temps réel » / « alertes d'absence répétée » | 🟡 Emails configurables et relance manuelle existent. Pas de push temps réel dans le front. |
| « Continuer avec Microsoft » (SSO) | ❌ Le bouton est affiché, mais le code contient « SSO non activé sur ce backend pour le moment ». |
| Données hébergées en Afrique / en Europe au choix, déploiement 24–48 h, on-premise 1–2 semaines | 🟡 Engagements commerciaux, à confirmer par le fondateur. |
| Établissements cités (ESMT, UCAD, EPT, Lycée Blaise Diagne) | ❌ Ce sont des données de démonstration du super-admin. **Ne jamais les présenter comme clients.** |
| Formules Starter / Pro / Business / Enterprise | 🟡 Aucun prix affiché. |

## BEST DEMO MOMENTS

1. **Projection → scan → la liste se remplit en direct.** C'est le WOW : le téléphone d'un étudiant dans la salle, et 1 à 3 s plus tard son nom apparaît sur l'écran projeté.
2. **Le QR qui change sous les yeux** : c'est la réponse visuelle à la question « et si on prend une photo ? ».
3. **Le professeur invalide un pointage** avec le motif « Étudiant absent de la salle » : c'est lui qui garde le contrôle.
4. **L'import PDF → OCR → emploi du temps** : utile pour convaincre la scolarité.
5. **Le reporting** : top absents, taux par classe, relance en un clic.
