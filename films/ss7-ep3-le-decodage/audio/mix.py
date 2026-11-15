# -*- coding: utf-8 -*-
"""Montage son de l'épisode 3 : voix placée aux repères, lit musical
monté en A-B-A-B, bruitages de page, puis mixage avec ducking."""
import json, os, subprocess, math
import numpy as np

D = os.path.dirname(os.path.abspath(__file__))
SR = 48000
TL = json.load(open(os.path.join(D, '..', 'timeline.json')))
DUREE = TL['total_images'] / 24
N = int(DUREE * SR)

def lire(p):
    out = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le',
                          '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True).stdout
    return np.frombuffer(out, dtype=np.float32).astype(np.float64)

def ecrire(p, x):
    x = np.clip(x, -1, 1).astype(np.float32)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ac', '1',
                    '-ar', str(SR), '-i', '-', '-c:a', 'pcm_s24le', p],
                   input=x.tobytes())

# ── la voix, posée sur les débuts mesurés ───────────────────────────────
vo = np.zeros(N)
for i, deb in enumerate(TL['debuts']):
    a = lire(os.path.join(D, '..', 'vo', f'v{i}.mp3'))
    off = int(sum(TL['durees'][:i]) * SR) + int(deb * SR) - int(sum(TL['durees'][:i]) * SR)
    off = int((sum(TL['durees'][:i]) + deb - sum(TL['durees'][:i])) * SR)
    off = int(( sum(TL['durees'][:i]) + (deb - 0) ) * SR) if False else int(deb * SR) + int(sum(TL['durees'][:i]) * SR) - int(sum(TL['durees'][:i]) * SR)
    off = int((sum(TL['durees'][:i])) * SR) + int((deb - sum(TL['durees'][:i])) * SR)
    off = int(deb * SR)          # STARTS est déjà absolu
    vo[off:off + len(a)] += a[:max(0, N - off)]
ecrire(os.path.join(D, 'vo.wav'), vo)

# ── bruitages : un froissement de page à chaque bascule de chapitre ─────
rng = np.random.default_rng(7)
def papier(d=0.42, seed=0):
    n = int(d * SR); t = np.arange(n) / SR
    r = np.random.default_rng(seed).normal(0, 1, n)
    env = np.exp(-t * 9) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t))
    x = r * env
    # filtre passe-haut doux
    y = np.copy(x)
    for k in range(1, n): y[k] = 0.86 * (y[k-1] + x[k] - x[k-1])
    return y * 0.26

def declic(d=0.09, f=2100, seed=0):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 60) * 0.18
            + np.random.default_rng(seed).normal(0, 1, n) * np.exp(-t * 110) * 0.06)

sfx = np.zeros(N)
c = 0.0
for i, d in enumerate(TL['durees']):
    if i:
        o = int((c - 0.16) * SR)
        s = papier(seed=i)
        sfx[o:o + len(s)] += s[:max(0, N - o)]
    c += d
for i, deb in enumerate(TL['debuts']):
    o = int((deb - 0.26) * SR)
    s = declic(seed=100 + i)
    if o > 0: sfx[o:o + len(s)] += s[:max(0, N - o)]
ecrire(os.path.join(D, 'sfx.wav'), sfx)

# ── musique : A B A B, fondus de 4 s ────────────────────────────────────
A, B = lire(os.path.join(D, 'mA.mp3')), lire(os.path.join(D, 'mB.mp3'))
XF = int(4.0 * SR)
mus = np.zeros(N); pos = 0; k = 0
while pos < N:
    seg = (A if k % 2 == 0 else B).copy()
    if pos: seg[:XF] *= np.linspace(0, 1, XF)
    seg[-XF:] *= np.linspace(1, 0, XF)
    e = min(N, pos + len(seg))
    mus[pos:e] += seg[:e - pos]
    pos += len(seg) - XF; k += 1
ecrire(os.path.join(D, 'mus.wav'), mus * 0.5)
print('voix, bruitages et musique écrits —', round(DUREE, 2), 's')
