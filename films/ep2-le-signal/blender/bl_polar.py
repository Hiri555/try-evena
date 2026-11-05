# Polarisation circulaire : deux hélices contrarotatives sur le même axe.
# RHCP (ambre, horaire) et LHCP (sarcelle, antihoraire) ne se touchent jamais.
# blender -b -noaudio --factory-startup -P bl_polar.py
import bpy, math, os
from mathutils import Vector

OUT    = os.environ.get('OUT', '/tmp/pol_')
W, H   = int(os.environ.get('W', 960)), int(os.environ.get('H', 540))
SAMP   = int(os.environ.get('SAMP', 48))
NF     = int(os.environ.get('NF', 96))
FRAMES = os.environ.get('FRAMES', '1')

NUIT   = (0.045, 0.085, 0.160)
CREME  = (0.953, 0.925, 0.878)
AMBRE  = (0.788, 0.475, 0.165)
SARCEL = (0.230, 0.580, 0.555)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
sc.cycles.samples = SAMP; sc.cycles.use_denoising = False
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.view_settings.look = 'AgX - Medium High Contrast'

world = bpy.data.worlds.new('W'); sc.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (*NUIT, 1)
world.node_tree.nodes['Background'].inputs[1].default_value = 0.55


def mat(name, rgb, emit=1.0, rough=0.35):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rgb, 1)
    b.inputs['Roughness'].default_value = rough
    if 'Emission Color' in b.inputs:
        b.inputs['Emission Color'].default_value = (*rgb, 1)
        b.inputs['Emission Strength'].default_value = emit
    return m


M_A = mat('ambre', AMBRE, 2.6)
M_S = mat('sarcel', SARCEL, 2.2)
M_C = mat('creme', CREME, 1.2)
M_AX = mat('axe', (0.20, 0.30, 0.44), 0.35, 0.6)

LEN, R, TURNS, SEG = 7.6, 1.15, 3.0, 420


def helix(name, handed, m, radius=R, thick=0.055, phase=0.0):
    """handed = +1 (droite / RHCP) ou -1 (gauche / LHCP)"""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'
    sp = cu.splines.new('POLY'); sp.points.add(SEG - 1)
    for i in range(SEG):
        t = i / (SEG - 1)
        a = handed * (t * TURNS * 2 * math.pi) + phase
        sp.points[i].co = (t * LEN - LEN / 2, radius * math.cos(a), radius * math.sin(a), 1)
    cu.bevel_depth = thick; cu.bevel_resolution = 4
    o = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(o)
    o.data.materials.append(m)
    return o


# axe de propagation
cu = bpy.data.curves.new('axe', 'CURVE'); cu.dimensions = '3D'
sp = cu.splines.new('POLY'); sp.points.add(1)
sp.points[0].co = (-LEN / 2 - .5, 0, 0, 1); sp.points[1].co = (LEN / 2 + .7, 0, 0, 1)
cu.bevel_depth = 0.012
axe = bpy.data.objects.new('axe', cu); bpy.context.collection.objects.link(axe)
axe.data.materials.append(M_AX)

h_r = helix('RHCP', +1, M_A)
h_l = helix('LHCP', -1, M_S)

# le vecteur E, à la pointe de chaque hélice : une petite flèche radiale qui tourne
def tip(name, handed, m):
    bpy.ops.mesh.primitive_cone_add(radius1=0.10, depth=0.30, vertices=20,
                                    location=(LEN / 2, 0, R))
    o = bpy.context.object; o.name = name
    o.rotation_euler = (math.pi / 2, 0, 0)
    o.data.materials.append(m)
    return o


t_r, t_l = tip('tipR', +1, M_A), tip('tipL', -1, M_S)

# anneaux de repère aux deux bouts
for x in (-LEN / 2, LEN / 2):
    bpy.ops.mesh.primitive_torus_add(location=(x, 0, 0), major_radius=R,
                                     minor_radius=0.012, rotation=(0, math.pi / 2, 0))
    bpy.context.object.data.materials.append(M_AX)


FACE = math.radians(21)


def label(txt, loc, size, m, align='CENTER'):
    bpy.ops.object.text_add(location=loc)
    o = bpy.context.object; o.data.body = txt; o.data.size = size
    o.data.align_x = align; o.data.extrude = 0.004
    o.rotation_euler = (math.pi / 2, 0, FACE)
    o.data.materials.append(m)
    return o


label('RHCP',     (-LEN / 2 + 0.1, 0, 2.30), 0.40, M_A, 'LEFT')
label('vers la droite ↻', (-LEN / 2 + 0.1, 0, 1.86), 0.22, M_A, 'LEFT')
label('LHCP',     (-LEN / 2 + 0.1, 0, -2.10), 0.40, M_S, 'LEFT')
label('vers la gauche ↺', (-LEN / 2 + 0.1, 0, -2.54), 0.22, M_S, 'LEFT')
label('MÊME FRÉQUENCE  ·  DEUX CANAUX', (0.0, 0, -3.02), 0.28, M_C)

# lumière
bpy.ops.object.light_add(type='AREA', location=(-2.5, -6.5, 4.5))
k = bpy.context.object; k.data.energy = 1100; k.data.size = 7
k.rotation_euler = (math.radians(40), 0, math.radians(-22))
bpy.ops.object.light_add(type='AREA', location=(4.5, -5.0, -2.5))
f = bpy.context.object; f.data.energy = 380; f.data.size = 8
f.data.color = (1.0, 0.74, 0.46); f.rotation_euler = (math.radians(112), 0, math.radians(38))

# caméra : de profil vers l'axe, pour voir les deux cercles opposés
bpy.ops.object.empty_add(location=(0, 0, 0))
piv = bpy.context.object
bpy.ops.object.camera_add(location=(0, -14.8, 3.9))
cam = bpy.context.object; cam.data.lens = 46; cam.parent = piv
con = cam.constraints.new('TRACK_TO'); con.target = piv
con.track_axis = 'TRACK_NEGATIVE_Z'; con.up_axis = 'UP_Y'
sc.camera = cam

# animation : les hélices défilent (phase), la caméra pivote vers l'axe
for ob, handed in ((h_r, +1), (h_l, -1)):
    ob.rotation_euler = (0, 0, 0); ob.keyframe_insert('rotation_euler', frame=1)
    ob.rotation_euler = (handed * math.radians(360), 0, 0)
    ob.keyframe_insert('rotation_euler', frame=NF)
    for fc in ob.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = 'LINEAR'
for ob, handed in ((t_r, +1), (t_l, -1)):
    for fr, ang in ((1, 0), (NF, handed * 360)):
        ob.location = (LEN / 2, R * math.sin(math.radians(ang)) * -1, R * math.cos(math.radians(ang)))
        ob.keyframe_insert('location', frame=fr)

piv.rotation_euler = (0, 0, math.radians(14)); piv.keyframe_insert('rotation_euler', frame=1)
piv.rotation_euler = (0, 0, math.radians(28)); piv.keyframe_insert('rotation_euler', frame=NF)
for fc in piv.animation_data.action.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = 'SINE'; kp.easing = 'EASE_IN_OUT'

sc.frame_start, sc.frame_end = 1, NF
sc.render.filepath = OUT
sc.render.image_settings.file_format = 'PNG'
if '-' in FRAMES:
    a, b = FRAMES.split('-'); sc.frame_start, sc.frame_end = int(a), int(b)
    bpy.ops.render.render(animation=True)
else:
    sc.frame_set(int(FRAMES)); bpy.ops.render.render(write_still=True)
