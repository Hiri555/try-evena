# ASSET INVENTORY

Every resource shipped in `site/`, with its origin path, type, byte size and where the
bytes came from. Generated from the filesystem, not transcribed by hand.

- Resources in `site/`: **455** files, **114 591 302 bytes** (~109 MB)
- Taken **verbatim from the archive**: **130** files, 46 521 301 bytes
- Fetched from the authorised live origin (pages the archive never captured): **325** files, 68 070 001 bytes
- In the archive but not referenced by any rebuilt page: **3** files

## Totals by type

| Type | Files | Bytes |
|---|---:|---:|
| image | 261 | 55 890 148 |
| video | 3 | 51 090 963 |
| page | 51 | 3 575 816 |
| script | 93 | 2 672 614 |
| stylesheet | 29 | 912 401 |
| font | 17 | 441 276 |
| other | 1 | 8 084 |

## Video (priority per the brief)

| Path | Bytes | Source | Used by | Playback attributes |
|---|---:|---|---|---|
| `wp-content/themes/sofatoo-maison-disabled/assets/media/QCPfaFg7ouEw.mp4` | 5 709 133 | archive | Homepage hero background | `autoplay muted loop playsinline preload=auto` |
| `wp-content/themes/sofatoo-maison-disabled/assets/media/iLoTCSBvpNwr.mp4` | 22 690 915 | archive | Homepage campaign block | `autoplay muted loop playsinline preload=metadata` + poster |
| `wp-content/themes/sofatoo-maison-disabled/assets/media/laamu-return.mp4` | 22 690 915 | live origin | — | — |

Both videos are **local files present in the archive** and are served from the repository.
Neither is a remote embed.

## Self-hosted fonts

| Path | Bytes |
|---|---:|
| `assets/fonts/1Ptsg8LJRfWJmhDAuUs4Q4FqPfE.woff2` | 24 576 |
| `assets/fonts/1Ptsg8LJRfWJmhDAuUs4QIFqPfE.woff2` | 15 436 |
| `assets/fonts/1Ptsg8LJRfWJmhDAuUs4QoFqPfE.woff2` | 9 660 |
| `assets/fonts/1Ptsg8LJRfWJmhDAuUs4SYFqPfE.woff2` | 18 448 |
| `assets/fonts/1Ptsg8LJRfWJmhDAuUs4TYFq.woff2` | 30 872 |
| `assets/fonts/1Ptsg8LJRfWJmhDAuUs4ToFqPfE.woff2` | 13 216 |
| `assets/fonts/5DCXAKLhwDDQ4N8bpK3UAlyu.woff2` | 7 784 |
| `assets/fonts/5DCXAKLhwDDQ4N8bpKPUAg.woff2` | 15 324 |
| `assets/fonts/JTUSjIg1_i6t8kCHKm459W1hyzbi.woff2` | 23 828 |
| `assets/fonts/JTUSjIg1_i6t8kCHKm459WRhyzbi.woff2` | 26 368 |
| `assets/fonts/JTUSjIg1_i6t8kCHKm459WZhyzbi.woff2` | 12 928 |
| `assets/fonts/JTUSjIg1_i6t8kCHKm459Wdhyzbi.woff2` | 70 688 |
| `assets/fonts/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2` | 37 956 |
| `assets/fonts/fonts.css` | 15 605 |

These replace the original runtime `fonts.googleapis.com` request. Same families,
weights and `unicode-range` subsets; Aboreto / Comfortaa / Montserrat are SIL OFL 1.1.

## Stylesheets and scripts

| Path | Type | Bytes | Source |
|---|---|---:|---|
| `assets/fonts/fonts.css` | stylesheet | 15 605 | live origin |
| `wp-content/plugins/contact-form-7/includes/css/styles.css` | stylesheet | 2 947 | live origin |
| `wp-content/plugins/contact-form-7/includes/js/index.js` | script | 13 452 | archive |
| `wp-content/plugins/contact-form-7/includes/js/index_ver=6.1.5.js` | script | 13 452 | live origin |
| `wp-content/plugins/contact-form-7/includes/swv/js/index.js` | script | 12 512 | archive |
| `wp-content/plugins/contact-form-7/includes/swv/js/index_ver=6.1.5.js` | script | 12 512 | live origin |
| `wp-content/plugins/creative-mail-by-constant-contact/assets/js/block/submit.js` | script | 3 303 | archive |
| `wp-content/plugins/creative-mail-by-constant-contact/assets/js/block/submit_ver=1772343539.js` | script | 3 303 | live origin |
| `wp-content/plugins/creative-mail-by-constant-contact/assets/js/block/subscribe.css` | stylesheet | 1 638 | live origin |
| `wp-content/plugins/elementor-pro/assets/js/elements-handlers.min.js` | script | 43 922 | archive |
| `wp-content/plugins/elementor-pro/assets/js/elements-handlers.min_ver=4.2.2.js` | script | 43 922 | live origin |
| `wp-content/plugins/elementor-pro/assets/js/frontend.min.js` | script | 23 939 | archive |
| `wp-content/plugins/elementor-pro/assets/js/frontend.min_ver=4.2.2.js` | script | 23 939 | live origin |
| `wp-content/plugins/elementor-pro/assets/js/webpack-pro.runtime.min.js` | script | 6 242 | archive |
| `wp-content/plugins/elementor-pro/assets/js/webpack-pro.runtime.min_ver=4.2.2.js` | script | 6 242 | live origin |
| `wp-content/plugins/elementor/assets/css/frontend.min.css` | stylesheet | 54 666 | archive |
| `wp-content/plugins/elementor/assets/css/frontend.min_ver=4.3.6.css` | stylesheet | 54 666 | live origin |
| `wp-content/plugins/elementor/assets/js/frontend-modules.min.js` | script | 53 086 | archive |
| `wp-content/plugins/elementor/assets/js/frontend-modules.min_ver=4.3.6.js` | script | 53 086 | live origin |
| `wp-content/plugins/elementor/assets/js/frontend.min.js` | script | 60 022 | archive |
| `wp-content/plugins/elementor/assets/js/frontend.min_ver=4.3.6.js` | script | 60 022 | live origin |
| `wp-content/plugins/elementor/assets/js/webpack.runtime.min.js` | script | 103 | archive |
| `wp-content/plugins/elementor/assets/js/webpack.runtime.min_ver=4.3.6.js` | script | 103 | live origin |
| `wp-content/plugins/essential-addons-for-elementor-lite/assets/front-end/js/view/general.min.js` | script | 11 970 | archive |
| `wp-content/plugins/essential-addons-for-elementor-lite/assets/front-end/js/view/general.min_ver=6.8.8.js` | script | 11 970 | live origin |
| `wp-content/plugins/essential-blocks/assets/js/eb-blocks-localize.js` | script | 0 | archive |
| `wp-content/plugins/essential-blocks/assets/js/eb-blocks-localize_ver=31d6cfe0d16ae931b73c.js` | script | 0 | live origin |
| `wp-content/plugins/filebird/blocks/filebird-gallery/build/style-index.css` | stylesheet | 1 259 | live origin |
| `wp-content/plugins/revslider/sr6/assets/js/rbtools.min.js` | script | 165 339 | archive |
| `wp-content/plugins/revslider/sr6/assets/js/rbtools.min_ver=6.7.18.js` | script | 165 339 | live origin |
| `wp-content/plugins/revslider/sr6/assets/js/rs6.min.js` | script | 415 904 | archive |
| `wp-content/plugins/revslider/sr6/assets/js/rs6.min_ver=6.7.18.js` | script | 415 904 | live origin |
| `wp-content/plugins/sofatoo-elementor-bridge/layout.css` | stylesheet | 3 940 | archive |
| `wp-content/plugins/sofatoo-elementor-bridge/layout_ver=0.3.12.css` | stylesheet | 3 940 | live origin |
| `wp-content/plugins/sofatoo-elementor-bridge/site-fixes.css` | stylesheet | 5 021 | archive |
| `wp-content/plugins/sofatoo-elementor-bridge/site-fixes.js` | script | 6 932 | archive |
| `wp-content/plugins/sofatoo-elementor-bridge/site-fixes_ver=0.3.12.css` | stylesheet | 5 021 | live origin |
| `wp-content/plugins/sofatoo-elementor-bridge/site-fixes_ver=0.3.12.js` | script | 6 932 | live origin |
| `wp-content/plugins/translatepress-multilingual/assets/css/trp-language-switcher-v2.css` | stylesheet | 9 380 | archive |
| `wp-content/plugins/translatepress-multilingual/assets/css/trp-language-switcher-v2_ver=3.3.9.css` | stylesheet | 9 380 | live origin |
| `wp-content/plugins/translatepress-multilingual/assets/js/trp-frontend-compatibility.js` | script | 834 | archive |
| `wp-content/plugins/translatepress-multilingual/assets/js/trp-frontend-compatibility_ver=3.3.9.js` | script | 834 | live origin |
| `wp-content/plugins/translatepress-multilingual/assets/js/trp-frontend-language-switcher.js` | script | 16 102 | archive |
| `wp-content/plugins/translatepress-multilingual/assets/js/trp-frontend-language-switcher_ver=3.3.9.js` | script | 16 102 | live origin |
| `wp-content/plugins/variation-swatches-for-woocommerce/assets/css/frontend-list-products.css` | stylesheet | 609 | live origin |
| `wp-content/plugins/variation-swatches-for-woocommerce/assets/css/frontend.css` | stylesheet | 140 776 | archive |
| `wp-content/plugins/variation-swatches-for-woocommerce/assets/css/frontend_ver=2.2.6.css` | stylesheet | 140 776 | live origin |
| `wp-content/plugins/variation-swatches-for-woocommerce/assets/js/frontend.js` | script | 12 687 | archive |
| `wp-content/plugins/variation-swatches-for-woocommerce/assets/js/frontend_ver=2.2.6.js` | script | 12 687 | live origin |
| `wp-content/plugins/woocommerce/assets/css/photoswipe/default-skin/default-skin.min.css` | stylesheet | 8 214 | live origin |
| `wp-content/plugins/woocommerce/assets/css/photoswipe/photoswipe.min.css` | stylesheet | 3 356 | live origin |
| `wp-content/plugins/woocommerce/assets/css/select2.css` | stylesheet | 14 789 | live origin |
| `wp-content/plugins/woocommerce/assets/css/woocommerce-layout.css` | stylesheet | 20 154 | live origin |
| `wp-content/plugins/woocommerce/assets/css/woocommerce-smallscreen.css` | stylesheet | 8 655 | live origin |
| `wp-content/plugins/woocommerce/assets/css/woocommerce.css` | stylesheet | 93 509 | live origin |
| `wp-content/plugins/woocommerce/assets/js/accounting/accounting.min.js` | script | 3 313 | live origin |
| `wp-content/plugins/woocommerce/assets/js/flexslider/jquery.flexslider.min.js` | script | 21 556 | archive |
| `wp-content/plugins/woocommerce/assets/js/flexslider/jquery.flexslider.min_ver=2.7.2-wc.11.2.0.js` | script | 21 556 | live origin |
| `wp-content/plugins/woocommerce/assets/js/frontend/account-i18n.min.js` | script | 188 | live origin |
| `wp-content/plugins/woocommerce/assets/js/frontend/add-to-cart-variation.min.js` | script | 16 616 | archive |
| `wp-content/plugins/woocommerce/assets/js/frontend/add-to-cart-variation.min_ver=11.2.0.js` | script | 16 616 | live origin |
| `wp-content/plugins/woocommerce/assets/js/frontend/add-to-cart.min.js` | script | 4 350 | archive |
| `wp-content/plugins/woocommerce/assets/js/frontend/add-to-cart.min_ver=11.2.0.js` | script | 4 350 | live origin |
| `wp-content/plugins/woocommerce/assets/js/frontend/address-i18n.min.js` | script | 2 644 | live origin |
| `wp-content/plugins/woocommerce/assets/js/frontend/cart.min.js` | script | 9 850 | live origin |
| `wp-content/plugins/woocommerce/assets/js/frontend/country-select.min.js` | script | 3 494 | live origin |
| `wp-content/plugins/woocommerce/assets/js/frontend/order-attribution.min.js` | script | 2 512 | archive |
| `wp-content/plugins/woocommerce/assets/js/frontend/order-attribution.min_ver=11.2.0.js` | script | 2 512 | live origin |
| `wp-content/plugins/woocommerce/assets/js/frontend/price-slider.min.js` | script | 2 138 | live origin |
| `wp-content/plugins/woocommerce/assets/js/frontend/single-product.min.js` | script | 13 227 | archive |
| `wp-content/plugins/woocommerce/assets/js/frontend/single-product.min_ver=11.2.0.js` | script | 13 227 | live origin |
| `wp-content/plugins/woocommerce/assets/js/frontend/woocommerce.min.js` | script | 4 279 | archive |
| `wp-content/plugins/woocommerce/assets/js/frontend/woocommerce.min_ver=11.2.0.js` | script | 4 279 | live origin |
| `wp-content/plugins/woocommerce/assets/js/jquery-blockui/jquery.blockUI.min.js` | script | 9 591 | archive |
| `wp-content/plugins/woocommerce/assets/js/jquery-blockui/jquery.blockUI.min_ver=2.7.0-wc.11.2.0.js` | script | 9 591 | live origin |
| `wp-content/plugins/woocommerce/assets/js/jquery-ui-touch-punch/jquery-ui-touch-punch.min.js` | script | 1 289 | live origin |
| `wp-content/plugins/woocommerce/assets/js/js-cookie/js.cookie.min.js` | script | 1 720 | archive |
| `wp-content/plugins/woocommerce/assets/js/js-cookie/js.cookie.min_ver=2.1.4-wc.11.2.0.js` | script | 1 720 | live origin |
| `wp-content/plugins/woocommerce/assets/js/photoswipe/photoswipe-ui-default.min.js` | script | 9 749 | archive |
| `wp-content/plugins/woocommerce/assets/js/photoswipe/photoswipe-ui-default.min_ver=4.1.1-wc.11.2.0.js` | script | 9 749 | live origin |
| `wp-content/plugins/woocommerce/assets/js/photoswipe/photoswipe.min.js` | script | 31 540 | archive |
| `wp-content/plugins/woocommerce/assets/js/photoswipe/photoswipe.min_ver=4.1.1-wc.11.2.0.js` | script | 31 540 | live origin |
| `wp-content/plugins/woocommerce/assets/js/selectWoo/selectWoo.full.min.js` | script | 77 854 | live origin |
| `wp-content/plugins/woocommerce/assets/js/sourcebuster/sourcebuster.min.js` | script | 14 996 | archive |
| `wp-content/plugins/woocommerce/assets/js/sourcebuster/sourcebuster.min_ver=11.2.0.js` | script | 14 996 | live origin |
| `wp-content/plugins/woocommerce/assets/js/zoom/jquery.zoom.min.js` | script | 2 673 | archive |
| `wp-content/plugins/woocommerce/assets/js/zoom/jquery.zoom.min_ver=1.7.21-wc.11.2.0.js` | script | 2 673 | live origin |
| `wp-content/plugins/wp-whatsapp/assets/dist/js/njt-whatsapp.js` | script | 53 989 | archive |
| `wp-content/plugins/wp-whatsapp/assets/dist/js/njt-whatsapp_ver=3.8.0.js` | script | 53 989 | live origin |
| `wp-content/plugins/wp-whatsapp/assets/js/whatsapp-button.js` | script | 1 152 | archive |
| `wp-content/plugins/wp-whatsapp/assets/js/whatsapp-button_ver=3.8.0.js` | script | 1 152 | live origin |
| `wp-content/themes/sofatoo-maison-disabled/assets/css/home-reference_ver=0.6.14.css` | stylesheet | 17 396 | live origin |
| `wp-content/themes/sofatoo-maison-disabled/assets/css/inner-pages.css` | stylesheet | 14 620 | live origin |
| `wp-content/themes/sofatoo-maison-disabled/assets/css/main.css` | stylesheet | 78 289 | archive |
| `wp-content/themes/sofatoo-maison-disabled/assets/css/main_ver=0.6.14.css` | stylesheet | 78 289 | live origin |
| `wp-content/themes/sofatoo-maison-disabled/assets/js/theme.js` | script | 19 892 | archive |
| `wp-content/themes/sofatoo-maison-disabled/assets/js/theme_ver=0.6.14.js` | script | 19 892 | live origin |
| `wp-content/uploads/elementor/css/post-8.css` | stylesheet | 3 710 | archive |
| `wp-content/uploads/elementor/css/post-8_ver=1794107397.css` | stylesheet | 3 710 | live origin |
| `wp-content/uploads/essential-addons-elementor/eael-44854.js` | script | 55 720 | live origin |
| `wp-content/uploads/essential-addons-elementor/eael-9162_ver=1790116571.js` | script | 71 900 | live origin |
| `wp-includes/css/dashicons.min.css` | stylesheet | 59 043 | archive |
| `wp-includes/css/dashicons.min_ver=7.0.8.css` | stylesheet | 59 043 | live origin |
| `wp-includes/js/dist/hooks.min.js` | script | 5 050 | archive |
| `wp-includes/js/dist/hooks.min_ver=7496969728ca0f95732d.js` | script | 5 050 | live origin |
| `wp-includes/js/dist/i18n.min.js` | script | 5 732 | archive |
| `wp-includes/js/dist/i18n.min_ver=781d11515ad3d91786ec.js` | script | 5 732 | live origin |
| `wp-includes/js/imagesloaded.min.js` | script | 5 520 | archive |
| `wp-includes/js/imagesloaded.min_ver=5.0.0.js` | script | 5 520 | live origin |
| `wp-includes/js/jquery/jquery-migrate.min.js` | script | 13 577 | archive |
| `wp-includes/js/jquery/jquery-migrate.min_ver=3.4.1.js` | script | 13 577 | live origin |
| `wp-includes/js/jquery/jquery.min.js` | script | 87 553 | archive |
| `wp-includes/js/jquery/jquery.min_ver=3.7.1.js` | script | 87 553 | live origin |
| `wp-includes/js/jquery/ui/core.min.js` | script | 21 464 | archive |
| `wp-includes/js/jquery/ui/core.min_ver=1.13.3.js` | script | 21 464 | live origin |
| `wp-includes/js/jquery/ui/mouse.min.js` | script | 3 428 | live origin |
| `wp-includes/js/jquery/ui/slider.min.js` | script | 10 759 | live origin |
| `wp-includes/js/underscore.min.js` | script | 19 012 | archive |
| `wp-includes/js/underscore.min_ver=1.13.8.js` | script | 19 012 | live origin |
| `wp-includes/js/wp-emoji-loader.min.js` | script | 2 977 | live origin |
| `wp-includes/js/wp-util.min.js` | script | 1 431 | archive |
| `wp-includes/js/wp-util.min_ver=7.0.8.js` | script | 1 431 | live origin |

## Images

<details><summary>All image assets (click to expand)</summary>

| Path | Bytes | Source |
|---|---:|---|
| `wp-content/plugins/elementor/assets/images/placeholder.png` | 6 146 | live origin |
| `wp-content/plugins/essential-blocks/assets/images/placeholder.png` | 6 473 | live origin |
| `wp-content/plugins/translatepress-multilingual/assets/flags/4x3/3bdHfnOa8Z07.svg` | 648 | archive |
| `wp-content/plugins/translatepress-multilingual/assets/flags/4x3/en_US.svg` | 648 | live origin |
| `wp-content/plugins/translatepress-multilingual/assets/flags/4x3/fr_FR.svg` | 231 | live origin |
| `wp-content/plugins/translatepress-multilingual/assets/flags/4x3/zUmOwAPUkdwq.svg` | 231 | archive |
| `wp-content/plugins/woocommerce/assets/css/photoswipe/default-skin/default-skin.png` | 547 | live origin |
| `wp-content/plugins/woocommerce/assets/css/photoswipe/default-skin/default-skin.svg` | 1 554 | live origin |
| `wp-content/plugins/woocommerce/assets/css/photoswipe/default-skin/preloader.gif` | 866 | live origin |
| `wp-content/plugins/woocommerce/assets/images/icons/credit-cards/amex.svg` | 4 662 | live origin |
| `wp-content/plugins/woocommerce/assets/images/icons/credit-cards/diners.svg` | 804 | live origin |
| `wp-content/plugins/woocommerce/assets/images/icons/credit-cards/discover.svg` | 2 185 | live origin |
| `wp-content/plugins/woocommerce/assets/images/icons/credit-cards/jcb.svg` | 2 800 | live origin |
| `wp-content/plugins/woocommerce/assets/images/icons/credit-cards/laser.svg` | 3 110 | live origin |
| `wp-content/plugins/woocommerce/assets/images/icons/credit-cards/maestro.svg` | 6 797 | live origin |
| `wp-content/plugins/woocommerce/assets/images/icons/credit-cards/mastercard.svg` | 4 634 | live origin |
| `wp-content/plugins/woocommerce/assets/images/icons/credit-cards/visa.svg` | 1 359 | live origin |
| `wp-content/plugins/woocommerce/assets/images/icons/loader.svg` | 158 | live origin |
| `wp-content/plugins/wp-whatsapp/assets/img/whatsapp_logo.svg` | 1 853 | live origin |
| `wp-content/plugins/wpbingo/lib/lookbook/images/bwp_lookbook/0_SOFATOO_KIDS0186.jpeg` | 1 075 523 | live origin |
| `wp-content/plugins/wpbingo/lib/lookbook/images/bwp_lookbook/SOFATOO_KIDS0149.jpeg` | 1 208 575 | live origin |
| `wp-content/plugins/wpbingo/lib/lookbook/images/bwp_lookbook/SOFATOO_KIDS0163.jpeg` | 854 071 | live origin |
| `wp-content/plugins/wpbingo/lib/lookbook/images/bwp_lookbook/SOFATOO_KIDS0202.jpeg` | 749 639 | live origin |
| `wp-content/themes/sofatoo-maison-disabled/assets/images/0na2b9pGWq3e.jpeg` | 77 404 | archive |
| `wp-content/themes/sofatoo-maison-disabled/assets/images/3nbXS4alUBY6.png` | 162 971 | archive |
| `wp-content/themes/sofatoo-maison-disabled/assets/images/lookbook-alliages.jpeg` | 87 946 | live origin |
| `wp-content/themes/sofatoo-maison-disabled/assets/images/lookbook-laamu.jpeg` | 81 382 | live origin |
| `wp-content/themes/sofatoo-maison-disabled/assets/images/lookbook-yaayou-nene.jpeg` | 112 799 | live origin |
| `wp-content/themes/sofatoo-maison-disabled/assets/images/sofatoo-logo-rose-gold.png` | 162 971 | live origin |
| `wp-content/uploads/2023/01/0iPL3rBv6HcO.jpg` | 24 738 | archive |
| `wp-content/uploads/2023/01/IMG_1335-240x300.jpeg` | 57 504 | live origin |
| `wp-content/uploads/2023/01/IMG_1335-600x750.jpeg` | 146 084 | live origin |
| `wp-content/uploads/2023/01/IMG_1335-768x960.jpeg` | 200 361 | live origin |
| `wp-content/uploads/2023/01/IMG_1335-819x1024.jpeg` | 219 368 | live origin |
| `wp-content/uploads/2023/01/IMG_1335.jpeg` | 852 296 | live origin |
| `wp-content/uploads/2023/01/wafjLdip09Ti.jpg` | 14 534 | archive |
| `wp-content/uploads/2023/01/woven-300x199.jpg` | 14 534 | live origin |
| `wp-content/uploads/2023/01/woven.jpg` | 24 738 | live origin |
| `wp-content/uploads/2024/05/8u1DJWqQtAqC.jpeg` | 225 636 | archive |
| `wp-content/uploads/2024/05/Alia-set-white.jpg` | 796 315 | live origin |
| `wp-content/uploads/2024/05/IMG_0082.jpeg` | 697 630 | live origin |
| `wp-content/uploads/2024/05/RDvq4tzCYeZf.jpg` | 439 247 | archive |
| `wp-content/uploads/2024/05/SOFATOO-WEB20240076-scaled.jpeg` | 483 011 | live origin |
| `wp-content/uploads/2024/05/SOFATOO-WEB20240088-scaled.jpeg` | 268 295 | live origin |
| `wp-content/uploads/2024/05/SOFATOO-WEBSITE-20240066-scaled.jpeg` | 225 636 | live origin |
| `wp-content/uploads/2024/05/Sadibou-black.jpg-scaled.jpg` | 258 683 | live origin |
| `wp-content/uploads/2024/05/bandel-bleu-roi-lt-scaled.jpg` | 439 247 | live origin |
| `wp-content/uploads/2024/06/IMG_2486-scaled-e1763780521984.jpeg` | 260 972 | live origin |
| `wp-content/uploads/2024/06/SboERqAbiT0X.jpeg` | 260 972 | archive |
| `wp-content/uploads/2024/08/8d906a20-cf14-4ba9-a177-0898ecf6a519.jpeg` | 190 834 | live origin |
| `wp-content/uploads/2024/08/N6DLKC2xIO48.jpeg` | 186 554 | archive |
| `wp-content/uploads/2024/08/SOFATOO-WEBSITE-20240138-scaled.jpeg` | 186 554 | live origin |
| `wp-content/uploads/2024/11/34ACIG7rK6si.jpg` | 221 542 | archive |
| `wp-content/uploads/2024/11/gLc4pextBBdF.jpg` | 300 072 | archive |
| `wp-content/uploads/2024/11/khalima-rouge-lt-scaled.jpg` | 300 072 | live origin |
| `wp-content/uploads/2025/02/10RvNNdw24Kq.jpg` | 144 572 | archive |
| `wp-content/uploads/2025/02/1Jhzv8LK4Bwh.jpg` | 67 082 | archive |
| `wp-content/uploads/2025/02/26aWitnJQCmZ.jpg` | 128 853 | archive |
| `wp-content/uploads/2025/02/2FGfqXOg5Lll.jpg` | 46 549 | archive |
| `wp-content/uploads/2025/02/8DIrooDdPUmK.jpg` | 127 719 | archive |
| `wp-content/uploads/2025/02/IMG_3617-1024x683.jpg` | 127 719 | live origin |
| `wp-content/uploads/2025/02/IMG_3617-1536x1024.jpg` | 217 362 | live origin |
| `wp-content/uploads/2025/02/IMG_3617-2048x1365.jpg` | 331 842 | live origin |
| `wp-content/uploads/2025/02/IMG_3617-300x200.jpg` | 41 457 | live origin |
| `wp-content/uploads/2025/02/IMG_3617-600x400.jpg` | 70 843 | live origin |
| `wp-content/uploads/2025/02/IMG_3617-768x512.jpg` | 91 332 | live origin |
| `wp-content/uploads/2025/02/IMG_3617-scaled.jpg` | 473 810 | live origin |
| `wp-content/uploads/2025/02/IMG_4886-1-scaled-e1745243128298-1024x711.jpg` | 70 466 | live origin |
| `wp-content/uploads/2025/02/IMG_4886-1-scaled-e1745243128298-1440x1000.jpg` | 128 853 | live origin |
| `wp-content/uploads/2025/02/IMG_4886-1-scaled-e1745243128298-1536x1067.jpg` | 144 572 | live origin |
| `wp-content/uploads/2025/02/IMG_4886-1-scaled-e1745243128298-300x208.jpg` | 11 123 | live origin |
| `wp-content/uploads/2025/02/IMG_4886-1-scaled-e1745243128298-600x417.jpg` | 29 050 | live origin |
| `wp-content/uploads/2025/02/IMG_4886-1-scaled-e1745243128298-768x534.jpg` | 43 068 | live origin |
| `wp-content/uploads/2025/02/IMG_4886-1-scaled-e1745243128298.jpg` | 191 313 | live origin |
| `wp-content/uploads/2025/02/KVXoFPQiYFDj.jpg` | 70 466 | archive |
| `wp-content/uploads/2025/02/KyRs07qW4bWv.jpg` | 91 332 | archive |
| `wp-content/uploads/2025/02/OIP-8.jpg` | 22 436 | live origin |
| `wp-content/uploads/2025/02/SOFATOO-SITEWEB-20232454-1-e1745238226468-1024x662.jpg` | 105 282 | live origin |
| `wp-content/uploads/2025/02/SOFATOO-SITEWEB-20232855-e1745238497574-1024x676.jpg` | 102 827 | live origin |
| `wp-content/uploads/2025/02/SOFATOO-SITEWEB-20232855-e1745238497574-300x198.jpg` | 17 791 | live origin |
| `wp-content/uploads/2025/02/SOFATOO-SITEWEB-20232855-e1745238497574-600x396.jpg` | 46 549 | live origin |
| `wp-content/uploads/2025/02/SOFATOO-SITEWEB-20232855-e1745238497574-768x507.jpg` | 67 082 | live origin |
| `wp-content/uploads/2025/02/SOFATOO-SITEWEB-20232855-e1745238497574.jpg` | 203 018 | live origin |
| `wp-content/uploads/2025/02/SpkQefvJmF3E.jpg` | 11 123 | archive |
| `wp-content/uploads/2025/02/Tnt6S3A1jqVs.jpg` | 70 843 | archive |
| `wp-content/uploads/2025/02/WJSyzVwiom3S.jpg` | 17 791 | archive |
| `wp-content/uploads/2025/02/Wemc6k4uILn4.jpg` | 43 068 | archive |
| `wp-content/uploads/2025/02/about-one-img-2.png` | 222 676 | live origin |
| `wp-content/uploads/2025/02/dVjg4Y0nW81P.jpg` | 191 313 | archive |
| `wp-content/uploads/2025/02/iZ5UZBu3K5jV.jpg` | 473 810 | archive |
| `wp-content/uploads/2025/02/let238EfBtNK.jpg` | 217 362 | archive |
| `wp-content/uploads/2025/02/llah92l9SuOI.jpg` | 29 050 | archive |
| `wp-content/uploads/2025/02/ozHEy7QrTN5K.jpg` | 102 827 | archive |
| `wp-content/uploads/2025/02/qqX4UkC47KL0.jpg` | 41 457 | archive |
| `wp-content/uploads/2025/02/r0fZ1jD5lldT.jpg` | 203 018 | archive |
| `wp-content/uploads/2025/02/sofatoo-team-abubakr-leye.jpeg` | 80 445 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-aby-tall-camara.jpeg` | 99 842 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-ahmed-gueye.jpeg` | 74 822 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-ahmed-konate.jpeg` | 81 880 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-aicha-yvonne-ndiaye.jpeg` | 90 106 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-aly-farka-toure.jpeg` | 75 176 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-awa-cisse.jpeg` | 109 587 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-badara-gueye.jpeg` | 81 654 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-boubacar-dro.jpeg` | 73 834 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-daba-sarr.jpeg` | 136 050 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-dieynaba-ly.jpeg` | 146 391 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-khadija-kane.jpeg` | 81 082 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-khadim-niang.jpeg` | 75 172 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-khadjja-ba.jpeg` | 78 559 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-ma-amy-seck.jpeg` | 92 396 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-ndeye-ami-seck.jpeg` | 77 122 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-oumou-diawara.png` | 1 042 604 | live origin |
| `wp-content/uploads/2025/02/sofatoo-team-oumoul-khairy-ba.jpeg` | 80 951 | live origin |
| `wp-content/uploads/2025/02/uCV9UIGacX5U.jpg` | 331 842 | archive |
| `wp-content/uploads/2025/03/429e41da-a469-4a28-b512-ba56c5cba2cb.jpeg` | 53 506 | live origin |
| `wp-content/uploads/2025/03/53824e35-0aa8-4411-8779-5039a8e37c24.jpeg` | 77 858 | live origin |
| `wp-content/uploads/2025/03/IMG_3776-683x1024.jpg` | 131 746 | live origin |
| `wp-content/uploads/2025/03/IMG_6025-scaled.jpeg` | 299 004 | live origin |
| `wp-content/uploads/2025/03/IMG_6151.jpeg` | 124 308 | live origin |
| `wp-content/uploads/2025/03/IMG_6173.jpeg` | 233 124 | live origin |
| `wp-content/uploads/2025/03/b4fBIkpbekEQ.jpg` | 278 630 | archive |
| `wp-content/uploads/2025/03/coco-noir-lt-scaled.jpg` | 278 630 | live origin |
| `wp-content/uploads/2025/03/sofatoo-website-suite7409337-900x1200.jpeg` | 119 808 | live origin |
| `wp-content/uploads/2025/04/FKpqUKVaoBVQ.jpeg` | 4 758 | archive |
| `wp-content/uploads/2025/04/GTS3xk31J4Nl.jpeg` | 4 452 | archive |
| `wp-content/uploads/2025/04/NdwibYX992TZ.jpeg` | 1 023 | archive |
| `wp-content/uploads/2025/04/RKCjRj29za1R.png` | 67 443 | archive |
| `wp-content/uploads/2025/04/Red-and-Yellow-Modern-Meet-Our-Professional-Team-Instagram-Post-14-100x100.png` | 10 101 | live origin |
| `wp-content/uploads/2025/04/Red-and-Yellow-Modern-Meet-Our-Professional-Team-Instagram-Post-14-150x150.png` | 32 201 | live origin |
| `wp-content/uploads/2025/04/Red-and-Yellow-Modern-Meet-Our-Professional-Team-Instagram-Post-14-200x300.png` | 67 443 | live origin |
| `wp-content/uploads/2025/04/Red-and-Yellow-Modern-Meet-Our-Professional-Team-Instagram-Post-14-300x300.png` | 92 564 | live origin |
| `wp-content/uploads/2025/04/Red-and-Yellow-Modern-Meet-Our-Professional-Team-Instagram-Post-14-500x500.png` | 200 885 | live origin |
| `wp-content/uploads/2025/04/Red-and-Yellow-Modern-Meet-Our-Professional-Team-Instagram-Post-14.png` | 998 408 | live origin |
| `wp-content/uploads/2025/04/cropped-d2adda95-1e9c-4616-927c-53d2bbb14e9d-180x180.jpeg` | 4 452 | live origin |
| `wp-content/uploads/2025/04/cropped-d2adda95-1e9c-4616-927c-53d2bbb14e9d-192x192.jpeg` | 4 758 | live origin |
| `wp-content/uploads/2025/04/cropped-d2adda95-1e9c-4616-927c-53d2bbb14e9d-270x270.jpeg` | 7 272 | live origin |
| `wp-content/uploads/2025/04/cropped-d2adda95-1e9c-4616-927c-53d2bbb14e9d-32x32.jpeg` | 1 023 | live origin |
| `wp-content/uploads/2025/04/zyECADg9nnhk.png` | 998 408 | archive |
| `wp-content/uploads/2025/05/EtC3i6pOGii6.jpeg` | 205 784 | archive |
| `wp-content/uploads/2025/05/IMG_0911-scaled-large-1-683x1024.webp` | 43 856 | live origin |
| `wp-content/uploads/2025/05/IMG_0913-large-683x1024.webp` | 53 266 | live origin |
| `wp-content/uploads/2025/05/IMG_0915-scaled-large-683x1024.webp` | 55 466 | live origin |
| `wp-content/uploads/2025/05/IMG_2459-scaled.jpeg` | 205 784 | live origin |
| `wp-content/uploads/2025/05/IMG_2462-scaled.jpeg` | 208 881 | live origin |
| `wp-content/uploads/2025/05/IMG_6029-large-2-683x1024.webp` | 19 424 | live origin |
| `wp-content/uploads/2025/05/KDCkjZS4QNJK.jpg` | 281 177 | archive |
| `wp-content/uploads/2025/05/QfAoxhChDW6p.jpg` | 269 033 | archive |
| `wp-content/uploads/2025/05/YnJAN3rApvJs.jpg` | 286 121 | archive |
| `wp-content/uploads/2025/05/fatima-saumon-lt-scaled.jpg` | 286 121 | live origin |
| `wp-content/uploads/2025/09/IMG_0976-1024x1019.jpeg` | 92 820 | live origin |
| `wp-content/uploads/2025/09/IMG_0976.jpeg` | 318 372 | live origin |
| `wp-content/uploads/2025/09/JMRSwQeerFRa.jpeg` | 318 372 | archive |
| `wp-content/uploads/2025/09/Pro-Capture-One-1051-705x1024.jpeg` | 60 251 | live origin |
| `wp-content/uploads/2025/10/A772C055-AEBC-4328-BD9C-299ADFDB53AB.jpeg` | 54 253 | live origin |
| `wp-content/uploads/2025/10/BViawsd792Kr.jpeg` | 151 451 | archive |
| `wp-content/uploads/2025/10/IMG_1761-scaled.jpeg` | 213 245 | live origin |
| `wp-content/uploads/2025/10/IMG_1787-scaled.jpeg` | 151 451 | live origin |
| `wp-content/uploads/2025/10/IMG_2455-scaled.jpeg` | 179 001 | live origin |
| `wp-content/uploads/2025/10/IMG_2477-scaled.jpeg` | 168 063 | live origin |
| `wp-content/uploads/2025/10/IMG_2488-scaled.jpeg` | 200 873 | live origin |
| `wp-content/uploads/2025/10/PdZOIRdsEMka.jpeg` | 54 253 | archive |
| `wp-content/uploads/2025/10/S4MERPp8McQA.jpeg` | 164 385 | archive |
| `wp-content/uploads/2025/10/SOWEBB0051-scaled.jpg` | 302 109 | live origin |
| `wp-content/uploads/2025/10/SOWEBB0077-scaled.jpg` | 232 121 | live origin |
| `wp-content/uploads/2025/10/SOwb0060-scaled.jpg` | 254 032 | live origin |
| `wp-content/uploads/2025/10/Ug4dw9YtDpFF.jpg` | 397 784 | archive |
| `wp-content/uploads/2025/10/XpXKcWjfp2Xd.jpg` | 302 109 | archive |
| `wp-content/uploads/2025/10/YwiSrtbbYPdS.jpeg` | 146 826 | archive |
| `wp-content/uploads/2025/10/aissa-dione-bazin-bleu-ciel-1-scaled.jpg` | 346 585 | live origin |
| `wp-content/uploads/2025/10/btbm9zt1o4I6.jpg` | 254 032 | archive |
| `wp-content/uploads/2025/10/byshra-bleu-ciel-1-scaled.jpg` | 221 875 | live origin |
| `wp-content/uploads/2025/10/dicko-mikado-rose-1-scaled.jpg` | 240 648 | live origin |
| `wp-content/uploads/2025/10/fary-turquoise-scaled.jpg` | 397 784 | live origin |
| `wp-content/uploads/2025/10/fatita-mikado-rose-1-scaled.jpg` | 262 339 | live origin |
| `wp-content/uploads/2025/10/iAgbZgepNuiB.jpeg` | 247 035 | archive |
| `wp-content/uploads/2025/10/mahawa-rouille-scaled.jpg` | 212 800 | live origin |
| `wp-content/uploads/2025/11/056EIilO5DeQ.jpg` | 4 319 | archive |
| `wp-content/uploads/2025/11/2CF9Sq4qes0r.jpg` | 218 113 | archive |
| `wp-content/uploads/2025/11/69OvsUfMBMhv.jpeg` | 18 671 | archive |
| `wp-content/uploads/2025/11/7jpXcJLfwa0y.jpeg` | 5 657 | archive |
| `wp-content/uploads/2025/11/A7407592-1-scaled.jpg` | 365 922 | live origin |
| `wp-content/uploads/2025/11/BJP8LXIps4aD.jpg` | 108 106 | archive |
| `wp-content/uploads/2025/11/BOLGfrkXAHHR.jpeg` | 30 992 | archive |
| `wp-content/uploads/2025/11/CfFG93j9xysP.jpeg` | 967 232 | archive |
| `wp-content/uploads/2025/11/H75rTnkBP1ZQ.jpg` | 247 041 | archive |
| `wp-content/uploads/2025/11/IMG_5055-10x12.jpeg` | 481 | live origin |
| `wp-content/uploads/2025/11/IMG_5055-1259x1536.jpeg` | 58 520 | live origin |
| `wp-content/uploads/2025/11/IMG_5055-246x300.jpeg` | 5 657 | live origin |
| `wp-content/uploads/2025/11/IMG_5055-600x732.jpeg` | 18 671 | live origin |
| `wp-content/uploads/2025/11/IMG_5055-768x937.jpeg` | 27 908 | live origin |
| `wp-content/uploads/2025/11/IMG_5055-839x1024.jpeg` | 30 992 | live origin |
| `wp-content/uploads/2025/11/IMG_5055.jpeg` | 357 448 | live origin |
| `wp-content/uploads/2025/11/IMG_5512.jpeg` | 967 232 | live origin |
| `wp-content/uploads/2025/11/IMG_5515.jpeg` | 1 042 407 | live origin |
| `wp-content/uploads/2025/11/IMG_9113-scaled.jpeg` | 176 229 | live origin |
| `wp-content/uploads/2025/11/MMC0134-1-1-scaled.jpg` | 246 952 | live origin |
| `wp-content/uploads/2025/11/MMC0148-1-1-scaled.jpg` | 260 366 | live origin |
| `wp-content/uploads/2025/11/MMC0182-1-1-scaled.jpg` | 307 258 | live origin |
| `wp-content/uploads/2025/11/MMC0192-1-1-scaled.jpg` | 229 078 | live origin |
| `wp-content/uploads/2025/11/Maison-sow-fatou-Instagram-Post-45-10x12.jpg` | 4 319 | live origin |
| `wp-content/uploads/2025/11/Maison-sow-fatou-Instagram-Post-45-240x300.jpg` | 7 135 | live origin |
| `wp-content/uploads/2025/11/Maison-sow-fatou-Instagram-Post-45-600x750.jpg` | 17 799 | live origin |
| `wp-content/uploads/2025/11/Maison-sow-fatou-Instagram-Post-45-768x960.jpg` | 24 017 | live origin |
| `wp-content/uploads/2025/11/Maison-sow-fatou-Instagram-Post-45-819x1024.jpg` | 25 598 | live origin |
| `wp-content/uploads/2025/11/Maison-sow-fatou-Instagram-Post-45.jpg` | 108 106 | live origin |
| `wp-content/uploads/2025/11/N71LwZGsjXAa.jpg` | 24 017 | archive |
| `wp-content/uploads/2025/11/SOFATOO-SITEWEB-202308963-scaled.jpeg` | 197 480 | live origin |
| `wp-content/uploads/2025/11/UBNpaMiE2Pab.jpg` | 269 341 | archive |
| `wp-content/uploads/2025/11/VuW7RJhxiKoU.jpg` | 7 135 | archive |
| `wp-content/uploads/2025/11/WTdns888FEde.jpeg` | 294 222 | archive |
| `wp-content/uploads/2025/11/aissa-dione-2-1-scaled.jpg` | 247 041 | live origin |
| `wp-content/uploads/2025/11/aissatou-dress-noir-scaled.jpg` | 218 113 | live origin |
| `wp-content/uploads/2025/11/assy-1-scaled.jpg` | 337 560 | live origin |
| `wp-content/uploads/2025/11/babinou-bordeau-1-scaled.jpg` | 266 425 | live origin |
| `wp-content/uploads/2025/11/bandel-dress-scaled.jpg` | 426 480 | live origin |
| `wp-content/uploads/2025/11/elPaMTN7SNDm.jpeg` | 58 520 | archive |
| `wp-content/uploads/2025/11/hxwKg5oBO4uU.jpeg` | 357 448 | archive |
| `wp-content/uploads/2025/11/icepUxIOs94e.jpg` | 337 560 | archive |
| `wp-content/uploads/2025/11/jN19U0YySdEf.jpg` | 25 598 | archive |
| `wp-content/uploads/2025/11/lhktsFG8sHKQ.jpg` | 17 799 | archive |
| `wp-content/uploads/2025/11/opdwkfiKlxPr.jpeg` | 27 908 | archive |
| `wp-content/uploads/2025/11/so-4-1-scaled.jpg` | 380 208 | live origin |
| `wp-content/uploads/2025/11/so-scaled.jpg` | 394 174 | live origin |
| `wp-content/uploads/2025/11/w8hzgo9Mdqc6.jpeg` | 481 | archive |
| `wp-content/uploads/2025/11/wi5Q6F6od54v.jpg` | 426 480 | archive |
| `wp-content/uploads/2026/01/6KHOFaUC9jvj.jpg` | 604 007 | archive |
| `wp-content/uploads/2026/01/IMG_5983-scaled.jpeg` | 843 820 | live origin |
| `wp-content/uploads/2026/01/IMG_5988-scaled.jpeg` | 922 984 | live origin |
| `wp-content/uploads/2026/01/IMG_5991-scaled.jpeg` | 854 168 | live origin |
| `wp-content/uploads/2026/01/IMG_6004-scaled.jpeg` | 979 297 | live origin |
| `wp-content/uploads/2026/01/IMG_6009-scaled.jpeg` | 444 351 | live origin |
| `wp-content/uploads/2026/01/Yaay-Toulaye-mikado-rose-scaled.jpg` | 299 364 | live origin |
| `wp-content/uploads/2026/01/Yaayou-Coumba-brocart-rouge-scaled.jpg` | 521 968 | live origin |
| `wp-content/uploads/2026/01/Yaayou-Coumba-mikado-mauve-front-scaled.jpg` | 280 245 | live origin |
| `wp-content/uploads/2026/01/Yaayou-Seexyi-mikado-vert-scaled.jpg` | 284 709 | live origin |
| `wp-content/uploads/2026/01/yaayou-momo-brocart-rouge-scaled.jpg` | 604 007 | live origin |
| `wp-content/uploads/2026/01/yaayou-momo-mikado-bleu-scaled.jpg` | 345 559 | live origin |
| `wp-content/uploads/2026/04/WhatsApp-Image-2026-04-24-at-16.24.18-683x1024.jpeg` | 86 809 | live origin |
| `wp-content/uploads/2026/04/WhatsApp-Image-2026-04-24-at-16.24.18.jpeg` | 83 072 | live origin |
| `wp-content/uploads/2026/04/WhatsApp-Image-2026-04-24-at-16.24.22-1-685x1024.jpeg` | 87 861 | live origin |
| `wp-content/uploads/2026/04/WhatsApp-Image-2026-04-24-at-16.24.22-1.jpeg` | 133 716 | live origin |
| `wp-content/uploads/2026/04/WhatsApp-Image-2026-04-24-at-16.24.22-685x1024.jpeg` | 87 624 | live origin |
| `wp-content/uploads/2026/04/WhatsApp-Image-2026-04-24-at-16.24.22.jpeg` | 130 249 | live origin |
| `wp-content/uploads/2026/04/WhatsApp-Image-2026-04-24-at-16.24.23-2-685x1024.jpeg` | 69 373 | live origin |
| `wp-content/uploads/2026/04/WhatsApp-Image-2026-04-24-at-16.24.23-2.jpeg` | 116 274 | live origin |
| `wp-content/uploads/2026/04/images.jpg` | 6 280 | live origin |
| `wp-content/uploads/2026/04/yaayou-seex-brocart-2.jpeg` | 76 399 | live origin |
| `wp-content/uploads/2026/05/A7406784-scaled.jpg` | 467 416 | live origin |
| `wp-content/uploads/2026/05/MMC0471-300x300.jpg` | 41 073 | live origin |
| `wp-content/uploads/2026/08/20bd89ad-c2e6-407d-8640-ea4f13e59403.jpg` | 189 243 | live origin |
| `wp-content/uploads/2026/08/FDA7DE58-2854-4F36-8780-BF37E42D592C.jpg` | 680 936 | live origin |
| `wp-content/uploads/2026/08/IMG_1562-scaled.jpeg` | 718 755 | live origin |
| `wp-content/uploads/2026/08/IMG_7857.jpeg` | 365 365 | live origin |
| `wp-content/uploads/2026/08/NKA8TsShJX8q.jpeg` | 365 365 | archive |
| `wp-content/uploads/2026/08/OWPP2vnSgrU5.jpg` | 680 936 | archive |
| `wp-content/uploads/2026/08/UTto2sNujVvF.jpeg` | 718 755 | archive |
| `wp-content/uploads/2026/08/WZl3Tik9PzCR.jpg` | 189 243 | archive |
| `wp-content/uploads/2026/08/bm8WrBXRh96x.jpg` | 388 484 | archive |
| `wp-content/uploads/2026/08/qreZE0Bqvgf0.jpg` | 734 822 | archive |
| `wp-content/uploads/2026/08/rd0ZST94Wg15.jpg` | 553 988 | archive |
| `wp-content/uploads/2026/10/img_5724-900x1200.jpeg` | 123 191 | live origin |

</details>

## Archive files not referenced by any rebuilt page

Preserved in the archive but unused by the 51 rebuilt routes (they belong to pages
outside this scope, or are superseded asset revisions). **Not deleted** from the archive;
simply not copied into `site/`.

| Path | Bytes |
|---|---:|
| `wp-content/themes/sofatoo-maison-disabled/assets/css/home-reference.css` | 17 396 |
| `wp-content/uploads/essential-addons-elementor/eael-9162.js` | 71 900 |
| `wp-includes/js/wp-emoji-release.min.js` | 22 752 |

## Known-missing media

| Path | State |
|---|---|
| `wp-content/uploads/2025/05/IMG_6030-large-683x1024.webp` | **404 on the live origin too** — referenced by `/book/`, absent from the archive. Pre-existing breakage, not substituted. |
| `wp-content/uploads/2025/05/media-libraryjg697li1h1m4bqlSs7t-micro-large-1-683x1024.webp` | **404 on the live origin too** — same page, same conclusion. |
