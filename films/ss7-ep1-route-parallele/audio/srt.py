#!/usr/bin/env python3
"""Build the French .srt sidecar.
Timings are derived by distributing each take's measured duration across its
lines in proportion to how long they take to SAY (spoken form, pauses weighted)."""
import os

STARTS = [1.400, 22.650, 77.733, 139.358, 168.733, 217.150, 263.192, 322.858, 368.942, 415.400]
DURS   = [19.07, 52.77, 59.25, 27.09, 46.03, 43.73, 57.16, 43.73, 44.04, 48.27]

SC = [
 [("Tu composes un numéro.", None),
  ("Avant même que ça sonne,\ndes machines se sont déjà parlé.", None),
  ("Elles ont réservé un circuit, vérifié que la ligne\nexiste, préparé la sonnerie.", None),
  ("Et tout ça, ta voix ne l'a jamais emprunté.", None),
  ("Ça voyage ailleurs. Sur une route parallèle.", None),
  ("Cette route, c'est le réseau sémaphore.\nEt aujourd'hui, on va la prendre ensemble.", None)],

 [("Deux gares, reliées par un seul tapis roulant.", None),
  ("Les bagages, c'est la parole. Mais des bagages\ntout seuls, ça ne sert à rien.", None),
  ("Il faut les papiers des chefs de gare.", None),
  ("Prépare-toi. Le bagage 42 va quai 3.\nConfirmé, tu peux fermer.",
   "Prépare-toi. Le bagage quarante-deux va quai trois. Confirmé, tu peux fermer."),
  ("Ces papiers-là, c'est la signalisation.", None),
  ("La définition, retiens-la telle quelle :", None),
  ("l'ensemble des ordres et des informations échangés\npour établir, superviser et rompre une communication.", None),
  ("Avant la parole, pendant, et après.", None),
  ("Et ce n'est pas réservé au téléphone : dès qu'il y a\ncommunication, il y a de la signalisation.", None),
  ("Maintenant, où est-ce qu'elle circule ?", None),
  ("Sur une chaîne téléphonique, il y a trois endroits.", None),
  ("Entre ton poste et ton commutateur.\nÀ l'intérieur du commutateur.", None),
  ("Et entre deux commutateurs.", None),
  ("Un seul des trois est normalisé : le dernier. Pourquoi ?", None),
  ("Parce que l'intérieur d'un Alcatel\nne regarde qu'Alcatel.", None),
  ("Mais entre deux commutateurs, un Alcatel doit\npouvoir parler à un Ericsson.", None),
  ("Là, il faut une langue commune.", None)],

 [("La première méthode s'appelle la voie par voie.", None),
  ("Chaque conversation porte ses propres papiers,\ncollés sur elle.", None),
  ("Dans le commutateur, le prof l'a dessiné au tableau :", None),
  ("« C'est l'URA qui injecte la signalisation,\net c'est lui qui la récupère à la réception.", None),
  ("Mais le message qu'il injecte, c'est les enregistreurs\nde l'unité de commande qui le lui envoient. »", None),
  ("D'où deux familles de signaux.", None),
  ("Les signaux d'enregistreur,\nqui portent les ordres de l'appel.", None),
  ("Et les signaux de ligne, qui surveillent la ligne :\ndécroché, raccroché, occupé.", None),
  ("Et ça part où ? Dans une liaison MIC,\nil y a 32 intervalles de temps.",
   "Et ça part où ? Dans une liaison MIC, il y a trente-deux intervalles de temps."),
  ("L'intervalle 16 est réservé à la signalisation :\n2 voies par trame, 15 trames,",
   "L'intervalle seize est réservé à la signalisation : deux voies par trame, quinze trames,"),
  ("et les 30 voies de parole sont servies. Ça marche.",
   "et les trente voies de parole sont servies. Ça marche."),
  ("Mais il y a un défaut, et il est grave.\nÉcoute bien le prof :", None),
  ("« Tant que les deux étaient embarqués dans le même\ncycle, je n'ai ni signalisation, ni données.", None),
  ("Même si le réseau ne fonctionne pas,\nje ne saurais pas pourquoi. »", None),
  ("Son image, c'est une course de bateaux\nsurveillée par un observateur.", None),
  ("Si l'observateur monte dans un des bateaux,\nle jour où ce bateau coule,", None),
  ("personne ne peut le signaler.", None)],

 [("Alors on renverse tout.\nOn construit une route à part.", None),
  ("Une seule voie, à 64 kilobits, qui porte les messages\nde plusieurs circuits à la fois.",
   "Une seule voie, à soixante-quatre kilobits, qui porte les messages de plusieurs circuits à la fois."),
  ("Chaque message est étiqueté :\nil dit de quel circuit il parle.", None),
  ("On appelle ça la signalisation hors bande.", None),
  ("Et le changement est énorme.", None),
  ("Maintenant, l'observateur est dans l'hélicoptère.", None),
  ("Si la parole tombe,\nla signalisation continue de passer.", None),
  ("Elle peut même annoncer la panne.", None),
  ("C'est ça, la voie commune. C'est ça, SS7.", None)],

 [("Ça ne s'est pas trouvé du premier coup.", None),
  ("Le numéro 5, avant 1970, marchait aux fréquences,\nvoie par voie.",
   "Le numéro cinq, avant soixante-dix, marchait aux fréquences, voie par voie."),
  ("Correct pour la téléphonie, rien d'autre.", None),
  ("Le numéro 6, c'est la première tentative\nde voie commune. Et il échoue.",
   "Le numéro six, c'est la première tentative de voie commune. Et il échoue."),
  ("Pourquoi ? À cause d'un seul chiffre.", None),
  ("Le numéro 6 tourne à 2,4 kilobits.",
   "Le numéro six tourne à deux virgule quatre kilobits."),
  ("Or un intervalle de temps, c'est 8 bits\ntoutes les 125 microsecondes — 64 kilobits.",
   "Or un intervalle de temps, c'est huit bits toutes les cent vingt-cinq microsecondes, soixante-quatre kilobits."),
  ("2,4 là-dedans, ça ne tombe pas juste :",
   "Deux virgule quatre là-dedans, ça ne tombe pas juste :"),
  ("il faudrait re-multiplexer la signalisation\npour la faire rentrer. Trop lourd.", None),
  ("Personne n'en veut.", None),
  ("Le numéro 7, lui, est conçu pour tenir\npile dans un intervalle.",
   "Le numéro sept, lui, est conçu pour tenir pile dans un intervalle."),
  ("Spécifié à Genève en 1981,\ncomplété à Malaga en 1984.",
   "Spécifié à Genève en quatre-vingt-un, complété à Malaga en quatre-vingt-quatre."),
  ("En 1992, le CCITT devient l'UIT-T,\net le numéro 7 devient SS7.",
   "En quatre-vingt-douze, le CCITT devient l'UIT-T, et le numéro sept devient SS7."),
  ("Même protocole, nouveau nom.", None)],

 [("Ce réseau a ses propres habitants.", None),
  ("Le point sémaphore, le PS.", None),
  ("C'est lui qui traite SS7,\net il vit dans un commutateur.", None),
  ("Pas de PS, pas de SS7.", None),
  ("Le point de transfert sémaphore, le PTS :", None),
  ("un commutateur qui ne raccorde aucun abonné,", None),
  ("et qui ne fait que faire transiter\nla signalisation des autres.", None),
  ("Et voilà la règle qui piège tout le monde.\nUn PS ne fait jamais transiter.", None),
  ("Le prof est formel : « Si le CT reçoit un message\ndont la destination finale n'est pas lui,", None),
  ("il le supprime. Il n'a pas les moyens\nde faire du transit. »", None),
  ("Il le jette. Seul le PTS réachemine.", None),
  ("Entre deux points, on tire un canal sémaphore,\nà 64 kilobits.",
   "Entre deux points, on tire un canal sémaphore, à soixante-quatre kilobits."),
  ("On en groupe 2 à 16 : ça fait un faisceau.",
   "On en groupe deux à seize : ça fait un faisceau."),
  ("Et entre deux mêmes points,\nquatre faisceaux au maximum.", None)],

 [("Maintenant la question centrale,\ncelle qui tombe à l'examen.", None),
  ("Par où passe la signalisation,\npar rapport à la parole ?", None),
  ("Trois réponses. Trois modes.", None),
  ("Le mode associé : la signalisation suit\nexactement le même trajet que la parole.", None),
  ("Lien direct, aucun transfert au milieu.", None),
  ("Et le prof a insisté là-dessus :", None),
  ("« Deux CAA ne peuvent pas communiquer en mode\nassocié si les deux PS ne sont pas liés directement. »", None),
  ("C'est simple, mais ça exige un lien direct partout\n— impossible à l'échelle d'un pays.", None),
  ("Le mode non associé : les messages prennent\nn'importe lequel des chemins disponibles.", None),
  ("Très résistant aux pannes.", None),
  ("Mais deux messages partis dans l'ordre\npeuvent arriver dans le désordre.", None),
  ("Et SS7 ne sait pas les remettre dans l'ordre :", None),
  ("son logiciel de transport ne prévoit rien pour ça.", None),
  ("Donc pour la voix, c'est interdit.", None),
  ("Le mode quasi-associé : plusieurs chemins existent,", None),
  ("on en choisit un,\net on le garde pour toute la session.", None),
  ("On récupère la résistance du non associé,\net l'ordre du mode associé.", None),
  ("Retiens-le : SS7 n'est spécifié que pour\nl'associé et le quasi-associé.", None)],

 [("Chaque point sémaphore a un numéro.\nSix, zéro seize, un.", None),
  ("Ça se lit comme une adresse postale :\ndu plus large au plus précis.", None),
  ("Le six, c'est la zone mondiale. L'Afrique.", None),
  ("2 pour l'Europe, 3 pour les États-Unis, 4 pour l'Asie,",
   "Deux pour l'Europe, trois pour les États-Unis, quatre pour l'Asie,"),
  ("5 pour l'Australie, 7 pour l'Amérique du Sud.",
   "cinq pour l'Australie, sept pour l'Amérique du Sud."),
  ("Zéro seize, c'est la zone de signalisation :\nle Sénégal.", None),
  ("Et le dernier chiffre, c'est le point lui-même.", None),
  ("Les vrais codes de chez nous :\nle CTI de Thiaroye, 6-016-1.",
   "Les vrais codes de chez nous : le CTI de Thiaroye, six zéro seize un."),
  ("Le CTI Médina, 2. Le point de transfert\ndu Technopole, 5. Celui de Dakar, 6.",
   "Le CTI Médina, deux. Le point de transfert du Technopole, cinq. Celui de Dakar, six."),
  ("Seul le dernier chiffre change.", None),
  ("Dernière chose, et elle surprend : un même point\npeut porter plusieurs codes,", None),
  ("un par plan — local, national, international.", None),
  ("C'est la même machine.", None),
  ("Mais elle a un surnom au basket,\net un autre au foot.", None)],

 [("Il reste à savoir qui parle à qui là-dedans.", None),
  ("SS7 se range en deux étages.", None),
  ("En bas, le SSTM, le sous-système de transport\nde messages : les trois niveaux bas.", None),
  ("Son seul travail, c'est d'amener un message\nd'un point à l'autre, intact.", None),
  ("Il est identique pour tout le monde.", None),
  ("En haut, les sous-systèmes utilisateurs.", None),
  ("Le SSUT pour la téléphonie analogique.\nLe SSUR, qu'on appelle aussi ISUP, pour le numérique.", None),
  ("Le SSUM pour le mobile. Le SSUD pour les données.", None),
  ("Et entre les deux ? Quatre bits, dans chaque\nmessage : l'indicateur de service.", None),
  ("C'est l'aiguilleur. Le transport lit ces quatre bits\net sait à quel étage livrer.", None),
  ("0000, c'est de la gestion, ça ne monte pas.\n0100, téléphonie.",
   "Zéro zéro zéro zéro, c'est de la gestion, ça ne monte pas. Zéro un zéro zéro, téléphonie."),
  ("Quatre bits, et tout le monde reçoit son courrier.", None)],

 [("Avant de fermer le cahier.", None),
  ("La signalisation établit, surveille, et rompt.", None),
  ("Voie par voie : les papiers voyagent avec la parole,\net tombent avec elle.", None),
  ("Voie commune : une route à part,\ndes messages étiquetés — c'est SS7.", None),
  ("Le numéro 6 a échoué sur un débit ;\nle 7 tient pile dans 64 kilobits.",
   "Le numéro six a échoué sur un débit ; le sept tient pile dans soixante-quatre kilobits."),
  ("Dans le réseau : des PS partout, des PTS pour le\ntransit, et un PS ne transite jamais.", None),
  ("Trois modes, un seul bon pour la voix :\nle quasi-associé.", None),
  ("L'adresse se lit de la zone jusqu'au point.", None),
  ("Et quatre bits, l'INS, aiguillent chaque message\nvers son étage.", None),
  ("Le prof a terminé la séance par une phrase.", None),
  ("« On commence par les fonctions du SSTM.\nLa prochaine fois. »", None),
  ("Eh bien, la prochaine fois, c'est l'épisode deux.", None),
  ("On ouvre le message, et on démonte\nBIR, BIA, NSA et NSR.", None)],
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

p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'out', 'SS7_Ep1_FR.srt')
os.makedirs(os.path.dirname(p), exist_ok=True)
open(p, 'w', encoding='utf-8').write('\n'.join(out))
print(f"{n} sous-titres ->", os.path.realpath(p))
