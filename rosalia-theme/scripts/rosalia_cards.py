#!/usr/bin/env python3
"""
The two text-bearing slots on the advertorial, rendered rather than generated.

These are the slots an image model must not be trusted with. Both carry a
formula, and a formula that a diffusion model has invented is a fabricated
document — a made-up ingredient list printed as if it were the product's own
label. So they are typeset here, character for character, from data the brand
already publishes on its own live pages.

Provenance of every figure below, scraped 2026-09-01:

    try-rosalia.com/pages/daily-reset      the five levers, with doses
    the flusher listicle, actives table    the same six, cross-checked

Nothing is added to that. The card carries no per-ingredient lactation
verdicts, because those would be claims about a public medical database that
nobody here has verified line by line — the one LactMed sentence that does
appear is the one the advertorial already publishes, and it is attributed.

    python3 scripts/rosalia_cards.py        # writes both into art/
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / 'art'
FONTS = Path('/mnt/skills/examples/canvas-design/canvas-fonts')

# Brand tokens, lifted from snippets/rosalia-funnel-tokens.liquid so these
# sit on the page as if they had always been there.
PAPER = (250, 245, 240)      # --rf-paper  #FAF5F0
WASH = (243, 237, 231)       # --rf-wash   #F3EDE7
INK = (31, 26, 28)           # --rf-ink    #1F1A1C
BODY = (43, 38, 32)          # --rf-body   #2B2620
MUTED = (110, 99, 103)       # --rf-muted  #6E6367
ACCENT = (75, 21, 40)        # --rf-accent #4B1528
RULE = (223, 213, 205)

W, H = 1800, 1200            # 3:2, to match the reserved .rf-slot box


def font(name, size):
    return ImageFont.truetype(str(FONTS / (name + '.ttf')), size)


# The six actives, in the order the advertorial presents them.
ACTIVES = [
    ('Azelaic acid',      '10%',   'The alarm — for redness that will not sit back down'),
    ('Panthenol (B5)',    '5%',    'Holds the barrier together while it closes'),
    ('Centella asiatica', '4%',    'The nerves — for skin on a false alarm'),
    ('Niacinamide',       '3–5%',  'Deliberately not 10%, which is a common cause of stinging'),
    ('Colloidal oat',     '1%',    'The door — barrier support'),
    ('Licochalcone A',    '0.4%',  'The wall — a licorice-root soothing agent'),
]

ABSENT = 'No fragrance · No essential oils · No alcohol · No menthol · No hyaluronic acid'


def rule(d, x0, y, x1, colour=RULE, w=1):
    d.line([(x0, y), (x1, y)], fill=colour, width=w)


def wrap(d, text, f, max_w):
    words, lines, cur = text.split(), [], ''
    for word in words:
        trial = (cur + ' ' + word).strip()
        if d.textlength(trial, font=f) <= max_w:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


# ---------------------------------------------------------------------------
# 1. The actives panel — what the back of the carton states
# ---------------------------------------------------------------------------

def actives_panel(path):
    im = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(im)

    f_eyebrow = font('InstrumentSans-Bold', 26)
    f_title = font('CrimsonPro-Bold', 72)
    f_name = font('CrimsonPro-Regular', 46)
    f_dose = font('IBMPlexMono-Bold', 44)
    f_role = font('InstrumentSans-Regular', 25)
    f_foot = font('InstrumentSans-Regular', 24)

    L, R = 130, W - 130

    # A hairline frame, the way a printed panel is set off from the carton.
    d.rectangle([70, 70, W - 70, H - 70], outline=RULE, width=2)

    y = 150
    d.text((L, y), 'A C T I V E S   P A N E L', font=f_eyebrow, fill=ACCENT)
    y += 52
    d.text((L, y), 'Daily Reset Serum', font=f_title, fill=INK)
    y += 100
    rule(d, L, y, R, INK, 2)
    y += 40

    for name, dose, role in ACTIVES:
        d.text((L, y), name, font=f_name, fill=INK)
        dw = d.textlength(dose, font=f_dose)
        d.text((R - dw, y + 4), dose, font=f_dose, fill=ACCENT)
        y += 56
        d.text((L, y), role, font=f_role, fill=MUTED)
        y += 46
        rule(d, L, y, R)
        y += 26

    y += 6
    d.text((L, y), ABSENT, font=f_foot, fill=BODY)
    y += 40
    for line in wrap(d, 'Six actives at the doses printed above. The complete '
                        'INCI list is on the carton and on the product page — '
                        'read it before you buy, not after.', f_foot, R - L):
        d.text((L, y), line, font=f_foot, fill=MUTED)
        y += 34

    im.save(path, 'PNG')
    return path


# ---------------------------------------------------------------------------
# 2. The one-page card — the thing you hand to a clinician
# ---------------------------------------------------------------------------

def ingredient_card(path):
    im = Image.new('RGB', (W, H), WASH)
    d = ImageDraw.Draw(im)

    f_eyebrow = font('InstrumentSans-Bold', 25)
    f_title = font('CrimsonPro-Bold', 66)
    f_sub = font('InstrumentSans-Regular', 28)
    f_name = font('CrimsonPro-Regular', 42)
    f_dose = font('IBMPlexMono-Bold', 40)
    f_small = font('InstrumentSans-Regular', 24)
    f_note = font('InstrumentSans-Italic', 25)

    L, R = 120, W - 120

    # The card itself, floated on the wash so it reads as a physical sheet.
    d.rectangle([80, 80, W - 80, H - 80], fill=PAPER, outline=RULE, width=2)

    y = 140
    d.text((L, y), 'T A K E   T H I S   T O   Y O U R   C L I N I C I A N',
           font=f_eyebrow, fill=ACCENT)
    y += 50
    d.text((L, y), 'What is in it, and at what dose', font=f_title, fill=INK)
    y += 92
    d.text((L, y), 'Daily Reset Serum · Rosalia · 30 ml', font=f_sub, fill=MUTED)
    y += 54
    rule(d, L, y, R, INK, 2)
    y += 32

    for name, dose, _role in ACTIVES:
        d.text((L, y), name, font=f_name, fill=INK)
        dw = d.textlength(dose, font=f_dose)
        d.text((R - dw, y + 2), dose, font=f_dose, fill=ACCENT)
        y += 62
        rule(d, L, y - 10, R)

    y += 22
    d.text((L, y), ABSENT, font=f_small, fill=BODY)
    y += 44

    d.rectangle([L, y, R, y + 4], fill=ACCENT)
    y += 26
    for line in wrap(d, 'The US National Library of Medicine runs LactMed, a free '
                        'public drug and lactation database. On topical azelaic '
                        'acid it records that roughly four percent is absorbed, '
                        'and that this is not a reason to stop feeding.',
                     f_small, R - L):
        d.text((L, y), line, font=f_small, fill=BODY)
        y += 34

    y += 14
    for line in wrap(d, 'We will not tell you this is safe for you. We are not '
                        'your clinician. Bring this card to the appointment and '
                        'let them read the doses.', f_note, R - L):
        d.text((L, y), line, font=f_note, fill=MUTED)
        y += 34

    im.save(path, 'PNG')
    return path


if __name__ == '__main__':
    ART.mkdir(exist_ok=True)
    for fn, name in ((actives_panel, 'actives-panel'),
                     (ingredient_card, 'ingredient-card')):
        p = fn(ART / (name + '.png'))
        print('  %-18s %sx%s  %d KB' % (name, W, H, p.stat().st_size // 1024))
