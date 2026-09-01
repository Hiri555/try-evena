"""
Three pages, three shapes.

The complaint was fair: rosalia-funnel-grid shipped on all three funnel
pages with the same four photographs, the same four lines and the same
heading, which is what a template looks like when nobody bothered. The
three pages are read by three different people:

  flusher-listicle   has already bought and failed with five products
                     and wants to know what is different in this bottle
  pp-listicle        is holding a baby in the other arm
  pp-advertorial     is reading the founder's account of making it

So each gets a different shape (swatch / essay / ledger), a different
set of photographs, and different lines.

Every line below is a fact already published somewhere on this store,
and the source is named in the comment above it. Nothing here is new
evidence and nothing is a testimonial. The doses come from the
"pairs4" block that already sits on both listicles:

    Azelaic acid 10% · Panthenol B5 5% · Centella asiatica 4%
    Niacinamide 3–5% · Colloidal oat 1% · Licochalcone A 0.4%

and 43 / 21 months / 312 / 4-in-100 come from the panel readout and the
founder's letter, both already on the page.
"""
import json

IMG = lambda n: 'shopify://shop_images/rosalia-grid-%s.png' % n


# ── 1. flusher-listicle — the spec sheet ─────────────────────────────
# Her argument is that six products failed because each pulled one
# lever. So show the levers, unmixed, with the dose on each. The doses
# are the ones already printed further up the same page.
FLUSHER = {
    'settings': {
        'variant': 'swatch',
        'eyebrow': 'Four of the six, unmixed',
        'heading': 'Every one of these is on the label, at this number.',
        'intro': "<p>Not a blend, not a complex, not a proprietary anything. Six actives, each at a stated percentage, and no hyaluronic acid — the ingredient nearly every serum you have already tried leads with.</p>",
        'footnote': "<p>The other two are panthenol B5 at 5% and niacinamide held at 3–5%, deliberately low. The full list and every percentage are on the product page.</p>",
        'container': 'wide',
        'padding_top': 28, 'padding_bottom': 28,
        'background': '#FAF5F0', 'text_color': '#2B2620',
    },
    'cards': [
        # Dose: published in the ingredient table on this page.
        ('mat-azelaic', 'A shallow dark dish of fine white azelaic acid powder on a slate surface',
         '10%', 'Azelaic acid',
         'The one your dermatologist writes down. The prescription is 15% or 20%; this is the highest you can buy without one.'),
        ('mat-centella', 'Dried centella asiatica leaves on dark slate',
         '4%', 'Centella asiatica',
         'For the barrier that stopped holding. Four percent is a working dose, not a trace for the label.'),
        ('mat-oat', 'A pale ceramic dish of finely milled colloidal oat powder on slate',
         '1%', 'Colloidal oat',
         'For the sting in the ninety seconds after you wash. It is the reason there is no menthol in here.'),
        ('mat-root', 'Cut lengths of dried licorice root on a dark slate slab',
         '0.4%', 'Licochalcone A',
         'Drawn from licorice root. It does not constrict a vessel, so it cannot hide the red — it works on the heat underneath.'),
    ],
}


# ── 2. pp-listicle — the photo essay ─────────────────────────────────
# She has no time and one hand. Fewer things, bigger, and the lines are
# about what the product asks of her day rather than what is in it.
POSTPARTUM = {
    'settings': {
        'variant': 'essay',
        'eyebrow': 'What it actually asks of you',
        'heading': 'Two minutes, once, at the end of the day.',
        'intro': "<p>You do not have a routine and nobody sensible is going to sell you one. Here is the whole of what this is, so you can decide whether it fits in a day that has nothing left in it.</p>",
        'footnote': "<p>Ask your doctor or OB before using any skincare product if you are pregnant or breastfeeding. Take them the percentages — they are all on the product page.</p>",
        'container': 'wide',
        'padding_top': 28, 'padding_bottom': 28,
        'background': '#FAF5F0', 'text_color': '#2B2620',
    },
    'cards': [
        # "One step" — the product is a single serum, no routine sold.
        ('pp-night', 'A bedside table at night: a phone face-up and glowing, a small unlabelled bottle and a folded muslin cloth',
         '', 'One step, at night',
         'It goes on last, on a clean face, and that is the entire instruction. There is no morning half and nothing to buy alongside it.'),
        # Formula facts, published verbatim on this page.
        ('pp-counter', 'A kitchen table at night: a half-drunk glass of water, a burp cloth, a pacifier and a small dropper bottle under lamplight',
         '', 'Nothing in it that stings',
         'Zero fragrance. Zero essential oils. Zero alcohol. Zero menthol. Niacinamide held at 3–5% instead of the 10% that set your face off two years ago.'),
        # Refund mechanics, as published on the refund policy page. The
        # 4-in-100 figure is deliberately NOT repeated here — the panel
        # readout directly above this section already leads with it, and
        # saying it twice on one page makes it sound like a slogan
        # rather than a number.
        ('pp-basket', 'A woven basket of folded muslin cloths on bedroom floorboards with a small bottle resting on top',
         '60 days', 'And if it does nothing',
         'Sixty days from the day it arrives. Opened bottles count, there is no form to fill in, and you do not ship anything back — which matters when leaving the house is the hard part.'),
    ],
}


# ── 3. pp-advertorial — the ledger ───────────────────────────────────
# The founder's letter is the page. So the section is the log of making
# it: how long, how many tries, how many women, and the number that did
# not go her way. All four are already published in the letter.
ADVERTORIAL = {
    'settings': {
        'variant': 'ledger',
        'eyebrow': 'The log',
        'heading': 'What it took, including the part that failed.',
        'intro': "<p>Every figure below is one we have published elsewhere on this site and would rather you checked. The last one is the one most brands leave out.</p>",
        'footnote': "<p>Sources: the founder's letter and the product page. If a number here does not match one there, the number there is the correct one and we want to know.</p>",
        'container': 'measure',
        'padding_top': 28, 'padding_bottom': 28,
        'background': '#FAF5F0', 'text_color': '#2B2620',
    },
    'cards': [
        ('lab-notes', 'An open notebook of handwritten formulation notes on a workbench beside a pen',
         '21 months', 'In a dermatology lab',
         'Not a white-label bottle with a name put on it. Twenty-one months of it, most of them spent on things that did not work.'),
        ('lab-scale', 'A precision laboratory balance on a white bench with a pinch of powder in the weighing dish and tweezers beside it',
         '43', 'Formulations before this one',
         'Forty-two of them are not for sale. Six actives survived, and the percentage of each is printed where you can read it.'),
        ('lab-batch', 'A row of small amber and clear sample jars with blank paper tags tied on, on a worn wooden bench',
         '312', 'Women, over eight weeks',
         'Not fourteen days. The panel saw the shift somewhere in week seven or eight, which is why nothing here promises you a fortnight.'),
        ('lab-bench', 'A wooden rack of small glass sample vials on a laboratory bench with a spatula set down beside it',
         '4 in 100', 'Saw no change at all',
         'We print that one too. A company that hides its failure rate is not a company you can check — and if you are one of the four, the sixty-day refund is what it is for.'),
    ],
}


PLAN = [
    ('templates/page.flusher-listicle.json', FLUSHER),
    ('templates/page.pp-listicle.json',      POSTPARTUM),
    ('templates/page.pp-advertorial.json',   ADVERTORIAL),
]

for path, spec in PLAN:
    doc = json.load(open(path, encoding='utf-8'))
    sec = doc['sections']['grid']
    assert sec['type'] == 'rosalia-funnel-grid', sec['type']

    sec['settings'] = spec['settings']
    sec['blocks'] = {}
    sec['block_order'] = []
    for i, (img, alt, fig, label, line) in enumerate(spec['cards'], 1):
        bid = 'c%d' % i
        sec['blocks'][bid] = {
            'type': 'card',
            'settings': {'image': IMG(img), 'alt': alt,
                         'figure': fig, 'label': label, 'line': line},
        }
        sec['block_order'].append(bid)

    json.dump(doc, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    open(path, 'a', encoding='utf-8').write('\n')
    print('%-38s %-7s %d cards  %s'
          % (path.split('/')[-1], spec['settings']['variant'],
             len(spec['cards']),
             ' · '.join(c[0] for c in spec['cards'])))

# ── Gates ────────────────────────────────────────────────────────────
print()
seen_variants, seen_headings, seen_images = set(), set(), []
for path, _ in PLAN:
    sec = json.load(open(path, encoding='utf-8'))['sections']['grid']
    seen_variants.add(sec['settings']['variant'])
    seen_headings.add(sec['settings']['heading'])
    imgs = tuple(sorted(b['settings']['image'] for b in sec['blocks'].values()))
    seen_images.append(imgs)

print('GATE three distinct shapes  :', 'PASS' if len(seen_variants) == 3 else 'FAIL %s' % seen_variants)
print('GATE three distinct headings:', 'PASS' if len(seen_headings) == 3 else 'FAIL')
print('GATE no shared photograph   :',
      'PASS' if len(set().union(*[set(i) for i in seen_images])) == sum(len(i) for i in seen_images)
      else 'FAIL — a photo appears on more than one page')

# Nothing that looks like a testimonial may have crept in.
BANNED = ('★', 'stars', 'verified buyer', '5/5')
bad = []
for path, _ in PLAN:
    blob = json.load(open(path, encoding='utf-8'))['sections']['grid']
    for b in blob['blocks'].values():
        for k, v in b['settings'].items():
            if any(t in str(v).lower() for t in BANNED):
                bad.append((path, k, v))
print('GATE no rating/testimonial  :', 'PASS' if not bad else 'FAIL %s' % bad)
