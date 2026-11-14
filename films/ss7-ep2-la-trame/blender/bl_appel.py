import os
# La procédure d'établissement d'un appel, en échelle :
# MIA · MSS · ACO · RAT · conversation · FIN · LIG
import bpy, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_common import *

OUT    = os.environ.get('OUT', '/tmp/ap_')
W, H   = int(os.environ.get('W', 1920)), int(os.environ.get('H', 1080))
SAMP   = int(os.environ.get('SAMP', 12))
NF     = int(os.environ.get('NF', 336))
FRAMES = os.environ.get('FRAMES', '1')

sc = boot(W, H, SAMP)
M_B = mat('bleu',  BLEU)
M_V = mat('vert',  VERT)
M_R = mat('rouge', ROUGE)
M_J = mat('jaune', JAUNE)
M_E = mat('encre', ENCRE, rough=0.85)
M_T = mat('tour',  sr(0x8E, 0xA0, 0xA9), rough=0.80)

# la feuille, verticale derrière la scène
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 2.4, 0.2))
bg = bpy.context.object; bg.scale = (38.0, 24.0, 1)
bg.rotation_euler = (math.pi / 2, 0, 0)
bpy.ops.object.transform_apply(scale=True, rotation=True)
mbg = bpy.data.materials.new('page'); mbg.use_nodes = True
nb = mbg.node_tree.nodes['Principled BSDF']
nb.inputs['Base Color'].default_value = (*PAPIER, 1)
nb.inputs['Roughness'].default_value = 0.93
# le fond est vertical : les soleils le frôlent et il vire au gris.
# une émission légère lui rend sa valeur de papier.
nb.inputs['Emission Color'].default_value = (*PAPIER, 1)
nb.inputs['Emission Strength'].default_value = float(os.environ.get('FEM', '0.42'))
bg.data.materials.append(mbg)

AX, BX = -4.3, 4.3
TOP, BOT = 3.55, -3.95
for x, nm in ((AX, 'CENTRAL  AMONT'), (BX, 'CENTRAL  AVAL')):
    box((x, 0, (TOP + BOT) / 2), (0.46, 0.40, TOP - BOT), M_T, bevel=0.03)
    label(nm, (x, -0.25, TOP + 0.34), 0.30, M_E)

MSG = [('MIA',  "message initial d'adresse",        +1,  2.70, M_B,  20),
       ('MSS',  "message subséquent d'adresse",     +1,  1.74, M_B,  58),
       ('ACO',  'adresse complète',                 -1,  0.78, M_V,  96),
       ('RAT',  'réponse avec taxation',            -1, -0.18, M_V, 134),
       ('FIN',  'le demandeur raccroche  ·  prioritaire', +1, -2.00, M_R, 212),
       ('LIG',  'libération de garde',              -1, -2.96, M_R, 250)]

def apparait(o, f0):
    for f in (1, f0 - 1, f0):
        o.hide_render = f < f0; o.hide_viewport = f < f0
        o.keyframe_insert('hide_render', frame=f)
        o.keyframe_insert('hide_viewport', frame=f)
    for fc in o.animation_data.action.fcurves:
        if 'hide' in fc.data_path:
            for kp in fc.keyframe_points:
                kp.interpolation = 'CONSTANT'

for nm, sub, sens, z, m, f0 in MSG:
    x0 = AX if sens > 0 else BX
    x1 = BX if sens > 0 else AX
    bpy.ops.object.empty_add(location=(x0, 0, z))
    e = bpy.context.object
    b = box(((x1 - x0) / 2, 0, 0), (abs(x1 - x0) - 0.5, 0.18, 0.15), m, bevel=0.02)
    b.parent = e
    bpy.ops.mesh.primitive_cone_add(radius1=0.22, depth=0.46, vertices=18,
                                    location=(x1 - x0 - 0.22 * sens, 0, 0))
    c = bpy.context.object
    c.rotation_euler = (0, sens * math.pi / 2, 0)
    c.data.materials.append(m); c.parent = e
    # le message se déploie depuis son central d'origine
    e.scale = (0.001, 1, 1); e.keyframe_insert('scale', frame=f0)
    e.scale = (1.0, 1, 1);   e.keyframe_insert('scale', frame=f0 + 26)
    for fc in e.animation_data.action.fcurves:
        if fc.data_path == 'scale':
            for kp in fc.keyframe_points:
                kp.interpolation = 'QUAD'; kp.easing = 'EASE_OUT'
    for o in (e, b, c):
        apparait(o, f0)
    # les libellés ne sont PAS enfants de l'empty : ils ne doivent pas s'étirer
    t  = label(nm,  (0, -0.26, z + 0.24), 0.30, m)
    t2 = label(sub, (0, -0.26, z - 0.34), 0.165, M_E)
    apparait(t, f0 + 20); apparait(t2, f0 + 24)

# la conversation, au milieu
cv = box((0, 0, -1.09), (5.4, 0.16, 0.52), M_J, bevel=0.04)
lt = label('CONVERSATION', (0, -0.22, -1.18), 0.26, M_E)
for o in (cv, lt):
    for f in (1, 171, 172):
        o.hide_render = f < 172; o.hide_viewport = f < 172
        o.keyframe_insert('hide_render', frame=f)
        o.keyframe_insert('hide_viewport', frame=f)
    for fc in o.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = 'CONSTANT'

lights(key=(-7, -10, 8), kE=1100, fill=(8, -7, -2), fE=380)
piv, cam = camera(sc, (0, -15.0, 0.0), 38, -3.5, 3.5, NF, target=(0, 0, 0.6))
# la caméra descend le long de l'échelle au fur et à mesure
# l'échelle entière tient dans le cadre : on ne descend pas, on se rapproche
for f, (y, z, tz) in ((1, (-18.8, 0.7, 0.8)), (int(NF * .55), (-17.5, 0.3, 0.4)),
                      (NF, (-16.7, 0.0, 0.0))):
    cam.location = (0, y, z); cam.keyframe_insert('location', frame=f)
    piv.location = (0, 0, tz); piv.keyframe_insert('location', frame=f)
for ob in (cam, piv):
    for fc in ob.animation_data.action.fcurves:
        if fc.data_path == 'location':
            for kp in fc.keyframe_points:
                kp.interpolation = 'SINE'; kp.easing = 'EASE_IN_OUT'
# les textes ne projettent pas d'ombre : sinon le fond se couvre de
# doublons fantômes de chaque étiquette.
# page plate : aucune ombre portée. Le relief vient des biseaux.
for ob in bpy.data.objects:
    if ob.type in ('FONT', 'MESH'):
        ob.visible_shadow = False

render(sc, OUT, NF, FRAMES)
