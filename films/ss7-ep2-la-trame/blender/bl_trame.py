# La trame sémaphore, en volume : fanion · correction · INL · information · CRT · fanion.
# Le piège du cours se voit physiquement : correction au DÉBUT, détection à la FIN.
import bpy, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_common import *

OUT    = os.environ.get('OUT', '/tmp/tr_')
W, H   = int(os.environ.get('W', 1920)), int(os.environ.get('H', 1080))
SAMP   = int(os.environ.get('SAMP', 12))
NF     = int(os.environ.get('NF', 336))
FRAMES = os.environ.get('FRAMES', '1')

sc = boot(W, H, SAMP)
M_J  = mat('jaune', JAUNE)
M_B  = mat('bleu',  BLEU)
M_V  = mat('vert',  VERT)
M_R  = mat('rouge', ROUGE)
M_P  = mat('papier', sr(0xD8, 0xCD, 0xB8), rough=0.88)
M_E  = mat('encre', ENCRE, rough=0.85)

sol(z=-0.30, dims=(46.0, 30.0), center=(0, 2.5))
fond(y=13.0)

# [largeur, hauteur, matière, nom, sous-titre]
SEG = [(1.05, 0.62, M_J, 'FANION',     '8 eb'),
       (2.30, 0.78, M_B, 'CORRECTION', 'NSA · BIA · NSR · BIR  ·  16 eb'),
       (1.05, 0.62, M_V, 'INL',        '8 eb'),
       (4.60, 0.50, M_P, 'INFORMATION','partie variable  ·  max 272 octets'),
       (2.30, 0.78, M_R, 'DÉTECTION',  'CRT  ·  16 eb'),
       (1.05, 0.62, M_J, 'FANION',     '8 eb')]
GAP = 0.09
TOT = sum(s[0] for s in SEG) + GAP * (len(SEG) - 1)
x = -TOT / 2
CENTRES = []
for w, h, m, nm, sub in SEG:
    cx = x + w / 2
    box((cx, 0, h / 2 - 0.30), (w, 1.25, h), m, bevel=0.018)
    CENTRES.append((cx, w, h, nm, sub))
    x += w + GAP

for cx, w, h, nm, sub in CENTRES:
    label(nm, (cx, -0.66, h + 0.30), 0.22, M_E)
    labelPlat(sub, (cx, -1.30, -0.29), 0.175, M_E)

# le sens de transmission
tube('axe', [(-TOT / 2 - 0.4, -1.78, -0.28), (TOT / 2 + 0.4, -1.78, -0.28)], M_E, r=0.011)

# les deux annotations qui portent tout le chapitre, posées devant la trame
labelPlat('AU DÉBUT', (CENTRES[1][0], -2.45, -0.29), 0.34, M_B)
labelPlat('la correction', (CENTRES[1][0], -2.98, -0.29), 0.23, M_E)
labelPlat('À LA FIN', (CENTRES[4][0], -2.45, -0.29), 0.34, M_R)
labelPlat('la détection', (CENTRES[4][0], -2.98, -0.29), 0.23, M_E)
for cx in (CENTRES[1][0], CENTRES[4][0]):
    tube(f'l{cx}', [(cx, -1.72, -0.28), (cx, -2.18, -0.28)], M_E, r=0.010)

lights(key=(-8, -11, 11), kE=1200, fill=(9, -8, 3), fE=400)
# la caméra longe la trame de gauche à droite, puis recule
piv, cam = camera(sc, (0, -18.0, 5.6), 40, -9, 9, NF, target=(0, -0.9, 0.1))
cam.location = (0, -19.6, 6.6);  cam.keyframe_insert('location', frame=1)
cam.location = (0, -16.4, 4.8);  cam.keyframe_insert('location', frame=int(NF * 0.5))
cam.location = (0, -20.0, 7.0);  cam.keyframe_insert('location', frame=NF)
for fc in cam.animation_data.action.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = 'SINE'; kp.easing = 'EASE_IN_OUT'
render(sc, OUT, NF, FRAMES)
