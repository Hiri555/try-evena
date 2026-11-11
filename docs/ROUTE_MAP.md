# ROUTE MAP

## 1. What the archive contained, route-wise

| Routes in the archive | 1 (`/`) |
|---|---|
| Routes linked **from** that page but absent from it | ~50 |
| Routes in the origin's `wp-sitemap.xml` | 155 |

## 2. Strategy decision

The brief asks for **Case A — preserve and repair** wherever the archive supports it,
and warns against rebuilding only the homepage.

Those two requirements conflict here, because the archive *is* only a homepage. The
resolution used:

* **`/` is rebuilt from the archive.** Its HTML, CSS, JS and media are the archive's own
  bytes. The archive is authoritative for this route.
* **The other 50 routes are mirrored from the authorised live origin**, `https://sofatoo.com`.
  §8.1 of the brief permits consulting the reference site, and the request supplied its URL
  directly. Every one of these routes' existence is **established** by the origin's sitemap
  and by links in the archived page — none is invented.
* **No route was fabricated.** Pages the origin exposes but which are template leftovers
  (`/home-1/` … `/home-12/`, `/sample-page/`) or duplicate drafts (`/cart-2/`, `/faq-2/`,
  `/shop-2/`, `/blog-2/`, `/my-account-2/`, …) were deliberately **excluded**, not mirrored.
* **73 product-detail pages were excluded by explicit request** (the delivery was scoped to
  ~50 pages for speed). The product *category* archives that link to them **are** included,
  so links into product details leave the mirror and resolve on the origin. This is stated,
  not hidden.

Asset handling: every asset reference is rewritten to a **depth-relative local path**, so the
site works at a domain root, in a subdirectory, or opened over `file://` after a build.

## 3. Routes delivered

**51 routes.** `source` records where the HTML came from.

| # | Route | Output file | HTML source | Notes |
|--:|---|---|---|---|
| 1 | `/` | `site/index.html` | **archive** | Homepage - rebuilt from the saveweb2zip archive (the only page it captured) |
| 2 | `/our-brand/` | `site/our-brand/index.html` | live origin | — |
| 3 | `/about-us/` | `site/about-us/index.html` | live origin | — |
| 4 | `/our-team/` | `site/our-team/index.html` | live origin | — |
| 5 | `/who-are-we/` | `site/who-are-we/index.html` | live origin | — |
| 6 | `/what-is-maison-sow-fatou/` | `site/what-is-maison-sow-fatou/index.html` | live origin | — |
| 7 | `/our-engagement/` | `site/our-engagement/index.html` | live origin | — |
| 8 | `/our-industry/` | `site/our-industry/index.html` | live origin | — |
| 9 | `/luxury-made-affordable/` | `site/luxury-made-affordable/index.html` | live origin | — |
| 10 | `/west-african-weaving/` | `site/west-african-weaving/index.html` | live origin | — |
| 11 | `/sofatoo-queens/` | `site/sofatoo-queens/index.html` | live origin | — |
| 12 | `/in-loving-memory-of-mamy-tall/` | `site/in-loving-memory-of-mamy-tall/index.html` | live origin | — |
| 13 | `/portrait-of-ababacar/` | `site/portrait-of-ababacar/index.html` | live origin | — |
| 14 | `/imaara-jewelry/` | `site/imaara-jewelry/index.html` | live origin | — |
| 15 | `/lookbook/` | `site/lookbook/index.html` | live origin | — |
| 16 | `/presse/` | `site/presse/index.html` | live origin | — |
| 17 | `/book/` | `site/book/index.html` | live origin | — |
| 18 | `/collection-laamu/` | `site/collection-laamu/index.html` | live origin | — |
| 19 | `/collection-yaayou-nene/` | `site/collection-yaayou-nene/index.html` | live origin | — |
| 20 | `/collection-alliages/` | `site/collection-alliages/index.html` | live origin | — |
| 21 | `/shop/` | `site/shop/index.html` | live origin | — |
| 22 | `/product-category/female/` | `site/product-category/female/index.html` | live origin | — |
| 23 | `/product-category/female/classics/` | `site/product-category/female/classics/index.html` | live origin | — |
| 24 | `/product-category/female/eid-outfit/` | `site/product-category/female/eid-outfit/index.html` | live origin | — |
| 25 | `/product-category/female/special-occasions/` | `site/product-category/female/special-occasions/index.html` | live origin | — |
| 26 | `/product-category/female/women-workwear/` | `site/product-category/female/women-workwear/index.html` | live origin | — |
| 27 | `/product-category/male/` | `site/product-category/male/index.html` | live origin | — |
| 28 | `/product-category/male/corporate-male/` | `site/product-category/male/corporate-male/index.html` | live origin | — |
| 29 | `/product-category/male/jummuah-wear-male/` | `site/product-category/male/jummuah-wear-male/index.html` | live origin | — |
| 30 | `/product-category/male/so-fatoo-men-classics/` | `site/product-category/male/so-fatoo-men-classics/index.html` | live origin | — |
| 31 | `/product-category/male/special-occasions-male/` | `site/product-category/male/special-occasions-male/index.html` | live origin | — |
| 32 | `/product-category/male/wedding-male/` | `site/product-category/male/wedding-male/index.html` | live origin | — |
| 33 | `/product-category/kids/` | `site/product-category/kids/index.html` | live origin | — |
| 34 | `/product-category/gifts/` | `site/product-category/gifts/index.html` | live origin | — |
| 35 | `/product-category/gifts/accessories/` | `site/product-category/gifts/accessories/index.html` | live origin | — |
| 36 | `/product-category/gifts/branded-products/` | `site/product-category/gifts/branded-products/index.html` | live origin | — |
| 37 | `/product-category/gifts/giftcards/` | `site/product-category/gifts/giftcards/index.html` | live origin | — |
| 38 | `/product-category/gifts/giving-back/` | `site/product-category/gifts/giving-back/index.html` | live origin | — |
| 39 | `/blog-3/` | `site/blog-3/index.html` | live origin | — |
| 40 | `/post-format-quote-blogs/` | `site/post-format-quote-blogs/index.html` | live origin | — |
| 41 | `/post-format-gallery-blogs/` | `site/post-format-gallery-blogs/index.html` | live origin | — |
| 42 | `/our-shops-stockists/` | `site/our-shops-stockists/index.html` | live origin | — |
| 43 | `/contact/` | `site/contact/index.html` | live origin | — |
| 44 | `/faq/` | `site/faq/index.html` | live origin | — |
| 45 | `/privacy-policy/` | `site/privacy-policy/index.html` | live origin | — |
| 46 | `/refund_returns-2/` | `site/refund_returns-2/index.html` | live origin | — |
| 47 | `/cart/` | `site/cart/index.html` | live origin | Layout only - needs the WooCommerce backend |
| 48 | `/checkout/` | `site/checkout/index.html` | live origin | Layout only - needs the WooCommerce backend |
| 49 | `/my-account/` | `site/my-account/index.html` | live origin | Layout only - needs the WooCommerce backend |
| 50 | `/order-tracking/` | `site/order-tracking/index.html` | live origin | Layout only - needs the WooCommerce backend |
| 51 | `/wishlist/` | `site/wishlist/index.html` | live origin | Layout only - needs the WooCommerce backend |

## 4. Link rewriting rules applied

| Input | Output |
|---|---|
| `../../sofatoo.com/wp-content/…` (scraper form) | depth-relative `wp-content/…` |
| `…/main.css?ver=0.6.14` / `…/main_ver=0.6.14.css` | `…/main.css` (one canonical name) |
| `https://sofatoo.com/<route>/` where `<route>` is delivered | depth-relative `<route>/` |
| `https://sofatoo.com/<route>/` where `<route>` is **not** delivered | left absolute — honest pointer to the origin |
| `https://fonts.googleapis.com/css2?…` | `assets/fonts/fonts.css` (self-hosted) |
| `wa.me`, `share.google`, `g.co`, `instagram.com` | left external — legitimate outbound links |
| GTM / gtag / Bing UET / FB pixel | **removed** |
| `wp-json`, `xmlrpc.php`, oEmbed, `rel=EditURI`, generator meta | **removed** (no backend) |
| WP REST nonces | **blanked** |

## 5. Routes deliberately NOT delivered

| Route group | Count | Why |
|---|--:|---|
| `/product/<slug>/` | 73 | Out of the requested ~50-page scope |
| `/home-1/` … `/home-12/` | 12 | Unused theme-template leftovers on the origin |
| `/cart-2/`, `/checkout-2/`, `/faq-2/`, `/shop-2/`, `/blog-2/`, `/blog/`, `/my-account-2/`, `/wishlist-2/`, `/coming-soon*/`, `/dashboard/`, `/my-orders/`, `/sample-page/`, `/about-us/contact-copy/` | ~14 | Duplicate or orphaned drafts |
| `/category/<slug>/`, `/product-tag/…`, `/product-brand/…` | ~25 | Taxonomy archives, out of scope |

