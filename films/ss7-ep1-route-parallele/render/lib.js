/* ============================================================
   SIGNALISATION SÉMAPHORE N°7 — Ép.1
   Shared drawing library : palette, textures, easing, primitives
   ============================================================ */
const W = 2000, H = 1125;            // espace logique ; le rendu applique x0,96
const SCALE = 1920 / W;

const C = {
  /* SS7 « LE CAHIER » — papier crème, encre, vermillon = la parole, bleu = la signalisation */
  papier:  '#EDE4D2',
  papier2: '#E2D6BE',
  papier3: '#F7F2E6',
  encre:   '#1C2B33',
  encre2:  '#45575F',
  encre3:  '#7E8C92',
  rouge:   '#C8412B',  rougeL: '#E0634A',   // la parole, le circuit
  bleu:    '#1F5F8B',  bleuL:  '#3C87B8',   // la signalisation, SS7
  jaune:   '#F2C14E',  jauneL: '#F8D77F',   // le surligneur
  vert:    '#4A7C59',
  carreau: '#9FB6C2',
  /* alias de compatibilité (lib2.js) */
  night:  '#EDE4D2', night2: '#E2D6BE', night3: '#F7F2E6',
  cream:  '#1C2B33',  cream2: '#45575F',  cream3: '#7E8C92',
  amber:  '#C8412B',  amberL: '#C8412B',
  teal:   '#1F5F8B',  tealL:  '#1F5F8B',
  earth:  '#45575F',  cold:   '#7E8C92',
  red:    '#C8412B',  green:  '#4A7C59',
  voix:   '#C8412B',  voixL:  '#E0634A',
  sig:    '#1F5F8B',  sigL:   '#3C87B8',
  or:     '#C9962E',  orL:    '#F2C14E',
  steel:  '#7E8C92',
};

const F = {
  d: 'Archivo',    // titres
  b: 'Plex',       // texte courant
  m: 'PlexMono',   // codes, bits, chiffres
  h: 'Caveat',     // annotations à la main
  c: 'Saira',      // intertitres condensés
};

/* ---------- easing ---------- */
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lerp  = (a, b, t) => a + (b - a) * t;
// normalised sub-range: returns 0..1 for t between a and b
const seg   = (t, a, b) => clamp((t - a) / (b - a));
const eOutC = t => 1 - Math.pow(1 - t, 3);
const eOutQ = t => 1 - Math.pow(1 - t, 4);
const eOutE = t => t >= 1 ? 1 : 1 - Math.pow(2, -9 * t);
const eInC  = t => t * t * t;
const eIO   = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eBack = t => { const c = 1.70158 + 1; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
// fade in then out across [a,b] with ramp r
const band  = (t, a, b, r = .4) => Math.min(seg(t, a, a + r), 1 - seg(t, b - r, b));

/* ---------- textures (built once) ---------- */
let grainTiles = [], paperTile = null, htTile = null;

function buildTextures() {
  // --- film grain : 6 monochrome noise tiles, cycled per frame
  for (let k = 0; k < 6; k++) {
    const s = 512, cv = new OffscreenCanvas(s, s), x = cv.getContext('2d');
    const im = x.createImageData(s, s), d = im.data;
    for (let i = 0; i < s * s; i++) {
      // gaussian-ish noise => finer, more filmic than flat random
      const n = ((Math.random() + Math.random() + Math.random()) / 3 - .5) * 255;
      const v = 128 + n * 1.5;
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255;
    }
    x.putImageData(im, 0, 0);
    grainTiles.push(cv);
  }
  // --- paper fibre : very low freq horizontal/vertical streaks
  {
    const s = 1024, cv = new OffscreenCanvas(s, s), x = cv.getContext('2d');
    x.fillStyle = '#808080'; x.fillRect(0, 0, s, s);
    for (let i = 0; i < 2600; i++) {
      const y = Math.random() * s, len = 40 + Math.random() * 300;
      x.strokeStyle = `rgba(${Math.random() > .5 ? 255 : 0},${Math.random() > .5 ? 255 : 0},255,.018)`;
      x.lineWidth = .6 + Math.random();
      x.beginPath(); x.moveTo(Math.random() * s, y);
      x.lineTo(Math.random() * s + len, y + (Math.random() - .5) * 8); x.stroke();
    }
    paperTile = cv;
  }
  // --- halftone dot screen
  {
    const s = 8, cv = new OffscreenCanvas(s, s), x = cv.getContext('2d');
    x.clearRect(0, 0, s, s);
    x.fillStyle = 'rgba(255,255,255,.9)';
    x.beginPath(); x.arc(s / 2, s / 2, 1.15, 0, 7); x.fill();
    htTile = cv;
  }
}

/* grain overlay — amount 0..1 */
function grain(g, frame, amount = 1) {
  const t = grainTiles[frame % grainTiles.length];
  const ox = (frame * 137) % 512, oy = (frame * 311) % 512;
  g.save();
  g.globalCompositeOperation = 'overlay';
  g.globalAlpha = .042 * amount;
  const p = g.createPattern(t, 'repeat');
  p.setTransform(new DOMMatrix().translate(-ox, -oy));
  g.fillStyle = p; g.fillRect(0, 0, W, H);
  // second, larger pass for coarse structure
  g.globalAlpha = .022 * amount;
  const p2 = g.createPattern(grainTiles[(frame + 3) % grainTiles.length], 'repeat');
  p2.setTransform(new DOMMatrix().translate(oy, ox).scale(2.4));
  g.fillStyle = p2; g.fillRect(0, 0, W, H);
  g.restore();
}

function paper(g, alpha = .05) {
  g.save();
  g.globalCompositeOperation = 'overlay';
  g.globalAlpha = alpha;
  const p = g.createPattern(paperTile, 'repeat');
  p.setTransform(new DOMMatrix().scale(1.9));
  g.fillStyle = p; g.fillRect(0, 0, W, H);
  g.restore();
}

/* halftone inside an arbitrary clip path (call between save/clip) */
function halftone(g, x, y, w, h, alpha, scale = 1) {
  g.save();
  g.globalAlpha = alpha;
  const p = g.createPattern(htTile, 'repeat');
  p.setTransform(new DOMMatrix().scale(scale));
  g.fillStyle = p; g.fillRect(x, y, w, h);
  g.restore();
}

/* ---------- backgrounds ---------- */
/* la page : papier crème légèrement inégal */
function bgPaper(g) {
  const gr = g.createRadialGradient(W * .42, H * .38, 140, W * .5, H * .52, W * .86);
  gr.addColorStop(0, C.papier3);
  gr.addColorStop(.52, C.papier);
  gr.addColorStop(1, C.papier2);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
const bgNight = bgPaper;   // alias : les anciens appels continuent de marcher

/* les petits carreaux du cahier, + la marge rouge */
const MARGE = 152;
function carreaux(g, alpha = 1) {
  const S1 = 27.5, S2 = S1 * 4;
  g.save();
  g.lineWidth = 1;
  g.strokeStyle = `rgba(159,182,194,${0.30 * alpha})`;
  g.beginPath();
  for (let x = 0; x < W; x += S1) { g.moveTo(x + .5, 0); g.lineTo(x + .5, H); }
  for (let y = 0; y < H; y += S1) { g.moveTo(0, y + .5); g.lineTo(W, y + .5); }
  g.stroke();
  g.strokeStyle = `rgba(123,152,168,${0.42 * alpha})`;
  g.beginPath();
  for (let x = 0; x < W; x += S2) { g.moveTo(x + .5, 0); g.lineTo(x + .5, H); }
  for (let y = 0; y < H; y += S2) { g.moveTo(0, y + .5); g.lineTo(W, y + .5); }
  g.stroke();
  g.strokeStyle = `rgba(200,65,43,${0.46 * alpha})`; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(MARGE + .5, 0); g.lineTo(MARGE + .5, H); g.stroke();
  g.restore();
}

/* faint blueprint grid */
function grid(g, alpha = .05, step = 60, ox = 0, oy = 0) {
  g.save();
  g.strokeStyle = `rgba(159,182,194,${alpha * 2})`;
  g.lineWidth = 1;
  g.beginPath();
  for (let x = ox % step; x < W; x += step) { g.moveTo(x + .5, 0); g.lineTo(x + .5, H); }
  for (let y = oy % step; y < H; y += step) { g.moveTo(0, y + .5); g.lineTo(W, y + .5); }
  g.stroke();
  g.restore();
}

function vignette(g, amt = .5) {
  const v = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, W * .72);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, `rgba(120,96,58,${amt * 0.34})`);
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}

/* ---------- type ---------- */
function setFont(g, fam, size, weight = 400, tracking = 0) {
  g.font = `${weight} ${size}px "${fam}", sans-serif`;
  g.letterSpacing = tracking + 'px';
}

/* reveal text character by character, with the last char fading in */
function typeOn(g, text, x, y, u, align = 'left') {
  if (u <= 0) return 0;
  const prevAlign = g.textAlign; g.textAlign = 'left';   // we position by hand
  const n = text.length * clamp(u);
  const full = Math.floor(n), frac = n - full;
  const shown = text.slice(0, full);
  const next = text[full] || '';
  const wFull = g.measureText(shown).width;
  const wNext = g.measureText(next).width;
  let ox = 0;
  if (align === 'center') ox = -(wFull + wNext * frac) / 2;
  if (align === 'right')  ox = -(wFull + wNext * frac);
  g.fillText(shown, x + ox, y);
  if (next) { const a = g.globalAlpha; g.globalAlpha = a * frac; g.fillText(next, x + ox + wFull, y); g.globalAlpha = a; }
  g.textAlign = prevAlign;
  return wFull + wNext * frac;
}

/* soft glow helper */
function glow(g, color, blur, fn) {
  g.save(); g.shadowColor = color; g.shadowBlur = blur; fn(); g.restore();
}

/* a thin rule that draws itself */
function rule(g, x, y, len, u, color = C.cream2, lw = 2, dir = 1) {
  if (u <= 0) return;
  g.save(); g.strokeStyle = color; g.lineWidth = lw; g.lineCap = 'butt';
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + len * eOutE(clamp(u)) * dir, y); g.stroke();
  g.restore();
}

/* ---------- geometry primitives ---------- */
/* quadratic-ish arc between two points bulging away from centre */
function arcPath(x1, y1, x2, y2, bulge) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
  const nx = -dy / L, ny = dx / L;
  return { x1, y1, x2, y2, cx: mx + nx * bulge, cy: my + ny * bulge };
}
function arcPt(p, t) {
  const it = 1 - t;
  return {
    x: it * it * p.x1 + 2 * it * t * p.cx + t * t * p.x2,
    y: it * it * p.y1 + 2 * it * t * p.cy + t * t * p.y2,
  };
}
/* stroke a partial quadratic curve 0..u */
function strokeArc(g, p, u, steps = 90) {
  u = clamp(u); if (u <= 0) return;
  g.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * u, q = arcPt(p, t);
    i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y);
  }
  g.stroke();
}

/* expanding ring pulse */
function pulse(g, x, y, u, maxR, color, lw = 2.5) {
  if (u <= 0 || u >= 1) return;
  const e = eOutE(u);
  g.save();
  g.globalAlpha *= (1 - u) * (1 - u);
  g.strokeStyle = color; g.lineWidth = lw * (1 - u * .5);
  g.beginPath(); g.arc(x, y, 6 + maxR * e, 0, 7); g.stroke();
  g.restore();
}

/* ---------- objects ---------- */
/* line-art communications satellite, drawn centred at (x,y) */
function satellite(g, x, y, s, u = 1, color = C.cream, lw = 2.4, pulseU = -1) {
  if (u <= 0) return;
  g.save();
  g.translate(x, y); g.scale(s, s);
  g.strokeStyle = color; g.lineWidth = lw / s; g.lineJoin = 'round'; g.lineCap = 'round';
  g.globalAlpha *= clamp(u * 1.6);
  // body
  g.beginPath(); g.rect(-11, -9, 22, 18); g.stroke();
  // body detail
  g.beginPath(); g.moveTo(-11, -2); g.lineTo(11, -2); g.stroke();
  // solar panels
  for (const dir of [-1, 1]) {
    g.beginPath(); g.rect(dir * 13, -7, dir * 26, 14); g.stroke();
    for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(dir * (13 + i * 6.5), -7); g.lineTo(dir * (13 + i * 6.5), 7); g.stroke(); }
    g.beginPath(); g.moveTo(dir * 13, 0); g.lineTo(dir * 39, 0); g.stroke();
  }
  // dish
  g.beginPath(); g.ellipse(0, 14, 8, 4.2, 0, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(0, 9); g.lineTo(0, 14); g.stroke();
  g.restore();
  if (pulseU >= 0 && pulseU < 1) {
    g.save(); g.globalAlpha *= .9;
    pulse(g, x, y, pulseU, 58 * s, C.amberL, 3);
    g.restore();
  }
}

/* parabolic ground station dish, base at (x,y), facing up-ish by angle a */
function groundStation(g, x, y, s, a, u = 1, color = C.cream, active = 0) {
  if (u <= 0) return;
  g.save();
  g.translate(x, y); g.scale(s, s);
  g.strokeStyle = color; g.lineWidth = 2.4 / s; g.lineJoin = 'round'; g.lineCap = 'round';
  g.globalAlpha *= clamp(u * 1.6);
  // mast
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -16); g.stroke();
  // base
  g.beginPath(); g.moveTo(-9, 0); g.lineTo(9, 0); g.stroke();
  g.beginPath(); g.moveTo(-6, 0); g.lineTo(-3, -7); g.moveTo(6, 0); g.lineTo(3, -7); g.stroke();
  // dish
  g.save(); g.translate(0, -16); g.rotate(a);
  g.beginPath(); g.ellipse(0, 0, 16, 7, 0, Math.PI, 0); g.stroke();
  g.beginPath(); g.moveTo(-16, 0); g.lineTo(16, 0); g.stroke();
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -9); g.stroke();
  g.beginPath(); g.arc(0, -9, 2.4, 0, 7); g.stroke();
  if (active > 0) { g.globalAlpha *= active; g.fillStyle = C.amberL; g.beginPath(); g.arc(0, -9, 2.4, 0, 7); g.fill(); }
  g.restore();
  g.restore();
}

/* relay tower (terrestrial network) */
function tower(g, x, y, h, u = 1, color = C.cream2) {
  if (u <= 0) return;
  g.save(); g.strokeStyle = color; g.lineWidth = 1.8; g.lineCap = 'round';
  g.globalAlpha *= clamp(u * 2);
  const hh = h * eOutC(clamp(u));
  g.beginPath();
  g.moveTo(x - h * .17, y); g.lineTo(x, y - hh); g.lineTo(x + h * .17, y);
  g.stroke();
  const n = 3;
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1), yy = y - hh * t, w = h * .17 * (1 - t);
    g.beginPath(); g.moveTo(x - w, yy); g.lineTo(x + w, yy); g.stroke();
  }
  g.restore();
}

/* ---- coarse continent outlines, [lon,lat] degrees ---- */
const LAND = [
  [[-17,15],[0,25],[12,32],[32,31],[43,12],[51,12],[43,-2],[40,-16],[32,-27],[25,-34],[18,-34],[12,-18],[9,0],[-8,4],[-17,15]],
  [[-10,36],[0,44],[12,45],[28,41],[45,40],[60,45],[90,52],[112,48],[122,40],[135,35],[142,46],[150,57],[170,66],[160,71],[120,74],[85,76],[55,72],[30,70],[12,66],[2,58],[-6,48],[-10,36]],
  [[-168,65],[-150,59],[-132,52],[-124,40],[-116,31],[-97,26],[-83,25],[-80,32],[-72,41],[-62,46],[-56,52],[-66,60],[-82,70],[-102,72],[-126,70],[-156,70],[-168,65]],
  [[-80,8],[-62,10],[-50,0],[-35,-6],[-38,-20],[-48,-25],[-58,-38],[-67,-50],[-73,-53],[-75,-44],[-71,-30],[-70,-18],[-78,-5],[-80,8]],
  [[114,-22],[130,-12],[142,-11],[146,-19],[153,-28],[150,-37],[140,-38],[129,-32],[115,-34],[114,-22]],
  [[-45,60],[-22,70],[-20,81],[-44,83],[-60,77],[-54,65],[-45,60]],
  [[95,22],[105,10],[112,2],[100,2],[98,13],[95,22]],
];
const D2R = Math.PI / 180;

/* orthographic projection; points behind the limb are pushed onto it */
function proj(lon, lat, spin, cx, cy, r) {
  const la = lat * D2R, lo = lon * D2R + spin;
  let x = Math.cos(la) * Math.sin(lo), y = Math.sin(la), z = Math.cos(la) * Math.cos(lo);
  if (z < 0) { const m = Math.hypot(x, y) || 1; x /= m; y /= m; }
  return { x: cx + r * x, y: cy - r * y, z };
}

/* stylised globe, orthographic, with real continent silhouettes */
function globe(g, cx, cy, r, spin, opt = {}) {
  const { landAlpha = 1, lineAlpha = .5 } = opt;
  g.save();
  // ocean
  const sp = g.createRadialGradient(cx - r * .34, cy - r * .38, r * .06, cx, cy, r);
  sp.addColorStop(0, '#53809E');
  sp.addColorStop(.52, '#3C6180');
  sp.addColorStop(1, '#1E3449');
  g.fillStyle = sp; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();

  g.save();
  g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip();

  // graticule under the land
  g.globalAlpha = lineAlpha * .22;
  g.strokeStyle = '#BBD3E6'; g.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    const lat = i * 30 * D2R, y = cy - r * Math.sin(lat), rr = r * Math.cos(lat);
    g.beginPath(); g.ellipse(cx, y, rr, rr * .1, 0, 0, 7); g.stroke();
  }
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6 + spin, k = Math.cos(a);
    if (k < .02) continue;
    g.beginPath(); g.ellipse(cx, cy, r * k, r, 0, 0, 7); g.stroke();
  }

  // continents
  g.globalAlpha = landAlpha;
  for (const poly of LAND) {
    const pts = poly.map(([lo, la]) => proj(lo, la, spin, cx, cy, r));
    if (pts.every(p => p.z < .02)) continue;                  // fully on the far side
    const vis = pts.reduce((a, p) => a + (p.z > 0 ? 1 : 0), 0) / pts.length;
    g.save();
    g.globalAlpha *= Math.min(1, .25 + vis * 1.3);
    g.beginPath();
    pts.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y));
    g.closePath();
    g.fillStyle = '#48615F'; g.fill();
    g.strokeStyle = 'rgba(190,212,210,.30)'; g.lineWidth = 1.1; g.stroke();
    g.restore();
  }
  g.restore();

  // terminator + rim
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip();
  const sh = g.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  sh.addColorStop(0, 'rgba(0,0,0,0)');
  sh.addColorStop(.6, 'rgba(6,12,22,.20)');
  sh.addColorStop(1, 'rgba(4,9,18,.66)');
  g.fillStyle = sh; g.fillRect(cx - r, cy - r, r * 2, r * 2);
  g.restore();

  g.save();
  g.globalCompositeOperation = 'lighter';
  const rim = g.createRadialGradient(cx, cy, r * .93, cx, cy, r * 1.10);
  rim.addColorStop(0, 'rgba(0,0,0,0)');
  rim.addColorStop(.42, 'rgba(150,88,30,.40)');
  rim.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rim; g.beginPath(); g.arc(cx, cy, r * 1.14, 0, 7); g.fill();
  g.restore();
  g.restore();
}

/* telemetry label : small caps mono with a leading tick */
function telem(g, x, y, label, value, u, opt = {}) {
  if (u <= 0) return;
  const { lw = 180, color = C.cream2, vcolor = C.cream, size = 19 } = opt;
  g.save();
  g.globalAlpha *= clamp(u * 1.5);
  g.strokeStyle = color; g.lineWidth = 1;
  g.globalAlpha *= .9;
  g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x, y + 6); g.stroke();
  g.globalAlpha /= .9;
  setFont(g, F.m, size * .74, 400, 1.6);
  g.fillStyle = color; g.textAlign = 'left';
  g.fillText(label, x + 12, y - 4);
  setFont(g, F.m, size, 500, .5);
  g.fillStyle = vcolor;
  g.fillText(value, x + 12 + lw, y - 4);
  g.restore();
}

/* corner brackets — HUD framing */
function brackets(g, x, y, w, h, u, color = C.cream2, size = 22, lw = 2) {
  if (u <= 0) return;
  const e = eOutE(clamp(u)), s = size * e;
  g.save(); g.strokeStyle = color; g.lineWidth = lw; g.globalAlpha *= clamp(u * 2); g.lineCap = 'butt';
  for (const [sx, sy, px, py] of [[1, 1, x, y], [-1, 1, x + w, y], [1, -1, x, y + h], [-1, -1, x + w, y + h]]) {
    g.beginPath();
    g.moveTo(px + sx * s, py); g.lineTo(px, py); g.lineTo(px, py + sy * s);
    g.stroke();
  }
  g.restore();
}

/* soft amber footprint cone from a satellite down to a ground span */
function cone(g, sx, sy, gx1, gy1, gx2, gy2, u, alpha = .3) {
  if (u <= 0) return;
  const e = eOutC(clamp(u));
  const mx1 = lerp((gx1 + gx2) / 2, gx1, e), mx2 = lerp((gx1 + gx2) / 2, gx2, e);
  const my = (gy1 + gy2) / 2;
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha *= alpha / .3;
  // three nested wedges => soft feathered edges
  for (const [k, a] of [[1.0, .16], [.74, .18], [.46, .20]]) {
    const cxm = (mx1 + mx2) / 2;
    const p1 = lerp(cxm, mx1, k), p2 = lerp(cxm, mx2, k);
    const gr = g.createLinearGradient(sx, sy, cxm, my);
    gr.addColorStop(0, `rgba(226,146,58,${a})`);
    gr.addColorStop(.55, `rgba(190,112,38,${a * .62})`);
    gr.addColorStop(1, 'rgba(120,62,14,0)');
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(sx, sy);
    g.lineTo(p1, lerp(gy1, my, 1 - k)); g.lineTo(p2, lerp(gy2, my, 1 - k));
    g.closePath(); g.fill();
  }
  g.restore();
}
