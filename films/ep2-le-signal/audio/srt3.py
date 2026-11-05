#!/usr/bin/env python3
"""Build the French .srt sidecar.
Timings are derived by distributing each take's measured duration across its
lines in proportion to how long they take to SAY (spoken form, pauses weighted)."""
import os

STARTS = [0.800, 12.050, 46.467, 102.550, 140.133, 170.258, 202.925, 247.050, 278.842, 316.592]
DURS   = [7.967, 32.131, 53.081, 35.004, 27.716, 30.276, 41.718, 29.388, 35.161, 29.153]

SC = [
 [("Épisode un : on l'a mis en place,\net on l'y maintient.", None),
  ("Maintenant la vraie question.", None),
  ("Qu'est-ce qui passe réellement à travers ?", None)],

 [("À bord, le satellite n'a pas de cerveau.\nIl a des répéteurs.", None),
  ("Chacun fait trois choses, toujours les mêmes :", None),
  ("il reçoit la porteuse qui monte, il l'amplifie\n— elle arrive épuisée après 36 000 km —", 
   "il reçoit la porteuse qui monte, il l'amplifie, elle est arrivée épuisée après trente-six mille kilomètres,"),
  ("et il la renvoie.", None),
  ("Mais entre les deux, il la décale.", None),
  ("Il la descend de 2225 mégahertz.\n6 GHz deviennent 4.",
   "Il la descend de deux mille deux cent vingt-cinq mégahertz. Six gigahertz deviennent quatre."),
  ("Pourquoi ce décalage ? Parce que le satellite\német et reçoit en même temps.", None),
  ("S'il réémettait sur sa fréquence d'écoute,\nil se rendrait sourd.", None)],

 [("La bande C, ce n'est pas un bloc.", None),
  ("C'est trois morceaux, collés par l'histoire.", None),
  ("Au début, 500 mégahertz.", "Au début, cinq cents mégahertz."),
  ("Puis on a ajouté 75 en bas.\nPuis 225 en haut.", "Puis on a ajouté soixante-quinze en bas. Puis deux cent vingt-cinq en haut."),
  ("Total : 800 MHz à la montée, 800 à la descente.",
   "Total : huit cents mégahertz à la montée, huit cents à la descente."),
  ("La bande principale descend de 2225.\nLe petit morceau du bas aussi.",
   "La bande principale descend de deux mille deux cent vingt-cinq. Le petit morceau du bas aussi."),
  ("Tout va bien.", None),
  ("Et puis il y a le dernier morceau.\nCelui tout en haut de la montante.", None),
  ("6425 à 6650.", "Six mille quatre cent vingt-cinq à six mille six cent cinquante."),
  ("Si on lui applique le même décalage,\nil atterrit au-dessus de 4200.",
   "Si on lui applique le même décalage, il atterrit au-dessus de quatre mille deux cents."),
  ("Or la descendante s'arrête à 4200.\nIl n'y a plus de place.",
   "Or la descendante s'arrête à quatre mille deux cents. Il n'y a plus de place."),
  ("Alors on le replie. On le descend\nbeaucoup plus bas — de 3025 —",
   "Alors on le replie. On le descend beaucoup plus bas, de trois mille vingt-cinq,"),
  ("et il va se loger tout en bas\nde la descendante. 3400.",
   "et il va se loger tout en bas de la descendante. Trois mille quatre cents."),
  ("Retiens ça, c'est le piège : la fin de la montante\ndevient le bas de la descendante.", None),
  ("Les deux extrêmes se croisent.", None)],

 [("800 mégahertz, c'est peu.", "Huit cents mégahertz, c'est peu."),
  ("Alors on triche. Honnêtement.", None),
  ("Le champ électrique de l'onde\nne reste pas droit.", None),
  ("Il tourne en avançant, comme un tire-bouchon.", None),
  ("Vers la droite, on dit RHCP.\nVers la gauche, LHCP.", None),
  ("Et voilà l'astuce. Une antenne réglée à droite\nne voit pas du tout le signal de gauche.", None),
  ("Les deux sens s'ignorent complètement.", None),
  ("Donc on envoie deux signaux différents,\nsur exactement la même fréquence,", None),
  ("dans les deux sens de rotation.", None),
  ("La capacité double.\nSans une seule fréquence nouvelle.", None),
  ("800 deviennent 1600.", "Huit cents deviennent mille six cents.")],

 [("Reste une question.", None),
  ("Pourquoi 6 et 4 gigahertz, et pas ailleurs ?", "Pourquoi six et quatre gigahertz, et pas ailleurs ?"),
  ("À cause du bruit.", None),
  ("En dessous d'un gigahertz,\nla galaxie elle-même fait du bruit.", None),
  ("Au-dessus de dix, c'est l'atmosphère qui absorbe —", None),
  ("la vapeur d'eau pique à 22 GHz,\nl'oxygène à 60.",
   "la vapeur d'eau pique à vingt-deux gigahertz, l'oxygène à soixante."),
  ("Entre les deux, il y a une fenêtre. Un creux.\nC'est là qu'on s'installe.", None),
  ("Et la descendante prend le bas de la fenêtre, à 4 :\nc'est elle qui arrive la plus faible.",
   "Et la descendante prend le bas de la fenêtre, à quatre : c'est elle qui arrive la plus faible.")],

 [("Dernière astuce, et c'est la plus belle.", None),
  ("Le satellite ne crie pas partout pareil.", None),
  ("Il a un faisceau global,\nqui couvre tout ce qu'il voit.", None),
  ("Des faisceaux hémisphériques,\nune moitié chacun.", None),
  ("Des faisceaux de zone, découpés par continent.", None),
  ("Et des spots, étroits et puissants,\npointés sur une région précise.", None),
  ("Deux zones qui ne se touchent pas\npeuvent réutiliser la même fréquence.", None),
  ("Elles ne se verront jamais.", None),
  ("Avec ça, et la bande Ku, les 800 MHz de départ\nfinissent par en valoir 3500.",
   "Avec ça, et la bande Ku, les huit cents mégahertz de départ finissent par en valoir trois mille cinq cents.")],

 [("Tout ça ne s'est pas construit d'un coup.", None),
  ("Intelsat I, 1965 : 50 mégahertz,\nun an et demi de vie.",
   "Intelsat un, mille neuf cent soixante-cinq : cinquante mégahertz, un an et demi de vie."),
  ("Intelsat IX : 3450 mégahertz, treize ans.",
   "Intelsat neuf : trois mille quatre cent cinquante mégahertz, treize ans."),
  ("Entre les deux, chaque génération\na apporté une idée.", None),
  ("La IV-A, la réutilisation par l'espace.\nLa V, la réutilisation par la polarisation.",
   "La quatre-A, la réutilisation par l'espace. La cinq, la réutilisation par la polarisation."),
  ("Et la façon de tenir droit a changé :", None),
  ("les premiers tournaient sur eux-mêmes\ncomme une toupie.", None),
  ("Les modernes sont stabilisés sur trois axes,\net seuls les panneaux suivent le Soleil.", None),
  ("Le monde est découpé en régions :\nAtlantique, Indien, Pacifique.", None),
  ("Puis on en a ajouté une quatrième, Asie-Pacifique,\nparce que le trafic y débordait.", None)],

 [("Et au sol ?", None),
  ("Pas forcément une grande antenne fixe.", None),
  ("Une VSAT, c'est un terminal\nà très petite ouverture.", None),
  ("Moins de 4 mètres, souvent moins de 2.",
   "Moins de quatre mètres, souvent moins de deux."),
  ("On les branche en étoile autour d'un concentrateur,\nou en maillage, chacune avec chacune.", None),
  ("Elles tiennent une disponibilité de 99,99 %.",
   "Elles tiennent une disponibilité de quatre-vingt-dix-neuf virgule quatre-vingt-dix-neuf pour cent."),
  ("Visioconférence, télémédecine,\ntransfert de fichiers, télédétection.", None),
  ("Et ce qui mesure leur qualité d'écoute\na un nom : le facteur de mérite.", None)],

 [("Justement.", None),
  ("Deux formules suffisent à l'examen,\net elles disent des choses très simples.", None),
  ("La première : l'affaiblissement en espace libre.", None),
  ("22, plus 20 log de la distance\ndivisée par la longueur d'onde.",
   "Vingt-deux, plus vingt log de la distance divisée par la longueur d'onde."),
  ("Ça dit juste ceci : plus c'est loin,\nplus c'est haut en fréquence, plus ça s'affaiblit.", None),
  ("Sur 36 000 kilomètres,\non perd environ 200 décibels.",
   "Sur trente-six mille kilomètres, on perd environ deux cents décibels."),
  ("La seconde : le facteur de mérite.", None),
  ("Le gain de l'antenne,\nmoins 10 log de sa température de bruit.",
   "Le gain de l'antenne, moins dix log de sa température de bruit."),
  ("Un bon gain, un récepteur froid —\net tu entends ce qui est presque inaudible.", None)],

 [("Avant l'examen.", None),
  ("Le répéteur reçoit, amplifie, décale, renvoie.", None),
  ("Moins 2225 — sauf la fin de bande,\nmoins 3025, qui part tout en bas.",
   "Moins deux mille deux cent vingt-cinq, sauf la fin de bande, moins trois mille vingt-cinq, qui part tout en bas."),
  ("La polarisation double la capacité.\nLes faisceaux la redoublent.", None),
  ("6 et 4 gigahertz, parce que c'est là\nque le ciel est silencieux.",
   "Six et quatre gigahertz, parce que c'est là que le ciel est silencieux."),
  ("La VSAT se juge à son facteur de mérite.", None),
  ("Et tout ça pour une seule chose.", None),
  ("Faire tenir une conversation dans un creux de bruit,\nà 36 000 kilomètres.",
   "Faire tenir une conversation dans un creux de bruit, à trente-six mille kilomètres.")],
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

p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'out',
                 'Telecoms_Satellite_Ep1_FR.srt')
os.makedirs(os.path.dirname(p), exist_ok=True)
open(p, 'w', encoding='utf-8').write('\n'.join(out))
print(f"{n} sous-titres ->", os.path.realpath(p))
