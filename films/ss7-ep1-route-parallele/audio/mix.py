# -*- coding: utf-8 -*-
"""Montage son de l'épisode 1. La prise 2 a été refaite (URM) : elle est
remise à la durée exacte de l'ancienne pour que rien d'autre ne bouge."""
import json, os, subprocess
import numpy as np

D = os.path.dirname(os.path.abspath(__file__))
SR = 48000
TL = json.load(open(os.path.join(D, '..', 'timeline.json')))
N = int((TL['total'] + 1.0) * SR)

def lire(p):
    o = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1',
                        '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(o, dtype=np.float32).astype(np.float64)

def ecrire(p, x):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ac', '1', '-ar',
                    str(SR), '-i', '-', '-c:a', 'pcm_s24le', p],
                   input=np.clip(x, -1, 1).astype(np.float32).tobytes())

vo = np.zeros(N)
for i, t0 in enumerate(TL['vostart']):
    f = f'v{i}_urm.mp3' if i == 2 else f'v{i}.mp3'
    a = lire(os.path.join(D, '..', 'vo2', f))
    cible = int(TL['vo'][i] * SR)
    if len(a) < cible: a = np.concatenate([a, np.zeros(cible - len(a))])
    else: a = a[:cible]
    o = int(t0 * SR)
    vo[o:o + len(a)] += a[:max(0, N - o)]
ecrire(os.path.join(D, 'vo.wav'), vo)

A, B = lire(os.path.join(D, 'mA.mp3')), lire(os.path.join(D, 'mB.mp3'))
XF = int(4.0 * SR)
mus = np.zeros(N); pos = 0; k = 0
while pos < N:
    seg = (A if k % 2 == 0 else B).copy()
    if pos: seg[:XF] *= np.linspace(0, 1, XF)
    seg[-XF:] *= np.linspace(1, 0, XF)
    e = min(N, pos + len(seg)); mus[pos:e] += seg[:e - pos]
    pos += len(seg) - XF; k += 1
ecrire(os.path.join(D, 'mus.wav'), mus * 0.5)
print('voix et musique écrites —', round(N / SR, 2), 's')
