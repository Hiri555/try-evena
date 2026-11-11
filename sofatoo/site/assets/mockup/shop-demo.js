/* ───────────────────────────────────────────────────────────────────────────
   So' Fatoo — front-end shop DEMO layer

   The mirrored site is static: WooCommerce, its database and its payment
   gateway do not exist here. This script makes the *shopping journey* real on
   the client so the design can be demonstrated end to end:

       product page / card  ->  bag  ->  cart  ->  checkout  ->  confirmation

   State lives in localStorage. NOTHING is sent anywhere, no payment is taken
   and no order is created. The confirmation screen says so explicitly.
   ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════
     SETTINGS — edit these, nothing else in this file needs changing.
     ═══════════════════════════════════════════════════════════════════ */
  var CONFIG = {
    currency:      'FCFA',   // shown before every amount
    currencyAfter: false,    // true -> "90,000 FCFA" instead of "FCFA 90,000"
    showBadge:     true,     // the "DEMO - no payment, no backend" ribbon
    openBagOnAdd:  true,     // slide the mini bag open after adding
    quickAddCards: true,     // "Add to bag" button on product cards
    freeShipping:  true,     // checkout shows shipping as Free
    labels: {
      bagTitle:    'Your bag',
      addToBag:    'Add to bag',
      added:       'added to your bag',
      empty:       'Your bag is empty.',
      checkout:    'Checkout',
      viewBag:     'View bag',
      placeOrder:  'Place order',
      thankYou:    'Thank you'
    }
  };
  /* ═══════════════════════════════════════════════════════════════════ */

  var KEY = 'sofatoo_demo_cart_v1';
  var CUR = CONFIG.currency;
  var L = CONFIG.labels;

  /* ---------- root-relative helper (pages live at varying depths) ---------- */
  var ROOT = (function () {
    var l = document.querySelector('link[href$="assets/mockup/shop-demo.css"]');
    if (l) return l.getAttribute('href').replace(/assets\/mockup\/shop-demo\.css$/, '');
    return '';
  })();
  var url = function (p) { return ROOT + p; };

  /* ---------- store ---------- */
  function read() {
    try { var v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function write(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
    paint();
    document.dispatchEvent(new CustomEvent('sfd:change', { detail: items }));
  }
  var count = function () { return read().reduce(function (n, i) { return n + i.qty; }, 0); };
  var total = function () { return read().reduce(function (n, i) { return n + i.price * i.qty; }, 0); };

  function money(n) {
    var v = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return CONFIG.currencyAfter ? v + ' ' + CUR : CUR + ' ' + v;
  }
  function parsePrice(txt) {
    if (!txt) return 0;
    var m = String(txt).replace(/\s/g, '').match(/([\d.,]{2,})/);
    if (!m) return 0;
    return parseFloat(m[1].replace(/,/g, '')) || 0;
  }

  function add(item) {
    var items = read();
    var hit = items.filter(function (i) { return i.id === item.id && i.variant === item.variant; })[0];
    if (hit) hit.qty += item.qty; else items.push(item);
    write(items);
    toast(item.name + ' ' + L.added);
    if (CONFIG.openBagOnAdd) openMini();
  }
  function setQty(idx, q) {
    var items = read();
    if (!items[idx]) return;
    if (q <= 0) items.splice(idx, 1); else items[idx].qty = q;
    write(items);
    renderMini(); renderCartPage(); renderCheckout();
  }

  /* ---------- header bag count ---------- */
  function paint() {
    var n = count();
    [].forEach.call(document.querySelectorAll('.sf-cart-count'), function (el) { el.textContent = n; });
    [].forEach.call(document.querySelectorAll('[data-sfd-count]'), function (el) { el.textContent = n; });
  }

  /* ---------- toast ---------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'sfd-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  /* ---------- mini bag ---------- */
  var mini, scrim;
  function buildMini() {
    scrim = document.createElement('div');
    scrim.className = 'sfd-scrim';
    scrim.addEventListener('click', closeMini);

    mini = document.createElement('aside');
    mini.className = 'sfd-mini';
    mini.setAttribute('aria-label', 'Shopping bag');
    mini.innerHTML =
      '<div class="sfd-mini__top"><h2>' + L.bagTitle + '</h2>' +
      '<button type="button" class="sfd-mini__close">Close</button></div>' +
      '<div class="sfd-mini__body"></div>' +
      '<div class="sfd-mini__foot"></div>';
    mini.querySelector('.sfd-mini__close').addEventListener('click', closeMini);
    document.body.appendChild(scrim);
    document.body.appendChild(mini);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMini();
    });
  }
  function openMini() { renderMini(); scrim.classList.add('is-open'); mini.classList.add('is-open'); }
  function closeMini() { if (scrim) scrim.classList.remove('is-open'); if (mini) mini.classList.remove('is-open'); }

  function lineHtml(it, idx) {
    return '<div class="sfd-line">' +
      '<img src="' + it.img + '" alt="' + esc(it.name) + '" loading="lazy">' +
      '<div><p class="sfd-line__name">' + (it.href ? '<a href="' + it.href + '">' + esc(it.name) + '</a>' : esc(it.name)) + '</p>' +
      (it.variant ? '<p class="sfd-line__var">' + esc(it.variant.replace(/-/g, ' ')) + '</p>' : '') +
      '<div class="sfd-qty"><button type="button" data-sfd-dec="' + idx + '" aria-label="Decrease quantity">&minus;</button>' +
      '<span>' + it.qty + '</span>' +
      '<button type="button" data-sfd-inc="' + idx + '" aria-label="Increase quantity">+</button></div>' +
      '<button type="button" class="sfd-rm" data-sfd-rm="' + idx + '">Remove</button></div>' +
      '<div class="sfd-line__price">' + money(it.price * it.qty) + '</div></div>';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderMini() {
    if (!mini) return;
    var items = read();
    var body = mini.querySelector('.sfd-mini__body');
    var foot = mini.querySelector('.sfd-mini__foot');
    if (!items.length) {
      body.innerHTML = '<p class="sfd-empty">' + L.empty + '</p>';
      foot.innerHTML = '<a class="sfd-btn sfd-btn--ghost" href="' + url('shop/') + '">Continue shopping</a>';
      return;
    }
    body.innerHTML = items.map(lineHtml).join('');
    foot.innerHTML =
      '<div class="sfd-row sfd-row--total"><span>Subtotal</span><span>' + money(total()) + '</span></div>' +
      '<a class="sfd-btn" href="' + url('checkout/') + '">' + L.checkout + '</a>' +
      '<a class="sfd-btn sfd-btn--ghost" href="' + url('cart/') + '">' + L.viewBag + '</a>' +
      '<p class="sfd-note">Demonstration bag. No payment is taken and no order is created.</p>';
  }

  /* ---------- delegated qty / remove ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-sfd-inc],[data-sfd-dec],[data-sfd-rm]');
    if (!t) return;
    e.preventDefault();
    var items = read();
    if (t.hasAttribute('data-sfd-inc')) { var i = +t.getAttribute('data-sfd-inc'); setQty(i, items[i].qty + 1); }
    else if (t.hasAttribute('data-sfd-dec')) { var d = +t.getAttribute('data-sfd-dec'); setQty(d, items[d].qty - 1); }
    else { setQty(+t.getAttribute('data-sfd-rm'), 0); }
  });

  /* ---------- open bag from the header link ---------- */
  function wireHeader() {
    [].forEach.call(document.querySelectorAll('.sf-cart-link'), function (a) {
      a.addEventListener('click', function (e) {
        // on the cart page itself, let the link behave normally
        if (/\/cart\/?$/.test(location.pathname)) return;
        e.preventDefault();
        openMini();
      });
    });
  }

  /* ---------- product detail page ---------- */
  function wireProductPage() {
    var form = document.querySelector('form.cart');
    if (!form) return;
    var titleEl = document.querySelector('.product_title');
    if (!titleEl) return;

    var name = titleEl.textContent.trim();
    var id = (form.querySelector('[name="add-to-cart"]') || {}).value ||
             form.getAttribute('data-product_id') || name;
    var basePrice = parsePrice((document.querySelector('.summary .price, p.price') || {}).textContent);

    // variable products carry their prices in data-product_variations
    var variations = [];
    try { variations = JSON.parse(form.getAttribute('data-product_variations') || '[]') || []; } catch (e) {}

    // The variation-swatches plugin hides the native <select> and drives it from
    // .tawcvs-swatches .swatch[data-value]. Read the select first, fall back to the
    // visually selected swatch so the demo works with or without that plugin's JS.
    function chosen() {
      var map = {};
      [].forEach.call(form.querySelectorAll('select[name^="attribute_"]'), function (s) {
        if (s.value) map[s.name] = s.value;
      });
      [].forEach.call(form.querySelectorAll('.tawcvs-swatches[data-attribute_name]'), function (g) {
        var key = g.getAttribute('data-attribute_name');
        if (map[key]) return;
        var sel = g.querySelector('.swatch.selected[data-value], .swatch[data-value].selected');
        if (sel) map[key] = sel.getAttribute('data-value');
      });
      return map;
    }
    function attrKeys() {
      var keys = [].map.call(form.querySelectorAll('select[name^="attribute_"]'), function (s) { return s.name; });
      [].forEach.call(form.querySelectorAll('.tawcvs-swatches[data-attribute_name]'), function (g) {
        var k = g.getAttribute('data-attribute_name');
        if (keys.indexOf(k) < 0) keys.push(k);
      });
      return keys;
    }
    function currentVariant() {
      var m = chosen();
      return attrKeys().map(function (k) { return m[k]; }).filter(Boolean).join(' / ');
    }
    function currentPrice() {
      if (variations.length) {
        var m = chosen();
        var match = variations.filter(function (v) {
          return Object.keys(m).every(function (k) {
            var want = v.attributes[k];
            return !want || want === m[k];
          });
        })[0] || variations[0];
        if (match && match.display_price) return match.display_price;
      }
      return basePrice;
    }
    function currentImage() {
      var img = document.querySelector('.woocommerce-product-gallery img, .sf-product-gallery img, .summary img');
      return img ? (img.currentSrc || img.src) : url('wp-content/themes/sofatoo-maison-disabled/assets/images/sofatoo-logo-rose-gold.png');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = chosen();
      var missing = attrKeys().filter(function (k) { return !m[k]; });
      if (missing.length) {
        toast('Please choose ' + missing[0].replace(/^attribute_pa_/, '').replace(/-/g, ' '));
        var g = form.querySelector('.tawcvs-swatches[data-attribute_name="' + missing[0] + '"] .swatch');
        if (g) g.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }
      var qtyEl = form.querySelector('input.qty, input[name="quantity"]');
      add({
        id: String(id), name: name, variant: currentVariant(),
        price: currentPrice(), qty: Math.max(1, parseInt(qtyEl && qtyEl.value, 10) || 1),
        img: currentImage(), href: location.pathname
      });
    });
  }

  /* ---------- product cards (home rails, shop, category archives) ---------- */
  function wireCards() {
    if (!CONFIG.quickAddCards) return;
    [].forEach.call(document.querySelectorAll('.sf-product-card, li.product'), function (card) {
      if (card.querySelector('.sfd-quick')) return;
      var media = card.querySelector('.sf-product-card__media') || card.querySelector('a');
      var link = card.querySelector('a[href]');
      var img = card.querySelector('img');
      var nameEl = card.querySelector('h3, h2, .woocommerce-loop-product__title');
      var priceEl = card.querySelector('.sf-product-card__price, .price');
      if (!media || !nameEl) return;
      var price = parsePrice(priceEl && priceEl.textContent);

      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sfd-quick';
      b.textContent = L.addToBag;
      b.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        add({
          id: (link && link.getAttribute('href')) || nameEl.textContent.trim(),
          name: nameEl.textContent.trim(), variant: '',
          price: price, qty: 1,
          img: img ? (img.currentSrc || img.src) : '',
          href: link ? link.getAttribute('href') : ''
        });
      });
      if (getComputedStyle(media).position === 'static') media.style.position = 'relative';
      media.appendChild(b);
    });
  }

  /* ---------- cart page ---------- */
  function renderCartPage() {
    var host = document.querySelector('.sf-commerce-content .woocommerce');
    if (!host || !/\/cart\/?$/.test(location.pathname)) return;
    var items = read();
    if (!items.length) {
      host.innerHTML =
        '<div class="sfd-page"><p class="sfd-empty">Your bag is currently empty.</p>' +
        '<p style="text-align:center"><a class="sfd-btn sfd-btn--ghost" style="display:inline-block;width:auto;padding:14px 32px" href="' + url('shop/') + '">Return to shop</a></p></div>';
      return;
    }
    host.innerHTML =
      '<div class="sfd-page"><div class="sfd-grid"><div>' +
      items.map(lineHtml).join('') +
      '</div><aside class="sfd-panel"><h3>Order summary</h3>' +
      '<div class="sfd-row"><span>Subtotal</span><span>' + money(total()) + '</span></div>' +
      '<div class="sfd-row"><span>Shipping</span><span>Calculated at checkout</span></div>' +
      '<div class="sfd-row sfd-row--total"><span>Total</span><span>' + money(total()) + '</span></div>' +
      '<a class="sfd-btn" href="' + url('checkout/') + '">Proceed to checkout</a>' +
      '<a class="sfd-btn sfd-btn--ghost" href="' + url('shop/') + '">Continue shopping</a>' +
      '<p class="sfd-note">Demonstration bag. No payment is taken and no order is created.</p>' +
      '</aside></div></div>';
  }

  /* ---------- checkout page ---------- */
  function renderCheckout() {
    var host = document.querySelector('.sf-commerce-content .woocommerce');
    if (!host || !/\/checkout\/?$/.test(location.pathname)) return;
    var items = read();
    if (!items.length) {
      host.innerHTML = '<div class="sfd-page"><p class="sfd-empty">Your bag is empty — nothing to check out.</p>' +
        '<p style="text-align:center"><a class="sfd-btn sfd-btn--ghost" style="display:inline-block;width:auto;padding:14px 32px" href="' + url('shop/') + '">Return to shop</a></p></div>';
      return;
    }
    host.innerHTML =
      '<div class="sfd-page"><form class="sfd-grid" id="sfd-checkout" novalidate><div>' +
      '<div class="sfd-panel" style="margin-bottom:22px"><h3>Contact</h3>' +
      '<label class="sfd-field"><span>Email address</span><input type="email" name="email" required autocomplete="email"></label>' +
      '<label class="sfd-field"><span>Phone</span><input type="tel" name="phone" autocomplete="tel"></label></div>' +
      '<div class="sfd-panel"><h3>Delivery</h3><div class="sfd-two">' +
      '<label class="sfd-field"><span>First name</span><input name="first" required autocomplete="given-name"></label>' +
      '<label class="sfd-field"><span>Last name</span><input name="last" required autocomplete="family-name"></label></div>' +
      '<label class="sfd-field"><span>Address</span><input name="addr" required autocomplete="street-address"></label>' +
      '<div class="sfd-two"><label class="sfd-field"><span>City</span><input name="city" required autocomplete="address-level2"></label>' +
      '<label class="sfd-field"><span>Country</span><select name="country"><option>Senegal</option><option>France</option><option>United States</option><option>Other</option></select></label></div>' +
      '<label class="sfd-field"><span>Delivery notes (optional)</span><textarea name="notes" rows="2"></textarea></label></div>' +
      '</div><aside class="sfd-panel"><h3>Your order</h3>' +
      items.map(function (i) {
        return '<div class="sfd-row"><span>' + esc(i.name) + (i.variant ? ' <small>(' + esc(i.variant.replace(/-/g, ' ')) + ')</small>' : '') + ' &times;' + i.qty + '</span><span>' + money(i.price * i.qty) + '</span></div>';
      }).join('') +
      '<div class="sfd-row"><span>Shipping</span><span>' + (CONFIG.freeShipping ? 'Free' : 'Calculated at checkout') + '</span></div>' +
      '<div class="sfd-row sfd-row--total"><span>Total</span><span>' + money(total()) + '</span></div>' +
      '<button type="submit" class="sfd-btn">' + L.placeOrder + '</button>' +
      '<a class="sfd-btn sfd-btn--ghost" href="' + url('cart/') + '">Back to bag</a>' +
      '<p class="sfd-note"><strong>Demonstration only.</strong> This checkout is a front-end mock-up: no payment is processed, no card details are requested and no order is created or sent anywhere.</p>' +
      '</aside></form></div>';

    document.getElementById('sfd-checkout').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target;
      var bad = [].slice.call(f.querySelectorAll('[required]')).filter(function (x) { return !x.value.trim(); });
      if (bad.length) { bad[0].focus(); toast('Please complete the required fields'); return; }
      var ref = 'SF-DEMO-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      var sum = money(total());
      write([]);
      host.innerHTML =
        '<div class="sfd-page"><div class="sfd-confirm">' +
        '<h2>' + L.thankYou + '</h2>' +
        '<p>This is where So&rsquo; Fatoo would confirm your order and send a receipt.</p>' +
        '<p><strong>No payment was taken and no order was created.</strong> This page is a front-end demonstration of the checkout flow, running with no backend.</p>' +
        '<p class="sfd-ref">Mock reference ' + ref + ' &middot; ' + sum + '</p>' +
        '<p style="margin-top:26px"><a class="sfd-btn sfd-btn--ghost" style="display:inline-block;width:auto;padding:14px 32px" href="' + url('shop/') + '">Continue shopping</a></p>' +
        '</div></div>';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- demo badge ---------- */
  function badge() {
    if (!CONFIG.showBadge || document.querySelector('.sfd-badge')) return;
    var d = document.createElement('div');
    d.className = 'sfd-badge';
    d.innerHTML = '<b>Demo</b><span>front-end mock-up &middot; no payment, no backend</span>';
    document.body.appendChild(d);
  }

  /* ---------- boot ---------- */
  function init() {
    buildMini();
    badge();
    paint();
    wireHeader();
    wireProductPage();
    wireCards();
    renderCartPage();
    renderCheckout();
    // keep the bag in sync across tabs
    window.addEventListener('storage', function (e) {
      if (e.key === KEY) { paint(); renderMini(); renderCartPage(); renderCheckout(); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
