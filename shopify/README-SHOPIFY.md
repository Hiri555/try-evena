# Rosalia — Shopify port (modular)

A drop-in, full-page advertorial for Shopify: **no header, no footer**, editable from the
theme customizer. Copy stays doctrine-locked (inline); **media, colours, the product
(Add-to-Cart) and motion are editable settings**.

```
shopify/
├── layout/full-page.liquid            # minimal layout, keeps {{ content_for_header }} for pixels/apps
├── templates/page.advertorial.liquid  # applies the layout + renders the section
├── sections/advertorial.liquid        # the whole LP + schema settings + @app block slot
└── assets/
    ├── advertorial.css                # all styles (externalized)
    ├── advertorial.js                 # scroll reveals, counters, carousel, FAQ, lazy loop video
    ├── hero.webp · cafe.webp
    ├── packshot-editorial/quiet/dramatic.webp
    ├── rosacea-desktop.webp · rosacea-mobile.webp
    ├── loop.webp (poster) · loop.mp4 (animation)
    └── signature.webp
```

## Install (Shopify admin, no CLI)

1. **Online Store → Themes → ⋯ → Edit code** on your theme (duplicate it first).
2. Create the files with the exact paths above and paste each file's contents:
   - `layout/full-page.liquid`
   - `templates/page.advertorial.liquid`
   - `sections/advertorial.liquid`
3. **Assets → Add a new asset** and upload every file in `assets/` (the two `.liquid`… no —
   upload `advertorial.css`, `advertorial.js`, and all the `.webp` / `.mp4`).
4. **Online Store → Pages → Add page.** Title it (e.g. "Daily Reset"). In **Theme template**
   pick **`advertorial`**. Save. The page now renders the full LP.
5. Open **Customize** on that page to edit settings (below).

*(With Shopify CLI: `shopify theme push` from a theme folder containing these paths.)*

## What you can edit in the customizer

- **Product** → pick your product; the main CTA becomes a real Add-to-Cart form and tags the
  order with `attributes[source] = advertorial-v3`. Blank = placeholder `#checkout` link.
- **Colours** → accent (rose), accent-dark, page background.
- **Photography** → swap any image (hero, café, the 3 packshots, both rosacea crops, signature).
  Blank keeps the built-in generated image.
- **The loop** → poster image + a hosted `.mp4` URL (Files → upload → copy link). Blank = built-in.
- **Motion** → on/off. Off shows static final states (visitor reduced-motion is always respected).
- **@app blocks** → drop compliant Shopify app blocks (e.g. a minimal reviews widget) into the
  section via the customizer.

## Apps / pixels

- `{{ content_for_header }}` is kept, so **Meta Pixel, GA4, TikTok Pixel, Klaviyo backend,
  Recharge** etc. inject normally. The CTA handler in `advertorial.js` logs `Lead` / `AddToCart`
  intent to the console — wire your pixel calls there.
- `advertorial.css` ends with a **kill-switch** that hides SDT-violating app UI (chat popups,
  exit-intent, Fomo, star widgets…) on this page. Add selectors there if an app slips through.

## Not yet wired (next step)

The 3 **testimonial videos** in Brique 08 are still styled placeholders — give me the MP4s
(or Higgsfield UGC) and I'll wire 3 `video` settings + posters into the carousel.

## Doctrine

Verbatim copy is inline on purpose (protects the 12 locked phrases). To edit a phrase, edit the
section markup directly — do not paraphrase.
