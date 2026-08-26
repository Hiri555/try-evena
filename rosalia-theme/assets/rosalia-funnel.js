/* ==========================================================================
   Rosalia · Funnel pages — behaviour
   --------------------------------------------------------------------------
   Two jobs only:
     1. the sticky CTA bar (advertorial)
     2. the auto-dated timeline (listicles)

   Rules this file follows:
     - no storage of any kind (no localStorage / sessionStorage / cookies)
     - every lookup guarded; a missing node is a no-op, never a throw
     - re-initialises on the theme-editor lifecycle events, so adding,
       reordering, duplicating or hiding a section keeps working
     - listeners are torn down before being re-attached (no duplicates)
   ========================================================================== */

(function () {
  'use strict';

  // Every funnel section is self-contained and emits its own <script src>.
  // The browser fetches the file once but would execute it once per tag, so
  // this guard makes duplicate inclusion a no-op instead of double-binding.
  if (window.__rosaliaFunnelBooted) return;
  window.__rosaliaFunnelBooted = true;

  /* ---------- helpers --------------------------------------------------- */

  function each(list, fn) {
    if (!list) return;
    Array.prototype.forEach.call(list, fn);
  }

  /* ---------- 1 · sticky CTA -------------------------------------------- */
  /* Shows once the reader is past the first screen. Hides again whenever the
     real offer or the footer is on screen, so it never covers a live CTA. */

  var stickyBars = [];

  function teardownSticky() {
    each(stickyBars, function (entry) {
      try {
        window.removeEventListener('scroll', entry.handler);
        window.removeEventListener('resize', entry.handler);
      } catch (e) { /* nothing to undo */ }
    });
    stickyBars = [];
  }

  function initSticky(root) {
    var scope = root || document;
    each(scope.querySelectorAll('[data-rf-sticky]'), function (bar) {
      if (!bar) return;

      // Elements the bar must yield to. Selectors are data-driven so the
      // section stays movable — nothing depends on document order.
      var yieldSelector = bar.getAttribute('data-rf-sticky-yield') || '';
      var threshold = parseFloat(bar.getAttribute('data-rf-sticky-after')) || 0.9;

      function isAnyYieldVisible() {
        if (!yieldSelector) return false;
        var found = false;
        try {
          each(document.querySelectorAll(yieldSelector), function (el) {
            if (found || !el) return;
            var r = el.getBoundingClientRect();
            // visible if any part of it intersects the viewport
            if (r.top < window.innerHeight && r.bottom > 0) found = true;
          });
        } catch (e) { /* bad selector — treat as "nothing to yield to" */ }
        return found;
      }

      function update() {
        try {
          var y = window.pageYOffset || document.documentElement.scrollTop || 0;
          var pastFirstScreen = y > window.innerHeight * threshold;
          if (pastFirstScreen && !isAnyYieldVisible()) {
            bar.classList.add('is-visible');
            bar.removeAttribute('aria-hidden');
          } else {
            bar.classList.remove('is-visible');
            bar.setAttribute('aria-hidden', 'true');
          }
        } catch (e) { /* never let the bar break the page */ }
      }

      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      stickyBars.push({ bar: bar, handler: update });
      update();
    });
  }

  /* ---------- 2 · timeline dates ---------------------------------------- */
  /* Each row carries data-rf-offset="<days>". We render a real date so the
     timeline reads as "this is your week", not a generic chart.
     The Liquid already prints a static fallback inside the node, so if this
     never runs the row still says something sensible — and there is no
     flash of empty content. */

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function fmt(offsetDays) {
    var d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return MONTHS[d.getMonth()] + ' ' + d.getDate();
  }

  function initDates(root) {
    var scope = root || document;
    each(scope.querySelectorAll('[data-rf-offset]'), function (node) {
      if (!node) return;
      try {
        var days = parseInt(node.getAttribute('data-rf-offset'), 10);
        if (isNaN(days)) return;

        var label = fmt(days);

        // A milestone can span a range ("Sep 14 – Sep 27") rather than land
        // on a single day. The end offset is optional.
        var end = parseInt(node.getAttribute('data-rf-offset-end'), 10);
        if (!isNaN(end) && end !== days) label += ' – ' + fmt(end);

        var prefix = node.getAttribute('data-rf-prefix');
        node.textContent = prefix ? prefix + ' ' + label : label;
      } catch (e) { /* keep the Liquid fallback that is already in the node */ }
    });
  }

  /* ---------- boot ------------------------------------------------------ */

  function boot(root) {
    initSticky(root);
    initDates(root);
  }

  function rebootAll() {
    teardownSticky();
    boot(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(document); });
  } else {
    boot(document);
  }

  // Theme editor lifecycle. `target` is the section wrapper being changed.
  document.addEventListener('shopify:section:load', function (e) {
    teardownSticky();
    boot(document);
    if (e && e.target) initDates(e.target);
  });
  document.addEventListener('shopify:section:unload', rebootAll);
  document.addEventListener('shopify:section:reorder', rebootAll);
})();
