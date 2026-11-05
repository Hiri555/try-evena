# Plan de fréquences bande C, en volume — le croisement fin-de-bande.
# blender -b -noaudio --factory-startup -P bl_crossing.py
import bpy, bmesh, math, os, sys
from mathutils import Vector

OUT    = os.environ.get('OUT', '/tmp/cross_')
W, H   = int(os.environ.get('W', 960)), int(os.environ.get('H', 540))
SAMP   = int(os.environ.get('SAMP', 48))
FRAMES = os.environ.get('FRAMES', '1')          # "1" ou "1-96"

# ── palette maison
NUIT   = (0.045, 0.085, 0.160)
CREME  = (0.953, 0.925, 0.878)
AMBRE  = (0.788, 0.475, 0.165)
SARCEL = (0.184, 0.490, 0.470)
BLEU   = (0.247, 0.376, 0.475)


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, rgb, emit=0.0, rough=0.42, metal=0.0, alpha=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rgb, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if 'Emission Color' in b.inputs:
        b.inputs['Emission Color'].default_value = (*rgb, 1)
        b.inputs['Emission Strength'].default_value = emit
    if alpha < 1.0:
        b.inputs['Alpha'].default_value = alpha
        m.blend_method = 'BLEND'
    return m


def block(name, x0, x1, y, z, h, d, m):
    """barre posée de x0 à x1"""
    bpy.ops.mesh.primitive_cube_add(size=1, location=((x0 + x1) / 2, y, z + h / 2))
    o = bpy.context.object; o.name = name
    o.scale = ((x1 - x0) / 2, d / 2, h / 2)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.modifier_add(type='BEVEL')
    o.modifiers['Bevel'].width = 0.012; o.modifiers['Bevel'].segments = 3
    o.data.materials.append(m)
    return o


def ribbon(name, p0, p1, bulge, m, width=0.07, steps=48):
    """ruban courbe de p0 à p1, passant par un ventre — la flèche de translation"""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(2)
    mid = (Vector(p0) + Vector(p1)) / 2 + Vector(bulge)
    for bp, co in zip(sp.bezier_points, (p0, mid, p1)):
        bp.co = co; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    cu.bevel_depth = width / 2; cu.bevel_resolution = 4; cu.resolution_u = steps
    o = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(o)
    o.data.materials.append(m)
    return o


def label(txt, loc, size, m, align='CENTER', rot=(math.pi / 2, 0, 0)):
    bpy.ops.object.text_add(location=loc)
    o = bpy.context.object; o.data.body = txt; o.data.size = size
    o.data.align_x = align; o.data.extrude = 0.004
    o.rotation_euler = rot
    o.data.materials.append(m)
    return o


# ───────────────────────────────────────────────────────── scène
clear()
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = SAMP
sc.cycles.use_denoising = False                 # build Ubuntu sans OpenImageDenoise
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.render.film_transparent = False
sc.view_settings.look = 'AgX - Medium High Contrast'

world = bpy.data.worlds.new('W'); sc.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (*NUIT, 1)
world.node_tree.nodes['Background'].inputs[1].default_value = 0.6

M = {
    'creme':  mat('creme',  CREME,  emit=0.9),
    'ambre':  mat('ambre',  AMBRE,  emit=2.4),
    'sarcel': mat('sarcel', SARCEL, emit=1.1),
    'bleu':   mat('bleu',   BLEU,   emit=0.5),
    'rail':   mat('rail',   (0.17, 0.26, 0.38), emit=0.22, rough=0.6),
    'txt':    mat('txt',    CREME,  emit=1.4),
    'txtA':   mat('txtA',   AMBRE,  emit=2.2),
}

SPAN = 7.0                       # largeur visuelle des deux rails
Y_UP, Z_UP = 0.0,  1.35          # rail montant
Y_DN, Z_DN = 0.0, -1.35          # rail descendant
BH, BD = 0.30, 0.52              # hauteur / profondeur des blocs

ux = lambda f: (f - 5850) / 800 * SPAN - SPAN / 2
dx = lambda f: (f - 3400) / 800 * SPAN - SPAN / 2

# rails
block('rail_up', -SPAN / 2 - .12, SPAN / 2 + .12, Y_UP, Z_UP - .05, .04, BD + .14, M['rail'])
block('rail_dn', -SPAN / 2 - .12, SPAN / 2 + .12, Y_DN, Z_DN - .05, .04, BD + .14, M['rail'])

# montante : début (75) · principale (500) · fin (225)
up_deb = block('up_deb', ux(5850), ux(5925), Y_UP, Z_UP, BH, BD, M['sarcel'])
up_pri = block('up_pri', ux(5925), ux(6425), Y_UP, Z_UP, BH, BD, M['creme'])
up_fin = block('up_fin', ux(6425), ux(6650), Y_UP, Z_UP, BH * 1.25, BD, M['ambre'])

# descendante : le bas vient de la FIN de la montante — c'est tout le piège
dn_fin = block('dn_fin', dx(3400), dx(3625), Y_DN, Z_DN, BH * 1.25, BD, M['ambre'])
dn_deb = block('dn_deb', dx(3625), dx(3700), Y_DN, Z_DN, BH, BD, M['sarcel'])
dn_pri = block('dn_pri', dx(3700), dx(4200), Y_DN, Z_DN, BH, BD, M['creme'])

mid = lambda a, b, f: (f(a) + f(b)) / 2

# translations droites −2225
for a, b, c, d, m in [(5925, 6425, 3700, 4200, 'creme'), (5850, 5925, 3625, 3700, 'sarcel')]:
    ribbon(f'tr_{a}', (mid(a, b, ux), Y_UP, Z_UP - .02), (mid(c, d, dx), Y_DN, Z_DN + BH + .02),
           (0, -0.45, 0), M[m], width=0.042)

# LE CROISEMENT : fin de bande montante → bas de bande descendante, −3025
ribbon('cross', (mid(6425, 6650, ux), Y_UP, Z_UP - .02),
       (mid(3400, 3625, dx), Y_DN, Z_DN + BH * 1.25 + .02),
       (0, -1.05, 0), M['ambre'], width=0.072)

# étiquettes
label('LIAISON MONTANTE', (-SPAN / 2, Y_UP, Z_UP + 0.95), 0.21, M['txt'], 'LEFT')
label('5850 — 6650 MHz', (SPAN / 2, Y_UP, Z_UP + 0.95), 0.17, M['txt'], 'RIGHT')
label('LIAISON DESCENDANTE', (-SPAN / 2, Y_DN, Z_DN - 0.62), 0.21, M['txt'], 'LEFT')
label('3400 — 4200 MHz', (SPAN / 2, Y_DN, Z_DN - 0.62), 0.17, M['txt'], 'RIGHT')
label('FIN DE BANDE', (mid(6425, 6650, ux), Y_UP, Z_UP + 0.52), 0.15, M['txtA'])
label('BAS DE BANDE', (mid(3400, 3625, dx), Y_DN, Z_DN - 0.30), 0.15, M['txtA'])
label('— 3025 MHz', (-2.55, -1.55, -0.52), 0.21, M['txtA'], 'CENTER')
label('— 2225 MHz', (1.95, -0.75, 0.46), 0.19, M['txt'], 'CENTER')

# lumière
bpy.ops.object.light_add(type='AREA', location=(-3.2, -5.0, 4.2))
k = bpy.context.object; k.data.energy = 900; k.data.size = 6
k.rotation_euler = (math.radians(38), 0, math.radians(-28))
bpy.ops.object.light_add(type='AREA', location=(5.0, -4.0, -1.5))
f = bpy.context.object; f.data.energy = 320; f.data.size = 7
f.data.color = (1.0, 0.72, 0.42)
f.rotation_euler = (math.radians(105), 0, math.radians(42))

# caméra en orbite lente autour du croisement
bpy.ops.object.empty_add(location=(0, 0, 0))
piv = bpy.context.object; piv.name = 'pivot'
bpy.ops.object.camera_add(location=(0.0, -15.5, 1.6))
cam = bpy.context.object; cam.data.lens = 50
cam.parent = piv
con = cam.constraints.new('TRACK_TO'); con.target = piv
con.track_axis = 'TRACK_NEGATIVE_Z'; con.up_axis = 'UP_Y'
sc.camera = cam

n = 96
piv.rotation_euler = (0, 0, math.radians(-11)); piv.keyframe_insert('rotation_euler', frame=1)
piv.rotation_euler = (0, 0, math.radians(9));   piv.keyframe_insert('rotation_euler', frame=n)
for fc in piv.animation_data.action.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = 'SINE'; kp.easing = 'EASE_IN_OUT'
sc.frame_start, sc.frame_end = 1, n

sc.render.filepath = OUT
sc.render.image_settings.file_format = 'PNG'
if '-' in FRAMES:
    a, b = FRAMES.split('-'); sc.frame_start, sc.frame_end = int(a), int(b)
    bpy.ops.render.render(animation=True)
else:
    sc.frame_set(int(FRAMES)); bpy.ops.render.render(write_still=True)
