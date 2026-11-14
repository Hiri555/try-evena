# Look « cahier » : maquettes mates posées sur une page crème, lumière de studio.
import bpy, math, os

def sr(r, g, b):
    """sRGB 0-255 -> linéaire, pour que la couleur rendue soit bien celle du nuancier."""
    def f(c):
        c /= 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (f(r), f(g), f(b))

PAPIER = sr(0xED, 0xE4, 0xD2)
PAPIER2= sr(0xE2, 0xD6, 0xBE)
ENCRE  = sr(0x1C, 0x2B, 0x33)
ENCRE2 = sr(0x45, 0x57, 0x5F)
ROUGE  = sr(0xC8, 0x41, 0x2B)
BLEU   = sr(0x1F, 0x5F, 0x8B)
BLEUL  = sr(0x3C, 0x87, 0xB8)
JAUNE  = sr(0xF2, 0xC1, 0x4E)
VERT   = sr(0x4A, 0x7C, 0x59)
GRIS   = sr(0x9F, 0xB6, 0xC2)
# anciens noms, pour ne pas casser les scènes
NUIT, CREME, VOIX, SIG, OR, STEEL = PAPIER, ENCRE, ROUGE, BLEU, JAUNE, GRIS

def boot(W, H, SAMP):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
    sc.cycles.samples = SAMP; sc.cycles.use_denoising = False
    sc.render.resolution_x, sc.render.resolution_y = W, H
    sc.view_settings.view_transform = 'Standard'     # couleurs franches, look sérigraphie
    sc.view_settings.look = 'None'
    sc.view_settings.exposure = 0.0
    w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True
    w.node_tree.nodes['Background'].inputs[0].default_value = (*PAPIER, 1)
    w.node_tree.nodes['Background'].inputs[1].default_value = 0.62
    return sc

def sol(z=-0.01, size=90, dims=None, center=(0, 0)):
    """la feuille sur laquelle tout est posé : reçoit les ombres douces.
       dims=(largeur, hauteur) pour une feuille finie dont on voit les bords."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=(center[0], center[1], z))
    o = bpy.context.object
    w, h = dims if dims else (size, size)
    o.scale = (w, h, 1); bpy.ops.object.transform_apply(scale=True)
    m = bpy.data.materials.new('page'); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*PAPIER, 1)
    b.inputs['Roughness'].default_value = 0.92
    b.inputs['Specular IOR Level'].default_value = 0.08
    o.data.materials.append(m)
    return o

def mat(name, rgb, emit=0.0, rough=0.78, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rgb, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    b.inputs['Specular IOR Level'].default_value = 0.16
    if emit and 'Emission Color' in b.inputs:
        b.inputs['Emission Color'].default_value = (*rgb, 1)
        b.inputs['Emission Strength'].default_value = emit
    return m

def tube(name, pts, m, r=0.05, cyclic=False):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, co in zip(sp.points, pts):
        p.co = (*co, 1)
    sp.use_cyclic_u = cyclic
    cu.bevel_depth = r; cu.bevel_resolution = 4
    o = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(o)
    o.data.materials.append(m)
    return o

def box(loc, size, m, bevel=0.03):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.scale = (size[0], size[1], size[2])
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.modifier_add(type='BEVEL')
    o.modifiers['Bevel'].width = bevel; o.modifiers['Bevel'].segments = 3
    o.data.materials.append(m)
    return o

def labelPlat(txt, loc, size, m, align='CENTER'):
    """texte couché à plat sur la page, comme imprimé dessus"""
    bpy.ops.object.text_add(location=loc)
    o = bpy.context.object; o.data.body = txt; o.data.size = size
    o.data.align_x = align; o.data.extrude = 0.0
    o.rotation_euler = (0, 0, 0)
    o.data.materials.append(m)
    return o

def label(txt, loc, size, m, align='CENTER', yaw=0.0):
    bpy.ops.object.text_add(location=loc)
    o = bpy.context.object; o.data.body = txt; o.data.size = size
    o.data.align_x = align; o.data.extrude = 0.003
    o.rotation_euler = (math.pi / 2, 0, yaw)
    o.data.materials.append(m)
    return o

def lights(key=(-6, -9, 9), kE=900, fill=(7, -7, 3), fE=320):
    bpy.ops.object.light_add(type='AREA', location=key)
    k = bpy.context.object; k.data.energy = kE; k.data.size = 16
    k.rotation_euler = (math.radians(34), 0, math.radians(-30))
    bpy.ops.object.light_add(type='AREA', location=fill)
    f = bpy.context.object; f.data.energy = fE; f.data.size = 18
    f.data.color = (1.0, 0.97, 0.92)
    f.rotation_euler = (math.radians(62), 0, math.radians(46))

def camera(sc, loc, lens, yaw0, yaw1, NF, target=(0, 0, 0)):
    bpy.ops.object.empty_add(location=target)
    piv = bpy.context.object
    bpy.ops.object.camera_add(location=loc)
    cam = bpy.context.object; cam.data.lens = lens; cam.parent = piv
    con = cam.constraints.new('TRACK_TO'); con.target = piv
    con.track_axis = 'TRACK_NEGATIVE_Z'; con.up_axis = 'UP_Y'
    sc.camera = cam
    piv.rotation_euler = (0, 0, math.radians(yaw0)); piv.keyframe_insert('rotation_euler', frame=1)
    piv.rotation_euler = (0, 0, math.radians(yaw1)); piv.keyframe_insert('rotation_euler', frame=NF)
    for fc in piv.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = 'SINE'; kp.easing = 'EASE_IN_OUT'
    return piv, cam

def linear(ob):
    for fc in ob.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = 'LINEAR'

def render(sc, OUT, NF, FRAMES):
    sc.frame_start, sc.frame_end = 1, NF
    sc.render.filepath = OUT
    sc.render.image_settings.file_format = 'PNG'
    if '-' in FRAMES:
        a, b = FRAMES.split('-'); sc.frame_start, sc.frame_end = int(a), int(b)
        bpy.ops.render.render(animation=True)
    else:
        sc.frame_set(int(FRAMES)); bpy.ops.render.render(write_still=True)
