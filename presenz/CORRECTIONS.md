# Présenz — Corrections (Phase 2 · Partie B)

Je n'ai pas accès au repo. Les textes ci-dessous sont **copiés à l'identique du build de production** (`/assets/index-Byk1HHNj.js`) : fais un *rechercher* sur chaque phrase dans les sources (`src/`) pour trouver le fichier.

Ce document contient :
- **§ 0** : bugs bloquants pour la démo, à traiter en premier ;
- **§ 1** : corrections de textes demandées ;
- **§ 2** : corrections de textes que je recommande en plus ;
- **§ 3** : bugs secondaires et nettoyage des données ;
- **§ 4** : l'incident que j'ai causé pendant mes tests.

---

## 0. BLOQUANT POUR LA DÉMO — à corriger avant tout pitch

### 0.1 Le QR projeté n'est pas scannable par l'appareil photo d'un téléphone 🔴

- **Constat.** Le QR contient du JSON : `{"token":"WKHD5UU6","courseId":10}` (décodé depuis la capture `professeur/03-projection-qr.png`). Scanné avec l'appareil photo natif d'un iPhone ou d'un Android, il affiche **du texte**. Il n'ouvre pas l'application. Et l'application web n'a pas de scanner intégré (aucun accès caméra dans le code).
- **Aujourd'hui, pour pointer**, l'étudiant doit ouvrir Présenz, appuyer sur « Pointer ma présence », **taper le code à 8 caractères** affiché sous le QR, puis valider avec sa biométrie (capture `etudiant/04b`).
- **Correction (2 lignes, front).** Dans le composant de projection, il y a deux occurrences (vue normale et plein écran) de :
  ```js
  value: JSON.stringify({ token: u?.token, courseId: i.id })
  ```
  à remplacer par :
  ```js
  value: `${window.location.origin}/etudiant/pointage/${i.id}?token=${encodeURIComponent(u?.token ?? '')}`
  ```
  La route `/etudiant/pointage/:courseId?token=…` **existe déjà** et lit bien `?token=` : je l'ai testée, 5 pointages validés. Après ce correctif, le flux devient : appareil photo → le lien s'ouvre → « Valider » → empreinte ou Face ID. C'est le « un geste » du pitch.
- **Côté API**, `qr_url` renvoie `http://localhost:5173/checkin?...` : une valeur de développement restée en production. À corriger aussi (variable d'environnement `FRONTEND_URL`).

### 0.2 Le QR ne « tourne » pas vraiment 🔴

- **Constat.** Pendant que l'écran de projection est ouvert, il appelle `GET /qr/token/{id}` **plusieurs fois par seconde**. Environ 5 requêtes par seconde observées : c'est une boucle d'effet React. Et **chaque appel repousse `expires_at` de 60 s**. Résultat : le même code est resté valide plusieurs minutes. Les codes `U8Q8RNU0` et `DEAGZEDF` ont été renvoyés à l'identique, avec une expiration repoussée à chaque requête.
- **Correction.**
  - Backend : ne jamais prolonger un token existant. Nouveau token à l'échéance, en gardant éventuellement l'ancien valable 1 à 2 s de grâce.
  - Front : un seul intervalle de rafraîchissement, calé sur `expires_at`.
- **Libellé.** La projection affiche « Token rotatif · 30s » et « Nouveau code dans 30s », alors que la configuration admin est à **60 s**. Le libellé doit lire la valeur de la configuration.

### 0.3 Enrôlement d'un compte sans aucun secret 🔴 (sécurité, anti-fraude)

- **Constat.** Pour un étudiant **non encore enrôlé**, il suffit de saisir son **matricule**. L'écran « enregistre ton appareil maintenant » apparaît et l'appareil de la personne devant l'écran devient l'appareil officiel du compte. **Le mot de passe `esmt2026` n'a jamais été demandé** (`POST /auth/identify` puis `POST /auth/webauthn/register-options`).
- **Pire :** `POST /auth/identify {"identifier":"ESMT-26-0843"}` renvoie directement un `enrollment_token` à **n'importe qui**, sans authentification.
- **Risque.** Un étudiant peut enrôler sur son propre téléphone les comptes de camarades pas encore enrôlés, puis pointer pour eux. Cela contredit directement le discours anti-fraude.
- **Correction.** Exiger un secret à l'enrôlement :
  - mot de passe initial ;
  - ou lien ou code d'enrôlement à usage unique envoyé par email ou remis par la scolarité (le front contient déjà le message « Token d'enrôlement manquant », donc l'idée était prévue) ;
  - ou SSO.

### 0.4 L'invalidation est refusée au professeur du cours 🟠

- **Constat.** Pr. Ndiaye, professeur du cours de test, a tenté d'invalider un pointage (motif « Étudiant absent de la salle »). Réponse : `403 « Seul le professeur du cours peut invalider »`.
- **Piste.** Le cours avait été créé par l'admin (`created_by = 1`, `professor_id = 3`). Le contrôle compare peut-être `created_by`, ou compare un id en chaîne à un entier.
- **À tester** sur un cours créé normalement, **avant la démo**, parce que l'invalidation fait partie du pitch (« 10h15 »).

### 0.5 La sauvegarde de la liste d'appel écrit sur les mauvais pointages 🔴

- **Constat.** Dans Scolarité › Liste d'appel, « Sauvegarder les modifications » envoie `PUT /attendance/{id}/override`. Mais `{id}` y est **l'identifiant de l'étudiant**, pas celui du pointage.
- **Exemple.** Ibrahima Sow (étudiant n°6) et Seydou Sarr (n°12) ont produit `PUT /attendance/6` et `PUT /attendance/12`. Ces requêtes ont modifié **les pointages n°6 et n°12 d'anciens cours**. Le cours en cours, lui, n'a pas changé.
- **Correction.** Pour un étudiant « En attente » (aucune ligne `attendance`), il faut *créer* le pointage : `POST` avec `{course_id, user_id, status}`. Il ne faut utiliser `PUT /attendance/{attendanceId}` que pour une ligne existante.
- **Conséquence pour le pitch.** L'objection « pas de smartphone → pointage manuel » repose sur cette fonction : **elle doit être corrigée avant d'être promise**. Il n'y a pas non plus de bouton « Excusé », alors que le compteur « excusés » existe.
- **FAQ.** Elle dit : « Le professeur peut pointer manuellement l'étudiant depuis son interface ». **Aucun bouton ne le permet côté professeur** : seule la scolarité peut le faire.

---

## 1. Corrections de textes demandées

| # | Où | Texte actuel (exact) | Nouveau texte |
|---|---|---|---|
| 1a | Hero, titre | « Le pointage étudiant, sans contact, **sans fraude**. » | « Le pointage étudiant, **sans contact, sans papier**. » |
| 1b | Hero, sous-titre | « Présenz remplace l'appel papier par un système moderne basé sur **QR code dynamique**, **biométrie** et **géolocalisation**. Fini les tricheries, les oublis et la paperasse. » | « Présenz remplace l'appel papier par un **QR code dynamique** et la **biométrie de l'appareil personnel**. Fini les oublis, les signatures à la place d'un autre et la paperasse. » *(supprimer le `<span>` « géolocalisation » et le « et » qui le précède)* |
| 1c | Carte « QR Code dynamique » | « Le QR change toutes les 10 secondes. Impossible à partager ou à capturer en photo. » | « Le QR se renouvelle automatiquement (intervalle configurable par l'établissement). » |
| 1d | Carte « Biométrie on-device » | « Face ID, empreinte digitale ou Windows Hello. Aucune donnée biométrique ne sort de l'appareil. » | ✅ **inchangé** (vérifié : principe WebAuthn) |
| 1e | Étape 03 « Confirmation biométrique » | « Face ID ou empreinte digitale pour valider l'identité. **Aucune fraude possible.** » | « Face ID ou empreinte digitale : chaque pointage est lié à l'appareil personnel de l'étudiant. » |
| 1f | Bandeau sous le hero | « Anti-fraude par conception » | « Pointage lié à l'appareil » |
| 1g | Carte « Anti-fraude » | « Détection automatique des doubles pointages, appareils non autorisés et anomalies. » | « Chaque pointage est lié à l'appareil personnel de l'étudiant, avec un code valable quelques secondes, vérifiable en temps réel par le professeur. » |
| 1h | FAQ « Un étudiant peut-il pointer pour un autre ? » | « **Non.** Le scan du QR dynamique doit être fait sur l'appareil habituel de l'étudiant, suivi d'une confirmation biométrique (empreinte, Face ID). Toute tentative de scan depuis un appareil non autorisé est bloquée. » | « Chaque pointage est lié à l'appareil personnel de l'étudiant, avec un code valable quelques secondes, vérifiable en temps réel par le professeur, qui peut invalider un pointage douteux. » *(et seulement après le correctif 0.3)* |
| 1i | Mockup du hero (badge) | « Biométrie active · **Anti-fraude ON** » | « Biométrie active · Appareil vérifié » |
| 2 | *Toutes* les mentions de géolocalisation | 1 occurrence (1b) | Supprimée par 1b |
| 3 | Page `/login` | Bouton « Continuer avec Microsoft » | Masquer le bouton tant que `azure_tenant_id` est vide dans la configuration, ou afficher « Microsoft · bientôt disponible », grisé et non cliquable. Le back-end reste intact. |
| 3b | Formule Business | « SSO Microsoft / Google » | « SSO Microsoft / Google *(bientôt)* » |
| 4 | Carte QR | voir 1c | — |
| 5 | Super-admin (données mock) | Tenants « ESMT, Université Cheikh Anta Diop, École Polytechnique, École Polytechnique de Thiès, Lycée Blaise Diagne », MRR, licences, « Onboarding Lycée Blaise Diagne (essai 14 jours) », « 120 étudiants importés (CSV) »… | Soit **supprimer les noms réels** (remplacer par « École A », « Université B »…), soit afficher un bandeau fixe **« Données de démonstration »** sur tout l'espace super-admin. Ces données viennent d'un fichier mock du front (`presenz-mock-scenario`). |

### « Fonctionne hors-ligne » (gardé, comme tu l'as demandé) — une nuance à connaître

Tu as raison sur un point : en déploiement intranet (on-premise), l'application tourne **sans accès à Internet**, et c'est défendable.

Mais la FAQ dit autre chose : « Les scans continuent d'être enregistrés **localement dans le navigateur**. Dès que la connexion revient, tout est synchronisé automatiquement. » **Ce mécanisme n'existe pas dans le code** : pas de stockage local des scans, pas de synchronisation, pas de service worker. Si quelqu'un coupe le Wi-Fi pendant une démo, le pointage échoue.

Proposition, qui garde ton argument sans rien inventer :
- Badges « Fonctionne hors-ligne » et « Mode hors-ligne intégré » → **« Déployable en intranet, sans Internet »**.
- FAQ « Que se passe-t-il si Internet coupe ? » → « En version intranet (On-Premise), Présenz fonctionne sur le réseau local de l'établissement : une coupure Internet n'interrompt pas le pointage. »

---

## 2. Corrections recommandées en plus (non demandées)

| Où | Texte actuel | Pourquoi / proposition |
|---|---|---|
| Carte « Sécurité de niveau entreprise » | « Chiffrement AES-256 au repos, TLS 1.3 en transit, audit logs complets. » | Invérifiable de l'extérieur. Garder si l'équipe technique le confirme, sinon : « Connexions chiffrées (HTTPS), journal des événements. » |
| Bandeau | « Pointage en < 5 secondes » | À chronométrer après le correctif 0.1, sinon « Pointage en quelques secondes ». |
| Carte « Rapide & fluide » | « Pointage d'une classe entière en moins de 30 secondes » | Même remarque. |
| Carte « Reporting avancé » / bandeau | « Exports **Excel** & PDF » | L'export est un CSV (qui s'ouvre dans Excel) : « Exports CSV (Excel) & PDF ». |
| Carte « Notifications temps réel » | « Alertes instantanées en cas d'absence répétée… » | Ce qui existe : notifications email (désactivées dans la config) et relance manuelle. → « Relances email aux étudiants absents. » |
| Carte « Emplois du temps intégrés » | « Import CSV / Excel » | Ce qui existe dans l'UI : **import PDF (OCR)** pour l'emploi du temps, CSV pour les étudiants. |
| FAQ « Mes données sont-elles hébergées en Afrique ? » | Choix de zones Europe / Afrique | À confirmer. Aujourd'hui, où est hébergé `piitech.dev` ? |
| FAQ « Combien de temps prend le déploiement ? » | 24–48 h / 1–2 semaines | Engagement commercial : à confirmer. |
| CTA final | « Rejoignez les établissements qui ont choisi… » | Pas de client déclaré : « Testez Présenz dans une de vos classes. » |

---

## 3. Bugs secondaires et nettoyage des données (Partie D.2)

**Données de test à nettoyer ou à renommer avant la démo :**
- « Ben sultan » (`ESMT-2026`, adresse gmail) et « maodo kante » (`MAO2026`, adresse gmail) apparaissent dans la classe LTI3-ASR, sur toutes les listes projetées.
- Libellés de dates codés en dur : « Semaine 15 (12–16 Avr) », « Semaine 14 », « Semaine 13 » (professeur › Mes cours), et « Avril 2026 / Mars 2026 / Février 2026 » (étudiant › Historique).
- Statistiques incohérentes entre écrans pour les mêmes données :
  - taux global 83 à 86 % (scolarité) contre 49 à 54 % (admin) ;
  - LTI3-ASR 30 % sur la page contre 44 % dans l'API ;
  - projection « 5 pointés **sur 30** » alors que la classe a 12 étudiants.
- Étudiant : après un pointage validé, le dashboard affiche toujours « 0 % · 0 présences sur 0 cours », et l'historique affiche 0.
- « Suivi en direct » (menu professeur) ouvre par défaut un **ancien cours terminé** (Algorithmique du 13/08), pas le cours en cours. Il faut passer par Projeter QR › Suivi, ou par l'URL `/professeur/suivi/{id}`.
- Scolarité › Ajouter un cours : la liste « Professeur » est vide (appel `403`). Seul l'admin peut assigner un professeur.
- Les cours de démo datent du 12 au 14/08. **Le jour J, il faut créer un cours sur le créneau de la présentation** : l'admin peut le faire, mais pas la scolarité (voir le point précédent).

---

## 4. Incident de test

Pendant mes tests de la Partie D (point 4, « override scolarité »), j'ai cliqué sur « Sauvegarder les modifications » sur le cours de test. À cause du bug 0.5, deux pointages **d'anciens cours** ont été modifiés :

| Pointage | Nouveau statut | Trace en base |
|---|---|---|
| `attendance.id = 6` | `PRESENT` | `override_by = 2` (Fatou Aidara), `override_at = 2026-09-28 22:02:24` |
| `attendance.id = 12` | `ABSENT` | idem |

Effet visible :
- **Mariama Fall (LTI3-GL), cours « Bases de Données » du 12/08** apparaît maintenant **Absente**, et « Absences non justifiées » passe de 3 à 4. Le pointage n°12 était donc très probablement le sien.
- Le pointage n°6 semble ne pas avoir changé de valeur.

Je ne connais pas l'ancien statut exact. **Je ne l'ai donc pas « restauré » à l'aveugle.** Pour revenir en arrière, on peut restaurer ces 2 lignes depuis une sauvegarde, ou les remettre à la main en base : ce sont les seules lignes avec `override_at = '2026-09-28 22:02:24'`.

**Tout le reste a été remis en état :**
- cours de test supprimé, avec ses 5 pointages ;
- 5 appareils virtuels révoqués ; les comptes 0843, 0844, 0845, 0847 et 0850 sont revenus à l'état « à enrôler » (vérifié) ;
- **configuration non modifiée** : la rotation est toujours à 60 s (voir SCRIPT, section « Réglage pré-démo »).
