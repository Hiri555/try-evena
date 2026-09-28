// Frame renderer: episode.html + renderFrame(t) → MP4 blocks rendered in
// parallel, one contact sheet per block (a frame every 2.5 s), then the blocks
// are concatenated into renders/video.mp4 (no audio yet).
// Usage:
//   node engine/render.mjs [COURSE] [--workers 4] [--block 15] [--only 3,4] [--stills 12.5,40]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(`--${k}`) ? args[args.indexOf(`--${k}`) + 1] : d);
const course = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--'))) || 'COURSE_01_SWITCHING_VLAN';
const dir = path.join(root, course);
const FF = path.join(root, 'node_modules/ffmpeg-static/ffmpeg');
const T = JSON.parse(fs.readFileSync(path.join(dir, '05-timeline.json'), 'utf8'));
const fps = T.fps;
const workers = +opt('workers', 4);
const blockLen = +opt('block', 15);
const only = opt('only', null)?.split(',').map(Number);
const stills = opt('stills', null)?.split(',').map(Number);
const renders = path.join(dir, 'renders');
const blocksDir = path.join(renders, 'blocks');
const sheetsDir = path.join(dir, '09-contact-sheets');
fs.mkdirSync(blocksDir, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/${course}/08-source/episode.html`;

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => { console.error('pageerror:', e.message); process.exitCode = 1; });
  await page.goto(url);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  return page;
}

if (stills) {
  // quick previews: PNG stills at given times
  const browser = await chromium.launch();
  const page = await openPage(browser);
  const outDir = path.join(renders, 'stills');
  fs.mkdirSync(outDir, { recursive: true });
  for (const t of stills) {
    await page.evaluate((x) => window.renderFrame(x), t);
    const f = path.join(outDir, `t${t.toFixed(2).padStart(7, '0')}.png`);
    await page.screenshot({ path: f });
    console.log('still', path.relative(root, f));
  }
  await browser.close();
  server.close();
  process.exit();
}

const nFrames = Math.ceil(T.duration * fps);
const perBlock = blockLen * fps;
const blocks = [];
for (let b = 0; b * perBlock < nFrames; b++) blocks.push({ b, f0: b * perBlock, f1: Math.min(nFrames, (b + 1) * perBlock) });
const queue = blocks.filter((x) => !only || only.includes(x.b));

async function renderBlock(page, { b, f0, f1 }) {
  const out = path.join(blocksDir, `block-${String(b).padStart(3, '0')}.mp4`);
  const ff = spawn(FF, ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = f0; f < f1; f++) {
    await page.evaluate((x) => window.renderFrame(x), f / fps);
    const jpg = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  // contact sheet: one frame every 2.5 s
  const sheet = path.join(sheetsDir, `contact-sheet-block-${String(b + 1).padStart(2, '0')}.jpg`);
  execFileSync(FF, ['-y', '-v', 'error', '-i', out, '-vf', 'fps=1/2.5,scale=640:-2,tile=3x2:padding=8:margin=8:color=0x05080F', '-frames:v', '1', '-q:v', '3', sheet]);
  return out;
}

const t0 = Date.now();
await Promise.all(Array.from({ length: Math.min(workers, queue.length) }, async () => {
  const browser = await chromium.launch();
  const page = await openPage(browser);
  while (queue.length) {
    const blk = queue.shift();
    const s = Date.now();
    await renderBlock(page, blk);
    console.log(`block ${blk.b + 1}/${blocks.length} [${(blk.f0 / fps).toFixed(1)}–${(blk.f1 / fps).toFixed(1)} s] ${((Date.now() - s) / 1000).toFixed(0)} s`);
  }
  await browser.close();
}));
server.close();

// concat every block that exists
const list = blocks.map((x) => path.join(blocksDir, `block-${String(x.b).padStart(3, '0')}.mp4`));
if (list.every((f) => fs.existsSync(f))) {
  fs.writeFileSync(path.join(blocksDir, 'list.txt'), list.map((f) => `file '${f}'`).join('\n'));
  execFileSync(FF, ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(blocksDir, 'list.txt'), '-c', 'copy', path.join(renders, 'video.mp4')]);
  console.log('video.mp4 ready');
}
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
