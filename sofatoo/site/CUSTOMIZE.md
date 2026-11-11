# How to change things

Everything here is plain HTML, CSS and JS. No build, no framework, no compile step:
**edit a file, refresh the browser.** Nothing is minified that you would need to edit.

## The two files that cover 90% of changes

| Want to change | Edit |
|---|---|
| Colours, fonts, spacing, hide a widget | `site/assets/mockup/overrides.css` |
| Currency, labels, demo badge, cart behaviour | `site/assets/mockup/shop-demo.js` (the `CONFIG` block at the very top) |

Both are loaded **last**, so whatever you put there wins over the theme. You never have to
touch the original theme CSS.

### Colours and fonts

Open `site/assets/mockup/overrides.css`. Every brand token is listed and commented out —
uncomment and change:

```css
:root {
  --sf-ink:   #1a1a1a;   /* main text + dark buttons */
  --sf-cream: #faf5f0;   /* page background */
  --sf-camel: #c08552;   /* logo / highlight */
}
```

The same file has ready-made one-liners to hide the DEMO badge, the WhatsApp widget or the
language switcher.

### Currency, wording, cart behaviour

Open `site/assets/mockup/shop-demo.js` — the first block is:

```js
var CONFIG = {
  currency:      'FCFA',
  currencyAfter: false,    // true -> "90,000 FCFA"
  showBadge:     true,     // the DEMO ribbon
  openBagOnAdd:  true,
  quickAddCards: true,
  freeShipping:  true,
  labels: { bagTitle:'Your bag', addToBag:'Add to bag', checkout:'Checkout', /* … */ }
};
```

Change `currency` to `'€'` and `currencyAfter` to `true` and every price on the site
updates. Translate `labels` and the whole cart UI is translated.

## Changing page content

Each route is one real file: `/our-brand/` is `site/our-brand/index.html`. Open it, find
the text, change it. Search across the site from the terminal:

```bash
grep -rl "text you want to change" site --include=index.html
```

Useful landmarks in the markup (all hand-written, readable class names):

| Part of the page | Selector |
|---|---|
| Header + nav | `.sf-header`, `.sf-menu--primary` |
| Mobile menu | `.sf-drawer` |
| Homepage hero | `.sf-hero` (`<video>` inside) |
| Product rails | `.sf-product-rail`, `.sf-product-card` |
| Lookbook | `.sf-lookbook-rail` |
| Footer | `.sf-footer` |

## Swapping images and video

Replace the file, keep the name — no code change needed:

| What | Where |
|---|---|
| Homepage hero video | `site/wp-content/themes/sofatoo-maison-disabled/assets/media/sabr.mp4` |
| Campaign video | `…/assets/media/laamu-return.mp4` |
| Logo | `…/assets/images/sofatoo-logo-rose-gold.png` |
| Photography | `site/wp-content/uploads/<year>/<month>/` |

Using a different filename? Update the `src` in the page that uses it. Note product
images are referenced with a `srcset` of several sizes — replace them all, or simplify the
tag down to a single `src`.

## Adding or removing pages

* **Remove**: delete the folder (e.g. `site/faq/`) and the links pointing at it.
* **Duplicate**: copy an existing folder, rename it, edit the text. Internal links are
  depth-relative, so a page one level deep uses `../`, two levels `../../`.
* **Re-mirror from the origin**: add the route to `tools/routes.json` and run
  `npm run build`.

## Products in the cart demo

Prices and names are read **from the page itself** — `h1.product_title`, `p.price`, and
WooCommerce's `data-product_variations` for variants. So to change a price you change it
in the product page's HTML and the cart follows automatically. There is no separate
product database to keep in sync.

## Run it locally

```bash
npm install && npm run dev
```

```bash
python3 -m http.server 8000 --directory site
```

## Re-test after your changes

```bash
npm test
```

```bash
node tools/cart-e2e.mjs
```

The first renders all 84 routes at four widths and reports JS errors, 404s and layout
overflow. The second walks the full cart journey. Both need the dev server running.
