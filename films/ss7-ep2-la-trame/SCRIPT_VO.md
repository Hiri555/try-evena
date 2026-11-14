# SS7 — ÉPISODE 2 · « LA TRAME » — texte de la voix off

Voix : Florian (ElevenLabs v4). Les mots entre guillemets « » sont
ceux du prof, repris tels quels du dossier technique.

---

## 00 · L'ACCROCHE · ON MONTE SUR LA ROUTE
*0:01 → 0:20*

Dans l'épisode un, on a construit la route. Une route à part, qui ne porte pas la parole. Aujourd'hui on monte dessus,
et on ouvre ce qui roule. Un paquet de bits, 300 octets au maximum,
qui part d'un commutateur et doit arriver intact. Intact, c'est le mot. Parce qu'une erreur sur un ordre de signalisation,
ça coupe deux abonnés.

## 01 · NIVEAU 1 · LA LIAISON SÉMAPHORE DE DONNÉES
*0:22 → 1:24*

Niveau 1. La couche physique. Elle s'appelle la liaison sémaphore de données,
la LSD. Un seul travail : transporter des bits dans les
deux sens, à 64 kbit/s. Mais attention, elle ne tombe pas du ciel.
Le prof insiste là-dessus : « La liaison sémaphore de données, avant de devenir
une liaison sémaphore de données, c'est d'abord une liaison de données. C'est quand on décide d'envoyer la signalisation
dessus qu'on l'appelle sémaphore. » Trois étapes, donc. Un intervalle de temps banal. Qu'on fige en mode données,
de façon semi-permanente — c'est une voiture qu'on loue au mois,
pas un taxi qu'on prend et qu'on rend. Et qui devient sémaphore le jour où on branche
un terminal sémaphore à chaque bout. Formule à graver : canal sémaphore
= terminal + LSD + terminal. Dernière question : où vit ce terminal ?
Pas chez l'abonné. « Tout ce qui est dans l'unité de raccordement des
abonnés, ce sont des ressources individuelles. Mais la signalisation sert à tous ceux qui veulent
appeler. Donc on la met dans l'auxiliaire. » Une ressource partagée.

## 02 · NIVEAU 2 · LA TRAME, ET LE PIÈGE
*1:27 → 2:11*

Le niveau 2 a cinq fonctions : délimiter, détecter
l'erreur, la corriger, superviser, aligner. Tout ça tient dans une seule chose : la trame. Regarde-la bien. Au milieu, la partie variable :
l'information, 272 octets au maximum. Autour, deux blocs fixes de trois octets. Un colis : le cadeau est au centre, le carton et le
ruban garantissent qu'il arrive entier. Et maintenant, le piège.
Celui qui coûte des points à tout le monde. « Détection d'erreur, c'est à la fin de la trame. Correction d'erreur, c'est au début de la trame. » Donc : fanion, correction, INL,
information, contrôle de trame, fanion. Ne les inverse pas.

## 03 · L'INL · UN OCTET QUI DONNE LE TYPE
*2:14 → 3:04*

Juste après les champs de correction, il y a un
octet : l'indicateur de longueur. L'INL. Il dit la taille de la partie variable. Mais il fait bien plus que ça :
c'est lui qui donne le type de la trame. INL = 0 : trame sémaphore de remplissage.
Elle ne porte rien. Son seul rôle : garder le canal éveillé
quand il n'y a rien à dire. INL = 1 ou 2 : trame sémaphore d'état. Elle annonce l'état du canal, et elle ne sort
jamais du niveau 2 — elle reste entre les terminaux. INL > 2 : trame sémaphore de message. La seule qui porte de l'information utile,
la seule qui remonte jusqu'à l'application. Un détail qui surprend : sur les 8 bits de l'INL,
on n'en lit que 6. Les deux de poids fort ne servent à rien. Et quand on demande pourquoi, le prof répond :
« Quand ils faisaient la norme, je n'étais pas là. » On ne les utilise pas, point.

## 04 · LE FANION ET LE BOURRAGE DE ZÉROS
*3:06 → 3:54*

Comment le récepteur sait-il
où commence une trame ? Par un motif unique de 8 bits : le fanion. Zéro, un, un, un, un, un, un, zéro.
En hexadécimal, 7E. Six 1 encadrés par deux 0. Un drapeau planté en bord de terrain. Mais il y a un problème évident. Si tes données contiennent cette suite-là, le récepteur
croit voir une fin de trame au mauvais endroit. La parade s'appelle le bourrage de zéros. À l'émission, un compteur suit les 1 consécutifs.
Dès qu'il en compte cinq, on force un 0. À la réception, on enlève ce zéro. Résultat : plus aucune donnée
ne peut ressembler à un fanion. Et si le récepteur voit quand même six 1
à l'intérieur ? Configuration interdite. Il déclare une perte d'alignement, il jette tout
depuis le dernier fanion, et il repart proprement.

## 05 · DÉTECTION · LE CONTRÔLE DE TRAME
*3:57 → 4:49*

16 bits, juste avant le fanion de fin :
le contrôle de trame, le CRT. Son principe, c'est une division de polynômes. L'idée tient en une image. Les deux bouts se mettent
d'accord sur un diviseur commun. L'émetteur divise ses données par ce diviseur,
et colle le reste en fin de trame. Le récepteur refait exactement le même calcul
sur ce qu'il a reçu. Même reste, la trame est intacte.
Reste différent, elle est rejetée. « Le diviseur commun, c'est comme les nombres
aléatoires du réseau GSM. C'est généré, mais une fois qu'on veut l'utiliser,
on le partage avec l'autre avant la session. Les deux font le calcul, puis comparent la réponse. » Un mot sur le diviseur. Au tableau, il a écrit
un exemple simple, pour la pédagogie. Dans la vraie norme, le polynôme générateur,
c'est X¹⁶ + X¹² + X⁵ + 1. Garde l'exemple pour comprendre,
connais celui-là pour l'examen.

## 06 · CORRECTION · NSA, NSR, BIA, BIR
*4:52 → 6:03*

Voilà le morceau qui bloque tout le monde.
On va le casser en pièces. Corriger une erreur, en SS7, ça veut dire une
seule chose : faire retransmettre la trame. Chaque trame porte quatre champs,
16 bits en tout. NSA, numéro de séquence avant, 7 bits :
le numéro de la trame que je t'envoie. NSR, numéro de séquence arrière, 7 bits :
la dernière trame que j'ai bien reçue de toi. C'est un accusé de réception. BIA, bit indicateur avant, un seul bit.
BIR, bit indicateur arrière, un seul bit. Et maintenant l'image qui débloque tout. Tu envoies des colis numérotés —
le numéro, c'est le NSA. Sur chaque colis, tu poses un tampon de couleur :
c'est le BIA. Le receveur te renvoie un reçu avec le numéro du
dernier colis reçu en bon état, le NSR, et un tampon de couleur en écho, le BIR. La règle d'or tient en deux lignes. Même couleur que celle que tu avais posée,
BIR = BIA : tout va bien, continue. Couleur différente, BIR ≠ BIA :
problème, reprends à NSR + 1. Et quand tu retransmets, tu bascules ta propre
couleur pour vous resynchroniser. C'est tout le secret : le bit qui bascule,
c'est le signal d'erreur.

## 07 · BASE OU CYCLIQUE · LE TD
*6:05 → 7:15*

Deux méthodes, et c'est le délai qui décide. Méthode de base : support terrestre,
aller-retour sous 30 millisecondes. On accuse chaque trame, une par une. Méthode cyclique préventive : support à long délai,
satellite, jusqu'à 500 millisecondes. Impossible d'attendre un accusé à chaque trame. On définit une fenêtre, on envoie en rafale,
et on retransmet dans les creux. Maintenant le TD du prof. Vingt trames. Premier cas, aucune erreur. En méthode de base :
20 trames, 20 accusés, 0 retransmission. En cyclique, fenêtre de 20 : 20 trames,
un seul accusé à la fin, 0 retransmission. Deuxième cas, erreur détectée à la dixième. En base : les neuf premières sont acquittées,
la dixième est erronée. B renvoie NSR = 9 avec le BIR basculé,
A reprend à 10. Une seule trame retransmise. En cyclique, c'est tout autre chose. A a déjà envoyé les vingt avant le moindre accusé. B détecte l'erreur sur la 10, et les suivantes
arrivent hors séquence. Or SS7 ne sait pas garder le hors séquence.
Donc il les rejette toutes. Résultat : onze trames retransmises,
de la 10 à la 20. Les deux méthodes sont du Go-Back-N. Ce qui change, c'est le nombre de trames
en vol au moment de l'erreur.

## 08 · SUPERVISION ET ALIGNEMENT
*7:18 → 8:08*

Avant de confier la signalisation à un canal,
on mesure sa fiabilité. Le seuil fatidique : quatre pour mille.
Au-delà, le canal est déclaré inapte. Mais comment compter les erreurs ? « Si j'ai un compteur qui ne fait qu'incrémenter, même si la deuxième erreur est dans trois jours
et la troisième dans trois mois, j'aurai trois erreurs. Donc tôt ou tard il condamne le canal. » D'où le compteur-décompteur. Une erreur, plus un.
256 trames correctes, moins un. Un panier qui se vide tout seul. À la mise en service, les deux terminaux doivent
se mettre en phase : c'est l'alignement initial. Ils échangent des trames d'état, et traversent
une séquence : hors service, non aligné, aligné, période probatoire, aligné prêt, en service.
Six états, codés sur 3 bits. Une fois en service, s'il n'y a rien à dire, ils
s'envoient des trames de remplissage.

## 09 · LE NIVEAU 3 · ORIENTER LES MESSAGES
*8:11 → 9:15*

On monte d'un étage.
Le prof ouvre la séance comme ça : « Le niveau 3 assume deux groupes de fonctions : l'orientation des messages,
et la gestion du réseau sémaphore. » L'orientation, c'est trois gestes,
à trois moments différents. L'acheminement, à l'émission :
je choisis par quel canal partir. La discrimination, à la réception. « Quand je reçois un message, la première action,
c'est la discrimination. Je compare le numéro du champ CPD
avec mon numéro de point sémaphore. Si ça correspond, c'est mon message, distribution. Si ça ne correspond pas : si je suis un PS, poubelle ;
si je suis un PTS, acheminement. » Et la distribution, c'est le troisième geste :
je lis l'INS et je livre au bon sous-système. Tout ça se lit dans la trame. Après l'INL viennent
l'octet de service, puis le code du point de destination, 14 bits,
le code du point d'origine, 14 bits, et la sélection du canal sémaphore, 4 bits. Ces trois-là ensemble, c'est l'étiquette
d'acheminement : 32 bits. Ajoute le code d'identification du circuit,
et tu as l'étiquette téléphonique.

## 10 · LE NIVEAU 4 · LE MESSAGE, ENFIN
*9:18 → 10:22*

Dernier étage : le niveau 4,
le sous-système utilisateur. C'est là, et seulement là, qu'apparaît
le vrai message de signalisation. Tout ce qu'on a vu avant servait
à le transporter intact. Le réflexe à avoir : avant de décoder,
on lit l'indicateur de service, parce que c'est lui qui dit quelle norme ouvrir. Et le tout premier message d'une communication
s'appelle le message initial d'adresse, le MIA. « C'est le premier message qu'on envoie vers le
commutateur distant, qui comporte les premiers chiffres composés. Si vous êtes rapide, il transporte tous les chiffres. Sinon, il y a des messages subséquents d'adresse
qui complètent. » Alors déroulons un appel en entier. Le central amont envoie le MIA. Si des chiffres manquent, il complète avec
un message subséquent d'adresse. Le central aval répond adresse complète
quand il a tout reçu. L'abonné décroche : signal de réponse avec taxation.
On parle. Puis le demandeur raccroche : signal de fin,
et celui-là est prioritaire sur tous les autres. Enfin, le central aval renvoie libération de garde,
et le circuit sortant est libéré. MIA, subséquent, adresse complète, réponse, fin,
libération de garde. Six messages, et l'appel est bouclé.

## 11 · CE QU'IL FAUT RETENIR
*10:24 → 11:35*

On ferme. Niveau 1 : la LSD, 64 kbit/s,
semi-permanente. Canal sémaphore = terminal + LSD + terminal — et le terminal vit dans les auxiliaires,
parce que c'est une ressource partagée. La trame : fanion, correction, INL,
information, détection, fanion. Détection à la fin, correction au début. L'INL donne le type : 0 remplissage,
1 ou 2 état, plus de 2 message. Le fanion vaut 7E, et le bourrage insère
un 0 après cinq 1. Le CRT, c'est une division par un diviseur commun. Correction : NSA mon numéro, NSR ton accusé,
BIA et BIR les deux tampons. BIR = BIA, tout va bien ;
BIR ≠ BIA, on reprend à NSR + 1. Base sous 30 millisecondes, cyclique au-delà — et sur une erreur à la dixième,
une retransmission en base, onze en cyclique. Seuil d'erreur : quatre pour mille, compteur
+1 −1 tous les 256. Niveau 3 : discrimination, distribution, acheminement,
et l'étiquette d'acheminement sur 32 bits. Niveau 4 : le MIA ouvre l'appel,
la libération de garde le ferme. Voilà. Tu as la chaîne complète,
du bit à la conversation. Révise bien.
