# Bruitage « cahier » : plume, surligneur, tampon, papier, déclics de relais.
import numpy as np, json, os, wave

SR = 48000
BASE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(BASE, '..', 'timeline.json')))
B = TL['starts']
TOT = TL['total'] + 1.0
buf = np.zeros((int(TOT * SR), 2), dtype=np.float32)

rng = np.random.default_rng(7)

def env(n, a, d, p=2.0):
    e = np.ones(n)
    na, nd = max(1, int(a * SR)), max(1, int(d * SR))
    e[:na] = np.linspace(0, 1, na) ** 0.6
    k = min(nd, n)
    e[n - k:] = np.linspace(1, 0, k) ** p
    return e

def place(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    n = len(sig)
    if i < 0 or i >= len(buf): return
    n = min(n, len(buf) - i)
    l, r = gain * (1 - max(0, pan)), gain * (1 + min(0, pan))
    buf[i:i + n, 0] += sig[:n] * l
    buf[i:i + n, 1] += sig[:n] * r

def bp(x, f0, f1, order=2):
    """passe-bande simple par variable d'état, appliqué deux fois"""
    y = x.copy()
    for _ in range(order):
        lo = np.zeros_like(y); band = np.zeros_like(y)
        fc = 2 * np.sin(np.pi * np.clip(f0, 20, SR / 2.2) / SR)
        q = 0.7
        l = b = 0.0
        for i in range(len(y)):
            h = y[i] - l - q * b
            b = fc * h + b
            l = fc * b + l
            band[i] = b
        y = band
    # coupe-haut grossier
    a = np.exp(-2 * np.pi * np.clip(f1, 40, SR / 2.2) / SR)
    out = np.zeros_like(y); prev = 0.0
    for i in range(len(y)):
        prev = (1 - a) * y[i] + a * prev
        out[i] = prev
    return out

def noise(d):
    return rng.standard_normal(int(d * SR)).astype(np.float32)

# --- la plume qui écrit : bruit filtré, modulé, légèrement irrégulier
def plume(d=0.5, g=1.0):
    n = noise(d)
    m = 1 + 0.6 * np.sin(np.linspace(0, d * 54, len(n))) * rng.uniform(.6, 1.2)
    y = bp(n * m, 2200, 6500) * env(len(n), 0.02, d * .7, 1.4)
    return (y / (np.max(np.abs(y)) + 1e-9) * 0.22 * g).astype(np.float32)

# --- le surligneur : plus grave, plus large
def surligneur(d=0.42, g=1.0):
    n = noise(d)
    y = bp(n, 700, 2600) * env(len(n), 0.015, d * .8, 1.2)
    return (y / (np.max(np.abs(y)) + 1e-9) * 0.26 * g).astype(np.float32)

# --- feuille de papier qu'on pose / qu'on tourne
def papier(d=0.55, g=1.0):
    n = noise(d)
    sw = np.linspace(1400, 500, len(n))
    y = bp(n, 1200, 5200) * env(len(n), 0.01, d * .85, 1.8)
    y *= (0.4 + 0.6 * np.linspace(1, 0, len(n)) ** .5)
    return (y / (np.max(np.abs(y)) + 1e-9) * 0.30 * g).astype(np.float32)

# --- déclic de relais
def declic(g=1.0):
    d = 0.045
    n = noise(d)
    y = bp(n, 2600, 9000) * env(len(n), 0.0008, d, 3.2)
    t = np.linspace(0, d, len(n))
    y += 0.5 * np.sin(2 * np.pi * 1850 * t) * env(len(n), 0.0005, d * .5, 5)
    return (y / (np.max(np.abs(y)) + 1e-9) * 0.20 * g).astype(np.float32)

# --- tampon encreur : un coup mat
def tampon(g=1.0):
    d = 0.30
    t = np.linspace(0, d, int(d * SR))
    y = (np.sin(2 * np.pi * 110 * t) + 0.6 * np.sin(2 * np.pi * 62 * t)) * env(len(t), 0.001, d, 3.0)
    y += bp(noise(d), 900, 4200) * env(len(t), 0.001, d * .35, 3.5) * 1.4
    return (y / (np.max(np.abs(y)) + 1e-9) * 0.34 * g).astype(np.float32)

# --- petit « pop » : apparition d'un élément
def pop(f=560, g=1.0):
    d = 0.14
    t = np.linspace(0, d, int(d * SR))
    f0 = f * (1 + 0.5 * np.exp(-t * 40))
    y = np.sin(2 * np.pi * np.cumsum(f0) / SR) * env(len(t), 0.002, d, 3.0)
    return (y * 0.16 * g).astype(np.float32)

# --- validation : deux notes montantes
def juste(g=1.0):
    d = 0.6
    t = np.linspace(0, d, int(d * SR))
    y = np.zeros_like(t)
    for k, (f, s) in enumerate([(784, 0.0), (1175, 0.11)]):
        i = int(s * SR)
        tt = t[:len(t) - i]
        seg = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) \
              * env(len(tt), 0.004, len(tt) / SR, 2.4)
        y[i:] += seg
    return (y / (np.max(np.abs(y)) + 1e-9) * 0.17 * g).astype(np.float32)

# --- erreur : une note qui tombe
def faux(g=1.0):
    d = 0.5
    t = np.linspace(0, d, int(d * SR))
    f0 = np.linspace(420, 190, len(t))
    y = (np.sin(2 * np.pi * np.cumsum(f0) / SR)
         + 0.4 * np.sin(2 * np.pi * np.cumsum(f0 * 1.5) / SR)) * env(len(t), 0.004, d, 2.0)
    return (y / (np.max(np.abs(y)) + 1e-9) * 0.19 * g).astype(np.float32)

# --- souffle de transition
def souffle(d=0.8, g=1.0):
    n = noise(d)
    y = bp(n, 400, 3000) * env(len(n), d * .45, d * .55, 1.6)
    return (y / (np.max(np.abs(y)) + 1e-9) * 0.17 * g).astype(np.float32)

# --- la chute dans la poubelle
def chute(g=1.0):
    d = 0.75
    t = np.linspace(0, d, int(d * SR))
    f0 = np.linspace(520, 120, len(t))
    y = np.sin(2 * np.pi * np.cumsum(f0) / SR) * env(len(t), 0.01, d, 1.4) * 0.6
    y[int(.62 * SR):] += tampon(0.8)[:len(t) - int(.62 * SR)] * 1.1
    return (y / (np.max(np.abs(y)) + 1e-9) * 0.24 * g).astype(np.float32)

# ═══════════ les repères ═══════════
def at(ch, t): return B[ch] + t

C = []
def cue(ch, t, sig, g=1.0, pan=0.0): C.append((at(ch, t), sig, g, pan))

# CH0
for i in range(9): cue(0, 0.80 + i * 0.19, declic(0.5), pan=(i % 3 - 1) * .3)
cue(0, 4.50, plume(0.85, 1.0), pan=-.2)
cue(0, 5.45, plume(0.55, 0.7), pan=.2)
cue(0, 7.75, juste(0.8))
cue(0, 13.90, papier(0.7, 1.0))
cue(0, 15.15, plume(1.2, 0.8), pan=.1)
# CH1
cue(1, 1.45, plume(1.0, 0.9), pan=-.25)
for i in range(4): cue(1, 5.6 + i * 2.1, pop(300, 0.6), pan=-.3 + i * .2)
for i in range(3): cue(1, 9.3 + i * 1.7, papier(0.4, 0.55), pan=.3 - i * .2)
for i, t in enumerate((12.65, 14.35, 16.25)): cue(1, t, plume(0.7, 0.85), pan=-.15 + i * .15)
cue(1, 19.65, papier(0.65, 1.0))
for i, t in enumerate((23.45, 25.05, 26.65)): cue(1, t, surligneur(0.40, 1.0), pan=-.2 + i * .2)
cue(1, 31.45, pop(680, 0.9))
cue(1, 35.65, plume(1.4, 0.8), pan=-.2)
for i, t in enumerate((37.65, 39.25, 40.85)): cue(1, t, declic(0.8), pan=-.3 + i * .3)
cue(1, 45.05, tampon(1.0))
cue(1, 48.45, pop(520, 0.9), pan=.35)
# CH2
cue(2, 1.55, plume(0.9, 0.9), pan=-.2)
cue(2, 4.05, papier(0.5, 0.8))
cue(2, 8.65, plume(1.5, 0.85), pan=-.15)
cue(2, 12.45, plume(0.9, 0.7), pan=.15)
cue(2, 22.45, pop(420, 0.8), pan=-.3); cue(2, 24.65, pop(360, 0.8), pan=-.3)
cue(2, 29.25, souffle(0.9, 1.0))
cue(2, 46.25, plume(1.0, 0.75), pan=.1)
cue(2, 53.45, pop(600, 0.7))
cue(2, 55.10, chute(0.9))
cue(2, 57.45, faux(1.0))
# CH3
cue(3, 3.05, souffle(0.9, 1.0))
cue(3, 10.45, tampon(0.95))
cue(3, 14.25, pop(500, 0.8), pan=-.3)
cue(3, 17.45, declic(0.7), pan=.2)
cue(3, 24.65, juste(1.0))
# CH4
cue(4, 1.35, plume(1.1, 0.9), pan=-.2)
cue(4, 2.25, declic(0.9), pan=-.4); cue(4, 8.85, declic(0.9), pan=0)
cue(4, 11.65, faux(0.95))
cue(4, 14.25, plume(0.9, 0.8))
cue(4, 21.25, plume(0.8, 0.7), pan=.1)
cue(4, 24.45, surligneur(0.40, 1.0))
for i in range(26): cue(4, 26.45 + i * 0.152, declic(0.34), pan=-.35 + i * .028)
cue(4, 30.65, faux(1.0))
cue(4, 34.65, souffle(0.7, 0.9))
cue(4, 36.05, juste(1.0))
cue(4, 41.85, pop(640, 0.8))
# CH5
cue(5, 1.45, pop(420, 0.9), pan=-.25)
cue(5, 5.65, tampon(0.95))
cue(5, 8.65, pop(360, 0.9), pan=-.25)
cue(5, 15.85, surligneur(0.45, 1.0))
cue(5, 17.45, souffle(0.6, 0.7), pan=.2)
cue(5, 19.45, chute(1.0), pan=.35)
cue(5, 21.45, plume(1.0, 0.75), pan=-.1)
cue(5, 32.25, plume(0.8, 0.8))
for i in range(16): cue(5, 33.1 + i * 0.27, declic(0.30), pan=-.2 + i * .025)
cue(5, 40.05, pop(520, 0.9), pan=.3)
# CH6
cue(6, 1.25, plume(1.3, 0.8), pan=-.1)
cue(6, 8.85, souffle(0.7, 0.9))
cue(6, 13.45, juste(0.95))
cue(6, 17.05, plume(0.9, 0.75), pan=.1)
cue(6, 27.95, souffle(0.7, 0.9))
for i, t in enumerate((33.4, 34.9, 36.0)): cue(6, t, declic(0.8), pan=-.3 + i * .3)
cue(6, 36.45, faux(1.0))
cue(6, 45.95, souffle(0.7, 0.9))
for i, t in enumerate((49.3, 50.3, 51.3)): cue(6, t, declic(0.8), pan=-.2 + i * .2)
cue(6, 51.45, juste(1.05))
cue(6, 54.65, pop(520, 0.9), pan=.3)
# CH7
cue(7, 1.35, pop(700, 1.0))
for i, t in enumerate((4.85, 16.05, 19.45)): cue(7, t, declic(0.85), pan=-.3 + i * .3)
cue(7, 22.05, plume(0.9, 0.8))
for i in range(4): cue(7, 22.85 + i * 1.6, declic(0.6), pan=-.2 + i * .13)
cue(7, 33.45, souffle(0.7, 0.9))
cue(7, 40.05, plume(1.0, 0.8), pan=.1)
# CH8
cue(8, 4.45, souffle(0.9, 1.0))
for i in range(4): cue(8, 25.85 + i * 1.2, declic(0.7), pan=-.25 + i * .17)
cue(8, 37.05, juste(1.0))
# CH9
cue(9, 1.15, papier(0.7, 1.0))
for i, t in enumerate((2.65, 6.05, 11.05, 15.45, 20.25, 25.05, 29.45, 33.25)):
    cue(9, t, declic(0.55), pan=-.25 + i * .07)
cue(9, 39.45, plume(1.1, 0.8), pan=-.1)
cue(9, 45.65, souffle(0.8, 0.9))
cue(9, 50.05, juste(1.1))
cue(9, 50.45, plume(1.6, 0.9), pan=.1)

for t, sig, g, pan in C:
    place(sig, t, g, pan)

peak = np.max(np.abs(buf))
buf *= 0.72 / (peak + 1e-9)
out = os.path.join(BASE, 'sfx.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(buf, -1, 1) * 32767).astype('<i2').tobytes())
print(f'{len(C)} effets · {len(buf)/SR:.2f} s · crête {peak:.3f} -> {out}')
