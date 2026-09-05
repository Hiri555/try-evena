"""
Put the real Kaching offer on every page.

The offer changed and the pages never followed. What the cart actually
charges today, read off the live bundle:

    Buy One                 $39.99    4 weeks    $39.99/bottle
    Buy 2 Get 1 FREE (3)    $59.99   12 weeks    $19.99/bottle
    Buy 3 Get 2 FREE (5)    $89.99   20 weeks    $18.00/bottle

The pages were still quoting $45 / $72 / $95 — the tiered deal that was
replaced. Every number below is one of the three above, or arithmetic on
one of them, and nothing else moves.

On "$9 a week": that was $72 spread over 8 weeks. The popular offer is
now $59.99 over 12 weeks, which is $5.00 a week. The sentence has to
move with the price or it stops being true.

On "Eight-week supply": the same bottle is described as four weeks on
the postpartum advertorial AND as four weeks in the Kaching bundle
itself ("See if your skin tolerates it · 4 weeks"). Two sources against
one, and one of them is the offer the customer is actually buying, so
the advertorial is the one that is wrong. Flagged in the reply — revert
this one line if the eight weeks was right and the others are wrong.

Shipping thresholds are deliberately NOT touched. Eight files say $50
and page.pp-advertorial says $60; I could not verify which is correct,
so guessing would just move the error somewhere harder to spot.
"""
import json
import re

EDITS = {
    'config/settings_data.json': [
        ('"sticky_text": "The Daily Reset Serum · $45"',
         '"sticky_text": "The Daily Reset Serum · $39.99"'),
    ],

    'sections/advertorial.liquid': [
        # The advertorial close — the price sits alone inside its own <p>.
        ('margin-bottom:4px">$45</p>', 'margin-bottom:4px">$39.99</p>'),
        ('Eight-week supply', 'Four-week supply'),
        # Schema default behind the sticky bar.
        ('"default": "The Daily Reset Serum · $45"',
         '"default": "The Daily Reset Serum · $39.99"'),
    ],

    'sections/rosalia-funnel-offer.liquid': [
        ('One price ($45), one CTA', 'One price ($39.99), one CTA'),
        ('"label": "Price", "default": "$45"', '"label": "Price", "default": "$39.99"'),
        # Preset tiers — the ladder a fresh section starts with.
        ('{ "type": "tier", "settings": { "qty_label": "1 bottle", "price": "$45" } }',
         '{ "type": "tier", "settings": { "qty_label": "Buy One", "price": "$39.99" } }'),
        ('{ "type": "tier", "settings": { "qty_label": "2 bottles", "price": "$82", "featured": true, "badge_text": "Most chosen" } }',
         '{ "type": "tier", "settings": { "qty_label": "Buy 2 Get 1 FREE", "price": "$59.99", "featured": true, "badge_text": "Most popular" } }'),
        ('{ "type": "tier", "settings": { "qty_label": "3 bottles", "price": "$114" } }',
         '{ "type": "tier", "settings": { "qty_label": "Buy 3 Get 2 FREE", "price": "$89.99" } }'),
    ],

    'templates/page.pp-advertorial.json': [
        ('"price": "$45"', '"price": "$39.99"'),
    ],

    'templates/page.pp-listicle.json': [
        ("$72 is money I'd rather spend on the baby.",
         "$59.99 is money I'd rather spend on the baby."),
        ('about $9 a week', 'about $5 a week'),
        ('spending $45 finding out', 'spending $39.99 finding out'),
    ],

    'templates/page.flusher-listicle.json': [
        ('$72 is more than I want to risk on a maybe.',
         '$59.99 is more than I want to risk on a maybe.'),
        ('about $9 a week', 'about $5 a week'),
    ],
}

log, missed = [], []
for path, pairs in EDITS.items():
    s = open(path, encoding='utf-8').read()
    for old, new in pairs:
        if old not in s:
            missed.append((path, old))
            continue
        n = s.count(old)
        s = s.replace(old, new)
        log.append('%-38s %dx  %s' % (path.split('/')[-1], n,
                                      re.sub(r'\s+', ' ', old)[:64]))
    open(path, 'w', encoding='utf-8').write(s)

print('\n'.join(log))
print('\n%d replacements.' % len(log))
if missed:
    print('\nNOT FOUND (check by hand):')
    for p, o in missed:
        print('  %s :: %r' % (p, o[:70]))

# ---- Gates ---------------------------------------------------------
import glob

STALE = re.compile(r'\$(45|72|95|82|114)\b|\$9 a week|Eight-week supply')
bad = []
for f in sorted(glob.glob('templates/*.json') + glob.glob('sections/*.liquid')
                + glob.glob('snippets/*.liquid') + glob.glob('config/*.json')):
    blob = open(f, encoding='utf-8').read()
    for m in STALE.finditer(blob):
        bad.append('%s :: ...%s...' % (f.split('/')[-1],
                   re.sub(r'\s+', ' ', blob[max(0, m.start() - 70):m.start() + 60])))
print('\nGATE no stale price anywhere:',
      'PASS' if not bad else 'FAIL\n  ' + '\n  '.join(bad))

# Every JSON we touched must still parse.
for f in EDITS:
    if f.endswith('.json'):
        raw = open(f, encoding='utf-8').read()
        # Shopify prepends an auto-generated /* ... */ banner to settings_data.
        json.loads(re.sub(r'^\s*/\*.*?\*/', '', raw, flags=re.S))
print('GATE touched JSON still parses: PASS')

# The three real prices must actually appear on the funnel.
for want, where in [('$39.99', 'templates/page.pp-advertorial.json'),
                    ('$59.99', 'templates/page.flusher-listicle.json'),
                    ('$59.99', 'templates/page.pp-listicle.json')]:
    assert want in open(where, encoding='utf-8').read(), (want, where)
print('GATE real prices present:      PASS')
