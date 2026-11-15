/* ============================================================
   lib2 — additions for the v2 cut : UI furniture, cards, chips,
   callouts, camera, chapter headers.  Loaded after lib.js.
   ============================================================ */

C.red   = '#C2553E';   // pièges / erreurs
C.green = '#4F9168';   // conditions validées
C.paper = '#F3ECE0';

/* ---------- camera ---------- */
function cam(g, s) {   // s = {z, x, y, rot}
  g.translate(W / 2 + (s.x || 0), H / 2 + (s.y || 0));
  if (s.rot) g.rotate(s.rot);
  g.scale(s.z || 1, s.z || 1);
  g.translate(-W / 2, -H / 2);
}

/* ---------- chapter header -------------------------------------------
   big at the top of the chapter, then shrinks into a corner tag         */
function header(g, num, title, s) {
  // s = {o:0..1, big:1..0}
  if (s.o <= 0) return;
  const big = s.big;
  const x = lerp(96, 76, 1 - big), y = lerp(146, 74, 1 - big);
  const numSize = lerp(30, 19, 1 - big);
  const titSize = lerp(50, 24, 1 - big);
  g.save();
  g.globalAlpha = s.o;
  setFont(g, F.m, numSize, 500, 3);
  g.fillStyle = C.amberL; g.textAlign = 'left';
  const nw = g.measureText(num).width;
  g.fillText(num, x, y);
  g.globalAlpha = s.o * .4;
  g.strokeStyle = C.cream3; g.lineWidth = 1;
  g.beginPath(); g.moveTo(x + nw + 16, y - titSize * .62); g.lineTo(x + nw + 16, y + 6); g.stroke();
  g.globalAlpha = s.o;
  setFont(g, F.d, titSize, 700, lerp(2.6, 1.8, 1 - big));
  g.fillStyle = C.cream;
  g.fillText(title, x + nw + 32, y);
  if (s.rule > 0) rule(g, x, y + lerp(26, 14, 1 - big), lerp(300, 150, 1 - big), s.rule, C.amber, lerp(3, 2, 1 - big));
  g.restore();
}

/* ---------- chip : a small labelled pill ---------- */
function chip(g, x, y, text, s, opt = {}) {
  if (!s || s.o <= 0) return;
  const { color = C.amberL, bg = 'rgba(201,121,42,.14)', size = 20, align = 'left', pad = 16 } = opt;
  g.save();
  g.globalAlpha = s.o;
  g.translate(x + (s.dx || 0), y + (s.dy || 0));
  if (s.sc && s.sc !== 1) { g.scale(s.sc, s.sc); }
  setFont(g, F.m, size, 500, 2);
  const w = g.measureText(text).width + pad * 2, h = size + 18;
  const ox = align === 'center' ? -w / 2 : align === 'right' ? -w : 0;
  g.fillStyle = bg; g.beginPath(); g.roundRect(ox, -h / 2, w, h, 4); g.fill();
  g.strokeStyle = color; g.globalAlpha = s.o * .75; g.lineWidth = 1.2;
  g.beginPath(); g.roundRect(ox + .5, -h / 2 + .5, w - 1, h - 1, 4); g.stroke();
  g.globalAlpha = s.o;
  g.fillStyle = color; g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillText(text, ox + pad, 1);
  g.textBaseline = 'alphabetic';
  g.restore();
}

/* ---------- warning card (pièges / "sinon…") ---------- */
function warn(g, x, y, lines, s, opt = {}) {
  if (!s || s.o <= 0) return;
  const { w = 560, align = 'left' } = opt;
  const h = 46 + lines.length * 34;
  g.save();
  g.globalAlpha = s.o;
  g.translate(x + (s.dx || 0), y + (s.dy || 0));
  const ox = align === 'center' ? -w / 2 : 0;
  g.fillStyle = 'rgba(194,85,62,.12)';
  g.beginPath(); g.roundRect(ox, 0, w, h, 5); g.fill();
  g.fillStyle = C.red; g.fillRect(ox, 0, 4, h);
  g.globalAlpha = s.o;
  setFont(g, F.m, 15, 500, 3.4); g.fillStyle = C.red; g.textAlign = 'left';
  g.fillText('ATTENTION', ox + 24, 30);
  setFont(g, F.b, 22, 400, .2); g.fillStyle = C.cream;
  lines.forEach((l, i) => g.fillText(l, ox + 24, 66 + i * 34));
  g.restore();
}

/* ---------- condition row with a status light ---------- */
function condition(g, x, y, idx, label, value, s) {
  if (!s || s.o <= 0) return;
  g.save();
  g.globalAlpha = s.o;
  g.translate(x + (s.dx || 0), y);
  const on = s.ok || 0;
  // light
  g.strokeStyle = on > .5 ? C.green : C.cream3; g.lineWidth = 1.6;
  g.beginPath(); g.arc(0, -10, 13, 0, 7); g.stroke();
  if (on > 0) {
    g.save(); g.globalAlpha = s.o * on;
    glow(g, C.green, 14, () => { g.fillStyle = C.green; g.beginPath(); g.arc(0, -10, 8, 0, 7); g.fill(); });
    g.restore();
  }
  setFont(g, F.m, 17, 500, 2); g.fillStyle = on > .5 ? C.green : C.cream3; g.textAlign = 'left';
  g.fillText(idx, 34, -4);
  setFont(g, F.d, 36, 600, 1.4); g.fillStyle = C.cream;
  g.fillText(label, 74, -1);
  if (value) {
    setFont(g, F.m, 21, 500, 1); g.fillStyle = on > .5 ? C.amberL : C.cream3;
    g.fillText(value, 74, 32);
  }
  g.restore();
}

/* ---------- callout : a leader line + label pointing at something ---------- */
function callout(g, px, py, lx, ly, text, sub, s, opt = {}) {
  if (!s || s.o <= 0) return;
  const { color = C.cream2, align = 'left' } = opt;
  g.save();
  g.globalAlpha = s.o;
  const e = s.g === undefined ? 1 : s.g;
  g.strokeStyle = color; g.lineWidth = 1.2; g.globalAlpha = s.o * .6;
  g.beginPath();
  g.moveTo(px, py);
  const mx = lerp(px, lx, .55);
  g.lineTo(lerp(px, mx, e), lerp(py, ly, e));
  if (e > .55) g.lineTo(lerp(mx, lx, (e - .55) / .45), ly);
  g.stroke();
  g.globalAlpha = s.o * .9;
  g.fillStyle = color; g.beginPath(); g.arc(px, py, 3, 0, 7); g.fill();
  g.globalAlpha = s.o;
  setFont(g, F.m, 17, 500, 2.2); g.fillStyle = C.cream; g.textAlign = align;
  g.fillText(text, lx + (align === 'right' ? -14 : 14), ly - 4);
  if (sub) {
    setFont(g, F.b, 15, 400, .2); g.fillStyle = C.cream3;
    g.fillText(sub, lx + (align === 'right' ? -14 : 14), ly + 20);
  }
  g.restore();
}

/* ---------- horizontal bar gauge ---------- */
function gauge(g, x, y, w, h, frac, s, opt = {}) {
  if (!s || s.o <= 0) return;
  const { color = C.amber, label = '', value = '', track = 'rgba(207,198,184,.3)' } = opt;
  g.save(); g.globalAlpha = s.o;
  if (label) { setFont(g, F.m, 15, 500, 2.6); g.fillStyle = C.cream3; g.textAlign = 'left'; g.fillText(label, x, y - 12); }
  g.strokeStyle = track; g.lineWidth = 1; g.strokeRect(x + .5, y + .5, w, h);
  g.fillStyle = color; g.fillRect(x + 2, y + 2, Math.max(0, (w - 4) * clamp(frac)), h - 4);
  if (value) { setFont(g, F.m, 19, 500, 1); g.fillStyle = color; g.textAlign = 'left'; g.fillText(value, x + w + 16, y + h); }
  g.restore();
}

/* ---------- full cream card (archive / fiche) ---------- */
function card(g, x, y, w, h, s, drawInner) {
  if (!s || s.o <= 0) return;
  g.save();
  g.globalAlpha = s.o;
  g.translate(x + (s.dx || 0), y + (s.dy || 0));
  if (s.sc && s.sc !== 1) { g.translate(w / 2, h / 2); g.scale(s.sc, s.sc); g.translate(-w / 2, -h / 2); }
  g.fillStyle = C.paper; g.fillRect(0, 0, w, h);
  g.save(); g.beginPath(); g.rect(0, 0, w, h); g.clip();
  halftone(g, 0, 0, w, h, .05, 1.1);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .09;
  g.fillStyle = '#C9A978'; g.fillRect(0, 0, w, h);
  g.restore();
  g.strokeStyle = 'rgba(19,36,60,.2)'; g.lineWidth = 1; g.strokeRect(.5, .5, w - 1, h - 1);
  drawInner(g, w, h);
  g.restore();
}

/* ---------- animated dashed ellipse / circle (GTO → GEO) ---------- */
function orbitPath(g, cx, cy, a, b, rot, s, opt = {}) {
  if (!s || s.o <= 0) return;
  const { color = C.cream2, dash = [4, 10], lw = 1.4 } = opt;
  g.save();
  g.globalAlpha = s.o;
  g.strokeStyle = color; g.lineWidth = lw; g.setLineDash(dash);
  g.beginPath(); g.ellipse(cx, cy, a, b, rot, 0, Math.PI * 2 * clamp(s.draw === undefined ? 1 : s.draw));
  g.stroke();
  g.restore();
}

/* point on an ellipse centred (cx,cy), semi-axes a,b, rotated by rot */
function ellPt(cx, cy, a, b, rot, th) {
  const x = a * Math.cos(th), y = b * Math.sin(th);
  return { x: cx + x * Math.cos(rot) - y * Math.sin(rot),
           y: cy + x * Math.sin(rot) + y * Math.cos(rot) };
}

/* ---------- thruster puff ---------- */
function puff(g, x, y, ang, u, color = C.tealL, scale = 1) {
  if (u <= 0 || u >= 1) return;
  g.save();
  g.translate(x, y); g.rotate(ang);
  const e = eOutE(u), fade = (1 - u) * (1 - u);
  g.globalAlpha = fade;
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const t = i / 6, r = (5 + t * 26 * e) * scale, d = (10 + t * 54 * e) * scale;
    g.globalAlpha = fade * (1 - t) * .55;
    g.fillStyle = color;
    g.beginPath(); g.arc(d, (Math.sin(i * 2.4) * 7) * scale, r * (1 - t * .5), 0, 7); g.fill();
  }
  g.restore();
}

/* ---------- a small clock dial ---------- */
function dial(g, cx, cy, r, frac, s, label) {
  if (!s || s.o <= 0) return;
  g.save(); g.globalAlpha = s.o;
  g.strokeStyle = 'rgba(207,198,184,.45)'; g.lineWidth = 1.4;
  g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    g.globalAlpha = s.o * .4;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r * .88, cy + Math.sin(a) * r * .88);
    g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.stroke();
  }
  g.globalAlpha = s.o;
  const a = -Math.PI / 2 + frac * Math.PI * 2;
  g.strokeStyle = C.amberL; g.lineWidth = 2.4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r * .72, cy + Math.sin(a) * r * .72); g.stroke();
  g.fillStyle = C.amberL; g.beginPath(); g.arc(cx, cy, 3.4, 0, 7); g.fill();
  if (label) {
    setFont(g, F.m, 17, 500, 1.6); g.fillStyle = C.cream; g.textAlign = 'center';
    g.fillText(label, cx, cy + r + 30);
  }
  g.restore();
}

/* ---------- chapter in / out wipe ---------- */
function wipe(g, s) {
  if (!s || s.o <= 0) return;
  g.save();
  g.globalAlpha = 1;
  g.fillStyle = '#0B1527';
  const p = clamp(s.o);
  g.fillRect(0, 0, W, H * p);
  g.restore();
}

/* ---------- flowing data packets along a lane ---------- */
function packets(g, x, y, w, h, phase, s, color = C.amberL, n = 9) {
  if (!s || s.o <= 0) return;
  g.save(); g.globalAlpha = s.o;
  g.beginPath(); g.roundRect(x, y, w, h, Math.min(h / 2, 8)); g.clip();
  for (let i = 0; i < n; i++) {
    const f = ((i / n) + phase) % 1;
    const bw = Math.max(10, h * .9);
    g.globalAlpha = s.o * .85;
    g.fillStyle = color;
    g.beginPath(); g.roundRect(x + f * (w + bw) - bw, y + h * .18, bw, h * .64, 3); g.fill();
  }
  g.restore();
}
