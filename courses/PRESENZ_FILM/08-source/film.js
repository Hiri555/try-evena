// Présenz — film de lancement. Pure function of t → HTML string (1920×1080).
// Beats come from 05-timeline.json (voice word timestamps) via E(scene, word).
import { clamp, ease, P, mix, makeTimeline } from '/engine/runtime.js';

const A = '../06-assets';
const G = '#2d6a4f', G2 = '#40916c', G3 = '#1b4332', NEON = '#52e3a0', RED = '#ff4d5e';
const lerp = mix;
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ---------- primitives
const box = (style, inner = '') => `<div style="position:absolute;${style}">${inner}</div>`;
const full = (inner, style = '') => box(`inset:0;${style}`, inner);
function kb(src, t, t0, t1, { s0 = 1.04, s1 = 1.16, x0 = 0, x1 = 0, y0 = 0, y1 = 0, op = 1, filter = '' } = {}) {
  const k = clamp((t - t0) / Math.max(0.01, t1 - t0));
  const s = lerp(s0, s1, k), x = lerp(x0, x1, k), y = lerp(y0, y1, k);
  return full(`<img src="${src}" style="width:100%;height:100%;object-fit:cover;transform:translate(${x}px,${y}px) scale(${s});filter:${filter}">`, `opacity:${op};overflow:hidden`);
}
// Kling clip rendered as a 30 fps frame sequence, ping-pong looped
function seq(name, t, t0, { n = 151, speed = 1, op = 1, s = 1.02, filter = '' } = {}) {
  const i = Math.max(0, Math.floor((t - t0) * 30 * speed));
  const k = Math.floor(i / (n - 1)) % 2 ? n - 1 - (i % (n - 1)) : i % (n - 1);
  return full(`<img src="${A}/ai/frames/${name}/f${String(k + 1).padStart(3, '0')}.jpg" style="width:100%;height:100%;object-fit:cover;transform:scale(${s});filter:${filter}">`, `opacity:${op};overflow:hidden`);
}
// slam-in typography
function slam(text, t, t0, { x = 960, y = 540, size = 200, color = '#fff', weight = 800, dur = 0.28, out = Infinity, ls = -4, align = 'center', glow = null, italic = false, width = 1800 } = {}) {
  if (t < t0 || t > out + 0.3) return '';
  const k = P(t, t0, dur, ease.out), o = Math.min(clamp((t - t0) / 0.06), 1 - P(t, out, 0.25));
  const sc = lerp(1.45, 1, k), blur = lerp(14, 0, k);
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return box(`z-index:20;left:${x}px;top:${y}px;width:${width}px;margin-left:${align === 'center' ? -width / 2 : align === 'right' ? -width : 0}px;transform:translateY(-50%) scale(${sc});transform-origin:${align === 'left' ? 'left' : align === 'right' ? 'right' : 'center'} center;opacity:${o};filter:blur(${blur}px);text-align:${align};font:${italic ? 'italic ' : ''}${weight} ${size}px/0.95 Inter;letter-spacing:${ls}px;color:${color};${glow ? `text-shadow:0 0 40px ${glow},0 0 90px ${glow}` : ''}`, text);
}
// text that types / rises
function rise(text, t, t0, { x = 960, y = 540, size = 44, color = '#fff', weight = 700, out = Infinity, align = 'center', width = 1600, ls = 0 } = {}) {
  if (t < t0 || t > out + 0.4) return '';
  const k = P(t, t0, 0.5, ease.out), o = Math.min(k, 1 - P(t, out, 0.3));
  return box(`z-index:20;left:${x - (align === 'center' ? width / 2 : align === 'right' ? width : 0)}px;top:${y}px;width:${width}px;transform:translateY(${lerp(30, 0, k)}px);opacity:${o};text-align:${align};font:${weight} ${size}px/1.15 Inter;letter-spacing:${ls}px;color:${color}`, text);
}
const chip = (text, color = NEON) => `<span style="display:inline-block;padding:10px 22px;border-radius:999px;border:2px solid ${color};color:${color};font:800 26px Inter;letter-spacing:4px;background:rgba(0,0,0,.35)">${text}</span>`;
// real product screen in a floating 3D browser window
function screen(src, w, h, { x = 960, y = 540, scale = 0.6, ry = -14, rx = 6, rz = 0, z = 0, op = 1, crop = null, glowC = G2, overlay = '' } = {}) {
  const [cx, cy, cw, ch] = crop || [0, 0, w, h];
  const inner = `<div style="position:absolute;left:0;top:34px;width:${cw}px;height:${ch}px;overflow:hidden"><img src="${src}" style="position:absolute;left:${-cx}px;top:${-cy}px;width:${w}px;height:${h}px">${overlay}</div>`;
  const bar = `<div style="position:absolute;left:0;top:0;right:0;height:34px;background:#eef2f0;border-bottom:1px solid #d8e0dc"><span style="position:absolute;left:16px;top:12px;width:11px;height:11px;border-radius:50%;background:#ff5f57;box-shadow:18px 0 #febc2e,36px 0 #28c840"></span></div>`;
  return box(`left:${x}px;top:${y}px;width:${cw}px;height:${ch + 34}px;margin:${-(ch + 34) / 2}px 0 0 ${-cw / 2}px;transform:perspective(2400px) translateZ(${z}px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${scale});border-radius:18px;overflow:hidden;background:#fff;opacity:${op};box-shadow:0 60px 140px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.08),0 0 120px ${glowC}55`, bar + inner);
}
function phone(src, { x = 960, y = 540, scale = 0.5, ry = 10, rx = 4, rz = 0, op = 1, overlay = '' } = {}) {
  const w = 780, h = 1688;
  return box(`left:${x}px;top:${y}px;width:${w + 40}px;height:${h + 40}px;margin:${-(h + 40) / 2}px 0 0 ${-(w + 40) / 2}px;transform:perspective(2400px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${scale});border-radius:96px;background:#0b0f0d;padding:20px;opacity:${op};box-shadow:0 70px 160px rgba(0,0,0,.6),0 0 0 3px #2a332f,0 0 140px ${G2}66`,
    `<div style="position:relative;width:${w}px;height:${h}px;border-radius:78px;overflow:hidden;background:#fff"><img src="${src}" style="width:100%;height:100%">${overlay}</div>`);
}
function timecode(sec, { color = '#fff', size = 300, glow = NEON, x = 960, y = 540, op = 1 } = {}) {
  const s = Math.floor(sec), f = Math.floor((sec - s) * 100);
  const hh = 8 + Math.floor(s / 3600), mm = Math.floor(s / 60) % 60, ss = s % 60;
  const p = (n) => String(n).padStart(2, '0');
  return box(`left:0;right:0;top:${y}px;transform:translateY(-50%);text-align:center;opacity:${op};font:800 ${size}px/1 Inter;font-variant-numeric:tabular-nums;letter-spacing:-6px;color:${color};text-shadow:0 0 50px ${glow}99,0 0 120px ${glow}55`,
    `${p(hh)}:${p(mm)}:${p(ss)}<span style="font-size:${size * 0.28}px;letter-spacing:0;opacity:.55;margin-left:18px">${p(f)}</span>`);
}
const flash = (t, t0, d = 0.35, color = '#fff') => (t >= t0 && t < t0 + d ? full('', `background:${color};opacity:${(1 - (t - t0) / d) ** 2}`) : '');
const scrim = (op, c = '0,0,0') => full('', `background:rgba(${c},${op})`);
function logoMark(size, k = 1, glow = 1) {
  // the real Présenz pictogram, its squares assembling as k goes 0 → 1
  const parts = [
    ['rect', 'x="3" y="3" width="5" height="5" rx="1"'], ['rect', 'x="16" y="3" width="5" height="5" rx="1"'], ['rect', 'x="3" y="16" width="5" height="5" rx="1"'],
    ['path', 'd="M21 16h-3a2 2 0 0 0-2 2v3"'], ['path', 'd="M21 21v.01"'], ['path', 'd="M12 7v3a2 2 0 0 1-2 2H7"'], ['path', 'd="M3 12h.01"'], ['path', 'd="M12 3h.01"'],
    ['path', 'd="M12 16v.01"'], ['path', 'd="M16 12h1"'], ['path', 'd="M21 12v.01"'], ['path', 'd="M12 21v-1"'],
  ];
  const g = parts.map(([tag, a], i) => { const kk = clamp(k * 1.6 - i * 0.05); const e = ease.out(kk); const dx = (hash(i) - 0.5) * 60 * (1 - e), dy = (hash(i + 9) - 0.5) * 60 * (1 - e);
    return `<${tag} ${a} transform="translate(${dx} ${dy})" opacity="${kk}"/>`; }).join('');
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" style="filter:drop-shadow(0 0 ${40 * glow}px ${NEON}88)"><defs><linearGradient id="lg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2D6A4F"/><stop offset="1" stop-color="#40916C"/></linearGradient></defs>
    <rect width="64" height="64" rx="14" fill="url(#lg)" opacity="${clamp(k * 2)}"/><g transform="translate(14 14) scale(1.5)" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">${g}</g></svg>`;
}
function ripples(t, t0, x, y, color = NEON, n = 4) {
  if (t < t0) return '';
  let s = '';
  for (let i = 0; i < n; i++) { const k = ((t - t0) * 0.9 - i * 0.25); if (k < 0 || k > 1.2) continue; const r = 40 + k * 420;
    s += box(`left:${x - r}px;top:${y - r}px;width:${r * 2}px;height:${r * 2}px;border-radius:50%;border:${lerp(6, 1, clamp(k))}px solid ${color};opacity:${clamp(1.1 - k)};box-shadow:0 0 30px ${color}`); }
  return s;
}
const check = (size, color = NEON) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}"><circle cx="50" cy="50" r="44" fill="none" stroke="${color}" stroke-width="7"/><path d="M29 52 L44 66 L72 36" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ---------- the film
export function makeFilm(T) {
  const { E, S } = makeTimeline(T);
  const sec = (id) => T.sections.find((s) => s.id === id);
  const st = (id) => sec(id).start, en = (id) => sec(id).end;
  // key beats
  const b = {
    s1: st('S01'), dev: E('S01.1', 'devrait'), appel: E('S01.2', "l'appel"), nom: E('S01.2', 'Nom'), matin: E('S01.2', 'Chaque'), salle: E('S01.2', 'salle'),
    s2: st('S02'), trois: E('S02.1', 'Trois'), six: E('S02.1', 'Six'), trente: E('S02.1', 'Trente'), q45: E('S02.1', 'Quarante-cinq'), parc: E('S02.1', 'Par'), annee: E('S02.1', 'année'),
    feuille: E('S02.2', 'feuille'), signer: E('S02.2', 'signer'), ami: E('S02.2', 'ami'),
    s3: st('S03'), etsi: E('S03.1', 'Et'), disp: E('S03.1', 'disparaissait'), drop: E('S03.1', 'Présenz'),
    s4: st('S04'), qr: E('S04.1', 'QR'), change: E('S04.1', 'change'), etu: E('S04.2', "L'étudiant"), tel: E('S04.2', 'téléphone'), empr: E('S04.2', 'empreinte'), lui: E('S04.2', 'lui'), present: E('S04.2', 'Présent'), secs: E('S04.2', 'secondes'),
    s5: st('S05'), seule: E('S05.1', 'seule'), direct: E('S05.1', 'direct'), scol: E('S05.2', 'scolarité'), arrive: E('S05.2', 'arrive'), ressaisir: E('S05.2', 'ressaisir'),
    s6: st('S06'), inval: E('S06.1', "l'invalide"), edt: E('S06.1', "L'emploi"), pdf: E('S06.1', 'PDF'), abs: E('S06.1', 'absents'), clic: E('S06.1', 'clic'),
    s7: st('S07'), jamais: E('S07.1', 'jamais'),
    s8: st('S08'), qr8: E('S08.1', 'QR'), comm: E('S08.1', 'commence'), s82: S('S08.2').start, vrai: E('S08.2', 'Vraiment'), pz: E('S08.2', 'Présenz'), zc: E('S08.2', 'Zéro'), pap: E('S08.2', 'papier'),
    end: T.duration,
  };
  const shakes = [b.q45, b.drop, b.present, b.clic, b.vrai, b.signer];
  const flashes = [[b.s2, '#fff'], [b.drop, NEON], [b.s4, '#fff'], [b.s5, '#fff'], [b.s6, '#fff'], [b.s7, '#fff'], [b.s8, '#000'], [b.s82, '#fff']];

  // ---- scenes
  function hook(t) {
    let o = seq('clock', t, 0, { speed: 0.55, s: lerp(1.05, 1.25, clamp(t / (b.s2 - 0.2))), filter: `brightness(${lerp(0.55, 0.35, P(t, b.appel, 2))}) saturate(1.1)` });
    o += scrim(0.25);
    // the clock: real time until "appel", then it runs away
    let secs = t - 0.6; if (t > b.appel) secs = (b.appel - 0.6) + (t - b.appel) ** 2 * 9;
    const late = P(t, b.salle - 0.4, 0.4);
    o += timecode(Math.max(0, secs), { color: late > 0.5 ? RED : '#fff', glow: late > 0.5 ? RED : NEON, y: t > b.appel ? lerp(540, 250, P(t, b.appel, 0.6)) : 540, size: t > b.appel ? lerp(300, 170, P(t, b.appel, 0.6)) : 300, op: P(t, 0.3, 0.6) });
    o += rise(`Le cours commence.`, t, E('S01.1', 'cours'), { y: 700, size: 40, color: '#cfe9dc', out: b.appel - 0.2 });
    o += slam(`…il devrait.`, t, b.dev, { y: 790, size: 64, weight: 700, italic: true, color: '#fff', out: b.appel - 0.2 });
    // the roll call stacks up
    const calls = [['Diallo ?', 'Présent.'], ['Sow ?', '…'], ['Mbaye ?', 'Présente.'], ['Faye ?', '…'], ['Ndiaye ?', 'Présente.'], ['Ba ?', 'Absent ?'], ['Sarr ?', '…'], ['Cissé ?', 'Présent.']];
    calls.forEach(([q, a], i) => {
      const t0 = b.appel + 0.15 + i * ((b.salle - b.appel) / calls.length);
      if (t < t0) return;
      const k = P(t, t0, 0.3), row = i % 4, col = Math.floor(i / 4);
      o += box(`left:${220 + col * 780}px;top:${470 + row * 110}px;opacity:${k * (1 - P(t, b.s2 - 0.3, 0.3))};transform:translateX(${lerp(-40, 0, k)}px);font:700 58px Inter;color:#fff;letter-spacing:-1px`,
        `${q} <span style="color:${a === '…' || a.includes('?') ? RED : NEON};font-weight:800">${a}</span>`);
    });
    o += box(`left:0;right:0;top:0;height:${lerp(0, 100, P(t, 0, 1))}px;background:#000`) + box(`left:0;right:0;bottom:0;height:${lerp(0, 100, P(t, 0, 1))}px;background:#000`);
    return o;
  }
  function cost(t) {
    let o = seq('paper', t, b.s2, { speed: 0.8, s: lerp(1.05, 1.2, clamp((t - b.s2) / (b.feuille - b.s2))), filter: `brightness(${t > b.feuille ? 0.25 : 0.5}) saturate(1.2)` });
    o += scrim(0.2);
    const out = b.feuille - 0.15;
    o += slam('3 MIN', t, b.trois, { y: 300, size: 190, out: b.q45 - 0.08, color: '#fff' });
    o += slam('× 6 COURS', t, b.six, { y: 480, size: 150, out: b.q45 - 0.08, color: '#dff5ea' });
    o += slam('× 30 SEMAINES', t, b.trente, { y: 640, size: 130, out: b.q45 - 0.08, color: '#dff5ea' });
    if (t >= b.q45 && t < out + 0.3) {
      o += scrim(0.55 * P(t, b.q45, 0.15));
      o += slam('45 H', t, b.q45, { y: 470, size: 460, out, color: NEON, glow: NEON, ls: -20 });
      o += slam('PAR CLASSE · CHAQUE ANNÉE', t, b.parc, { y: 770, size: 54, out, color: '#fff', weight: 800, ls: 8, dur: 0.2 });
      o += rise('hypothèse : 3 minutes d’appel par cours', t, b.q45 + 0.4, { y: 960, size: 24, color: '#9fbfb0', out, weight: 600, ls: 2 });
    }
    if (t >= b.feuille - 0.1) {
      const k = P(t, b.feuille, 0.5);
      let sheet = `<div style="position:absolute;left:560px;top:190px;width:800px;height:700px;background:#f7f5ef;border-radius:10px;transform:rotate(${lerp(-8, -3, k)}deg) scale(${lerp(0.8, 1, k)});opacity:${k};box-shadow:0 40px 120px #000c">
        <div style="padding:46px 60px;font:800 40px Inter;color:#23312b;letter-spacing:4px">FEUILLE D'APPEL</div>`;
      const names = ['A. Mbaye', 'O. Ba', 'K. Faye', 'S. Sarr', 'I. Sow'];
      names.forEach((n, i) => { sheet += `<div style="position:absolute;left:60px;top:${170 + i * 96}px;right:60px;border-bottom:2px solid #d8d3c4;font:600 34px Inter;color:#4a5550;padding-bottom:10px">${n}</div>`; });
      const sig = (i, d, col) => `<path d="M20 40 C 60 -10, 90 70, 130 30 S 190 10, 210 45 S 260 60, 300 20" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="520" stroke-dashoffset="${520 * (1 - d)}" transform="translate(360 ${150 + i * 96})"/>`;
      let svg = sig(0, P(t, b.feuille + 0.2, 0.6), '#1f3a93') + sig(1, P(t, b.feuille + 0.6, 0.6), '#1f3a93') + sig(3, P(t, b.signer, 0.5), '#1f3a93');
      if (t > b.ami) { const r = P(t, b.ami, 0.25); svg += `<rect x="330" y="${440}" width="${400 * r}" height="80" rx="12" fill="none" stroke="${RED}" stroke-width="8"/>`; }
      sheet += `<svg width="800" height="700" style="position:absolute;inset:0">${svg}</svg></div>`;
      o += sheet;
      o += slam('POUR UN AMI.', t, b.ami, { y: 960, size: 80, color: RED, ls: 2 });
    }
    return o;
  }
  function rupture(t) {
    let o = full('', 'background:#030605');
    // the question, whose letters then disperse
    // a flat heartbeat line waits for the question
    if (t < b.etsi) {
      let d = '';
      for (let i = 0; i <= 160; i++) { const ph = (((t - b.s3) * 0.9 - i / 160) % 1 + 1) % 1; const beat = Math.abs(ph - 0.5) < 0.025 ? (hash(i) - 0.5) * 170 : 0; d += (i ? 'L' : 'M') + (i * 10) + ' ' + (60 + beat).toFixed(0); }
      o += box(`left:160px;top:480px;opacity:${P(t, b.s3, 0.5) * (1 - P(t, b.etsi - 0.3, 0.3))}`, `<svg width="1600" height="120"><path d="${d}" fill="none" stroke="${NEON}" stroke-width="3" style="filter:drop-shadow(0 0 8px ${NEON})"/></svg>`);
    }
    const q = 'Et si l’appel… disparaissait ?';
    if (t < b.drop) {
      const k = P(t, b.etsi, 0.6);
      const disp = clamp((t - b.disp - 0.35) / 1.1);
      const chars = [...q].map((c, i) => {
        const d = ease.in(clamp(disp * 1.4 - hash(i) * 0.4));
        const dx = (hash(i + 3) - 0.5) * 900 * d, dy = (hash(i + 7) - 0.8) * 500 * d;
        return `<span style="display:inline-block;white-space:pre;transform:translate(${dx}px,${dy}px) rotate(${(hash(i) - 0.5) * 180 * d}deg);opacity:${1 - d};filter:blur(${d * 10}px)">${esc(c)}</span>`;
      }).join('');
      o += box(`left:0;right:0;top:540px;transform:translateY(-50%);text-align:center;font:800 104px Inter;letter-spacing:-3px;color:#fff;opacity:${k}`, chars);
    }
    // after the words scatter: a flatline, then the drop
    if (t > b.disp + 1.0 && t < b.drop + 0.1) {
      const k = P(t, b.disp + 1.0, 0.6), w = 1600 * P(t, b.disp + 1.0, 1.4, ease.inOut);
      o += box(`left:${960 - w / 2}px;top:538px;width:${w}px;height:4px;background:${NEON};box-shadow:0 0 18px ${NEON},0 0 60px ${NEON};opacity:${k}`);
      o += rise('— aucun appel —', t, b.disp + 1.6, { y: 590, size: 26, color: '#7fae98', weight: 600, ls: 10, out: b.drop - 0.3 });
    }
    // the reveal
    if (t >= b.drop - 0.4) {
      const k = P(t, b.drop - 0.4, 0.9, ease.out);
      o += full('', `background:radial-gradient(circle at 50% 46%, ${G}${Math.round(clamp(P(t, b.drop, 0.4)) * 200).toString(16).padStart(2, '0')} 0%, #030605 60%)`);
      o += box(`left:${960 - 180}px;top:${400 - 180}px;transform:scale(${lerp(0.6, 1, k)})`, logoMark(360, k, P(t, b.drop, 0.5)));
      o += slam('Présenz', t, b.drop, { y: 700, size: 190, ls: -6, color: '#fff', glow: G2 });
      o += rise(`<span style="letter-spacing:18px">ZÉRO</span><span style="color:${NEON};letter-spacing:18px">CONTACT</span>`, t, b.drop + 0.5, { y: 830, size: 34, weight: 800 });
    }
    return o;
  }
  function geste(t) {
    let o = full('', `background:radial-gradient(ellipse at 30% 40%, #173c2d 0%, #07120d 70%)`);
    if (t < b.etu - 0.1) {
      const k = P(t, b.s4, 0.8);
      o += screen(`${A}/ui/projection.png`, 1440, 900, { x: lerp(1400, 1260, k), y: 560, scale: lerp(0.5, 0.7, clamp((t - b.s4) / (b.etu - b.s4))), ry: lerp(-35, -16, k), rx: 7, crop: [256, 0, 1184, 820], op: k,
        overlay: t > b.qr ? box(`left:${705 - 256 - 14}px;top:${258 - 14}px;width:${285 + 28}px;height:${287 + 28}px;border:5px solid ${NEON};border-radius:22px;box-shadow:0 0 60px ${NEON};opacity:${P(t, b.qr, 0.3)}`) : '' });
      o += slam('LE PROF PROJETTE', t, b.s4 + 0.1, { x: 120, y: 330, size: 92, align: 'left', width: 900, ls: -3 });
      o += slam('UN QR.', t, b.qr, { x: 120, y: 450, size: 92, align: 'left', width: 900, color: NEON, glow: NEON });
      if (t > b.change) o += box(`left:120px;top:560px;opacity:${P(t, b.change, 0.3)}`, chip(`↻ CODE ÉPHÉMÈRE`));
    } else {
      // phone clip → the real student screens → fingerprint
      const tp = b.etu - 0.1;
      if (t < b.empr) o += seq('phone', t, tp, { speed: 0.9, s: lerp(1.05, 1.15, clamp((t - tp) / 3)), filter: 'brightness(.8)' });
      if (t >= b.tel && t < b.empr + 0.2) {
        const k = P(t, b.tel, 0.5);
        o += scrim(0.5 * k);
        o += phone(`${A}/ui/stu-valider.png`, { x: lerp(2300, 1300, k), y: 560, scale: 0.55, ry: -12, rz: 2 });
        o += slam('IL POINTE', t, b.tel, { x: 140, y: 420, size: 100, align: 'left', width: 900 });
        o += slam('DEPUIS SON TÉLÉPHONE.', t, b.tel + 0.25, { x: 140, y: 530, size: 62, align: 'left', width: 1000, color: '#cfe9dc' });
      }
      if (t >= b.empr) {
        o += kb(`${A}/ai/finger.jpg`, t, b.empr, b.secs + 1, { s0: 1.08, s1: 1.22, filter: 'brightness(.75)' });
        o += ripples(t, b.empr + 0.1, 780, 560);
        o += slam('SON EMPREINTE', t, b.empr, { x: 1780, y: 380, size: 86, align: 'right', width: 1100, out: b.present - 0.1 });
        o += slam('CONFIRME QUE C’EST LUI.', t, b.lui - 0.15, { x: 1780, y: 480, size: 56, align: 'right', width: 1100, color: NEON, out: b.present - 0.1 });
      }
      if (t >= b.present - 0.05) {
        const k = P(t, b.present, 0.4);
        o += scrim(0.55 * k, '4,20,13');
        o += phone(`${A}/ui/stu-valide.png`, { x: 1340, y: 560, scale: lerp(0.4, 0.56, k), ry: -10, op: k });
        o += box(`left:${330 - 110}px;top:${400 - 110}px;transform:scale(${lerp(1.6, 1, k)});opacity:${k}`, check(220));
        o += slam('PRÉSENT.', t, b.present, { x: 120, y: 620, size: 150, align: 'left', width: 1000, color: '#fff', glow: NEON });
        o += rise('en quelques secondes', t, b.secs, { x: 130, y: 720, size: 44, align: 'left', width: 900, color: NEON, weight: 700 });
      }
    }
    return o;
  }
  function direct(t) {
    let o = '';
    if (t < b.scol - 0.1) {
      o += full('', `background:radial-gradient(ellipse at 70% 50%, #163a2b 0%, #06100c 70%)`);
      const k = P(t, b.s5, 0.7), kk = clamp((t - b.s5) / (b.scol - b.s5));
      const rowsY = [530, 591, 896 - 61 * 0 - 0, 1079, 1140].map((y) => y);
      const present = [0, 1, 5, 9, 10];
      let ov = '';
      present.forEach((ri, j) => { const t0 = b.s5 + 0.4 + j * 0.35; if (t < t0) return; const kj = P(t, t0, 0.3); const y = 530 + ri * 61;
        ov += box(`left:${288 - 256}px;top:${y - 30}px;width:1120px;height:60px;border-radius:12px;background:${NEON}${Math.round(kj * 50).toString(16).padStart(2, '0')};border:3px solid ${NEON};opacity:${kj};box-shadow:0 0 30px ${NEON}88`); });
      o += screen(`${A}/ui/suivi.png`, 1440, 1265, { x: lerp(1330, 1260, k), y: lerp(640, 560, kk), scale: lerp(0.62, 0.7, kk), ry: lerp(-28, -12, k), rx: 8, crop: [256, 60, 1184, 1205], op: k, overlay: `<div style="position:absolute;left:0;top:-60px">${ov}</div>` });
      const n = Math.min(5, Math.max(0, Math.floor((t - b.s5 - 0.4) / 0.35) + 1));
      o += slam('CÔTÉ PROF', t, b.s5, { x: 120, y: 300, size: 80, align: 'left', width: 800, color: '#cfe9dc' });
      if (t > b.s5 + 0.4) o += box(`left:120px;top:370px;font:800 300px/1 Inter;color:${NEON};text-shadow:0 0 60px ${NEON}88;letter-spacing:-10px`, String(n));
      o += box(`left:130px;top:680px;font:800 44px Inter;color:#fff;letter-spacing:6px;opacity:${P(t, b.s5 + 0.5, 0.4)}`, 'PRÉSENTS · EN DIRECT');
    } else {
      o += seq('converge', t, b.scol - 0.1, { speed: 1, s: lerp(1.04, 1.18, clamp((t - b.scol) / 4)), filter: 'brightness(.7)' });
      const k = P(t, b.arrive - 0.2, 0.7);
      if (t > b.arrive - 0.2) o += scrim(0.35 * k);
      o += screen(`${A}/ui/scol-dashboard.png`, 1440, 900, { x: 1290, y: 560, scale: lerp(0.3, 0.66, k), z: lerp(-900, 0, k), ry: lerp(-40, -12, k), rx: 8, crop: [256, 0, 1184, 640], op: k });
      o += slam('CÔTÉ SCOLARITÉ', t, b.scol, { x: 120, y: 330, size: 80, align: 'left', width: 900, color: '#cfe9dc' });
      o += slam('L’INFO ARRIVE.', t, b.arrive, { x: 120, y: 440, size: 104, align: 'left', width: 900, glow: G2 });
      o += slam('0 RESSAISIE', t, b.ressaisir, { x: 120, y: 570, size: 64, align: 'left', width: 900, color: NEON });
    }
    return o;
  }
  function journee(t) {
    let o = full('', 'background:#06100c');
    const panels = [
      [b.s6, '10:15', 'UN DOUTE ?', 'LE PROF INVALIDE.', `${A}/ui/invalidation.png`, [256, 0, 1184, 900], b.inval],
      [b.edt, '14:00', 'L’EMPLOI DU TEMPS ?', 'DEPUIS LE PDF.', `${A}/ui/import-pdf.png`, [256, 0, 1184, 900], b.pdf],
      [b.abs, '17:00', 'LES ABSENTS ?', 'UN CLIC.', `${A}/ui/reporting.png`, [256, 100, 1184, 800], b.clic],
    ];
    panels.forEach(([t0, hh, q, a, src, crop, ta], i) => {
      const t1 = i < 2 ? panels[i + 1][0] : b.s7;
      if (t < t0 - 0.05 || t > t1 + 0.05) return;
      const k = P(t, t0, 0.35), ko = P(t, t1 - 0.2, 0.25, ease.in);
      const dx = lerp(700, 0, k) - 1400 * ko;
      o += box(`inset:0;transform:translateX(${dx}px);filter:blur(${(1 - k + ko) * 18}px)`,
        screen(src, 1440, crop[1] + crop[3], { x: 1270, y: 560, scale: 0.68, ry: -14 + i * 4, rx: 6, crop, z: 0 }) +
        box(`left:110px;top:170px;font:800 190px/1 Inter;color:transparent;-webkit-text-stroke:3px ${NEON};letter-spacing:-6px`, hh) +
        slam(q, t, t0 + 0.1, { x: 120, y: 470, size: 64, align: 'left', width: 800, color: '#cfe9dc' }) +
        slam(a, t, ta, { x: 120, y: 570, size: 88, align: 'left', width: 820, color: '#fff', glow: G2 }));
    });
    return o;
  }
  function confiance(t) {
    let o = kb(`${A}/ai/finger.jpg`, t, b.s7, b.s8, { s0: 1.25, s1: 1.4, x0: -120, x1: -60, filter: 'brightness(.45) saturate(1.2)' });
    o += ripples(t, b.s7 + 0.2, 700, 560, NEON, 3);
    o += slam('VOTRE BIOMÉTRIE', t, b.s7, { x: 1780, y: 400, size: 90, align: 'right', width: 1200 });
    o += slam('NE QUITTE JAMAIS', t, b.jamais, { x: 1780, y: 520, size: 110, align: 'right', width: 1300, color: NEON, glow: NEON });
    o += slam('LE TÉLÉPHONE.', t, b.jamais + 0.35, { x: 1780, y: 640, size: 90, align: 'right', width: 1200 });
    // padlock closing
    const k = P(t, b.jamais, 0.4);
    o += box(`left:1590px;top:750px;opacity:${P(t, b.jamais, 0.2)}`, `<svg width="140" height="160" viewBox="0 0 140 160"><rect x="15" y="70" width="110" height="80" rx="16" fill="${NEON}"/><path d="M40 70 V${lerp(20, 45, k)} a30 30 0 0 1 60 0 V70" fill="none" stroke="${NEON}" stroke-width="14" transform="translate(0 ${lerp(-22, 0, k)})"/></svg>`);
    return o;
  }
  function finale(t) {
    let o = '';
    if (t < b.s82 - 0.05) {
      o += full('', '#000' && 'background:#020403');
      let secs = Math.max(0, t - b.s8 - 0.3);
      if (t > b.comm) secs = Math.min(30, secs + (t - b.comm) * 40);
      const lit = P(t, b.comm, 0.3);
      o += timecode(secs, { y: lerp(540, 300, P(t, b.qr8, 0.5)), size: lerp(300, 200, P(t, b.qr8, 0.5)), color: '#fff', glow: NEON });
      if (t > b.qr8) { const k = P(t, b.qr8, 0.5);
        o += box(`left:${960 - 170}px;top:${520}px;width:340px;height:340px;border-radius:26px;overflow:hidden;background:#fff;transform:scale(${lerp(0.4, 1, k)});opacity:${k * (1 - lit * 0.6)};box-shadow:0 0 90px ${NEON}88`,
          `<img src="${A}/ui/projection-full.png" style="position:absolute;left:${-(630 - 20)}px;top:${-(320 - 20)}px;width:1440px;height:900px">`); }
      if (t > b.comm) o += slam('COURS', t, b.comm, { y: 690, size: 260, color: NEON, glow: NEON, ls: 20 });
      o += box(`left:0;right:0;top:0;height:100px;background:#000`) + box(`left:0;right:0;bottom:0;height:100px;background:#000`);
    } else {
      o += kb(`${A}/ai/dawn.jpg`, t, b.s82, b.end, { s0: 1.05, s1: 1.2, y0: 20, y1: -30, filter: `brightness(${lerp(0.75, 0.4, P(t, b.pz - 0.3, 0.6))})` });
      o += slam('À 08:00.', t, b.s82, { y: 440, size: 170, out: b.pz - 0.4, ls: -5 });
      o += slam('VRAIMENT.', t, b.vrai, { y: 640, size: 170, out: b.pz - 0.4, color: NEON, glow: NEON, ls: -5 });
      if (t > b.pz - 0.3) {
        const k = P(t, b.pz - 0.3, 0.8);
        o += box(`left:${960 - 110}px;top:${300 - 110}px;transform:scale(${lerp(0.7, 1, k)})`, logoMark(220, k, 0.7));
        o += slam('Présenz', t, b.pz, { y: 540, size: 150, ls: -5, glow: G2 });
        o += rise(`Zéro contact. <span style="color:${NEON}">Zéro papier.</span>`, t, b.zc, { y: 650, size: 52, weight: 700 });
        o += rise('presenzzerocontact.shipiix.piitech.dev', t, b.pap + 0.8, { y: 880, size: 26, weight: 600, color: '#a8c8b8', ls: 2 });
      }
      o += full('', `background:#000;opacity:${P(t, b.end - 1, 1)}`);
    }
    return o;
  }

  const scenes = [['S01', hook], ['S02', cost], ['S03', rupture], ['S04', geste], ['S05', direct], ['S06', journee], ['S07', confiance], ['S08', finale]];
  return function render(t) {
    let i = scenes.length - 1;
    for (let j = 1; j < scenes.length; j++) if (t < st(scenes[j][0]) - 0.12) { i = j - 1; break; }
    let body = scenes[i][1](t);
    // camera shake on the big hits
    let sx = 0, sy = 0;
    for (const s of shakes) { if (s == null) continue; const d = t - s; if (d >= 0 && d < 0.45) { const a = 22 * (1 - d / 0.45) ** 2; sx += (hash(Math.floor(t * 60)) - 0.5) * a; sy += (hash(Math.floor(t * 60) + 5) - 0.5) * a; } }
    // after the drop the whole frame breathes on the 122 bpm kick
    let pulse = 1;
    if (t > b.drop && t < b.end - 3) { const ph = ((t - b.drop) % (60 / 122)) / (60 / 122); pulse = 1 + 0.014 * (1 - ph) ** 4; }
    let out = box(`inset:-40px;transform:translate(${sx}px,${sy}px) scale(${pulse});padding:40px`, `<div style="position:relative;width:1920px;height:1080px;overflow:hidden">${body}</div>`);
    for (const [ft, c] of flashes) if (ft != null) out += flash(t, ft - 0.02, 0.3, c);
    // grain + vignette
    out += full('', `background-image:url(${window.__grain});background-position:${Math.floor(hash(Math.floor(t * 30)) * 400)}px ${Math.floor(hash(Math.floor(t * 30) + 1) * 400)}px;opacity:.09;mix-blend-mode:screen`);
    out += full('', 'background:radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)');
    return out;
  };
}
