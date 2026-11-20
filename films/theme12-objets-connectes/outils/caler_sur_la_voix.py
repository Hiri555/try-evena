import subprocess, re, json, sys, os
D = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(D, '..', 'vo', 'vo.mp3')

LIGNES = [
 "Un operateur pose des milliers de compteurs communicants.",
 "Chacun porte une carte SIM.",
 "Et chaque heure, il envoie un seul chiffre : l'index de consommation.",
 "Un chiffre banal.",
 "Sauf qu'aligne sur vingt-quatre heures, ce chiffre montre quelqu'un qui se leve, qui part travailler, qui rentre, qui dort.",
 "L'index dessine le rythme de vie d'un foyer. Et la, le droit se reveille.",
 "Trois corps de regles s'appliquent en meme temps sur ce seul boitier. C'est leur superposition qui fait la difficulte.",
 "Un : identifier. L'article trente-six oblige l'operateur a identifier tous les utilisateurs de ses services.",
 "Mais attention : la carte du compteur n'appartient pas a l'occupant. Elle est rattachee a l'entreprise qui exploite le parc.",
 "Deux sujets de droit distincts - les confondre, c'est l'erreur la plus chere du sujet.",
 "Deux : qualifier. L'index est une donnee personnelle des qu'il est rattachable a un foyer.",
 "Mais il n'est pas sensible : l'article quarante reserve ca a la sante, aux opinions, a l'origine.",
 "Trop qualifier est une erreur. Pas assez aussi. La bonne reponse est entre les deux.",
 "Et l'ingenieur a deux leviers que le juriste n'a pas.",
 "L'agregation : si la finalite est de piloter un quartier, on remonte un agregat, et ce n'est plus une donnee personnelle.",
 "La frequence : l'horaire revele la presence au domicile ; le quotidien suffit souvent.",
 "Trois : faire vieillir le parc. Changer les mots de passe d'usine. Chiffrer les transmissions. Remplacer un objet que le fabricant ne corrige plus.",
 "Et a la depose, desactiver la carte - sinon elle devient orpheline.",
 "La preuve de tout ca tient dans un seul document : le registre de parc.",
 "Chaque objet, sa donnee, sa finalite, sa frequence, sa base legale, sa duree.",
 "Trois regimes. Un seul boitier. Identifier la carte, qualifier la donnee, faire vieillir le parc.",
]

dur = float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',SRC],
      capture_output=True,text=True).stdout.strip())

out = subprocess.run(['ffmpeg','-v','info','-i',SRC,'-af','silencedetect=noise=-40dB:d=0.16','-f','null','-'],
      capture_output=True,text=True).stderr
sil=[]
cs=None
for m in re.finditer(r'silence_(start|end): ([\d.]+)', out):
    if m.group(1)=='start': cs=float(m.group(2))
    else:
        se=float(m.group(2))
        if cs is not None: sil.append(((cs+se)/2.0, cs, se)); cs=None
# first voice onset
onset = sil[0][2] if sil and sil[0][1] < 0.35 else 0.0

poids = [max(len(l), 12) for l in LIGNES]
tot = sum(poids)
util = dur - onset - 0.25
acc = onset
bruts = [onset]
for p in poids:
    acc += util * p / tot
    bruts.append(acc)

W = 2.6
cues = [round(onset,3)]
prev = onset
for i in range(1, len(bruts)):
    t = bruts[i]
    if i == len(bruts)-1:
        cues.append(round(dur,3)); break
    cand = [s for s in sil if abs(s[0]-t) <= W and s[2] > prev + 0.45]
    if cand:
        best = min(cand, key=lambda s: abs(s[0]-t))
        snap = best[2] - 0.06          # start speaking just after the silence ends
    else:
        snap = t
    snap = max(snap, prev + 0.45)
    cues.append(round(snap,3))
    prev = snap

print(json.dumps({'duration':dur,'onset':onset,'n_sil':len(sil)}, indent=1))
for i,l in enumerate(LIGNES):
    print(f"{i:2d}  {cues[i]:7.3f} -> {cues[i+1]:7.3f}  ({cues[i+1]-cues[i]:5.2f}s)  {l[:70]}")

js = "// genere par audio/cale.py - cues mesures sur vo/vo.mp3\nconst CUE = [\n"
for i in range(len(LIGNES)):
    js += f"  [{cues[i]}, {cues[i+1]}],   // {i} {LIGNES[i][:58]}\n"
js += "];\nconst L  = i => CUE[i][0];\nconst LE = i => CUE[i][1];\nconst LD = i => CUE[i][1]-CUE[i][0];\n"
open(os.path.join(D,'..','cues.js'),'w').write(js)
print("\ncues.js ecrit")
