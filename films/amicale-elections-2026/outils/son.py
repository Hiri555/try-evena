#!/usr/bin/env python3
"""Bande-son du teaser : chaque impact est posé sur une coupe du montage.

Tension 0 -> 9 s (drone, tic-tac, coups), DROP à 9 s (percussions 120 BPM),
dernier impact à 17 s, silence tenu jusqu'à 20 s.
"""
import numpy as np, wave, struct

SR = 48000
DUR = 20.4
N = int(SR * DUR)
mix = np.zeros(N, np.float64)

def pose(sig, t):
    i = int(t * SR)
    j = min(N, i + len(sig))
    if i < N:
        mix[i:j] += sig[: j - i]

def env(n, attaque, chute, puiss=2.0):
    a = int(attaque * SR); d = n - a
    e = np.ones(n)
    if a > 0: e[:a] = np.linspace(0, 1, a)
    e[a:] = np.linspace(1, 0, max(d, 1)) ** puiss
    return e

def sinus(f0, f1, dur, amp=1.0, courbe=3.0):
    n = int(dur * SR); t = np.linspace(0, dur, n, endpoint=False)
    f = f1 + (f0 - f1) * np.exp(-courbe * t / max(dur, 1e-6))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return amp * np.sin(ph)

def bruit(dur, amp=1.0, graine=0):
    rng = np.random.default_rng(graine)
    return amp * rng.standard_normal(int(dur * SR))

def passe_bas(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); p = 0.0
    for i in range(len(x)):
        p = (1 - a) * x[i] + a * p; y[i] = p
    return y

def passe_haut(x, fc):
    return x - passe_bas(x, fc)

# ---------- briques ----------
def boom(force=1.0, g=0):
    s = sinus(110, 38, 1.5, 0.95, 4.0) * env(int(1.5 * SR), 0.002, 1.0, 2.2)
    n = passe_bas(bruit(0.28, 1.0, g), 900) * env(int(0.28 * SR), 0.001, 1.0, 3.0) * 0.45
    out = s.copy(); out[: len(n)] += n
    return out * force

def kick(force=1.0):
    s = sinus(135, 48, 0.42, 1.0, 9.0) * env(int(0.42 * SR), 0.001, 1.0, 2.4)
    c = passe_bas(bruit(0.012, 1.0, 7), 4000) * env(int(0.012 * SR), 0.0, 1.0, 1.0) * 0.5
    s[: len(c)] += c
    return s * force

def clap(force=1.0, g=1):
    x = passe_haut(passe_bas(bruit(0.19, 1.0, g), 7000), 1400)
    return x * env(len(x), 0.001, 1.0, 3.2) * force * 0.75

def tom(f=150, dur=0.38, force=1.0):
    return sinus(f * 1.7, f * 0.75, dur, 1.0, 7.0) * env(int(dur * SR), 0.001, 1.0, 2.4) * force

def hat(force=1.0, g=2, dur=0.05):
    x = passe_haut(bruit(dur, 1.0, g), 8500)
    return x * env(len(x), 0.0005, 1.0, 3.0) * force * 0.5

def tic(force=1.0, g=3):
    x = passe_haut(passe_bas(bruit(0.02, 1.0, g), 6500), 2200)
    return x * env(len(x), 0.0, 1.0, 3.0) * force * 0.6

def riser(dur, force=1.0, g=5):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    b = bruit(dur, 1.0, g)
    # balayage du filtre vers l'aigu, en plusieurs bandes
    out = np.zeros(n)
    for k, (f0, f1, a) in enumerate([(300, 5200, 1.0), (900, 9000, .55), (120, 1800, .7)]):
        fc = f0 + (f1 - f0) * (t ** 2)
        y = np.zeros(n); p = 0.0
        for i in range(n):
            al = np.exp(-2 * np.pi * fc[i] / SR)
            p = (1 - al) * b[i] + al * p
            y[i] = b[i] - p          # passe-haut glissant
        out += y * a
    sw = sinus(200, 1400, dur, 0.5, -1.2)   # sirene montante
    return (out * (t ** 2.2) * 0.5 + sw * (t ** 3) * 0.35) * force

def stab(f=110.0, dur=0.42, force=1.0):
    """Stab de cuivres : dents de scie desaccordees, filtre qui se referme."""
    n = int(dur * SR); t = np.linspace(0, dur, n, endpoint=False)
    x = np.zeros(n)
    for det, a in ((1.0, 1.0), (1.007, .8), (0.993, .8), (2.0, .45), (3.0, .22)):
        ph = 2 * np.pi * f * det * t
        x += a * (2 * (ph / (2 * np.pi) % 1.0) - 1.0)     # dent de scie
    x /= 3.2
    fc = 4200 * np.exp(-5.5 * t / dur) + 320
    y = np.zeros(n); pz = 0.0
    for i in range(n):
        al = np.exp(-2 * np.pi * fc[i] / SR)
        pz = (1 - al) * x[i] + al * pz; y[i] = pz
    return y * env(n, 0.006, 1.0, 1.9) * force


def basse(f=55.0, dur=0.48, force=1.0):
    n = int(dur * SR); t = np.linspace(0, dur, n, endpoint=False)
    x = np.sin(2*np.pi*f*t) + 0.35*np.sin(2*np.pi*2*f*t)
    return x * env(n, 0.004, 1.0, 1.3) * force


def cordes(f=110.0, dur=2.0, force=1.0, monte=1.0):
    """Nappe de cordes : scie d'ensemble desaccordee, vibrato, attaque lente."""
    n = int(dur * SR); t = np.linspace(0, dur, n, endpoint=False)
    vib = 1 + 0.006 * np.sin(2*np.pi*5.2*t)
    gl = f * (1 + (monte - 1) * t / dur)
    x = np.zeros(n)
    for det, a in ((1.0,1.0),(1.004,.9),(0.996,.9),(2.0,.5),(3.0,.3),(4.0,.18),(0.5,.6)):
        ph = 2*np.pi*np.cumsum(gl*det*vib)/SR
        x += a * (2*(ph/(2*np.pi) % 1.0) - 1.0)
    x /= 4.3
    fc = 900 + 2600 * (t/dur)**1.6
    y = np.zeros(n); pz = 0.0
    for i in range(n):
        al = np.exp(-2*np.pi*fc[i]/SR); pz = (1-al)*x[i] + al*pz; y[i] = pz
    return y * env(n, dur*0.35, dur*0.65, 1.1) * force


def choeur(f=220.0, dur=1.6, force=1.0):
    """Choeur : empilement d'harmoniques filtre sur des formants de voyelle."""
    n = int(dur * SR); t = np.linspace(0, dur, n, endpoint=False)
    vib = 1 + 0.012 * np.sin(2*np.pi*4.6*t + 0.7)
    x = np.zeros(n)
    for h, a in ((1,1.0),(2,.55),(3,.34),(4,.2),(5,.13),(6,.08)):
        x += a * np.sin(2*np.pi*np.cumsum(f*h*vib)/SR)
    for det in (0.994, 1.006):
        x += 0.5 * np.sin(2*np.pi*np.cumsum(f*det*vib)/SR)
    x /= 3.4
    # formants grossiers de "ah"
    out = np.zeros(n)
    for fc, bw, a in ((730, 90, 1.0), (1090, 110, .5), (2440, 160, .25)):
        y = np.zeros(n); p1 = p2 = 0.0
        al = np.exp(-2*np.pi*bw/SR); c = 2*al*np.cos(2*np.pi*fc/SR)
        for i in range(n):
            v = x[i] + c*p1 - al*al*p2; y[i] = v; p2 = p1; p1 = v
        out += y * a
    out /= (np.abs(out).max() + 1e-9)
    return out * env(n, dur*0.18, dur*0.82, 1.2) * force


def timbale(f=68.0, dur=0.7, force=1.0):
    s_ = sinus(f*1.45, f*0.9, dur, 1.0, 5.0) * env(int(dur*SR), 0.002, 1.0, 1.8)
    nz = passe_bas(bruit(0.05, 1.0, 9), 1600) * env(int(0.05*SR), 0.0, 1.0, 2.0) * 0.35
    s_[:len(nz)] += nz
    return s_ * force


def roulement(dur=2.0, f=68.0, force=1.0):
    """Roulement de timbales qui enfle."""
    n = int(dur * SR); out = np.zeros(n)
    t = 0.0; i = 0
    while t < dur - 0.08:
        amp = force * (0.25 + 0.75 * (t/dur)**1.7)
        h = timbale(f, 0.26, amp)
        a = int(t*SR); b = min(n, a+len(h)); out[a:b] += h[:b-a]
        t += 0.055 + 0.030*(1 - t/dur); i += 1
    return out


def cymbale(dur=2.2, force=1.0, g=12):
    """Montee de cymbale : bruit aigu qui enfle."""
    n = int(dur*SR); t = np.linspace(0, 1, n)
    x = passe_haut(bruit(dur, 1.0, g), 5200)
    return x * (t ** 2.6) * force * 0.55


def drone(dur, force=1.0):
    n = int(dur * SR); t = np.linspace(0, dur, n, endpoint=False)
    x = (np.sin(2*np.pi*43*t) * 0.6 + np.sin(2*np.pi*64.5*t) * 0.3
         + np.sin(2*np.pi*86*t) * 0.15)
    trem = 1 + 0.22 * np.sin(2*np.pi*0.7*t)
    monte = np.clip(t / dur, 0, 1) ** 1.4
    return x * trem * (0.25 + 0.75 * monte) * force

# La voix commence a 1,00 s. Tous les reperes ci-dessous sont les horodatages
# reels de ses mots, releves par transcription. Le drop tombe sur "Et si c'etait TOI".
V = 1.00
DROP = V + 7.45      # 8.45 s : juste avant "Et"
TOI  = V + 8.24      # 9.24 s : le mot TOI

# ---------- 1) tension ----------
pose(drone(DROP + 0.4, 0.40), 0.0)
pose(boom(0.70, 11), 0.98)                       # le flash d'ouverture
for t in np.arange(1.60, DROP - 0.2, 0.5):       # tic-tac qui s'accelere
    pose(tic(0.45 + 0.6 * (t / DROP), int(t * 7)), t)
pose(tom(120, 0.5, 0.55), V + 2.40)              # les silhouettes montent
for t, f in [(V+3.83, 0.78), (V+4.60, 0.62), (V+5.60, 0.80), (V+6.64, 0.92)]:
    pose(boom(f, int(t * 13)), t)
pose(riser(2.6, 0.58), DROP - 2.55)
# --- montee d'orchestre facon hymne : cordes qui montent par degres,
#     roulement de timbales, cymbale, puis UN SILENCE juste avant le drop ---
ACC = [110.00, 123.47, 130.81, 146.83]        # la si do re
for k, f in enumerate(ACC):
    pose(cordes(f, 1.45, 0.24, 1.02), DROP - 4.6 + k * 1.05)
    pose(cordes(f*1.5, 1.45, 0.13, 1.02), DROP - 4.6 + k * 1.05)
pose(roulement(2.9, 62.0, 0.62), DROP - 3.0)
pose(cymbale(2.6, 0.62), DROP - 2.6)
pose(timbale(58, 1.0, 0.75), DROP - 2.6)

# ---------- 2) le drop, 120 BPM ----------
BPM = 120.0; P = 60.0 / BPM
T0 = DROP
pose(boom(1.60, 31), T0)
pose(boom(1.10, 32), T0 + 0.012)
pose(clap(1.1, 33), T0)
pose(timbale(52, 1.3, 1.1), T0)
for f, a in ((110.0, .72), (164.81, .54), (220.0, .42), (329.63, .28)):
    pose(choeur(f, 2.2, a), T0)            # accord de choeur sur le drop
    pose(cordes(f, 2.2, a*0.6, 1.0), T0)
pose(boom(1.50, 35), TOI)                        # l'impact sur "TOI"
pose(tom(100, 0.8, 0.8), TOI)
FIN_GROOVE = 16.40
i = 0
while T0 + i * P <= FIN_GROOVE:
    t = T0 + i * P
    pose(kick(0.90 if i % 4 == 0 else 0.70), t)
    if i % 4 == 2: pose(clap(0.76, 40 + i), t)
    if i % 8 == 7:
        pose(tom(165, 0.3, 0.5), t + P * 0.5)
        pose(tom(130, 0.34, 0.5), t + P * 0.75)
    pose(hat(0.38, 60 + i), t + P * 0.5)
    if i % 2 == 0: pose(hat(0.24, 90 + i, 0.035), t + P * 0.25)
    i += 1
pose(drone(FIN_GROOVE - T0 + 1.0, 0.28), T0)
NOTES = [110.0, 110.0, 130.81, 146.83]
i = 0
while T0 + i * P <= FIN_GROOVE:
    t = T0 + i * P
    pose(basse(NOTES[(i // 4) % 4] / 2, P * 0.92, 0.40), t)
    if i % 4 == 0: pose(stab(NOTES[(i // 4) % 4], P * 1.7, 0.46), t)
    if i % 4 == 2: pose(stab(NOTES[(i // 4) % 4] * 1.5, P * 0.8, 0.28), t)
    i += 1
# accents sur les bascules du texte, aux mots prononces
for t, f in [(V+8.96, 0.85), (V+9.84, 0.85), (V+10.56, 0.90), (V+12.31, 0.80), (V+13.84, 0.80)]:
    pose(boom(f, int(t * 17)), t)
pose(riser(1.3, 0.55), 15.05)

# ---------- 3) le tampon et la chute ----------
for f, a in ((110.0, .52), (164.81, .40), (261.63, .30)):
    pose(choeur(f, 2.6, a), 16.30)
    pose(cordes(f, 2.6, a*0.5, 1.0), 16.30)
pose(roulement(1.0, 58.0, 0.55), 15.60)
pose(cymbale(1.0, 0.6, 31), 15.70)
pose(boom(1.35, 71), 16.30)
pose(clap(0.9, 73), 16.30)
pose(tom(95, 0.95, 0.75), 16.30)
pose(boom(0.50, 77), 17.90)
pose(drone(3.4, 0.22), 16.40)

# --- le silence : 0,16 s de respiration juste avant le drop, puis l'impact ---
a = int((DROP - 0.17) * SR); b = int(DROP * SR)
creux = np.linspace(1.0, 0.04, b - a) ** 1.4
mix[a:b] *= creux

# ---------- mastering ----------
mix = np.tanh(mix * 0.85) * 1.05
fin = int(19.5 * SR)
mix[fin:] *= np.linspace(1, 0, len(mix) - fin) ** 1.6
mix[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
mix = mix / (np.abs(mix).max() + 1e-9) * 0.89

st = np.stack([mix, mix], axis=1)
w = wave.open('son/bed.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st * 32767).astype('<i2').tobytes()); w.close()
print('son/bed.wav ecrit : %.2f s' % (len(mix) / SR))
