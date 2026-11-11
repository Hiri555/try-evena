(() => {
  const body = document.body;
  const header = document.querySelector('[data-site-header]');
  const drawer = document.getElementById('sf-drawer');
  const menuToggle = document.querySelector('.sf-menu-toggle');
  const search = document.querySelector('[data-search-overlay]');

  const toggleHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 36);
  toggleHeader();
  window.addEventListener('scroll', toggleHeader, { passive: true });

  const heroVideo = document.querySelector('[data-hero-video]');
  if (heroVideo) {
    const revealHeroVideo = () => heroVideo.classList.add('is-ready');
    if (heroVideo.readyState >= 2) revealHeroVideo();
    else heroVideo.addEventListener('loadeddata', revealHeroVideo, { once: true });
  }

  const openLayer = (layer, trigger) => {
    if (!layer) return;
    layer.classList.add('is-open');
    layer.setAttribute('aria-hidden', 'false');
    trigger?.setAttribute('aria-expanded', 'true');
    body.classList.add('sf-layer-open');
  };

  const closeLayer = (layer, trigger) => {
    if (!layer) return;
    layer.classList.remove('is-open');
    layer.setAttribute('aria-hidden', 'true');
    trigger?.setAttribute('aria-expanded', 'false');
    if (!document.querySelector('.is-open.sf-drawer, .is-open.sf-search, .is-open.sf-shop-filters')) body.classList.remove('sf-layer-open');
  };

  menuToggle?.addEventListener('click', () => openLayer(drawer, menuToggle));
  document.querySelector('[data-menu-close]')?.addEventListener('click', () => closeLayer(drawer, menuToggle));
  drawer?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeLayer(drawer, menuToggle)));

  document.querySelectorAll('[data-shop-category-toggle]').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const group = toggle.closest('.sf-shop-category-group');
      const willOpen = !group?.classList.contains('is-open');
      group?.classList.toggle('is-open', willOpen);
      toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });

  document.querySelector('[data-search-open]')?.addEventListener('click', () => {
    openLayer(search);
    setTimeout(() => search?.querySelector('input[type="search"]')?.focus(), 150);
  });
  document.querySelector('[data-search-close]')?.addEventListener('click', () => closeLayer(search));
  document.querySelector('[data-drawer-search]')?.addEventListener('click', () => {
    closeLayer(drawer, menuToggle);
    openLayer(search);
    setTimeout(() => search?.querySelector('input[type="search"]')?.focus(), 150);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeLayer(drawer, menuToggle);
    closeLayer(search);
    closeLayer(document.querySelector('[data-filter-panel]'));
  });

  document.querySelectorAll('[data-rail]').forEach((button) => {
    button.addEventListener('click', () => {
      const rail = document.getElementById(button.dataset.rail);
      rail?.scrollBy({ left: Number(button.dataset.direction || 1) * rail.clientWidth * 0.82, behavior: 'smooth' });
    });
  });

  const initCarousel = (root, options) => {
    if (!root) return;
    const slides = [...root.querySelectorAll(options.slide)];
    const thumbs = [...root.querySelectorAll(options.thumb)];
    const counter = root.querySelector(options.counter);
    let current = 0;

    const show = (index) => {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === current;
        slide.classList.toggle('is-active', isActive);
        if (!isActive) slide.querySelector('video')?.pause();
      });
      thumbs.forEach((thumb, thumbIndex) => thumb.classList.toggle('is-active', thumbIndex === current));
      if (counter) counter.textContent = String(current + 1).padStart(2, '0');
    };

    root.querySelector(options.prev)?.addEventListener('click', () => show(current - 1));
    root.querySelector(options.next)?.addEventListener('click', () => show(current + 1));
    thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => show(index)));
    show(0);
  };

  initCarousel(document.querySelector('[data-product-carousel]'), {
    slide: '[data-product-slide]', thumb: '[data-product-thumb]', counter: '[data-product-current]',
    prev: '[data-product-prev]', next: '[data-product-next]'
  });
  initCarousel(document.querySelector('[data-collection-carousel]'), {
    slide: '[data-collection-slide]', thumb: '[data-collection-thumb]', counter: '[data-collection-current]',
    prev: '[data-collection-prev]', next: '[data-collection-next]'
  });

  document.querySelectorAll('.quantity input.qty').forEach((input) => {
    const quantity = input.closest('.quantity');
    if (!quantity || quantity.classList.contains('sf-quantity-stepper')) return;
    quantity.classList.add('sf-quantity-stepper');
    const minus = document.createElement('button');
    const plus = document.createElement('button');
    minus.type = plus.type = 'button';
    minus.className = plus.className = 'sf-quantity-button';
    minus.textContent = '−';
    plus.textContent = '+';
    minus.setAttribute('aria-label', 'Decrease quantity');
    plus.setAttribute('aria-label', 'Increase quantity');
    quantity.insertBefore(minus, input);
    quantity.appendChild(plus);

    const update = (direction) => {
      const step = Number(input.step || 1) || 1;
      const min = input.min === '' ? 1 : Number(input.min);
      const max = input.max === '' ? Infinity : Number(input.max);
      const current = Number(input.value || min || 1);
      input.value = String(Math.min(max, Math.max(min, current + direction * step)));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    minus.addEventListener('click', () => update(-1));
    plus.addEventListener('click', () => update(1));
  });

  const video = document.querySelector('.sf-hero video');
  document.querySelector('[data-sound-toggle]')?.addEventListener('click', (event) => {
    if (!video) return;
    video.muted = !video.muted;
    event.currentTarget.textContent = video.muted ? sofatooMaison.enableSound : sofatooMaison.muteSound;
  });

  const filters = document.querySelector('[data-filter-panel]');
  document.querySelector('[data-filter-toggle]')?.addEventListener('click', () => openLayer(filters));
  document.querySelector('[data-filter-close]')?.addEventListener('click', () => closeLayer(filters));

  const variationForm = document.querySelector('form.variations_form');
  if (variationForm) {
    let variations = [];
    try { variations = JSON.parse(variationForm.dataset.product_variations || '[]'); } catch (error) { variations = []; }
    const syncSwatchState = () => {
      variationForm.querySelectorAll('select[data-attribute_name]').forEach((select) => {
        const valueCell = select.closest('.value');
        valueCell?.querySelectorAll('.tawcvs-swatches .swatch').forEach((swatch) => {
          const selected = Boolean(select.value) && swatch.dataset.value === select.value;
          swatch.classList.toggle('selected', selected);
          swatch.setAttribute('aria-pressed', selected ? 'true' : 'false');
          if (swatch.classList.contains('disabled')) swatch.setAttribute('aria-disabled', 'true');
        });
      });
    };
    const autoSelectSoleOptions = () => {
      variationForm.querySelectorAll('select[data-attribute_name]').forEach((select) => {
        if (select.value) return;
        const available = Array.from(select.options).filter((option) => option.value && !option.disabled);
        if (available.length !== 1) return;
        select.value = available[0].value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      syncSwatchState();
    };
    const syncVariationImage = () => {
      const selected = {};
      variationForm.querySelectorAll('select[data-attribute_name]').forEach((select) => { selected[select.dataset.attribute_name] = select.value; });
      const variation = variations.find((item) => Object.entries(item.attributes || {}).every(([key, value]) => !value || selected[key] === value));
      const image = variation?.image;
      const activeImage = document.querySelector('[data-product-carousel] [data-product-slide].is-active img');
      if (!image?.full_src || !activeImage) return;
      activeImage.src = image.full_src;
      activeImage.srcset = image.srcset || '';
      activeImage.alt = image.alt || image.title || activeImage.alt;
    };
    variationForm.addEventListener('change', () => {
      window.setTimeout(autoSelectSoleOptions, 40);
      window.setTimeout(syncSwatchState, 60);
      window.setTimeout(syncVariationImage, 80);
    });
    variationForm.querySelectorAll('.tawcvs-swatches .swatch').forEach((swatch) => swatch.addEventListener('click', () => window.setTimeout(syncVariationImage, 80)));
    if (window.jQuery) {
      window.jQuery(variationForm)
        .on('woocommerce_update_variation_values', () => window.setTimeout(autoSelectSoleOptions, 20))
        .on('found_variation', (_event, variation) => {
          const activeImage = document.querySelector('[data-product-carousel] [data-product-slide].is-active img');
          if (variation?.image?.full_src && activeImage) {
            activeImage.src = variation.image.full_src;
            activeImage.srcset = variation.image.srcset || '';
            activeImage.alt = variation.image.alt || variation.image.title || activeImage.alt;
          }
        });
    }
    window.setTimeout(() => {
      autoSelectSoleOptions();
      syncSwatchState();
    }, 80);
  }

  document.querySelector('[data-demo-newsletter]')?.addEventListener('submit', (event) => event.preventDefault());
})();
(() => {
  const body = document.body;
  const header = document.querySelector('[data-site-header]');
  const drawer = document.getElementById('sf-drawer');
  const menuToggle = document.querySelector('.sf-menu-toggle');
  const search = document.querySelector('[data-search-overlay]');

  const toggleHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 36);
  toggleHeader();
  window.addEventListener('scroll', toggleHeader, { passive: true });

  const heroVideo = document.querySelector('[data-hero-video]');
  if (heroVideo) {
    const revealHeroVideo = () => heroVideo.classList.add('is-ready');
    if (heroVideo.readyState >= 2) revealHeroVideo();
    else heroVideo.addEventListener('loadeddata', revealHeroVideo, { once: true });
  }

  const openLayer = (layer, trigger) => {
    if (!layer) return;
    layer.classList.add('is-open');
    layer.setAttribute('aria-hidden', 'false');
    trigger?.setAttribute('aria-expanded', 'true');
    body.classList.add('sf-layer-open');
  };

  const closeLayer = (layer, trigger) => {
    if (!layer) return;
    layer.classList.remove('is-open');
    layer.setAttribute('aria-hidden', 'true');
    trigger?.setAttribute('aria-expanded', 'false');
    if (!document.querySelector('.is-open.sf-drawer, .is-open.sf-search, .is-open.sf-shop-filters')) body.classList.remove('sf-layer-open');
  };

  menuToggle?.addEventListener('click', () => openLayer(drawer, menuToggle));
  document.querySelector('[data-menu-close]')?.addEventListener('click', () => closeLayer(drawer, menuToggle));
  drawer?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeLayer(drawer, menuToggle)));

  document.querySelectorAll('[data-shop-category-toggle]').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      if (!window.matchMedia('(max-width: 760px)').matches) return;
      const group = toggle.closest('.sf-shop-category-group');
      const willOpen = !group?.classList.contains('is-open');
      group?.classList.toggle('is-open', willOpen);
      toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });

  document.querySelector('[data-search-open]')?.addEventListener('click', () => {
    openLayer(search);
    setTimeout(() => search?.querySelector('input[type="search"]')?.focus(), 150);
  });
  document.querySelector('[data-search-close]')?.addEventListener('click', () => closeLayer(search));
  document.querySelector('[data-drawer-search]')?.addEventListener('click', () => {
    closeLayer(drawer, menuToggle);
    openLayer(search);
    setTimeout(() => search?.querySelector('input[type="search"]')?.focus(), 150);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeLayer(drawer, menuToggle);
    closeLayer(search);
    closeLayer(document.querySelector('[data-filter-panel]'));
  });

  document.querySelectorAll('[data-rail]').forEach((button) => {
    button.addEventListener('click', () => {
      const rail = document.getElementById(button.dataset.rail);
      rail?.scrollBy({ left: Number(button.dataset.direction || 1) * rail.clientWidth * 0.82, behavior: 'smooth' });
    });
  });

  const initCarousel = (root, options) => {
    if (!root) return;
    const slides = [...root.querySelectorAll(options.slide)];
    const thumbs = [...root.querySelectorAll(options.thumb)];
    const counter = root.querySelector(options.counter);
    let current = 0;

    const show = (index) => {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === current;
        slide.classList.toggle('is-active', isActive);
        if (!isActive) slide.querySelector('video')?.pause();
      });
      thumbs.forEach((thumb, thumbIndex) => thumb.classList.toggle('is-active', thumbIndex === current));
      if (counter) counter.textContent = String(current + 1).padStart(2, '0');
    };

    root.querySelector(options.prev)?.addEventListener('click', () => show(current - 1));
    root.querySelector(options.next)?.addEventListener('click', () => show(current + 1));
    thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => show(index)));
    show(0);
  };

  initCarousel(document.querySelector('[data-product-carousel]'), {
    slide: '[data-product-slide]', thumb: '[data-product-thumb]', counter: '[data-product-current]',
    prev: '[data-product-prev]', next: '[data-product-next]'
  });
  initCarousel(document.querySelector('[data-collection-carousel]'), {
    slide: '[data-collection-slide]', thumb: '[data-collection-thumb]', counter: '[data-collection-current]',
    prev: '[data-collection-prev]', next: '[data-collection-next]'
  });

  document.querySelectorAll('.quantity input.qty').forEach((input) => {
    const quantity = input.closest('.quantity');
    if (!quantity || quantity.classList.contains('sf-quantity-stepper')) return;
    quantity.classList.add('sf-quantity-stepper');
    const minus = document.createElement('button');
    const plus = document.createElement('button');
    minus.type = plus.type = 'button';
    minus.className = plus.className = 'sf-quantity-button';
    minus.textContent = '−';
    plus.textContent = '+';
    minus.setAttribute('aria-label', 'Decrease quantity');
    plus.setAttribute('aria-label', 'Increase quantity');
    quantity.insertBefore(minus, input);
    quantity.appendChild(plus);

    const update = (direction) => {
      const step = Number(input.step || 1) || 1;
      const min = input.min === '' ? 1 : Number(input.min);
      const max = input.max === '' ? Infinity : Number(input.max);
      const current = Number(input.value || min || 1);
      input.value = String(Math.min(max, Math.max(min, current + direction * step)));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    minus.addEventListener('click', () => update(-1));
    plus.addEventListener('click', () => update(1));
  });

  const video = document.querySelector('.sf-hero video');
  document.querySelector('[data-sound-toggle]')?.addEventListener('click', (event) => {
    if (!video) return;
    video.muted = !video.muted;
    event.currentTarget.textContent = video.muted ? sofatooMaison.enableSound : sofatooMaison.muteSound;
  });

  const filters = document.querySelector('[data-filter-panel]');
  document.querySelector('[data-filter-toggle]')?.addEventListener('click', () => openLayer(filters));
  document.querySelector('[data-filter-close]')?.addEventListener('click', () => closeLayer(filters));

  const variationForm = document.querySelector('form.variations_form');
  if (variationForm) {
    let variations = [];
    try { variations = JSON.parse(variationForm.dataset.product_variations || '[]'); } catch (error) { variations = []; }
    const syncSwatchState = () => {
      variationForm.querySelectorAll('select[data-attribute_name]').forEach((select) => {
        const valueCell = select.closest('.value');
        valueCell?.querySelectorAll('.tawcvs-swatches .swatch').forEach((swatch) => {
          const selected = Boolean(select.value) && swatch.dataset.value === select.value;
          swatch.classList.toggle('selected', selected);
          swatch.setAttribute('aria-pressed', selected ? 'true' : 'false');
          if (swatch.classList.contains('disabled')) swatch.setAttribute('aria-disabled', 'true');
        });
      });
    };
    const autoSelectSoleOptions = () => {
      variationForm.querySelectorAll('select[data-attribute_name]').forEach((select) => {
        if (select.value) return;
        const available = Array.from(select.options).filter((option) => option.value && !option.disabled);
        if (available.length !== 1) return;
        select.value = available[0].value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      syncSwatchState();
    };
    const syncVariationImage = () => {
      const selected = {};
      variationForm.querySelectorAll('select[data-attribute_name]').forEach((select) => { selected[select.dataset.attribute_name] = select.value; });
      const variation = variations.find((item) => Object.entries(item.attributes || {}).every(([key, value]) => !value || selected[key] === value));
      const image = variation?.image;
      const activeImage = document.querySelector('[data-product-carousel] [data-product-slide].is-active img');
      if (!image?.full_src || !activeImage) return;
      activeImage.src = image.full_src;
      activeImage.srcset = image.srcset || '';
      activeImage.alt = image.alt || image.title || activeImage.alt;
    };
    variationForm.addEventListener('change', () => {
      window.setTimeout(autoSelectSoleOptions, 40);
      window.setTimeout(syncSwatchState, 60);
      window.setTimeout(syncVariationImage, 80);
    });
    variationForm.querySelectorAll('.tawcvs-swatches .swatch').forEach((swatch) => swatch.addEventListener('click', () => window.setTimeout(syncVariationImage, 80)));
    if (window.jQuery) {
      window.jQuery(variationForm)
        .on('woocommerce_update_variation_values', () => window.setTimeout(autoSelectSoleOptions, 20))
        .on('found_variation', (_event, variation) => {
          const activeImage = document.querySelector('[data-product-carousel] [data-product-slide].is-active img');
          if (variation?.image?.full_src && activeImage) {
            activeImage.src = variation.image.full_src;
            activeImage.srcset = variation.image.srcset || '';
            activeImage.alt = variation.image.alt || variation.image.title || activeImage.alt;
          }
        });
    }
    window.setTimeout(() => {
      autoSelectSoleOptions();
      syncSwatchState();
    }, 80);
  }

  document.querySelector('[data-demo-newsletter]')?.addEventListener('submit', (event) => event.preventDefault());
})();
