// CCNA Motion Course Engine — "juice" layer (V2).
// Everything here is decorative *and* rhythmic: it never carries the technical
// content (the shots do), it gives the eye a pulse that follows the voice:
// animated backdrop, camera drift + punch-ins + shake, word slams, chapter
// bumpers with illustrations, chapter progress bar.
import * as K from './components.js';

const { C } = K;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeOut = (x) => 1 - (1 - x) ** 3;
const easeInOut = (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const P = (t, t0, d) => easeOut(clamp((t - t0) / d));
// deterministic pseudo-noise (smooth, no Math.random so every frame is reproducible)
const noise = (t, seed) => Math.sin(t * 1.3 + seed) * 0.5 + Math.sin(t * 0.71 + seed * 2.1) * 0.3 + Math.sin(t * 2.3 + seed * 3.7) * 0.2;

export function makeJuice(T, J, { assetBase }) {
  const ev = (scene, anchor) => T.events.find((e) => e.scene === scene && e.anchor === anchor)?.t;
  const sec = Object.fromEntries(T.sections.map((s, i) => [s.id, { ...s, prevEnd: i ? T.sections[i - 1].end : 0 }]));
  const bumpers = J.bumpers.map((b) => {
    const s = sec[b.section];
    // the bumper lives in the silence spliced before the section
    return { ...b, t0: s.prevEnd + 0.05, t1: s.start - 0.08 };
  });
  const slams = J.slams.map((s) => ({ ...s, t: ev(s.scene, s.anchor) })).filter((s) => s.t != null);
  const punches = J.punches.map((p) => ({ ...p, t: ev(p.scene, p.anchor) + (p.at || 0) })).filter((p) => !Number.isNaN(p.t));

  // chapter colour drives the backdrop tint
  const chapterAt = (t) => {
    let c = { color: C.traffic };
    for (const b of bumpers) if (t >= b.t0) c = b;
    return c;
  };

  function backdrop(t) {
    const col = chapterAt(t).color;
    const bx = 960 + 520 * noise(t * 0.12, 1), by = 520 + 260 * noise(t * 0.1, 2);
    const cx = 960 + 600 * noise(t * 0.09, 5), cy = 560 + 300 * noise(t * 0.11, 7);
    let s = `<defs>
      <radialGradient id="blobA" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${col}" stop-opacity="0.22"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>
      <radialGradient id="blobB" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#6D28D9" stop-opacity="0.14"/><stop offset="1" stop-color="#6D28D9" stop-opacity="0"/></radialGradient>
      <pattern id="gridMove" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="translate(${(t * 9) % 64} ${(t * 5) % 64})">
        <path d="M64 0 H0 V64" fill="none" stroke="rgba(120,160,255,0.045)" stroke-width="1"/></pattern>
      <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.72"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#gridMove)"/>
    <ellipse cx="${bx}" cy="${by}" rx="760" ry="520" fill="url(#blobA)"/>
    <ellipse cx="${cx}" cy="${cy}" rx="680" ry="480" fill="url(#blobB)"/>`;
    // floating dust particles (parallax depth by size)
    for (let i = 0; i < 46; i++) {
      const depth = 0.3 + ((i * 37) % 10) / 10;
      const x = ((i * 211.3 + t * 14 * depth) % 2000) - 40;
      const y = ((i * 127.7) % 1080) + Math.sin(t * 0.6 * depth + i) * 18;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.8 + depth * 1.6).toFixed(2)}" fill="${i % 7 === 0 ? col : '#9FB7FF'}" opacity="${(0.08 + depth * 0.18).toFixed(2)}"/>`;
    }
    return s;
  }

  // camera: slow drift + punch-ins on key words + decaying shake
  function camera(t) {
    let s = 1.012 + 0.012 * Math.sin(t * 0.21);
    let dx = 9 * noise(t * 0.25, 11), dy = 6 * noise(t * 0.22, 13), rot = 0.12 * noise(t * 0.18, 17);
    for (const p of punches) {
      const d = t - p.t;
      if (d < -0.05 || d > 1.4) continue;
      const k = d < 0.08 ? clamp((d + 0.05) / 0.13) : Math.exp(-(d - 0.08) * 3.2);
      s += p.amp * k;
      if (p.shake) {
        const e = Math.exp(-d * 6) * p.shake;
        dx += e * Math.sin(d * 71); dy += e * Math.cos(d * 59); rot += e * 0.02 * Math.sin(d * 43);
      }
    }
    return `translate(960 540) rotate(${rot.toFixed(3)}) scale(${s.toFixed(4)}) translate(${(-960 + dx).toFixed(2)} ${(-540 + dy).toFixed(2)})`;
  }

  // giant words behind the diagram: pop in, then settle as a faint watermark
  function slamsLayer(t) {
    let s = '';
    for (const w of slams) {
      const d = t - w.t;
      if (d < -0.02 || d > 3.2) continue;
      const pop = P(t, w.t, 0.28), out = P(t, w.t + 2.6, 0.6);
      const sc = 1.25 - 0.25 * pop + 0.03 * d;
      const op = (0.32 * (1 - P(t, w.t + 0.3, 0.7)) + 0.07) * pop * (1 - out);
      // fit the word inside the frame whatever its length
      const size = Math.min(280, 1650 / (w.text.length * 0.72));
      s += K.g(`<text x="960" y="${540 + size * 0.36}" text-anchor="middle" font-family="${C.ui}" font-weight="800" font-size="${size.toFixed(0)}" letter-spacing="10" fill="none" stroke="${w.color}" stroke-width="3">${w.text}</text>
        <text x="960" y="${540 + size * 0.36}" text-anchor="middle" font-family="${C.ui}" font-weight="800" font-size="${size.toFixed(0)}" letter-spacing="10" fill="${w.color}" opacity="0.15">${w.text}</text>`, { opacity: op, s: sc, ox: 960, oy: 540 });
    }
    return s;
  }

  // full-screen chapter card with a Ken Burns illustration
  function bumperLayer(t) {
    for (const b of bumpers) {
      if (t < b.t0 - 0.02 || t > b.t1 + 0.35) continue;
      const len = b.t1 - b.t0;
      const k = clamp((t - b.t0) / len);
      const inK = P(t, b.t0, 0.22), outK = easeInOut(clamp((t - b.t1) / 0.35));
      const op = inK * (1 - outK);
      const zoom = 1.04 + 0.1 * k + 0.25 * outK;
      let s = `<rect width="1920" height="1080" fill="#05070D"/>`;
      const seqHref = b.seq ? `${assetBase}/${b.seq}/f${String(1 + (Math.floor((t - b.t0) * 30) % b.seqN)).padStart(3, '0')}.jpg` : null;
      if (seqHref) {
        s += K.g(`<image href="${seqHref}" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice"/>`, { s: 1.02 + 0.2 * outK, ox: 960, oy: 540 });
        s += `<defs><linearGradient id="seqShade" x1="0" x2="0" y1="0" y2="1"><stop offset="0.35" stop-color="#05070D" stop-opacity="0"/><stop offset="1" stop-color="#05070D" stop-opacity="0.9"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#seqShade)"/>`;
      } else if (b.img) {
        s += K.g(`<image href="${assetBase}/${b.img}" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice"/>`, { s: zoom, ox: 1300, oy: 540, x: 480 - 140 * k });
        s += `<defs><linearGradient id="bumpShade" x1="0" x2="1"><stop offset="0" stop-color="#05070D" stop-opacity="0.97"/><stop offset="0.42" stop-color="#05070D" stop-opacity="0.75"/><stop offset="0.75" stop-color="#05070D" stop-opacity="0.05"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#bumpShade)"/>`;
      } else {
        for (let r = 0; r < 4; r++) { const q = ((t - b.t0) * 0.7 + r / 4) % 1; s += `<circle cx="1400" cy="540" r="${80 + q * 700}" fill="none" stroke="${b.color}" stroke-width="3" opacity="${(1 - q) * 0.5}"/>`; }
      }
      const line = P(t, b.t0 + 0.12, 0.5);
      const tx = 150 - 40 * (1 - P(t, b.t0 + 0.1, 0.45));
      s += `<rect x="150" y="470" width="${520 * line}" height="6" rx="3" fill="${b.color}"/>`;
      if (!b.num) {
        // title card: big centred title over the video
        const words = b.title.split(' ');
        const half = Math.ceil(words.length / 2);
        [words.slice(0, half).join(' '), words.slice(half).join(' ')].forEach((ln, i) => {
          s += K.g(K.text(960, 820 + i * 100, ln, { size: 88, weight: 800, fill: i ? '#FACC15' : '#FFFFFF', ls: 2 }), { opacity: P(t, b.t0 + 0.25 + i * 0.18, 0.3), s: 1.1 - 0.1 * P(t, b.t0 + 0.25 + i * 0.18, 0.4), ox: 960, oy: 800 + i * 100 });
        });
        return K.g(s, { opacity: op });
      }
      s += K.g(K.text(tx, 440, `CHAPITRE ${b.num}`, { size: 30, weight: 700, font: C.mono, fill: b.color, anchor: 'start', ls: 8 }), { opacity: P(t, b.t0 + 0.08, 0.3) });
      s += K.g(K.text(tx, 580, b.title, { size: b.title.length > 16 ? 76 : 96, weight: 800, anchor: 'start', fill: '#FFFFFF', ls: 2 }), { opacity: P(t, b.t0 + 0.18, 0.3), s: 1.08 - 0.08 * P(t, b.t0 + 0.18, 0.35), ox: 150, oy: 560 });
      return K.g(s, { opacity: op });
    }
    return '';
  }

  // chapter progress bar
  function progress(t) {
    const segs = bumpers.map((b, i) => ({ ...b, end: i < bumpers.length - 1 ? bumpers[i + 1].t0 : T.duration }));
    const x0 = 60, W = 1800, y = 1062, start = bumpers[0].t0, span = T.duration - start;
    if (t < start - 0.5) return '';
    let s = '';
    segs.forEach((g) => {
      const a = x0 + ((g.t0 - start) / span) * W, b = x0 + ((g.end - start) / span) * W;
      const f = clamp((t - g.t0) / (g.end - g.t0));
      s += `<rect x="${a + 2}" y="${y}" width="${b - a - 4}" height="5" rx="2.5" fill="#FFFFFF" opacity="0.10"/>`;
      if (f > 0) s += `<rect x="${a + 2}" y="${y}" width="${(b - a - 4) * f}" height="5" rx="2.5" fill="${g.color}" opacity="0.9"/>`;
    });
    return K.g(s, { opacity: P(t, start - 0.5, 0.5) });
  }

  return { backdrop, camera, slamsLayer, bumperLayer, progress, bumpers };
}
