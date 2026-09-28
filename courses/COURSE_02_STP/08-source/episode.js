// COURSE_02 · Épisode 2 — « La petite boucle qui peut détruire un LAN »
// Every shot is a pure function of t. Beats come from 05-timeline.json via E(scene, anchor).
import * as K from '/engine/components.js';
import { P, vis, mix, mixPt, blink, along, camera, ease, clamp } from '/engine/runtime.js';

const { C } = K;
const YEL = C.broadcast, GOLD = '#F5B83D', VIO = C.control;
const AI = '/COURSE_02_STP/06-assets/ai';
const chapter = (label, o = 1) => K.g(K.text(60, 58, label, { size: 17, weight: 700, font: C.mono, fill: C.muted, anchor: 'start', ls: 3 }), { opacity: o });
const cap = (x, y, s, { size = 30, color = C.text, o = 1, weight = 800, anchor = 'middle' } = {}) => K.g(K.text(x, y, s, { size, weight, fill: color, anchor }), { opacity: o });
const lerpLine = (a, b, k) => mixPt(a, b, k);

// ============================================================ TRIANGLE
// SW1 top (root), SW2 bottom-left, SW3 bottom-right. L12 slow (19), L13/L23 1 Gb/s (4).
function tri(st = {}) {
  const led = st.leds || {};
  const sw1 = K.switchDevice({ x: 835, y: 200, w: 250, h: 150, label: 'SW1', highlight: st.root ? GOLD : undefined, ports: { bottom: [{ name: 'Fa0/1', led: led.s1a, showName: st.names }, { name: 'Gi0/2', led: led.s1b, showName: st.names }] } });
  const sw2 = K.switchDevice({ x: 380, y: 640, w: 250, h: 150, label: 'SW2', sub: st.sub2, ports: { top: [{ name: 'Fa0/1', led: led.s2a, showName: st.names }], right: [{ name: 'Gi0/2', led: led.s2b, showName: st.names }], left: [{ name: 'h1', led: led.h, showName: false }, { name: 'h2', led: led.h, showName: false }] } });
  const sw3 = K.switchDevice({ x: 1290, y: 640, w: 250, h: 150, label: 'SW3', sub: st.sub3, ports: { top: [{ name: 'Gi0/1', led: led.s3a, showName: st.names }], left: [{ name: 'Gi0/2', led: led.s3b, showName: st.names }], right: [{ name: 'h1', led: led.h, showName: false }, { name: 'h2', led: led.h, showName: false }] } });
  const pcs = [
    K.pc({ x: 170, y: 560, label: 'PC-A', mac: st.macs ? 'AA:AA' : undefined, side: 'right', scale: 0.85, state: (st.pc || {})[0] }),
    K.pc({ x: 170, y: 830, label: 'PC-B', side: 'right', scale: 0.85, state: (st.pc || {})[1] }),
    K.pc({ x: 1750, y: 560, label: 'PC-C', side: 'left', scale: 0.85, state: (st.pc || {})[2] }),
    K.pc({ x: 1750, y: 830, label: 'PC-D', side: 'left', scale: 0.85, state: (st.pc || {})[3] }),
  ];
  const L = {
    l12: [sw1.port('Fa0/1'), sw2.port('Fa0/1')],
    l13: [sw1.port('Gi0/2'), sw3.port('Gi0/1')],
    l23: [sw2.port('Gi0/2'), sw3.port('Gi0/2')],
    hA: [pcs[0].anchor, sw2.port('h1')], hB: [pcs[1].anchor, sw2.port('h2')],
    hC: [sw3.port('h1'), pcs[2].anchor], hD: [sw3.port('h2'), pcs[3].anchor],
  };
  const cab = st.cables || {};
  let out = '';
  const draw = (k, def) => {
    const o = { ...def, ...(cab[k] || {}) };
    if (o.hidden) return;
    const [a, b] = L[k];
    if (o.dashed) out += `<path d="M${a.x} ${a.y} L${b.x} ${b.y}" stroke="${o.color}" stroke-width="${o.width}" stroke-dasharray="14 12" opacity="${o.opacity ?? 0.8}"/>`;
    else if (o.broken) {
      const m = lerpLine(a, b, 0.5), g = o.broken * 26;
      const dir = { x: (b.x - a.x), y: (b.y - a.y) }, n = Math.hypot(dir.x, dir.y);
      const u = { x: dir.x / n, y: dir.y / n };
      out += K.cable(a, { x: m.x - u.x * g, y: m.y - u.y * g }, { color: C.error, width: o.width, glow: true });
      out += K.cable({ x: m.x + u.x * g, y: m.y + u.y * g }, b, { color: C.error, width: o.width, glow: true });
    } else out += K.cable(a, b, o);
  };
  if (st.hosts !== false) ['hA', 'hB', 'hC', 'hD'].forEach((k) => draw(k, { color: C.deviceEdge, width: 4 }));
  ['l12', 'l13', 'l23'].forEach((k) => draw(k, { color: '#3A4D70', width: 6 }));
  out += sw1.svg + sw2.svg + sw3.svg;
  if (st.hosts !== false) out += pcs.map((p) => p.svg).join('');
  return { svg: out, sw1, sw2, sw3, pcs, L };
}
const TG = tri();
const L = TG.L;
const C1 = { x: 960, y: 275 }, C2 = { x: 505, y: 715 }, C3 = { x: 1415, y: 715 };
const mid = (k, dx = 0, dy = 0) => ({ x: (L[k][0].x + L[k][1].x) / 2 + dx, y: (L[k][0].y + L[k][1].y) / 2 + dy });
const costPill = (k, text, color, o = 1, dx = 0, dy = 0) => K.g(K.pill(mid(k, dx, dy).x, mid(k, dx, dy).y, text, { color, size: 18, mono: false }), { opacity: o });
const COSTPOS = { l12: [-150, -60], l13: [150, -60], l23: [0, -40] };
const costLabels = (o, hi = {}) => costPill('l12', '100 Mb/s · coût 19', hi.l12 || C.muted, o, ...COSTPOS.l12) + costPill('l13', '1 Gb/s · coût 4', hi.l13 || C.decision, o, ...COSTPOS.l13) + costPill('l23', '1 Gb/s · coût 4', hi.l23 || C.decision, o, ...COSTPOS.l23);
const crownAt = (x, y, w, o = 1, id = 'cr') => (o <= 0 ? '' : `<defs><radialGradient id="${id}f" cx="0.5" cy="0.5" r="0.5"><stop offset="0.45" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="${id}m"><rect x="${x - w / 2}" y="${y - w / 3}" width="${w}" height="${(w * 2) / 3}" fill="url(#${id}f)"/></mask></defs>
  <g opacity="${o}"><image href="${AI}/crown.jpg" x="${x - w / 2}" y="${y - w / 3}" width="${w}" height="${(w * 2) / 3}" preserveAspectRatio="xMidYMid slice" mask="url(#${id}m)"/></g>`);
const ROLE_POS = {
  s1a: [TG.sw1.port('Fa0/1'), { dx: -70, dy: 20 }], s1b: [TG.sw1.port('Gi0/2'), { dx: 70, dy: 20 }],
  s3a: [TG.sw3.port('Gi0/1'), { dx: 70, dy: -20 }], s3b: [TG.sw3.port('Gi0/2'), { dx: -10, dy: 62 }],
  s2b: [TG.sw2.port('Gi0/2'), { dx: 10, dy: 62 }], s2a: [TG.sw2.port('Fa0/1'), { dx: -80, dy: -20 }],
};
const badge = (key, role, o = 1) => (o <= 0 ? '' : K.roleBadge(ROLE_POS[key][0], role, { ...ROLE_POS[key][1], opacity: o, s: role === 'ALT' ? 1.1 : 1 }));
const frameOn = (k, u, color = YEL, s = 0.5, rev = false) => { const [a, b] = L[k]; const p = rev ? lerpLine(b, a, u) : lerpLine(a, b, u); return K.frame({ x: p.x, y: p.y, s, compact: true, color }).svg; };
const LOOP = [C2, C1, C3, C2];

// ============================================================ S01 HOOK
function shotHook(t, { E, S }) {
  const tTr = E('S01.1', 'trame'), tBc = E('S01.1', 'broadcast'), tDev = E('S01.2', 'devient'), tCa = E('S01.3', 'ça'), tTTL = E('S01.3', 'TTL'), tTj = E('S01.3', 'toujours');
  const end = S('S02.1').start;
  const storm = clamp((t - tDev) / Math.max(1, tCa - tDev));
  const frozen = t >= tCa;
  const u = frozen ? 1 : storm;
  const yl = u > 0;
  const base = tri({ hosts: true, leds: yl ? { s1a: 'yellow', s1b: 'yellow', s2a: 'yellow', s2b: 'yellow', s3a: 'yellow', s3b: 'yellow', h: 'yellow' } : {},
    pc: yl && u > 0.15 ? { 0: 'bcast', 1: 'bcast', 2: 'bcast', 3: 'bcast' } : {},
    cables: yl ? { l12: { color: YEL, width: 7, glow: true }, l13: { color: YEL, width: 7, glow: true }, l23: { color: YEL, width: 7, glow: true }, hA: { color: YEL }, hB: { color: YEL }, hC: { color: YEL }, hD: { color: YEL } } : {} });
  let out = '';
  out += `<defs><radialGradient id="alarm" cx="0.5" cy="0.55" r="0.75"><stop offset="0.35" stop-color="#F43F5E" stop-opacity="0"/><stop offset="1" stop-color="#F43F5E" stop-opacity="0.6"/></radialGradient></defs>`;
  out += K.g(`<image href="${AI}/storm.jpg" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice"/>`, { opacity: 0.22 * u });
  out += base.svg;
  // the first frame: PC-A → SW2
  if (!yl) {
    const k = P(t, tTr, Math.max(0.5, tBc - tTr), ease.inOut);
    const p = lerpLine(L.hA[0], L.hA[1], k);
    out += K.frame({ x: p.x, y: p.y, s: 0.6, compact: true, color: YEL, opacity: P(t, tTr - 0.2, 0.3) });
    out += K.ring(L.hA[0].x, L.hA[0].y, 30 + 30 * P(t, tTr, 0.6), YEL, 1 - P(t, tTr, 0.6));
  }
  // the storm: two orbiting copies + a swarm that grows as simulated time accelerates
  if (yl) {
    const warp = frozen ? (tCa - tDev) : (t - tDev);
    const speed = 0.35 + warp * warp * 0.25;
    const tt = frozen ? (tCa - tDev) * 1.2 : warp * speed;
    [0, 0.5].forEach((ph) => { out += K.frame({ ...along(LOOP, (tt * 0.4 + ph) % 1), s: 0.55, compact: true, color: YEL }); out += K.frame({ ...along(LOOP, 1 - ((tt * 0.4 + ph) % 1)), s: 0.55, compact: true, color: YEL }); });
    const n = Math.round(260 * u ** 1.4);
    out += K.swarm([C1, C2, C3], n, { t: tt, spread: 70, seed: 3 });
    out += K.swarm([L.hA[0], C2, L.hB[0]], Math.round(40 * u), { t: tt * 1.3, spread: 40, seed: 11, sizeMax: 0.32 });
    out += K.swarm([L.hC[1], C3, L.hD[1]], Math.round(40 * u), { t: tt * 1.1, spread: 40, seed: 17, sizeMax: 0.32 });
    [[960, 314, 'SW1'], [505, 754, 'SW2'], [1415, 754, 'SW3']].forEach(([x, y, l]) => { out += K.g(K.pill(x, y, l, { color: '#FFFFFF', bg: '#0B1222', size: 30 }), { opacity: clamp(u * 3) }); });
    out += `<rect width="1920" height="1080" fill="url(#alarm)" opacity="${u}"/>`;
  }
  // counter + gauges
  const val = yl ? Math.round(1 + 48212 * u ** 3.2) : (t > tBc ? 1 : 0);
  const cnt = vis(t, tBc - 0.2, end - 0.4);
  if (cnt > 0) {
    out += K.g(`<g filter="url(#shadow)"><rect x="1430" y="46" width="440" height="176" rx="20" fill="#0C0A12" fill-opacity="0.9" stroke="${yl ? C.error : C.deviceEdge}" stroke-width="2"/></g>
      ${K.text(1650, 146, val.toLocaleString('fr-FR'), { size: 92, weight: 800, font: C.mono, fill: YEL })}
      ${K.text(1650, 190, val > 1 ? 'COPIES TRANSMISES' : 'COPIE', { size: 18, weight: 800, fill: C.muted, ls: 4 })}
      ${yl ? K.pill(1650, 46, `⏱ temps ×${Math.round(1 + 999 * u ** 2)}`, { color: C.error, size: 16, filled: true }) : ''}`, { opacity: cnt });
  }
  if (yl) out += K.g(`<g filter="url(#shadow)"><rect x="50" y="46" width="470" height="150" rx="20" fill="#0C0A12" fill-opacity="0.9" stroke="${C.error}" stroke-width="2"/></g>${K.gauge(76, 96, 'LIENS', Math.round(8 + 92 * u))}${K.gauge(76, 162, 'CPU SWITCHES', Math.round(5 + 95 * u ** 1.5))}`, { opacity: clamp(u * 4) * (1 - P(t, tTTL - 0.3, 0.3)) });
  // TTL comparison card
  const ttl = vis(t, tTTL, end - 0.3, 0.35);
  if (ttl > 0) {
    let c = `<rect width="1920" height="1080" fill="#05070D" opacity="${0.72}"/>`;
    const card = (x, title, fields, ok) => {
      let s = `<g filter="url(#shadow)"><rect x="${x}" y="330" width="760" height="360" rx="24" fill="#0C1427" stroke="${ok ? C.forward : C.error}" stroke-width="3"/></g>${K.text(x + 380, 395, title, { size: 34, weight: 800, fill: ok ? C.forward : C.error })}`;
      let fx = x + 40;
      fields.forEach(([k, w, hi]) => {
        s += `<rect x="${fx}" y="450" width="${w}" height="110" rx="12" fill="${hi ? (ok ? C.forward : C.error) : '#13203A'}" fill-opacity="${hi ? 0.25 : 1}" stroke="${hi ? (ok ? C.forward : C.error) : '#3A4D70'}" stroke-width="${hi ? 3 : 2}" ${hi && !ok ? 'stroke-dasharray="10 8"' : ''}/>`;
        s += K.text(fx + w / 2, 515, k, { size: 22, weight: 800, fill: hi ? '#fff' : C.muted, font: C.mono });
        fx += w + 12;
      });
      s += K.text(x + 380, 640, ok ? 'TTL − 1 à chaque routeur → meurt à 0' : 'aucun champ TTL → ne meurt jamais', { size: 24, weight: 700, fill: ok ? C.forward : C.error });
      return s;
    };
    c += card(170, 'PAQUET IP', [['SRC IP', 150], ['DST IP', 150], ['TTL', 150, true], ['DATA', 180]], true);
    c += card(990, 'TRAME ETHERNET', [['DST', 130], ['SRC', 130], ['TYPE', 130], ['TTL ?', 140, true], ['DATA', 100]], false);
    c += K.g(K.cross(1526, 505, C.error, 60), { opacity: P(t, tTTL + 0.5, 0.3) });
    out += K.g(c, { opacity: ttl, s: mix(0.94, 1, ttl), ox: 960, oy: 540 });
  }
  const push = P(t, tDev, Math.max(1, tCa - tDev), ease.in);
  return camera({ x: 960, y: 520, s: 1 + 0.08 * push }, out);
}

// ============================================================ S02 MECHANICS
function shotMech(t, { E, S, Wd }) {
  const s0 = S('S02.1').start, tInon = E('S02.1', "l'inonde"), s22 = S('S02.2').start, tRev = E('S02.2', 'reviennent');
  const s23 = S('S02.3').start, tMic = E('S02.3', 'microsecondes'), tArp = E('S02.3', 'ARP'), tSat = E('S02.3', 'saturent'), tCpu = E('S02.3', 'processeurs');
  const s24 = S('S02.4').start, tTab = E('S02.4', 'table'), tTan = E('S02.4', 'tantôt'), tRe = E('S02.4', 'réécrit'), tSym = E('S02.4', 'symptômes'), tBou = E('S02.4', 'boucle');
  const end = S('S03.1').start;
  const orbit = t >= tRev;
  const yl = t >= tInon;
  const cabY = { color: YEL, width: 6, glow: true };
  const hostFlash = (i) => (orbit && (Math.floor((t - tRev) / 0.6) + i) % 2 === 0 ? { color: YEL } : {});
  const base = tri({ macs: true, cables: yl ? { l12: cabY, l13: cabY, l23: cabY, hA: hostFlash(0), hB: hostFlash(1), hC: hostFlash(0), hD: hostFlash(1) } : { hA: { color: YEL } }, leds: yl ? { s1a: 'yellow', s1b: 'yellow', s2a: 'yellow', s2b: 'yellow', s3a: 'yellow', s3b: 'yellow' } : {} });
  let out = base.svg;
  // rewind flash
  const rw = vis(t, s0 - 0.1, s0 + 0.7, 0.1);
  if (rw > 0) { for (let i = 0; i < 12; i++) out += `<rect x="0" y="${(i * 97 + t * 900) % 1080}" width="1920" height="3" fill="#fff" opacity="${0.12 * rw}"/>`; out += K.g(K.pill(960, 120, '◀◀ REMBOBINONS · ×0,1', { color: C.text, size: 22 }), { opacity: rw }); }
  // PC-A → SW2, then two copies
  if (t < tInon + 0.1) { const k = P(t, s0 + 0.8, Math.max(0.6, tInon - s0 - 1), ease.inOut); out += K.frame({ ...lerpLine(L.hA[0], L.hA[1], k), s: 0.55, compact: true, color: YEL }); }
  if (t >= tInon && t < s22 + 0.1) { const k = P(t, tInon, 1.2, ease.inOut); out += frameOn('l12', k, YEL, 0.55, true) + frameOn('l23', k, YEL, 0.55); out += K.g(K.text(505, 590 - 110, '×2', { size: 44, weight: 800, fill: YEL }), { opacity: vis(t, tInon, s22) }); }
  if (t >= s22 && !orbit) { const k = P(t, s22, Math.max(1, tRev - s22 - 0.2), ease.inOut); out += frameOn('l13', k, YEL, 0.55) + frameOn('l13', k, YEL, 0.55, true); }
  if (orbit) {
    const sp = 0.22 + 0.25 * P(t, s23, 4);
    const n = 2 + (t > tArp ? 2 : 0) + (t > tArp + 1 ? 2 : 0) + (t > tSat ? 4 : 0);
    for (let i = 0; i < n; i++) {
      const dir = i % 2 ? 1 : -1, ph = (i >> 1) * 0.17;
      const k = ((((t - tRev) * sp * dir + ph) % 1) + 1) % 1;
      const col = i >= 2 && i < 6 ? (i < 4 ? '#FDE68A' : '#FCD34D') : YEL;
      out += K.frame({ ...along(LOOP, k), s: 0.5, compact: true, color: col });
    }
    out += `<path d="M 700 470 A 330 250 0 0 1 1220 470" fill="none" stroke="${YEL}" stroke-width="5" stroke-dasharray="18 14" opacity="0.5"/>`;
    out += `<path d="M 1220 600 A 330 250 0 0 1 700 600" fill="none" stroke="${YEL}" stroke-width="5" stroke-dasharray="18 14" opacity="0.5"/>`;
    // copies delivered to hosts each lap
    if (t > s23) {
      const laps = Math.floor((t - s23) * 3.2);
      [[0, 'PC-A'], [1, 'PC-B'], [2, 'PC-C'], [3, 'PC-D']].forEach(([i]) => {
        const p = base.pcs[i].anchor;
        const x = i < 2 ? p.x - 60 : p.x + 60;
        out += K.g(K.pill(x, p.y - 95, `×${(laps * 4 + i * 3).toLocaleString('fr-FR')}`, { color: YEL, size: 18, mono: true }), { opacity: vis(t, s23, s24 + 0.5) });
      });
    }
  }
  out += K.g(K.pill(960, 505, '1 tour ≈ quelques µs', { color: YEL, size: 22 }), { opacity: vis(t, tMic, tArp + 1) });
  if (t > tArp) { out += K.g(K.pill(760, 150, 'ARP', { color: '#FDE68A', size: 20, filled: true }) + K.pill(1160, 150, 'DHCP', { color: '#FCD34D', size: 20, filled: true }), { opacity: vis(t, tArp, s24) }); }
  const gz = vis(t, tSat - 0.2, s24 + 0.4);
  if (gz > 0) out += K.g(`<g filter="url(#shadow)"><rect x="1400" y="46" width="470" height="150" rx="20" fill="#0C0A12" fill-opacity="0.9" stroke="${C.error}" stroke-width="2"/></g>${K.gauge(1426, 96, 'LIENS', Math.round(40 + 60 * P(t, tSat, 0.8)))}${K.gauge(1426, 162, 'CPU SWITCHES', Math.round(30 + 70 * P(t, tCpu, 0.8)))}`, { opacity: gz });
  // MAC instability close-up
  const mt = vis(t, tTab, tSym, 0.35);
  if (mt > 0) {
    const flips = t < tTan ? 0 : Math.floor(Math.pow(Math.max(0, t - tTan), 1.6) * 3);
    const port = flips % 2 ? 'Gi0/2' : 'Fa0/1';
    const glitch = t > tRe ? Math.sin(t * 70) * 6 : 0;
    let tb = `<rect width="1920" height="1080" fill="#05070D" opacity="0.7"/>`;
    const tbl = K.macTable({ x: 560, y: 260, w: 800, title: 'TABLE MAC · SW1', cols: ['MAC', 'PORT'], slots: 2, rowH: 110, rows: [{ cells: ['AA:AA', port], state: flips ? 'hit' : 'new' }] });
    tb += K.g(tbl.svg, { x: glitch });
    tb += K.g(K.text(960, 700, port === 'Fa0/1' ? '← arrivée depuis SW2' : '← arrivée depuis SW3', { size: 28, weight: 700, fill: C.decision }), { opacity: t > tTan ? 1 : 0 });
    tb += K.g(K.text(960, 770, `réécrite ${flips.toLocaleString('fr-FR')} fois`, { size: 36, weight: 800, fill: C.error, font: C.mono }), { opacity: P(t, tRe, 0.3) });
    out += K.g(tb, { opacity: mt, s: mix(0.92, 1, mt), ox: 960, oy: 450 });
  }
  // three symptoms → one loop
  const sy = vis(t, tSym, end - 0.2, 0.3);
  if (sy > 0) {
    const conv = P(t, tBou, 0.7, ease.inOut);
    let s = `<rect width="1920" height="1080" fill="#05070D" opacity="0.75"/>`;
    [['TEMPÊTE DE BROADCASTS', YEL, 480], ['COPIES EN DOUBLE', '#FDE68A', 960], ['TABLE MAC INSTABLE', C.error, 1440]].forEach(([l, c, x], i) => {
      const px = mix(x, 960, conv), op = P(t, tSym + i * 0.25, 0.3) * (1 - conv);
      s += K.g(`<circle cx="${px}" cy="470" r="90" fill="${c}" fill-opacity="0.15" stroke="${c}" stroke-width="4"/>${K.text(px, 620, l, { size: 26, weight: 800, fill: c })}`, { opacity: op });
    });
    if (conv > 0) s += K.g(`<circle cx="960" cy="470" r="${120 + 20 * Math.sin(t * 6)}" fill="none" stroke="${C.error}" stroke-width="10" stroke-dasharray="40 16" filter="url(#glow)"/>${K.text(960, 490, 'UNE BOUCLE', { size: 54, weight: 800, fill: C.error })}`, { opacity: conv });
    out += K.g(s, { opacity: sy });
  }
  return out + chapter('LA TEMPÊTE', vis(t, s0 + 0.5, end));
}

// ============================================================ S03 METAPHOR (AI video)
function shotMeta(t, { E, S }) {
  const s0 = S('S03.1').start, end = S('S03.2').start;
  const i = Math.floor((t - s0) * 30);
  const f = 1 + (Math.floor(i / 150) % 2 ? 150 - (i % 150) : i % 150);
  let out = `<image href="${AI}/frames/roundabouts/f${String(Math.max(1, Math.min(151, f))).padStart(3, '0')}.jpg" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice"/>`;
  out += `<defs><linearGradient id="mshade" x1="0" x2="0" y1="0" y2="1"><stop offset="0.55" stop-color="#05070D" stop-opacity="0"/><stop offset="1" stop-color="#05070D" stop-opacity="0.85"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#mshade)"/>`;
  out += K.g(K.pill(960, 80, 'ANALOGIE', { color: C.muted, size: 20 }), { opacity: P(t, s0, 0.4) });
  out += cap(960, 150, 'une voiture sans destination', { size: 40, o: vis(t, E('S03.1', 'ronds-points'), end - 0.3) });
  return out;
}

// ============================================================ S03.2 + S04 IDEA
function shotIdea(t, { E, S }) {
  const s0 = S('S03.2').start, tVue = E('S03.2', 'vue');
  const tRet = E('S04.1', 'retire'), tCas = E('S04.1', 'casse'), s42 = S('S04.2').start, tLog = E('S04.2', 'logiquement'), tStp = E('S04.2', 'S-T-P');
  const q = ['chef', 'chemin', 'câble', 'bloquer'].map((a) => E('S04.2', a));
  const end = S('S05.1').start;
  const cut = t >= tRet && t < s42, brk = t >= tCas && t < s42;
  const loopOn = t < tRet;
  const cy = { color: YEL, width: 6, glow: true };
  const base = tri({ cables: loopOn ? { l12: cy, l13: cy, l23: cy } : { l12: cut ? { hidden: true } : {}, l23: brk ? { broken: 1, width: 6 } : {} }, sub2: brk ? 'COUPÉ' : undefined });
  let out = base.svg;
  if (loopOn) {
    const k = ((t - s0) * 0.35) % 1;
    out += K.frame({ ...along(LOOP, k), s: 0.6, compact: true, color: YEL });
    out += `<path d="M 700 470 A 330 250 0 0 1 1220 470" fill="none" stroke="${YEL}" stroke-width="5" stroke-dasharray="18 14" opacity="0.45"/><path d="M 1220 600 A 330 250 0 0 1 700 600" fill="none" stroke="${YEL}" stroke-width="5" stroke-dasharray="18 14" opacity="0.45"/>`;
    out += K.g(K.pill(960, 520, '↻ la même boucle', { color: YEL, size: 24 }), { opacity: P(t, tVue, 0.4) });
  }
  const bub = vis(t, s0 + 0.3, tRet - 0.3);
  out += K.g(K.thoughtBubble({ x: 960, y: 110, str: t < tVue ? 'déjà vue ?' : '???', color: C.decision, tail: { x: 960, y: 190 } }), { opacity: bub });
  if (t >= tRet && t < s42) {
    const m = mid('l12');
    const sn = P(t, tRet, 0.25, ease.out);
    out += `<g opacity="${1 - P(t, tRet + 0.9, 0.3)}"><path d="M${m.x - 70 * sn} ${m.y - 70 * sn} L${m.x + 70 * sn} ${m.y + 70 * sn}" stroke="${C.error}" stroke-width="10" stroke-linecap="round" filter="url(#glow)"/><circle cx="${m.x}" cy="${m.y}" r="${20 + 50 * sn}" fill="none" stroke="${C.error}" stroke-width="4" opacity="${1 - sn * 0.6}"/></g>`;
    out += `<path d="M${L.l12[0].x} ${L.l12[0].y} L${m.x - 20} ${m.y - 13}" stroke="#3A4D70" stroke-width="6"/><path d="M${m.x + 20} ${m.y + 13} L${L.l12[1].x} ${L.l12[1].y}" stroke="#3A4D70" stroke-width="6"/>`;
  }
  if (brk) { const m = mid('l23'); out += K.g(`<path d="M${m.x - 30} ${m.y - 70} l30 40 -20 5 30 45" fill="none" stroke="${YEL}" stroke-width="8" stroke-linejoin="round" filter="url(#glow)"/>`, { opacity: 1 - P(t, tCas + 0.5, 0.3) }); out += K.g(K.pill(505, 560, 'SW2 ISOLÉ', { color: C.error, size: 24, filled: true }), { opacity: P(t, tCas + 0.2, 0.3) }); out += K.g(K.pill(960, 120, 'PLAN B ?', { color: C.error, size: 34 }), { opacity: P(t, tCas + 0.3, 0.3) }); }
  // rewind + ghost barrier
  if (t >= s42) {
    const rw = vis(t, s42 - 0.05, s42 + 0.5, 0.1);
    for (let i = 0; i < 10 && rw > 0; i++) out += `<rect x="0" y="${(i * 113 + t * 900) % 1080}" width="1920" height="3" fill="#fff" opacity="${0.1 * rw}"/>`;
    const gb = vis(t, tLog, q[0] - 0.2);
    if (gb > 0) out += K.g(K.barrier(L.l12[1], L.l12[0], { at: 0.22, len: 140 }), { opacity: 0.55 * gb });
    out += K.g(K.text(960, 110, 'SPANNING TREE PROTOCOL', { size: 56, weight: 800, fill: VIO, ls: 6 }), { opacity: vis(t, tStp, q[0]) });
  }
  // quest map: 4 steps
  const qm = vis(t, q[0] - 0.3, end + 1, 0.3);
  if (qm > 0) {
    let s = `<rect width="1920" height="1080" fill="#05070D" opacity="0.8"/>`;
    const steps = [['ÉLIRE UN CHEF', GOLD, 'crown'], ['MEILLEUR CHEMIN', C.forward, 'path'], ['UN PORT PAR CÂBLE', C.traffic, 'dp'], ['BLOQUER LE RESTE', C.error, 'bar']];
    s += `<path d="M 330 540 H 1590" stroke="${C.deviceEdge}" stroke-width="4" stroke-dasharray="12 10"/>`;
    steps.forEach(([l, c, ic], i) => {
      const x = 330 + i * 420, on = P(t, q[i], 0.35);
      let icon = '';
      if (ic === 'crown') icon = crownAt(x, 530, 170, 1, 'q');
      if (ic === 'path') icon = `<path d="M${x - 60} 560 Q ${x} 470 ${x + 60} 520" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round" filter="url(#glow)"/>`;
      if (ic === 'dp') icon = `<path d="M${x - 70} 540 H${x + 70}" stroke="${C.muted}" stroke-width="8"/>${K.roleBadge({ x: x - 50, y: 540 }, 'DP', { dx: 20, dy: -50 })}`;
      if (ic === 'bar') icon = K.barrier({ x: x - 80, y: 560 }, { x: x + 80, y: 520 }, { at: 0.5, len: 120 });
      s += K.g(`<circle cx="${x}" cy="530" r="110" fill="#0C1427" stroke="${c}" stroke-width="${3 + 2 * on}" ${on > 0.5 ? 'filter="url(#glow)"' : ''}/>${icon}${K.text(x, 700, `${i + 1}. ${l}`, { size: 28, weight: 800, fill: c })}`, { opacity: 0.25 + 0.75 * on, s: mix(0.85, 1, on), ox: x, oy: 530 });
    });
    out += K.g(s, { opacity: qm });
  }
  return out + chapter('LA SOLUTION', vis(t, s0, end));
}

// ============================================================ S05 ELECTION
function shotElection(t, { E, S }) {
  const s0 = S('S05.1').start, tBp = E('S05.1', 'B-P-D-U'), tBid = E('S05.1', 'Bridge'), tPri = E('S05.1', 'priorité'), tMac = E('S05.1', 'MAC');
  const tR1 = E('S05.2', 'priorité'), tFlip = E('S05.2', 'Trente-deux'), tEg = E('S05.2', 'Égalité');
  const tR2 = E('S05.3', 'MAC'), tCr = E('S05.3', 'couronne'), tTj = E('S05.3', 'toujours'), tCli = E('S05.3', 'priorité');
  const end = S('S06.1').start;
  let out = `<defs>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFD7FF" stop-opacity="0.3"/><stop offset="1" stop-color="#BFD7FF" stop-opacity="0"/></linearGradient>
    <linearGradient id="beamGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${GOLD}" stop-opacity="0.5"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${GOLD}" stop-opacity="0.45"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient></defs>`;
  const crowned = P(t, tCr, 0.9, ease.out);
  [[480, 'beam'], [960, crowned > 0 ? 'beamGold' : 'beam'], [1440, 'beam']].forEach(([x, id]) => { out += `<path d="M${x - 40} 0 L${x + 40} 0 L${x + 230} 720 L${x - 230} 720 Z" fill="url(#${id})" opacity="${0.6 + 0.4 * Math.sin(t * 2 + x)}"/>`; });
  out += K.g(K.pill(960, 46, 'ROUND 1 · PRIORITÉ', { color: t > tR2 ? C.muted : VIO, size: t > tR2 ? 18 : 28, filled: t < tR2 }), { opacity: P(t, tR1, 0.3), y: t > tR2 ? 0 : 50 });
  out += K.g(K.pill(960, 100, 'ROUND 2 · ADRESSE MAC', { color: VIO, size: 30, filled: true }), { opacity: P(t, tR2, 0.3) });
  const cand = [{ x: 480, name: 'SW2', mac: '0002', win: false }, { x: 960, name: 'SW1', mac: '0001', win: true }, { x: 1440, name: 'SW3', mac: '0003', win: false }];
  cand.forEach((c, i) => {
    const rise = P(t, s0 + 0.2 + i * 0.15, 0.6, ease.out);
    let s = K.podium(c.x, 650, 300, 120, c.win && crowned > 0 ? GOLD : C.traffic);
    s += K.switchDevice({ x: c.x - 125, y: 470, w: 250, h: 140, label: c.name, highlight: c.win && crowned > 0.3 ? GOLD : undefined }).svg;
    out += K.g(s, { opacity: rise, y: 60 * (1 - rise) });
    const card = P(t, tBid, 0.4);
    if (card > 0) {
      const cx = c.x - 190, cy = 800;
      let k = `<g filter="url(#shadow)"><rect x="${cx}" y="${cy}" width="380" height="118" rx="16" fill="#0C1427" stroke="${c.win && crowned > 0 ? GOLD : C.deviceEdge}" stroke-width="${c.win && crowned > 0 ? 3 : 2}"/></g>`;
      k += K.text(cx + 20, cy + 30, 'BRIDGE ID', { size: 14, weight: 800, fill: C.muted, anchor: 'start', ls: 3 });
      k += K.g(K.text(cx + 20, cy + 64, 'PRIORITÉ', { size: 14, weight: 700, fill: C.muted, anchor: 'start' }) + K.text(cx + 360, cy + 64, t >= tFlip ? '32769' : '?????', { size: 22, weight: 700, font: C.mono, fill: t > tR2 ? C.muted : C.text, anchor: 'end', opacity: t > tR2 ? 0.6 : 1 }), { opacity: P(t, tPri, 0.3) });
      k += K.g(K.text(cx + 20, cy + 100, 'MAC', { size: 14, weight: 700, fill: C.muted, anchor: 'start' }) + `<text x="${cx + 360}" y="${cy + 101}" text-anchor="end" font-family="${C.mono}" font-weight="700" font-size="26"><tspan fill="${C.text}">0200.0000.</tspan><tspan fill="${t > tR2 + 0.8 ? (c.win ? C.forward : C.error) : C.text}">${c.mac}</tspan></text>`, { opacity: P(t, tMac, 0.3) });
      out += K.g(k, { opacity: card, y: 20 * (1 - card) });
    }
  });
  if (t > tR2 + 1.2) out += K.g(K.text(720, 905, '>', { size: 60, weight: 800, fill: VIO }) + K.text(1200, 905, '<', { size: 60, weight: 800, fill: VIO }), { opacity: P(t, tR2 + 1.2, 0.3) });
  out += K.g(K.stamp(960, 380, 'ÉGALITÉ', { color: C.decision, size: 64, rot: -4 }), { opacity: vis(t, tEg, tR2 - 0.2), s: mix(1.4, 1, P(t, tEg, 0.25)), ox: 960, oy: 380 });
  // BPDUs flying
  if (t > tBp && t < tCr) for (let i = 0; i < 3; i++) { const k = ((t - tBp) * 0.5 + i / 3) % 1; const a = [cand[0], cand[1], cand[2]][i], b = [cand[1], cand[2], cand[0]][i]; const p = { x: mix(a.x, b.x, k), y: 430 - Math.sin(k * Math.PI) * 160 }; out += K.frame({ ...p, s: 0.45, compact: true, color: VIO }) + K.text(p.x, p.y + 42, 'BPDU', { size: 14, weight: 800, fill: VIO, ls: 2 }); }
  // crown descends
  if (crowned > 0) {
    const y = mix(-120, 300, crowned);
    out += `<ellipse cx="960" cy="${y + 30}" rx="260" ry="200" fill="url(#halo)" opacity="${crowned}"/>` + crownAt(960, y, 400, 1, 'ec');
    out += K.g(K.pill(960, 442, 'ROOT BRIDGE', { color: GOLD, size: 24, filled: true }), { opacity: P(t, tCr + 0.6, 0.3) });
  }
  if (t > tCli) out += K.g(K.cli(560, 150, 800, ['spanning-tree vlan 1 priority 24576'], { chars: Math.floor((t - tCli) * 26), host: 'SW1(config)#' }), { opacity: vis(t, tCli, end) });
  out += K.g(K.text(960, 1000, '32769 = 32768 + VLAN 1', { size: 22, weight: 700, fill: C.muted, font: C.mono }), { opacity: vis(t, tFlip + 0.5, tR2) });
  return out + chapter('01 · L\'ÉLECTION', vis(t, s0, end));
}

// ============================================================ S06 ROOT PORT
function pathTrace(pts, k, color, width = 10) {
  if (k <= 0) return '';
  const seg = [];
  for (let i = 0; i <= 20; i++) seg.push(along(pts, (i / 20) * k));
  return `<polyline points="${seg.map((p) => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" filter="url(#glow)"/>`;
}
function shotRootPort(t, { E, S }) {
  const s0 = S('S06.1').start, tCost = E('S06.1', 'coût');
  const t4 = E('S06.2', 'quatre'), t23 = E('S06.2', 'vingt-trois'), tG1 = E('S06.2', 'gagne'), tRP1 = E('S06.2', 'Root');
  const t19 = E('S06.3', 'dix-neuf'), t8 = E('S06.3', 'huit'), tSur = E('S06.3', 'Surprise'), tLow = E('S06.3', 'faible');
  const end = S('S07.1').start;
  const cab = {};
  if (t > tG1) cab.l13 = { color: C.forward, width: 7, glow: true };
  if (t > tSur) cab.l23 = { color: C.forward, width: 7, glow: true };
  const base = tri({ root: true, hosts: false, names: true, cables: cab, leds: { s3a: t > tG1 ? 'green' : undefined, s2b: t > tSur ? 'green' : undefined } });
  let out = base.svg + crownAt(960, 110, 240, 1, 'rp');
  out += costLabels(P(t, tCost, 0.4));
  // SW3 candidates
  const s3dir = [TG.sw3.port('Gi0/1'), TG.sw1.port('Gi0/2')];
  const s3det = [TG.sw3.port('Gi0/2'), TG.sw2.port('Gi0/2'), { x: TG.sw2.port('Gi0/2').x - 40, y: TG.sw2.port('Fa0/1').y + 40 }, TG.sw2.port('Fa0/1'), TG.sw1.port('Fa0/1')];
  const phase1 = t < t19 - 0.4;
  if (phase1) {
    out += pathTrace(s3dir, P(t, t4 - 0.3, 0.8), t > tG1 ? C.forward : C.decision);
    out += K.g(pathTrace(s3det, P(t, t23 - 1.2, 1.2), C.error, 8), { opacity: t > tG1 ? 0.25 : 1 });
    out += K.g(K.pill(1270, 400, 'direct : 4', { color: t > tG1 ? C.forward : C.decision, size: 26, filled: t > tG1 }), { opacity: P(t, t4, 0.3) });
    out += K.g(K.pill(960, 830, 'détour : 4 + 19 = 23', { color: C.error, size: 26 }), { opacity: P(t, t23, 0.3) * (t > tG1 ? 0.4 : 1) });
  }
  out += K.roleBadge(TG.sw3.port('Gi0/1'), 'RP', { dx: 70, dy: -20, opacity: P(t, tRP1, 0.3) });
  // SW2 candidates
  if (!phase1) {
    const s2dir = [TG.sw2.port('Fa0/1'), TG.sw1.port('Fa0/1')];
    const s2det = [TG.sw2.port('Gi0/2'), TG.sw3.port('Gi0/2'), { x: TG.sw3.port('Gi0/2').x + 40, y: TG.sw3.port('Gi0/1').y + 40 }, TG.sw3.port('Gi0/1'), TG.sw1.port('Gi0/2')];
    out += K.g(pathTrace(s2dir, P(t, t19 - 0.4, 0.8), C.decision), { opacity: t > tSur ? 0.25 : 1 });
    out += pathTrace(s2det, P(t, t8 - 1.2, 1.2), t > tSur ? C.forward : C.traffic);
    out += K.g(K.pill(600, 400, 'direct : 19', { color: C.decision, size: 26 }), { opacity: P(t, t19, 0.3) * (t > tSur ? 0.4 : 1) });
    out += K.g(K.pill(960, 830, 'détour : 4 + 4 = 8', { color: t > tSur ? C.forward : C.traffic, size: 30, filled: t > tSur }), { opacity: P(t, t8, 0.3) });
    out += K.g(K.stamp(960, 500, 'LE DÉTOUR GAGNE', { color: C.forward, size: 48, rot: -3 }), { opacity: vis(t, tSur + 0.2, tLow), s: mix(1.3, 1, P(t, tSur + 0.2, 0.25)), ox: 960, oy: 500 });
    out += K.roleBadge(TG.sw2.port('Gi0/2'), 'RP', { dx: 10, dy: 62, opacity: P(t, tLow, 0.3) });
  }
  return out + chapter('02 · LE ROOT PORT', vis(t, s0, end));
}

// ============================================================ S07 DESIGNATED
function shotDesig(t, { E, S }) {
  const s0 = S('S07.1').start, tCab = E('S07.1', 'câble'), tTr = E('S07.1', 'trois'), tDes = E('S07.1', 'désignés'), tCh = E('S07.1', 'chose');
  const s72 = S('S07.2').start, t4 = E('S07.2', 'quatre'), t8 = E('S07.2', 'huit'), tD = E('S07.2', 'désigné');
  const end = S('S08.1').start;
  const spot = t < tTr ? null : t < tCh ? 'l13' : t < s72 ? 'l12' : 'l23';
  const dim = t > tCab ? 0.65 : 0;
  const cab = { l13: { color: C.forward, width: 7, glow: spot === 'l13' }, l23: { color: C.forward, width: 7, glow: spot === 'l23' }, l12: { color: spot === 'l12' ? C.traffic : '#3A4D70', width: 7, glow: spot === 'l12' } };
  const base = tri({ root: true, hosts: false, names: true, cables: cab });
  let out = base.svg + crownAt(960, 110, 240, 1, 'dp');
  out += badge('s3a', 'RP') + badge('s2b', 'RP');
  // spotlight: dim everything except the current segment
  if (dim > 0 && spot) {
    const [a, b] = L[spot];
    out += `<defs><mask id="spotm"><rect width="1920" height="1080" fill="#fff"/><path d="M${a.x} ${a.y} L${b.x} ${b.y}" stroke="#000" stroke-width="160" stroke-linecap="round"/></mask></defs><rect width="1920" height="1080" fill="#05070D" opacity="${dim}" mask="url(#spotm)"/>`;
  }
  out += badge('s1b', 'DP', P(t, tDes, 0.3));
  out += badge('s1a', 'DP', P(t, tCh, 0.3));
  if (t > s72) {
    out += K.g(K.pill(TG.sw3.port('Gi0/2').x - 150, TG.sw3.port('Gi0/2').y - 60, 'coût root : 4', { color: C.forward, size: 22, filled: t > tD }), { opacity: P(t, t4, 0.3) });
    out += K.g(K.pill(TG.sw2.port('Gi0/2').x + 150, TG.sw2.port('Gi0/2').y - 60, 'coût root : 8', { color: C.decision, size: 22 }), { opacity: P(t, t8, 0.3) });
    out += badge('s3b', 'DP', P(t, tD, 0.3));
  }
  out += K.g(K.text(960, 1000, 'un seul port désigné PAR CÂBLE', { size: 30, weight: 800, fill: C.traffic }), { opacity: vis(t, tCab, s72) });
  return out + chapter('03 · UN CÂBLE, UN CHEF', vis(t, s0, end));
}

// ============================================================ S08 BLOCKING
function shotBlock(t, { E, S }) {
  const s0 = S('S08.1').start, tRes = E('S08.1', 'reste'), tBl = E('S08.1', 'bloque'), tTj = E('S08.1', 'toujours');
  const tEc = E('S08.2', 'écoute'), tRel = E('S08.2', 'Relançons'), tFo = E('S08.2', 'fois'), tArb = E('S08.2', "L'arbre");
  const end = S('S09.1').start;
  const bk = P(t, tBl, 0.35, ease.in);
  const replay = t >= tRel;
  const cab = { l13: { color: C.forward, width: 7, glow: t > tArb }, l23: { color: C.forward, width: 7, glow: t > tArb }, l12: bk > 0 ? { color: C.muted, width: 6, dashed: true, opacity: t > tTj && t < tEc ? 1 : 0.7 } : { color: '#3A4D70', width: 7 } };
  const base = tri({ root: true, hosts: replay, names: true, cables: cab, leds: { s2a: bk > 0 ? 'red' : undefined }, pc: t > tFo ? { 0: 'ok', 1: 'ok', 2: 'ok', 3: 'ok' } : {} });
  let out = base.svg + crownAt(960, 110, 240, 1, 'bl');
  out += badge('s3a', 'RP') + badge('s2b', 'RP') + badge('s1a', 'DP') + badge('s1b', 'DP') + badge('s3b', 'DP');
  if (t > tRes && bk <= 0) out += K.g(K.text(TG.sw2.port('Fa0/1').x - 70, TG.sw2.port('Fa0/1').y - 40, '?', { size: 60, weight: 800, fill: C.error }), { opacity: blink(t, tRes, 20, 0.4) });
  if (bk > 0) {
    out += K.barrier(L.l12[1], L.l12[0], { at: 0.22, len: 150, k: bk });
    out += badge('s2a', 'ALT', P(t, tBl + 0.3, 0.3));
  }
  if (t > tTj && t < tEc) { const [a, b] = L.l12; out += `<path d="M${a.x} ${a.y} L${b.x} ${b.y}" stroke="${C.text}" stroke-width="14" opacity="${0.15 + 0.1 * Math.sin(t * 8)}" filter="url(#glow)"/>`; out += K.g(K.pill(mid('l12', -230, -110).x, mid('l12', -230, -110).y, 'le câble est toujours là', { color: C.text, size: 22 }), { opacity: P(t, tTj, 0.3) }); }
  // BPDUs arriving at the barrier and being listened to
  if (t > tEc && t < tRel + 0.5) for (let i = 0; i < 2; i++) { const k = ((t - tEc) * 0.6 + i / 2) % 1; const p = lerpLine(L.l12[0], lerpLine(L.l12[1], L.l12[0], 0.22), k); out += K.frame({ ...p, s: 0.5, compact: true, color: VIO }); }
  out += K.g(K.pill(mid('l12', 120, 60).x, mid('l12', 120, 60).y, 'écoute les BPDU · ne transmet pas', { color: VIO, size: 18 }), { opacity: vis(t, tEc, tRel + 0.4) });
  // replay: one copy per PC, then silence
  if (replay) {
    const k = (d, dur = 0.7) => P(t, tRel + d, dur, ease.inOut);
    const pA = along([L.hA[0], L.hA[1]], k(0));
    if (k(0) < 1) out += K.frame({ ...pA, s: 0.5, compact: true, color: YEL });
    const legs = [[[L.hB[1], L.hB[0]], 0.7], [[L.l23[0], L.l23[1]], 0.7], [[L.hC[0], L.hC[1]], 1.4], [[L.hD[0], L.hD[1]], 1.4], [[L.l13[1], L.l13[0]], 1.4], [[L.l12[0], lerpLine(L.l12[1], L.l12[0], 0.24)], 2.1]];
    legs.forEach(([seg, d], i) => { const kk = k(d); if (kk > 0 && kk < 1) out += K.frame({ ...along(seg, kk), s: 0.5, compact: true, color: YEL }); if (i === 5 && kk >= 1) out += K.particles(seg[1].x, seg[1].y, P(t, tRel + d + 0.7, 0.6, ease.lin), YEL, { seed: 4 }); });
    base.pcs.forEach((p, i) => { const d = i < 2 ? 0.7 : 1.4; out += K.g(K.pill(i < 2 ? p.anchor.x - 60 : p.anchor.x + 60, p.anchor.y - 95, '×1', { color: C.forward, size: 22, filled: true }), { opacity: P(t, tRel + d + 0.7, 0.3) }); });
  }
  out += K.g(K.text(960, 1000, 'la boucle a disparu · l\'arbre est formé', { size: 32, weight: 800, fill: C.forward }), { opacity: P(t, tArb, 0.4) });
  return out + chapter('04 · LE BLOCAGE', vis(t, s0, end));
}

// ============================================================ S09 FAILOVER
function shotFail(t, { E, S }) {
  const s0 = S('S09.1').start, tCas = E('S09.1', 'casse'), tCou = E('S09.1', 'coupé'), tNon = E('S09.1', 'Non'), tRep = E('S09.1', 'repasse');
  const s92 = S('S09.2').start, t50 = E('S09.2', 'cinquante'), tAlt = E('S09.2', 'Alternate'), tIns = E('S09.2', 'instantanée'), tCat = E('S09.2', 'catastrophe');
  const end = S('S10.1').start;
  const broke = t >= tCas;
  const up = P(t, tNon, 0.6, ease.out);
  const cab = { l13: { color: C.forward, width: 7, glow: true }, l23: broke ? { broken: P(t, tCas, 0.3), width: 6 } : { color: C.forward, width: 7, glow: true }, l12: up > 0.5 ? { color: C.forward, width: 7, glow: true } : { color: C.muted, width: 6, dashed: true } };
  const base = tri({ root: true, hosts: false, names: true, cables: cab, leds: { s2a: up > 0.5 ? 'green' : 'red', s2b: broke ? 'red' : 'green' } });
  let out = base.svg + crownAt(960, 110, 240, 1, 'fo');
  out += badge('s3a', 'RP') + badge('s1a', 'DP') + badge('s1b', 'DP');
  out += badge('s2b', 'RP', 1 - P(t, tCas + 0.3, 0.3)) + badge('s3b', 'DP', 1 - P(t, tCas + 0.3, 0.3));
  if (broke) { const m = mid('l23'); for (let i = 0; i < 8; i++) { const a = i * 0.8 + t * 5, r = 20 + ((t * 120 + i * 17) % 60); out += `<circle cx="${m.x + Math.cos(a) * r}" cy="${m.y + Math.sin(a) * r}" r="3" fill="${YEL}" opacity="${(1 - P(t, tCas + 1.5, 1)) * 0.9}"/>`; } }
  if (up < 1) out += K.barrier(L.l12[1], L.l12[0], { at: 0.22, len: 150, k: 1 - up });
  out += badge('s2a', up > 0.5 ? 'RP' : 'ALT');
  out += K.g(K.text(505, 590, '?', { size: 70, weight: 800, fill: C.error }), { opacity: vis(t, tCou, tNon) });
  if (t > tRep) for (let i = 0; i < 3; i++) { const k = ((t - tRep) * 0.7 + i / 3) % 1; out += K.frame({ ...lerpLine(L.l12[1], L.l12[0], k), s: 0.5, compact: true, color: C.forward }); }
  // timers
  const tm = vis(t, t50 - 0.2, tCat - 0.2);
  if (tm > 0) {
    let s = `<rect width="1920" height="1080" fill="#05070D" opacity="0.8"/>`;
    const clock = (x, label, secs, col, t0, dur) => {
      const k = P(t, t0, dur, ease.lin), v = Math.round(secs * k * 10) / 10;
      const r = 150, c = 2 * Math.PI * r;
      return `<circle cx="${x}" cy="470" r="${r}" fill="#0C1427" stroke="${C.deviceEdge}" stroke-width="14"/><circle cx="${x}" cy="470" r="${r}" fill="none" stroke="${col}" stroke-width="14" stroke-dasharray="${c * k} ${c}" transform="rotate(-90 ${x} 470)" filter="url(#glow)"/>
        ${K.text(x, 490, `${v.toFixed(secs > 10 ? 0 : 1)} s`, { size: 64, weight: 800, font: C.mono, fill: col })}${K.text(x, 700, label, { size: 32, weight: 800, fill: col })}`;
    };
    s += clock(600, 'STP · 802.1D', 50, C.decision, t50, Math.max(1.5, tIns - t50));
    s += K.g(clock(1320, 'RSTP · 802.1w', 1, C.forward, tIns - 0.3, 0.5), { opacity: P(t, tAlt - 0.5, 0.3) });
    s += K.g(K.pill(1320, 260, 'port ALTERNATE = remplaçant prévu', { color: C.forward, size: 22 }), { opacity: P(t, tAlt, 0.3) });
    out += K.g(s, { opacity: tm });
  }
  return out + chapter('05 · LA PANNE', vis(t, s0, end));
}

// ============================================================ S10 ETHERCHANNEL
function shotEther(t, { E, S }) {
  const s0 = S('S10.1').start, t4 = E('S10.1', 'quatre'), t3 = E('S10.1', 'trois'), t1 = E('S10.1', 'un');
  const tEc = E('S10.2', "l'EtherChannel"), tAut = E('S10.2', 'autoroute'), tSeul = E('S10.2', 'S-T-P'), tTrav = E('S10.2', 'travaillent');
  const end = S('S11.1').start;
  const a = K.switchDevice({ x: 360, y: 440, w: 260, h: 200, label: 'SW1' });
  const b = K.switchDevice({ x: 1300, y: 440, w: 260, h: 200, label: 'SW2' });
  const merge = P(t, tEc, 1.0, ease.inOut);
  let out = '';
  const ys = [480, 520, 560, 600];
  ys.forEach((y, i) => {
    const yy = mix(y, 540 + (i - 1.5) * 12, merge);
    const draw = P(t, t4 + i * 0.12, 0.4);
    const col = t > tTrav ? [C.traffic, C.forward, C.decision, VIO][i] : (i > 0 && t > t3 + i * 0.25 && merge < 0.3 ? C.muted : C.traffic);
    const dashed = i > 0 && t > t3 + i * 0.25 && merge < 0.3;
    if (draw > 0) out += `<path d="M620 ${yy} H${620 + 680 * draw}" stroke="${col}" stroke-width="18" opacity="${dashed ? 0 : 0.18}"/><path d="M620 ${yy} H${620 + 680 * draw}" stroke="${col}" stroke-width="8" ${dashed ? 'stroke-dasharray="14 10" opacity="0.7"' : ''}/>`;
    if (i > 0 && merge < 0.3) { const bk = P(t, t3 + (i - 1) * 0.25, 0.3); if (bk > 0) out += K.g(K.barrier({ x: 1300, y: yy }, { x: 620, y: yy }, { at: 0.25 + (i - 1) * 0.22, len: 60, k: bk }), { opacity: 1 - merge * 3 }); }
  });
  if (merge > 0) out += K.g(`<rect x="600" y="${540 - 44}" width="720" height="88" rx="44" fill="none" stroke="${C.text}" stroke-width="4" filter="url(#glow)"/>${K.pill(960, 440, 'PORT-CHANNEL 1', { color: C.text, size: 26, filled: true })}`, { opacity: merge });
  out += a.svg + b.svg;
  out += K.g(K.counter({ x: 960, y: 820, value: t > tTrav ? '4 / 4' : '1 / 4', label: 'LIENS UTILISÉS', color: t > tTrav ? C.forward : C.error }), { opacity: Math.max(vis(t, t1, tEc), P(t, tTrav, 0.3)) });
  if (t > tTrav) for (let i = 0; i < 8; i++) { const k = ((t - tTrav) * 0.8 + i / 8) % 1; out += K.frame({ x: mix(640, 1280, k), y: 540 + ((i % 4) - 1.5) * 12, s: 0.3, compact: true, color: [C.traffic, C.forward, C.decision, VIO][i % 4], glow: false }); }
  const hw = vis(t, tAut, tSeul + 0.3);
  if (hw > 0) out += K.g(`<g filter="url(#shadow)"><rect x="1300" y="90" width="560" height="316" rx="18" fill="#0C1427" stroke="${C.deviceEdge}" stroke-width="2"/></g><image href="${AI}/highway.jpg" x="1310" y="100" width="540" height="296" preserveAspectRatio="xMidYMid slice"/>${K.pill(1580, 380, '4 voies = 1 route', { color: C.text, size: 20, filled: true })}`, { opacity: hw });
  out += K.g(K.pill(960, 660, 'STP : 1 seul lien logique', { color: VIO, size: 24 }), { opacity: P(t, tSeul, 0.3) });
  if (t > tEc + 1) out += K.g(K.cli(560, 150, 800, ['interface range Gi0/1 - 4', 'channel-group 1 mode active'], { chars: Math.floor((t - tEc - 1) * 26), host: 'SW1(config)#' }), { opacity: vis(t, tEc + 1, tAut) });
  return out + chapter('06 · ETHERCHANNEL', vis(t, s0, end));
}

// ============================================================ S11 QUIZ
function shotQuiz(t, { E, S }) {
  const s0 = S('S11.1').start, tR = E('S11.1', 'Root'), tB = E('S11.1', 'switch B');
  const s2 = S('S11.2').start, tA = E('S11.2', 'A'), tDir = E('S11.2', 'direct');
  const s3 = S('S11.3').start, tBl = E('S11.3', 'bloqué'), tEg = E('S11.3', 'égalité'), tPe = E('S11.3', 'petite'), tD = E('S11.3', 'désigné');
  const end = S('S12.1').start;
  const B = K.switchDevice({ x: 835, y: 230, w: 250, h: 140, label: 'SW-B', highlight: t > tB ? GOLD : undefined, ports: { bottom: [{ name: 'a', showName: false }, { name: 'c', showName: false }] } });
  const A = K.switchDevice({ x: 380, y: 650, w: 250, h: 140, label: 'SW-A', ports: { top: [{ name: 'b', showName: false }], right: [{ name: 'c', showName: false }] } });
  const Cc = K.switchDevice({ x: 1290, y: 650, w: 250, h: 140, label: 'SW-C', ports: { top: [{ name: 'b', showName: false }], left: [{ name: 'a', showName: false }] } });
  const lab = [B.port('a'), A.port('b')], lcb = [B.port('c'), Cc.port('b')], lac = [A.port('c'), Cc.port('a')];
  let out = '';
  out += K.cable(lab[0], lab[1], { color: t > tDir ? C.forward : '#3A4D70', width: 7, glow: t > tDir }) + K.cable(lcb[0], lcb[1], { color: t > tD ? C.forward : '#3A4D70', width: 7 }) + (t > tD ? `<path d="M${lac[0].x} ${lac[0].y} L${lac[1].x} ${lac[1].y}" stroke="${C.muted}" stroke-width="6" stroke-dasharray="14 12"/>` : K.cable(lac[0], lac[1], { color: '#3A4D70', width: 7 }));
  [[lab, -120, -40], [lcb, 120, -40], [lac, 0, -30]].forEach(([l, dx, dy]) => { out += K.pill((l[0].x + l[1].x) / 2 + dx, (l[0].y + l[1].y) / 2 + dy, '1 Gb/s · 4', { color: C.decision, size: 16 }); });
  out += B.svg + A.svg + Cc.svg;
  const bid = (x, y, pri, mac, hi) => `<g filter="url(#shadow)"><rect x="${x}" y="${y}" width="300" height="80" rx="12" fill="#0C1427" stroke="${hi || C.deviceEdge}" stroke-width="${hi ? 3 : 2}"/></g>${K.text(x + 16, y + 32, `prio ${pri}`, { size: 20, weight: 700, font: C.mono, fill: pri < 30000 ? GOLD : C.text, anchor: 'start' })}${K.text(x + 16, y + 64, mac, { size: 20, weight: 700, font: C.mono, fill: C.muted, anchor: 'start' })}`;
  out += bid(1110, 230, 28673, '0200.0000.00BB', t > tB ? GOLD : null);
  out += bid(60, 820, 32769, '0200.0000.00AA', t > tPe ? C.error : null);
  out += bid(1560, 820, 32769, '0200.0000.000C', t > tPe ? C.forward : null);
  if (t > tB) out += crownAt(720, 290, 180, P(t, tB, 0.5), 'qz');
  // question banner + think timer
  const q = t < s2 ? ['QUESTION 1', 'Qui est le Root Bridge ?', tR + 0.3, tB] : t < s3 ? ['QUESTION 2', 'Root Port de SW-A ?', tA + 0.3, tDir] : ['QUESTION 3', 'Quel port est bloqué ?', tBl + 0.3, tEg];
  out += K.pill(960, 46, q[0], { color: VIO, size: 20, filled: true }) + K.text(960, 110, q[1], { size: 44, weight: 800 });
  if (t > q[2] && t < q[3]) { const k = clamp((t - q[2]) / (q[3] - q[2])), r = 40, c = 2 * Math.PI * r; out += `<circle cx="1830" cy="90" r="${r}" fill="none" stroke="${C.deviceEdge}" stroke-width="7"/><circle cx="1830" cy="90" r="${r}" fill="none" stroke="${VIO}" stroke-width="7" stroke-dasharray="${c * k} ${c}" transform="rotate(-90 1830 90)"/>`; }
  if (t > s2) { out += K.g(K.pill(470, 560, 'direct : 4', { color: C.forward, size: 22, filled: t > tDir }) + K.pill(960, 900, 'détour : 8', { color: C.muted, size: 20 }), { opacity: P(t, tDir, 0.3) }); out += K.roleBadge(A.port('b'), 'RP', { dx: -70, dy: -10, opacity: P(t, tDir, 0.3) }); }
  if (t > s3) {
    out += K.g(K.pill((lac[0].x + lac[1].x) / 2, 900, 'A : 4 = C : 4 → égalité', { color: C.decision, size: 24 }), { opacity: vis(t, tEg, tD + 1) });
    out += K.roleBadge(Cc.port('a'), 'DP', { dx: -10, dy: 62, opacity: P(t, tD, 0.3) });
    if (t > tD) out += K.barrier(lac[0], lac[1], { at: 0.2, len: 130, k: P(t, tD, 0.35, ease.in) }) + K.roleBadge(A.port('c'), 'ALT', { dx: 10, dy: 62, opacity: P(t, tD + 0.3, 0.3) });
  }
  return out + chapter('07 · À TOI DE JOUER', vis(t, s0, end));
}

// ============================================================ S12 RECAP + TEASER
function shotRecap(t, { E, S }) {
  const s0 = S('S12.1').start, end = S('S12.2').start;
  const beats = ['tempête', 'Root', 'bas', 'désigné', 'bloqué', "l'EtherChannel"].map((a) => E('S12.1', a));
  const caps = [['boucle = tempête', YEL], ['plus petit BID = ROOT', GOLD], ['coût min = ROOT PORT', C.forward], ['1 DP par câble', C.traffic], ['le reste : bloqué, prêt', C.error], ['EtherChannel = 1 lien', VIO]];
  let out = '';
  beats.forEach((tb, i) => {
    const x = 120 + (i % 3) * 570, y = 150 + Math.floor(i / 3) * 360, w = 540, h = 320, cx = x + w / 2, cy = y + 130;
    const on = P(t, tb - 0.1, 0.4), active = t >= tb && (i === 5 || t < beats[i + 1]);
    let icon = '';
    if (i === 0) icon = K.swarm([{ x: cx, y: cy - 60 }, { x: cx - 110, y: cy + 60 }, { x: cx + 110, y: cy + 60 }], 40, { t: t * 0.3, spread: 25, seed: 5, sizeMax: 0.25 });
    if (i === 1) icon = crownAt(cx, cy, 240, 1, `rc${i}`);
    if (i === 2) icon = `<path d="M${cx - 150} ${cy + 40} Q ${cx} ${cy - 90} ${cx + 150} ${cy + 20}" stroke="${C.forward}" stroke-width="12" fill="none" stroke-linecap="round" filter="url(#glow)"/>`;
    if (i === 3) icon = `<path d="M${cx - 170} ${cy} H${cx + 170}" stroke="${C.muted}" stroke-width="8"/>${K.roleBadge({ x: cx - 120, y: cy }, 'DP', { dx: 30, dy: -50 })}`;
    if (i === 4) icon = `<path d="M${cx - 170} ${cy} H${cx + 170}" stroke="${C.muted}" stroke-width="8" stroke-dasharray="14 10"/>${K.barrier({ x: cx - 170, y: cy }, { x: cx + 170, y: cy }, { at: 0.5, len: 110 })}`;
    if (i === 5) icon = [0, 1, 2, 3].map((j) => `<path d="M${cx - 170} ${cy - 30 + j * 20} H${cx + 170}" stroke="${[C.traffic, C.forward, C.decision, VIO][j]}" stroke-width="7"/>`).join('') + `<rect x="${cx - 190}" y="${cy - 55}" width="380" height="110" rx="55" fill="none" stroke="${C.text}" stroke-width="4"/>`;
    const slot = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="none" stroke="${C.deviceEdge}" stroke-width="2" stroke-dasharray="8 10" opacity="0.6"/>`;
    out += slot + K.g(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#0C1427" stroke="${active ? caps[i][1] : C.deviceEdge}" stroke-width="${active ? 3 : 2}"/><clipPath id="rv${i}"><rect x="${x}" y="${y}" width="${w}" height="${h - 70}" rx="22"/></clipPath><g clip-path="url(#rv${i})">${icon}</g>${K.text(cx, y + h - 34, caps[i][0], { size: 28, weight: 800, fill: caps[i][1] })}`, { opacity: on, y: 20 * (1 - on) });
  });
  return out + chapter('RÉCAP', vis(t, s0, end));
}

function shotTeaser(t, { E, S, T }) {
  const s0 = S('S12.2').start, tR = E('S12.2', 'routeur');
  const z = P(t, s0, 1.5, ease.inOut);
  let out = K.g(tri({ root: true, hosts: false, cables: { l13: { color: C.forward, width: 7 }, l23: { color: C.forward, width: 7 }, l12: { color: C.muted, width: 6, dashed: true } } }).svg, { s: mix(1, 0.35, z), ox: 960, oy: 500, x: -mix(0, 520, z) });
  const r = P(t, tR - 0.6, 1, ease.out);
  out += K.g(K.router({ x: 1300, y: 500, r: 150, label: null, color: C.traffic }) + `<circle cx="1300" cy="500" r="${240 + 20 * Math.sin(t * 3)}" fill="none" stroke="${C.traffic}" stroke-width="3" opacity="0.4" filter="url(#glow)"/>`, { opacity: r, s: mix(0.6, 1, r), ox: 1300, oy: 500 });
  const card = P(t, tR + 0.6, 0.6);
  if (card > 0) out += K.g(`<rect width="1920" height="1080" fill="#070B14" opacity="0.85"/>${K.text(960, 500, 'ÉPISODE 3', { size: 30, weight: 800, fill: C.muted, ls: 8 })}${K.text(960, 590, 'Le routage', { size: 84, weight: 800 })}${K.text(960, 650, 'comment un paquet trouve son chemin entre les réseaux', { size: 28, weight: 600, fill: C.muted })}`, { opacity: card });
  const fo = P(t, T.duration - 0.8, 0.8);
  if (fo > 0) out += `<rect width="1920" height="1080" fill="#000" opacity="${fo}"/>`;
  return out;
}

export const shots = [
  { from: 'S01.1', draw: shotHook },
  { from: 'S02.1', draw: shotMech },
  { from: 'S03.1', draw: shotMeta },
  { from: 'S03.2', draw: shotIdea },
  { from: 'S05.1', draw: shotElection },
  { from: 'S06.1', draw: shotRootPort },
  { from: 'S07.1', draw: shotDesig },
  { from: 'S08.1', draw: shotBlock },
  { from: 'S09.1', draw: shotFail },
  { from: 'S10.1', draw: shotEther },
  { from: 'S11.1', draw: shotQuiz },
  { from: 'S12.1', draw: shotRecap },
  { from: 'S12.2', draw: shotTeaser },
];
