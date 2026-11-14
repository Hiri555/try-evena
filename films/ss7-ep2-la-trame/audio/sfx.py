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

# CH0 · accroche
cue(0, 0.75, plume(1.1, 0.8), pan=-.2)
for i in range(10): cue(0, 4.3 + i * 0.21, declic(0.45), pan=(i % 3 - 1) * .3)
cue(0, 12.9, papier(0.7, 1.0))
cue(0, 14.2, plume(1.1, 0.8), pan=.1)
# CH1 · la LSD et le canal
cue(1, 1.25, plume(1.3, 0.85), pan=-.15)
cue(1, 8.45, plume(0.9, 0.7), pan=.1)
for i, t in enumerate((21.5, 24.5, 29.5)): cue(1, t, pop(360 + i * 90, 0.85), pan=-.25 + i * .25)
cue(1, 36.45, papier(0.65, 1.0))
cue(1, 45.25, plume(1.0, 0.75), pan=-.1)
cue(1, 57.85, surligneur(0.42, 0.9))
for i in range(5): cue(1, 58.5 + i * 0.5, declic(0.6), pan=-.3 + i * .15)
# CH2 · anatomie
cue(2, 1.65, plume(1.0, 0.8))
cue(2, 9.05, souffle(0.9, 1.0))
cue(2, 25.45, plume(1.0, 0.75), pan=.1)
cue(2, 34.25, surligneur(0.45, 0.9))
for i in range(6): cue(2, 34.7 + i * 0.55, declic(0.7), pan=-.35 + i * .14)
cue(2, 40.65, tampon(0.95))
# CH3 · l'INL
cue(3, 1.45, plume(0.9, 0.8))
for i in range(8): cue(3, 1.6 + i * 0.13, declic(0.4), pan=-.3 + i * .08)
cue(3, 5.05, faux(0.7))
for i, t in enumerate((11.3, 20.5, 29.5)): cue(3, t, pop(400 + i * 80, 0.9), pan=-.2 + i * .2)
cue(3, 38.85, pop(540, 0.9), pan=.3)
cue(3, 42.65, plume(1.0, 0.75), pan=-.1)
# CH4 · fanion et bourrage
cue(4, 1.45, plume(0.9, 0.8))
for i in range(8): cue(4, 1.6 + i * 0.14, declic(0.45), pan=-.3 + i * .08)
cue(4, 5.45, tampon(0.9))
cue(4, 13.65, plume(0.8, 0.8), pan=-.2)
cue(4, 24.05, plume(0.9, 0.8), pan=.1)
cue(4, 26.25, pop(820, 1.0))
cue(4, 31.45, juste(0.9))
cue(4, 37.05, plume(1.2, 0.8))
# CH5 · le CRT
cue(5, 1.35, plume(1.2, 0.8))
cue(5, 10.65, pop(380, 0.85), pan=-.35)
cue(5, 14.65, pop(460, 0.85), pan=.35)
cue(5, 18.65, juste(0.95))
cue(5, 24.05, plume(1.0, 0.75), pan=.1)
cue(5, 36.45, papier(0.7, 1.0))
cue(5, 44.45, surligneur(0.42, 0.9))
# CH6 · BIR BIA NSA NSR
cue(6, 1.35, plume(1.1, 0.8))
for i, t in enumerate((11.1, 19.5, 27.1, 29.9)): cue(6, t, pop(340 + i * 80, 0.9), pan=-.3 + i * .2)
cue(6, 32.45, souffle(0.9, 1.0))
cue(6, 51.05, surligneur(0.46, 1.0))
cue(6, 52.25, juste(0.9))
cue(6, 57.05, faux(0.9))
cue(6, 64.65, tampon(1.0))
# CH7 · base ou cyclique
cue(7, 1.45, pop(380, 0.85), pan=-.35)
cue(7, 8.05, pop(460, 0.85), pan=.35)
cue(7, 20.65, tampon(0.95))
for i in range(20): cue(7, 23.9 + i * 0.13, declic(0.32), pan=-.35 + i * .035)
cue(7, 27.45, juste(0.8))
for i in range(10): cue(7, 34.9 + i * 0.26, declic(0.38), pan=-.3 + i * .06)
cue(7, 37.5, faux(0.9))
cue(7, 39.45, souffle(0.6, 0.8))
cue(7, 42.05, juste(0.95))
for i in range(20): cue(7, 47.5 + i * 0.15, declic(0.32), pan=-.35 + i * .035)
cue(7, 50.6, faux(1.0))
cue(7, 55.05, souffle(0.7, 0.9))
cue(7, 59.65, faux(1.0))
cue(7, 64.25, pop(620, 0.9))
# CH8 · supervision et alignement
cue(8, 1.45, tampon(1.0))
cue(8, 10.65, plume(1.0, 0.75), pan=-.1)
cue(8, 23.65, pop(420, 0.85), pan=-.3)
for i in range(6): cue(8, 33.7 + i * 1.4, declic(0.7), pan=-.3 + i * .12)
cue(8, 45.65, juste(0.9))
# CH9 · le niveau 3
cue(9, 1.45, plume(1.1, 0.8), pan=-.1)
for i, t in enumerate((11.7, 15.7, 36.9)): cue(9, t, pop(380 + i * 80, 0.9), pan=-.25 + i * .25)
cue(9, 21.45, plume(1.0, 0.75), pan=.1)
cue(9, 27.05, souffle(0.6, 0.8))
for i in range(5): cue(9, 46.7 + i * 1.9, declic(0.65), pan=-.3 + i * .14)
cue(9, 58.85, surligneur(0.44, 0.9))
cue(9, 62.45, surligneur(0.48, 0.9))
# CH10 · le MIA et l'appel
cue(10, 1.45, plume(1.2, 0.8))
cue(10, 12.65, papier(0.7, 1.0))
cue(10, 20.65, plume(1.0, 0.75), pan=.1)
cue(10, 33.45, souffle(0.9, 1.0))
cue(10, 56.85, surligneur(0.46, 0.9))
for i in range(6): cue(10, 57.5 + i * 0.55, declic(0.68), pan=-.3 + i * .12)
# CH11 · la fiche
cue(11, 1.15, papier(0.7, 1.0))
for i, t in enumerate((2.7, 7.5, 13.3, 19.1, 24.7, 30.3, 36.5, 42.7, 47.7, 51.5)):
    cue(11, t, declic(0.52), pan=-.25 + i * .055)
cue(11, 58.65, souffle(0.8, 0.9))
cue(11, 69.05, juste(1.1))
cue(11, 69.45, plume(1.6, 0.9), pan=.1)

for t, sig, g, pan in C:
    place(sig, t, g, pan)

peak = np.max(np.abs(buf))
buf *= 0.72 / (peak + 1e-9)
out = os.path.join(BASE, 'sfx.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(buf, -1, 1) * 32767).astype('<i2').tobytes())
print(f'{len(C)} effets · {len(buf)/SR:.2f} s · crête {peak:.3f} -> {out}')
