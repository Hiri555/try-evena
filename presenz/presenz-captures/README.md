# Présenz — Inventaire des captures (Phase 2 · Partie A)

Captures faites le **28/09/2026 entre 21:40 et 22:05 (heure de Dakar)** sur `https://presenzzerocontact.shipiix.piitech.dev`.

`presenz.piitech.dev` ne résout pas depuis mon environnement : erreur DNS / 502. **À vérifier de ton côté avant la présentation.**

**Conditions de capture**
- Navigateur Chromium, locale `fr-FR`, fuseau `Africa/Dakar`.
- Desktop en 1440×900 (écrans staff), mobile en 390×844 @2x (écrans étudiant).
- Biométrie : un **authentificateur WebAuthn virtuel** du navigateur remplace l'empreinte ou Face ID. Chrome présente ce type d'appareil comme un « code PIN », d'où le libellé « Valider avec le code PIN ». Sur un vrai téléphone, le bouton affiche « Valider avec Touch ID / l'empreinte / Face ID ».

**Comment les écrans « en direct » ont été obtenus**

Aucun cours n'était programmé le 28/09 : les cours fournis datent du 13/08. Voici ce que j'ai fait, dans l'ordre :

1. J'ai créé depuis l'admin un **cours de test** « Réseaux & Protocoles », de 21:45 à 23:45, avec Pr. Ndiaye, salle A101, classe LTI3-ASR.
2. J'ai fait pointer 5 étudiants : 0843, 0844, 0845, 0847 et 0850.
3. J'ai capturé les écrans pendant que le cours était en cours.
4. **J'ai ensuite tout nettoyé** : le cours de test a été supprimé avec ses pointages, et les 5 appareils virtuels ont été révoqués dans Admin › Devices.

⚠️ **Voir `../CORRECTIONS.md` § « Incident de test »** : la sauvegarde de la liste d'appel scolarité a modifié 2 pointages d'anciens cours.

## landing/

| Fichier | Contenu |
|---|---|
| `01-landing-desktop-full.png` | Landing complète en desktop : hero, fonctionnalités, 4 étapes, rôles, formules, FAQ |
| `02-landing-desktop-hero.png` | Hero en desktop. On y voit encore « géolocalisation » et « Fonctionne hors-ligne ». |
| `03-landing-mobile-full.png` | Landing complète en mobile |
| `04-landing-mobile-hero.png` | Hero en mobile |
| `05-login-desktop.png` | Page de connexion en desktop, avec le bouton « Continuer avec Microsoft » |
| `06-login-mobile.png` | Page de connexion en mobile |

## etudiant/

| Fichier | Contenu |
|---|---|
| `00-enrolement-premier-login.png` | Premier login : « Bienvenue Ousmane ! Pour sécuriser ton compte, enregistre ton appareil maintenant. » **Aucun mot de passe n'est demandé** (voir CORRECTIONS § Sécurité). |
| `01-dashboard.png` | Accueil pendant le cours : bloc « En ce moment / Fenêtre ouverte », bouton **Pointer ma présence**, puis « Aujourd'hui : Présent ». Le taux affiché reste à « 0 % / 0 présences sur 0 cours » (bug de calcul). |
| `02-historique.png` | Historique. Onglets « Avril / Mars / Février 2026 » codés en dur, et 0 présent affiché alors que le pointage est fait. |
| `03-emploi-du-temps.png` | Emploi du temps personnel |
| `04-pointage-valider.png` | Écran de pointage : salle, horaire, professeur, compte à rebours de la fenêtre, bouton **Valider** (biométrie) |
| `04b-pointage-sans-token.png` | Même écran ouvert sans passer par le QR : champ « Scannez le QR (ou collez le token) ». **C'est aujourd'hui le seul moyen de pointer depuis le téléphone** (voir CORRECTIONS § Démo). |
| `05-presence-validee.png` | **« Présence validée ! »** avec le nom du cours, la date et l'heure |
| `06-profil.png` | Profil étudiant : photo, informations gérées par la scolarité, compte sécurisé par la biométrie de l'appareil |

*Non capturé : `Diffuser le QR` (étudiant responsable). Il aurait fallu enrôler un compte de plus ; je me suis limité au strict nécessaire.*

## professeur/

| Fichier | Contenu |
|---|---|
| `01-dashboard.png` | Dashboard : cours du jour « En cours », présence du jour, aperçu de la semaine |
| `02-projeter-qr-liste.png` | Projeter QR : choix du cours dont la fenêtre est ouverte, et les 4 étapes « Comment ça marche ? » |
| `03-projection-qr.png` | **QR projeté** : code rotatif en clair (8 caractères), compteurs Présents / Absents / Taux, progression, boutons Plein écran et Suivi |
| `04-projection-plein-ecran.png` | **Mode vidéoprojecteur** : QR, code, « 5 pointés sur 30 · 17 % ». *Le « sur 30 » est faux : la classe compte 12 étudiants.* |
| `05-suivi-direct.png` | **Suivi en direct** : 5 Présents avec l'heure, 7 En attente, compteurs, « Terminer la session », rafraîchissement toutes les 5 s. **La meilleure image du WOW.** |
| `06-invalidation-motif.png` | Fenêtre « Invalider le pointage » : motif « Étudiant absent de la salle » sélectionné |
| `07-apres-invalidation.png` | Liste après la tentative d'invalidation. **L'API a refusé** : « Seul le professeur du cours peut invalider », alors que c'était bien le professeur du cours (voir CORRECTIONS § Bugs). |
| `09-mes-cours.png` | Mes cours : séances et taux. Les filtres « Semaine 15 (12–16 Avr) » sont codés en dur. |
| `10-statistiques.png` | Statistiques par cours, tendance, bouton « Exporter en CSV » |

*Non capturés, faute d'interface :*
- **« Pointage manuel » côté professeur.** Le suivi ne propose aucun bouton pour marquer présent un étudiant « En attente », contrairement à ce que dit la FAQ. Le pointage manuel n'existe que côté scolarité, dans la liste d'appel.
- **« Historique des sessions »** : c'est l'écran `09-mes-cours`.

## scolarite/

| Fichier | Contenu |
|---|---|
| `01-dashboard.png` | Dashboard : étudiants actifs, cours aujourd'hui, taux de présence, absences non justifiées, **cours en cours (5/12 présents)**, absences récentes |
| `02-liste-appel.png` | Liste d'appel dématérialisée du cours en cours. On voit « Pointé 21:51 » (biométrie) et des boutons Présent / Absent pour les autres. |
| `02b-liste-appel-override.png` | Modification manuelle : Ibrahima Sow passé Présent, Seydou Sarr passé Absent (avant sauvegarde) |
| `02c-liste-appel-sauvegardee.png` | Après « Sauvegarder ». **Les changements n'ont pas été appliqués à ce cours** (bug d'identifiant, voir CORRECTIONS). Il n'y a pas de bouton « Excusé ». |
| `03-etudiants.png` | Gestion des étudiants : matricule, classe, **statut device (Enrôlé / Non enrôlé)**, actif ou inactif, import CSV |
| `04-classes.png` | Classes : taux de présence et responsable de classe |
| `05-emploi-du-temps.png` | Emploi du temps de la semaine, historique des imports |
| `06-import-pdf.png` | Fenêtre **Import PDF** (analyse OCR). Aucun fichier n'a été envoyé. |
| `07-cours.png` | Séances de cours : Programmé, En cours, Terminé, Annulé |
| `08-reporting.png` | Reporting : taux par classe, **étudiants les plus absents avec le bouton « Relancer »**, Export CSV / PDF. **Je n'ai pas cliqué sur « Relancer »** : cela enverrait un vrai email à un étudiant. |
| `09-export.csv` | **Fichier réel** produit par « Export CSV » (matricule, nom, classe, cours, date, heure, statut, salle) |
| `09-export.pdf` | **Fichier réel** produit par « Export PDF » (3 pages) |

## admin/

| Fichier | Contenu |
|---|---|
| `01-dashboard.png` | Dashboard admin : utilisateurs, devices actifs, suspects du jour, taux, dernières actions (logins, webauthn.register) |
| `02-utilisateurs-roles.png` | Utilisateurs et rôles |
| `03-devices.png` | **Appareils enregistrés** (WebAuthn / FIDO2), dernier usage, bouton **Révoquer**. Les 5 appareils de test ont été révoqués après la capture. |
| `04-configuration.png` | **Configuration** : fenêtre de pointage 120 min, SSO Azure (vide), domaine `@esmt.sn`, **QR rotatif : durée de validité 60 s**, notifications email désactivées |
| `05-monitoring-logs.png` | **Journal des événements** : connexions, enrôlements webauthn, niveaux |
| `06-reporting.png` | Reporting admin |

*« Gestion des rôles » : il n'y a pas d'écran dédié. Le rôle se choisit par utilisateur (`02`), et le rôle de classe (Responsable, Adjoint) depuis Étudiants.*
