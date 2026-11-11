document.addEventListener('DOMContentLoaded', function () {
  if (document.documentElement.dataset.sfebInitialized) return;
  document.documentElement.dataset.sfebInitialized = '1';
  // The legacy footer calls wp_footer twice; retain one language control.
  document.querySelectorAll('.trp-floating-switcher').forEach(function(el,i){if(i)el.remove();});
  var body = document.body;
  var slugs = ['female', 'male', 'kids', 'gifts'];
  slugs.forEach(function (slug) {
    if (!body.classList.contains('term-' + slug)) return;
    document.querySelectorAll('.sf-shop-category-group__parent').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href.indexOf('/' + slug + '/') !== -1 || href.indexOf('product_cat=' + slug) !== -1) {
        link.closest('.sf-shop-category-group')?.classList.add('is-current');
        link.setAttribute('aria-current', 'page');
      }
    });
  });

  // Keep the current taxonomy intact; only order its existing filter links.
  var order = ['classics','women-casual-wear-yawmiyan','women-workwear','special-occasions','eid-outfit','so-fatoo-men-classics','men-casual-wear-yawmiyan','corporate-male','jummuah-wear-male','special-occasions-male','wedding-male','classics-wear-kids','kids-casuals','girls-specials','boys-specials','accessories','branded-products','giftboxes','giftcards','giving-back'];
  function categorySlug(href) {
    var url = new URL(href, location.href);
    return url.searchParams.get('product_cat') || url.pathname.split('/').filter(Boolean).pop();
  }
  var currentSlug = new URL(location.href).searchParams.get('product_cat') || location.pathname.split('/').filter(Boolean).pop();
  var categoryIndex = order.indexOf(currentSlug);
  if (categoryIndex >= 0) {
    var parentSlug = categoryIndex < 5 ? 'female' : categoryIndex < 11 ? 'male' : categoryIndex < 15 ? 'kids' : 'gifts';
    document.querySelectorAll('.sf-shop-category-group__parent').forEach(function(link){
      if (categorySlug(link.href) === parentSlug) link.closest('.sf-shop-category-group').classList.add('is-current');
    });
  }
  document.querySelectorAll('.sf-filter-category-groups ul').forEach(function (list) {
    var children = Array.from(list.children);
    children.sort(function (a,b) {
      var ai = order.indexOf(categorySlug(a.querySelector('a').href));
      var bi = order.indexOf(categorySlug(b.querySelector('a').href));
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    }).forEach(function (li) {
      list.appendChild(li);
      var link = li.querySelector('a');
      var selected = categorySlug(link.href) === currentSlug;
      if (selected) link.setAttribute('aria-current', 'page');
      li.hidden = !selected && /\(0\)\s*$/.test(link.textContent);
    });
    if (children.length && children.every(function(li){return li.hidden;})) list.closest('section').hidden=true;
  });
  var catField = document.querySelector('.widget_price_filter input[name="product_cat"]');
  var queryCategory = new URL(location.href).searchParams.get('product_cat');
  if (catField && !catField.value && queryCategory) catField.value = queryCategory;
  if (catField && queryCategory) catField.form.addEventListener('submit', function(){catField.value=queryCategory;});

  var dialog = document.querySelector('#sfeb-stock-dialog');
  if (dialog) {
    var form = document.querySelector('form.variations_form');
    var fr = dialog.dataset.french === '1';
    var summary = document.querySelector('.summary, .sf-product-detail__summary');
    var cta = document.createElement('button');
    cta.type = 'button'; cta.className = 'sf-button sfeb-stock-cta';
    cta.textContent = fr ? 'Indisponible ? Contactez-nous sur WhatsApp' : 'Unavailable? Ask us on WhatsApp';
    cta.hidden = true;
    if (summary) summary.appendChild(cta);
    var lastShown = '', interacted = false;
    function updateLink() {
      var choices = form ? Array.from(form.querySelectorAll('select')).filter(function(s){return s.value;}).map(function(s){ return s.selectedOptions[0].textContent; }).join(' / ') : '';
      var text = (fr ? 'Bonjour, je souhaite connaître les possibilités de commande pour ' : 'Hello, I would like to ask about ordering ') + dialog.dataset.productName + (choices ? ' — ' + choices : '') + '\n' + dialog.dataset.productUrl;
      dialog.querySelector('.sfeb-stock-link').href = 'https://wa.me/221784655976?text=' + encodeURIComponent(text);
    }
    function open() { updateLink(); if (!dialog.open && typeof dialog.showModal === 'function') dialog.showModal(); }
    cta.addEventListener('click', open);
    dialog.querySelector('.sfeb-dialog-close').addEventListener('click', function(){dialog.close();});
    dialog.addEventListener('click', function(e){ if(e.target===dialog){var r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();} });
    if (dialog.dataset.outOfStock === '1') { cta.hidden = false; open(); }
    if (form && window.jQuery) {
      form.addEventListener('pointerdown', function(){interacted=true;});
      form.addEventListener('keydown', function(){interacted=true;});
      window.jQuery(form).on('found_variation.sfeb', function(event,variation) {
        var unavailable = variation.is_in_stock === false || variation.is_purchasable === false;
        cta.hidden = !unavailable;
        if (unavailable && interacted && lastShown !== String(variation.variation_id)) {lastShown=String(variation.variation_id);open();}
        if (!unavailable) {lastShown='';if(dialog.open)dialog.close();}
      }).on('reset_data.sfeb', function(){
        lastShown='';
        cta.hidden=dialog.dataset.outOfStock !== '1';
        if(cta.hidden && dialog.open)dialog.close();
      });
    }
  }

  document.querySelectorAll('[data-sf-story-slider]').forEach(function (slider) {
    var images = Array.from(slider.querySelectorAll('.sf-home-stories-slider__slide img'));
    images.slice(0, 3).forEach(function (image) {
      image.loading = 'eager';
      image.fetchPriority = image === images[0] ? 'high' : 'auto';
    });
    slider.querySelectorAll('[data-sf-story-prev],[data-sf-story-next]').forEach(function (button) {
      button.addEventListener('pointerdown', function () {
        images.forEach(function (image) { image.loading = 'eager'; });
      }, { once: true });
    });
    if (slider.closest('.elementor-widget-sfeb-home') && !slider.dataset.sfebReady) {
      var track = slider.querySelector('.sf-home-stories-slider__track');
      slider.querySelector('[data-sf-story-prev]')?.addEventListener('click', function () {
        track?.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
      });
      slider.querySelector('[data-sf-story-next]')?.addEventListener('click', function () {
        track?.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
      });
      slider.dataset.sfebReady = '1';
    }
  });
});
