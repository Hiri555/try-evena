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
