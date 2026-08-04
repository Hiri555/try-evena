/* Rosalia — main product custom elements (symptom picker modal). */
(function () {
  if (customElements.get('rosalia-symptom-picker')) return;

  class RosaliaSymptomPicker extends HTMLElement {
    connectedCallback() {
      this.modal = this.querySelector('[data-role="symptom-modal"]');
      if (!this.modal) return;
      this.tabs = Array.from(this.modal.querySelectorAll('[data-tab-index]'));
      this.panels = Array.from(this.modal.querySelectorAll('[data-panel-index]'));
      this.closeBtn = this.modal.querySelector('[data-role="symptom-modal-close"]');
      this.onKeydown = this.onKeydown.bind(this);

      this.querySelectorAll('.rosalia-symptom-card').forEach((card) => {
        card.addEventListener('click', () => this.open(parseInt(card.dataset.index, 10) || 0));
      });
      this.tabs.forEach((tab) => {
        tab.addEventListener('click', () => this.activate(parseInt(tab.dataset.tabIndex, 10) || 0));
      });
      this.closeBtn.addEventListener('click', () => this.close());
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close();
      });
    }

    open(index) {
      this.activate(index);
      this.modal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', this.onKeydown);
      this.previousFocus = document.activeElement;
      this.closeBtn.focus();
    }

    close() {
      this.modal.setAttribute('hidden', '');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', this.onKeydown);
      if (this.previousFocus) this.previousFocus.focus();
    }

    activate(index) {
      this.tabs.forEach((tab, i) => tab.setAttribute('aria-selected', i === index ? 'true' : 'false'));
      this.panels.forEach((panel, i) => {
        if (i === index) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
      });
    }

    onKeydown(e) {
      if (e.key === 'Escape') {
        this.close();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = this.modal.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  customElements.define('rosalia-symptom-picker', RosaliaSymptomPicker);
})();

/* ──────────────────────────────────────────────────────────────
   Gallery — tap an image to open it fullscreen (photoswipe).
   Forwards the click to Impact's own zoom button so the lightbox,
   its index and its keyboard handling stay native to the theme.
   ────────────────────────────────────────────────────────────── */
(() => {
  const DRAG_THRESHOLD = 8;

  function initGallery(gallery) {
    if (gallery.dataset.rosaliaFullscreen === '1') return;

    const zoomButton = gallery.querySelector('[is="product-zoom-button"]');
    const mediaList = gallery.querySelector('.product-gallery__media-list');
    if (!zoomButton || !mediaList) return;

    gallery.dataset.rosaliaFullscreen = '1';

    let startX = 0;
    let startY = 0;
    let dragged = false;

    mediaList.addEventListener(
      'pointerdown',
      (event) => {
        startX = event.clientX;
        startY = event.clientY;
        dragged = false;
      },
      true
    );

    mediaList.addEventListener(
      'pointermove',
      (event) => {
        if (dragged) return;
        if (Math.abs(event.clientX - startX) > DRAG_THRESHOLD || Math.abs(event.clientY - startY) > DRAG_THRESHOLD) {
          dragged = true;
        }
      },
      true
    );

    mediaList.addEventListener(
      'click',
      (event) => {
        if (dragged) return;

        const media = event.target.closest('.product-gallery__media');
        if (!media || media.dataset.mediaType !== 'image') return;
        if (event.target.closest('button, a, video, model-viewer')) return;

        event.preventDefault();
        event.stopPropagation();
        zoomButton.click();
      },
      true
    );
  }

  function boot() {
    document.querySelectorAll('product-gallery').forEach(initGallery);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', boot);
})();

/* ──────────────────────────────────────────────────────────────
   Delivery estimate — business days, computed client-side.
   Skips Saturdays and Sundays; replaces the Liquid calendar-day
   fallback so cached pages still show fresh, honest dates.
   ────────────────────────────────────────────────────────────── */
(() => {
  function addBusinessDays(from, days) {
    const date = new Date(from);
    let remaining = days;
    while (remaining > 0) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) remaining -= 1;
    }
    return date;
  }

  function format(date) {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }

  function init() {
    document.querySelectorAll('[data-rosalia-delivery]').forEach((el) => {
      const min = parseInt(el.dataset.minDays, 10);
      const max = parseInt(el.dataset.maxDays, 10);
      if (!min || !max) return;
      const now = new Date();
      const minEl = el.querySelector('[data-role="date-min"]');
      const maxEl = el.querySelector('[data-role="date-max"]');
      if (minEl) minEl.textContent = format(addBusinessDays(now, min));
      if (maxEl) maxEl.textContent = format(addBusinessDays(now, max));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('shopify:section:load', init);
})();
