# La trame MIC posée sur la page : 32 intervalles. IT0 synchro, IT16 signalisation,
# 30 pour la parole. Un surligneur jaune balaie la trame.
import bpy, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bl_common import *

OUT    = os.environ.get('OUT', '/tmp/mic_')
W, H   = int(os.environ.get('W', 1920)), int(os.environ.get('H', 1080))
SAMP   = int(os.environ.get('SAMP', 32))
NF     = int(os.environ.get('NF', 144))
FRAMES = os.environ.get('FRAMES', '1')

sc = boot(W, H, SAMP)
M_V  = mat('voix', ROUGE)
M_S  = mat('sig',  BLEU)
M_J  = mat('jaune', JAUNE)
M_E  = mat('encre', ENCRE, rough=0.85)
M_GH = mat('ghost', sr(0xC2, 0xC9, 0xC4), rough=0.9)

N, PW, GAP, DP = 32, 0.30, 0.042, 0.52
PITCH = PW + GAP
SPAN  = N * PITCH
x0    = -SPAN / 2 + PITCH / 2
def X(i): return x0 + i * PITCH

sol(z=-0.16, dims=(15.6, 8.4), center=(0, 0.9))

for i in range(N):
    if   i == 0:  box((X(i), 0, 0.00), (PW, DP, 0.30), M_J, 0.012)
    elif i == 16: box((X(i), 0, 0.42), (PW, DP, 0.86), M_S, 0.012)
    else:         box((X(i), 0, 0.00), (PW, DP, 0.30), M_V, 0.012)

for k in range(1, 6):                                   # la multitrame, en retrait
    box((0, 0.58 * k, -0.025 * k), (SPAN, 0.24, 0.09), M_GH, 0.01)
    box((X(16), 0.58 * k, 0.30 - 0.025 * k), (PW, 0.24, 0.58), M_GH, 0.01)

bpy.ops.mesh.primitive_cube_add(size=1, location=(X(0), -0.06, 0.40))
sw = bpy.context.object; sw.scale = (PW * 1.5, DP * 1.12, 0.055)
bpy.ops.object.transform_apply(scale=True)
sw.data.materials.append(mat('surligneur', JAUNE, emit=0.9))
sw.location = (X(0), -0.06, 0.40);      sw.keyframe_insert('location', frame=1)
sw.location = (X(N - 1), -0.06, 0.40);  sw.keyframe_insert('location', frame=NF)
linear(sw)

label('IT 16',            (X(16), -0.40, 1.58), 0.26,  M_S)
label('LA SIGNALISATION', (X(16), -0.40, 1.26), 0.165, M_S)
labelPlat('IT 0',            (X(0) - 0.12, -1.02, -0.15), 0.21, M_J, 'LEFT')
labelPlat('synchronisation', (X(0) - 0.12, -1.42, -0.15), 0.155, M_E, 'LEFT')
labelPlat('30 INTERVALLES DE PAROLE', (0.9, -2.10, -0.15), 0.26, M_V)
labelPlat('MIC E1  ·  2048 kbit/s  ·  un IT = 64 kbit/s', (0.9, -2.64, -0.15), 0.20, M_E)
label('15 trames = 1 multitrame', (SPAN / 2 + 0.25, 1.9, 0.26), 0.20, M_E, 'LEFT')

lights(key=(-7, -10, 10), kE=1100, fill=(8, -7, 3), fE=380)
camera(sc, (0, -13.0, 4.4), 33, -8, 7, NF, target=(0, 0.1, -0.05))
render(sc, OUT, NF, FRAMES)
