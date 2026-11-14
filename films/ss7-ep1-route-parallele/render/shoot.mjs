import pw from '/opt/node-tools/node_modules/playwright/index.js';
const { chromium } = pw;
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.env.ROOT || process.cwd();
const OUT  = path.join(ROOT, 'frames4');
const PORT = process.env.PORT || 8777;

const from = parseInt(process.env.FROM || '0', 10);
const to   = process.env.TO ? parseInt(process.env.TO, 10) : null;   // exclusive
const probe = process.env.PROBE || '';                                // comma list of frames -> probe/*.jpg

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(ROOT, 'probe4'), { recursive: true });

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-lcd-text', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGEERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });

// pas de serveur : Playwright sert les fichiers directement depuis le disque
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
               '.woff2':'font/woff2', '.png':'image/png', '.jpg':'image/jpeg',
               '.json':'application/json' };
await page.route('**/*', route => {
  const u = new URL(route.request().url());
  const f = path.join(ROOT, decodeURIComponent(u.pathname));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) return route.fulfill({ status: 404, body: '' });
  const ext = path.extname(f).toLowerCase();
  route.fulfill({ status: 200, contentType: MIME[ext] || 'application/octet-stream',
                  body: fs.readFileSync(f) });
});
await page.goto('http://rendu.local/render4/index.html', { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', null, { timeout: 60000 });

const blCounts = JSON.parse(process.env.BLCOUNTS || '{}');
await page.evaluate(m => window.setBlCounts(m), blCounts);
const total = await page.evaluate(() => window.totalFrames());
console.log('total frames', total);

if (probe) {
  for (const f of probe.split(',').map(Number)) {
    await page.evaluate(n => window.renderFrame(n), f);
    const d = await page.evaluate(() => window.grab(0.92));
    fs.writeFileSync(path.join(ROOT, 'probe4', `f${f}.jpg`), Buffer.from(d.split(',')[1], 'base64'));
    console.log('probe4', f);
  }
  await browser.close();
  process.exit(0);
}

const end = to === null ? total : Math.min(to, total);
const t0 = Date.now();
for (let f = from; f < end; f++) {
  await page.evaluate(n => window.renderFrame(n), f);
  const d = await page.evaluate(() => window.grab(0.94));
  fs.writeFileSync(path.join(OUT, String(f).padStart(5, '0') + '.jpg'), Buffer.from(d.split(',')[1], 'base64'));
  if ((f - from) % 150 === 0) {
    const el = (Date.now() - t0) / 1000;
    const done = f - from + 1, rate = done / Math.max(el, .001);
    console.log(`${f}/${end}  ${rate.toFixed(1)} fps  eta ${((end - f) / Math.max(rate, .01) / 60).toFixed(1)} min`);
  }
}
console.log('done', from, '->', end, ((Date.now() - t0) / 1000).toFixed(0) + 's');
await browser.close();
