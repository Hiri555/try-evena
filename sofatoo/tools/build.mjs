#!/usr/bin/env node
/**
 * So' Fatoo faithful static rebuild.
 *
 * Sources, in priority order:
 *   1. The saveweb2zip archive (authoritative for the homepage and every asset it holds).
 *   2. The live origin https://sofatoo.com (for pages the archive did not capture).
 *
 * Emits a dependency-free static site into site/.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';

const ROOT      = path.resolve(import.meta.dirname, '..');
const OUT       = path.join(ROOT, 'site');
const ARCHIVE   = process.env.ARCHIVE_DIR || '';
const ORIGIN    = 'https://sofatoo.com';
const UA        = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const ROUTES = JSON.parse(await fs.readFile(path.join(ROOT, 'tools', 'routes.json'), 'utf8'));

const log = (...a) => console.log(...a);
const assetQueue = new Map();   // localPath -> {url, query}
const stats = { pages: 0, pageFail: [], fromArchive: 0, fromLive: 0, assetFail: [] };

/* ---------- helpers ---------- */

const KNOWN_ROUTES = new Set(ROUTES.map(r => r.route));

// "/about-us/" -> "about-us/index.html"
const routeToFile = r => (r === '/' ? 'index.html' : r.replace(/^\/|\/$/g, '') + '/index.html');
// depth-aware "../" prefix so the site works from any subdirectory
const prefixFor = r => {
  const d = r === '/' ? 0 : r.replace(/^\/|\/$/g, '').split('/').length;
  return d === 0 ? '' : '../'.repeat(d);
};

/** Turn an origin asset URL into a clean local path, remembering its ?ver= for archive lookup. */
function assetLocalPath(rawUrl) {
  let u;
  try { u = new URL(rawUrl, ORIGIN); } catch { return null; }
  if (u.hostname !== 'sofatoo.com') return null;
  let p = decodeURIComponent(u.pathname).replace(/^\/+/, '');
  if (p.startsWith('assets/fonts/')) return null;   // our own self-hosted font bundle
  if (!p || p.endsWith('/')) return null;
  if (!/\.[a-z0-9]{2,5}$/i.test(p)) return null;

  // saveweb2zip folds "?ver=1.2" into the basename ("main_ver=1.2.css"). Strip it so the
  // archive-sourced homepage and the live-sourced pages agree on one clean filename, and
  // so no literal "=" ends up in a hosted path.
  let verQuery = u.search.replace(/^\?/, '');
  const scraped = p.match(/^(.*?)_((?:ver|v)=[^/]*?)(\.[a-z0-9]{2,5})$/i);
  if (scraped) { p = scraped[1] + scraped[3]; verQuery = verQuery || scraped[2]; }

  if (!assetQueue.has(p)) assetQueue.set(p, { url: u.origin + u.pathname, query: verQuery, scraped: !!scraped });
  return p;
}

/** Archive candidate paths for a clean local path (saveweb2zip folds ?ver= into the basename). */
function archiveCandidates(localPath, query) {
  if (!ARCHIVE) return [];
  const base = path.join(ARCHIVE, 'sofatoo.com', localPath);
  const ext = path.extname(base);
  const stem = base.slice(0, -ext.length);
  const out = [];
  if (query) out.push(`${stem}_${query}${ext}`);          // main_ver=0.6.14.css
  out.push(base);                                          // main.css
  return out;
}

async function fetchBuf(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Referer': ORIGIN + '/' }, redirect: 'follow' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return Buffer.from(await r.arrayBuffer());
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise(s => setTimeout(s, 400 * 2 ** i));
    }
  }
}

/* ---------- HTML rewriting ---------- */

/** Resolve a single URL found in HTML to its local replacement, or null to leave as-is. */
function rewriteUrl(raw, route) {
  if (!raw) return null;
  const v = raw.trim();
  if (/^(data:|blob:|mailto:|tel:|javascript:|#)/i.test(v)) return null;

  let u;
  try { u = new URL(v, ORIGIN + route); } catch { return null; }
  if (u.hostname !== 'sofatoo.com') return null;           // keep genuine externals external

  const pre = prefixFor(route);
  const pathname = decodeURIComponent(u.pathname);

  // asset?
  if (/\.(css|js|jpe?g|png|gif|svg|webp|avif|mp4|m4v|mov|webm|ogv|mp3|wav|woff2?|ttf|eot|otf|ico|json|pdf)$/i.test(pathname)) {
    const lp = assetLocalPath(u.href);
    return lp ? pre + lp : null;
  }

  // internal page link
  const norm = pathname.endsWith('/') ? pathname : pathname + '/';
  if (KNOWN_ROUTES.has(norm)) {
    const target = norm === '/' ? '' : norm.replace(/^\/|\/$/g, '') + '/';
    return (pre + target || './') + (u.hash || '');
  }
  // a real page on the origin that we did not mirror -> leave absolute, honestly pointing at origin
  return null;
}

const ATTRS = ['href', 'src', 'poster', 'data-src', 'data-bg', 'content', 'data-large_image', 'data-thumb'];

function rewriteHtml(html, route) {
  let out = html;

  // --- strip scraper + origin-only cruft -------------------------------------
  out = out
    // saveweb2zip relative prefix -> origin-absolute, so one code path handles everything
    .replace(/(?:\.\.\/)+sofatoo\.com\//g, ORIGIN + '/')
    // WP discovery / API plumbing that is meaningless in a static mirror
    .replace(/<link[^>]+rel=["'](?:alternate|EditURI|wlwmanifest|pingback|https:\/\/api\.w\.org\/)["'][^>]*>\s*/gi, '')
    .replace(/<link[^>]+(?:api\.w\.org|wp-json|xmlrpc\.php|oembed)[^>]*>\s*/gi, '')
    .replace(/<meta[^>]+name=["']generator["'][^>]*>\s*/gi, '')
    // third-party tracking (Google Tag Manager / gtag / Bing UET / Facebook pixel)
    .replace(/<script[^>]*>[\s\S]{0,4000}?(?:googletagmanager|gtag\(|dataLayer\.push|fbq\(|bat\.bing\.com|UET\()[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript>\s*<iframe[^>]*(?:googletagmanager|facebook\.com\/tr)[^>]*><\/iframe>\s*<\/noscript>/gi, '')
    .replace(/<script[^>]+src=["'][^"']*(?:googletagmanager|google-analytics|gtag\/js|connect\.facebook\.net)[^"']*["'][^>]*><\/script>/gi, '')
    // WP emoji detection script (pure origin-side polyfill, pulls s.w.org at runtime)
    .replace(/<script[^>]*id=["']wp-emoji[^>]*>[\s\S]*?<\/script>/gi, '')
    // the companion auto-generated module does `querySelector('script#wp-emoji-settings')`
    // and throws "Element missing" once the settings script above is gone
    .replace(/<script\b[^>]*>(?:(?!<\/script>)[\s\S])*?(?:wp-emoji-settings|_wpemojiSettings)(?:(?!<\/script>)[\s\S])*?<\/script>/gi, '')
    .replace(/<script[^>]+src=["'][^"']*wp-emoji-release[^"']*["'][^>]*><\/script>/gi, '')
    // ephemeral WordPress REST nonces: scoped to origin sessions, useless + not ours to republish
    .replace(/("(?:_?wp_?)?(?:rest_)?nonce[A-Za-z_]*"\s*:\s*")[A-Za-z0-9]{6,}(")/gi, '$1$2')
    .replace(/([?&]_wpnonce=)[A-Za-z0-9]+/gi, '$1');

  // --- self-hosted Google Fonts ----------------------------------------------
  const pre = prefixFor(route);
  out = out.replace(/<link([^>]*?)href=["']https:\/\/fonts\.googleapis\.com\/[^"']*["']([^>]*)>/gi,
    `<link$1href="${pre}assets/fonts/fonts.css"$2>`);
  out = out.replace(/<link[^>]+href=["']https:\/\/fonts\.gstatic\.com[^"']*["'][^>]*>\s*/gi, '');
  out = out.replace(/<link[^>]+rel=["']dns-prefetch["'][^>]*fonts\.googleapis\.com[^>]*>\s*/gi, '');

  // --- rewrite every URL-bearing attribute -----------------------------------
  const attrRe = new RegExp(`\\s(${ATTRS.join('|')})\\s*=\\s*("|')(.*?)\\2`, 'gis');
  out = out.replace(attrRe, (m, attr, q, val) => {
    if (attr === 'content' && !/^https?:\/\/sofatoo\.com/i.test(val.trim())) return m;
    const r = rewriteUrl(val, route);
    return r === null ? m : ` ${attr}=${q}${r}${q}`;
  });

  // srcset / data-srcset (comma-separated candidate lists)
  out = out.replace(/\s(srcset|data-srcset|imagesrcset)\s*=\s*("|')(.*?)\2/gis, (m, attr, q, val) => {
    const parts = val.split(',').map(s => {
      const t = s.trim(); if (!t) return null;
      const sp = t.split(/\s+/);
      const r = rewriteUrl(sp[0], route);
      return [(r === null ? sp[0] : r), ...sp.slice(1)].join(' ');
    }).filter(Boolean);
    return ` ${attr}=${q}${parts.join(', ')}${q}`;
  });

  // url(...) inside inline <style> and style="" attributes
  out = out.replace(/url\((\s*["']?)([^)"']+)\1\s*\)/gi, (m, q, val) => {
    const r = rewriteUrl(val, route);
    return r === null ? m : `url(${q}${r}${q})`;
  });

  // remaining bare origin references inside inline scripts/JSON (e.g. product URLs in JS config)
  out = out.replace(/https:\\?\/\\?\/sofatoo\.com\\?\/([A-Za-z0-9._~\-\/%]*)/g, (m) => {
    const clean = m.replace(/\\\//g, '/');
    const r = rewriteUrl(clean, route);
    return r === null ? m : (m.includes('\\/') ? r.replace(/\//g, '\\/') : r);
  });

  return out;
}

/* ---------- CSS rewriting ---------- */
function rewriteCss(css, localPath) {
  const depth = localPath.split('/').length - 1;
  const up = '../'.repeat(depth);
  return css.replace(/url\((\s*["']?)([^)"']+)\1\s*\)/gi, (m, q, val) => {
    const v = val.trim();
    if (/^(data:|#)/i.test(v)) return m;
    let u; try { u = new URL(v, ORIGIN + '/' + localPath); } catch { return m; }
    if (u.hostname !== 'sofatoo.com') return m;
    const lp = assetLocalPath(u.href);
    return lp ? `url(${q}${up}${lp}${q})` : m;
  });
}

/* ---------- 1. pages ---------- */
log(`\n=== Pages (${ROUTES.length}) ===`);
const archiveHome = process.env.ARCHIVE_HOME;

async function buildPage({ route, source }) {
  let html;
  if (source === 'archive' && archiveHome && existsSync(archiveHome)) {
    html = await fs.readFile(archiveHome, 'utf8');
    stats.fromArchive++;
  } else {
    html = (await fetchBuf(ORIGIN + route)).toString('utf8');
    stats.fromLive++;
  }
  const outFile = path.join(OUT, routeToFile(route));
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, rewriteHtml(html, route));
  stats.pages++;
  return route;
}

const POOL = 8;
const queue = [...ROUTES];
await Promise.all(Array.from({ length: POOL }, async () => {
  while (queue.length) {
    const r = queue.shift();
    try { await buildPage(r); log('  page  ' + r); }
    catch (e) { stats.pageFail.push(r.route + ' :: ' + e.message); log('  FAIL  ' + r.route + ' ' + e.message); }
  }
}));

/* ---------- 2. assets (transitively, since CSS references more) ---------- */
log(`\n=== Assets ===`);
const done = new Set();
let round = 0;
while (true) {
  const pending = [...assetQueue.keys()].filter(k => !done.has(k));
  if (!pending.length || ++round > 6) break;
  log(`  round ${round}: ${pending.length} file(s)`);
  const q = [...pending];
  await Promise.all(Array.from({ length: 10 }, async () => {
    while (q.length) {
      const lp = q.shift();
      done.add(lp);
      const { url, query } = assetQueue.get(lp);
      const dest = path.join(OUT, lp);
      try {
        await fs.mkdir(path.dirname(dest), { recursive: true });
        let buf = null, src = 'live';
        for (const cand of archiveCandidates(lp, query)) {
          if (existsSync(cand)) { buf = await fs.readFile(cand); src = 'archive'; break; }
        }
        if (!buf) {
          const q = assetQueue.get(lp);
          // the scraped spelling only exists inside the archive; ask the origin for the clean name
          const liveUrl = q.scraped ? (ORIGIN + '/' + lp) : url;
          buf = await fetchBuf(liveUrl);
        }
        if (/\.css$/i.test(lp)) buf = Buffer.from(rewriteCss(buf.toString('utf8'), lp));
        await fs.writeFile(dest, buf);
        if (src === 'archive') stats.fromArchive++;
      } catch (e) {
        stats.assetFail.push(lp + ' :: ' + e.message);
      }
    }
  }));
}

await fs.writeFile(path.join(ROOT, 'tools', 'build-report.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  pages: stats.pages, pageFailures: stats.pageFail,
  assets: done.size, assetFailures: stats.assetFail,
}, null, 2));

log(`\n=== Done ===`);
log(`pages: ${stats.pages}/${ROUTES.length}  assets: ${done.size}`);
if (stats.pageFail.length) log('page failures:\n  ' + stats.pageFail.join('\n  '));
if (stats.assetFail.length) log(`asset failures (${stats.assetFail.length}):\n  ` + stats.assetFail.slice(0, 20).join('\n  '));
