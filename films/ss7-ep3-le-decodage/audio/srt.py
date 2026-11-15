# -*- coding: utf-8 -*-
import os, json

STARTS = [1.4, 23.483, 76.733, 108.567, 141.108, 189.525,
          229.608, 261.192, 299.108, 337.358, 409.108, 463.358]

SC = [
 [("Épisode trois. Le dernier.", None),
  ("Celui-là, tu vas le regarder deux fois,\nparce que c'est littéralement ton épreuve.", None),
  ("On te donne 38 octets en hexadécimal,\nles documents sont autorisés,",
   "On te donne trente-huit octets en hexadécimal, les documents sont autorisés,"),
  ("et tu dois dire qui appelle qui.", None),
  ("Mais il reste une fonction du niveau 3\nqu'on n'a jamais ouverte :",
   "Mais il reste une fonction du niveau trois qu'on n'a jamais ouverte :"),
  ("celle qui garde le réseau debout\nquand il tombe en panne.", None)],

 [("Le prof l'avait annoncé dès le début :", None),
  ("« Le niveau 3 assume deux groupes de fonctions :\nl'orientation des messages,",
   "« Le niveau trois assume deux groupes de fonctions : l'orientation des messages,"),
  ("et la gestion du réseau sémaphore. »", None),
  ("On a fait l'orientation. Voici l'autre.", None),
  ("Son travail : garder le réseau fluide et disponible\nmalgré les pannes et la congestion.", None),
  ("Trois fonctions, de la plus locale à la plus globale.", None),
  ("La gestion des canaux. Elle est locale.", None),
  ("Elle surveille chaque canal connecté ici, un par un.", None),
  ("Si un canal défaille — taux d'erreur, panne —\nelle bascule vers un canal de secours.", None),
  ("La gestion du trafic. Elle voit l'ensemble.", None),
  ("Elle répartit le trafic sur tous les canaux\npour ne pas en saturer un seul.", None),
  ("L'image du prof : le policier au rond-point,\ncelui qui évite l'embouteillage.", None),
  ("Et la gestion des routes. Elle est globale.", None),
  ("Si un point de transfert sémaphore tombe,\nelle diffuse les nouvelles routes disponibles.", None),
  ("Celle-là ne concerne que le mode quasi-associé.", None)],

 [("Un message de gestion ne ressemble pas aux autres,", None),
  ("et ça se voit dès l'indicateur de sous-système.", None),
  ("INS = 0000 : gestion du réseau.", "INS égale zéro zéro zéro zéro : gestion du réseau."),
  ("Et ça veut dire une chose précise :\nce message ne dépasse jamais le niveau 3.",
   "Et ça veut dire une chose précise : ce message ne dépasse jamais le niveau trois."),
  ("Il ne monte pas jusqu'à l'application.", None),
  ("Conséquence directe, et c'est elle qu'on demande :\npas d'étiquette téléphonique.", None),
  ("À la place de la sélection du canal sémaphore,\non trouve le COC, le numéro du canal concerné.", None),
  ("Et juste après, une entête H0, H1,\nqui dit quel problème il faut régler.",
   "Et juste après, une entête H zéro, H un, qui dit quel problème il faut régler.")],

 [("Trois sigles de quatre bits qui se ressemblent,", None),
  ("et que tout le monde confond le jour de l'examen.", None),
  ("Le SCS, sélection du canal sémaphore :\nil choisit l'itinéraire, dans un message normal.", None),
  ("Le COC, numéro du canal à gérer :", None),
  ("il désigne quel canal on répare,\ndans un message de gestion.", None),
  ("Et le CIC, code d'identification du circuit :", None),
  ("lui, c'est le circuit téléphonique, la voix.", None),
  ("Un détail qui tombe souvent :\nCOC = 0000 signifie « tous les canaux ».",
   "Un détail qui tombe souvent : COC égale zéro zéro zéro zéro signifie « tous les canaux »."),
  ("Il ne reste donc que 15 canaux\nadressables individuellement.",
   "Il ne reste donc que quinze canaux adressables individuellement.")],

 [("Quand un canal lâche, les deux extrémités\nse parlent avec un petit vocabulaire,", None),
  ("codé sur H0 et H1.", "codé sur H zéro et H un."),
  ("PCO : ordre de passage sur canal de secours.\nPCA : son accusé.", None),
  ("S'il y a urgence : PUO, ordre de passage urgent,\net PUA, son accusé.", None),
  ("Et quand le canal normal est réparé :\nRCO, ordre de retour, puis RCA, accusé de retour.", None),
  ("Toujours la même grammaire : un ordre, un accusé.", None),
  ("Et la congestion ? Le prof :", None),
  ("« Si un canal est trop encombré, l'autre extrémité\nenvoie une trame sémaphore d'état occupé.", None),
  ("Le niveau 3 considère le canal encombré, et fait passer\ntout le faisceau auquel il appartient en état encombré. »",
   "Le niveau trois considère le canal encombré, et fait passer tout le faisceau auquel il appartient en état encombré. »"),
  ("Retiens la dernière idée :", None),
  ("la décision de détourner le trafic appartient\nau niveau gestion, pas au canal lui-même.", None)],

 [("On monte au niveau 4, et on regarde\ncomment un vrai message est bâti —",
   "On monte au niveau quatre, et on regarde comment un vrai message est bâti —"),
  ("parce que c'est exactement ça qu'on va décoder.", None),
  ("Après l'entête, deux zones.", None),
  ("Un sous-domaine obligatoire : toujours là.\nUn sous-domaine facultatif : parfois.", None),
  ("Dans chacune, des champs de longueur fixe,\net des champs de longueur variable.", None),
  ("Règle d'or : un champ de longueur variable est\ntoujours précédé d'un indicateur de sa longueur.", None),
  ("Et on y accède par un pointeur, qui dit\ncombien d'octets plus loin il commence.", None),
  ("Le réflexe, avant toute chose : lire l'INS.", None),
  ("SSUT, c'est la norme Q.723.\nSSUR, le RNIS, c'est Q.763.",
   "SSUT, c'est la norme Q point sept cent vingt-trois. SSUR, le RNIS, c'est Q point sept cent soixante-trois."),
  ("Se tromper de table, c'est tout décoder faux.", None)],

 [("Voilà l'exercice. 38 octets, en hexadécimal.",
   "Voilà l'exercice. Trente-huit octets, en hexadécimal."),
  ("On ne se jette pas dessus : on les pose,\net on part du bas de la pile.", None),
  ("Les deux premiers octets : la correction, niveau 2.",
   "Les deux premiers octets : la correction, niveau deux."),
  ("Le troisième : l'indicateur de longueur.\nLe quatrième : l'octet de service.", None),
  ("Puis quatre octets d'étiquette d'acheminement,", None),
  ("et deux octets de code d'identification du circuit.", None),
  ("Et c'est seulement à partir du onzième octet\nque le message de niveau 4 commence.",
   "Et c'est seulement à partir du onzième octet que le message de niveau quatre commence."),
  ("Onze octets avant d'arriver au message.\nC'est ça qu'il faut savoir sauter.", None)],

 [("Première question :\nquelle est la longueur du champ information ?", None),
  ("L'indicateur de longueur, c'est le troisième octet : 0x23.",
   "L'indicateur de longueur, c'est le troisième octet : zéro x vingt-trois."),
  ("Et on a vu dans l'épisode 2 qu'on ignore\nles deux bits de poids fort.",
   "Et on a vu dans l'épisode deux qu'on ignore les deux bits de poids fort."),
  ("0x23, en binaire, ça fait 0010 0011.",
   "Zéro x vingt-trois, en binaire, ça fait zéro zéro un zéro zéro zéro un un."),
  ("On garde les six bits utiles : 10 0011.",
   "On garde les six bits utiles : un zéro zéro zéro un un."),
  ("32, plus 2, plus 1 : 35.", "Trente-deux, plus deux, plus un : trente-cinq."),
  ("Le champ information fait 35 octets.",
   "Le champ information fait trente-cinq octets."),
  ("Et on vérifie toujours : 2 de correction, plus 1\nd'indicateur, plus 35 d'information, ça fait 38.",
   "Et on vérifie toujours : deux octets de correction, plus un d'indicateur, plus trente-cinq d'information, ça fait trente-huit."),
  ("La trame entière. Ça tombe juste.", None)],

 [("Deuxième question :\nquelle est la catégorie du demandeur ?", None),
  ("Ici, il faut dérouler la partie fixe obligatoire\ndans l'ordre exact de la norme.", None),
  ("Type de message, nature de la connexion,", None),
  ("indicateurs d'appel sur deux octets,\ncatégorie, puis support.", None),
  ("En comptant, la catégorie tombe\nsur le quinzième octet : 0x0A.",
   "En comptant, la catégorie tombe sur le quinzième octet : zéro x zéro A."),
  ("On ouvre la table « catégorie de l'appelant »\ndans Q.763.",
   "On ouvre la table « catégorie de l'appelant » dans Q point sept cent soixante-trois."),
  ("0000 1010 : abonné appelant ordinaire.",
   "Zéro zéro zéro zéro un zéro un zéro : abonné appelant ordinaire."),
  ("Pour information, 0x0B, c'est un abonné prioritaire,\net 0x0D, un appel d'essai.",
   "Pour information, zéro x zéro B, c'est un abonné prioritaire, et zéro x zéro D, un appel d'essai.")],

 [("Troisième et quatrième questions : les deux numéros.", None),
  ("Et c'est là que les pointeurs servent enfin.", None),
  ("Le numéro de l'appelé est\nle paramètre variable obligatoire.", None),
  ("Son pointeur est à l'octet 17 : 0x02.",
   "Son pointeur est à l'octet dix-sept : zéro x zéro deux."),
  ("Deux octets plus loin, donc l'octet 19.\nOn y lit 8 : la longueur.",
   "Deux octets plus loin, donc l'octet dix-neuf. On y lit huit : la longueur."),
  ("Ensuite la nature : international.\nPuis le plan de numérotation : RNIS.", None),
  ("Et ensuite, les chiffres.", None),
  ("Attention, voilà le piège qui coûte le plus de points :", None),
  ("les chiffres sont en BCD,\net le poids faible vient d'abord.", None),
  ("0x97 ne se lit pas neuf sept. Il se lit sept, neuf.",
   "Zéro x quatre-vingt-dix-sept ne se lit pas neuf sept. Il se lit sept, neuf."),
  ("Le numéro de l'appelé, c'est donc :\n7 9 4 0 9 6 9 9 9 1 7.",
   "Le numéro de l'appelé, c'est donc : sept neuf quatre zéro neuf six neuf neuf neuf un sept."),
  ("Et le F tout à la fin, c'est 1111 :\nle signal ST, fin de numérotation.",
   "Et le F tout à la fin, c'est un un un un : le signal ST, fin de numérotation."),
  ("Le numéro de l'appelant, lui, est facultatif.", None),
  ("Son pointeur, à l'octet 18, vaut 0x0A :\ndix octets plus loin, donc l'octet 28.",
   "Son pointeur, à l'octet dix-huit, vaut zéro x zéro A : dix octets plus loin, donc l'octet vingt-huit."),
  ("Et à l'octet 28 on lit 0x0A, qui est justement\nle code du paramètre « numéro de l'appelant ».",
   "Et à l'octet vingt-huit on lit zéro x zéro A, qui est justement le code du paramètre « numéro de l'appelant »."),
  ("Il est donc bien présent :\n7 9 4 0 9 9 4 7 5 7 3.",
   "Il est donc bien présent : sept neuf quatre zéro neuf neuf quatre sept cinq sept trois.")],

 [("Cinquième question : le sous-système utilisateur\nRNIS est-il utilisé sur toute la connexion ?", None),
  ("Il y a deux preuves, et on donne les deux.", None),
  ("Première preuve : l'octet de service,\nle quatrième, vaut 0xC5.",
   "Première preuve : l'octet de service, le quatrième, vaut zéro x C cinq."),
  ("Ses quatre bits de poids faible valent 5,",
   "Ses quatre bits de poids faible valent cinq,"),
  ("et 5, c'est sous-système utilisateur pour le RNIS.\nOn est bien en SSUR.",
   "et cinq, c'est sous-système utilisateur pour le RNIS. On est bien en SSUR."),
  ("Deuxième preuve : les indicateurs d'appel\némis vers l'avant, octets 13 et 14, valent 20 00.",
   "Deuxième preuve : les indicateurs d'appel émis vers l'avant, octets treize et quatorze, valent vingt et zéro zéro."),
  ("L'octet 13, 0x20, en binaire c'est 0010 0000.",
   "L'octet treize, zéro x vingt, en binaire c'est zéro zéro un zéro zéro zéro zéro zéro."),
  ("Le sixième bit, qu'on appelle le bit F, vaut 1.",
   "Le sixième bit, qu'on appelle le bit F, vaut un."),
  ("Et dans Q.763, ce bit veut dire : sous-système\nutilisateur RNIS utilisé sur toute la connexion.",
   "Et dans Q point sept cent soixante-trois, ce bit veut dire : sous-système utilisateur pour le RNIS utilisé sur toute la connexion."),
  ("Réponse : oui.", None),
  ("Et tu as deux justifications indépendantes,\nce qui vaut toujours mieux qu'une.", None)],

 [("Le réflexe à refaire à l'examen, dans cet ordre.", None),
  ("Un : compter les octets, isoler les deux de correction,\nl'indicateur de longueur, et l'information.", None),
  ("Deux : l'indicateur donne la longueur,\nl'octet de service donne la norme.", None),
  ("Trois : sauter l'étiquette — service, destination,\norigine, sélection, circuit — et lire le type de message.", None),
  ("Quatre : dérouler la partie fixe obligatoire\ndans l'ordre du tableau.", None),
  ("Cinq : suivre les pointeurs, pour le numéro appelé\net pour la partie facultative.", None),
  ("Six : les chiffres sont en BCD, poids faible d'abord,\nF = ST, et un 0 de remplissage si le compte est impair.",
   "Six : les chiffres sont en BCD, poids faible d'abord, F égale ST, et un zéro de remplissage si le compte est impair."),
  ("Voilà. Trois épisodes.\nLa route, la trame, le décodage.", None),
  ("Tu as maintenant la chaîne complète :", None),
  ("du bit qui passe sur un intervalle de temps,", None),
  ("jusqu'au numéro de téléphone\nqu'on lit dans la trame.", None),
  ("Le reste, c'est de la révision. Courage à tous.", None)],
]

D = os.path.dirname(os.path.abspath(__file__))
CAL = json.load(open(os.path.join(D, 'calage.json')))


def ts(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace('.', ',')


if __name__ == '__main__':
    out, n = [], 0
    for i, lines in enumerate(SC):
        b = CAL[i]['bornes']
        for k, (cap, _) in enumerate(lines):
            a, z = STARTS[i] + b[k], STARTS[i] + b[k + 1]
            n += 1
            out.append(f"{n}\n{ts(a)} --> {ts(max(z - 0.08, a + 0.5))}\n{cap}\n")
    p = os.path.join(D, '..', 'out', 'SS7_Ep3_FR.srt')
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write('\n'.join(out))
    print(f"{n} sous-titres ->", os.path.realpath(p))
