#!/usr/bin/env node
/** Side-by-side capture of the rebuild vs the live origin, with a coarse pixel delta. */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const LOCAL = process.env.BASE || 'http://127.0.0.1:8777';
const LIVE  = 'https://sofatoo.com';
const ROUTES = (process.env.CMP_ROUTES || '/').split(',');
const VPS = [{n:'desktop',w:1440,h:900},{n:'mobile',w:390,h:844}];
await fs.mkdir('tests/compare',{recursive:true});
const b = await chromium.launch();
const rows=[];
for (const vp of VPS) for (const route of ROUTES) {
  const slug = (route==='/'?'home':route.replace(/^\/|\/$/g,'').replace(/\//g,'-'))+'.'+vp.n;
  const shot = async (base, tag) => {
    const ctx = await b.newContext({viewport:{width:vp.w,height:vp.h},deviceScaleFactor:1});
    const p = await ctx.newPage();
    try { await p.goto(base+route,{waitUntil:'load',timeout:60000}); } catch {}
    await p.waitForTimeout(4000);
    // neutralise cookie/consent overlays that exist only on the live origin
    await p.evaluate(()=>document.querySelectorAll('[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],#onetrust-banner-sdk,.cmplz-cookiebanner').forEach(e=>e.remove())).catch(()=>{});
    await p.evaluate(()=>window.scrollTo(0,0));
    await p.waitForTimeout(800);
    const h = await p.evaluate(()=>document.body.scrollHeight);
    const f = `tests/compare/${slug}.${tag}.png`;
    await p.screenshot({path:f, clip:{x:0,y:0,width:vp.w,height:Math.min(h,4000)}});
    await ctx.close();
    return {file:f,height:h};
  };
  const L = await shot(LOCAL,'rebuild');
  const R = await shot(LIVE,'live');
  rows.push({route,viewport:vp.n,rebuildHeight:L.height,liveHeight:R.height,
             heightDeltaPct:+(100*Math.abs(L.height-R.height)/R.height).toFixed(1),
             files:[L.file,R.file]});
  console.log(`${route} @${vp.n}: rebuild ${L.height}px vs live ${R.height}px  (Δ ${rows.at(-1).heightDeltaPct}%)`);
}
await b.close();
await fs.writeFile('tests/compare/report.json',JSON.stringify(rows,null,2));
