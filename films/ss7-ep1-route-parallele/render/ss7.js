/* ============================================================
   SS7 « LE CAHIER » — primitives
   vermillon = la parole · bleu = la signalisation · jaune = surligneur
   ============================================================ */

/* ---------- la signature de l'auteur ---------- */
function watermark(g) {
  g.save();                                   // filigrane de fond
  g.globalAlpha = .030;
  setFont(g, F.d, 240, 700, 26);
  g.fillStyle = C.encre; g.textAlign = 'center';
  g.fillText('BIG MAGASS', 1000, 614);
  g.restore();
  g.save();                                   // marque de coin, à la main
  g.globalAlpha = .55;
  setFont(g, F.h, 34, 700, 0);
  g.fillStyle = C.encre3; g.textAlign = 'right';
  g.fillText('Big Magass', 1858, 1046);
  g.restore();
}

function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);        g.lineTo(x + w - r, y);
  g.quadraticCurveTo(x + w, y, x + w, y + r);         g.lineTo(x + w, y + h - r);
  g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h);
  g.quadraticCurveTo(x, y + h, x, y + h - r);         g.lineTo(x, y + r);
  g.quadraticCurveTo(x, y, x + r, y);  g.closePath();
}

/* petite irrégularité déterministe : le tracé n'est jamais parfaitement droit */
function jig(i, amp = 1) {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return ((s - Math.floor(s)) - .5) * 2 * amp;
}

/* ---------- l'en-tête de page ---------- */
function entete(g, num, titre, s) {
  const u = s ? s.o : 1; if (u <= 0) return;
  g.save(); g.globalAlpha = u;
  setFont(g, F.d, 54, 700, 0); g.fillStyle = C.rouge; g.textAlign = 'right';
  g.fillText(num, MARGE - 28, 104);
  setFont(g, F.d, 34, 700, 2.6); g.fillStyle = C.encre; g.textAlign = 'left';
  g.fillText(titre, MARGE + 34, 100);
  const w = g.measureText(titre).width;
  surligne(g, MARGE + 30, 88, w + 10, clamp((u - .3) / .7), 26);
  g.restore();
}

/* ---------- le coup de surligneur ---------- */
function surligne(g, x, y, w, u, h = 30, color = 'rgba(242,193,78,.55)') {
  if (u <= 0) return;
  g.save();
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = color;
  const ww = w * clamp(u);
  g.beginPath();
  g.moveTo(x, y + jig(x, 2));
  g.lineTo(x + ww, y + jig(x + ww, 2));
  g.lineTo(x + ww, y + h + jig(x + ww + 7, 2.5));
  g.lineTo(x, y + h + jig(x + 7, 2.5));
  g.closePath(); g.fill();
  g.restore();
}

/* ---------- un trait tiré à la main ---------- */
function trait(g, x1, y1, x2, y2, u, opt = {}) {
  if (u <= 0) return;
  const { color = C.encre, lw = 2.4, amp = 1.6, seg: ns = 14, dash = null } = opt;
  const xe = lerp(x1, x2, clamp(u)), ye = lerp(y1, y2, clamp(u));
  g.save(); g.strokeStyle = color; g.lineWidth = lw; g.lineCap = 'round';
  if (dash) g.setLineDash(dash);
  g.beginPath();
  for (let i = 0; i <= ns; i++) {
    const t = i / ns, X = lerp(x1, xe, t), Y = lerp(y1, ye, t);
    const n = jig(i * 7.3 + x1 * .013 + y1 * .017, amp);
    i ? g.lineTo(X, Y + n) : g.moveTo(X, Y + n);
  }
  g.stroke(); g.setLineDash([]); g.restore();
}

/* ---------- une citation du prof, écrite à la main ---------- */
function citation(g, x, y, lines, s, opt = {}) {
  const u = s ? s.o : 1; if (u <= 0) return;
  const { size = 42, color = C.bleu, w = 760, source = 'le prof' } = opt;
  const dy = (s && s.dy) || 0;
  g.save(); g.globalAlpha = u; g.translate(0, dy);
  const h = lines.length * (size * .96) + 30;
  g.strokeStyle = C.bleu; g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, y - size * .78); g.lineTo(x, y - size * .78 + h * clamp(u * 1.4)); g.stroke();
  setFont(g, F.h, size, 700, 0); g.fillStyle = color; g.textAlign = 'left';
  lines.forEach((L, i) => {
    g.globalAlpha = u * clamp(u * lines.length * 1.3 - i);
    g.fillText('« ' + L + ' »'.repeat(i === lines.length - 1 ? 1 : 0), x + 26, y + i * size * .96);
  });
  g.globalAlpha = u;
  setFont(g, F.m, 15, 500, 2.6); g.fillStyle = C.encre3;
  g.fillText('— ' + source.toUpperCase(), x + 26, y + lines.length * size * .96 + 6);
  g.restore();
}

/* ---------- un post-it : le piège d'examen ---------- */
function postit(g, x, y, w, titre, lines, s) {
  const u = s ? s.o : 1; if (u <= 0) return;
  const fl = Math.sin(_frameIdx / 41 + x * .01) * 2.2;
  const rot = ((s && s.rot !== undefined ? s.rot : -1.6) + Math.sin(_frameIdx / 67) * .35) * Math.PI / 180;
  const sc = (s && s.sc !== undefined) ? s.sc : 1;
  const h = 86 + lines.length * 34;
  g.save(); g.globalAlpha = u;
  g.translate(x + w / 2, y + h / 2 + fl); g.rotate(rot); g.scale(sc, sc); g.translate(-w / 2, -h / 2);
  g.save();
  g.shadowColor = 'rgba(60,45,20,.22)'; g.shadowBlur = 18; g.shadowOffsetY = 7;
  g.fillStyle = '#F6DC92'; g.fillRect(0, 0, w, h);
  g.restore();
  g.fillStyle = 'rgba(0,0,0,.05)';
  g.beginPath(); g.moveTo(w, h - 26); g.lineTo(w, h); g.lineTo(w - 26, h); g.closePath(); g.fill();
  setFont(g, F.d, 21, 700, 2.4); g.fillStyle = C.rouge; g.textAlign = 'left';
  g.fillText(titre, 26, 42);
  setFont(g, F.b, 22, 500, .2); g.fillStyle = C.encre;
  lines.forEach((L, i) => g.fillText(L, 26, 82 + i * 34));
  g.restore();
}

/* ---------- une fiche / carte blanche posée sur la page ---------- */
function fiche(g, x, y, w, h, s, inner) {
  const u = s ? s.o : 1; if (u <= 0) return;
  const sc = (s && s.sc !== undefined) ? s.sc : 1;
  const fl = Math.sin(_frameIdx / 53 + y * .01) * 1.8;
  g.save(); g.globalAlpha = u;
  g.translate(0, fl);
  g.translate(x + w / 2, y + h / 2); g.scale(sc, sc); g.translate(-(x + w / 2), -(y + h / 2));
  g.save();
  g.shadowColor = 'rgba(60,45,20,.20)'; g.shadowBlur = 22; g.shadowOffsetY = 8;
  g.fillStyle = '#FBF7EC'; rr(g, x, y, w, h, 4); g.fill();
  g.restore();
  g.strokeStyle = 'rgba(28,43,51,.18)'; g.lineWidth = 1.4; rr(g, x, y, w, h, 4); g.stroke();
  if (inner) inner(g, x, y, w, h, u);
  g.restore();
}

/* ---------- tampon encreur ---------- */
function tampon(g, x, y, text, s, opt = {}) {
  const u = s ? s.o : 1; if (u <= 0) return;
  const { color = C.rouge, size = 30, rot = -8 } = opt;
  const sc = (s && s.sc !== undefined) ? s.sc : 1;
  g.save(); g.globalAlpha = u * .92;
  g.translate(x, y); g.rotate(rot * Math.PI / 180); g.scale(sc, sc);
  setFont(g, F.d, size, 700, 4);
  const w = g.measureText(text).width + 44, h = size + 26;
  g.strokeStyle = color; g.lineWidth = 3.4;
  rr(g, -w / 2, -h / 2, w, h, 5); g.stroke();
  g.fillStyle = color; g.textAlign = 'center';
  g.fillText(text, 0, size * .36);
  g.restore();
}

/* ---------- polylignes ---------- */
function plen(pts) {
  const L = [0]; let t = 0;
  for (let i = 1; i < pts.length; i++) {
    t += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(t);
  }
  return L;
}
function along(pts, u) {
  const L = plen(pts), T = L[L.length - 1], d = clamp(u) * T;
  for (let i = 1; i < L.length; i++) {
    if (d <= L[i]) {
      const f = (d - L[i - 1]) / Math.max(L[i] - L[i - 1], 1e-6);
      return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
    }
  }
  return pts[pts.length - 1];
}
function wire(g, pts, u = 1, opt = {}) {
  if (u <= 0 || pts.length < 2) return;
  const { color = C.encre2, lw = 2.4, dash = null, alpha = 1, off = 0 } = opt;
  const L = plen(pts), T = L[L.length - 1], d = clamp(u) * T;
  g.save(); g.globalAlpha = alpha; g.strokeStyle = color; g.lineWidth = lw;
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (dash) { g.setLineDash(dash); g.lineDashOffset = off; }
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    if (L[i] <= d) g.lineTo(pts[i][0], pts[i][1]);
    else { const p = along(pts, d / T); g.lineTo(p[0], p[1]); break; }
  }
  g.stroke(); g.setLineDash([]); g.lineDashOffset = 0; g.restore();
}
function runner(g, pts, t, opt = {}) {
  const { color = C.bleu, r = 9, alpha = 1, trail = 0 } = opt;
  if (alpha <= 0) return;
  const p = along(pts, t);
  g.save();
  if (trail > 0) for (let k = 1; k <= 5; k++) {
    const q = along(pts, clamp(t - k * trail));
    g.globalAlpha = alpha * (1 - k / 6) * .30;
    g.beginPath(); g.arc(q[0], q[1], r * (1 - k / 9), 0, 7); g.fillStyle = color; g.fill();
  }
  g.globalAlpha = alpha;
  g.beginPath(); g.arc(p[0], p[1], r + 3, 0, 7);
  g.fillStyle = C.papier; g.fill();
  g.beginPath(); g.arc(p[0], p[1], r, 0, 7); g.fillStyle = color; g.fill();
  g.restore();
  return p;
}

/* ---------- un commutateur et son point sémaphore ---------- */
function node(g, x, y, s, opt = {}) {
  const { kind = 'CAA', label = '', code = '', ps = true, lit = 0, sc = 1, dead = 0 } = opt;
  const u = s ? s.o : 1; if (u <= 0) return;
  const dy = (s && s.dy) || 0;
  g.save(); g.globalAlpha = u; g.translate(0, dy);
  const w = 96 * sc, h = 62 * sc;
  g.fillStyle = dead > 0 ? `rgba(200,65,43,${.10 * dead})` : '#FBF7EC';
  rr(g, x - w / 2, y - h / 2, w, h, 6); g.fill();
  g.strokeStyle = dead > 0 ? C.rouge : C.encre2; g.lineWidth = 2.4; g.stroke();
  setFont(g, F.d, 23 * sc, 700, 1.4); g.fillStyle = C.encre; g.textAlign = 'center';
  g.fillText(kind, x, y + 8 * sc);
  if (label) {
    setFont(g, F.b, 17 * sc, 500, .3); g.fillStyle = C.encre3;
    g.fillText(label, x, y + h / 2 + 27 * sc);
  }
  if (ps) {
    const py = y - h / 2 - 34 * sc, r = 16 * sc;
    g.strokeStyle = 'rgba(31,95,139,.45)'; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x, py + r); g.lineTo(x, y - h / 2); g.stroke();
    g.beginPath(); g.arc(x, py, r, 0, 7);
    g.fillStyle = lit > 0 ? C.bleu : '#FBF7EC'; g.fill();
    g.strokeStyle = C.bleu; g.lineWidth = 2.6; g.stroke();
    if (code) {
      setFont(g, F.m, 15 * sc, 500, 1.6); g.fillStyle = C.bleu; g.textAlign = 'center';
      g.fillText(code, x, py - r - 13 * sc);
    }
  }
  g.restore();
}

/* ---------- une suite de bits en cases ---------- */
function bitRow(g, x, y, str, u, opt = {}) {
  const { bw = 48, bh = 58, color = C.encre, gap = 5, mark = [] } = opt;
  g.save(); g.textAlign = 'center';
  for (let i = 0; i < str.length; i++) {
    const v = clamp(u * str.length * 1.4 - i); if (v <= 0) break;
    const bx = x + i * (bw + gap), m = mark.indexOf(i) >= 0;
    g.globalAlpha = v;
    g.fillStyle = m ? 'rgba(242,193,78,.55)' : '#FBF7EC';
    rr(g, bx, y, bw, bh, 4); g.fill();
    g.strokeStyle = m ? C.or : 'rgba(28,43,51,.30)'; g.lineWidth = m ? 2.6 : 1.5; g.stroke();
    setFont(g, F.m, 28, 500, 0); g.fillStyle = color;
    g.fillText(str[i], bx + bw / 2, y + bh / 2 + 10);
  }
  g.restore();
  return x + str.length * (bw + gap) - gap;
}

/* ---------- carte de fin signée ---------- */
function signature(g, s, line1, line2) {
  const u = s ? s.o : 1; if (u <= 0) return;
  const p = (s && s.p !== undefined) ? s.p : 1;
  g.save(); g.globalAlpha = u; g.textAlign = 'center';
  setFont(g, F.m, 17, 500, 4.4); g.fillStyle = C.encre3;
  g.fillText(line1, 1000, 452);
  setFont(g, F.h, 150, 700, 0); g.fillStyle = C.encre;
  g.save(); g.globalAlpha = u * p;
  g.fillText('Big Magass', 1000, 604);
  g.restore();
  const w = g.measureText('Big Magass').width;
  trait(g, 1000 - w / 2, 634, 1000 + w / 2, 634, p, { color: C.rouge, lw: 4, amp: 2.2 });
  setFont(g, F.b, 22, 400, .6); g.fillStyle = C.encre2;
  g.fillText(line2, 1000, 702);
  g.restore();
}

/* ---------- un panneau crème : pour écrire par-dessus une plate 3D ---------- */
function panneau(g, x, y, w, h, u, a = 0.90) {
  if (u <= 0) return;
  g.save(); g.globalAlpha = u * a;
  g.shadowColor = 'rgba(60,45,20,.18)'; g.shadowBlur = 20; g.shadowOffsetY = 5;
  g.fillStyle = C.papier3; rr(g, x, y, w, h, 8); g.fill();
  g.restore();
  g.save(); g.globalAlpha = u * a;
  g.strokeStyle = 'rgba(28,43,51,.14)'; g.lineWidth = 1.4; rr(g, x, y, w, h, 8); g.stroke();
  g.restore();
}
