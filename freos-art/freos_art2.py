#!/usr/bin/env python3
"""FREOS whitening strips — image set v2.

Simpler pack than v1: English, the FREOS wordmark and little else, plus a
small tooth mark so the carton reads as teeth whitening at a glance rather
than needing the Italian subtitle to explain it. Wider spread of shot types
than v1, which was five variations of the same standing carton.

Object-only, same reason as before: the content filter refuses people often,
and invented before-and-afters are not something this brand does.
"""
import json, os, sys, time, urllib.request
from pathlib import Path

ART = Path(__file__).resolve().parent / 'art2'
API = 'https://api.kie.ai/api/v1'
MODEL = os.environ.get('KIE_MODEL', 'nano-banana-pro')

STYLE = (
    "Studio product photograph, square 1:1. Warm cream paper background "
    "(#F5F1E8), plain. Soft diffused daylight from upper left, one gentle "
    "contact shadow, no hard speculars. Muted natural editorial colour, "
    "generous negative space. Photorealistic, sharp, medium-format. "
    "No people, no hands, no faces, no lips, no gums, no text overlay "
    "beyond the packaging's own printed label."
)

# One description, reused verbatim, so the carton is the same object in
# every frame. Deliberately sparse: wordmark, product name, a tooth mark.
BOX = (
    "A matte deep forest-green cardboard carton (#1F3D2E) for teeth "
    "whitening strips. Printed in pale cream, minimal and uncrowded: a "
    "small clean outline icon of a single tooth at the top, below it the "
    "wordmark 'FREOS' in widely letterspaced serif capitals, and below "
    "that 'WHITENING STRIPS' in small letterspaced sans capitals. Near the "
    "base, one thin line: '14 STRIPS'. Nothing else printed on it. "
    "Matte uncoated stock, crisp printing, premium pharmacy restraint."
)

SLOTS = [
    {'name': '01-hero',
     'prompt': BOX + " The carton stands upright, centred, photographed "
                     "straight on at eye level, filling the middle of frame."},
    {'name': '02-angle',
     'prompt': BOX + " Two identical cartons, one standing and one lying "
                     "flat in front of it, arranged at a relaxed angle."},
    {'name': '03-sachet',
     'prompt': BOX + " In front of the carton lies one sealed sachet in the "
                     "same deep green, printed in cream with '2 STRIPS'."},
    {'name': '04-open',
     'prompt': BOX + " The carton is open, its lid tilted away, and the "
                     "sealed green sachets are visible stacked inside."},
    {'name': '05-strip',
     'prompt': "A single thin transparent whitening strip for teeth, gently "
               "curved, on a pale cream surface. Faintly iridescent, an even "
               "matte gel film on the inner face. Macro, shallow depth of "
               "field, the far end falling out of focus."},
    {'name': '06-flatlay',
     'prompt': BOX + " Shot from directly above: the carton, two sealed "
                     "green sachets and two transparent strips laid out in a "
                     "calm orderly row beside it."},
    {'name': '07-peel',
     'prompt': "A thin whitening strip for teeth being peeled away from its "
               "backing liner: the strip is translucent and faintly glossy, "
               "lifted and curling at one corner, the matte liner still flat "
               "beneath it. Held in mid-air against a warm cream background "
               "by nothing visible. Macro, the separation between strip and "
               "liner crisp and obvious, shallow depth of field."},
    {'name': '09-trio',
     'prompt': "A matte deep forest-green carton for teeth whitening strips "
               "printed in pale cream with a small outline tooth icon, the "
               "letterspaced serif wordmark 'FREOS' and 'WHITENING STRIPS' "
               "below it, standing on a warm cream surface. Beside it a "
               "plain matte white ceramic dental study model of an upper and "
               "lower set of teeth, and in front of both a single sealed "
               "green sachet. Three objects in a calm triangular "
               "arrangement, eye level. No gums, no lips, no skin."},
    {'name': '08-shelf',
     'prompt': BOX + " The carton stands on a cool pale marble bathroom "
                     "shelf beside a plain unbranded glass of water and a "
                     "simple wooden-handled toothbrush. Early morning light, "
                     "calm, uncluttered."},
]


def _post(p, payload, key):
    r = urllib.request.Request(API + p, data=json.dumps(payload).encode(),
        headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'},
        method='POST')
    with urllib.request.urlopen(r, timeout=60) as x: return json.loads(x.read())

def _get(p, key):
    r = urllib.request.Request(API + p, headers={'Authorization': 'Bearer ' + key})
    with urllib.request.urlopen(r, timeout=60) as x: return json.loads(x.read())

def _url(d):
    raw = d.get('resultJson')
    if isinstance(raw, str):
        try: raw = json.loads(raw)
        except Exception: return None
    u = (raw or {}).get('resultUrls') or []
    return u[0] if u else None

def main(only=None):
    key = os.environ['KIE_API_KEY']; ART.mkdir(exist_ok=True)
    todo = [s for s in SLOTS if (not only or s['name'] in only)
            and not (ART / (s['name'] + '.png')).exists()]
    print('credits %.2f · batch needs ~%d'
          % (_get('/chat/credit', key)['data'], len(todo) * 18))
    tasks = []
    for s in todo:
        res = _post('/jobs/createTask', {'model': MODEL, 'input': {
            'prompt': s['prompt'] + ' ' + STYLE,
            'aspect_ratio': '1:1', 'output_format': 'png'}}, key)
        if res.get('code') == 200:
            tasks.append([s, res['data']['taskId']]); print('  queued  ' + s['name'])
        else:
            print('  !! %s %s' % (s['name'], res.get('msg')))
    pending, deadline = list(tasks), time.time() + 900
    while pending and time.time() < deadline:
        time.sleep(5); still = []
        for s, tid in pending:
            try: d = (_get('/jobs/recordInfo?taskId=' + tid, key) or {}).get('data') or {}
            except Exception: still.append([s, tid]); continue
            st = str(d.get('state') or '').lower()
            if st == 'success':
                u = _url(d)
                if not u: print('  !! %s no url' % s['name']); continue
                dest = ART / (s['name'] + '.png')
                rq = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(rq, timeout=120) as r, open(dest, 'wb') as f:
                    f.write(r.read())
                print('  ok      %-12s %3ds  %d KB' % (s['name'], d.get('costTime') or 0,
                                                       dest.stat().st_size // 1024))
            elif st in ('fail', 'failed', 'error'):
                print('  !! %-12s %s' % (s['name'], d.get('failMsg')))
            else: still.append([s, tid])
        pending = still
        if pending: print('  … %d running' % len(pending))
    for s, tid in pending: print('  !! %s timed out' % s['name'])

if __name__ == '__main__':
    main(sys.argv[1:] or None)
