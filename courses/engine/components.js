// CCNA Motion Course Engine — SVG component library.
// Every component is a pure function returning an SVG string (and, for devices,
// the anchor points cables attach to). Scenes compose them; the future timeline
// runner will animate the same objects by id, so every component accepts `id`.

export const C = {
  traffic: '#4DA3FF',
  forward: '#34D399',
  error: '#F43F5E',
  broadcast: '#FACC15',
  control: '#A78BFA',
  decision: '#FB923C',
  vlan: { 10: '#3B82F6', 20: '#8B5CF6', 30: '#F97316' },
  device: '#1A2336',
  deviceTop: '#202C44',
  deviceEdge: '#2B3A55',
  deviceDepth: '#0E1524',
  text: '#E6EDF7',
  muted: '#7F8FAA',
  ui: "Inter, 'DejaVu Sans', sans-serif",
  mono: "'JetBrains Mono', 'DejaVu Sans Mono', monospace",
};

const LED = { off: '#324057', blue: C.traffic, green: C.forward, red: C.error, yellow: C.broadcast, orange: C.decision };

let uid = 0;
const nextId = (p) => `${p}${++uid}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attrs = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => `${k}="${v}"`).join(' ');

export function text(x, y, str, { size = 20, weight = 600, fill = C.text, font = C.ui, anchor = 'middle', opacity, ls, id } = {}) {
  return `<text ${attrs({ id, x, y, fill, opacity, 'font-family': font, 'font-size': size, 'font-weight': weight, 'text-anchor': anchor, 'letter-spacing': ls })}>${esc(str)}</text>`;
}

// ---------------------------------------------------------------- defs / backdrop

export function defs() {
  return `<defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glowSoft" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#000" flood-opacity="0.45"/>
    </filter>
    <linearGradient id="devTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#24324D"/><stop offset="1" stop-color="#18223A"/>
    </linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#15203A"/><stop offset="1" stop-color="#0C1428"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1.2" fill="rgba(255,255,255,0.06)"/>
    </pattern>
  </defs>`;
}

export function backdrop() {
  return `<rect width="1920" height="1080" fill="url(#grid)"/>`;
}

// ---------------------------------------------------------------- devices

// Switch drawn as a 2.5D slab. Ports sit on the slab edges so cables read
// clearly: by convention the ingress side is on the left.
// ports: { left: [...], right: [...], top: [...], bottom: [...] }, each port
// { name, led, vlan, lock, label }.
export function switchDevice({ id = nextId('sw'), x, y, w = 260, h = 200, label = 'SW1', sub, ports = {}, depth = 18, highlight } = {}) {
  const out = [];
  const anchors = {};
  out.push(`<g id="${id}" filter="url(#shadow)">`);
  out.push(`<rect x="${x}" y="${y + depth}" width="${w}" height="${h}" rx="22" fill="${C.deviceDepth}" stroke="${C.deviceEdge}" stroke-width="2"/>`);
  out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="url(#devTop)" stroke="${highlight || C.deviceEdge}" stroke-width="${highlight ? 3 : 2}"/>`);
  out.push(`<path d="M${x + 22} ${y + 1.5} H${x + w - 22}" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>`);
  out.push(`</g>`);
  // switch glyph: two pairs of opposite arrows
  const cx = x + w / 2, cy = y + h / 2 - 14;
  const g = (yy, dir) => {
    const a = dir > 0 ? cx + 34 : cx - 34, b = dir > 0 ? cx - 34 : cx + 34;
    return `<path d="M${b} ${yy} H${a} M${a - dir * 10} ${yy - 8} L${a} ${yy} L${a - dir * 10} ${yy + 8}" stroke="${C.muted}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  out.push(g(cy - 12, 1), g(cy + 2, -1));
  out.push(text(cx, cy + 48, label, { size: 30, weight: 800, ls: 1 }));
  if (sub) out.push(text(cx, cy + 74, sub, { size: 15, weight: 600, fill: C.muted, font: C.mono }));

  const place = (side, list) => {
    list.forEach((p, i) => {
      const n = list.length;
      let px, py, lx, ly, ta = 'middle';
      if (side === 'left' || side === 'right') {
        py = y + (h * (i + 1)) / (n + 1);
        px = side === 'left' ? x : x + w;
        lx = side === 'left' ? px + 34 : px - 34; ly = py + 5;
        ta = side === 'left' ? 'start' : 'end';
        lx = side === 'left' ? px + 22 : px - 22;
      } else {
        px = x + (w * (i + 1)) / (n + 1);
        py = side === 'top' ? y : y + h + depth;
        lx = px; ly = side === 'top' ? py + 34 : py - 22;
      }
      const horiz = side === 'left' || side === 'right';
      const sw = horiz ? 16 : 26, sh = horiz ? 26 : 16;
      const col = p.vlan ? C.vlan[p.vlan] : C.deviceEdge;
      out.push(`<rect x="${px - sw / 2}" y="${py - sh / 2}" width="${sw}" height="${sh}" rx="4" fill="#0A101D" stroke="${col}" stroke-width="${p.vlan ? 3 : 2}"/>`);
      const led = LED[p.led || 'off'];
      out.push(`<circle cx="${px}" cy="${py}" r="4.5" fill="${led}" ${p.led && p.led !== 'off' ? 'filter="url(#glow)"' : ''}/>`);
      if (p.name && p.showName !== false) {
        const inside = horiz;
        out.push(text(inside ? lx : lx, inside ? ly : ly, p.name, { size: 15, weight: 700, font: C.mono, fill: p.led && p.led !== 'off' ? LED[p.led] : C.muted, anchor: horiz ? ta : 'middle' }));
      }
      if (p.lock) out.push(lock(side === 'left' ? px - 46 : px + 46, py, p.lockLabel));
      const ax = side === 'left' ? px - sw / 2 : side === 'right' ? px + sw / 2 : px;
      const ay = side === 'top' ? py - sh / 2 : side === 'bottom' ? py + sh / 2 : py;
      anchors[p.name] = { x: ax, y: ay, side };
    });
  };
  Object.entries(ports).forEach(([side, list]) => place(side, list));
  return { svg: out.join('\n'), port: (n) => anchors[n], box: { x, y, w, h }, toString() { return this.svg; } };
}

export function lock(x, y, label) {
  return `<g opacity="0.9">
    <path d="M${x - 7} ${y - 3} v-6 a7 7 0 0 1 14 0 v6" fill="none" stroke="${C.muted}" stroke-width="2.5"/>
    <rect x="${x - 10}" y="${y - 3}" width="20" height="15" rx="3" fill="${C.muted}"/>
    ${label ? text(x, y + 34, label, { size: 14, weight: 600, fill: C.muted }) : ''}
  </g>`;
}

// PC: a small 2.5D monitor. `side` = where the cable attaches.
export function pc({ id = nextId('pc'), x, y, label, mac, side = 'left', state, zone, scale = 1, dim } = {}) {
  const w = 104 * scale, h = 70 * scale;
  const X = x - w / 2, Y = y - h / 2;
  const ring = state === 'target' ? C.traffic : state === 'ok' ? C.forward : state === 'bcast' ? C.broadcast : state === 'drop' ? C.muted : null;
  const out = [`<g id="${id}" ${dim ? 'opacity="0.45"' : ''}>`];
  if (zone) out.push(`<rect x="${X - 22}" y="${Y - 20}" width="${w + 44}" height="${h + 96 * scale}" rx="20" fill="${C.vlan[zone]}" opacity="0.10" stroke="${C.vlan[zone]}" stroke-opacity="0.35" stroke-width="2"/>`);
  if (ring) out.push(`<rect x="${X - 6}" y="${Y - 6}" width="${w + 12}" height="${h + 12}" rx="14" fill="none" stroke="${ring}" stroke-width="3" filter="url(#glow)" opacity="0.9"/>`);
  out.push(`<rect x="${X + 4}" y="${Y + 6}" width="${w}" height="${h}" rx="10" fill="${C.deviceDepth}"/>`);
  out.push(`<rect x="${X}" y="${Y}" width="${w}" height="${h}" rx="10" fill="${C.device}" stroke="${C.deviceEdge}" stroke-width="2"/>`);
  out.push(`<rect x="${X + 7}" y="${Y + 7}" width="${w - 14}" height="${h - 14}" rx="5" fill="url(#screen)"/>`);
  out.push(`<path d="M${X + 14} ${Y + 16} h${w * 0.35}" stroke="rgba(255,255,255,0.10)" stroke-width="3" stroke-linecap="round"/>`);
  out.push(`<path d="M${x - 10 * scale} ${Y + h} l-6 ${14 * scale} h${32 * scale} l-6 ${-14 * scale}z" fill="${C.deviceEdge}"/>`);
  out.push(`<rect x="${x - 26 * scale}" y="${Y + h + 13 * scale}" width="${52 * scale}" height="${6 * scale}" rx="3" fill="${C.deviceEdge}"/>`);
  if (label) out.push(text(x, Y + h + 46 * scale, label, { size: 21 * scale, weight: 700 }));
  if (mac) {
    const mw = 92 * scale;
    out.push(`<rect x="${x - mw / 2}" y="${Y + h + 56 * scale}" width="${mw}" height="${26 * scale}" rx="${13 * scale}" fill="#0B1222" stroke="${C.deviceEdge}"/>`);
    out.push(text(x, Y + h + 74 * scale, mac, { size: 16 * scale, weight: 700, font: C.mono, fill: C.muted }));
  }
  out.push(`</g>`);
  const anchor = side === 'left' ? { x: X, y } : side === 'right' ? { x: X + w, y } : side === 'top' ? { x, y: Y } : { x, y: Y + h };
  return { svg: out.join('\n'), anchor, box: { x: X, y: Y, w, h }, toString() { return this.svg; } };
}

export function router({ x, y, r = 56, label, dashed, color = C.control }) {
  return `<g opacity="${dashed ? 0.8 : 1}">
    <ellipse cx="${x}" cy="${y + 12}" rx="${r}" ry="${r * 0.38}" fill="${C.deviceDepth}" stroke="${color}" stroke-width="2" ${dashed ? 'stroke-dasharray="6 6"' : ''}/>
    <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.38}" fill="${dashed ? 'none' : C.device}" stroke="${color}" stroke-width="2.5" ${dashed ? 'stroke-dasharray="6 6"' : ''}/>
    <path d="M${x - 22} ${y} h44 M${x} ${y - 12} v24" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
    ${label ? text(x, y + r * 0.38 + 40, label, { size: 18, weight: 700, fill: color }) : ''}
  </g>`;
}

// ---------------------------------------------------------------- links

export function cable(a, b, { color = C.deviceEdge, width = 4, dash, opacity = 1, glow, bend = 0 } = {}) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 + bend;
  const d = bend ? `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}` : `M${a.x} ${a.y} L${b.x} ${b.y}`;
  const base = `<path d="${d}" stroke="${color}" stroke-width="${width}" fill="none" stroke-linecap="round" opacity="${opacity}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
  return glow ? `<path d="${d}" stroke="${color}" stroke-width="${width + 8}" fill="none" opacity="0.25" filter="url(#glowSoft)"/>${base}` : base;
}

// Trunk: one thick cable, striped with the colors of the VLANs it carries.
export function trunk(a, b, { vlans = [10, 20], width = 22, label = 'TRUNK' } = {}) {
  const id = nextId('trk');
  const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  const stripes = vlans.map((v, i) => `<rect x="${i * 18}" y="0" width="18" height="${18 * vlans.length}" fill="${C.vlan[v]}"/>`).join('');
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  return `<defs><pattern id="${id}" width="${18 * vlans.length}" height="${18 * vlans.length}" patternUnits="userSpaceOnUse" patternTransform="rotate(${ang + 45})">${stripes}</pattern></defs>
    <path d="M${a.x} ${a.y} L${b.x} ${b.y}" stroke="${C.vlan[vlans[0]]}" stroke-width="${width + 18}" opacity="0.14" filter="url(#glowSoft)"/>
    <path d="M${a.x} ${a.y} L${b.x} ${b.y}" stroke="#0A101D" stroke-width="${width + 6}" stroke-linecap="round"/>
    <path d="M${a.x} ${a.y} L${b.x} ${b.y}" stroke="url(#${id})" stroke-width="${width}" stroke-linecap="round" opacity="0.9"/>
    <path d="M${a.x} ${a.y} L${b.x} ${b.y}" stroke="rgba(255,255,255,0.18)" stroke-width="2" transform="translate(0 ${-width / 2 + 3})"/>
    ${label ? `<g transform="translate(${mx} ${my - width / 2 - 26}) rotate(${Math.abs(ang) < 90 ? ang : ang + 180})">${pill(0, 0, label, { color: C.text, bg: '#0B1222', size: 17, mono: true })}</g>` : ''}
    <!-- len ${Math.round(len)} -->`;
}

// Light trail behind a moving object (motion blur that reads as direction).
export function trail(a, b, { color = C.traffic, width = 8 } = {}) {
  const id = nextId('trl');
  return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}">
      <stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}" stop-opacity="0.9"/></linearGradient></defs>
    <path d="M${a.x} ${a.y} L${b.x} ${b.y}" stroke="url(#${id})" stroke-width="${width}" stroke-linecap="round" fill="none"/>`;
}

export const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

// ---------------------------------------------------------------- frame / tag

// Ethernet frame as a digital envelope. Field order follows the real header:
// destination first, then source, then data.
export function frame({ id = nextId('fr'), x, y, s = 1, dst = 'BB:BB', src = 'AA:AA', color = C.traffic, srcEmpty, dstEmpty, tag, tagSlot, glow = true, compact, opacity = 1, hi = {}, rot = 0 } = {}) {
  const w = 190 * s, h = 76 * s;
  const X = x - w / 2, Y = y - h / 2;
  const out = [`<g id="${id}" opacity="${opacity}" ${rot ? `transform="rotate(${rot} ${x} ${y})"` : ''}>`];
  if (glow) out.push(`<rect x="${X}" y="${Y}" width="${w}" height="${h}" rx="${12 * s}" fill="${color}" opacity="0.35" filter="url(#glowSoft)"/>`);
  out.push(`<rect x="${X}" y="${Y}" width="${w}" height="${h}" rx="${12 * s}" fill="#0B1426" stroke="${color}" stroke-width="${2.5 * s}"/>`);
  out.push(`<path d="M${X + 8 * s} ${Y + 7 * s} L${x} ${Y + 24 * s} L${X + w - 8 * s} ${Y + 7 * s}" fill="none" stroke="${color}" stroke-opacity="0.55" stroke-width="${2 * s}" stroke-linejoin="round"/>`);
  if (!compact) {
    const fy = Y + 30 * s, fh = 38 * s;
    const field = (fx, fw, lab, val, empty, h2) => empty
      ? `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="${5 * s}" fill="none" stroke="${color}" stroke-opacity="0.6" stroke-dasharray="${4 * s} ${4 * s}"/>`
      : `${h2 ? `<rect x="${fx - 3 * s}" y="${fy - 3 * s}" width="${fw + 6 * s}" height="${fh + 6 * s}" rx="${7 * s}" fill="none" stroke="${h2}" stroke-width="${3 * s}" filter="url(#glow)"/>` : ''}
         <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="${5 * s}" fill="${h2 || color}" fill-opacity="${h2 ? 0.3 : 0.14}" stroke="${h2 || color}" stroke-opacity="0.5"/>
         ${text(fx + fw / 2, fy + 13 * s, lab, { size: 10 * s, weight: 700, fill: color, ls: 1 })}
         ${text(fx + fw / 2, fy + 31 * s, val, { size: 15 * s, weight: 700, font: C.mono })}`;
    out.push(field(X + 9 * s, 66 * s, 'DST', dst, dstEmpty, hi.dst));
    out.push(field(X + 81 * s, 66 * s, 'SRC', src, srcEmpty, hi.src));
    for (let i = 0; i < 3; i++) out.push(`<rect x="${X + 155 * s}" y="${fy + (7 + i * 10) * s}" width="${(i === 2 ? 14 : 24) * s}" height="${4 * s}" rx="${2 * s}" fill="${C.muted}" opacity="0.6"/>`);
  }
  if (tag) out.push(vlanTag({ x: X + 18 * s, y: Y - 2 * s, vlan: tag, s }));
  if (tagSlot) out.push(`<rect x="${X + 18 * s}" y="${Y - 32 * s}" width="${112 * s}" height="${30 * s}" rx="${7 * s}" fill="none" stroke="${tagSlot}" stroke-width="${2 * s}" stroke-dasharray="${5 * s} ${5 * s}"/>`);
  out.push(`</g>`);
  return { svg: out.join('\n'), box: { x: X, y: Y, w, h }, srcField: { x: X + 114 * s, y: Y + 49 * s }, dstField: { x: X + 42 * s, y: Y + 49 * s }, toString() { return this.svg; } };
}

// 802.1Q tag badge clipped on the frame. Its label names the real standard so
// the metaphor never drifts from the mechanism.
export function vlanTag({ x, y, vlan = 10, s = 1, label } = {}) {
  const col = C.vlan[vlan];
  const w = 112 * s, h = 30 * s;
  return `<g>
    <rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="${7 * s}" fill="${col}" filter="url(#glow)"/>
    <circle cx="${x + 13 * s}" cy="${y - h / 2}" r="${4 * s}" fill="#0B1426"/>
    ${text(x + 22 * s, y - h / 2 + 6 * s, label || `VLAN ${vlan}`, { size: 16 * s, weight: 800, anchor: 'start', fill: '#fff' })}
    <path d="M${x + 30 * s} ${y} v${8 * s} M${x + w - 30 * s} ${y} v${8 * s}" stroke="${col}" stroke-width="${4 * s}" stroke-linecap="round"/>
  </g>`;
}

// ---------------------------------------------------------------- panels

export function macTable({ x, y, w = 460, title = 'TABLE MAC · SW1', cols = ['PORT', 'MAC'], rows = [], slots = 4, rowH = 58 } = {}) {
  const headH = 50, titleH = 46;
  const h = titleH + headH + slots * rowH + 18;
  const cw = w / cols.length;
  const out = [`<g filter="url(#shadow)">`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#0C1427" fill-opacity="0.92" stroke="${C.deviceEdge}" stroke-width="2"/>`,
    `</g>`,
    text(x + 24, y + 31, title, { size: 16, weight: 700, font: C.mono, fill: C.muted, anchor: 'start', ls: 1 }),
    `<path d="M${x} ${y + titleH} H${x + w}" stroke="${C.deviceEdge}"/>`];
  cols.forEach((c, i) => out.push(text(x + cw * i + cw / 2, y + titleH + 32, c, { size: 17, weight: 800, fill: C.text, ls: 2 })));
  out.push(`<path d="M${x + 16} ${y + titleH + headH} H${x + w - 16}" stroke="${C.deviceEdge}" stroke-width="2"/>`);
  const rowPos = [];
  for (let i = 0; i < slots; i++) {
    const ry = y + titleH + headH + 9 + i * rowH;
    const r = rows[i];
    rowPos.push({ x: x + 16, y: ry, w: w - 32, h: rowH - 10, cx: x + w / 2, cy: ry + (rowH - 10) / 2 });
    if (!r) {
      out.push(`<rect x="${x + 16}" y="${ry}" width="${w - 32}" height="${rowH - 10}" rx="8" fill="none" stroke="${C.deviceEdge}" stroke-dasharray="3 7" opacity="0.7"/>`);
      continue;
    }
    const col = r.state === 'new' ? C.forward : r.state === 'hit' ? C.decision : r.state === 'ghost' ? C.forward : C.deviceEdge;
    const fillOp = r.state === 'ghost' ? 0.06 : r.state ? 0.16 : 0.06;
    out.push(`<rect x="${x + 16}" y="${ry}" width="${w - 32}" height="${rowH - 10}" rx="8" fill="${col}" fill-opacity="${fillOp}" stroke="${col}" stroke-opacity="${r.state ? 0.9 : 0.4}" stroke-width="2" ${r.state === 'ghost' ? 'stroke-dasharray="8 6"' : ''} ${r.state && r.state !== 'ghost' ? 'filter="url(#glow)"' : ''}/>`);
    if (r.state && r.state !== 'ghost') out.push(`<rect x="${x + 16}" y="${ry}" width="6" height="${rowH - 10}" rx="3" fill="${col}"/>`);
    r.cells.forEach((v, i) => {
      if (v === null) return;
      const isVlan = cols[i] === 'VLAN' && C.vlan[v];
      out.push(text(x + cw * i + cw / 2, ry + (rowH - 10) / 2 + 8, v, { size: 24, weight: 700, font: C.mono, fill: isVlan ? C.vlan[v] : C.text, opacity: r.state === 'ghost' ? 0.55 : 1 }));
    });
    if (r.tagText) out.push(pill(x + w + 18, ry + (rowH - 10) / 2, r.tagText, { color: col, anchor: 'start', size: 16 }));
  }
  return { svg: out.join('\n'), rows: rowPos, box: { x, y, w, h }, toString() { return this.svg; } };
}

export function pill(x, y, str, { color = C.text, bg = '#0B1222', size = 18, anchor = 'middle', mono = false, weight = 800, filled = false } = {}) {
  const cw = size * (mono ? 0.62 : 0.6);
  const w = str.length * cw + size * 1.4;
  const h = size * 1.75;
  const X = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  return `<g>
    <rect x="${X}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${filled ? color : bg}" stroke="${color}" stroke-width="2" ${filled ? '' : `stroke-opacity="0.8"`}/>
    ${text(X + w / 2, y + size * 0.36, str, { size, weight, fill: filled ? '#0B1222' : color, font: mono ? C.mono : C.ui, ls: mono ? 0 : 1 })}
  </g>`;
}

export function thoughtBubble({ x, y, str, color = C.decision, size = 26, tail = { x: x, y: y + 90 } }) {
  const w = str.length * size * 0.56 + 64, h = size * 2.6;
  const X = x - w / 2, Y = y - h / 2;
  return `<g filter="url(#shadow)">
    <rect x="${X}" y="${Y}" width="${w}" height="${h}" rx="${h / 2}" fill="#101A30" stroke="${color}" stroke-width="2.5"/>
    <circle cx="${(x + tail.x) / 2 + 6}" cy="${Y + h + 16}" r="9" fill="#101A30" stroke="${color}" stroke-width="2.5"/>
    <circle cx="${tail.x}" cy="${tail.y - 10}" r="5" fill="#101A30" stroke="${color}" stroke-width="2.5"/>
    ${text(x, y + size * 0.36, str, { size, weight: 800, fill: color })}
  </g>`;
}

export function counter({ x, y, value, label, color = C.broadcast }) {
  return `<g>
    ${text(x, y, value, { size: 88, weight: 800, font: C.mono, fill: color })}
    ${text(x, y + 38, label, { size: 22, weight: 700, fill: C.muted, ls: 4 })}
  </g>`;
}

// Magnifier inset: a panel linked to a point in the scene by two leader lines.
export function inset({ x, y, w, h, to, color = C.vlan[10], title }) {
  return `<g>
    <path d="M${to.x} ${to.y} L${x + 40} ${y + h}" stroke="${color}" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="4 6"/>
    <path d="M${to.x} ${to.y} L${x + w - 40} ${y + h}" stroke="${color}" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="4 6"/>
    <circle cx="${to.x}" cy="${to.y}" r="7" fill="${color}" filter="url(#glow)"/>
    <g filter="url(#shadow)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#0A1224" fill-opacity="0.96" stroke="${color}" stroke-opacity="0.7" stroke-width="2.5"/></g>
    ${title ? text(x + 30, y + 42, title, { size: 18, weight: 700, font: C.mono, fill: C.muted, anchor: 'start', ls: 1 }) : ''}
  </g>`;
}

export function zone({ x, y, w, h, vlan, label }) {
  const col = C.vlan[vlan];
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="${col}" fill-opacity="0.07" stroke="${col}" stroke-opacity="0.45" stroke-width="2" stroke-dasharray="10 8"/>
    ${label ? pill(x + 24, y, label, { color: col, anchor: 'start', size: 16 }) : ''}
  </g>`;
}

// ---------------------------------------------------------------- motion helpers

export function g(content, { opacity = 1, x = 0, y = 0, s = 1, rot = 0, ox = 0, oy = 0 } = {}) {
  if (opacity <= 0.001) return '';
  const tf = [];
  if (x || y) tf.push(`translate(${x} ${y})`);
  if (s !== 1 || rot) tf.push(`translate(${ox} ${oy})`, rot ? `rotate(${rot})` : '', s !== 1 ? `scale(${s})` : '', `translate(${-ox} ${-oy})`);
  return `<g ${opacity < 1 ? `opacity="${opacity.toFixed(3)}"` : ''} ${tf.length ? `transform="${tf.join(' ')}"` : ''}>${content}</g>`;
}

export function arrow(a, b, { color = C.forward, width = 5, head = 16, opacity = 1, dash, glow } = {}) {
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const hx = b.x - Math.cos(ang) * head, hy = b.y - Math.sin(ang) * head;
  const l = { x: hx + Math.cos(ang + Math.PI / 2) * head * 0.6, y: hy + Math.sin(ang + Math.PI / 2) * head * 0.6 };
  const r = { x: hx - Math.cos(ang + Math.PI / 2) * head * 0.6, y: hy - Math.sin(ang + Math.PI / 2) * head * 0.6 };
  return `<g opacity="${opacity}" ${glow ? 'filter="url(#glow)"' : ''}>
    <path d="M${a.x} ${a.y} L${hx} ${hy}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" fill="none" ${dash ? `stroke-dasharray="${dash}"` : ''}/>
    <path d="M${b.x} ${b.y} L${l.x} ${l.y} L${r.x} ${r.y} Z" fill="${color}"/></g>`;
}

export function ring(x, y, r, color, opacity = 1, width = 3) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}" filter="url(#glow)"/>`;
}

export function stamp(x, y, str, { color = C.error, size = 72, rot = -6, opacity = 1, s = 1 } = {}) {
  const w = str.length * size * 0.66 + size * 0.9, h = size * 1.35;
  return g(`<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${size * 0.22}" fill="#1A0B12" fill-opacity="0.85" stroke="${color}" stroke-width="${size * 0.09}" filter="url(#glow)"/>
    ${text(x, y + size * 0.36, str, { size, weight: 800, fill: color, ls: 3 })}`, { opacity, rot, s, ox: x, oy: y });
}

export function banner(x, y, str, { color = C.error, size = 26, opacity = 1 } = {}) {
  return g(pill(x, y, str, { color, size, filled: true, mono: true }), { opacity });
}

// Terminal strip; `chars` limits how many characters are typed so far.
export function cli(x, y, w, lines, { chars = Infinity, host = 'SW1(config-if)#' } = {}) {
  const lh = 38, h = lines.length * lh + 34;
  let left = chars;
  const rows = lines.map((l, i) => {
    const shown = l.slice(0, Math.max(0, Math.min(l.length, left)));
    left -= l.length;
    const typing = left < 0 && left > -l.length - 1 && shown.length < l.length;
    return `${text(x + 24, y + 42 + i * lh, host, { size: 20, weight: 600, font: C.mono, fill: C.muted, anchor: 'start' })}
      ${text(x + 24 + host.length * 12.4 + 12, y + 42 + i * lh, shown, { size: 20, weight: 700, font: C.mono, fill: C.forward, anchor: 'start' })}
      ${typing ? `<rect x="${x + 24 + host.length * 12.4 + 12 + shown.length * 12.4}" y="${y + 24 + i * lh}" width="11" height="22" fill="${C.forward}"/>` : ''}`;
  });
  return `<g filter="url(#shadow)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#050910" fill-opacity="0.94" stroke="${C.deviceEdge}" stroke-width="2"/></g>
    <circle cx="${x + w - 60}" cy="${y + 18}" r="5" fill="${C.error}" opacity="0.7"/><circle cx="${x + w - 42}" cy="${y + 18}" r="5" fill="${C.broadcast}" opacity="0.7"/><circle cx="${x + w - 24}" cy="${y + 18}" r="5" fill="${C.forward}" opacity="0.7"/>
    ${rows.join('')}`;
}

// Heads-up panel: rows [{k, v, color}], `hi` = index of highlighted row.
export function hud(x, y, w, rows, { title = 'DÉCISION DU SWITCH', hi = -1, rowH = 84 } = {}) {
  const h = 60 + rows.length * rowH;
  const out = [`<g filter="url(#shadow)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#0C1427" fill-opacity="0.94" stroke="${C.deviceEdge}" stroke-width="2"/></g>`,
    text(x + 24, y + 38, title, { size: 16, weight: 700, font: C.mono, fill: C.muted, anchor: 'start', ls: 2 })];
  rows.forEach((r, i) => {
    const ry = y + 58 + i * rowH;
    if (i === hi) out.push(`<rect x="${x + 10}" y="${ry}" width="${w - 20}" height="${rowH - 8}" rx="10" fill="${C.decision}" fill-opacity="0.14" stroke="${C.decision}" stroke-width="2"/>`);
    out.push(text(x + 26, ry + 28, r.k, { size: 14, weight: 800, fill: i === hi ? C.decision : C.muted, anchor: 'start', ls: 2 }));
    out.push(text(x + 26, ry + 62, r.v, { size: r.size || 25, weight: 700, font: C.mono, fill: r.color || C.text, anchor: 'start' }));
  });
  return out.join('\n');
}

// Deterministic dissolve: particles drift up and fade as k goes 0 → 1.
export function particles(x, y, k, color, { n = 18, spread = 70, seed = 1 } = {}) {
  if (k <= 0 || k >= 1) return '';
  let r = seed * 9301 + 49297;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, d = spread * (0.3 + rnd()) * k;
    out.push(`<rect x="${x + Math.cos(a) * d}" y="${y + Math.sin(a) * d - 30 * k}" width="${6 * (1 - k) + 2}" height="${6 * (1 - k) + 2}" rx="1" fill="${color}" opacity="${(1 - k).toFixed(2)}"/>`);
  }
  return out.join('');
}

export function door(x, y, h = 70, color = C.muted) {
  const w = h * 0.55;
  return `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="4" fill="#101A30" stroke="${color}" stroke-width="3"/>
    <circle cx="${x + w / 2 - 8}" cy="${y - h / 2}" r="3.5" fill="${color}"/>`;
}

export function eyeSlash(x, y, color = C.muted) {
  return `<g stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round">
    <path d="M${x - 30} ${y} Q${x} ${y - 26} ${x + 30} ${y} Q${x} ${y + 26} ${x - 30} ${y}Z"/><circle cx="${x}" cy="${y}" r="8"/>
    <path d="M${x - 30} ${y + 24} L${x + 30} ${y - 24}" stroke="${C.error}"/></g>`;
}

export function building(x, y, { floors = [30, 20, 10], w = 420, fh = 150, labels } = {}) {
  const out = [`<path d="M${x - w / 2 - 20} ${y - floors.length * fh - 40} L${x} ${y - floors.length * fh - 110} L${x + w / 2 + 20} ${y - floors.length * fh - 40}Z" fill="${C.device}" stroke="${C.deviceEdge}" stroke-width="3"/>`];
  floors.forEach((v, i) => {
    const fy = y - (i + 1) * fh - 20;
    const col = C.vlan[v];
    out.push(`<rect x="${x - w / 2}" y="${fy}" width="${w}" height="${fh}" fill="${col}" fill-opacity="0.16" stroke="${col}" stroke-width="3"/>`);
    for (let k = 0; k < 4; k++) out.push(`<rect x="${x - w / 2 + 30 + k * 95}" y="${fy + 40}" width="60" height="70" rx="6" fill="${col}" fill-opacity="0.35"/>`);
    if (labels) out.push(text(x + w / 2 + 30, fy + fh / 2 + 9, labels[i], { size: 26, weight: 800, fill: col, anchor: 'start' }));
  });
  return out.join('');
}

export function elevator(x, y, { h = 420, k = 0.5 } = {}) {
  const cy = y - 60 - (h - 120) * k;
  return `<rect x="${x - 70}" y="${y - h}" width="140" height="${h}" rx="10" fill="none" stroke="${C.deviceEdge}" stroke-width="3" stroke-dasharray="8 8"/>
    <rect x="${x - 55}" y="${cy - 55}" width="110" height="110" rx="10" fill="${C.device}" stroke="${C.text}" stroke-width="3"/>
    <rect x="${x - 40}" y="${cy - 30}" width="24" height="24" rx="4" fill="${C.vlan[10]}"/><rect x="${x - 12}" y="${cy - 30}" width="24" height="24" rx="4" fill="${C.vlan[20]}"/><rect x="${x + 16}" y="${cy - 30}" width="24" height="24" rx="4" fill="${C.vlan[30]}"/>`;
}

export function check(x, y, color = C.forward, size = 30) {
  return `<path d="M${x - size * 0.6} ${y} L${x - size * 0.15} ${y + size * 0.45} L${x + size * 0.65} ${y - size * 0.5}" stroke="${color}" stroke-width="${size * 0.2}" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>`;
}

export function cross(x, y, color = C.error, size = 26) {
  return `<path d="M${x - size / 2} ${y - size / 2} L${x + size / 2} ${y + size / 2} M${x + size / 2} ${y - size / 2} L${x - size / 2} ${y + size / 2}" stroke="${color}" stroke-width="${size * 0.22}" stroke-linecap="round"/>`;
}
