# La pile SS7 : le SSTM en bas (3 niveaux), les sous-systèmes utilisateurs au-dessus.
# Une bille monte, marque un temps sur l'INS, et file vers le bon étage.
import bpy, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_common import *

OUT    = os.environ.get('OUT', '/tmp/pil_')
W, H   = int(os.environ.get('W', 1920)), int(os.environ.get('H', 1080))
SAMP   = int(os.environ.get('SAMP', 32))
NF     = int(os.environ.get('NF', 144))
FRAMES = os.environ.get('FRAMES', '1')

sc = boot(W, H, SAMP)
M_S  = mat('sig',   BLEU)
M_J  = mat('jaune', JAUNE)
M_E  = mat('encre', ENCRE, rough=0.85)
M_V  = mat('voix',  ROUGE)
M_B  = mat('dalle', sr(0xD3, 0xC6, 0xAD), rough=0.86)
M_B2 = mat('dalle2', sr(0xBF, 0xCF, 0xD8), rough=0.86)

sol(z=-2.95, dims=(17.0, 9.0), center=(1.0, 1.2))
SW, SD, SH = 8.8, 2.6, 0.70
OX = 1.35
LV = [('NIVEAU 1   ·   liaison de données', -1.70),
      ('NIVEAU 2   ·   canal sémaphore',    -0.72),
      ('NIVEAU 3   ·   réseau',              0.26)]
for txt, z in LV:
    box((OX, 0, z), (SW, SD, SH), M_B)
    label(txt, (OX - SW / 2 + 0.34, -SD / 2 - 0.02, z - 0.10), 0.225, M_E, 'LEFT')

AX = OX - SW / 2 - 0.42
tube('acc', [(AX + 0.22, -SD / 2, -2.06), (AX, -SD / 2, -2.06),
             (AX, -SD / 2,  0.62), (AX + 0.22, -SD / 2,  0.62)], M_S, r=0.026)
label('SSTM', (AX - 0.22, -SD / 2, -0.78), 0.33, M_S, 'RIGHT')
label('transport de', (AX - 0.22, -SD / 2, -1.14), 0.155, M_E, 'RIGHT')
label('messages',     (AX - 0.22, -SD / 2, -1.42), 0.155, M_E, 'RIGHT')

SSU = [('SSUT', 'téléphonie', OX - 3.30), ('SSUR', 'RNIS · ISUP', OX - 1.10),
       ('SSUM', 'mobile', OX + 1.10),     ('SSUD', 'données', OX + 3.30)]
for nm, sub, x in SSU:
    box((x, 0, 2.20), (2.00, SD, 0.84), M_V if nm == 'SSUT' else M_B2)
    label(nm,  (x, -SD / 2 - 0.02, 2.24), 0.29, M_E)
    label(sub, (x, -SD / 2 - 0.02, 1.93), 0.15, M_E)
label('SOUS-SYSTÈMES UTILISATEURS', (OX, -SD / 2 - 0.02, 3.06), 0.25, M_E)

IX = OX + SW / 2 - 0.80
box((IX, -SD / 2 + 0.18, 0.26), (1.30, 0.42, 0.46), M_J, bevel=0.015)
label('INS',    (IX, -SD / 2 - 0.10, 0.18), 0.21, M_E)
label('4 bits', (IX, -SD / 2 - 0.10, -0.12), 0.14, M_E)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.17, location=(OX, -SD / 2 - 0.3, -2.45))
bd = bpy.context.object; bpy.ops.object.shade_smooth()
bd.data.materials.append(mat('bille', ROUGE, emit=1.8))
Y = -SD / 2 - 0.42
for f, L in ((1, (OX, Y, -2.45)), (26, (OX, Y, -1.70)), (50, (OX, Y, -0.72)),
             (74, (OX, Y, 0.26)), (86, (IX, Y, 0.26)), (98, (IX, Y, 0.26)),
             (122, (OX - 3.30, Y, 1.28)), (144, (OX - 3.30, Y, 2.20))):
    bd.location = L; bd.keyframe_insert('location', frame=f)
linear(bd)

lights(key=(-8, -10, 9), kE=1100, fill=(8, -7, 2), fE=380)
camera(sc, (0, -16.4, 1.0), 34, -9, 8, NF, target=(0.4, 0, 0.25))
render(sc, OUT, NF, FRAMES)
