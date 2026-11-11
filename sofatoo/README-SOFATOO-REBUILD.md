# So' Fatoo — faithful static rebuild

A reproduction of **sofatoo.com** (*So' Fatoo – The Authentic You*) rebuilt from the
`saveweb2zip-com-sofatoo-com.zip` archive. This is a **reproduction project**, not a
redesign: no colour, font, proportion, section order or asset was reinterpreted.

> The whole rebuild now lives under `sofatoo/`, kept entirely separate from the
> *try-evena* / myevena.com landing page at the repository root, which was not modified.

## Front-end shop demo

The mirror is static — WooCommerce, its database and its payment gateway do not exist here.
A client-side demo layer (`site/assets/mockup/shop-demo.{js,css}`) makes the **shopping
journey real in the browser** so the design can be shown end to end:

`product card / product page -> mini bag -> cart -> checkout -> confirmation`

Quick-add on product cards, variation swatches, quantity controls, a slide-in bag, live
totals in FCFA, and a checkout that validates and confirms. State is in `localStorage` and
survives reloads.

**Nothing is sent anywhere, no payment is taken and no order is created.** A permanent
"DEMO — front-end mock-up, no payment, no backend" badge is visible on every page, and the
confirmation screen states it explicitly. Verified by `tools/cart-e2e.mjs` — 15/15 checks.

## What this is

| | |
|---|---|
| Deliverable | `site/` — static HTML/CSS/JS/media, **no build step, no backend** |
| Routes | **84** (1 from the archive, 83 from the authorised live origin) |
| Size | ~304 MB (~70 MB of that is video) |
| Framework | **none**, deliberately — see below |
| Verified with | real Chromium via Playwright, 84 routes × 4 viewports, + a 15-check cart journey |

## Why no framework

The archive's homepage is a **hand-written custom WordPress theme**
(`sofatoo-maison-disabled`) with a clean semantic class system — `sf-header`, `sf-hero`,
`sf-product-rail`, `sf-lookbook`, `sf-footer`. Its own CSS (95 KB) and JS (20 KB) are
intact in the archive.

Porting that to React or Next.js would mean re-expressing working, authored markup as
components — pure fidelity risk for zero gain. So the original HTML, CSS and JS are
**preserved and repaired**, which is Case A of the brief. The repairs were strictly
mechanical:

* `../../sofatoo.com/…` scraper prefixes → depth-relative local paths
* `main_ver=0.6.14.css` → `main.css` (the scraper had folded `?ver=` into filenames)
* the scraper's anonymised filenames (`QCPfaFg7ouEw.mp4`) → the site's real ones (`sabr.mp4`)
* Google Fonts → self-hosted locally
* third-party tracking, WordPress API discovery and REST nonces → removed

## Quick start

```bash
npm install
```

```bash
npm run dev
```

Then open <http://127.0.0.1:8777>. Or with no install at all:

```bash
python3 -m http.server 8000 --directory site
```

## Documentation

| File | What it covers |
|---|---|
| [`docs/AUDIT.md`](docs/AUDIT.md) | What the archive really contained — including the finding that it holds **one** HTML page, not a site |
| [`docs/ASSET_INVENTORY.md`](docs/ASSET_INVENTORY.md) | Every shipped resource: path, type, bytes, and whether it came from the archive or the origin |
| [`docs/ROUTE_MAP.md`](docs/ROUTE_MAP.md) | All 51 routes, the rewriting rules, and which routes were deliberately excluded |
| [`docs/FIDELITY_REPORT.md`](docs/FIDELITY_REPORT.md) | Per-item fidelity classification, measured test results, and the honest limitations |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Hosting on Netlify, Vercel, Cloudflare Pages, GitHub Pages, shared hosting, nginx or Node |

## Repository layout

```
/
├─ site/                     ← THE DELIVERABLE: the rebuilt static site (publish this)
│  ├─ index.html             ← homepage, rebuilt from the archive
│  ├─ <50 route dirs>/index.html
│  ├─ assets/fonts/          ← self-hosted Aboreto / Comfortaa / Montserrat
│  └─ wp-content/, wp-includes/   ← original asset paths, preserved
├─ docs/                     ← audit, inventory, route map, fidelity report, deployment
├─ tools/
│  ├─ build.mjs              ← the rebuild pipeline (reproducible)
│  ├─ routes.json            ← the route set
│  ├─ filename-restore.json  ← scraper-anonymised → real filename map
│  └─ build-report.json      ← last build's measured result
├─ tests/
│  ├─ verify.mjs             ← Playwright verification
│  ├─ verify-report.json     ← last run's measured result
│  └─ screenshots/           ← desktop + mobile captures
├─ netlify.toml, vercel.json ← publish dir = site/
│
└─ index.html, styles.css, script.js, assets/, CNAME, README.md
                             ← PRE-EXISTING unrelated project (try-evena / myevena.com)
                               left exactly as found
```

Because the repository root hosts that other project, **deploy `site/`, not the root.**
`netlify.toml` and `vercel.json` already point there.

## Rights and redistribution

All imagery, video, text and branding belong to **So' Fatoo / Maison Sow Fatou**. They are
reproduced here from an archive supplied for reconstruction. The self-hosted fonts
(Aboreto, Comfortaa, Montserrat) are SIL OFL 1.1, which permits redistribution.

**Confirm you hold the rights to the brand media before making this repository or any
deployment public.** It was delivered private for that reason. See
`docs/FIDELITY_REPORT.md` §10.

No credentials, API keys or private data from the archive are included; the archive
contained none. WordPress REST nonces found in it were blanked.
