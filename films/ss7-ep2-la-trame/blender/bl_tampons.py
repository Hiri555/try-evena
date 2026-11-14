# L'image qui débloque BIR/BIA : des colis numérotés (NSA) portant un tampon de
# couleur (BIA), et des reçus qui reviennent avec un numéro (NSR) et l'écho du
# tampon (BIR). Quand la couleur bascule, c'est l'erreur.
import bpy, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_common import *

OUT    = os.environ.get('OUT', '/tmp/ta_')
W, H   = int(os.environ.get('W', 1920)), int(os.environ.get('H', 1080))
SAMP   = int(os.environ.get('SAMP', 12))
NF     = int(os.environ.get('NF', 384))
FRAMES = os.environ.get('FRAMES', '1')

sc = boot(W, H, SAMP)
M_B  = mat('bleu',  BLEU)
M_J  = mat('jaune', JAUNE)
M_R  = mat('rouge', ROUGE)
M_E  = mat('encre', ENCRE, rough=0.85)
M_C  = mat('colis', sr(0xD8, 0xCD, 0xB8), rough=0.88)
M_T  = mat('tour',  sr(0x8E, 0xA0, 0xA9), rough=0.80)

sol(z=-0.60, dims=(42.0, 27.0), center=(0, 1.6))
fond(y=13.0)
AX, BX = -5.0, 5.0
LA, LB = 1.25, -1.25            # voie aller (colis) / voie retour (reçus)

for x, nm in ((AX, 'TERMINAL A'), (BX, 'TERMINAL B')):
    box((x, 0, 0.22), (1.25, 2.6, 1.65), M_T, bevel=0.05)
    labelPlat(nm, (x, -2.25, -0.59), 0.28, M_E)
# les deux voies
for y, c in ((LA, M_B), (LB, M_E)):
    tube(f'v{y}', [(AX + 0.7, y, -0.57), (BX - 0.7, y, -0.57)], c, r=0.016)
labelPlat('LES COLIS   A  vers  B', (0, LA + 0.95, -0.59), 0.23, M_B)
labelPlat('LES REÇUS   B  vers  A', (0, LB - 0.85, -0.59), 0.23, M_E)

def colis(name, num, mstamp, mbody=M_C):
    """un colis : une caisse + un tampon de couleur posé dessus + son numéro"""
    b = box((0, 0, 0), (1.50, 1.20, 0.92), mbody, bevel=0.04)
    b.name = name
    t = box((0, 0, 0.56), (1.18, 0.96, 0.20), mstamp, bevel=0.02)
    t.parent = b
    n = label(num, (0, -0.63, -0.14), 0.42, M_E)
    n.parent = b
    return b

def recu(name, num, mstamp):
    b = box((0, 0, 0), (1.90, 1.05, 0.22), mstamp, bevel=0.025)
    b.name = name
    n = label(num, (0, -0.56, 0.16), 0.32, M_E)
    n.parent = b
    return b

def vis(ob, spans):
    """invisible hors des spans — enfants compris : masquer un parent
       ne masque pas ses enfants dans Blender."""
    for o in [ob] + list(ob.children):
        for f in range(1, NF + 1):
            on = any(a <= f <= b for a, b in spans)
            o.hide_render = not on; o.hide_viewport = not on
            o.keyframe_insert('hide_render', frame=f)
            o.keyframe_insert('hide_viewport', frame=f)
        for fc in o.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = 'CONSTANT'

def glisse(ob, f0, f1, x0, x1, y, z=0.0):
    ob.location = (x0, y, z); ob.keyframe_insert('location', frame=f0)
    ob.location = (x1, y, z); ob.keyframe_insert('location', frame=f1)
    linear(ob)

X0, X1 = AX + 2.2, BX - 2.2   # les colis s'arrêtent avant la tour
# 1 · le colis 9, tampon bleu, part et arrive bien
p1 = colis('p9', '9', M_B);     glisse(p1, 1, 70, X0, X1, LA); vis(p1, [(1, 70)])
# 2 · le reçu : NSR 9, même couleur -> tout va bien
r1 = recu('r9', 'NSR 9', M_B);  glisse(r1, 76, 140, X1, X0, LB); vis(r1, [(76, 140)])
# 3 · le colis 10 part en bleu... et s'abîme en route
p2 = colis('p10', '10', M_B);   glisse(p2, 150, 220, X0, X1, LA); vis(p2, [(150, 192)])
p2b = colis('p10b', '10', M_B, M_R); glisse(p2b, 150, 220, X0, X1, LA); vis(p2b, [(193, 220)])
# 4 · le reçu revient avec NSR 9 et un tampon JAUNE : la couleur a basculé
r2 = recu('r9b', 'NSR 9', M_J); glisse(r2, 226, 290, X1, X0, LB); vis(r2, [(226, 290)])
# 5 · on retransmet le 10, avec notre propre tampon basculé
p3 = colis('p10c', '10', M_J);  glisse(p3, 300, 368, X0, X1, LA); vis(p3, [(300, 368)])

# les quatre champs, écrits sur la page
labelPlat('NSA  ·  le numéro du colis     BIA  ·  le tampon que je pose',
          (0, LA + 1.62, -0.59), 0.21, M_E)
labelPlat('NSR  ·  le dernier bien reçu     BIR  ·  l\'écho du tampon',
          (0, LB - 1.52, -0.59), 0.21, M_E)

lights(key=(-8, -12, 11), kE=1200, fill=(9, -8, 3), fE=400)
piv, cam = camera(sc, (0, -14.6, 6.4), 32, -4, 4, NF, target=(0, -0.3, 0.1))
cam.location = (0, -15.4, 7.0); cam.keyframe_insert('location', frame=1)
cam.location = (0, -13.4, 5.6); cam.keyframe_insert('location', frame=int(NF * 0.55))
cam.location = (0, -15.8, 7.2); cam.keyframe_insert('location', frame=NF)
for fc in cam.animation_data.action.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = 'SINE'; kp.easing = 'EASE_IN_OUT'
render(sc, OUT, NF, FRAMES)
