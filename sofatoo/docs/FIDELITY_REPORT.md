# FIDELITY REPORT

Every number here was measured by a script in this repository, on this build. Nothing is
estimated. The raw outputs are committed alongside: `tests/verify-report.json`,
`tests/interaction-report.json`, `tests/compare/report.json`, `tools/build-report.json`.

## 0. Classification key

| Mark | Meaning |
|---|---|
| **R+V** | Reproduced and verified by a test in this repo |
| **R~** | Reproduced partially |
| **N/S** | Not reproducible from the available sources |
| **N/V** | Reproduced but not verified |

---

## 1. Pages found vs rebuilt

| | Count |
|---|--:|
| HTML pages **in the archive** | **1** |
| Routes linked from that page but absent from it | ~50 |
| Routes in the origin's sitemap | 155 |
| Routes **delivered in `site/`** | **51** |
| Routes rebuilt **from the archive** | 1 (`/`) |
| Routes mirrored from the authorised live origin | 50 |
| Routes deliberately excluded | ~104 (see `docs/ROUTE_MAP.md` §5) |

The archive is a **single-page capture**, not a site backup — see `docs/AUDIT.md` §2. The
homepage is therefore the only route the archive could supply; the rest come from the live
origin, whose consultation the brief authorises (§8.1) and whose URL the request supplied.

**73 product-detail pages were excluded at your explicit request** to scope the delivery to
~50 pages. Their category archives *are* included, so links into product details leave the
mirror and resolve on sofatoo.com.

## 2. Original resources reused

| | Count | Bytes |
|---|--:|--:|
| Assets shipped in `site/` | 345 | ~123 MB |
| Taken **verbatim from the archive** | 130 | 46.5 MB |
| Fetched from the live origin | ~215 | ~76 MB |
| Assets **generated or substituted** | **0** | — |

No image, video, icon or text was replaced by a generated or stock substitute. Full
per-file table in `docs/ASSET_INVENTORY.md`.

### Filenames restored — R+V
`saveweb2zip` anonymised every filename (`sabr.mp4` → `QCPfaFg7ouEw.mp4`). 67 of these were
matched back to their real origin names by SHA-256 content comparison and renamed, which
removed 33.8 MB of duplication and restored the site's true URLs. Map:
`tools/filename-restore.json`.

**3 archive assets keep an anonymised name** (`34ACIG7rK6si.jpg`, `KDCkjZS4QNJK.jpg`,
`QfAoxhChDW6p.jpg`) — no twin existed on the current origin to match them against. Their
*content* is the archive's original; only the filename is unrecoverable. All three render
correctly. — **R~**

## 3. Media

| Item | State |
|---|---|
| `sabr.mp4` (hero, 5.7 MB) | **R+V** — from the archive; decodes 1440×1080, `readyState 4`, playing |
| `laamu-return.mp4` (campaign, 22.7 MB) | **R+V** — from the archive; decodes 1080×1920, `readyState 4` |
| `Alliages.mov` (41.6 MB) | **R+V** — localised from the origin; was left remote in the first build, now served locally |
| `YAAYOU-NENE-SCREEN-RECORDING.mov` (7.9 MB) | **R+V** — same |
| Autoplay / muted / loop / playsinline | **R+V** — all four attributes preserved and asserted |
| Poster image | **R+V** — `laamu-mohamed.jpeg`, preserved |
| Remote-only videos | none — **every video is a local file** |

## 4. Interactions

14/14 automated interaction checks pass (`npm run test:interactions`):

| Check | Result | Measured |
|---|---|---|
| mobile drawer opens on burger tap | **R+V** | class toggled |
| mobile drawer contains nav links | **R+V** | 18 links |
| search overlay opens from its trigger | **R+V** | aria-hidden=false, field visible=true |
| search overlay closes again | **R+V** | — |
| homepage videos decode real frames | **R+V** | sabr.mp4 1440x1080 rs=4; laamu-return.mp4 1080x1920 rs=4 |
| homepage videos are muted+looping autoplay | **R+V** | muted=true loop=true autoplay=true; muted=true loop=true autoplay=true |
| homepage videos actually advance (playing) | **R+V** | paused=false t=4.13; paused=true t=0.00 |
| product rail scrolls via its control | **R+V** | scrollLeft 46 -> 392 |
| product rail is populated | **R+V** | 65 cards |
| internal link navigates to a local page | **R+V** | /our-brand/ |
| all relative links on the homepage resolve | **R+V** | 32 links checked |
| keyboard focus reaches a control with a visible state | **R+V** | A outline="auto 1px" shadow="none" |
| images carry alt attributes | **R+V** | 0 without alt |
| contact form is present with labelled fields | **R+V** | 1/1 labelled, action=../ |

## 5. Rendering verification

`npm test` renders **all 51 routes at 4 viewports** (375 / 768 / 1024 / 1440 px)
in real Chromium = **204 renders**.

| | |
|---|--:|
| Renders with **zero** defects | **184 / 204** |
| Renders with a finding | 20 |
| JavaScript page errors | **0** |
| Horizontal overflow at any viewport | **0 px on every route** |
| Broken local resources | **0** |

The 20 findings reduce to exactly **two** underlying causes:

1. **Two images 404 on `/book/`** — `IMG_6030-large-683x1024.webp` and
   `media-libraryjg697li1h1m4bqlSs7t-micro-large-1-683x1024.webp`. Both are **404 on the
   live sofatoo.com too** (verified with `curl`). This is pre-existing breakage on the real
   site, reproduced faithfully rather than papered over with a substitute image. — **N/S**
2. **`requestfailed` entries for the four video files** — these are the browser cancelling
   HTTP range requests once enough is buffered, not load failures. Disproved directly: the
   interaction suite reports both homepage videos at `readyState 4` with real frame
   dimensions. — **not a defect**

## 6. Visual comparison against the live original

Rebuild and live origin captured at identical viewports, cookie overlays removed:

| Route | Viewport | Rebuild height | Live height | Δ |
|---|---|--:|--:|--:|
| `/` | desktop | 8887 px | 8887 px | **0 %** |
| `/our-brand/` | desktop | 5848 px | 5848 px | **0 %** |
| `/shop/` | desktop | 6067 px | 6067 px | **0 %** |
| `/` | mobile | 14252 px | 14252 px | **0 %** |
| `/our-brand/` | mobile | 5176 px | 5176 px | **0 %** |
| `/shop/` | mobile | 12491 px | 12491 px | **0 %** |

**Full-page document height matches the live site exactly on all six comparisons.** Paired
screenshots are committed in `tests/compare/`. Visual inspection of the homepage pair shows
identical typography, colour, spacing, header proportions, nav, language switcher and
WhatsApp widget; the only visible difference is the **frame of the hero video**, since the
same file is at a different playback moment in each capture. — **R+V**

> Honest limit: this measures document height and side-by-side appearance, not a
> per-pixel diff across all 51 routes. Routes other than `/`, `/our-brand/` and `/shop/`
> were verified for rendering, overflow and resource integrity but **not** pixel-compared
> against the origin. — **N/V** for those.

## 7. Things that are NOT reproducible from the sources

| Capability | State | Why |
|---|---|---|
| Add to cart / cart totals | **N/S** | Needs WooCommerce + PHP + database. None is in the archive. |
| Checkout and payment | **N/S** | Needs a payment gateway and server. **No transaction is simulated.** |
| User accounts, login, orders, wishlist | **N/S** | Server-side sessions. The pages render as empty logged-out shells, which is their true logged-out state. |
| Contact form submission | **R~** | Markup, labels and validation attributes preserved and verified; it has no backend to post to, so it cannot send. |
| Product search | **R~** | The overlay opens, closes and accepts input (verified). The query needs WordPress search server-side. |
| Live product stock and prices | **R~** | Frozen at mirror time; they were server-rendered. |
| TranslatePress language switching | **R~** | The switcher renders; `/fr/` was not mirrored, so switching leaves the mirror. |
| Product detail pages | **N/S** | Excluded from scope at your request. |

Nothing above is faked. No button was given a cosmetic handler to look functional.

## 8. Known visual gaps

| Gap | Severity |
|---|---|
| Two 404 images on `/book/` | Cosmetic; identical to the live site's own behaviour |
| Hero video frame differs between captures | Not a gap; same file, different moment |
| 48 routes not pixel-compared against the origin | Unmeasured, not known-wrong |

No colour, font, spacing, grid or header proportion was changed anywhere. No section was
reordered, simplified, modernised or replaced with a template component.

## 9. Tests performed

| Test | Command | Result |
|---|---|---|
| Rebuild reproducibility | `npm run build` | 51/51 pages, 345 assets, 2 origin-side 404s |
| Render + responsive + resources | `npm test` | 184/204 renders clean; 0 JS errors; 0 overflow |
| Interactions and accessibility | `node tools/interactions.mjs` | 14/14 |
| Visual comparison vs live | `node tools/compare-live.mjs` | 6/6 exact height match |
| Credential scan | `grep` over the whole archive | 0 secrets; 7 WP nonces blanked |

## 10. Requires permission before public redistribution

The repository was created **private** for these reasons:

| Item | Concern |
|---|---|
| All photography and video of So' Fatoo garments, models and campaigns | Copyright held by So' Fatoo / Maison Sow Fatou. Model releases unknown. |
| The So' Fatoo logo, wordmark and brand identity | Trademark. |
| All editorial and product copy | Copyright. |
| Product names, prices, descriptions | Commercial data. |
| `wp-content/plugins/*` (WooCommerce, Elementor, Elementor **Pro**, RevSlider, …) | Third-party code. Elementor Pro and RevSlider are **commercially licensed** — redistributing their JS/CSS publicly may breach those licences. |
| Self-hosted fonts | **Clear** — Aboreto, Comfortaa, Montserrat are SIL OFL 1.1, redistribution permitted. |

**Confirm you hold the rights to the brand media, and check the Elementor Pro / RevSlider
licence terms, before making this repository or any deployment public.**

No credentials were found in the archive and none are committed.
