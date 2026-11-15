# -*- coding: utf-8 -*-
"""Mesure les frontières de phrases de l'épisode 1 sur les silences réels."""
import os, re, json, subprocess

D = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(D, 'srt.py'), encoding='utf-8').read()
ns = {'os': os}
exec(compile(src[:src.index('import json')], 'srt', 'exec'), ns)
SC = ns['SC']
TL = json.load(open(os.path.join(D, '..', 'timeline.json')))

def sil(p, th=-40, d=0.16):
    o = subprocess.run(['ffmpeg','-v','info','-i',p,'-af',
                        f'silencedetect=noise={th}dB:d={d}','-f','null','-'],
                       capture_output=True, text=True).stderr
    a=[float(x) for x in re.findall(r'silence_start: ([0-9.]+)',o)]
    b=[float(x) for x in re.findall(r'silence_end: ([0-9.]+)',o)]
    return list(zip(a,b))[:len(b)]

def poids(s): return len(s.replace('\n',' ')) + s.count('…')*7 + s.count('—')*3

rap = []
for i, lines in enumerate(SC):
    f = f'v{i}_urm.mp3' if i == 2 else f'v{i}.mp3'
    p = os.path.join(D, '..', 'vo2', f)
    dur = TL['vo'][i]                       # durée calée sur la timeline figée
    s = sil(p)
    ws = [poids(sp or cap) for cap, sp in lines]; tot = sum(ws)
    att, c = [], 0.0
    for w in ws[:-1]: c += dur*w/tot; att.append(c)
    cand = [((a+b)/2, b-a) for a,b in s if 0.5 < (a+b)/2 < dur-0.4]
    reel, mini = [], 0.0
    for e in att:
        best, sc = None, None
        for m, lg in cand:
            if m <= mini+0.35: continue
            v = abs(m-e) - min(lg,0.9)*1.4
            if abs(m-e) <= 2.6 and (sc is None or v < sc): best, sc = m, v
        if best is None: best = max(e, mini+0.35)
        reel.append(best); mini = best
    dec = [r-a for r,a in zip(reel,att)]
    rap.append({'ch': i, 'nlignes': len(lines),
                'decalage_moyen': sum(abs(x) for x in dec)/max(len(dec),1),
                'decalage_max': max((abs(x) for x in dec), default=0.0),
                'bornes': [0.0]+reel+[dur]})
json.dump(rap, open(os.path.join(D,'calage.json'),'w'), indent=1)
print(f"{'ch':>3} {'phr':>4} {'décal. moyen':>13} {'max':>7}")
for r in rap:
    print(f"{r['ch']:>3} {r['nlignes']:>4} {r['decalage_moyen']:>12.2f}s {r['decalage_max']:>6.2f}s")
