"""Calage réel de la voix off.

Les temps étaient estimés au nombre de caractères. On les recale sur les
vrais silences du fichier audio : pour chaque frontière attendue, on cherche
le silence le plus proche, en gardant l'ordre.
"""
import os, re, subprocess, json, sys

D = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(D, 'srt.py'), encoding='utf-8').read()
ns = {}
exec(compile(src[:src.index('PAUSE = 7.0')], 'srt', 'exec'), ns)
SC, STARTS, DURS = ns['SC'], ns['STARTS'], ns['DURS']

PAUSE = 7.0
def weight(s):
    return len(s.replace('\n', ' ')) + s.count('…') * PAUSE + s.count('—') * 3

def silences(path, th=-40, d=0.16):
    out = subprocess.run(['ffmpeg', '-v', 'info', '-i', path, '-af',
                          f'silencedetect=noise={th}dB:d={d}', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    a = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', out)]
    b = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', out)]
    return list(zip(a, b))[:len(b)]

FENETRE = 2.6          # on ne déplace pas une frontière de plus que ça
rapport = []
for i, lines in enumerate(SC):
    p = os.path.join(D, '..', 'vo', f'v{i}.mp3')
    sil = silences(p)
    ws = [weight(sp or cap) for cap, sp in lines]
    tot = sum(ws)
    # frontières attendues (relatives au début de la prise)
    att, c = [], 0.0
    for w in ws[:-1]:
        c += DURS[i] * w / tot
        att.append(c)
    # chaque silence propose un point de coupe = son milieu, pondéré par sa durée
    cand = [((a + b) / 2, b - a) for a, b in sil if 0.5 < (a + b) / 2 < DURS[i] - 0.4]
    reel, mini = [], 0.0
    for e in att:
        best, score = None, None
        for m, lg in cand:
            if m <= mini + 0.35:
                continue
            s = abs(m - e) - min(lg, 0.9) * 1.4      # un long silence attire plus
            if abs(m - e) <= FENETRE and (score is None or s < score):
                best, score = m, s
        if best is None:
            best = max(e, mini + 0.35)
        reel.append(best); mini = best
    dec = [r - a for r, a in zip(reel, att)]
    rapport.append({'ch': i, 'nlignes': len(lines), 'nsilences': len(sil),
                    'decalage_max': max((abs(x) for x in dec), default=0.0),
                    'decalage_moyen': sum(abs(x) for x in dec) / max(len(dec), 1),
                    'bornes': [0.0] + reel + [DURS[i]]})
json.dump(rapport, open(os.path.join(D, 'calage.json'), 'w'), indent=1)
print(f"{'ch':>3} {'lignes':>7} {'silences':>9} {'décalage moyen':>15} {'max':>7}")
for r in rapport:
    print(f"{r['ch']:>3} {r['nlignes']:>7} {r['nsilences']:>9} "
          f"{r['decalage_moyen']:>14.2f}s {r['decalage_max']:>6.2f}s")
