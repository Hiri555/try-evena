// Renders every styleframe page of a course to a 1920x1080 PNG, then builds a
// review board. Usage: node engine/render-styleframes.mjs [COURSE_DIR]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require('/opt/node22/lib/node_modules/playwright'));
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const course = process.argv[2] || 'COURSE_01_SWITCHING_VLAN';
const sfDir = path.join(root, course, '08-source', 'styleframes');
const outDir = path.join(root, course, '09-contact-sheets', 'styleframes');
fs.mkdirSync(outDir, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', (e) => console.error('pageerror:', e.message));

const pages = fs.readdirSync(sfDir).filter((f) => /^sf\d+.*\.html$/.test(f)).sort();
for (const f of pages) {
  await page.goto(`${base}/${course}/08-source/styleframes/${f}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 15000 });
  const out = path.join(outDir, f.replace(/\.html$/, '.png'));
  await page.locator('.stage').screenshot({ path: out });
  console.log('rendered', path.relative(root, out));
}

// Review board: all styleframes on one sheet.
const board = path.join(sfDir, 'board.html');
if (fs.existsSync(board)) {
  await page.setViewportSize({ width: 1920, height: 1200 });
  await page.goto(`${base}/${course}/08-source/styleframes/board.html`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 15000 });
  const out = path.join(outDir, 'styleframes-board.png');
  await page.locator('.board').screenshot({ path: out });
  console.log('rendered', path.relative(root, out));
}

await browser.close();
server.close();
