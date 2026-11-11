#!/usr/bin/env node
/** End-to-end check of the front-end shop demo: card -> bag -> cart -> checkout -> confirmation. */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const BASE = process.env.BASE || 'http://127.0.0.1:8777';
const out = []; const rec = (n, ok, d = '') => { out.push({ name: n, ok, detail: d }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  — ' + d : ''}`); };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 150)));

/* 1. add from a product card on the shop archive */
await p.goto(BASE + '/shop/', { waitUntil: 'load' }); await p.waitForTimeout(1500);
const quick = p.locator('.sfd-quick').first();
rec('quick-add buttons render on product cards', await p.locator('.sfd-quick').count() > 0, `${await p.locator('.sfd-quick').count()} buttons`);
await quick.click({ force: true }); await p.waitForTimeout(900);
rec('mini bag opens after add', await p.locator('.sfd-mini.is-open').count() === 1);
let n = await p.locator('.sf-cart-count').first().textContent();
rec('header bag count increments', n.trim() === '1', `count=${n.trim()}`);
const l1 = await p.locator('.sfd-mini .sfd-line').count();
rec('mini bag lists the line item', l1 === 1, `${l1} line(s)`);

/* 2. add a variable product from its detail page */
await p.goto(BASE + '/product/fary/', { waitUntil: 'load' }); await p.waitForTimeout(1600);
// the swatches plugin hides the native selects; click the real swatch controls
const groups = p.locator('form.cart .tawcvs-swatches[data-attribute_name]');
const ns = await groups.count();
for (let i = 0; i < ns; i++) await groups.nth(i).locator('.swatch[data-value]').first().click({ force: true });
await p.waitForTimeout(600);
await p.locator('form.cart button[type="submit"], form.cart .single_add_to_cart_button').first().click({ force: true });
await p.waitForTimeout(1000);
n = await p.locator('.sf-cart-count').first().textContent();
rec('variable product adds with its variant', n.trim() === '2', `count=${n.trim()}, ${ns} attribute select(s)`);
const vtext = await p.locator('.sfd-mini .sfd-line').last().textContent();
rec('variant and price captured on the line', /FCFA\s*[\d,]+/.test(vtext), vtext.replace(/\s+/g, ' ').trim().slice(0, 90));

/* 3. quantity controls */
await p.locator('[data-sfd-inc]').first().click(); await p.waitForTimeout(600);
n = await p.locator('.sf-cart-count').first().textContent();
rec('quantity + increases the bag', n.trim() === '3', `count=${n.trim()}`);

/* 4. cart page */
await p.goto(BASE + '/cart/', { waitUntil: 'load' }); await p.waitForTimeout(1300);
const cl = await p.locator('.sfd-page .sfd-line').count();
const sub = await p.locator('.sfd-row--total').first().textContent();
rec('cart page renders the real bag', cl === 2, `${cl} lines, total "${sub.replace(/\s+/g, ' ').trim()}"`);
rec('cart total is a real money figure', /FCFA\s*[\d,]{3,}/.test(sub), sub.replace(/\s+/g, ' ').trim());

/* 5. checkout */
await p.goto(BASE + '/checkout/', { waitUntil: 'load' }); await p.waitForTimeout(1300);
rec('checkout renders an order summary + form', await p.locator('#sfd-checkout').count() === 1);
await p.locator('#sfd-checkout').evaluate(f => { f.email.value='demo@example.com'; f.first.value='A'; f.last.value='B'; f.addr.value='1 Rue'; f.city.value='Dakar'; });
await p.locator('#sfd-checkout button[type="submit"]').click(); await p.waitForTimeout(1200);
const conf = await p.locator('.sfd-confirm').count();
const txt = conf ? await p.locator('.sfd-confirm').textContent() : '';
rec('placing the order shows a confirmation', conf === 1);
rec('confirmation states clearly that nothing was charged', /No payment was taken/i.test(txt));
n = await p.locator('.sf-cart-count').first().textContent();
rec('bag empties after the mock order', n.trim() === '0', `count=${n.trim()}`);

/* 6. persistence across reload */
await p.goto(BASE + '/shop/', { waitUntil: 'load' }); await p.waitForTimeout(1200);
await p.locator('.sfd-quick').first().click({ force: true }); await p.waitForTimeout(700);
await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1200);
n = await p.locator('.sf-cart-count').first().textContent();
rec('bag persists across a page reload', n.trim() === '1', `count=${n.trim()}`);

rec('no JavaScript errors during the whole journey', errs.length === 0, errs.slice(0, 3).join(' | '));
await p.screenshot({ path: 'tests/screenshots/cart-demo.shop.png', fullPage: false });
await p.goto(BASE + '/cart/'); await p.waitForTimeout(1200);
await p.screenshot({ path: 'tests/screenshots/cart-demo.cart.png', fullPage: false });
await b.close();
const f = out.filter(o => !o.ok).length;
console.log(`\n${out.length - f}/${out.length} cart checks passed`);
await fs.writeFile('tests/cart-e2e-report.json', JSON.stringify({ ranAt: new Date().toISOString(), results: out }, null, 2));
