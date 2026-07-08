# Calming the Flush — Advertorial LP V3 (Phase 1 prototype)

Standalone, fully-responsive visualization prototype of the **Daily Reset Serum**
long-form advertorial. Verbatim copy locked, editorial "Aesop-adjacent" universe,
Wundt-compliant motion. Zero Shopify code (that is Phase 2).

**Live preview:** open `index.html` — no build step, no dependencies.

```bash
# from repo root
python3 -m http.server 8000
# then open http://localhost:8000/ctf-lp/
```

## What's built

- **12 briques**, in order, single-page scroll (no Brique 09 — intentional):
  01 Hero · 02 Lead · 03 Background Story (BLOC A + B) · 04 Problem Agitation ·
  05 Root Cause · 06 Mechanism · 07 Product Intro · 08 Social Proof ·
  10 Make It Personal · 10.5 Trust Stack · 11 Close (+ FAQ) · 12 Final Whisper
- **All 12 verbatim-locked doctrine phrases** present, character-perfect
  (see `DEV_INSTRUCTIONS.md` §13). Copy is never paraphrased.
- **5 CTAs** — 4 skip (reader-voice pills, anchor-jump) + 1 main (`#checkout`
  placeholder for Phase 2 Add-to-Cart). No prices, no shipping subtitle, no sales language.

## Motion (all respect `prefers-reduced-motion`, final states preserved)

| Brique | Motion |
|---|---|
| 01/02/… | Scroll-triggered fade/stagger reveals (IntersectionObserver) |
| 02 · 08 | Count-up stats (21 mois / 43 / 312 · 87 / 91) |
| 04 | **4-panel rosacea cross-fade** — 1.5s/stage, holds on Stage 4 (regret anticipation) |
| 05 | Animated **loop SVG** (5 levers, pulsing arrows, node 05 emergent) |
| 05 | "I was neither" highlight pulse |
| 06 | "Simultaneously." scale-in · animated **thermostat SVG** (healthy returns, yours only rises) |
| 07 | Core-claim word-by-word reveal |
| 08 | Testimonial scroll-snap carousel · dots · one-time auto-nudge hint |
| 10 | Decoupling-climax line reveal (Level 4) · paired desire stack |
| 11 | Breathing main CTA · guarantee underline draw · FAQ accordion (+/−, first pre-open) |

Reduced-motion users get the finished layout instantly (Stage 4 shown, needles at rest, all copy visible).

## Placeholders (intentionally visible — see `DEV_INSTRUCTIONS.md` §6)

Every asset slot renders as a dashed placeholder with its **spec + strategic function**
label intact so Chief can see where assets go before commissioning. The 3-packshot rule
(07 editorial / 10.5 quiet / 11 dramatic) is labelled. Animated SVGs stand in for the
thermostat + loop until the illustrator commission lands.

## Doctrine guardrails honoured

No urgency, scarcity, anchoring, star ratings, "as seen in", trust-badge soup,
sticky buy-bar, exit-intent, chat popups, or corporate "we" (the one preserved "we"
in Brique 07 "What we left out" stays). Editorial letter, not sales page.

## Design system

Cormorant Garamond (display) + Inter (UI/body), Google Fonts. Palette from the source
`:root` variables (muted rose / deep wine / cream). Prose max-width ~660px, line-height 1.75,
letter-spaced eyebrows. Accessibility: semantic `<section>`/`<h2>`/`<blockquote>`/`<footer>`,
`alt`/`aria-label` on visuals, visible focus states, meaningful reduced-motion path.

## Phase 2 (after Chief validates)

Port to Shopify Liquid: `layout/full-page.liquid` (keep `{{ content_for_header }}`),
`templates/page.advertorial.liquid`, 12 modular sections with `@app` block slots + CSS
app-gatekeeper, product form Add-to-Cart with `cart.attributes.source = 'advertorial-v3'`,
Meta Pixel + GA4 events (the CTA click handler already logs `Lead`/`AddToCart` intent to console).
