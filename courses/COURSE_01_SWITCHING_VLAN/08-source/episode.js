// COURSE_01 · Épisode 1 — « Comment un switch sait où envoyer tes données ? »
// Every shot is a pure function of t (seconds). Beats are read from
// 05-timeline.json through E(scene, anchor) — the voice drives the picture.
import * as K from '/engine/components.js';
import { P, vis, mix, mixPt, blink, qbez, along, camera, ease, clamp } from '/engine/runtime.js';

const { C } = K;
const V10 = C.vlan[10], V20 = C.vlan[20], V30 = C.vlan[30];
const YEL = C.broadcast;

const chapter = (label, o = 1) => K.g(K.text(60, 58, label, { size: 17, weight: 700, font: C.mono, fill: C.muted, anchor: 'start', ls: 3 }), { opacity: o });
const caption = (x, y, str, o = 1, color = C.text, size = 30) => K.g(K.text(x, y, str, { size, weight: 800, fill: color }), { opacity: o });

// ============================================================ HOOK (S01)
const HOOK = (() => {
  const hosts = ['PC-B', 'PC-C', 'PC-D', 'PC-E', 'PC-F', 'PC-G', 'PC-H'];
  const pos = hosts.map((_, i) => { const k = (i - 3) / 3; return { x: 1340 + 230 * (1 - k * k), y: 150 + i * 112 }; });
  return { hosts, pos, pcA: { x: 250, y: 515 } };
})();

function shotHook(t, { E, S }) {
  const tSend = E('S01.1', 'envoie'), tSw = E('S01.2', 'switch'), tCa = E('S01.2', 'ça'), tFreeze = E('S01.2', 'Pourquoi');
  const tRewind = E('S01.3', 'apprendre'), tPlus = E('S01.3', 'plus'), tTitle = E('S01.3', 'fois');
  const rewind = P(t, tRewind, 0.6, ease.inOut);
  const ffwd = t >= tPlus;
  const green = ffwd ? P(t, tPlus, 0.3) : 0;
  const leds = (i) => (ffwd ? (i === 0 ? 'green' : 'off') : t > tCa && rewind < 1 ? 'blue' : 'off');
  const sw = K.switchDevice({
    x: 640, y: 385, w: 280, h: 260, label: 'SW1',
    ports: { left: [{ name: 'P1', led: t > tSw && rewind < 1 ? 'blue' : ffwd ? 'green' : 'off' }], right: HOOK.hosts.map((_, i) => ({ name: `P${i + 2}`, led: leds(i) })) },
  });
  const pcA = K.pc({ ...HOOK.pcA, label: 'PC-A', side: 'right', state: t < tSw && t > tSend ? 'target' : ffwd ? 'ok' : undefined });
  const pcs = HOOK.hosts.map((name, i) => K.pc({ ...HOOK.pos[i], label: name, side: 'left', scale: 0.8, state: i === 0 ? (ffwd && t > tPlus + 1.4 ? 'ok' : 'target') : undefined }));
  let out = '';
  out += K.cable(pcA.anchor, sw.port('P1'), { color: ffwd ? C.forward : C.traffic, width: 4, opacity: ffwd ? 0.9 : 0.55, glow: ffwd });
  pcs.forEach((p, i) => {
    const pulse = t > E('S01.2', 'partout') && t < E('S01.2', 'partout') + 0.5 ? 1 : 0.55;
    const isB = i === 0 && ffwd;
    out += K.cable(sw.port(`P${i + 2}`), p.anchor, { color: isB ? C.forward : C.traffic, width: 4, opacity: ffwd && !isB ? 0.25 : isB ? 0.9 : pulse, glow: isB });
  });
  out += pcA.svg + sw.svg + pcs.map((p) => p.svg).join('');
  // the original frame: PC-A → P1
  if (t < tCa && !ffwd) {
    const k = P(t, tSend, Math.max(0.6, tSw - tSend + 0.3), ease.inOut);
    const p = mixPt(pcA.anchor, sw.port('P1'), k);
    out += K.frame({ x: p.x + 20 * (1 - k), y: p.y, s: 0.6, compact: true, opacity: 1 - P(t, tCa - 0.2, 0.2) });
  }
  // seven copies, frozen at 56 % when the question lands, then rewound
  if (t >= tCa && rewind < 1) {
    const kFly = mix(0, 0.56, P(t, tCa, Math.max(0.4, tFreeze - tCa - 0.2), ease.out)) * (1 - rewind);
    pcs.forEach((p, i) => {
      const a = sw.port(`P${i + 2}`);
      const pos = K.lerp(a, p.anchor, kFly);
      if (kFly > 0.06) out += K.trail(K.lerp(a, p.anchor, Math.max(0, kFly - 0.45)), pos, { color: C.traffic, width: 7 });
      out += K.frame({ x: pos.x, y: pos.y, s: 0.54, compact: true, opacity: 1 - rewind });
    });
  }
  // flash-forward: one frame, one green path
  if (ffwd) {
    const k = P(t, tPlus, 1.4, ease.inOut);
    const p = along([pcA.anchor, sw.port('P1'), { x: 780, y: 515 }, sw.port('P2'), pcs[0].anchor], k);
    out += K.frame({ x: p.x, y: p.y, s: 0.54, compact: true, color: C.forward, opacity: 1 - P(t, tPlus + 1.5, 0.3) });
  }
  const bub = vis(t, tSw, tRewind);
  out += K.g(K.thoughtBubble({ x: 780, y: 270, str: 'Destination inconnue ?', color: C.decision, tail: { x: 780, y: 378 } }), { opacity: bub, s: mix(0.85, 1, bub), ox: 780, oy: 300 });
  out += K.g(K.counter({ x: 1740, y: 150, value: '×7', label: 'COPIES', color: C.traffic }), { opacity: vis(t, tFreeze - 0.2, tRewind) });
  if (ffwd) out += K.g(K.pill(1740, 140, 'LA PROCHAINE FOIS', { color: C.forward, size: 18 }), { opacity: vis(t, tPlus, S('S02.1').start - 0.4) });
  // freeze: the world dims slightly around the switch
  const fz = vis(t, tFreeze - 0.2, tRewind, 0.25) * 0.35;
  if (fz > 0) out += `<rect width="1920" height="1080" fill="url(#vign)" opacity="${fz}"/>`;
  out += K.g(K.text(60, 1010, 'Comment un switch sait où envoyer tes données ?', { size: 26, weight: 700, anchor: 'start', fill: C.text }), { opacity: vis(t, tTitle + 0.3, S('S02.1').start - 0.3) });
  // exit: push into the switch
  const push = P(t, S('S02.1').start - 0.9, 0.9, ease.inOut);
  return camera({ x: mix(960, 780, push), y: mix(540, 515, push), s: mix(1, 1.35, push) }, `<defs><radialGradient id="vign" cx="0.42" cy="0.48" r="0.75"><stop offset="0.35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="1"/></radialGradient></defs>${out}`);
}

// ============================================================ PROBLEM (S02)
function shotProblem(t, { E, S }) {
  const s0 = S('S02.1').start;
  const tPorts = E('S02.1', 'ports'), tDoors = E('S02.1', 'portes'), tQ = E('S02.1', 'choisir');
  const tTable = E('S02.2', 'table'), tVide = E('S02.2', 'vide'), tLit = E('S02.2', 'lit');
  const X = 560, Y = 300, W = 800, H = 330;
  const ports = Array.from({ length: 8 }, (_, i) => ({ name: `P${i + 1}`, led: t > tPorts + i * 0.08 && t < tTable ? 'blue' : 'off' }));
  const sw = K.switchDevice({ x: X, y: Y, w: W, h: H, label: 'SW1', ports: { bottom: ports } });
  let out = sw.svg;
  const cut = P(t, tTable, 0.6);
  // cutaway: the front becomes glass, the brain appears
  if (cut > 0) out += `<rect x="${X + 6}" y="${Y + 6}" width="${W - 12}" height="${H - 12}" rx="18" fill="#070D1A" opacity="${0.92 * cut}"/>`;
  const doorK = vis(t, tDoors, tQ + 0.2, 0.3);
  ports.forEach((p, i) => {
    const a = sw.port(p.name);
    if (doorK > 0) out += K.g(K.door(a.x, a.y + 100, 64, C.traffic), { opacity: doorK });
    const q = vis(t, tQ + i * 0.07, tTable, 0.25);
    if (q > 0) out += K.g(K.text(a.x, a.y + (doorK > 0 ? 150 : 70), '?', { size: 40, weight: 800, fill: C.decision }), { opacity: q });
  });
  // the frame waiting at the door
  const fin = P(t, s0, 0.6);
  const zoom = P(t, tLit, Math.max(0.6, S('S03.1').start - tLit - 0.2), ease.inOut);
  const fx = mix(mix(120, 330, fin), 960, zoom), fy = mix(900, 540, zoom);
  if (cut > 0) {
    const tb = K.macTable({ x: 960 - 230, y: Y + 30, w: 460, slots: 3, title: 'TABLE MAC · SW1', rowH: 52 });
    out += K.g(tb.svg, { opacity: cut * (1 - zoom) });
    const pulse = t > tVide && t < tVide + 0.6 ? 1 + 0.03 * Math.sin((t - tVide) * 20) : 1;
    if (pulse !== 1) out = out.replace(tb.svg, K.g(tb.svg, { s: pulse, ox: 960, oy: Y + 150 }));
    out += K.g(K.pill(960, Y + H + 60, 'VIDE', { color: C.muted, size: 20 }), { opacity: vis(t, tVide, tLit) });
  }
  out += K.g(K.frame({ x: fx, y: fy, s: mix(1, 3.2, zoom), compact: zoom < 0.5 }), { opacity: fin });
  return out;
}

// ============================================================ THE FRAME (S03)
function bigEnvelope(t, { hiDst, hiSrc, hiData, dimData, s = 1, x = 960, y = 470, srcText = 'AA:AA' }) {
  const w = 900 * s, h = 360 * s, X = x - w / 2, Y = y - h / 2;
  const out = [`<rect x="${X}" y="${Y}" width="${w}" height="${h}" rx="${30 * s}" fill="${C.traffic}" opacity="0.18" filter="url(#glowSoft)"/>`,
    `<rect x="${X}" y="${Y}" width="${w}" height="${h}" rx="${30 * s}" fill="#0B1426" stroke="${C.traffic}" stroke-width="${4 * s}"/>`,
    `<path d="M${X + 30 * s} ${Y + 26 * s} L${x} ${Y + 110 * s} L${X + w - 30 * s} ${Y + 26 * s}" fill="none" stroke="${C.traffic}" stroke-opacity="0.5" stroke-width="${4 * s}" stroke-linejoin="round"/>`];
  const f = (fx, fw, lab, val, hk, color) => {
    out.push(`<rect x="${fx}" y="${Y + 140 * s}" width="${fw}" height="${170 * s}" rx="${14 * s}" fill="${color}" fill-opacity="${0.08 + 0.22 * hk}" stroke="${color}" stroke-opacity="${0.35 + 0.65 * hk}" stroke-width="${(2 + 2 * hk) * s}" ${hk > 0.5 ? 'filter="url(#glow)"' : ''}/>`);
    out.push(K.text(fx + fw / 2, Y + 190 * s, lab, { size: 22 * s, weight: 800, fill: color, ls: 3, opacity: 0.5 + 0.5 * hk }));
    if (val) out.push(K.text(fx + fw / 2, Y + 262 * s, val, { size: 52 * s, weight: 700, font: C.mono, opacity: 0.45 + 0.55 * hk }));
  };
  f(X + 40 * s, 300 * s, 'DESTINATION MAC', 'BB:BB', hiDst, C.traffic);
  f(X + 360 * s, 300 * s, 'SOURCE MAC', srcText, hiSrc, C.traffic);
  f(X + 680 * s, 180 * s, 'DATA', '', hiData, C.muted);
  for (let i = 0; i < 4; i++) out.push(`<rect x="${X + 710 * s}" y="${Y + (222 + i * 20) * s}" width="${(i === 3 ? 60 : 120) * s}" height="${9 * s}" rx="${4 * s}" fill="${C.muted}" opacity="${(0.25 + 0.5 * hiData) * (1 - 0.6 * dimData)}"/>`);
  if (dimData > 0) out.push(K.g(K.eyeSlash(X + 770 * s, Y + 262 * s), { opacity: dimData }));
  return { svg: out.join(''), X, Y, w, h };
}

function shotFrame(t, { E, S }) {
  const s1 = S('S03.1').start;
  const tTrame = E('S03.1', 'trame'), tDst = E('S03.1', 'destination'), tSrc = E('S03.1', 'source'), tData = E('S03.1', 'données'), tLit = E('S03.1', 'lit');
  const tMac = E('S03.2', 'MAC'), tCard = E('S03.2', 'carte'), t48 = E('S03.2', 'quarante-huit'), tAbr = E('S03.2', 'abréger'), tHead = E('S03.2', "l'en-tête"), tBye = E('S03.2', 'besoin');
  const end = S('S04.1').start;
  const lift = P(t, tCard, 0.7, ease.inOut) * (1 - P(t, tHead, 0.6, ease.inOut));
  const out = [];
  const envS = mix(1, 0.78, lift), envY = mix(470, 330, lift);
  const hiMac = vis(t, tMac, tCard + 1.2);
  const env = bigEnvelope(t, {
    s: envS, y: envY,
    hiDst: Math.max(vis(t, tDst, tSrc), hiMac, vis(t, tHead, tBye)),
    hiSrc: Math.max(vis(t, tSrc, tData), hiMac, vis(t, tHead, tBye)),
    hiData: vis(t, tData, tLit + 0.6),
    dimData: P(t, tLit, 0.4),
  });
  out.push(env.svg);
  out.push(K.g(K.text(960, env.Y - 36, 'TRAME ETHERNET', { size: 30, weight: 800, ls: 6 }), { opacity: vis(t, tTrame, tCard) }));
  const cap = (a, b, str, x) => K.g(K.text(x, env.Y + env.h + 56, str, { size: 30, weight: 700, fill: C.text }), { opacity: vis(t, a, b) });
  out.push(cap(tDst, tSrc, 'à qui ?', env.X + 190 * envS));
  out.push(cap(tSrc, tData, 'qui envoie ?', env.X + 510 * envS));
  out.push(cap(tData, tMac, 'le contenu', env.X + 770 * envS));
  // header bracket over DST + SRC
  const hk = vis(t, tHead, tBye);
  if (hk > 0) {
    const x0 = env.X + 40 * envS, x1 = env.X + 660 * envS, yb = env.Y + 120 * envS;
    out.push(K.g(`<path d="M${x0} ${yb + 12} V${yb} H${x1} V${yb + 12}" fill="none" stroke="${C.decision}" stroke-width="4"/>${K.pill((x0 + x1) / 2, yb - 26, 'EN-TÊTE ETHERNET', { color: C.decision, size: 20 })}`, { opacity: hk }));
  }
  // network card with the full 48-bit address
  const card = vis(t, tCard, tHead);
  if (card > 0) {
    const cx = 960, cy = 800, abr = P(t, tAbr, 0.7, ease.inOut);
    out.push(K.g(`
      <rect x="${cx - 360}" y="${cy - 110}" width="720" height="200" rx="18" fill="#0E1A2C" stroke="${C.deviceEdge}" stroke-width="3"/>
      ${Array.from({ length: 12 }, (_, i) => `<rect x="${cx - 330 + i * 30}" y="${cy + 90}" width="18" height="22" fill="#C9A227" opacity="0.7"/>`).join('')}
      <rect x="${cx - 330}" y="${cy - 80}" width="120" height="120" rx="10" fill="#1A2336" stroke="${C.deviceEdge}" stroke-width="2"/>
      ${K.text(cx - 270, cy - 5, 'NIC', { size: 22, weight: 800, fill: C.muted, ls: 3 })}
      ${K.text(cx - 180, cy - 58, 'CARTE RÉSEAU · PC-A', { size: 18, weight: 700, fill: C.muted, anchor: 'start', ls: 2 })}
      ${K.g(K.text(cx + 60, cy + 14, 'AAAA.AAAA.AAAA', { size: 46, weight: 700, font: C.mono }), { opacity: 1 - abr })}
      ${K.g(K.text(cx + 60, cy + 14, 'AA:AA', { size: 54, weight: 700, font: C.mono, fill: C.traffic }), { opacity: abr })}
      ${K.g(`<path d="M${cx - 150} ${cy + 36} q0 16 16 16 H${cx + 254} q16 0 16 -16" fill="none" stroke="${C.decision}" stroke-width="3"/>${K.text(cx + 60, cy + 82, '48 bits', { size: 24, weight: 800, fill: C.decision })}`, { opacity: vis(t, t48, tAbr) })}
      ${K.g(K.text(cx + 60, cy + 82, 'on abrège : AA:AA', { size: 22, weight: 700, fill: C.traffic }), { opacity: P(t, tAbr + 0.4, 0.4) })}
    `, { opacity: card, y: 30 * (1 - card) }));
  }
  const exitK = P(t, tBye, Math.max(0.7, end - tBye - 0.1), ease.inOut);
  // exit: the envelope shrinks back to PC-A's position of the next shot
  return K.g(out.join(''), { s: mix(1, 0.23, exitK), x: mix(0, 240 - 960 * 0.23, exitK), y: mix(0, 540 - 470 * 0.23, exitK) }) + chapter('01 · LA TRAME', vis(t, s1, tBye));
}

// ============================================================ BENCH (S04–S06)
const B = {
  sw: { x: 540, y: 410, w: 280, h: 260 },
  pcA: { x: 150, y: 540 },
  hosts: ['PC-B', 'PC-C', 'PC-D', 'PC-E'].map((n, i) => ({ name: n, mac: `${n[3]}${n[3]}:${n[3]}${n[3]}`, x: 1090, y: 290 + i * 160 })),
  table: { x: 1340, y: 330, w: 480 },
};

function bench(st = {}) {
  const led = st.leds || {};
  const sw = K.switchDevice({
    ...B.sw, label: 'SW1',
    ports: {
      left: [{ name: 'P1', led: led.P1 }],
      right: ['P2', 'P3', 'P4', 'P5'].map((n) => ({ name: n, led: led[n] })),
    },
  });
  const pcA = K.pc({ ...B.pcA, label: 'PC-A', mac: 'AA:AA', side: 'right', state: (st.pc || {})['PC-A'] });
  const hosts = B.hosts.map((h) => K.pc({ x: h.x, y: h.y, label: h.name, mac: h.mac, side: 'left', scale: 0.9, state: (st.pc || {})[h.name], dim: (st.dim || {})[h.name] }));
  const table = K.macTable({ ...B.table, slots: 5, rows: st.rows || [] });
  const cab = st.cables || {};
  let out = '';
  out += K.cable(pcA.anchor, sw.port('P1'), { width: 4, color: C.deviceEdge, ...(cab.P1 || {}) });
  hosts.forEach((h, i) => { out += K.cable(sw.port(`P${i + 2}`), h.anchor, { width: 4, color: C.deviceEdge, ...(cab[`P${i + 2}`] || {}) }); });
  out += pcA.svg + sw.svg + hosts.map((h) => h.svg).join('');
  out += K.g(table.svg, { opacity: st.tableOpacity ?? 1 });
  return { svg: out, sw, pcA, hosts, table };
}
// geometry is state-independent: compute once
const BG = bench();
const port = (n) => BG.sw.port(n);
const hostA = (i) => BG.hosts[i].anchor;
const rowAt = (i) => BG.table.rows[i];
const macCell = (i) => ({ x: B.table.x + B.table.w * 0.75, y: rowAt(i).cy });
const SWC = { x: B.sw.x + B.sw.w / 2, y: B.sw.y + B.sw.h / 2 };

function chip(p, label, value, color, o = 1) {
  return K.g(`<g filter="url(#glow)"><rect x="${p.x - 70}" y="${p.y - 28}" width="140" height="56" rx="10" fill="#0B1A22" stroke="${color}" stroke-width="3"/></g>
    ${K.text(p.x, p.y - 7, label, { size: 12, weight: 800, fill: color, ls: 2 })}${K.text(p.x, p.y + 18, value, { size: 23, weight: 700, font: C.mono })}`, { opacity: o });
}

function rulePanel(t, tIn1, tIn2, tDock) {
  const d = P(t, tDock, 0.7, ease.inOut);
  const x = mix(960, 250, d), y = mix(150, 118, d), s = mix(1, 0.5, d);
  const l1 = P(t, tIn1, 0.4), l2 = P(t, tIn2, 0.4);
  if (l1 <= 0) return '';
  const body = `<rect x="${x - 360}" y="${y - 70}" width="720" height="140" rx="18" fill="#0C1427" fill-opacity="0.94" stroke="${C.deviceEdge}" stroke-width="2"/>
    ${K.g(K.text(x - 320, y - 12, 'SOURCE → apprendre', { size: 38, weight: 800, fill: C.forward, anchor: 'start' }), { opacity: l1 })}
    ${K.g(K.text(x - 320, y + 46, 'DESTINATION → décider', { size: 38, weight: 800, fill: C.decision, anchor: 'start' }), { opacity: l2 })}`;
  return K.g(body, { s, ox: x, oy: y });
}

function shotBench(t, tl) {
  const { E, Wd, S } = tl;
  const s4 = S('S04.1').start;
  // ---- beats
  const b = {
    cinq: E('S04.1', 'Cinq'), un: E('S04.1', 'un'), deux: E('S04.1', 'deux'), envoie: E('S04.1', 'envoie'), entre: E('S04.1', 'entre'),
    source: E('S04.2', 'source'), note: E('S04.2', 'note'), portL: E('S04.2', 'port'), appr: E('S04.2', "l'apprentissage"), parle: E('S04.2', 'parle'),
    piege: E('S04.3', 'piège'), dest: E('S04.3', 'destination'), non: E('S04.3', 'Non'), veut: E('S04.3', 'veut'), rApp: E('S04.3', 'apprend'), rDec: E('S04.3', 'décide'),
    s51: S('S05.1').start, cherche: E('S05.1', 'cherche'), rien: E('S05.1', 'Rien'),
    copie: E('S05.2', 'copie'), autres: E('S05.2', 'autres'), sauf: E('S05.2', 'Sauf'), flood: E('S05.2', 'flooding'), lisent: E('S05.2', 'lisent'), jettent: E('S05.2', 'jettent'), garde: E('S05.2', 'garde'),
    repond: E('S05.3', 'répond'), deux2: E('S05.3', 'deux'), app2: E('S05.3', 'apprend'), aa: E('S05.3', 'A-A'), connait: E('S05.3', 'connaît'), sortie: E('S05.3', 'sortie'),
    end: S('S05.4').start,
  };
  // ---- table rows
  const rows = [];
  const r1Land = b.note + 0.8, r2Land = b.app2 + 0.8;
  if (t >= b.note) rows[0] = t < r1Land ? { cells: ['P1', null], state: 'ghost' } : { cells: ['P1', 'AA:AA'], state: t < b.s51 ? 'new' : (t >= b.connait ? 'hit' : undefined) };
  if (t >= b.app2) rows[1] = t < r2Land ? { cells: ['P2', null], state: 'ghost' } : { cells: ['P2', 'BB:BB'], state: t < b.aa ? 'new' : undefined };
  // ---- leds, cables, pcs
  const leds = {};
  const cables = {};
  const pc = {};
  const dim = {};
  if (t > b.entre && t < b.copie + 0.3) leds.P1 = 'blue';
  const flooding = t > b.autres && t < b.repond;
  if (flooding) ['P2', 'P3', 'P4', 'P5'].forEach((n) => { leds[n] = 'blue'; cables[n] = { color: C.traffic, opacity: 0.8 }; });
  if (t > b.envoie && t < b.copie) cables.P1 = { color: C.traffic, opacity: 0.9 };
  if (t > b.un && t < b.envoie + 0.3) pc['PC-A'] = 'target';
  if (t > b.deux && t < b.envoie + 0.3) pc['PC-B'] = 'target';
  if (t > b.garde) pc['PC-B'] = 'ok';
  if (t > b.jettent) ['PC-C', 'PC-D', 'PC-E'].forEach((n) => { dim[n] = t < b.repond; });
  if (t > b.repond) { leds.P2 = t > b.deux2 ? 'blue' : undefined; cables.P2 = { color: C.traffic, opacity: 0.9 }; pc['PC-B'] = undefined; }
  if (t > b.sortie) { leds.P1 = 'green'; leds.P2 = 'green'; cables.P1 = { color: C.forward, glow: true }; cables.P2 = { color: C.forward, glow: true }; }
  if (t > b.sortie + 1.3) pc['PC-A'] = 'ok';

  const base = bench({ rows, leds, cables, pc, dim, tableOpacity: P(t, s4, 0.5) });
  let out = base.svg;
  // port name emphasis
  ['P1', 'P2', 'P3', 'P4', 'P5'].forEach((n, i) => {
    const k = vis(t, b.cinq + i * 0.12, b.cinq + i * 0.12 + 0.5, 0.15);
    if (k > 0) out += K.ring(port(n).x, port(n).y, 20, C.traffic, k);
  });
  if (t > b.un && t < b.envoie) out += K.ring(port('P1').x, port('P1').y, 22, C.traffic, 0.8);
  if (t > b.deux && t < b.envoie) out += K.ring(port('P2').x, port('P2').y, 22, C.traffic, 0.8);
  if (t > b.entre && t < b.entre + 0.8) out += K.ring(port('P1').x, port('P1').y, 20 + 30 * P(t, b.entre, 0.8), C.traffic, 1 - P(t, b.entre, 0.8));

  // ---- the first frame A → B
  const fAtP1 = { x: port('P1').x - 102, y: 540 };
  if (t < b.copie + 0.15) {
    const k1 = P(t, b.envoie, Math.max(0.5, b.entre - b.envoie), ease.inOut);
    const p = { x: mix(262, fAtP1.x, k1), y: 540 };
    const srcGone = t >= b.note;
    const dstHi = t > b.piege && t < b.rApp ? blink(t, b.piege, 6, 0.4) : 0;
    const f = K.frame({
      x: p.x, y: p.y, s: 1.05, srcEmpty: srcGone && t < b.cherche, opacity: 1 - P(t, b.copie, 0.15),
      hi: { src: t > b.source && t < b.note ? '#FFFFFF' : undefined, dst: dstHi > 0.5 ? C.decision : (t > b.cherche && t < b.copie ? C.decision : undefined) },
    });
    out += f.svg;
    // source MAC flight into the table
    if (t >= b.note && t < r1Land + 0.1) {
      const a = { x: fAtP1.x + 19, y: 540 + 11 }, c = { x: 950, y: 60 }, e = macCell(0);
      const k = P(t, b.note, 0.8, ease.inOut);
      const pts = Array.from({ length: 12 }, (_, i) => qbez(a, c, e, Math.max(0, k - 0.22 + i * 0.02)));
      out += `<polyline points="${pts.map((q) => `${q.x},${q.y}`).join(' ')}" fill="none" stroke="${C.forward}" stroke-width="6" stroke-linecap="round" opacity="0.45"/>`;
      out += chip(qbez(a, c, e, k), 'SRC', 'AA:AA', mix(0, 1, clamp(k * 3)) > 0.5 ? C.forward : C.traffic);
    }
    // destination tries to get in and bounces
    if (t >= b.non && t < b.non + 1.1) {
      const a = { x: fAtP1.x - 53, y: 551 }, e = { x: B.table.x - 60, y: rowAt(1).cy };
      const go = P(t, b.non, 0.45, ease.in), back = P(t, b.non + 0.45, 0.55, ease.out);
      const p2 = mixPt(mixPt(a, e, go), a, back);
      out += chip(p2, 'DST', 'BB:BB', C.error, 1 - P(t, b.non + 0.9, 0.2));
    }
    if (t > b.piege && t < b.non) out += K.g(K.text(fAtP1.x - 53, 470, '?', { size: 54, weight: 800, fill: C.decision }), { opacity: P(t, b.piege, 0.3) });
  }
  // the port and the new row pulse together: "AA:AA lives behind P1"
  const link = vis(t, b.portL, b.appr + 0.6);
  if (link > 0) out += K.ring(port('P1').x, port('P1').y, 24, C.forward, link) + `<rect x="${rowAt(0).x - 6}" y="${rowAt(0).y - 6}" width="${rowAt(0).w + 12}" height="${rowAt(0).h + 12}" rx="12" fill="none" stroke="${C.forward}" stroke-width="3" opacity="${link}" filter="url(#glow)"/>`;
  out += K.g(K.pill(B.table.x, B.table.y - 34, 'LEARNING', { color: C.forward, anchor: 'start', size: 17, filled: true }), { opacity: Math.max(vis(t, b.appr, b.s51), vis(t, b.app2, b.aa)) });
  if (t > b.parle && t < b.piege) out += K.g(K.pill(150, 420, 'qui parle ?', { color: C.forward, size: 18 }), { opacity: vis(t, b.parle, b.piege - 0.2) });
  // NON stamp + "where it wants to go"
  out += K.stamp(B.table.x + 240, B.table.y + 360, 'NON', { opacity: vis(t, b.non + 0.35, b.rApp + 0.8), s: mix(1.4, 1, P(t, b.non + 0.35, 0.25)) });
  if (t > b.veut && t < b.s51) {
    const k = P(t, b.veut, 0.6);
    out += K.arrow({ x: fAtP1.x - 40, y: 590 }, mixPt({ x: fAtP1.x - 40, y: 590 }, { x: 960, y: 930 }, k), { color: C.decision, dash: '10 8', width: 4, opacity: vis(t, b.veut, b.s51 - 0.3) });
    out += K.g(K.text(990, 960, 'où elle veut aller… pas où est B', { size: 24, weight: 700, fill: C.decision, anchor: 'start' }), { opacity: vis(t, b.veut + 0.4, b.s51 - 0.3) });
  }
  out += rulePanel(t, b.rApp, b.rDec, b.s51 - 0.4);

  // ---- lookup miss
  const scan = (tStart, key, rowsN) => {
    if (t < tStart || t > tStart + 1.2) return '';
    const k = P(t, tStart + 0.2, 0.6, ease.lin);
    const y = mix(rowAt(0).y, rowAt(Math.max(0, rowsN - 1)).y + rowAt(0).h, k);
    return K.g(`<rect x="${B.table.x + 16}" y="${y - 3}" width="${B.table.w - 32}" height="6" rx="3" fill="${C.decision}" filter="url(#glow)"/>`, { opacity: vis(t, tStart, tStart + 1, 0.15) });
  };
  out += K.g(K.pill(B.table.x - 18, rowAt(0).cy, 'BB:BB ?', { color: C.decision, size: 20, anchor: 'end', mono: true }), { opacity: vis(t, b.cherche, b.copie) });
  out += scan(b.cherche, 'BB:BB', 2);
  out += K.g(K.banner(B.table.x + B.table.w / 2, rowAt(2).cy + 10, 'LOOKUP MISS', { color: C.error, size: 28 }), { opacity: vis(t, b.rien, b.copie + 0.3) * blink(t, b.rien, 3, 0.3) });

  // ---- flooding
  if (t >= b.copie && t < b.repond + 0.2) {
    const k = P(t, b.autres, Math.max(0.8, Math.min(1.6, b.lisent - b.autres)), ease.inOut);
    B.hosts.forEach((h, i) => {
      const a = port(`P${i + 2}`), e = hostA(i);
      const spawn = P(t, b.copie, 0.25);
      const p = mixPt(mixPt(SWC, a, spawn), e, k);
      const isB = i === 0;
      const gone = isB ? P(t, b.garde, 0.4) : P(t, b.jettent, 0.6);
      if (k > 0.05 && k < 1) out += K.trail(mixPt(a, e, Math.max(0, k - 0.4)), p, { color: C.traffic, width: 6 });
      const fp = k >= 1 ? { x: e.x - 70, y: e.y } : p;
      out += K.frame({ x: fp.x, y: fp.y, s: 0.55, compact: true, opacity: spawn * (1 - gone) });
      if (!isB) out += K.particles(fp.x, fp.y, P(t, b.jettent, 0.9, ease.lin), C.traffic, { seed: i + 3 });
      // destination check next to each host
      const ck = vis(t, b.lisent + i * 0.12, b.repond);
      if (ck > 0) out += K.g(`${K.text(e.x + 108, e.y + 2, isB ? 'BB:BB = moi ✓' : `BB:BB ≠ ${h.mac}`, { size: 18, weight: 700, font: C.mono, fill: isB ? C.forward : C.muted, anchor: 'start' })}`, { opacity: ck });
      if (!isB) out += K.g(K.text(e.x + 108, e.y + 28, 'pas pour moi → jetée', { size: 16, weight: 600, fill: C.muted, anchor: 'start' }), { opacity: vis(t, b.jettent, b.repond) });
    });
    out += K.g(K.lock(port('P1').x - 40, port('P1').y - 44, "port d'entrée"), { opacity: vis(t, b.sauf, b.repond) });
    out += K.g(K.text(870, 250, 'FLOODING', { size: 44, weight: 800, fill: C.traffic, ls: 6 }), { opacity: vis(t, b.flood, b.repond), s: mix(0.9, 1, P(t, b.flood, 0.4)), ox: 870, oy: 250 });
  }

  // ---- the reply B → A
  if (t >= b.repond) {
    const k1 = P(t, b.repond, Math.max(0.5, b.deux2 - b.repond), ease.inOut);
    const k2 = P(t, b.sortie, 1.3, ease.inOut);
    const pAtP2 = mixPt(hostA(0), port('P2'), 0.62);
    let p = mixPt(hostA(0), pAtP2, k1);
    if (k2 > 0) p = along([pAtP2, port('P2'), SWC, port('P1'), { x: 262, y: 540 }], k2);
    const f = K.frame({ x: p.x, y: p.y, s: 0.8, dst: 'AA:AA', src: 'BB:BB', srcEmpty: t > b.app2 && t < b.aa, color: k2 > 0 ? C.forward : C.traffic, opacity: 1 - P(t, b.sortie + 1.3, 0.3) });
    out += f.svg;
    if (t >= b.app2 && t < r2Land + 0.1) {
      const a = f.srcField, c = { x: 1300, y: 120 }, e = macCell(1);
      const k = P(t, b.app2, 0.8, ease.inOut);
      out += chip(qbez(a, c, e, k), 'SRC', 'BB:BB', C.forward);
    }
    out += K.g(K.pill(B.table.x - 18, rowAt(0).cy, 'AA:AA ?', { color: C.decision, size: 20, anchor: 'end', mono: true }), { opacity: vis(t, b.aa, b.sortie + 1) });
    out += scan(b.aa, 'AA:AA', 1);
    out += K.g(K.banner(B.table.x + B.table.w / 2, rowAt(2).cy + 10, 'LOOKUP HIT → P1', { color: C.decision, size: 26 }), { opacity: vis(t, b.connait, b.end) });
  }
  const ch = t < b.s51 ? '02 · APPRENTISSAGE' : '03 · INCONNUE ? INONDATION';
  return out + chapter(ch, vis(t, s4, b.end));
}

// ---- split screen helpers
function miniFlood(t, t0, { learned = false, color = C.traffic, dst = 'BB:BB', rings = false, loop = 0 } = {}) {
  // returns a full-size bench scene (to be scaled) showing one flood or one forward
  const tt = loop ? t0 + ((t - t0) % loop) : t;
  const k = P(tt, t0, 1.1, ease.inOut);
  const rows = learned ? [{ cells: ['P1', 'AA:AA'] }, { cells: ['P2', 'BB:BB'], state: k > 0 && k < 1 ? 'hit' : undefined }] : [];
  const cab = {};
  const out = [];
  if (learned) { cab.P2 = { color: C.forward, glow: true }; cab.P1 = { color: C.forward }; }
  else ['P2', 'P3', 'P4', 'P5'].forEach((n) => { cab[n] = { color, opacity: 0.8 }; });
  const base = bench({ rows, cables: cab, pc: rings && k > 0.9 ? { 'PC-B': 'bcast', 'PC-C': 'bcast', 'PC-D': 'bcast', 'PC-E': 'bcast' } : {} });
  out.push(base.svg);
  if (tt >= t0) {
    (learned ? [0] : [0, 1, 2, 3]).forEach((i) => {
      const p = mixPt(port(`P${i + 2}`), hostA(i), k);
      out.push(K.frame({ x: p.x, y: p.y, s: 0.6, compact: true, color: learned ? C.forward : color, opacity: 1 - P(tt, t0 + 1.2, 0.3) }));
    });
    if (rings) for (let r = 0; r < 3; r++) { const q = P(tt, t0 + r * 0.25, 1.0, ease.lin); if (q > 0 && q < 1) out.push(K.ring(SWC.x, SWC.y, 60 + q * 420, YEL, (1 - q) * 0.8, 4)); }
  }
  return out.join('');
}

function shotSplit(t, { E, S }) {
  const s0 = S('S05.4').start;
  const tFleche = E('S05.4', 'flèche'), tFl = E('S05.4', "n'inonde");
  const L = K.g(miniFlood(t, s0 + 0.2, { loop: 2.0 }), { s: 0.5, x: 0, y: 215 });
  const R = K.g(miniFlood(t, tFleche, { learned: true }), { s: 0.5, x: 960, y: 215 });
  return `${L}${R}<path d="M960 250 V900" stroke="${C.deviceEdge}" stroke-width="2"/>
    ${caption(480, 290, 'AVANT', 1, C.muted, 36)}${caption(1440, 290, 'APRÈS', 1, C.forward, 36)}
    ${caption(480, 820, '4 copies', vis(t, tFl - 0.4), C.traffic, 44)}${caption(1440, 820, '1 seule', vis(t, tFl), C.forward, 44)}`;
}

// ============================================================ BROADCAST (S06)
function shotBroadcast(t, { E, S }) {
  const s0 = S('S06.1').start;
  const tTout = E('S06.1', 'tout'), tIP = E('S06.1', 'IP'), tF = E('S06.1', 'F'), tBc = E('S06.1', 'broadcast'), tSend = E('S06.1', "l'envoie"), tLit = E('S06.1', 'lit');
  const end = S('S06.2').start;
  const k = P(t, tSend, 0.7, ease.inOut), k2 = P(t, tSend + 0.7, Math.max(0.8, Math.min(1.4, tLit - tSend - 0.7)), ease.inOut);
  const pc = t > tLit ? { 'PC-B': 'bcast', 'PC-C': 'bcast', 'PC-D': 'bcast', 'PC-E': 'bcast' } : {};
  const cab = {};
  if (t > tSend) cab.P1 = { color: YEL, opacity: 0.8 };
  if (t > tSend + 0.7) ['P2', 'P3', 'P4', 'P5'].forEach((n) => { cab[n] = { color: YEL, opacity: 0.8 }; });
  const base = bench({ rows: [{ cells: ['P1', 'AA:AA'] }, { cells: ['P2', 'BB:BB'] }], pc, cables: cab });
  let out = base.svg;
  const fA = { x: mix(262, port('P1').x - 102, k), y: 540 };
  if (t < tSend + 0.75) out += K.frame({ x: fA.x, y: fA.y, s: 1.05, dst: 'FF:FF', color: YEL, opacity: P(t, s0, 0.3) * (1 - P(t, tSend + 0.6, 0.15)), hi: { dst: t > tF ? YEL : undefined } }).svg;
  if (t > tSend + 0.6) {
    for (let r = 0; r < 3; r++) { const q = P(t, tSend + 0.6 + r * 0.3, 1.2, ease.lin); if (q > 0 && q < 1) out += K.ring(SWC.x, SWC.y, 80 + q * 480, YEL, (1 - q) * 0.8, 5); }
    B.hosts.forEach((h, i) => {
      const p = mixPt(port(`P${i + 2}`), hostA(i), k2);
      out += K.frame({ x: p.x, y: p.y, s: 0.55, compact: true, color: YEL, opacity: 1 - P(t, tLit + 0.2, 0.4) });
    });
    out += K.g(K.lock(port('P1').x - 40, port('P1').y - 44, "port d'entrée"), { opacity: vis(t, tSend + 0.7, end) });
  }
  if (t > tLit) B.hosts.forEach((h, i) => { out += K.g(K.text(hostA(i).x + 108, hostA(i).y + 8, 'lue ✓', { size: 22, weight: 800, fill: YEL, anchor: 'start' }), { opacity: P(t, tLit + i * 0.1, 0.3) }); });
  // megaphone + ARP-like question
  out += K.g(K.pill(150, 410, '📢  à tout le monde', { color: YEL, size: 18 }), { opacity: vis(t, tTout, tF) });
  out += K.g(K.thoughtBubble({ x: 330, y: 330, str: 'Qui a 10.0.0.2 ?', color: YEL, size: 24, tail: { x: 200, y: 440 } }), { opacity: vis(t, tIP, tSend) });
  // zoom panel on the destination
  const z = vis(t, tF, tSend + 0.2);
  if (z > 0) out += K.g(`<rect x="560" y="120" width="800" height="200" rx="22" fill="#141206" stroke="${YEL}" stroke-width="3"/>
      ${K.text(960, 180, 'MAC DESTINATION', { size: 22, weight: 800, fill: YEL, ls: 4 })}
      ${K.text(960, 262, 'FFFF.FFFF.FFFF', { size: 68, weight: 700, font: C.mono, fill: YEL })}`, { opacity: z, s: mix(0.9, 1, z), ox: 960, oy: 220 });
  out += K.g(K.pill(960, 360, 'BROADCAST', { color: YEL, size: 30, filled: true }), { opacity: vis(t, tBc, tSend + 0.4) });
  return out + chapter('04 · BROADCAST', vis(t, s0, end));
}

function shotCompare(t, { E, S }) {
  const tIgn = E('S06.2', 'ignorance'), tDis = E('S06.2', 'disparaît'), tNat = E('S06.2', 'nature'), tFois = E('S06.2', 'fois');
  const learned = t > tDis;
  const L = K.g(miniFlood(t, learned ? tDis + 0.2 : tIgn, { learned }), { s: 0.5, x: 0, y: 215 });
  const lastPulse = t > tNat ? tNat + Math.floor((t - tNat) / 1.4) * 1.4 : tNat;
  const R = K.g(miniFlood(t, lastPulse, { color: YEL, dst: 'FF:FF', rings: true }), { s: 0.5, x: 960, y: 215 });
  return `${L}${R}<path d="M960 250 V900" stroke="${C.deviceEdge}" stroke-width="2"/>
    ${caption(480, 290, 'UNKNOWN UNICAST', 1, C.traffic, 36)}${caption(1440, 290, 'BROADCAST', 1, YEL, 36)}
    ${caption(480, 810, 'par ignorance', vis(t, tIgn), C.text, 34)}${caption(480, 860, 'disparaît après apprentissage', vis(t, tDis), C.forward, 28)}
    ${caption(1440, 810, 'par nature', vis(t, tNat), C.text, 34)}${caption(1440, 860, 'toujours inondée', vis(t, tFois), YEL, 28)}`;
}

// ============================================================ VLAN (S07)
const VL = (() => {
  const sw = { x: 360, y: 470, w: 1200, h: 140 };
  const cols = Array.from({ length: 9 }, (_, i) => sw.x + (sw.w * (i + 1)) / 10);
  const team = (i) => (i < 3 ? 10 : i < 6 ? 20 : 30);
  const pcs = [];
  cols.forEach((x, i) => { pcs.push({ x, y: 250, side: 'bottom', col: i, vlan: team(i), top: true }); pcs.push({ x, y: 850, side: 'top', col: i, vlan: team(i), top: false }); });
  return { sw, cols, pcs, team };
})();

function shotVlan(t, { E, S, Wd }) {
  const s0 = S('S07.1').start;
  const tGros = E('S07.1', 'gros'), tBc = E('S07.1', 'broadcast'), tMonde = E('S07.1', 'monde'), tCent = E('S07.1', 'centaines');
  const tSep = E('S07.2', 'séparés'), tAch = E('S07.2', 'acheter'), tCut = E('S07.2', 'découpe'), t10 = E('S07.2', 'dix'), t20 = E('S07.2', 'vingt'), t30 = E('S07.2', 'trente');
  const tRel = E('S07.3', 'Relance'), tEt = E('S07.3', 'étages'), tVrai = E('S07.3', 'vrai'), tDom = E('S07.3', 'domaine');
  const tTeam = [Wd('S07.1', 'compta'), Wd('S07.1', 'gaming'), Wd('S07.1', 'support')];
  const end = S('S08.1').start;
  const vlanOn = (v) => t > ({ 10: t10, 20: t20, 30: t30 })[v];
  const sw = K.switchDevice({
    ...VL.sw, label: 'SW-CORE', depth: 14,
    ports: {
      top: VL.cols.map((_, i) => ({ name: `t${i}`, showName: false, vlan: vlanOn(VL.team(i)) ? VL.team(i) : undefined })),
      bottom: VL.cols.map((_, i) => ({ name: `b${i}`, showName: false, vlan: vlanOn(VL.team(i)) ? VL.team(i) : undefined })),
    },
  });
  const portOf = (p) => sw.port(`${p.top ? 't' : 'b'}${p.col}`);
  // broadcasts: [start, source index, contained?]
  const bursts = [[tBc, 8, false]];
  for (let k = 0; k < 6; k++) bursts.push([tCent + 0.2 + k * 0.45, [6, 10, 8, 7, 11, 9][k], false]);
  bursts.push([tRel + 0.2, 8, true]);
  const hitBy = (p, tNow) => bursts.some(([t0, src, cont]) => tNow > t0 + 0.9 && tNow < t0 + 2.2 && VL.pcs[src] !== p && (!cont || p.vlan === 20));
  const zoneA = [vis(t, t10, Infinity), vis(t, t20, Infinity), vis(t, t30, Infinity)];
  let out = '';
  // zones
  [[10, 420, 'COMPTA'], [20, 780, 'GAMING'], [30, 1140, 'SUPPORT']].forEach(([v, x], i) => {
    if (zoneA[i] > 0) out += K.g(K.zone({ x: x + 6, y: 140, w: 348, h: 800, vlan: v, label: `VLAN ${v}` }), { opacity: zoneA[i] });
  });
  const pcsSvg = VL.pcs.map((p) => {
    const d = K.pc({ x: p.x, y: p.y, side: p.side, scale: 0.72, state: hitBy(p, t) ? 'bcast' : undefined });
    const col = vlanOn(p.vlan) ? C.vlan[p.vlan] : C.deviceEdge;
    return { cable: K.cable(d.anchor, portOf(p), { color: col, width: 3, opacity: vlanOn(p.vlan) ? 0.7 : 1 }), svg: d.svg };
  });
  out += pcsSvg.map((x) => x.cable).join('') + sw.svg + pcsSvg.map((x) => x.svg).join('');
  // broadcast frames
  bursts.forEach(([t0, src, cont]) => {
    if (t < t0 || t > t0 + 2.2) return;
    const s = VL.pcs[src];
    const k1 = P(t, t0, 0.45, ease.inOut), k2 = P(t, t0 + 0.45, 0.5, ease.inOut), fade = 1 - P(t, t0 + 1.4, 0.5);
    if (k1 < 1) { const p = mixPt(K.pc({ x: s.x, y: s.y, side: s.side, scale: 0.72 }).anchor, portOf(s), k1); out += K.frame({ x: p.x, y: p.y, s: 0.36, compact: true, color: YEL }); return; }
    const q = P(t, t0 + 0.45, 1.0, ease.lin);
    if (!cont) out += K.ring(portOf(s).x, VL.sw.y + 70, 40 + q * 900, YEL, (1 - q) * 0.6, 4);
    else {
      out += `<clipPath id="cz${Math.round(t0 * 10)}"><rect x="786" y="0" width="348" height="1080"/></clipPath><g clip-path="url(#cz${Math.round(t0 * 10)})">${K.ring(portOf(s).x, VL.sw.y + 70, 40 + q * 600, YEL, (1 - q) * 0.7, 5)}</g>`;
      const crash = vis(t, t0 + 0.6, t0 + 1.6, 0.15);
      [786, 1134].forEach((x) => { out += `<path d="M${x} 440 V640" stroke="${YEL}" stroke-width="8" opacity="${crash}" filter="url(#glow)"/>`; });
    }
    VL.pcs.forEach((p, i) => {
      if (i === src || (cont && p.vlan !== 20)) return;
      const d = K.pc({ x: p.x, y: p.y, side: p.side, scale: 0.72 });
      const pp = mixPt(portOf(p), d.anchor, k2);
      out += K.frame({ x: pp.x, y: pp.y, s: 0.3, compact: true, color: YEL, opacity: fade, glow: false });
    });
  });
  // team labels
  ['COMPTABILITÉ', 'GAMING', 'SUPPORT'].forEach((n, i) => { out += K.g(K.text(600 + i * 360, 118, n, { size: 26, weight: 800, fill: zoneA[i] > 0.5 ? C.vlan[[10, 20, 30][i]] : C.text, ls: 3 }), { opacity: P(t, tTeam[i], 0.4) }); });
  out += K.g(K.counter({ x: 1740, y: 520, value: '17', label: 'DÉRANGÉES', color: YEL }), { opacity: vis(t, tMonde, tSep) });
  // three switches we don't want to buy
  const gh = vis(t, tSep, tCut, 0.3);
  if (gh > 0) {
    out += `<rect width="1920" height="1080" fill="#070B14" opacity="${0.9 * gh}"/>`;
    [560, 960, 1360].forEach((x, i) => {
      out += K.g(`<rect x="${x - 150}" y="450" width="300" height="130" rx="18" fill="none" stroke="${C.muted}" stroke-width="3" stroke-dasharray="10 8"/>${K.text(x, 528, `SW ${i + 1}`, { size: 30, weight: 800, fill: C.muted })}${K.pill(x, 620, '€€€', { color: C.muted, size: 22 })}`, { opacity: gh });
    });
    const st = P(t, tAch, 0.5);
    if (st > 0) out += `<path d="M380 ${520} H${380 + 1160 * st}" stroke="${C.error}" stroke-width="10" stroke-linecap="round" opacity="${gh}"/>`;
  }
  // cut lines
  const cut = P(t, tCut, 0.7, ease.inOut);
  if (cut > 0 && t < t30 + 0.4) [780, 1140].forEach((x) => { out += `<path d="M${x} 140 V${140 + 800 * cut}" stroke="${C.text}" stroke-width="3" stroke-dasharray="12 10" opacity="${1 - P(t, t30, 0.4)}"/>`; });
  // building analogy
  const bld = vis(t, tEt, tVrai, 0.5);
  if (bld > 0) {
    out += `<rect width="1920" height="1080" fill="#070B14" opacity="${0.85 * bld}"/>`;
    out += K.g(K.building(960, 950, { floors: [10, 20, 30], labels: ['VLAN 10 · compta', 'VLAN 20 · gaming', 'VLAN 30 · support'] }), { opacity: bld, y: 30 * (1 - bld) });
    out += K.g(K.pill(960, 120, 'ANALOGIE', { color: C.muted, size: 18 }), { opacity: bld });
  }
  [420, 780, 1140].forEach((x, i) => { out += K.g(K.text(x + 180, 1000, 'domaine de broadcast', { size: 22, weight: 700, fill: C.vlan[[10, 20, 30][i]] }), { opacity: P(t, tDom + i * 0.15, 0.4) }); });
  // enter: pull back to reveal the big switch; exit: push into a compta port
  const reveal = P(t, s0, 1.2, ease.inOut);
  const push = P(t, end - 0.9, 0.9, ease.inOut);
  return camera({ x: mix(mix(960, 960, reveal), 480, push), y: mix(540, 470, push), s: mix(mix(1.35, 1, reveal), 2.2, push) }, out) + chapter('05 · POURQUOI LES VLAN', vis(t, s0, end - 0.9));
}

// ============================================================ ACCESS PORT (S08)
function shotAccess(t, { E, S }) {
  const s0 = S('S08.1').start;
  const tPC = E('S08.1', 'PC'), tPort = E('S08.1', 'port'), tConf = E('S08.1', 'configure'), tNorm = E('S08.1', 'normale'), tAuc = E('S08.1', 'Aucune'), tRat = E('S08.1', 'rattachement');
  const end = S('S09.1').start;
  const blue = P(t, tPort, 0.5);
  const sw = K.switchDevice({ x: 620, y: 420, w: 560, h: 240, label: 'SW1', ports: { left: [{ name: 'Fa0/3', vlan: blue > 0.5 ? 10 : undefined, led: t > tNorm + 1.2 ? 'blue' : undefined }] } });
  const pc = K.pc({ x: 330, y: 540, label: 'PC', side: 'right' });
  const a = pc.anchor, b = sw.port('Fa0/3');
  let out = K.cable(a, b, { color: blue > 0.5 ? V10 : C.deviceEdge, width: 4, opacity: 0.8 }) + pc.svg + sw.svg;
  if (blue > 0) out += K.ring(b.x, b.y, 26, V10, vis(t, tPort, tConf, 0.3));
  // frame: leaves the PC untagged, pauses for the close-up, then enters
  const k1 = P(t, tNorm, 0.8, ease.inOut), k2 = P(t, tRat, 0.9, ease.inOut);
  if (t > tNorm - 0.1) {
    const p1 = mixPt({ x: a.x + 60, y: 540 }, { x: 505, y: 540 }, k1);
    const p = k2 > 0 ? mixPt(p1, { x: 790, y: 540 }, k2) : p1;
    const col = k2 > 0.6 ? V10 : C.traffic;
    if (k2 > 0.6) out += `<circle cx="${p.x}" cy="${p.y}" r="90" fill="${V10}" opacity="${0.25 * P(t, tRat + 0.5, 0.4)}" filter="url(#glowSoft)"/>`;
    out += K.frame({ x: p.x, y: p.y, s: 0.6, color: col, tagSlot: t > tAuc && t < tRat ? C.muted : undefined, opacity: P(t, tNorm, 0.2) }).svg;
    out += K.g(K.text(p.x, p.y + 50, 'aucun tag', { size: 16, weight: 800, fill: C.muted }), { opacity: vis(t, tAuc + 0.1, tRat) });
  }
  // camera: close-up around the access link
  const cam = { x: 580, y: 500, s: 1.7 };
  const toScr = (p) => ({ x: 960 + (p.x - cam.x) * cam.s, y: 540 + (p.y - cam.y) * cam.s });
  const exit = P(t, end - 0.9, 0.9, ease.inOut);
  let scr = camera({ x: mix(cam.x, 1100, exit), y: cam.y, s: mix(cam.s, 1.2, exit) }, out);
  // screen-space labels
  const pcS = toScr({ x: 330, y: 540 }), bS = toScr(b);
  scr += K.g(K.pill(pcS.x, pcS.y - 170, 'VLAN ?', { color: C.muted, size: 26 }), { opacity: vis(t, tPC, tPort) });
  scr += K.g(K.pill(pcS.x, pcS.y - 170, 'le PC ne sait rien', { color: C.muted, size: 22 }), { opacity: vis(t, tAuc + 0.8, end - 0.9) });
  scr += K.g(`${K.pill(bS.x, bS.y - 150, "PORT D'ACCÈS · VLAN 10", { color: V10, size: 24, filled: true })}${K.text(bS.x, bS.y + 150, '1 port d’accès = 1 VLAN', { size: 24, weight: 700, fill: V10 })}`, { opacity: vis(t, tPort + 0.3, end - 0.9) });
  const chars = Math.floor((t - tConf) * 22);
  if (t > tConf) scr += K.g(K.cli(1080, 90, 760, ['interface Fa0/3', 'switchport mode access', 'switchport access vlan 10'], { chars, host: 'SW1(config)#' }), { opacity: vis(t, tConf, end - 0.9) });
  return scr + chapter('06 · PORT D’ACCÈS', vis(t, s0, end - 0.9));
}

// ============================================================ TWO SWITCHES & 802.1Q (S09–S10)
const TW = {
  sw1: { x: 390, y: 520, w: 250, h: 200 }, sw2: { x: 1280, y: 520, w: 250, h: 200 },
  pcA: { x: 150, y: 520 }, pcC: { x: 150, y: 790 }, pcB: { x: 1770, y: 520 }, pcD: { x: 1770, y: 790 },
};
function twoSwitches(st = {}) {
  const a1 = st.sw1Leds || {}, a2 = st.sw2Leds || {};
  const sw1 = K.switchDevice({ ...TW.sw1, label: 'SW1', ports: { left: [{ name: 'a', vlan: 10, led: a1.a, showName: false }, { name: 'b', vlan: 20, led: a1.b, showName: false }], right: [{ name: 't', led: a1.t, showName: false }] } });
  const sw2 = K.switchDevice({ ...TW.sw2, label: 'SW2', ports: { left: [{ name: 't', led: a2.t, showName: false }], right: [{ name: 'a', vlan: 10, led: a2.a, showName: false }, { name: 'b', vlan: 20, led: a2.b, showName: false }] } });
  const ps = st.pc || {};
  const pcA = K.pc({ ...TW.pcA, label: 'PC-A', mac: 'AA:AA', side: 'right', zone: 10, scale: 0.9, state: ps.A });
  const pcC = K.pc({ ...TW.pcC, label: 'PC-C', mac: 'CC:CC', side: 'right', zone: 20, scale: 0.9 });
  const pcB = K.pc({ ...TW.pcB, label: 'PC-B', mac: 'BB:BB', side: 'left', zone: 10, scale: 0.9, state: ps.B });
  const pcD = K.pc({ ...TW.pcD, label: 'PC-D', mac: 'DD:DD', side: 'left', zone: 20, scale: 0.9, dim: ps.Ddim });
  let out = K.cable(pcA.anchor, sw1.port('a'), { color: V10, width: 4, opacity: 0.8 }) + K.cable(pcC.anchor, sw1.port('b'), { color: V20, width: 4, opacity: 0.6 })
    + K.cable(sw2.port('a'), pcB.anchor, { color: V10, width: 4, opacity: 0.6 }) + K.cable(sw2.port('b'), pcD.anchor, { color: V20, width: 4, opacity: 0.6 });
  if (st.link) out += st.link(sw1, sw2);
  out += pcA.svg + pcC.svg + pcB.svg + pcD.svg + sw1.svg + sw2.svg;
  return { svg: out, sw1, sw2, pcA, pcB };
}
const TG = twoSwitches();

function shotTwo(t, { E, S }) {
  const s0 = S('S09.1').start;
  const tDeux = E('S09.1', 'deux'), tVingt = E('S09.1', 'vingt'), tQ = E('S09.1', 'câble'), tCab = E('S09.1', 'câbles'), t50 = E('S09.1', 'cinquante'), tGasp = E('S09.1', 'gaspillés');
  const tSeul = E('S09.2', 'seul'), tTrunk = E('S09.2', 'trunk'), tAsc = E('S09.2', 'ascenseur'), tEt = E('S09.2', 'étage');
  const end = S('S10.1').start;
  const n = t < t50 ? (t > tCab ? 2 : 0) : Math.round(mix(2, 50, P(t, t50, 1.6, ease.in)));
  const merge = P(t, tSeul, 0.9, ease.inOut);
  const x0 = 640, x1 = 1280;
  const link = () => {
    let s = '';
    if (merge < 1) {
      const cols = [V10, V20, V30, C.traffic, C.control];
      for (let i = 0; i < n; i++) {
        const y = 620 + (n === 2 ? (i ? 20 : -20) : (i - (n - 1) / 2) * (170 / Math.max(1, n - 1))) * (1 - merge);
        const draw = n === 2 ? P(t, tCab + i * 0.3, 0.6) : 1;
        s += `<path d="M${x0} ${y} H${x0 + (x1 - x0) * draw}" stroke="${n === 2 ? [V10, V20][i] : cols[i % 5]}" stroke-width="${n === 2 ? 6 : 3}" opacity="${(1 - merge) * 0.9}"/>`;
      }
    }
    if (merge > 0) s += K.g(K.trunk({ x: x0, y: 620 }, { x: x1, y: 620 }, { vlans: [10, 20], width: 22, label: null }), { opacity: merge });
    return s;
  };
  const sc = twoSwitches({ link, sw1Leds: { a: t > tVingt ? 'blue' : undefined }, sw2Leds: { a: t > tVingt ? 'blue' : undefined } });
  let out = sc.svg;
  if (t > tVingt && t < tSeul) ['a', 'b'].forEach((p, i) => { out += K.ring(sc.sw1.port(p).x, sc.sw1.port(p).y, 20, [V10, V20][i], vis(t, tVingt, tQ)) + K.ring(sc.sw2.port(p).x, sc.sw2.port(p).y, 20, [V10, V20][i], vis(t, tVingt, tQ)); });
  out += K.g(K.text(960, 300, 'Un câble par VLAN ?', { size: 44, weight: 800 }), { opacity: vis(t, tQ, t50 - 0.2) });
  out += K.g(K.counter({ x: 960, y: 410, value: `×${n}`, label: 'CÂBLES', color: n > 10 ? C.error : C.text }), { opacity: vis(t, t50 + 0.15, tSeul) });
  const g = vis(t, tGasp, tSeul);
  if (g > 0) {
    for (let i = 0; i < 12; i++) out += `<rect x="${x0 - 8}" y="${540 + i * 14}" width="16" height="8" rx="2" fill="${C.error}" opacity="${g}"/><rect x="${x1 - 8}" y="${540 + i * 14}" width="16" height="8" rx="2" fill="${C.error}" opacity="${g}"/>`;
    out += K.g(K.text(960, 830, '100 ports gaspillés', { size: 34, weight: 800, fill: C.error }), { opacity: g });
  }
  out += K.g(K.pill(960, 680, 'TRUNK · VLAN 10 + 20', { color: C.text, size: 20, mono: true }), { opacity: P(t, tTrunk, 0.4) });
  if (t > tTrunk) out += K.g(K.cli(560, 820, 800, ['switchport mode trunk'], { chars: Math.floor((t - tTrunk - 0.3) * 22), host: 'SW1(config-if)#' }), { opacity: vis(t, tTrunk + 0.2, tAsc) });
  const el = vis(t, tAsc, tEt + 0.3);
  if (el > 0) out += K.g(`<rect x="1470" y="60" width="380" height="420" rx="20" fill="#0C1427" stroke="${C.deviceEdge}" stroke-width="2"/>${K.elevator(1660, 440, { h: 340, k: 0.5 + 0.45 * Math.sin((t - tAsc) * 2) })}${K.text(1660, 96, 'ANALOGIE · ascenseur', { size: 18, weight: 700, fill: C.muted })}`, { opacity: el });
  // the question: frames on the trunk lose their colour
  if (t > tEt) {
    const k = P(t, tEt, 1.0, ease.inOut);
    [[V10, 0], [V20, 1]].forEach(([col, i]) => {
      const p = { x: mix(700, 1000, k) + i * 190, y: 620 };
      const grey = P(t, tEt + 0.3, 0.5);
      out += K.frame({ x: p.x, y: p.y, s: 0.6, compact: true, color: grey > 0.5 ? C.muted : col });
      out += K.g(K.text(p.x, p.y - 44, '?', { size: 40, weight: 800, fill: C.decision }), { opacity: grey });
    });
  }
  // enter: lateral travel from the access close-up
  const enter = P(t, s0, 1.3, ease.inOut);
  return camera({ x: mix(560, 960, enter), y: 540, s: mix(1.25, 1, enter) }, out) + chapter('07 · DEUX SWITCHES', vis(t, s0, end));
}

function headerInset(t, tOpen, tIns, tNum, tClose, anchor) {
  const o = P(t, tOpen, 0.5, ease.out) * (1 - P(t, tClose, 0.5, ease.inOut));
  if (o <= 0) return '';
  const IX = 250, IY = 60, IW = 1420, IH = 410, V = V10;
  let s = K.inset({ x: IX, y: IY, w: IW, h: IH, to: anchor, color: V, title: 'EN-TÊTE ETHERNET · VUE RÉELLE' });
  const rowY = IY + 136, rowH = 92, gap = 10;
  const ins = P(t, tIns, 0.8, ease.inOut);
  const fields = [
    { k: 'DST MAC', v: 'BB:BB', w: 200, sz: '6 octets' }, { k: 'SRC MAC', v: 'AA:AA', w: 200, sz: '6 octets' },
    { k: '802.1Q', v: 'VLAN 10', w: 250, sz: '4 octets', tag: true },
    { k: 'TYPE', v: '0x0800', w: 150, sz: '2 octets', moved: true }, { k: 'DATA', v: '…', w: 300, moved: true }, { k: 'FCS', v: 'recalculé', w: 150, sz: '4 octets', moved: true, muted: true },
  ];
  let fx = IX + (IW - (fields.reduce((a, f) => a + f.w, 0) + gap * (fields.length - 1))) / 2;
  const at = {};
  fields.forEach((f) => {
    const x = f.moved ? fx - 260 * (1 - ins) : fx;
    const tagK = f.tag ? ins : 1;
    const col = f.tag ? V : f.muted ? C.deviceEdge : '#3A4D70';
    s += K.g(`<rect x="${x}" y="${rowY}" width="${f.w}" height="${rowH}" rx="10" fill="${f.tag ? V : '#13203A'}" fill-opacity="${f.tag ? 0.28 : 1}" stroke="${col}" stroke-width="${f.tag ? 3 : 2}"/>
      ${K.text(x + f.w / 2, rowY + 30, f.k, { size: 15, weight: 800, fill: f.tag ? '#fff' : C.muted, ls: 2 })}
      ${K.text(x + f.w / 2, rowY + 66, f.v, { size: f.muted ? 18 : 25, weight: 700, font: C.mono, fill: f.muted ? C.muted : C.text })}
      ${f.sz ? K.text(x + f.w / 2, rowY - 12, f.sz, { size: 14, weight: 600, fill: f.tag ? V : C.muted }) : ''}`, { opacity: tagK, s: f.tag ? mix(0.3, 1, tagK) : 1, ox: x + f.w / 2, oy: rowY + rowH / 2 });
    at[f.k] = { x: fx, w: f.w };
    fx += f.w + gap;
  });
  const tq = at['802.1Q'];
  s += K.g(`<path d="M${tq.x - 5} ${rowY - 34} v${rowH + 40}" stroke="${V}" stroke-width="3" stroke-dasharray="4 5"/>${K.pill(tq.x - 5, rowY - 44, 'inséré après la MAC source', { color: V, size: 15, anchor: 'end' })}`, { opacity: P(t, tIns + 0.6, 0.4) });
  const shiftY = rowY + rowH + 24;
  s += K.g(`<path d="M${at.TYPE.x - 250} ${shiftY} H${at.FCS.x + at.FCS.w - 20}" stroke="${C.muted}" stroke-width="2" opacity="0.55"/>${K.text(at.DATA.x + at.DATA.w / 2, shiftY + 26, 'les champs suivants se décalent', { size: 16, weight: 600, fill: C.muted })}`, { opacity: vis(t, tIns, tNum + 1) });
  const bk = P(t, tNum, 0.5);
  if (bk > 0) {
    const bx = tq.x - 170, by = rowY + rowH + 58, bw = 520, bh = 46;
    let bs = `<path d="M${tq.x} ${rowY + rowH} L${bx} ${by} M${tq.x + tq.w} ${rowY + rowH} L${bx + bw} ${by}" stroke="${V}" stroke-opacity="0.5" stroke-width="2"/>`;
    let bxx = bx;
    [{ k: 'TPID 0x8100', w: bw - 112 - (bw * 12) / 32 }, { k: 'PRI', w: 56 }, { k: 'DEI', w: 56 }, { k: 'VID = 10', w: (bw * 12) / 32, hi: true }].forEach((b) => {
      bs += `<rect x="${bxx}" y="${by}" width="${b.w}" height="${bh}" rx="6" fill="${b.hi ? V : '#13203A'}" stroke="${b.hi ? V : '#3A4D70'}" stroke-width="2"/>${K.text(bxx + b.w / 2, by + 30, b.k, { size: b.hi ? 19 : 15, weight: b.hi ? 800 : 700, font: C.mono, fill: b.hi ? '#fff' : C.muted })}`;
      if (b.hi) bs += K.text(bxx + b.w / 2, by + bh + 22, 'VLAN ID · 12 bits', { size: 15, weight: 700, fill: V });
      bxx += b.w;
    });
    s += K.g(bs, { opacity: bk });
  }
  return K.g(s, { opacity: o, s: mix(0.2, 1, o), ox: anchor.x, oy: anchor.y });
}

function shot8021q(t, { E, S }) {
  const s0 = S('S10.1').start;
  const tAj = E('S10.1', 'ajoute'), tTag = E('S10.1', 'tag'), tHuit = E('S10.1', 'huit'), tAuto = E('S10.1', 'autocollant'), tIns = E('S10.1', 'inséré'), tNum = E('S10.1', 'numéro');
  const s2 = S('S10.2').start, tLit = E('S10.2', 'lit'), tUniq = E('S10.2', 'uniquement'), tRet = E('S10.2', 'retire'), tNorm = E('S10.2', 'normale');
  const end = S('S11.1').start;
  const sw1 = TG.sw1, sw2 = TG.sw2;
  const pathIn = [TG.pcA.anchor, sw1.port('a'), { x: 515, y: 620 }, sw1.port('t'), { x: 790, y: 620 }];
  const pathOut = [{ x: 790, y: 620 }, sw2.port('t'), { x: 1405, y: 620 }];
  const pathEnd = [{ x: 1405, y: 620 }, sw2.port('a'), TG.pcB.anchor];
  let p, k;
  if (t < s2) p = along(pathIn, P(t, s0 + 0.2, Math.max(1, tAj - s0 - 0.2), ease.inOut));
  else if (t < tRet) p = along(pathOut, P(t, s2, Math.max(0.8, tLit - s2), ease.inOut) * 0.5 + 0.5 * P(t, tUniq, 0.6, ease.inOut));
  else p = along(pathEnd, P(t, tNorm - 0.6, 0.9, ease.inOut));
  const sc = twoSwitches({
    link: () => K.trunk({ x: 640, y: 620 }, { x: 1280, y: 620 }, { vlans: [10, 20], width: 22, label: null }),
    sw1Leds: { a: 'blue', t: t > tAj ? 'blue' : undefined }, sw2Leds: { t: t > tLit ? 'blue' : undefined, a: t > tUniq ? 'green' : undefined },
    pc: { B: t > tNorm + 0.4 ? 'ok' : undefined, Ddim: t > tUniq && t < end },
  });
  let out = sc.svg;
  if (t > tUniq) out += K.g(K.cross(sw2.port('b').x + 30, sw2.port('b').y, C.muted, 20), { opacity: vis(t, tUniq, end) }) + K.ring(sw2.port('a').x, sw2.port('a').y, 22, V10, vis(t, tUniq, tNorm));
  // frame + tag
  const tagIn = P(t, tTag, 0.3, ease.out);
  const fall = P(t, tRet, 0.9, ease.in);
  const fr = K.frame({ x: p.x, y: p.y, s: 1.0, color: V10 });
  out += fr.svg;
  if (tagIn > 0 && fall < 1) {
    const tx = fr.box.x + 18, ty = fr.box.y - 2;
    out += K.g(K.vlanTag({ x: tx, y: ty, vlan: 10 }), { opacity: tagIn * (1 - fall), y: -40 * (1 - tagIn) + 160 * fall, rot: 25 * fall, ox: tx + 56, oy: ty - 15 });
  }
  out += K.g(K.pill(p.x, p.y + 72, 'IEEE 802.1Q', { color: V10, size: 18 }), { opacity: vis(t, tHuit, tAuto) });
  // tag read at SW2
  if (t > tLit - 0.1 && t < tUniq + 0.6) {
    const q = P(t, tLit, 0.6, ease.lin);
    out += `<rect x="${fr.box.x + 10 + 120 * q}" y="${fr.box.y - 36}" width="4" height="40" fill="${C.decision}" filter="url(#glow)" opacity="${vis(t, tLit, tUniq + 0.3, 0.1)}"/>`;
  }
  out += K.g(K.pill(1405, 400, 'TAG LU : VLAN 10', { color: C.decision, size: 22, filled: true }), { opacity: vis(t, tLit + 0.3, tRet) });
  out += K.g(K.pill(1405, 400, 'tag retiré', { color: C.muted, size: 22 }), { opacity: vis(t, tRet + 0.3, end) });
  out += headerInset(t, tAuto, tIns, tNum, s2 - 0.6, { x: fr.box.x + 148, y: fr.box.y - 18 });
  return out + chapter('08 · 802.1Q', vis(t, s0, end));
}

// ============================================================ FINAL MENTAL MOVIE (S11)
function shotMovie(t, { E, S, Wd, T }) {
  const s0 = S('S11.1').start, end = S('S12.1').start;
  const b = {
    sans: E('S11.1', 'sans'), acces: E('S11.1', "d'accès"), app: E('S11.1', 'apprend'), col: E('S11.1', 'colonne'), cherche: E('S11.1', 'cherche'),
    ajoute: E('S11.1', 'ajoute'), sw2: E('S11.1', 'switch deux'), port2: Wd('S11.1', 'port', 3), retire: E('S11.1', 'retire'), livre: E('S11.1', 'livre'), dec: E('S11.1', 'décision'),
  };
  const after = (w, t0) => T.words.find((x) => x.start >= t0 && x.w.toLowerCase().replace(/[.,]/g, '') === w).start;
  const recap = ['source', 'destination', 'vlan', 'port', 'décision'].reduce((acc, w) => { acc.push(after(w, acc.length ? acc.at(-1) : b.livre)); return acc; }, []);
  // layout
  const L = { pcA: { x: 110, y: 330 }, pcC: { x: 110, y: 610 }, sw1: { x: 290, y: 240, w: 240, h: 180 }, sw2: { x: 870, y: 240, w: 240, h: 180 }, pcB: { x: 1290, y: 330 }, pcD: { x: 1290, y: 610 } };
  const sw1 = K.switchDevice({ ...L.sw1, label: 'SW1', ports: { left: [{ name: 'Fa0/1', vlan: 10, led: t > b.acces ? 'blue' : undefined }, { name: 'Fa0/2', vlan: 20 }], right: [{ name: 'Gi0/1', led: t > b.ajoute ? 'blue' : undefined }] } });
  const sw2 = K.switchDevice({ ...L.sw2, label: 'SW2', ports: { left: [{ name: 'Gi0/1', led: t > b.sw2 + 1 ? 'blue' : undefined }], right: [{ name: 'Fa0/2', vlan: 10, led: t > b.retire ? 'green' : undefined }, { name: 'Fa0/3', vlan: 20 }] } });
  const pcA = K.pc({ ...L.pcA, label: 'PC-A', mac: 'AA:AA', side: 'right', zone: 10, scale: 0.8 });
  const pcC = K.pc({ ...L.pcC, label: 'PC-C', side: 'right', zone: 20, scale: 0.7, dim: true });
  const pcB = K.pc({ ...L.pcB, label: 'PC-B', mac: 'BB:BB', side: 'left', zone: 10, scale: 0.8, state: t > b.livre + 0.6 ? 'ok' : undefined });
  const pcD = K.pc({ ...L.pcD, label: 'PC-D', side: 'left', zone: 20, scale: 0.7, dim: true });
  const trunkA = sw1.port('Gi0/1'), trunkB = sw2.port('Gi0/1');
  let out = K.cable(pcA.anchor, sw1.port('Fa0/1'), { color: V10, width: 4 }) + K.cable(pcC.anchor, sw1.port('Fa0/2'), { color: V20, width: 3, opacity: 0.5 })
    + K.cable(sw2.port('Fa0/2'), pcB.anchor, { color: V10, width: 4 }) + K.cable(sw2.port('Fa0/3'), pcD.anchor, { color: V20, width: 3, opacity: 0.5 })
    + K.trunk(trunkA, trunkB, { vlans: [10, 20], width: 18, label: null })
    + pcA.svg + pcC.svg + pcB.svg + pcD.svg + sw1.svg + sw2.svg;
  // MAC tables (with the VLAN column revealed)
  const hit1 = t > b.cherche + 0.3 && t < b.ajoute + 0.5, hit2 = t > b.port2 && t < b.retire + 0.5;
  const rows1 = [{ cells: ['10', 'BB:BB', 'Gi0/1'], state: hit1 ? 'hit' : undefined }];
  if (t > b.app) rows1.unshift({ cells: ['10', 'AA:AA', 'Fa0/1'], state: t < b.cherche ? 'new' : undefined });
  const rows2 = [{ cells: ['10', 'BB:BB', 'Fa0/2'], state: hit2 ? 'hit' : undefined }];
  if (t > b.sw2 + 1.5) rows2.unshift({ cells: ['10', 'AA:AA', 'Gi0/1'], state: t < b.port2 ? 'new' : undefined });
  const t1 = K.macTable({ x: 200, y: 520, w: 420, title: 'TABLE MAC · SW1', cols: ['VLAN', 'MAC', 'PORT'], rows: rows1, slots: 2, rowH: 52 });
  const t2 = K.macTable({ x: 780, y: 520, w: 420, title: 'TABLE MAC · SW2', cols: ['VLAN', 'MAC', 'PORT'], rows: rows2, slots: 2, rowH: 52 });
  out += t1.svg + t2.svg;
  const colHi = vis(t, b.col, b.cherche);
  if (colHi > 0) [200, 780].forEach((x) => { out += `<rect x="${x + 12}" y="${520 + 50}" width="${420 / 3 - 24}" height="${50 + 2 * 52}" rx="10" fill="none" stroke="${C.decision}" stroke-width="3" opacity="${colHi}" filter="url(#glow)"/>`; });
  // frame journey
  const pts = [pcA.anchor, sw1.port('Fa0/1'), { x: 410, y: 292 }, trunkA, trunkB, { x: 990, y: 292 }, sw2.port('Fa0/2'), pcB.anchor];
  const seg = (i, k) => mixPt(pts[i], pts[i + 1], k);
  let p;
  if (t < b.acces) p = seg(0, P(t, b.sans, Math.max(0.5, b.acces - b.sans), ease.inOut) * 0.85);
  else if (t < b.cherche) p = seg(0, mix(0.85, 1, P(t, b.acces, 0.3)));
  else if (t < b.ajoute) p = seg(1, P(t, b.cherche, 0.6, ease.inOut));
  else if (t < b.sw2) p = seg(2, P(t, b.ajoute - 0.2, 0.6, ease.inOut));
  else if (t < b.retire) p = t < b.sw2 + 1.2 ? seg(3, P(t, b.sw2, 1.2, ease.inOut)) : seg(4, P(t, b.sw2 + 1.2, 0.5, ease.inOut));
  else if (t < b.livre) p = seg(5, P(t, b.retire + 0.5, 0.6, ease.inOut));
  else p = seg(6, P(t, b.livre, 0.7, ease.inOut));
  const fr = K.frame({ x: p.x, y: p.y, s: 0.72, color: V10, opacity: 1 - P(t, b.livre + 0.6, 0.3) });
  out += fr.svg;
  const tagIn = P(t, b.ajoute, 0.3), fall = P(t, b.retire, 0.8, ease.in);
  if (tagIn > 0 && fall < 1) {
    const tx = fr.box.x + 13, ty = fr.box.y - 1;
    out += K.g(K.vlanTag({ x: tx, y: ty, vlan: 10, s: 0.72 }), { opacity: tagIn * (1 - fall), y: -30 * (1 - tagIn) + 120 * fall, rot: 20 * fall, ox: tx + 40, oy: ty });
  }
  // HUD
  const phase = [b.sans, b.acces, b.cherche, b.ajoute, b.sw2 + 1.2, b.retire, b.livre].filter((x) => t >= x).length;
  const H = [
    { port: '—', vlan: '—', dec: '—' },
    { port: 'PC-A → réseau', vlan: '— (non tagué)', dec: 'émission' },
    { port: 'SW1 · Fa0/1', vlan: '10 (port d’accès)', dec: 'apprend AA:AA' },
    { port: 'SW1 · Fa0/1', vlan: '10', dec: 'BB:BB → Gi0/1 (trunk)' },
    { port: 'SW1 · Gi0/1', vlan: '10 · TAGUÉ', dec: 'ajoute le tag 802.1Q' },
    { port: 'SW2 · Gi0/1', vlan: '10 · TAGUÉ', dec: 'lit le tag · BB:BB → Fa0/2' },
    { port: 'SW2 · Fa0/2', vlan: '— (tag retiré)', dec: 'retire le tag, livre' },
    { port: 'PC-B', vlan: '—', dec: 'reçue ✓' },
  ][phase];
  const hi = recap.filter((x) => t >= x).length - 1;
  let hudSvg = K.hud(1470, 250, 420, [
    { k: 'SRC MAC', v: 'AA:AA' }, { k: 'DST MAC', v: 'BB:BB' },
    { k: 'VLAN', v: H.vlan, color: /TAGUÉ/.test(H.vlan) ? V10 : C.text, size: 23 }, { k: 'PORT', v: H.port, size: 23 },
    { k: 'DÉCISION', v: H.dec, color: C.decision, size: H.dec.length > 20 ? 18 : 22 },
  ], { hi: t > b.dec + 1.2 ? -1 : hi });
  // devices + tables scaled up to fill the frame; HUD stays in screen space
  let scr = K.g(out, { s: 1.08, x: 0, y: 95 }) + hudSvg;
  scr += K.g(K.text(60, 110, 'sur un vrai switch Cisco : P1 → Fa0/1 · lien montant → Gi0/1', { size: 20, weight: 600, fill: C.muted, anchor: 'start' }), { opacity: vis(t, b.app, b.dec) });
  return scr + chapter('FILM COMPLET', vis(t, s0, end));
}

// ============================================================ QUIZ (S12)
function quizCard(t, n, question, body, { tQ, tFreeze, tAns, x = 0 }) {
  const timer = t > tFreeze && t < tAns ? clamp((t - tFreeze) / Math.max(0.5, tAns - tFreeze)) : null;
  let s = `<g filter="url(#shadow)"><rect x="200" y="110" width="1520" height="780" rx="30" fill="#0C1427" stroke="${C.deviceEdge}" stroke-width="2"/></g>
    ${K.pill(290, 175, `QUESTION ${n}`, { color: C.control, size: 20, filled: true, anchor: 'start' })}
    ${K.text(290, 260, question, { size: 40, weight: 800, anchor: 'start' })}`;
  if (timer != null) {
    const r = 34, c = 2 * Math.PI * r;
    s += `<circle cx="1630" cy="185" r="${r}" fill="none" stroke="${C.deviceEdge}" stroke-width="6"/><circle cx="1630" cy="185" r="${r}" fill="none" stroke="${C.control}" stroke-width="6" stroke-dasharray="${c * timer} ${c}" transform="rotate(-90 1630 185)"/>`;
  }
  return K.g(s + body, { x, opacity: P(t, tQ - 0.4, 0.4) });
}

function shotQuiz(t, { E, S }) {
  const q1 = S('S12.1').start, q2 = S('S12.2').start, q3 = S('S12.3').start, end = S('S13.1').start;
  let out = '';
  const slide = (t0, t1) => ({ x: 1920 * (1 - P(t, t0 - 0.5, 0.5, ease.inOut)) - 1920 * P(t, t1 - 0.5, 0.5, ease.inOut) });
  if (t < q2) {
    const tTrois = E('S12.1', 'trois'), tApp = E('S12.1', 'apprend'), tAns = E('S12.1', 'C-C');
    const sw = K.switchDevice({ x: 760, y: 470, w: 240, h: 200, label: 'SW1', ports: { left: [{ name: 'P3', led: t > tTrois + 0.8 ? 'blue' : undefined }] } });
    const k = P(t, tTrois, 0.8, ease.inOut);
    let body = K.cable({ x: 330, y: 570 }, sw.port('P3'), { width: 4 }) + sw.svg + K.frame({ x: mix(360, 660, k), y: 570, s: 0.95, dst: 'DD:DD', src: 'CC:CC' }).svg;
    const ok = P(t, tAns, 0.3);
    [['A', 'P3 | CC:CC', true], ['B', 'P3 | DD:DD', false]].forEach(([l, v, good], i) => {
      const y = 470 + i * 150;
      const col = ok > 0.5 ? (good ? C.forward : C.error) : C.deviceEdge;
      body += `<rect x="1120" y="${y}" width="480" height="110" rx="18" fill="${col}" fill-opacity="${ok > 0.5 && good ? 0.15 : 0.04}" stroke="${col}" stroke-width="3"/>
        ${K.text(1160, y + 70, l, { size: 36, weight: 800, fill: C.muted, anchor: 'start' })}${K.text(1390, y + 70, v, { size: 36, weight: 700, font: C.mono })}`;
      if (ok > 0.5) body += good ? K.check(1560, y + 55) : `<path d="M1150 ${y + 55} H1570" stroke="${C.error}" stroke-width="5" opacity="0.8"/>`;
    });
    body += K.g(K.text(960, 830, 'toujours la SOURCE', { size: 34, weight: 800, fill: C.forward }), { opacity: P(t, tAns + 0.5, 0.4) });
    out += K.g(quizCard(t, 1, 'Que note le switch dans sa table ?', body, { tQ: q1, tFreeze: tApp + 0.3, tAns }), slide(q1 + 0.4, q2));
  }
  if (t > q2 - 0.6 && t < q3) {
    const tTag = E('S12.2', 'tag'), tNon = E('S12.2', 'Non');
    const sw = K.switchDevice({ x: 1040, y: 440, w: 260, h: 220, label: 'SW1', ports: { left: [{ name: 'Fa0/5', vlan: 20, led: 'blue' }] } });
    const pc = K.pc({ x: 440, y: 550, label: 'PC', side: 'right', scale: 1.1 });
    const k = P(t, q2 + 0.8, 0.8, ease.inOut);
    let body = K.cable(pc.anchor, sw.port('Fa0/5'), { color: V20, width: 4 }) + pc.svg + sw.svg;
    body += K.frame({ x: mix(620, 830, k), y: 550, s: 0.9, tagSlot: C.muted }).svg;
    body += K.g(K.text(mix(620, 830, k) - 30, 470, '?', { size: 34, weight: 800, fill: C.decision }), { opacity: 1 - P(t, tNon, 0.2) });
    body += K.g(K.text(mix(620, 830, k) - 30, 470, 'aucun tag', { size: 22, weight: 800, fill: C.muted }), { opacity: P(t, tNon, 0.3) });
    body += K.g(K.pill(sw.port('Fa0/5').x, 380, "PORT D'ACCÈS · VLAN 20", { color: V20, size: 20, filled: true }), { opacity: P(t, tNon + 0.3, 0.4) });
    body += K.stamp(960, 800, 'NON', { color: C.error, size: 60, opacity: P(t, tNon, 0.25) });
    out += K.g(quizCard(t, 2, 'La trame qui sort du PC est-elle taguée ?', body, { tQ: q2, tFreeze: tTag + 0.3, tAns: tNon }), slide(q2, q3));
  }
  if (t > q3 - 0.6) {
    const tDir = E('S12.3', 'directement'), tNon = E('S12.3', 'Non'), tRt = E('S12.3', 'routeur');
    const sw = K.switchDevice({ x: 810, y: 520, w: 300, h: 180, label: 'SW1 · L2', ports: { left: [{ name: 'a', vlan: 10, showName: false }], right: [{ name: 'b', vlan: 20, showName: false }] } });
    const pa = K.pc({ x: 430, y: 610, label: 'PC-A · VLAN 10', side: 'right', zone: 10 });
    const pb = K.pc({ x: 1490, y: 610, label: 'PC-B · VLAN 20', side: 'left', zone: 20 });
    let body = K.cable(pa.anchor, sw.port('a'), { color: V10, width: 4 }) + K.cable(sw.port('b'), pb.anchor, { color: V20, width: 4 }) + pa.svg + pb.svg + sw.svg;
    const k = P(t, q3 + 0.6, 1.2, ease.inOut);
    body += K.frame({ x: mix(560, 745, k), y: 610, s: 0.7, compact: true, color: V10 });
    const wall = P(t, tNon, 0.3);
    if (wall > 0) body += `<rect x="${960 - 8}" y="${320}" width="16" height="${420 * wall}" rx="6" fill="${C.error}" filter="url(#glow)"/>`;
    body += K.g(K.router({ x: 960, y: 400, r: 70, label: 'routeur (épisode 3)', dashed: true }) + `<path d="M${880} 420 Q 700 470 ${pa.anchor.x} ${pa.anchor.y - 40}" stroke="${C.control}" stroke-width="3" fill="none" stroke-dasharray="8 8"/><path d="M${1040} 420 Q 1220 470 ${pb.anchor.x} ${pb.anchor.y - 40}" stroke="${C.control}" stroke-width="3" fill="none" stroke-dasharray="8 8"/>`, { opacity: P(t, tRt, 0.5) });
    body += K.stamp(960, 830, 'NON', { color: C.error, size: 56, opacity: vis(t, tNon, tRt) });
    out += K.g(quizCard(t, 3, 'Peuvent-ils communiquer directement ?', body, { tQ: q3, tFreeze: tDir + 0.3, tAns: tNon }), slide(q3, end + 10));
  }
  return out + chapter('MICRO QUIZ', vis(t, q1, end));
}

// ============================================================ RECAP + TEASER (S13)
function vignette(i, x, y, w, h, on, active) {
  const cx = x + w / 2, cy = y + h / 2 - 20;
  const icons = [
    () => `${K.frame({ x: cx - 110, y: cy, s: 0.6, srcEmpty: true }).svg}${K.arrow({ x: cx - 30, y: cy }, { x: cx + 60, y: cy }, { color: C.forward })}<rect x="${cx + 70}" y="${cy - 26}" width="130" height="52" rx="8" fill="${C.forward}" fill-opacity="0.2" stroke="${C.forward}" stroke-width="2"/>${K.text(cx + 135, cy + 8, 'AA:AA', { size: 20, weight: 700, font: C.mono })}`,
    () => `<rect x="${cx - 150}" y="${cy - 30}" width="170" height="60" rx="8" fill="${C.decision}" fill-opacity="0.2" stroke="${C.decision}" stroke-width="2"/>${K.text(cx - 65, cy + 9, 'BB:BB → P2', { size: 20, weight: 700, font: C.mono })}${K.arrow({ x: cx + 40, y: cy }, { x: cx + 170, y: cy }, { color: C.forward })}`,
    () => `<rect x="${cx - 150}" y="${cy - 45}" width="110" height="90" rx="12" fill="url(#devTop)" stroke="${C.deviceEdge}" stroke-width="2"/>${[-60, -20, 20, 60].map((d) => K.arrow({ x: cx - 40, y: cy }, { x: cx + 140, y: cy + d }, { color: C.traffic, width: 4 })).join('')}`,
    () => `<rect x="${cx - 55}" y="${cy - 45}" width="110" height="90" rx="12" fill="url(#devTop)" stroke="${C.deviceEdge}" stroke-width="2"/>${[80, 120, 160].map((r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${YEL}" stroke-width="4" opacity="${1 - r / 200}"/>`).join('')}`,
    () => [10, 20, 30].map((v, k) => `<rect x="${cx - 190 + k * 130}" y="${cy - 55}" width="120" height="110" rx="14" fill="${C.vlan[v]}" fill-opacity="0.2" stroke="${C.vlan[v]}" stroke-width="3"/>${K.text(cx - 130 + k * 130, cy + 8, String(v), { size: 30, weight: 800, fill: C.vlan[v] })}`).join(''),
    () => `${K.trunk({ x: cx - 190, y: cy + 20 }, { x: cx + 190, y: cy + 20 }, { vlans: [10, 20, 30], width: 16, label: null })}${K.vlanTag({ x: cx - 56, y: cy - 16, vlan: 10 })}`,
  ];
  const caps = ['SOURCE → apprendre', 'DESTINATION → décider', 'inconnue → inonder', 'broadcast → toujours inondée', 'VLAN = 1 domaine de broadcast', 'trunk + tag 802.1Q'];
  const col = [C.forward, C.decision, C.traffic, YEL, V20, V10][i];
  // empty slots are visible from the start of the recap, so the screen is never blank
  const slot = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="none" stroke="${C.deviceEdge}" stroke-width="2" stroke-dasharray="8 10" opacity="0.6"/>`;
  if (on <= 0.001) return slot;
  return slot + K.g(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#0C1427" stroke="${active ? col : C.deviceEdge}" stroke-width="${active ? 3 : 2}"/>
    <clipPath id="vg${i}"><rect x="${x}" y="${y}" width="${w}" height="${h - 70}" rx="22"/></clipPath><g clip-path="url(#vg${i})">${icons[i]()}</g>
    ${K.text(cx, y + h - 34, caps[i], { size: 26, weight: 800, fill: col })}`, { opacity: on, y: 20 * (1 - on) });
}

function shotRecap(t, { E, S }) {
  const s0 = S('S13.1').start, end = S('S13.2').start;
  const beats = ['apprendre', 'décider', 'inonde', 'toujours', 'couleur', 'tag'].map((a) => E('S13.1', a));
  let out = '';
  beats.forEach((tb, i) => {
    const x = 120 + (i % 3) * 570, y = 150 + Math.floor(i / 3) * 360;
    const active = t >= tb && (i === 5 || t < beats[i + 1]);
    out += vignette(i, x, y, 540, 320, P(t, tb - 0.1, 0.4), active);
  });
  return out + chapter('RÉCAP', vis(t, s0, end));
}

function shotTeaser(t, { E, S, T }) {
  const s0 = S('S13.2').start;
  const tDeux = E('S13.2', 'deux'), tFois = E('S13.2', 'fois'), tEp = E('S13.2', 'épisode');
  const sw1 = K.switchDevice({ x: 520, y: 450, w: 260, h: 180, label: 'SW1' });
  const sw2 = K.switchDevice({ x: 1140, y: 450, w: 260, h: 180, label: 'SW2' });
  const top = [{ x: 780, y: 490 }, { x: 960, y: 380 }, { x: 1140, y: 490 }];
  const bot = [{ x: 1140, y: 590 }, { x: 960, y: 700 }, { x: 780, y: 590 }];
  const draw2 = P(t, tDeux, 0.6);
  let out = `<path d="M780 490 Q960 270 1140 490" fill="none" stroke="${C.deviceEdge}" stroke-width="6"/>`;
  out += `<path d="M1140 590 Q960 810 780 590" fill="none" stroke="${draw2 > 0 ? C.error : C.deviceEdge}" stroke-width="6" stroke-dasharray="${600 * draw2} 600" opacity="${draw2 > 0 ? 0.9 : 0}"/>`;
  out += sw1.svg + sw2.svg;
  const t0 = tFois + 0.3;
  if (t > t0) {
    const n = Math.min(64, 2 ** Math.floor((t - t0) / 0.4));
    const loop = [...top, ...bot, top[0]];
    for (let i = 0; i < Math.min(n, 32); i++) {
      const k = ((t - t0) * 0.55 + i / Math.min(n, 32)) % 1;
      const p = along(loop, k);
      out += K.frame({ x: p.x, y: p.y, s: 0.36, compact: true, color: YEL, glow: i < 8 });
    }
    out += K.counter({ x: 960, y: 200, value: String(n), label: 'COPIES', color: n > 8 ? C.error : YEL });
  }
  const card = P(t, tEp + 0.5, 0.6);
  const fadeOut = P(t, T.duration - 0.8, 0.8);
  if (card > 0) out += `<rect width="1920" height="1080" fill="#070B14" opacity="${0.9 * card}"/>` + K.g(`${K.text(960, 500, 'ÉPISODE 2', { size: 30, weight: 800, fill: C.muted, ls: 8 })}${K.text(960, 590, 'Spanning Tree', { size: 84, weight: 800 })}${K.text(960, 650, 'pourquoi certains ports doivent se taire', { size: 28, weight: 600, fill: C.muted })}`, { opacity: card });
  if (fadeOut > 0) out += `<rect width="1920" height="1080" fill="#000" opacity="${fadeOut}"/>`;
  return out;
}

export const shots = [
  { from: 'S01.1', draw: shotHook },
  { from: 'S02.1', draw: shotProblem },
  { from: 'S03.1', draw: shotFrame },
  { from: 'S04.1', draw: shotBench },
  { from: 'S05.4', draw: shotSplit },
  { from: 'S06.1', draw: shotBroadcast },
  { from: 'S06.2', draw: shotCompare },
  { from: 'S07.1', draw: shotVlan },
  { from: 'S08.1', draw: shotAccess },
  { from: 'S09.1', draw: shotTwo },
  { from: 'S10.1', draw: shot8021q },
  { from: 'S11.1', draw: shotMovie },
  { from: 'S12.1', draw: shotQuiz },
  { from: 'S13.1', draw: shotRecap },
  { from: 'S13.2', draw: shotTeaser },
];
