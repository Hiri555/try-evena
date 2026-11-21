#!/usr/bin/env python3
"""Bande-son du teaser : chaque impact est posé sur une coupe du montage.

Tension 0 -> 9 s (drone, tic-tac, coups), DROP à 9 s (percussions 120 BPM),
dernier impact à 17 s, silence tenu jusqu'à 20 s.
"""
import numpy as np, wave, struct

SR = 48000
DUR = 20.2
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


def drone(dur, force=1.0):
    n = int(dur * SR); t = np.linspace(0, dur, n, endpoint=False)
    x = (np.sin(2*np.pi*43*t) * 0.6 + np.sin(2*np.pi*64.5*t) * 0.3
         + np.sin(2*np.pi*86*t) * 0.15)
    trem = 1 + 0.22 * np.sin(2*np.pi*0.7*t)
    monte = np.clip(t / dur, 0, 1) ** 1.4
    return x * trem * (0.25 + 0.75 * monte) * force

# ---------- 1) tension, 0 -> 9 s ----------
pose(drone(9.3, 0.42), 0.0)
pose(boom(0.75, 11), 0.42)                       # le flash d'ouverture
for t in np.arange(1.05, 9.0, 0.5):              # tic-tac
    pose(tic(0.5 + 0.5 * (t / 9.0), int(t * 7)), t)
for t, f in [(1.30, 0.80), (2.30, 0.86), (3.30, 0.92)]:
    pose(boom(f, int(t * 13)), t)
pose(tom(120, 0.5, 0.6), 4.40)                   # les silhouettes montent
pose(boom(0.95, 21), 5.20)                       # PRESIDENCE
pose(boom(0.70, 23), 5.85)                       # 2026
pose(riser(3.0, 0.85), 6.00)
pose(boom(0.72, 27), 6.80)
pose(boom(0.80, 29), 7.90)

# ---------- 2) le drop, 9 s -> 17 s, 120 BPM ----------
BPM = 120.0; P = 60.0 / BPM          # 0.5 s
T0 = 9.0
pose(boom(1.25, 31), T0)                         # L'IMPACT
pose(clap(1.0, 33), T0)
for i in range(int((17.2 - T0) / P) + 1):
    t = T0 + i * P
    if t > 17.3: break
    pose(kick(0.92 if i % 4 == 0 else 0.74), t)          # kick a chaque temps
    if i % 4 in (2,):
        pose(clap(0.80, 40 + i), t)                      # clap sur le 3
    if i % 8 == 7:
        pose(tom(165, 0.3, 0.55), t + P * 0.5)           # relance
        pose(tom(130, 0.34, 0.55), t + P * 0.75)
    pose(hat(0.42, 60 + i), t + P * 0.5)
    if i % 2 == 0:
        pose(hat(0.26, 90 + i, 0.035), t + P * 0.25)
pose(drone(8.4, 0.30), T0)
# cuivres et basse : ils donnent le corps du drop
NOTES = [110.0, 110.0, 130.81, 146.83]      # la / la / do / re
for i in range(int((17.2 - T0) / P) + 1):
    t = T0 + i * P
    if t > 17.1: break
    pose(basse(NOTES[(i // 4) % 4] / 2, P * 0.92, 0.42), t)
    if i % 4 == 0:
        pose(stab(NOTES[(i // 4) % 4], P * 1.7, 0.50), t)
    if i % 4 == 2:
        pose(stab(NOTES[(i // 4) % 4] * 1.5, P * 0.8, 0.30), t)
# accents sur les bascules du montage
for t, f in [(11.0, 0.9), (12.5, 0.9), (14.0, 0.95), (15.5, 0.8)]:
    pose(boom(f, int(t * 17)), t)
pose(riser(1.4, 0.6), 15.6)

# ---------- 3) le tampon et la chute ----------
pose(boom(1.3, 71), 17.0)
pose(clap(0.9, 73), 17.0)
pose(tom(95, 0.9, 0.7), 17.0)
pose(boom(0.55, 77), 18.6)
pose(drone(2.6, 0.22), 17.1)

# ---------- mastering ----------
mix = np.tanh(mix * 0.85) * 1.05
fin = int(19.4 * SR)
mix[fin:] *= np.linspace(1, 0, len(mix) - fin) ** 1.6
mix[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
mix = mix / (np.abs(mix).max() + 1e-9) * 0.89

st = np.stack([mix, mix], axis=1)
w = wave.open('son/bed.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st * 32767).astype('<i2').tobytes()); w.close()
print('son/bed.wav ecrit : %.2f s' % (len(mix) / SR))
