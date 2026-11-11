#!/usr/bin/env node
/** Playwright verification: renders each route, records console/page errors, failed
 *  requests, HTTP>=400, and horizontal overflow at several widths. */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE   = process.env.BASE || 'http://127.0.0.1:8777';
const ROOT   = path.resolve(import.meta.dirname, '..');
const SHOTS  = process.env.SHOTS_DIR || path.join(ROOT, 'tests', 'screenshots');
const ROUTES = JSON.parse(await fs.readFile(path.join(ROOT, 'tools', 'routes.json'), 'utf8')).map(r => r.route);
const ONLY   = process.env.ONLY ? process.env.ONLY.split(',') : null;
const list   = ONLY || ROUTES;
const SHOT   = (process.env.SHOT_ROUTES || '/,/our-brand/,/shop/,/lookbook/,/contact/,/product-category/female/').split(',');

const VIEWPORTS = [
  { name: 'mobile',  width: 375,  height: 812 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'laptop',  width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
];

await fs.mkdir(SHOTS, { recursive: true });
const browser = await chromium.launch();
const results = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  for (const route of list) {
    const page = await ctx.newPage();
    const pageErrors = [], consoleErrors = [], requestFailed = [], httpErrors = [];
    page.on('pageerror', e => pageErrors.push(String(e.message || e).slice(0, 180)));
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 180)); });
    page.on('requestfailed', r => requestFailed.push(r.url().replace(BASE, '').slice(0, 150)));
    page.on('response', r => { if (r.status() >= 400) httpErrors.push(r.status() + ' ' + r.url().replace(BASE, '').slice(0, 150)); });

    const url = BASE + route;
    let nav = 'ok';
    try { await page.goto(url, { waitUntil: 'load', timeout: 45000 }); }
    catch (e) { nav = 'NAV_FAIL: ' + e.message.slice(0, 120); }
    await page.waitForTimeout(1200);

    const m = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      bodyH: document.body ? document.body.scrollHeight : 0,
      imgs: [...document.images].length,
      imgsBroken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length,
      title: document.title,
      videos: [...document.querySelectorAll('video')].length,
    }));

    if (SHOT.includes(route)) {
      const slug = route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '-');
      await page.screenshot({ path: path.join(SHOTS, `${slug}.${vp.name}.png`), fullPage: true });
    }

    results.push({ route, viewport: vp.name, nav, ...m,
      overflow: m.scrollW - m.clientW,
      pageErrors, consoleErrors,
      requestFailed: [...new Set(requestFailed)],
      httpErrors: [...new Set(httpErrors)] });
    await page.close();
  }
  await ctx.close();
}
await browser.close();

/* ---- report ---- */
const bad = results.filter(r => r.nav !== 'ok' || r.pageErrors.length || r.requestFailed.length || r.httpErrors.length || r.overflow > 1 || r.imgsBroken > 0);
const byVp = Object.fromEntries(VIEWPORTS.map(v => [v.name, results.filter(r => r.viewport === v.name).length]));
const summary = {
  checkedAt: new Date().toISOString(),
  routes: list.length, viewports: byVp, totalRenders: results.length,
  cleanRenders: results.length - bad.length,
  problems: bad.map(b => ({ route: b.route, viewport: b.viewport, nav: b.nav, overflow: b.overflow,
    imgsBroken: b.imgsBroken, pageErrors: b.pageErrors, httpErrors: b.httpErrors, requestFailed: b.requestFailed })),
  consoleErrorSamples: [...new Set(results.flatMap(r => r.consoleErrors))].slice(0, 15),
};
await fs.writeFile(path.join(ROOT, 'tests', 'verify-report.json'), JSON.stringify({ summary, results }, null, 2));
console.log(JSON.stringify(summary, null, 1));
