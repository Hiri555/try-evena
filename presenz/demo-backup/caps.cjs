const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const caps = JSON.parse(process.argv[2]);
const F = require('fs').readFileSync('/home/user/try-evena/courses/engine/fonts/Inter-700.ttf').toString('base64');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const [i, t] of caps.entries()) {
    await p.setContent(`<html><head><style>@font-face{font-family:I;src:url(data:font/ttf;base64,${F})}body{margin:0;background:transparent;width:1920px;height:1080px;display:flex;align-items:flex-end;justify-content:center;font-family:I}div{margin-bottom:64px;background:#1b4332f0;color:#fff;font-size:44px;padding:18px 38px;border-radius:18px;box-shadow:0 10px 30px #0003}</style></head><body><div>${t}</div></body></html>`);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150); await p.screenshot({ path: `cap${i}.png`, omitBackground: true });
  }
  await b.close(); })();
