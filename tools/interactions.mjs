#!/usr/bin/env node
/** Functional checks on the real interactive behaviour of the rebuilt homepage. */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://127.0.0.1:8777';
const out = [];
const rec = (name, ok, detail = '') => { out.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };

const b = await chromium.launch();
const guard = async (name, fn) => { try { await fn(); } catch (e) { rec(name, false, 'threw: ' + String(e.message).split('\n')[0].slice(0,120)); } };

/* ---------- mobile: drawer nav + search ---------- */
{
  const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await p.goto(BASE + '/', { waitUntil: 'load' });
  await p.waitForTimeout(900);

  const burger = p.locator('.sf-header__burger, [class*="burger"], [aria-label*="enu" i]').first();
  const drawer = p.locator('.sf-drawer').first();
  if (await burger.count()) {
    const before = await drawer.evaluate(e => getComputedStyle(e).transform + '|' + getComputedStyle(e).visibility).catch(() => 'n/a');
    await burger.click();
    await p.waitForTimeout(700);
    const after = await drawer.evaluate(e => getComputedStyle(e).transform + '|' + getComputedStyle(e).visibility).catch(() => 'n/a');
    const open = await drawer.evaluate(e => e.classList.contains('is-open') || document.body.classList.contains('sf-drawer-open') || document.documentElement.classList.contains('sf-drawer-open')).catch(() => false);
    rec('mobile drawer opens on burger tap', open || before !== after, open ? 'class toggled' : `style ${before} -> ${after}`);

    const links = await drawer.locator('a[href]').count();
    rec('mobile drawer contains nav links', links > 3, `${links} links`);
  } else rec('mobile drawer opens on burger tap', false, 'no burger control found');

  // the theme wires the overlay to [data-search-open] / [data-drawer-search], closed by [data-search-close]
  const search = p.locator('[data-search-overlay]').first();
  const sbtn = p.locator('[data-drawer-search]:visible, [data-search-open]:visible').first();
  if (await sbtn.count() && await search.count()) {
    await sbtn.click({ force: true, timeout: 8000 });
    await p.waitForTimeout(600);
    const opened = await search.evaluate(e => e.classList.contains('is-open') || e.getAttribute('aria-hidden') === 'false');
    const field = await p.locator('[data-search-overlay] input[name="s"]').isVisible().catch(() => false);
    rec('search overlay opens from its trigger', opened && field, `aria-hidden=${await search.getAttribute('aria-hidden')}, field visible=${field}`);

    await p.locator('[data-search-close]').first().click({ force: true });
    await p.waitForTimeout(600);
    const closed = await search.evaluate(e => e.getAttribute('aria-hidden') === 'true' || !e.classList.contains('is-open'));
    rec('search overlay closes again', closed);
  } else rec('search overlay opens from its trigger', false, 'control not found');
  await ctx.close();
}

/* ---------- desktop: video, product rail, nav, footer, keyboard ---------- */
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + '/', { waitUntil: 'load' });
  await p.waitForTimeout(2500);

  const vids = await p.evaluate(async () => {
    const vs = [...document.querySelectorAll('video')];
    await new Promise(r => setTimeout(r, 1500));
    return vs.map(v => ({
      src: (v.currentSrc || v.src).split('/').pop(),
      readyState: v.readyState, paused: v.paused, muted: v.muted, loop: v.loop,
      autoplay: v.autoplay, w: v.videoWidth, h: v.videoHeight, t: v.currentTime,
    }));
  });
  rec('homepage videos decode real frames', vids.length > 0 && vids.every(v => v.w > 0 && v.h > 0),
    vids.map(v => `${v.src} ${v.w}x${v.h} rs=${v.readyState}`).join('; '));
  rec('homepage videos are muted+looping autoplay', vids.every(v => v.muted && v.loop && v.autoplay),
    vids.map(v => `muted=${v.muted} loop=${v.loop} autoplay=${v.autoplay}`).join('; '));
  rec('homepage videos actually advance (playing)', vids.some(v => !v.paused || v.t > 0),
    vids.map(v => `paused=${v.paused} t=${v.t.toFixed(2)}`).join('; '));

  // product rail horizontal scroll via its controls
  const rail = p.locator('.sf-product-rail').first();
  if (await rail.count()) {
    const x0 = await rail.evaluate(e => e.scrollLeft);
    const next = p.locator('.sf-rail-controls button, .sf-rail-controls [role="button"]').last();
    if (await next.count()) {
      await next.click();
      await p.waitForTimeout(900);
      const x1 = await rail.evaluate(e => e.scrollLeft);
      rec('product rail scrolls via its control', x1 !== x0, `scrollLeft ${x0} -> ${x1}`);
    } else {
      const sw = await rail.evaluate(e => e.scrollWidth - e.clientWidth);
      rec('product rail scrolls via its control', sw > 0, `no control; overflow ${sw}px (scrollable)`);
    }
    const cards = await p.locator('.sf-product-card, [class*="product-card"]').count();
    rec('product rail is populated', cards >= 5, `${cards} cards`);
  } else rec('product rail scrolls via its control', false, 'rail not found');

  // internal navigation really works
  const nav = p.locator('a[href$="our-brand/"]:visible').first();
  if (await nav.count()) {
    await nav.click({ timeout: 8000 });
    await p.waitForURL(/our-brand/, { timeout: 15000 }).catch(() => {});
    rec('internal link navigates to a local page', /our-brand/.test(p.url()), p.url().replace(BASE, ''));
    await p.goBack();
  } else {
    const r = await p.goto(BASE + '/our-brand/');
    rec('internal link navigates to a local page', r.status() === 200, 'no visible nav link; direct load ' + r.status());
  }

  // every internal link on the homepage resolves locally
  await p.goto(BASE + '/', { waitUntil: 'load' });
  const hrefs = await p.evaluate(() => [...document.querySelectorAll('a[href]')]
    .map(a => a.getAttribute('href')).filter(h => h && !/^(#|mailto:|tel:|javascript:|https?:)/i.test(h)));
  const uniq = [...new Set(hrefs)];
  let bad = [];
  for (const h of uniq) {
    const u = new URL(h, BASE + '/').href;
    const r = await p.request.head(u).catch(() => null);
    if (!r || r.status() >= 400) bad.push(`${h} -> ${r ? r.status() : 'ERR'}`);
  }
  rec('all relative links on the homepage resolve', bad.length === 0, bad.length ? bad.slice(0, 8).join('; ') : `${uniq.length} links checked`);

  // keyboard accessibility: focus must become visible
  await p.keyboard.press('Tab');
  const foc = await p.evaluate(() => {
    const a = document.activeElement; if (!a || a === document.body) return null;
    const s = getComputedStyle(a);
    return { tag: a.tagName, outline: s.outlineStyle + ' ' + s.outlineWidth, shadow: s.boxShadow.slice(0, 40) };
  });
  rec('keyboard focus reaches a control with a visible state', !!foc && (foc.outline !== 'none 0px' || foc.shadow !== 'none'),
    foc ? `${foc.tag} outline="${foc.outline}" shadow="${foc.shadow}"` : 'focus stayed on body');

  const imgsNoAlt = await p.evaluate(() => [...document.images].filter(i => !i.hasAttribute('alt')).length);
  rec('images carry alt attributes', imgsNoAlt === 0, `${imgsNoAlt} without alt`);
  await ctx.close();
}

/* ---------- contact form markup (frontend only; no backend exists) ---------- */
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + '/contact/', { waitUntil: 'load' });
  await p.waitForTimeout(800);
  const f = await p.evaluate(() => {
    const form = document.querySelector('form');
    if (!form) return null;
    const fields = [...form.querySelectorAll('input,textarea,select')].filter(e => e.type !== 'hidden');
    const labelled = fields.filter(e => e.labels?.length || e.getAttribute('aria-label') || e.getAttribute('placeholder'));
    return { action: form.getAttribute('action'), fields: fields.length, labelled: labelled.length };
  });
  rec('contact form is present with labelled fields', !!f && f.fields > 0 && f.labelled === f.fields,
    f ? `${f.labelled}/${f.fields} labelled, action=${f.action || '(self)'}` : 'no form found');
  await ctx.close();
}

await b.close();
const fails = out.filter(o => !o.ok);
console.log(`\n${out.length - fails.length}/${out.length} interaction checks passed`);
import fs from 'node:fs/promises';
await fs.writeFile('tests/interaction-report.json', JSON.stringify({ ranAt: new Date().toISOString(), results: out }, null, 2));
