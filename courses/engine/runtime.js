// CCNA Motion Course Engine — browser runtime.
// A video is a pure function of time: renderFrame(t) rebuilds the SVG for
// instant t from the timeline, so any frame can be rendered independently
// (and in parallel) by the Playwright driver.
import * as K from './components.js';

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ease = {
  out: (x) => 1 - (1 - x) ** 3,
  inOut: (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2),
  in: (x) => x ** 3,
  lin: (x) => x,
};
// eased progress of an animation starting at t0 and lasting d seconds
export const P = (t, t0, d = 0.5, e = ease.out) => (t0 == null ? 0 : e(clamp((t - t0) / d)));
export const mix = (a, b, k) => a + (b - a) * k;
export const mixPt = (a, b, k) => ({ x: mix(a.x, b.x, k), y: mix(a.y, b.y, k) });
// opacity that rises at tIn and falls at tOut
export const vis = (t, tIn, tOut = Infinity, d = 0.35) => Math.min(P(t, tIn, d), 1 - P(t, tOut, d));
export const blink = (t, t0, n = 2, period = 0.36) => (t < t0 || t > t0 + n * period ? 1 : ((t - t0) % period) < period * 0.55 ? 1 : 0.25);
export const qbez = (a, c, b, k) => ({ x: (1 - k) ** 2 * a.x + 2 * (1 - k) * k * c.x + k * k * b.x, y: (1 - k) ** 2 * a.y + 2 * (1 - k) * k * c.y + k * k * b.y });
// position along a polyline, k ∈ [0,1] by length
export function along(pts, k) {
  const seg = [];
  let L = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); seg.push(l); L += l; }
  let d = clamp(k) * L;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) return mixPt(pts[i], pts[i + 1], seg[i] ? clamp(d / seg[i]) : 1);
    d -= seg[i];
  }
  return pts.at(-1);
}

export function camera({ x = 960, y = 540, s = 1 } = {}, content) {
  if (x === 960 && y === 540 && s === 1) return content;
  return `<g transform="translate(960 540) scale(${s}) translate(${-x} ${-y})">${content}</g>`;
}

export function makeTimeline(T) {
  const sceneById = Object.fromEntries(T.scenes.map((s) => [s.id, s]));
  const E = (scene, anchor, nth = 1) => {
    let seen = 0;
    for (const e of T.events) if (e.scene === scene && e.anchor === anchor && ++seen === nth) return e.t;
    throw new Error(`event ${scene}/${anchor} missing`);
  };
  const key = (w) => w.toLowerCase().replace(/[«»"“”.,;:!?…()]/g, '');
  // time of the n-th spoken word inside a scene (for beats the storyboard does not anchor)
  const Wd = (scene, word, nth = 1) => {
    const s = sceneById[scene];
    let seen = 0;
    for (const w of T.words) if (w.start >= s.start - 0.01 && w.start < s.end && key(w.w) === key(word) && ++seen === nth) return w.start;
    throw new Error(`word ${scene}/${word}#${nth} missing`);
  };
  const S = (id) => sceneById[id];
  return { E, Wd, S, T };
}

// Episode = ordered shots. Each shot covers [start of its first scene, start of
// the next shot) and cross-dissolves into the next during the section gap.
export function makeRenderer(T, shots, { xfade = 0.5, juice = null } = {}) {
  const tl = makeTimeline(T);
  const bounds = shots.map((sh, i) => ({
    ...sh,
    start: i === 0 ? 0 : tl.S(sh.from).start - 0.15,
    end: i < shots.length - 1 ? tl.S(shots[i + 1].from).start - 0.15 : T.duration,
  }));
  const defs = K.defs() + `<defs><filter id="mblur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="14 2"/></filter></defs>`;
  return (t) => {
    const layers = [];
    bounds.forEach((sh, i) => {
      const inStart = i === 0 ? -1 : sh.start - xfade;
      if (t < inStart || t >= sh.end) return;
      const next = bounds[i + 1];
      let svg = sh.draw(t, { ...tl, shotStart: sh.start, shotEnd: sh.end, next: next && next.start });
      if (!juice) {
        const a = i === 0 ? 1 : clamp((t - inStart) / xfade);
        layers.push(a >= 1 ? svg : `<g opacity="${a.toFixed(3)}">${svg}</g>`);
        return;
      }
      // zoom-through transition: the outgoing shot pushes forward and blurs,
      // the incoming one settles from slightly smaller
      const kin = i === 0 ? 1 : ease.out(clamp((t - inStart) / xfade));
      const kout = next ? ease.in(clamp((t - (next.start - xfade)) / xfade)) : 0;
      const sc = mix(0.94, 1, kin) * mix(1, 1.1, kout);
      const op = kin * (1 - kout);
      if (op <= 0.001) return;
      if (sc !== 1) svg = `<g transform="translate(960 540) scale(${sc.toFixed(4)}) translate(-960 -540)">${svg}</g>`;
      const blur = (kin < 1 && kin > 0) || kout > 0 ? ' filter="url(#mblur)"' : '';
      layers.push(op >= 1 && !blur ? svg : `<g opacity="${op.toFixed(3)}"${blur}>${svg}</g>`);
    });
    if (!juice) return defs + K.backdrop() + layers.join('');
    return defs + juice.backdrop(t)
      + `<g transform="${juice.camera(t)}">${juice.slamsLayer(t)}${layers.join('')}</g>`
      + `<rect width="1920" height="1080" fill="url(#vignette)" pointer-events="none"/>`
      + juice.bumperLayer(t) + juice.progress(t);
  };
}
