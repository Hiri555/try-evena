#!/usr/bin/env python3
"""Build the French .srt sidecar.
Timings are derived by distributing each take's measured duration across its
lines in proportion to how long they take to SAY (spoken form, pauses weighted)."""
import os

STARTS = [1.400, 22.442, 87.067, 134.358, 186.400, 237.108,
          292.067, 365.483, 438.358, 491.317, 558.275, 624.900]
DURS   = [18.80, 62.24, 44.88, 49.68, 48.32, 52.56,
          71.04, 70.48, 50.56, 64.56, 64.24, 70.64]

SC = [
 [("Dans l'épisode un, on a construit la route.", None),
  ("Une route à part, qui ne porte pas la parole.", None),
  ("Aujourd'hui on monte dessus,\net on ouvre ce qui roule.", None),
  ("Un paquet de bits, 300 octets au maximum,\nqui part d'un commutateur et doit arriver intact.",
   "Un paquet de bits, trois cents octets au maximum, qui part d'un commutateur et doit arriver intact."),
  ("Intact, c'est le mot.", None),
  ("Parce qu'une erreur sur un ordre de signalisation,\nça coupe deux abonnés.", None)],

 [("Niveau 1. La couche physique.", "Niveau un. La couche physique."),
  ("Elle s'appelle la liaison sémaphore de données,\nla LSD.", None),
  ("Un seul travail : transporter des bits dans les\ndeux sens, à 64 kbit/s.",
   "Un seul travail : transporter des bits dans les deux sens, à soixante-quatre kilobits."),
  ("Mais attention, elle ne tombe pas du ciel.\nLe prof insiste là-dessus :", None),
  ("« La liaison sémaphore de données, avant de devenir\nune liaison sémaphore de données,", None),
  ("c'est d'abord une liaison de données.", None),
  ("C'est quand on décide d'envoyer la signalisation\ndessus qu'on l'appelle sémaphore. »", None),
  ("Trois étapes, donc. Un intervalle de temps banal.", None),
  ("Qu'on fige en mode données,\nde façon semi-permanente —", None),
  ("c'est une voiture qu'on loue au mois,\npas un taxi qu'on prend et qu'on rend.", None),
  ("Et qui devient sémaphore le jour où on branche\nun terminal sémaphore à chaque bout.", None),
  ("Formule à graver : canal sémaphore\n= terminal + LSD + terminal.", None),
  ("Dernière question : où vit ce terminal ?\nPas chez l'abonné.", None),
  ("« Tout ce qui est dans l'unité de raccordement des\nabonnés, ce sont des ressources individuelles.", None),
  ("Mais la signalisation sert à tous ceux qui veulent\nappeler. Donc on la met dans l'auxiliaire. »", None),
  ("Une ressource partagée.", None)],

 [("Le niveau 2 a cinq fonctions : délimiter, détecter\nl'erreur, la corriger, superviser, aligner.",
   "Le niveau deux a cinq fonctions : délimiter, détecter l'erreur, la corriger, superviser, aligner."),
  ("Tout ça tient dans une seule chose : la trame.", None),
  ("Regarde-la bien. Au milieu, la partie variable :\nl'information, 272 octets au maximum.",
   "Regarde-la bien. Au milieu, la partie variable : l'information, deux cent soixante-douze octets au maximum."),
  ("Autour, deux blocs fixes de trois octets.", None),
  ("Un colis : le cadeau est au centre, le carton et le\nruban garantissent qu'il arrive entier.", None),
  ("Et maintenant, le piège.\nCelui qui coûte des points à tout le monde.", None),
  ("« Détection d'erreur, c'est à la fin de la trame.", None),
  ("Correction d'erreur, c'est au début de la trame. »", None),
  ("Donc : fanion, correction, INL,\ninformation, contrôle de trame, fanion.", None),
  ("Ne les inverse pas.", None)],

 [("Juste après les champs de correction, il y a un\noctet : l'indicateur de longueur. L'INL.", None),
  ("Il dit la taille de la partie variable.", None),
  ("Mais il fait bien plus que ça :\nc'est lui qui donne le type de la trame.", None),
  ("INL = 0 : trame sémaphore de remplissage.\nElle ne porte rien.",
   "INL égale zéro : trame sémaphore de remplissage. Elle ne porte rien."),
  ("Son seul rôle : garder le canal éveillé\nquand il n'y a rien à dire.", None),
  ("INL = 1 ou 2 : trame sémaphore d'état.",
   "INL égale un ou deux : trame sémaphore d'état."),
  ("Elle annonce l'état du canal, et elle ne sort\njamais du niveau 2 — elle reste entre les terminaux.", None),
  ("INL > 2 : trame sémaphore de message.",
   "INL supérieur à deux : trame sémaphore de message."),
  ("La seule qui porte de l'information utile,\nla seule qui remonte jusqu'à l'application.", None),
  ("Un détail qui surprend : sur les 8 bits de l'INL,\non n'en lit que 6.",
   "Un détail qui surprend : sur les huit bits de l'INL, on n'en lit que six."),
  ("Les deux de poids fort ne servent à rien.", None),
  ("Et quand on demande pourquoi, le prof répond :\n« Quand ils faisaient la norme, je n'étais pas là. »", None),
  ("On ne les utilise pas, point.", None)],

 [("Comment le récepteur sait-il\noù commence une trame ?", None),
  ("Par un motif unique de 8 bits : le fanion.",
   "Par un motif unique de huit bits : le fanion."),
  ("Zéro, un, un, un, un, un, un, zéro.\nEn hexadécimal, 7E.",
   "Zéro, un, un, un, un, un, un, zéro. En hexadécimal, sept E."),
  ("Six 1 encadrés par deux 0.", "Six uns encadrés par deux zéros."),
  ("Un drapeau planté en bord de terrain.", None),
  ("Mais il y a un problème évident.", None),
  ("Si tes données contiennent cette suite-là, le récepteur\ncroit voir une fin de trame au mauvais endroit.", None),
  ("La parade s'appelle le bourrage de zéros.", None),
  ("À l'émission, un compteur suit les 1 consécutifs.\nDès qu'il en compte cinq, on force un 0.",
   "À l'émission, un compteur suit les uns consécutifs. Dès qu'il en compte cinq, on force un zéro."),
  ("À la réception, on enlève ce zéro.", None),
  ("Résultat : plus aucune donnée\nne peut ressembler à un fanion.", None),
  ("Et si le récepteur voit quand même six 1\nà l'intérieur ? Configuration interdite.",
   "Et si le récepteur voit quand même six uns à l'intérieur ? Configuration interdite."),
  ("Il déclare une perte d'alignement, il jette tout\ndepuis le dernier fanion, et il repart proprement.", None)],

 [("16 bits, juste avant le fanion de fin :\nle contrôle de trame, le CRT.",
   "Seize bits, juste avant le fanion de fin : le contrôle de trame, le CRT."),
  ("Son principe, c'est une division de polynômes.", None),
  ("L'idée tient en une image. Les deux bouts se mettent\nd'accord sur un diviseur commun.", None),
  ("L'émetteur divise ses données par ce diviseur,\net colle le reste en fin de trame.", None),
  ("Le récepteur refait exactement le même calcul\nsur ce qu'il a reçu.", None),
  ("Même reste, la trame est intacte.\nReste différent, elle est rejetée.", None),
  ("« Le diviseur commun, c'est comme les nombres\naléatoires du réseau GSM.", None),
  ("C'est généré, mais une fois qu'on veut l'utiliser,\non le partage avec l'autre avant la session.", None),
  ("Les deux font le calcul, puis comparent la réponse. »", None),
  ("Un mot sur le diviseur. Au tableau, il a écrit\nun exemple simple, pour la pédagogie.", None),
  ("Dans la vraie norme, le polynôme générateur,\nc'est X¹⁶ + X¹² + X⁵ + 1.",
   "Dans la vraie norme, le polynôme générateur, c'est X puissance seize, plus X puissance douze, plus X puissance cinq, plus un."),
  ("Garde l'exemple pour comprendre,\nconnais celui-là pour l'examen.", None)],

 [("Voilà le morceau qui bloque tout le monde.\nOn va le casser en pièces.", None),
  ("Corriger une erreur, en SS7, ça veut dire une\nseule chose : faire retransmettre la trame.", None),
  ("Chaque trame porte quatre champs,\n16 bits en tout.", "Chaque trame porte quatre champs, seize bits en tout."),
  ("NSA, numéro de séquence avant, 7 bits :\nle numéro de la trame que je t'envoie.",
   "NSA, numéro de séquence avant, sept bits : le numéro de la trame que je t'envoie."),
  ("NSR, numéro de séquence arrière, 7 bits :\nla dernière trame que j'ai bien reçue de toi.",
   "NSR, numéro de séquence arrière, sept bits : la dernière trame que j'ai bien reçue de toi."),
  ("C'est un accusé de réception.", None),
  ("BIA, bit indicateur avant, un seul bit.\nBIR, bit indicateur arrière, un seul bit.", None),
  ("Et maintenant l'image qui débloque tout.", None),
  ("Tu envoies des colis numérotés —\nle numéro, c'est le NSA.", None),
  ("Sur chaque colis, tu poses un tampon de couleur :\nc'est le BIA.", None),
  ("Le receveur te renvoie un reçu avec le numéro du\ndernier colis reçu en bon état, le NSR,", None),
  ("et un tampon de couleur en écho, le BIR.", None),
  ("La règle d'or tient en deux lignes.", None),
  ("Même couleur que celle que tu avais posée,\nBIR = BIA : tout va bien, continue.",
   "Même couleur que celle que tu avais posée, BIR égale BIA : tout va bien, continue."),
  ("Couleur différente, BIR ≠ BIA :\nproblème, reprends à NSR + 1.",
   "Couleur différente, BIR différent de BIA : problème, reprends à NSR plus un."),
  ("Et quand tu retransmets, tu bascules ta propre\ncouleur pour vous resynchroniser.", None),
  ("C'est tout le secret : le bit qui bascule,\nc'est le signal d'erreur.", None)],

 [("Deux méthodes, et c'est le délai qui décide.", None),
  ("Méthode de base : support terrestre,\naller-retour sous 30 millisecondes.",
   "Méthode de base : support terrestre, aller-retour sous trente millisecondes."),
  ("On accuse chaque trame, une par une.", None),
  ("Méthode cyclique préventive : support à long délai,\nsatellite, jusqu'à 500 millisecondes.",
   "Méthode cyclique préventive : support à long délai, satellite, jusqu'à cinq cents millisecondes."),
  ("Impossible d'attendre un accusé à chaque trame.", None),
  ("On définit une fenêtre, on envoie en rafale,\net on retransmet dans les creux.", None),
  ("Maintenant le TD du prof. Vingt trames.", None),
  ("Premier cas, aucune erreur. En méthode de base :\n20 trames, 20 accusés, 0 retransmission.",
   "Premier cas, aucune erreur. En méthode de base : vingt trames, vingt accusés, zéro retransmission."),
  ("En cyclique, fenêtre de 20 : 20 trames,\nun seul accusé à la fin, 0 retransmission.",
   "En cyclique, fenêtre de vingt : vingt trames, un seul accusé à la fin, zéro retransmission."),
  ("Deuxième cas, erreur détectée à la dixième.", None),
  ("En base : les neuf premières sont acquittées,\nla dixième est erronée.", None),
  ("B renvoie NSR = 9 avec le BIR basculé,\nA reprend à 10. Une seule trame retransmise.",
   "B renvoie NSR égale neuf avec le BIR basculé, A reprend à dix. Une seule trame retransmise."),
  ("En cyclique, c'est tout autre chose.", None),
  ("A a déjà envoyé les vingt avant le moindre accusé.", None),
  ("B détecte l'erreur sur la 10, et les suivantes\narrivent hors séquence.",
   "B détecte l'erreur sur la dix, et les suivantes arrivent hors séquence."),
  ("Or SS7 ne sait pas garder le hors séquence.\nDonc il les rejette toutes.", None),
  ("Résultat : onze trames retransmises,\nde la 10 à la 20.",
   "Résultat : onze trames retransmises, de la dix à la vingt."),
  ("Les deux méthodes sont du Go-Back-N.", None),
  ("Ce qui change, c'est le nombre de trames\nen vol au moment de l'erreur.", None)],

 [("Avant de confier la signalisation à un canal,\non mesure sa fiabilité.", None),
  ("Le seuil fatidique : quatre pour mille.\nAu-delà, le canal est déclaré inapte.", None),
  ("Mais comment compter les erreurs ?", None),
  ("« Si j'ai un compteur qui ne fait qu'incrémenter,", None),
  ("même si la deuxième erreur est dans trois jours\net la troisième dans trois mois, j'aurai trois erreurs.", None),
  ("Donc tôt ou tard il condamne le canal. »", None),
  ("D'où le compteur-décompteur. Une erreur, plus un.\n256 trames correctes, moins un.",
   "D'où le compteur-décompteur. Une erreur, plus un. Deux cent cinquante-six trames correctes, moins un."),
  ("Un panier qui se vide tout seul.", None),
  ("À la mise en service, les deux terminaux doivent\nse mettre en phase : c'est l'alignement initial.", None),
  ("Ils échangent des trames d'état, et traversent\nune séquence : hors service, non aligné, aligné,", None),
  ("période probatoire, aligné prêt, en service.\nSix états, codés sur 3 bits.",
   "période probatoire, aligné prêt, en service. Six états, codés sur trois bits."),
  ("Une fois en service, s'il n'y a rien à dire, ils\ns'envoient des trames de remplissage.", None)],

 [("On monte d'un étage.\nLe prof ouvre la séance comme ça :", None),
  ("« Le niveau 3 assume deux groupes de fonctions :",
   "« Le niveau trois assume deux groupes de fonctions :"),
  ("l'orientation des messages,\net la gestion du réseau sémaphore. »", None),
  ("L'orientation, c'est trois gestes,\nà trois moments différents.", None),
  ("L'acheminement, à l'émission :\nje choisis par quel canal partir.", None),
  ("La discrimination, à la réception.", None),
  ("« Quand je reçois un message, la première action,\nc'est la discrimination.", None),
  ("Je compare le numéro du champ CPD\navec mon numéro de point sémaphore.", None),
  ("Si ça correspond, c'est mon message, distribution.", None),
  ("Si ça ne correspond pas : si je suis un PS, poubelle ;\nsi je suis un PTS, acheminement. »", None),
  ("Et la distribution, c'est le troisième geste :\nje lis l'INS et je livre au bon sous-système.", None),
  ("Tout ça se lit dans la trame. Après l'INL viennent\nl'octet de service,", None),
  ("puis le code du point de destination, 14 bits,\nle code du point d'origine, 14 bits,",
   "puis le code du point de destination, quatorze bits, le code du point d'origine, quatorze bits,"),
  ("et la sélection du canal sémaphore, 4 bits.",
   "et la sélection du canal sémaphore, quatre bits."),
  ("Ces trois-là ensemble, c'est l'étiquette\nd'acheminement : 32 bits.",
   "Ces trois-là ensemble, c'est l'étiquette d'acheminement : trente-deux bits."),
  ("Ajoute le code d'identification du circuit,\net tu as l'étiquette téléphonique.", None)],

 [("Dernier étage : le niveau 4,\nle sous-système utilisateur.",
   "Dernier étage : le niveau quatre, le sous-système utilisateur."),
  ("C'est là, et seulement là, qu'apparaît\nle vrai message de signalisation.", None),
  ("Tout ce qu'on a vu avant servait\nà le transporter intact.", None),
  ("Le réflexe à avoir : avant de décoder,\non lit l'indicateur de service,", None),
  ("parce que c'est lui qui dit quelle norme ouvrir.", None),
  ("Et le tout premier message d'une communication\ns'appelle le message initial d'adresse, le MIA.", None),
  ("« C'est le premier message qu'on envoie vers le\ncommutateur distant,", None),
  ("qui comporte les premiers chiffres composés.", None),
  ("Si vous êtes rapide, il transporte tous les chiffres.", None),
  ("Sinon, il y a des messages subséquents d'adresse\nqui complètent. »", None),
  ("Alors déroulons un appel en entier.", None),
  ("Le central amont envoie le MIA.", None),
  ("Si des chiffres manquent, il complète avec\nun message subséquent d'adresse.", None),
  ("Le central aval répond adresse complète\nquand il a tout reçu.", None),
  ("L'abonné décroche : signal de réponse avec taxation.\nOn parle.", None),
  ("Puis le demandeur raccroche : signal de fin,\net celui-là est prioritaire sur tous les autres.", None),
  ("Enfin, le central aval renvoie libération de garde,\net le circuit sortant est libéré.", None),
  ("MIA, subséquent, adresse complète, réponse, fin,\nlibération de garde.", None),
  ("Six messages, et l'appel est bouclé.", None)],

 [("On ferme. Niveau 1 : la LSD, 64 kbit/s,\nsemi-permanente.",
   "On ferme. Niveau un : la LSD, soixante-quatre kilobits, semi-permanente."),
  ("Canal sémaphore = terminal + LSD + terminal —", None),
  ("et le terminal vit dans les auxiliaires,\nparce que c'est une ressource partagée.", None),
  ("La trame : fanion, correction, INL,\ninformation, détection, fanion.", None),
  ("Détection à la fin, correction au début.", None),
  ("L'INL donne le type : 0 remplissage,\n1 ou 2 état, plus de 2 message.",
   "L'INL donne le type : zéro remplissage, un ou deux état, plus de deux message."),
  ("Le fanion vaut 7E, et le bourrage insère\nun 0 après cinq 1.",
   "Le fanion vaut sept E, et le bourrage insère un zéro après cinq uns."),
  ("Le CRT, c'est une division par un diviseur commun.", None),
  ("Correction : NSA mon numéro, NSR ton accusé,\nBIA et BIR les deux tampons.", None),
  ("BIR = BIA, tout va bien ;\nBIR ≠ BIA, on reprend à NSR + 1.",
   "BIR égale BIA, tout va bien ; BIR différent de BIA, on reprend à NSR plus un."),
  ("Base sous 30 millisecondes, cyclique au-delà —",
   "Base sous trente millisecondes, cyclique au-delà —"),
  ("et sur une erreur à la dixième,\nune retransmission en base, onze en cyclique.", None),
  ("Seuil d'erreur : quatre pour mille, compteur\n+1 −1 tous les 256.",
   "Seuil d'erreur : quatre pour mille, compteur plus un moins un tous les deux cent cinquante-six."),
  ("Niveau 3 : discrimination, distribution, acheminement,\net l'étiquette d'acheminement sur 32 bits.",
   "Niveau trois : discrimination, distribution, acheminement, et l'étiquette d'acheminement sur trente-deux bits."),
  ("Niveau 4 : le MIA ouvre l'appel,\nla libération de garde le ferme.",
   "Niveau quatre : le MIA ouvre l'appel, la libération de garde le ferme."),
  ("Voilà. Tu as la chaîne complète,\ndu bit à la conversation.", None),
  ("Révise bien.", None)],
]

PAUSE = 7.0     # an ellipsis is worth this many characters of time


def weight(s):
    return len(s.replace('\n', ' ')) + s.count('…') * PAUSE + s.count('—') * 3


def ts(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace('.', ',')


out, n = [], 0
for i, lines in enumerate(SC):
    t0, dur = STARTS[i], DURS[i]
    ws = [weight(sp or cap) for cap, sp in lines]
    tot = sum(ws)
    cur = t0
    for (cap, _), w in zip(lines, ws):
        span = dur * w / tot
        a, b = cur, cur + span
        cur = b
        n += 1
        out.append(f"{n}\n{ts(a)} --> {ts(max(b - 0.06, a + 0.5))}\n{cap}\n")

p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'out', 'SS7_Ep2_FR.srt')
os.makedirs(os.path.dirname(p), exist_ok=True)
open(p, 'w', encoding='utf-8').write('\n'.join(out))
print(f"{n} sous-titres ->", os.path.realpath(p))
