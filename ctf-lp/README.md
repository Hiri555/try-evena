# Rosalia — Daily Reset Serum · Advertorial (Phase 1 prototype)

A standalone, art-directed **editorial letter** for Rosalia — built to the v2 brief:
the source HTML is a *manuscript* (locked copy), the visual universe is invented.
Reads like a Kinfolk / Aesop-journal / NYT-Styles feature, not a styled skeleton.
Zero Shopify code (that is Phase 2).

**Preview:** open `ctf-lp/index.html` — no build step, no dependencies.

```bash
python3 -m http.server 8000   # from repo root → http://localhost:8000/ctf-lp/
```

## The direction — "La Lettre"

- **Rosalia masthead** + kicker + **byline with reading time** ("By Margot · a six-minute
  letter · written at a café, 2:47 PM") — a magazine feature opener.
- **Fraunces** (variable editorial serif, optical sizing) for display + **Inter** for body.
- Refined **muted-editorial palette** (dusty rose `#C4718E`, wine `#7A3A54`/`#4B1528`,
  warm paper) — dustier, less candy than the skeleton.
- **No reader-visible architecture labels** (BLOC A / 10.5 / Close etc. removed) — briques
  flow through **ornamental separators**, not signposts.
- Subtle **paper grain**, a **scroll progress hairline**, a **drop cap** opening the café
  chapter, magazine **pull-quotes** with hanging quotation mark.

## Signature motion (all respect `prefers-reduced-motion`, final states preserved)

- **Rosacea progression (headline visual):** four documentary portrait plates whose
  cheek-and-nose **flush deepens** Stage 01→04 as you read — regret anticipation as motion,
  abstract (not literal/exploitative), holds on Stage 04.
- **The loop:** animated SVG, pulses travelling the five levers, node 05 emergent in wine.
- **Thermostat vs ratchet:** animated gauges — healthy needle returns, yours only rises.
- **Decoupling climax:** line-by-line mask-wipe reveal (Level 4 peak).
- Core-claim word-by-word reveal · count-up stats · "I was neither" pulse ·
  breathing main CTA with depth-on-hover · guarantee underline draw · scroll reveals.

## Interactive

Scroll-snap testimonial carousel (progress dots + one-time nudge hint) · FAQ accordion
(+/−, first pre-open) · skip CTAs with sliding arrow.

## Real imagery (generated via Higgsfield, per taste-skill §4.8)

All in `assets/`:
- **Hero** `hero.webp` — a woman at a mirror catching her own reflection (open-loop /
  pattern-interrupt, not the earlier phone shot).
- **3 packshots**, each a distinct register (`packshot-editorial` marble / `packshot-quiet`
  overhead linen / `packshot-dramatic` side-light), generated from the **real branded
  Rosalia flacon** as reference so the actual label shows.
- **Rosacea 4-panel** — real consistent-face progression, `rosacea-desktop.webp` (1×4) +
  `rosacea-mobile.webp` (2×2) via `<picture>`, STAGE/AGE labels baked in.
- **The loop** — the medical cross-section illustration `loop.webp`, **animated**
  (`loop.mp4`, muted autoplay loop, lazy-loaded on scroll, poster = the still; paused under
  reduced-motion).
- **Café** still-life `cafe.webp`.

The masthead no longer prints "Rosalia" (opens as a letter, byline only). The thermostat
stays the brief-commissioned animated SVG.

## Doctrine honoured

All **12 verbatim-locked phrases** character-perfect · brand **Rosalia** throughout ·
5 reader-voice CTAs (`#checkout` placeholder, no price/shipping on button) · Margot solo
first-person · no urgency / scarcity / stars / "as seen in" / trust badges / sticky bar /
popups / corporate "we". Asset slots stay **visible with spec + function labels** (the three
packshots each in a different register: editorial / quiet / dramatic).

## QA

Verified in Chromium: **no horizontal overflow** at 390px, **no JS errors**, semantic HTML
(`<article>`/`<blockquote>`/`<figure>`/`<footer>`), `alt`/`aria-label` on visuals, visible
focus states, meaningful reduced-motion path.

## Phase 2 (after Chief validates the universe)

Port 1:1 to Shopify Liquid — `layout/full-page.liquid` (keep `{{ content_for_header }}`),
`templates/page.advertorial.liquid`, 12 modular sections with `@app` block slots + CSS
app-gatekeeper, product form Add-to-Cart with `cart.attributes.source = 'advertorial-v3'`,
Meta Pixel + GA4 events (the CTA handler already logs `Lead`/`AddToCart` intent).
