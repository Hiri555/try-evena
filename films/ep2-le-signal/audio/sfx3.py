#!/usr/bin/env python3
"""Sound design for the final cut. Writes sfx.wav + amb.wav (271.5 s)."""
import numpy as np, wave, os, math

SR = 48000
TOTAL = 351.25
N = int(TOTAL * SR)
OUT = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(23)
bus = np.zeros((N, 2), dtype=np.float64)


def place(sig, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    if n <= 0: return
    l = math.cos((pan + 1) * math.pi / 4) * 1.4142
    r = math.sin((pan + 1) * math.pi / 4) * 1.4142
    bus[i:i + n, 0] += sig[:n] * l * gain * .707
    bus[i:i + n, 1] += sig[:n] * r * gain * .707


def env(n, a, d, c=2.0):
    t = np.linspace(0, 1, n)
    return np.clip(t / max(a, 1e-6), 0, 1) ** .6 * np.exp(-np.clip((t - a) / max(d, 1e-6), 0, None) * c * 3)


def svf_bp(x, f0, f1, q=2.0):
    n = len(x); f = np.geomspace(max(f0, 20), max(f1, 20), n)
    y = np.zeros(n); lo = bp = 0.0
    for i in range(n):
        F = 2 * math.sin(math.pi * f[i] / SR)
        hi = x[i] - lo - (1.0 / q) * bp
        bp += F * hi; lo += F * bp; y[i] = bp
    return y


def onepole_lp(x, fc):
    a = math.exp(-2 * math.pi * fc / SR); b = 1 - a
    y = np.empty(len(x)); acc = 0.0
    for i in range(len(x)):
        acc = b * x[i] + a * acc; y[i] = acc
    return y


def onepole_hp(x, fc):
    return x - onepole_lp(x, fc)


noise = lambda d: rng.standard_normal(int(d * SR))
def sine(d, f, ph=0.0):
    return np.sin(2 * math.pi * f * np.arange(int(d * SR)) / SR + ph)
def glide(d, f0, f1, sh=1.0):
    n = int(d * SR); f = f0 + (f1 - f0) * (np.linspace(0, 1, n) ** sh)
    return np.sin(2 * math.pi * np.cumsum(f) / SR)


def whoosh(d=1.4, f0=300, f1=2400, g=1.0):
    y = svf_bp(noise(d), f0, f1, 1.9) * env(int(d * SR), .22, .34, 1.4)
    y += .25 * onepole_lp(noise(d) * env(int(d * SR), .3, .4, 1.2), 240)
    return y * g


def blip(f=880, d=.2, g=1.0):
    y = sine(d, f) * .7 + sine(d, f * 2.01) * .25 + sine(d, f * 3.02) * .08
    return y * env(len(y), .004, .10, 2.6) * g


def thunk(g=1.0, lo=118, hi=46):
    d = 1.0
    y = glide(d, lo, hi, .45) * env(int(d * SR), .002, .10, 2.2) * .9
    y += sine(d, 54) * env(int(d * SR), .004, .18, 1.6) * .8
    cl = onepole_hp(noise(.03), 1800) * env(int(.03 * SR), .001, .3, 4)
    y[:len(cl)] += cl * .5
    return onepole_lp(y, 3200) * g


def chime(root=523.25, d=2.4, g=1.0):
    y = np.zeros(int(d * SR))
    for k, a in [(1, .55), (2, .22), (3, .10), (4.02, .06), (5.4, .035)]:
        y += sine(d, root * k) * a * env(len(y), .006, .22 + .10 / k, 1 + k * .25)
    return y * g


def tick(g=1.0, f=2600):
    d = .028
    return onepole_hp(noise(d), f) * env(int(d * SR), .0008, .25, 5) * g


def riser(d=4.0, f0=120, f1=560, g=1.0):
    n = int(d * SR); t = np.linspace(0, 1, n)
    y = (glide(d, f0, f1, 1.6) * .35 + svf_bp(noise(d), 600, 4800, 1.2) * .30) * (t ** 1.9)
    return onepole_lp(y * np.minimum(1, (1 - t) * 6), 7000) * g


def hum(d, f=110, g=1.0):
    y = sine(d, f) * .5 + sine(d, f * 2) * .2 + sine(d, f * 3.01) * .1
    t = np.linspace(0, 1, len(y))
    y *= np.minimum(np.minimum(t * 8, 1), (1 - t) * 8)
    return onepole_lp(y, 1400) * g


def paper(g=1.0):
    d = .45
    return svf_bp(noise(d), 2600, 700, 1.1) * env(int(d * SR), .05, .30, 2.2) * g


def thrust(d=.5, g=1.0):
    y = svf_bp(noise(d), 1400, 380, 1.3) * env(int(d * SR), .02, .22, 2.4)
    y += onepole_lp(noise(d), 180) * env(int(d * SR), .01, .25, 2.0) * .5
    return y * g


def sting(g=1.0):
    d = 4.0
    y = chime(392.0, d, 1.0) * .8
    pad = sine(d, 196) * .4 + sine(d, 294) * .28 + sine(d, 392) * .18 + sine(d, 588) * .07
    t = np.linspace(0, 1, len(pad))
    y += onepole_lp(pad * np.minimum(t * 3.2, 1) * np.exp(-t * 1.5), 2200) * .55
    return y * g


# ────────────────────────────────────────── chapter clocks (épisode 2)
B = [0.0, 11.250, 45.667, 101.750, 139.333, 169.458, 202.125, 246.250, 278.042, 315.792]

# ── 00 accroche
place(whoosh(2.0, 220, 1800, .34), B[0] + 0.90, 0)
for i, tt in enumerate([1.9, 2.3, 2.7]):
    place(blip(523 * (1 + .22 * i), .22, .28), B[0] + tt, -.35 + i * .35)
place(whoosh(1.8, 180, 900, .24), B[0] + 4.85, 0)
place(chime(523.25, 2.2, .20),    B[0] + 5.10, .15)

# ── 01 le répéteur
place(tick(.26), B[1] + 0.20, -.5)
for i, tt in enumerate([2.40, 3.30, 4.20]):
    place(tick(.32), B[1] + tt, -.35 + i * .35)
place(whoosh(2.2, 240, 1900, .32), B[1] + 7.40, -.2)
place(hum(12.0, 92, .07),          B[1] + 8.20, 0)
place(thunk(.42, 150, 62),         B[1] + 15.35, 0)      # le « clac » de conversion
place(blip(392, .30, .22),         B[1] + 15.55, .25)
place(whoosh(1.8, 1500, 300, .24), B[1] + 21.30, .2)
place(thunk(.18, 110, 50),         B[1] + 25.00, 0)

# ── 02 le plan de bande
place(tick(.26), B[2] + 0.20, -.5)
place(whoosh(1.6, 200, 1200, .26), B[2] + 1.55, 0)
for i, tt in enumerate([4.20, 7.00, 9.40]):
    place(blip(440 * (1 + .25 * i), .24, .30), B[2] + tt, -.3 + i * .3)
place(chime(587.33, 2.4, .24),     B[2] + 12.40, 0)
place(whoosh(2.4, 260, 2000, .34), B[2] + 19.30, 0)
place(hum(17.0, 84, .07),          B[2] + 20.00, 0)
place(blip(880, .26, .22),         B[2] + 26.40, .3)     # la butée
place(thunk(.52, 130, 44),         B[2] + 27.40, 0)      # elle bute
place(riser(2.0, 420, 110, .16),   B[2] + 28.20, -.2)    # elle plonge
place(blip(330, .34, .26),         B[2] + 31.60, -.35)   # elle se range en bas
place(whoosh(2.0, 1600, 280, .26), B[2] + 36.90, 0)
place(tick(.32), B[2] + 39.00, -.3); place(tick(.34), B[2] + 41.00, .3)
place(thunk(.46),                  B[2] + 46.60, 0)
place(chime(784.0, 2.6, .24),      B[2] + 46.75, .15)

# ── 03 la polarisation
place(tick(.26), B[3] + 0.20, -.5)
place(whoosh(2.2, 240, 1800, .30), B[3] + 7.30, 0)
place(hum(16.0, 98, .085),         B[3] + 8.00, -.35)    # un bourdon par sens
place(hum(15.0, 147, .070),        B[3] + 8.60,  .35)
place(blip(880, .24, .28),         B[3] + 10.40, -.3)
place(blip(660, .24, .28),         B[3] + 11.60,  .3)
place(thunk(.26, 140, 60),         B[3] + 16.80, 0)
place(whoosh(1.8, 1400, 300, .24), B[3] + 24.90, 0)
place(chime(659.25, 2.6, .26),     B[3] + 28.40, 0)
place(riser(1.8, 160, 520, .13),   B[3] + 30.60, .2)

# ── 04 le bruit du ciel
place(tick(.26), B[4] + 0.20, -.5)
place(whoosh(1.4, 200, 1100, .22), B[4] + 1.15, 0)
place(hum(3.0, 64, .09),           B[4] + 2.40, -.4)     # le fond galactique
place(blip(1175, .20, .20),        B[4] + 9.60, .3)      # eau
place(blip(1397, .20, .20),        B[4] + 11.40, .4)     # oxygène
place(chime(523.25, 2.8, .26),     B[4] + 15.40, 0)      # la fenêtre
place(blip(784, .22, .26),         B[4] + 19.20, .25)
place(blip(587, .22, .26),         B[4] + 20.00, -.25)

# ── 05 les faisceaux
place(tick(.26), B[5] + 0.20, -.5)
for i, tt in enumerate([3.40, 7.00, 10.60, 14.20]):
    place(blip(392 * (1 + .18 * i), .26, .28), B[5] + tt, -.35 + i * .23)
place(tick(.30),                   B[5] + 18.60, .3)
place(chime(698.46, 2.6, .24),     B[5] + 24.20, 0)
place(riser(2.2, 180, 620, .14),   B[5] + 25.40, .15)

# ── 06 intelsat
place(tick(.26), B[6] + 0.20, -.5)
for i in range(11):
    place(tick(.22 + i * .012), B[6] + 1.5 + i * 0.30, -.4 + i * .08)
place(blip(880, .24, .24),         B[6] + 11.00, .3)
place(whoosh(1.5, 300, 1500, .24), B[6] + 19.00, 0)
place(hum(9.0, 72, .07),           B[6] + 20.20, -.3)    # la toupie
place(blip(523, .24, .22),         B[6] + 23.40, .3)
place(whoosh(1.5, 1400, 300, .24), B[6] + 31.20, 0)
place(blip(440, .26, .22),         B[6] + 32.40, 0)
place(blip(988, .26, .28),         B[6] + 38.00, .3)

# ── 07 la vsat
place(tick(.26), B[7] + 0.20, -.5)
place(blip(330, .30, .22),         B[7] + 1.60, -.35)
place(blip(784, .24, .24),         B[7] + 3.60,  .25)
for i in range(6):
    place(tick(.24), B[7] + 8.5 + i * 0.22, -.1)
for i in range(8):
    place(tick(.20), B[7] + 12.7 + i * 0.16, .35)
place(chime(783.99, 2.4, .24),     B[7] + 16.40, -.2)
for i in range(4):
    place(tick(.26), B[7] + 19.7 + i * 0.45, -.3)
place(thunk(.24, 150, 68),         B[7] + 26.00, .25)

# ── 08 les deux chiffres
place(tick(.26), B[8] + 0.20, -.5)
place(tick(.32),                   B[8] + 4.20, 0)
place(thunk(.30, 140, 58),         B[8] + 13.60, 0)
place(whoosh(1.4, 900, 260, .20),  B[8] + 18.40, 0)
place(tick(.32),                   B[8] + 20.40, 0)
place(thunk(.30, 140, 58),         B[8] + 29.80, 0)

# ── 09 la fiche et la fin
place(paper(.30),                  B[9] + 0.90, 0)
for i, tt in enumerate([3.00, 9.60, 13.00, 16.40, 19.60]):
    place(tick(.30), B[9] + tt, -.35 + i * .18)
place(blip(659, .22, .20),         B[9] + 22.60, 0)
place(paper(.26),                  B[9] + 26.20, 0)
place(whoosh(2.0, 900, 220, .22),  B[9] + 26.40, 0)
place(whoosh(1.6, 200, 900, .18),  B[9] + 27.90, 0)
place(sting(.30),                  B[9] + 29.70, 0)

# ────────────────────────────────────────── ambience bed
t = np.arange(N) / SR
amb = np.zeros((N, 2))
for ch, seed in enumerate((17, 29)):
    r = np.random.default_rng(seed)
    y = r.standard_normal(N)
    for fc in (70.0, 70.0, 140.0):
        y = onepole_lp(y, fc)
    y /= (np.max(np.abs(y)) + 1e-9)
    drift = 1 + .22 * np.sin(2 * math.pi * .013 * t + ch) + .12 * np.sin(2 * math.pi * .031 * t)
    tone = (np.sin(2 * math.pi * 41.0 * t + ch * .7) * .35 +
            np.sin(2 * math.pi * 61.5 * t) * .18 +
            np.sin(2 * math.pi * 82.0 * t + 1.3) * .09)
    amb[:, ch] = (y * .85 + tone * .40) * drift
amb *= np.minimum(np.minimum(t / 2.5, 1), np.maximum(0, (TOTAL - t) / 3.0))[:, None]


def write(path, arr, peak):
    a = np.clip(arr / (np.max(np.abs(arr)) + 1e-9) * peak, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((a * 32767).astype('<i2').tobytes())
    print(path, round(len(a) / SR, 2), 's')


write(os.path.join(OUT, 'sfx.wav'), bus, .80)
write(os.path.join(OUT, 'amb.wav'), amb, .70)
