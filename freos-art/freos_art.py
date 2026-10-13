#!/usr/bin/env python3
"""
FREOS — whitening strips art pipeline.

    export KIE_API_KEY=...
    python3 freos_art.py              # every pending slot
    python3 freos_art.py 01-main      # just one

Queues every slot at once and polls them together: sixteen images take about
as long as one, so nothing here is generated serially.

House style is read off the existing Gel Notturno photography, which the whole
store is built around: warm cream ground, deep forest-green packaging, cream
and pale-gold label type, the FREOS wordmark letterspaced with a small leaf
mark above it, one soft studio shadow, square 1:1 at 1400px.

Two things learned the hard way on the sister project and worth keeping:
Google's content filter refuses prompts featuring people often enough that it
is not worth including any — every slot here is an object. And `resultJson`
comes back as a JSON *string*, not an object.
"""
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

ART = Path(__file__).resolve().parent / 'art'
API = 'https://api.kie.ai/api/v1'
MODEL = os.environ.get('KIE_MODEL', 'nano-banana-pro')
CREDITS_PER_IMAGE = 18

# The constant half of every prompt. Keeping it in one place is what stops the
# set from drifting apart across regenerations.
STYLE = (
    "Studio product photograph, square 1:1 composition. Warm cream paper "
    "background (#F5F1E8), completely plain, no props beyond what is "
    "described. Soft diffused daylight from the upper left, one gentle "
    "contact shadow beneath the object, no hard speculars. Muted, natural, "
    "editorial colour. Generous negative space around the subject. "
    "Photorealistic, sharp, shot on a medium-format camera. "
    "No people, no hands, no faces, no text overlay beyond the packaging's "
    "own printed label."
)

# The packaging has to read as the same brand on every slot, so its
# description is written once and pasted in rather than paraphrased.
BOX = (
    "A matte deep forest-green cardboard carton (#1F3D2E) for a teeth "
    "whitening strip product, upright, photographed three-quarter front. "
    "Printed on it in pale cream and soft gold: a small minimal leaf sprout "
    "mark at the top, then the wordmark 'FREOS' in widely letterspaced "
    "serif capitals, then 'Strisce Sbiancanti' in a lighter serif, then a "
    "thin outlined box containing 'SENZA PEROSSIDO', and near the base the "
    "small lines 'PAP · SMALTO INTATTO' and '14 STRISCE · 7 TRATTAMENTI'. "
    "Clean premium pharmacy aesthetic, matte uncoated stock, crisp printing."
)

SLOTS = [
    {
        'name': '01-main',
        'prompt': BOX + " The carton stands alone, centred, filling the "
                        "middle of the frame.",
    },
    {
        'name': '02-sachet',
        'prompt': BOX + " Beside and slightly in front of the carton lies a "
                        "single sealed sachet in the same deep forest green, "
                        "printed in cream with '2 STRISCE' in large "
                        "letterspaced capitals running along it.",
    },
    {
        'name': '03-striscia',
        'prompt': "A single thin transparent whitening strip for teeth, "
                  "gently curved, resting on a pale cream surface. The strip "
                  "is faintly iridescent with an even matte gel film on its "
                  "inner face, no pattern of dots. Macro, shallow depth of "
                  "field, the far end falling softly out of focus.",
    },
    {
        'name': '04-scala',
        'prompt': "Fourteen small sealed sachets in matte deep forest green "
                  "(#1F3D2E), each printed in cream with a tiny 'FREOS' "
                  "wordmark, arranged flat in a neat grid of two rows of "
                  "seven on a warm cream surface, shot from directly above.",
    },
    {
        'name': '05-gesto',
        'prompt': BOX + " The carton lies flat on a cool pale marble bathroom "
                        "shelf beside a plain unbranded glass of water and a "
                        "simple wooden-handled toothbrush, early morning "
                        "light, calm and uncluttered.",
    },
    {
        'name': '06-limiti',
        'prompt': "A dental study model of an upper and lower set of teeth in "
                  "plain matte white ceramic, resting on a warm cream "
                  "surface, photographed straight on at eye level. Clinical "
                  "and neutral, an object rather than a mouth, no gums, no "
                  "lips, no skin.",
    },
]


def _post(path, payload, key):
    req = urllib.request.Request(
        API + path, data=json.dumps(payload).encode(),
        headers={'Authorization': 'Bearer ' + key,
                 'Content-Type': 'application/json'},
        method='POST')
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def _get(path, key):
    req = urllib.request.Request(
        API + path, headers={'Authorization': 'Bearer ' + key})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def _first_url(data):
    """resultJson is a JSON *string* holding resultUrls."""
    raw = data.get('resultJson')
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except Exception:                              # noqa: BLE001
            return None
    urls = (raw or {}).get('resultUrls') or []
    return urls[0] if urls else None


def main(only=None):
    key = os.environ.get('KIE_API_KEY') or os.environ.get('KIE_AI_API_KEY')
    if not key:
        sys.exit('KIE_API_KEY is not set.')
    ART.mkdir(exist_ok=True)

    todo = [s for s in SLOTS
            if (not only or s['name'] in only)
            and not (ART / (s['name'] + '.png')).exists()]
    if not todo:
        print('Nothing to generate — every requested slot already has a file.')
        return

    try:
        bal = (_get('/chat/credit', key) or {}).get('data')
        print('credits %.2f · this batch needs ~%d'
              % (bal, len(todo) * CREDITS_PER_IMAGE))
        if bal is not None and bal < len(todo) * CREDITS_PER_IMAGE:
            sys.exit('Not enough credits.')
    except SystemExit:
        raise
    except Exception as exc:                           # noqa: BLE001
        print('credit check skipped (%s)' % exc)

    tasks = []
    for slot in todo:
        payload = {'model': MODEL,
                   'input': {'prompt': slot['prompt'] + ' ' + STYLE,
                             'aspect_ratio': '1:1',
                             'output_format': 'png'}}
        for attempt in range(3):
            try:
                res = _post('/jobs/createTask', payload, key)
            except Exception as exc:                   # noqa: BLE001
                res = {'code': 0, 'msg': str(exc)}
            if res.get('code') == 200:
                tasks.append([slot, res['data']['taskId']])
                print('  queued  %-14s %s' % (slot['name'], res['data']['taskId']))
                break
            time.sleep(2 * (attempt + 1))
        else:
            print('  !! %-14s %s' % (slot['name'], res.get('msg')))

    print('\n%d tasks running in parallel…' % len(tasks))
    pending, deadline = list(tasks), time.time() + 900
    while pending and time.time() < deadline:
        time.sleep(5)
        still = []
        for slot, tid in pending:
            try:
                data = (_get('/jobs/recordInfo?taskId=' + tid, key)
                        or {}).get('data') or {}
            except Exception:                          # noqa: BLE001
                still.append([slot, tid])              # a flaky poll is not a failure
                continue
            state = str(data.get('state') or '').lower()
            if state == 'success':
                url = _first_url(data)
                if not url:
                    print('  !! %-14s success with no url' % slot['name'])
                    continue
                dest = ART / (slot['name'] + '.png')
                # tempfile.aiquickdraw.com answers 403 without a User-Agent.
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=120) as r, open(dest, 'wb') as f:
                    f.write(r.read())
                if dest.stat().st_size < 10_000:
                    dest.unlink()
                    print('  !! %-14s download truncated' % slot['name'])
                    continue
                print('  ok      %-14s %3ds  %s cr  %d KB'
                      % (slot['name'], data.get('costTime') or 0,
                         data.get('creditsConsumed'), dest.stat().st_size // 1024))
            elif state in ('fail', 'failed', 'error'):
                print('  !! %-14s %s' % (slot['name'], data.get('failMsg')))
            else:
                still.append([slot, tid])
        pending = still
        if pending:
            print('  … %d still running' % len(pending))

    for slot, tid in pending:
        print('  !! %-14s timed out (task %s)' % (slot['name'], tid))


if __name__ == '__main__':
    main(sys.argv[1:] or None)
