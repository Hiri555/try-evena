# -*- coding: utf-8 -*-
"""Calage réel : on recale chaque frontière de phrase sur les vrais
silences de la prise, au lieu de l'estimer au nombre de caractères."""
import os, re, json, subprocess

D = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(D, 'srt.py'), encoding='utf-8').read()
ns = {'os': os, 'json': json}
exec(compile(src[:src.index('D = os.path')], 'srt', 'exec'), ns)
SC, STARTS = ns['SC'], ns['STARTS']

def duree(p):
    return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration',
                                 '-of','csv=p=0',p],capture_output=True,text=True).stdout)

def silences(path, th=-40, d=0.16):
    out = subprocess.run(['ffmpeg','-v','info','-i',path,'-af',
                          f'silencedetect=noise={th}dB:d={d}','-f','null','-'],
                         capture_output=True, text=True).stderr
    a = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', out)]
    b = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', out)]
    return list(zip(a, b))[:len(b)]

PAUSE = 7.0
def poids(s):
    return len(s.replace('\n', ' ')) + s.count('…') * PAUSE + s.count('—') * 3

FENETRE = 2.6
rap = []
for i, lines in enumerate(SC):
    p = os.path.join(D, '..', 'vo', f'v{i}.mp3')
    dur = duree(p); sil = silences(p)
    ws = [poids(sp or cap) for cap, sp in lines]; tot = sum(ws)
    att, c = [], 0.0
    for w in ws[:-1]:
        c += dur * w / tot; att.append(c)
    cand = [((a + b) / 2, b - a) for a, b in sil if 0.5 < (a + b) / 2 < dur - 0.4]
    reel, mini = [], 0.0
    for e in att:
        best, score = None, None
        for m, lg in cand:
            if m <= mini + 0.35: continue
            s = abs(m - e) - min(lg, 0.9) * 1.4
            if abs(m - e) <= FENETRE and (score is None or s < score):
                best, score = m, s
        if best is None: best = max(e, mini + 0.35)
        reel.append(best); mini = best
    dec = [r - a for r, a in zip(reel, att)]
    rap.append({'ch': i, 'nlignes': len(lines), 'nsilences': len(sil),
                'decalage_moyen': sum(abs(x) for x in dec) / max(len(dec), 1),
                'decalage_max': max((abs(x) for x in dec), default=0.0),
                'bornes': [0.0] + reel + [dur]})
json.dump(rap, open(os.path.join(D, 'calage.json'), 'w'), indent=1)

DEB = [0.0]
TL = json.load(open(os.path.join(D, '..', 'timeline.json')))
for d in TL['durees'][:-1]: DEB.append(round(DEB[-1] + d, 3))
cues = []
for i, r in enumerate(rap):
    off = STARTS[i] - DEB[i]
    cues.append([round(x + off, 3) for x in r['bornes']])
js = os.path.join(D, '..', '..', 'render6', 'cues.js')
os.makedirs(os.path.dirname(js), exist_ok=True)
open(js, 'w', encoding='utf-8').write(
  "// Repères de la voix off, MESURÉS dans l'audio (audio/cale.py).\n"
  "// CUE[chapitre][i] = début de la phrase i, en secondes depuis le début du chapitre.\n"
  "const CUE = " + json.dumps(cues) + ";\n"
  "const L = (c, i) => CUE[c][i];\nconst LE = (c, i) => CUE[c][i + 1];\n")
print(f"{'ch':>3} {'phr':>4} {'sil':>4} {'décal. moyen':>13} {'max':>7}")
for r in rap:
    print(f"{r['ch']:>3} {r['nlignes']:>4} {r['nsilences']:>4} "
          f"{r['decalage_moyen']:>12.2f}s {r['decalage_max']:>6.2f}s")
print('cues.js écrit —', sum(len(c)-1 for c in cues), 'phrases mesurées')
