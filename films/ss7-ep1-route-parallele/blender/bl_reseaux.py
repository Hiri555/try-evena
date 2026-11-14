# Les deux réseaux superposés. La parole roule SUR la page ; la signalisation
# flotte au-dessus, sur sa propre topologie — et arrive avant.
import bpy, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_common import *

OUT    = os.environ.get('OUT', '/tmp/res_')
W, H   = int(os.environ.get('W', 1920)), int(os.environ.get('H', 1080))
SAMP   = int(os.environ.get('SAMP', 32))
NF     = int(os.environ.get('NF', 144))
FRAMES = os.environ.get('FRAMES', '1')

sc = boot(W, H, SAMP)
M_V  = mat('voix', ROUGE)
M_S  = mat('sig',  BLEU)
M_J  = mat('jaune', JAUNE)
M_E  = mat('encre', ENCRE, rough=0.85)
M_BX = mat('boite', sr(0x6E, 0x82, 0x8C), rough=0.72)
M_GR = mat('grille', sr(0x8C, 0xA6, 0xB4), rough=0.9)

ZB, ZH = 0.0, 2.40
XS = [-6.2, -2.1, 2.1, 6.2]
sol(z=ZB - 0.21, dims=(19.6, 11.0), center=(0, 1.4))   # la feuille, bords visibles

for x in XS:
    box((x, 0, ZB), (0.80, 0.60, 0.42), M_BX)
for a, b in zip(XS, XS[1:]):
    tube(f'tr{a}', [(a + 0.42, 0, ZB), (b - 0.42, 0, ZB)], M_V, r=0.075)

PS = [(x, 0, ZH) for x in XS]
for p in PS:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.30, location=p)
    bpy.ops.object.shade_smooth(); bpy.context.object.data.materials.append(M_S)
for x in XS:
    tube(f'up{x}', [(x, 0, ZB + 0.22), (x, 0, ZH - 0.30)], M_GR, r=0.020)

PTS = (0.0, -2.30, ZH + 0.80)
bpy.ops.mesh.primitive_ico_sphere_add(radius=0.46, subdivisions=2, location=PTS)
bpy.context.object.data.materials.append(M_J)

SIGP = [PS[0], (-4.0, -1.0, ZH + 0.45), PTS, (4.0, -1.0, ZH + 0.45), PS[3]]
tube('sigroute', SIGP, M_S, r=0.038)
for a, b in zip(PS, PS[1:]):                      # liaisons locales, en pointillés
    for k in range(7):
        t0, t1 = k / 7 + 0.02, (k + 0.60) / 7
        p0 = [a[j] + (b[j] - a[j]) * t0 for j in range(3)]
        p1 = [a[j] + (b[j] - a[j]) * t1 for j in range(3)]
        tube(f'd{a[0]}{k}', [p0, p1], M_GR, r=0.017)

# le plan sémaphore, en filaire au-dessus
bpy.ops.mesh.primitive_grid_add(x_subdivisions=17, y_subdivisions=8, size=1,
                                location=(0, -0.7, ZH + 0.95))
pl = bpy.context.object; pl.scale = (17.4, 7.2, 1)
bpy.ops.object.transform_apply(scale=True)
bpy.ops.object.modifier_add(type='WIREFRAME')
pl.modifiers['Wireframe'].thickness = 0.020
pl.data.materials.append(M_GR)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.21, location=(XS[0], 0, ZB))
bv = bpy.context.object; bpy.ops.object.shade_smooth()
bv.data.materials.append(mat('bv', ROUGE, emit=1.6))
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.19, location=PS[0])
bs = bpy.context.object; bpy.ops.object.shade_smooth()
bs.data.materials.append(mat('bs', BLEU, emit=1.8))

def key(ob, frames, locs):
    for f, L in zip(frames, locs):
        ob.location = L; ob.keyframe_insert('location', frame=f)
    linear(ob)
key(bs, [1, 24, 52, 80, 104], SIGP)
key(bv, [1, 30, 108, 144],
    [(XS[0], 0, ZB), (XS[0], 0, ZB), (XS[3], 0, ZB), (XS[3], 0, ZB)])

label('RÉSEAU SÉMAPHORE', (0, -2.30, ZH + 1.90), 0.38, M_S)
label('la signalisation · 64 kbit/s', (0, -2.30, ZH + 1.52), 0.20, M_E)
label('PTS', (0.78, -2.30, ZH + 0.74), 0.26, M_E, 'LEFT')
labelPlat('RÉSEAU TÉLÉPHONIQUE', (0, -2.05, ZB - 0.20), 0.40, M_V)
labelPlat('la parole · commutation de circuits', (0, -2.72, ZB - 0.20), 0.21, M_E)
for x, nm in zip(XS, ('CAA', 'CT', 'CT', 'CAA')):
    labelPlat(nm, (x, -0.92, ZB - 0.20), 0.24, M_E)

lights(key=(-7, -10, 10), kE=1100, fill=(8, -7, 3), fE=380)
camera(sc, (0, -18.6, 5.2), 38, -12, 10, NF, target=(0, -0.4, 0.85))
render(sc, OUT, NF, FRAMES)
