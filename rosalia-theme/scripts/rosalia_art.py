#!/usr/bin/env python3
"""
Rosalia funnel art pipeline — generate the sixteen image slots, then wire them.

    export KIE_API_KEY=...
    python3 scripts/rosalia_art.py generate            # all pending slots
    python3 scripts/rosalia_art.py generate n04-macro  # just one
    python3 scripts/rosalia_art.py wire art/uploaded.json
    python3 scripts/rosalia_art.py audit

`generate` writes 3:2 files into art/. `wire` takes a {slot: "shopify://..."}
map and patches the template JSON in place. `audit` prints which slots are
still empty on disk and in the templates.

Why 3:2 and nothing else: .rf-slot reserves `aspect-ratio: 3 / 2`, so any
other shape reflows the page the moment the asset lands. Responsiveness is
already handled — the theme pipes every image through image_tag with
widths 400…1400 and a sizes attribute, so one large master per slot is all
that is needed.

Two slots are deliberately absent from the manifest. They are listed at the
bottom under REFUSED, with the reason, so nobody has to rediscover it.
"""
import base64
import json
import os
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / 'art'
API = 'https://api.kie.ai/api/v1'
# Probed against the live account: google/nano-banana-pro is rejected 422,
# the id that works is bare. 18 credits and ~18s per image, against 4 for
# google/nano-banana — worth it here, the photographs carry the pages.
MODEL = os.environ.get('KIE_MODEL', 'nano-banana-pro')
CREDITS_PER_IMAGE = 18

# --------------------------------------------------------------------------
# House style
# --------------------------------------------------------------------------
# Appended to every prompt. The negative half matters more than the positive
# half: the failure mode for this brand is not "ugly", it is "stock photo" —
# a smiling woman with poreless skin holding an unbranded white bottle. Every
# clause below exists to push away from that.

STYLE = (
    "Shot on 35mm film, natural available light only — no flash, no studio "
    "lighting, no beauty dish, no reflector. Muted desaturated palette: warm "
    "off-white, soft greys, dusty neutrals. Fine visible film grain, gentle "
    "contrast, slightly lifted blacks. Documentary editorial photograph for a "
    "magazine feature — candid, unstyled, unglamorous, with generous negative "
    "space and an off-centre subject. "
    "Absolutely no text, no lettering, no numerals, no signage, no logos, no "
    "watermarks, no brand marks, no readable packaging. "
    "Not glossy, not retouched, no skin smoothing, no airbrushing, no HDR, "
    "not a stock photo, not an advertisement."
)

SKIN = (
    "Skin is unretouched and real: visible pores, fine lines, uneven tone, "
    "natural shine. Redness is diffuse and plausible, never a costume rash. "
)

# --------------------------------------------------------------------------
# The manifest — one entry per image slot in the funnel
# --------------------------------------------------------------------------
# `target` is (template file, section id, block id or None, setting key).
# `alt` overwrites the alt text only where the template has none.

SLOTS = [

    # ---- flusher prelander -------------------------------------------------
    {
        'name': 'fl-hero-desk',
        'target': ('page.flusher-prelander.json', 'hero', None, 'image'),
        'alt': None,
        'prompt':
            "An empty office desk beside a large window in late afternoon. Cold "
            "pale light rakes in from the left. A soft grey cardigan is draped "
            "over the back of an office chair, and the chair is turned away from "
            "the desk to face the glass. A closed laptop, a half-drunk glass of "
            "water, a loose stack of paper. Nobody in frame. No product of any "
            "kind. The emptiness is the subject.",
    },

    # ---- postpartum prelander ---------------------------------------------
    {
        'name': 'pp-hero-bedroom',
        'target': ('page.pp-prelander.json', 'hero', None, 'image'),
        'alt': None,
        'prompt':
            "A bedroom at first light. The air is blue-grey and not yet warm. "
            "The bed is unmade on one side only; the other side is flat and "
            "untouched. A phone lies face-down on the crumpled sheet. Curtains "
            "half open onto a pale sky. Nobody in frame — no person, no baby, "
            "no cot, no product.",
    },

    # ---- postpartum advertorial -------------------------------------------
    {
        'name': 'pp-hero-phone',
        'target': ('page.pp-advertorial.json', 'hero', None, 'image'),
        'alt': 'A phone lying screen-up on a dark bed, its screen the only light in the room',
        'prompt':
            "Seen from directly above at a slight angle: a phone lying screen-up "
            "on a dark bed, its screen the only light source in the room, "
            "throwing a cold rectangle of glow across the sheets. A bag of frozen "
            "peas rests beside it, softening and beading with condensation. The "
            "corner of a knitted cot blanket enters the bottom of the frame. Deep "
            "shadow everywhere else. No person, no face, no hands, no product. "
            "Film pushed in low light: near-black shadows, one cold blue-white "
            "screen glow, heavy grain. The screen is a featureless blur of light "
            "with nothing readable on it.",
    },
    {
        'name': 'product-bottle',
        'target': ('page.pp-advertorial.json', 'step8', 'image8', 'image'),
        'alt': 'A single amber glass serum bottle on a plain surface in morning window light',
        'prompt':
            "A single amber glass serum bottle with a matte black dropper cap, "
            "standing alone on a plain warm off-white plaster surface in soft "
            "morning window light from the left. One long soft shadow. The bottle "
            "is completely unlabelled — bare glass, no sticker, no printing, no "
            "embossing. No props, no hands, no bathroom shelf, no water droplets, "
            "no foliage. Square-on, eye level, centred low in a wide frame.",
        'note':
            "Superseded by bottle-ledge, which carries the real label. The "
            "unlabelled version stays in the manifest as the safe default: "
            "generate a bare bottle until the branding is described exactly.",
    },

    # ---- flusher listicle --------------------------------------------------
    {
        'name': 'n01-mirror',
        'target': ('page.flusher-listicle.json', 'blk1', None, 'image'),
        'alt': None,
        'prompt':
            "A woman in her thirties leans in close to a corporate office bathroom "
            "mirror under flat overhead fluorescent light. She pulls her cheek "
            "taut with two fingers to look at the skin. No makeup. Diffuse redness "
            "across her cheeks and nose. Her expression is plain concentration, "
            "not distress. Tiled wall, a row of taps, a paper towel dispenser out "
            "of focus behind her. Slightly green institutional cast against warm "
            "skin. " + SKIN,
    },
    {
        'name': 'n09-screen',
        'target': ('page.flusher-listicle.json', 'blk2', 'image1', 'image'),
        'alt': None,
        'prompt':
            "Seen from behind and slightly above: a woman at a desk reaches up "
            "with one hand to tilt her laptop screen downward during a video call. "
            "The call grid on the screen is blurred beyond legibility. Her shoulders "
            "are tense. Home office, daylight from a window ahead of her. Her face "
            "is not visible. The gesture is the subject — a small private "
            "adjustment nobody on the call can see.",
    },
    {
        'name': 'n02-drawer',
        'target': ('page.flusher-listicle.json', 'blk3', 'image1', 'image'),
        'alt': None,
        'prompt':
            "Straight-down overhead view into an open bathroom drawer holding "
            "about eleven abandoned skincare products jumbled together: creased "
            "and half-squeezed tubes, a glass jar crusted at the rim, pump bottles "
            "with dried product at the nozzle, torn foil sachets, a dropper "
            "bottle on its side. Everything is plain, unbranded and unlabelled — "
            "bare white, frosted and amber containers with no printing whatsoever. "
            "Flat soft daylight, honest and unstyled, slightly dusty.",
    },
    {
        'name': 'n04-macro',
        'target': ('page.flusher-listicle.json', 'blk5', 'image1', 'image'),
        'alt': None,
        'prompt':
            "Extreme macro of an adult cheek filling the frame, lit by soft window "
            "light. Unretouched skin showing diffuse background redness and fine "
            "branching telangiectasia — thin red vessels visible just under the "
            "surface. Real texture: pores, vellus hair, faint flaking, uneven tone. "
            "Clinical honesty, not horror: shallow focus, calm neutral framing, no "
            "dramatic lighting. No face, no eye, no mouth — skin only.",
    },
    {
        'name': 'n11-dishes',
        'target': ('page.flusher-listicle.json', 'blk6', 'image1', 'image'),
        'alt': None,
        'prompt':
            "Five shallow unglazed ceramic dishes in a straight row on a warm "
            "plaster surface, photographed from a low three-quarter angle in soft "
            "directional daylight. Each dish holds one raw material and nothing "
            "else: fine white crystalline powder; a single clear viscous gel drop; "
            "a shallow pool of pale yellow liquid; dried green leaf fragments; "
            "fine oat-coloured powder. Long soft shadows to the right. Nothing "
            "else in frame — no bottles, no tools, no hands, no labels. Still life "
            "with the restraint of a materials catalogue.",
    },
    {
        'name': 'n10-laugh',
        'target': ('page.flusher-listicle.json', 'blk11', 'image1', 'image'),
        'alt': None,
        'prompt':
            "A woman in her late thirties laughing at something out of frame, "
            "standing by a sunlit window holding a mug in both hands. Warm "
            "late-morning light across her face. No makeup. Her cheeks and nose "
            "are still clearly red — the redness has not been resolved and must "
            "not be. The point of the picture is an ordinary good moment happening "
            "anyway. " + SKIN,
    },

    # ---- postpartum listicle -----------------------------------------------
    {
        'name': 'n05-3am',
        'target': ('page.pp-listicle.json', 'blk1', None, 'image'),
        'alt': None,
        'prompt':
            "A woman standing in a dark hallway at three in the morning, her face "
            "lit only from below by the phone she is holding. Tired eyes, heavy "
            "lids, visible redness across the cheeks, no makeup, hair pushed back. "
            "Everything beyond her is deep shadow. Cold screen light on warm skin. "
            "Heavy grain, low light film. " + SKIN,
    },
    {
        'name': 'n08-bathtub',
        'target': ('page.pp-listicle.json', 'blk3', 'image1', 'image'),
        'alt': None,
        'prompt':
            "A woman sitting on the edge of a bathtub in an ordinary, slightly "
            "worn bathroom in soft grey daylight. Elbows on knees, hands loose, "
            "looking down and away from the camera. Visible redness across the "
            "cheeks and chin, no makeup, comfortable clothes. Tiles, a towel over "
            "the radiator, nothing staged. She is resting, not crying. " + SKIN,
    },
    {
        'name': 'n06-phone',
        'target': ('page.pp-listicle.json', 'blk5', 'image1', 'image'),
        'alt': None,
        'prompt':
            "One hand holding a phone up toward warm morning bathroom light. The "
            "screen shows a pale document — a wall of soft grey lines standing in "
            "for text, completely blurred and illegible, no readable characters "
            "anywhere. No face in frame, only the hand and forearm. Shallow focus "
            "on the screen edge, background dissolving into warm white tile.",
    },
    {
        'name': 'pp-08-portrait',
        'target': ('page.pp-listicle.json', 'blk11', 'image1', 'image'),
        'alt': None,
        'prompt':
            "A woman in her early thirties standing in a bathroom in warm morning "
            "light, looking away from the camera toward the window. No makeup, "
            "hair loosely tied, visible redness across her cheeks. Calm and "
            "unposed — a person at the start of an ordinary day, not a before "
            "picture and not an after picture. " + SKIN,
    },
]

# --------------------------------------------------------------------------
# The two slots that carry a formula are typeset, not generated. A diffusion
# model asked for "a readable ingredient label" will produce a readable
# ingredient label — of a formula it invented. Both are rendered instead by
# scripts/rosalia_cards.py from the doses the brand already publishes on
# try-rosalia.com/pages/daily-reset, so the text is exact and checkable.

TYPESET = [
    {
        'name': 'actives-panel',
        'target': ('page.pp-advertorial.json', 'step8', 'image12', 'image'),
        'alt': 'The actives panel: six ingredients with the dose of each',
    },
    {
        'name': 'ingredient-card',
        'target': ('page.pp-advertorial.json', 'step8', 'bonus15', 'image'),
        'alt': 'A one-page card listing the six actives and their doses, to take to a clinician',
    },
]


# --------------------------------------------------------------------------
# kie.ai
# --------------------------------------------------------------------------

def _post(path, payload, key):
    req = urllib.request.Request(
        API + path,
        data=json.dumps(payload).encode(),
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


def generate(only=None):
    """Queue every pending slot at once, then poll them all at once.

    Sixteen images take about as long as one. Never generate serially and
    never block on a single long wait — a task that is already finished
    should be collected on the next five-second tick, not after a timeout.
    """
    key = os.environ.get('KIE_API_KEY') or os.environ.get('KIE_AI_API_KEY')
    if not key:
        sys.exit('KIE_API_KEY is not set.')
    ART.mkdir(exist_ok=True)

    todo = [s for s in SLOTS
            if (only is None or s['name'] in only)
            and not (ART / (s['name'] + '.png')).exists()]
    if not todo:
        print('Nothing to generate — every requested slot already has a file.')
        return

    # Never start a batch the balance cannot cover.
    try:
        bal = (_get('/chat/credit', key) or {}).get('data')
        need = len(todo) * CREDITS_PER_IMAGE
        print('credits %.2f · this batch needs ~%d' % (bal, need))
        if bal is not None and bal < need:
            sys.exit('Not enough credits.')
    except SystemExit:
        raise
    except Exception as exc:                           # noqa: BLE001
        print('credit check skipped (%s)' % exc)

    tasks = []
    for slot in todo:
        payload = {
            'model': MODEL,
            'input': {
                'prompt': slot['prompt'] + ' ' + STYLE,
                'aspect_ratio': '3:2',
                'output_format': 'png',
            },
        }
        for attempt in range(3):
            try:
                res = _post('/jobs/createTask', payload, key)
            except Exception as exc:                   # noqa: BLE001
                res = {'code': 0, 'msg': str(exc)}
            if res.get('code') == 200:
                tid = res['data']['taskId']
                tasks.append([slot, tid])
                print('  queued  %-18s %s' % (slot['name'], tid))
                break
            time.sleep(2 * (attempt + 1))
        else:
            print('  !! %-18s %s' % (slot['name'], res.get('msg')))

    print('\n%d tasks running in parallel…' % len(tasks))
    pending = list(tasks)
    deadline = time.time() + 900
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
                    print('  !! %-18s success with no url' % slot['name'])
                    continue
                dest = ART / (slot['name'] + '.png')
                urllib.request.urlretrieve(url, dest)
                if dest.stat().st_size < 10_000:       # truncated, not done
                    dest.unlink()
                    print('  !! %-18s download truncated' % slot['name'])
                    continue
                print('  ok      %-18s %3ds  %s cr  %d KB'
                      % (slot['name'], data.get('costTime') or 0,
                         data.get('creditsConsumed'), dest.stat().st_size // 1024))
            elif state in ('fail', 'failed', 'error'):
                print('  !! %-18s %s' % (slot['name'], data.get('failMsg')))
            else:
                still.append([slot, tid])
        pending = still
        if pending:
            print('  … %d still running' % len(pending))

    for slot, tid in pending:
        print('  !! %-18s timed out (task %s)' % (slot['name'], tid))


def _first_url(data):
    """resultJson is a JSON *string* holding resultUrls."""
    try:
        urls = json.loads(data.get('resultJson') or '{}').get('resultUrls') or []
        if urls:
            return urls[0]
    except (ValueError, TypeError):
        pass
    hits = re.findall(r'https://[^"\\ ]+\.(?:png|jpe?g|webp)', json.dumps(data))
    return hits[0] if hits else None


# --------------------------------------------------------------------------
# Wiring
# --------------------------------------------------------------------------

def wire(map_path):
    """map_path: {"n01-mirror": "shopify://shop_images/rosalia-n01-mirror.png", …}"""
    mapping = json.loads(Path(map_path).read_text())
    touched = {}

    for slot in SLOTS + TYPESET:
        ref = mapping.get(slot['name'])
        if not ref:
            continue
        tpl, sid, bid, key = slot['target']
        path = ROOT / 'templates' / tpl
        doc = touched.get(tpl) or json.loads(path.read_text(encoding='utf-8'))
        touched[tpl] = doc

        sec = doc['sections'][sid]
        node = sec['blocks'][bid] if bid else sec
        st = node.setdefault('settings', {})
        st[key] = ref
        if slot.get('alt'):
            st['alt' if bid else 'image_alt'] = slot['alt']
        print('  %-26s %s / %s%s' % (slot['name'], tpl, sid,
                                     '/' + bid if bid else ''))

    for tpl, doc in touched.items():
        path = ROOT / 'templates' / tpl
        path.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n',
                        encoding='utf-8')
    print('\n%d template(s) rewritten.' % len(touched))


# --------------------------------------------------------------------------

def audit():
    print('%-18s %-8s %-8s %s' % ('SLOT', 'FILE', 'WIRED', 'TARGET'))
    for slot in SLOTS + TYPESET:
        tpl, sid, bid, key = slot['target']
        doc = json.loads((ROOT / 'templates' / tpl).read_text(encoding='utf-8'))
        sec = doc['sections'][sid]
        node = sec['blocks'][bid] if bid else sec
        wired = bool((node.get('settings') or {}).get(key))
        on_disk = any((ART / (slot['name'] + e)).exists()
                      for e in ('.png', '.jpg'))
        print('%-18s %-8s %-8s %s/%s%s'
              % (slot['name'], 'yes' if on_disk else '—',
                 'yes' if wired else '—', tpl, sid, '/' + bid if bid else ''))
    print('\nThe last two are typeset by scripts/rosalia_cards.py, not generated —\n'
          'they carry a formula, and an invented formula is a fabricated document.')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'audit'
    if cmd == 'generate':
        generate(sys.argv[2:] or None)
    elif cmd == 'wire':
        wire(sys.argv[2])
    else:
        audit()
