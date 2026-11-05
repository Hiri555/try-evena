# La chaîne du répéteur : reçoit à 6 GHz, amplifie, convertit (−2225), réémet à 4 GHz.
# blender -b -noaudio --factory-startup -P bl_repeteur.py
import bpy, math, os
from mathutils import Vector

OUT    = os.environ.get('OUT', '/tmp/rep_')
W, H   = int(os.environ.get('W', 1920)), int(os.environ.get('H', 1080))
SAMP   = int(os.environ.get('SAMP', 24))
NF     = int(os.environ.get('NF', 144))
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


def mat(name, rgb, emit=1.0, rough=0.4, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rgb, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if 'Emission Color' in b.inputs:
        b.inputs['Emission Color'].default_value = (*rgb, 1)
        b.inputs['Emission Strength'].default_value = emit
    return m


M_A  = mat('ambre', AMBRE, 2.6)
M_S  = mat('sarcel', SARCEL, 2.4)
M_C  = mat('creme', CREME, 1.3)
M_BX = mat('boite', (0.11, 0.17, 0.26), 0.22, 0.45, 0.25)
M_ED = mat('arete', CREME, 1.0)

BOXES = [(-2.6, 'RÉCEPTION'), (0.0, 'AMPLIFICATION'), (2.6, 'CONVERSION')]
BW, BH, BD = 1.7, 1.25, 1.25


def box(x):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0, 0))
    o = bpy.context.object; o.scale = (BW / 2, BD / 2, BH / 2)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.modifier_add(type='BEVEL')
    o.modifiers['Bevel'].width = 0.035; o.modifiers['Bevel'].segments = 3
    o.data.materials.append(M_BX)
    # arête lumineuse en bas de la boîte
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, -BD / 2 - 0.005, -BH / 2 + 0.03))
    e = bpy.context.object; e.scale = (BW / 2, 0.012, 0.018)
    bpy.ops.object.transform_apply(scale=True)
    e.data.materials.append(M_ED)
    return o


for x, _ in BOXES:
    box(x)


def tube(name, pts, m, r=0.052):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, co in zip(sp.points, pts):
        p.co = (*co, 1)
    cu.bevel_depth = r; cu.bevel_resolution = 4
    o = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(o)
    o.data.materials.append(m)
    return o


# porteuse montante : sinusoïde serrée (6 GHz) qui entre par la gauche
up = [(-7.4 + i * 0.045, 0, 0.42 * math.sin(i * 0.55)) for i in range(int(4.0 / 0.045))]
tube('up', up, M_A)
# porteuse descendante : sinusoïde plus lâche (4 GHz) qui sort à droite
dn = [(3.45 + i * 0.045, 0, 0.42 * math.sin(i * 0.37)) for i in range(int(4.0 / 0.045))]
tube('dn', dn, M_S)
# liaisons internes entre les boîtes
for x0, x1 in ((-1.75, -0.85), (0.85, 1.75)):
    tube(f'lk{x0}', [(x0, 0, 0), (x1, 0, 0)], M_C, r=0.032)

# la bille d'énergie qui parcourt la chaîne
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.155, location=(-7.4, -0.78, 0))
bead = bpy.context.object
bpy.ops.object.shade_smooth()
bead.data.materials.append(mat('bille', (1.0, 0.92, 0.80), 9.0))


def label(txt, loc, size, m, align='CENTER'):
    bpy.ops.object.text_add(location=loc)
    o = bpy.context.object; o.data.body = txt; o.data.size = size
    o.data.align_x = align; o.data.extrude = 0.004
    o.rotation_euler = (math.pi / 2, 0, 0)
    o.data.materials.append(m)
    return o


for x, nm in BOXES:
    label(nm, (x, -BD / 2 - 0.02, -1.08), 0.185, M_C)
label('6 000 MHz', (-5.3, 0, 0.95), 0.30, M_A)
label('MONTANTE',  (-5.3, 0, 0.60), 0.17, M_A)
label('4 000 MHz', (5.4, 0, 0.95), 0.30, M_S)
label('DESCENDANTE', (5.4, 0, 0.60), 0.17, M_S)
label('— 2225 MHz', (2.6, -BD / 2 - 0.02, 1.08), 0.24, M_C)

bpy.ops.object.light_add(type='AREA', location=(-3.0, -7.0, 5.0))
k = bpy.context.object; k.data.energy = 1500; k.data.size = 8
k.rotation_euler = (math.radians(36), 0, math.radians(-24))
bpy.ops.object.light_add(type='AREA', location=(5.0, -5.5, -2.0))
f = bpy.context.object; f.data.energy = 450; f.data.size = 8
f.data.color = (1.0, 0.75, 0.48); f.rotation_euler = (math.radians(108), 0, math.radians(40))

bpy.ops.object.empty_add(location=(0, 0, 0))
piv = bpy.context.object
bpy.ops.object.camera_add(location=(0, -17.6, 1.05))
cam = bpy.context.object; cam.data.lens = 40; cam.parent = piv
con = cam.constraints.new('TRACK_TO'); con.target = piv
con.track_axis = 'TRACK_NEGATIVE_Z'; con.up_axis = 'UP_Y'
sc.camera = cam

# la bille traverse ; la caméra dérive doucement
bead.location = (-7.4, -0.78, 0); bead.keyframe_insert('location', frame=1)
bead.location = (7.4, -0.78, 0);  bead.keyframe_insert('location', frame=NF)
for fc in bead.animation_data.action.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = 'LINEAR'
piv.rotation_euler = (0, 0, math.radians(-9)); piv.keyframe_insert('rotation_euler', frame=1)
piv.rotation_euler = (0, 0, math.radians(9));  piv.keyframe_insert('rotation_euler', frame=NF)
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
