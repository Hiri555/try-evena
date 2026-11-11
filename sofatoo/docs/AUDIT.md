# AUDIT — `saveweb2zip-com-sofatoo-com.zip`

Audit performed before any reconstruction work. Every figure below was measured on the
extracted archive, not estimated.

## 1. Provenance of the archive

| Item | Value |
|---|---|
| Delivered as | WeTransfer link (the zip exceeds the 30 MB chat limit) |
| File name | `saveweb2zip-com-sofatoo-com.zip` |
| Size | 44 153 598 bytes (exact, matches the transfer manifest) |
| SHA-256 | `3a8c77a2a92c536f34a708326d0d8fa88a2eca69921e78f9a4eabf284e81ddcb` |
| Extracted size | 46 725 824 bytes across **134 files** |
| Capture date | 2026-11-11 |
| Target site | `https://sofatoo.com` — *So' Fatoo – The Authentic You* |

## 2. The single most important finding

**The archive is a one-page capture, not a site backup.**

The whole archive contains **exactly one HTML file**:

```
127.0.0.1_8081/dl/ua=Mozilla%2F5.0%20(iPhone%3B%20CPU%20iPhone%20OS%2017_2_1…&mobile=true&url=https%3A%2F%2Fsofatoo..html
```

Three things are readable from that filename:

1. The scrape was proxied through a local helper on `127.0.0.1:8081`; the request
   parameters were saved *as the filename*, which is why it is not called `index.html`.
2. The capture was made with an **iPhone user-agent** and `mobile=true`.
3. The `url=` parameter is **truncated** (`https%3A%2F%2Fsofatoo..html`), so the archive
   does not even record its own source URL in full.

Consequence: the homepage is the only page recoverable from the archive. The ~50 internal
links it contains (shop, collections, brand pages, product pages, cart…) point to pages
that **are not in the archive**.

> Verified afterwards: the live origin serves byte-identical HTML (94 379 bytes) for a
> desktop UA and an iPhone UA, so the mobile capture cost us **no** markup. The site is
> responsive through CSS, not through UA sniffing. The archive's HTML is therefore a
> faithful source for all viewports.

## 3. What the archive actually contains

| Area | Files | Bytes |
|---|---:|---:|
| `wp-content/themes/sofatoo-maison-disabled` | 7 | 28 756 000 |
| `wp-content/uploads` (2023 → 2026) | 76 | 16 274 298 |
| `wp-content/plugins` (12 plugins) | 38 | 1 248 961 |
| `wp-includes` (jQuery, dashicons, WP core JS) | 12 | 354 051 |
| HTML page | 1 | 92 514 |
| **Total** | **134** | **46 725 824** |

By type: 48 `.jpg`, 42 `.js`, 25 `.jpeg`, 9 `.css`, 3 `.png`, 2 `.svg`, 2 `.mp4`,
1 `.ttf`, 1 `.eot`, 1 `.html`.

## 4. Platform identified

WordPress + WooCommerce, with a **custom hand-written theme** (`sofatoo-maison-disabled`)
rather than a page-builder layout. This matters a great deal for fidelity:

* The homepage markup uses a clean, semantic, author-written class system
  (`sf-header`, `sf-hero`, `sf-product-rail`, `sf-lookbook`, `sf-footer`, …).
* The theme ships its own CSS (`main.css` 78 KB, `home-reference.css` 17 KB) and
  JS (`theme.js` 20 KB).
* Elementor is installed and its frontend CSS/JS load, but the homepage layout is
  **not** Elementor-generated — only `post-8.css` (3.7 KB) is present.

Plugins whose assets are in the archive: `contact-form-7`,
`creative-mail-by-constant-contact`, `elementor`, `elementor-pro`,
`essential-addons-for-elementor-lite`, `essential-blocks`, `revslider`,
`sofatoo-elementor-bridge` (custom), `translatepress-multilingual`,
`variation-swatches-for-woocommerce`, `woocommerce`, `wp-whatsapp`.

## 5. Path mangling introduced by the scraper

`saveweb2zip` folds the query string into the filename:

| Original URL | On disk | Referenced in HTML as |
|---|---|---|
| `…/jquery.min.js?ver=3.7.1` | `…/jquery.min_ver=3.7.1.js` | `…/jquery.min_ver%3D3.7.1.js` |

The HTML uses the percent-encoded `%3D`, which a browser decodes back to `=`, so the
archive **does render as extracted** — paths are internally consistent. They are,
however, hostile to real hosting (literal `=` in filenames, `../../sofatoo.com/…`
prefixes that only work from the capture's nesting depth). The rebuild normalises these
to clean paths; see `docs/ROUTE_MAP.md`.

## 6. Missing resources and remote dependencies

| Dependency | Status in archive | Handling in the rebuild |
|---|---|---|
| Google Fonts (Aboreto, Comfortaa 300–600, Montserrat 300–600) | **Not included** — only a remote `<link>` | Self-hosted: the exact CSS2 response + all 13 `woff2` subsets are now local (OFL 1.1 permits redistribution) |
| Google Tag Manager `GTM-*` / `gtag` | Script tags present | **Removed** — third-party tracking, not ours to republish |
| `s.w.org` (WP emoji sprite) | Runtime fetch only | Emoji detection script **removed** (origin-side polyfill) |
| `wp-json` / `xmlrpc.php` / oEmbed discovery | `<link>` tags only | **Removed** — no WordPress backend exists |
| WhatsApp `wa.me` deep link | Link only | **Kept** — a legitimate external link |
| `share.google`, `g.co` (map links in content) | Links only | **Kept** — legitimate external links |
| 2 `.webp` images under `/book/` | Absent | Still **404 on the live origin too** — pre-existing breakage, not caused by the rebuild. Not substituted. |

## 7. Credentials check

Scanned the whole archive for API keys, tokens, passwords and private keys.

**Result: no credentials.** The only secret-shaped strings are seven short-lived
WordPress REST *nonces* embedded in inline JS. They are session-scoped to the origin and
worthless without its cookies, but they are not ours to republish, so the build
**blanks them**.

## 8. Classification

The archive is a **partial save**: a complete, working single page with its full asset
set, inside a WordPress/WooCommerce site whose remaining ~150 pages were never captured.

Reconstruction strategy follows **Case A (preserve and repair)** for the homepage, and
mirrors the remaining established pages from the authorised live origin. The reasoning is
recorded in `docs/ROUTE_MAP.md` §2.
