// Timing pass: section tracks + word alignments + storyboard → one voice track
// (07-audio/voice.wav) and 05-timeline.json, where every storyboard anchor
// becomes an absolute time. Silences are spliced in at sentence ends so the
// animation can breathe without re-generating the voice.
// Usage: node engine/timeline.mjs [COURSE_DIR]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const course = process.argv[2] || 'COURSE_01_SWITCHING_VLAN';
const dir = path.join(root, course);
const FF = path.join(root, 'node_modules/ffmpeg-static/ffmpeg');
const SR = 44100;

const cfg = JSON.parse(fs.readFileSync(path.join(dir, '08-source/timing.json'), 'utf8'));
const board = JSON.parse(fs.readFileSync(path.join(dir, '04-storyboard.json'), 'utf8'));
// chapters that open with a bumper get a longer silence before them
const juicePath = path.join(dir, '08-source/juice.json');
const bumperSections = new Set(fs.existsSync(juicePath) ? JSON.parse(fs.readFileSync(juicePath, 'utf8')).bumpers.map((b) => b.section) : []);
const alDir = path.join(dir, '07-audio/alignment');
const sections = fs.readdirSync(alDir).filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(fs.readFileSync(path.join(alDir, f), 'utf8')));

export const key = (w) => w.toLowerCase().normalize('NFC').replace(/[«»"“”.,;:!?…()]/g, '').replace(/’/g, "'");

function decode(mp3) {
  const buf = execFileSync(FF, ['-v', 'error', '-i', mp3, '-f', 's16le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 1 << 30 });
  return new Int16Array(buf.buffer, buf.byteOffset, buf.length / 2);
}

const chunks = [];
const words = [];
const sectionsOut = [];
let cursor = cfg.lead_in;
chunks.push(new Int16Array(Math.round(cfg.lead_in * SR)));

for (const s of sections) {
  const pcm = decode(path.join(dir, '07-audio', s.file));
  const dur = pcm.length / SR;
  const W = s.words;
  // gaps to insert after word i
  const extra = new Map();
  W.forEach((w, i) => { if (i < W.length - 1 && /[.?!…]$/.test(w.word)) extra.set(i, cfg.sentence_gap); });
  const counts = {};
  for (const h of cfg.holds.filter((h) => h.section === s.section)) {
    const want = h.n || 1;
    let seen = 0, idx = -1;
    for (let i = 0; i < W.length; i++) if (key(W[i].word) === key(h.after) && ++seen === want) { idx = i; break; }
    if (idx < 0 || idx === W.length - 1) { console.warn(`hold not placed: ${s.section} after "${h.after}" #${want}`); continue; }
    extra.set(idx, (extra.get(idx) || 0) + h.dur);
    counts[h.after] = true;
  }
  // splice: cut at the middle of the natural gap after the word
  let from = 0, inserted = 0;
  const cuts = [...extra.keys()].sort((a, b) => a - b);
  const shiftAt = [];
  for (const i of cuts) {
    const c = (W[i].end + W[i + 1].start) / 2;
    const cs = Math.round(c * SR);
    chunks.push(pcm.subarray(from, cs));
    chunks.push(new Int16Array(Math.round(extra.get(i) * SR)));
    from = cs;
    inserted += extra.get(i);
    shiftAt.push({ c, total: inserted });
  }
  chunks.push(pcm.subarray(from));
  const shift = (t) => { let sft = 0; for (const x of shiftAt) if (t > x.c) sft = x.total; return sft; };
  W.forEach((w, i) => words.push({
    i: words.length, section: s.section, w: w.word,
    start: +(cursor + w.start + shift(w.start)).toFixed(3),
    end: +(cursor + w.end + shift(w.start)).toFixed(3),
    sentenceEnd: /[.?!…]$/.test(w.word),
  }));
  sectionsOut.push({ id: s.section, file: s.file, start: +cursor.toFixed(3), end: +(cursor + dur + inserted).toFixed(3) });
  cursor += dur + inserted;
  const nextSec = sections[sections.indexOf(s) + 1];
  const gap = !nextSec ? cfg.tail : bumperSections.has(nextSec.section) ? ((cfg.bumper_gaps || {})[nextSec.section] ?? cfg.bumper_gap ?? cfg.section_gap) : cfg.section_gap;
  chunks.push(new Int16Array(Math.round(gap * SR)));
  cursor += gap;
}

// write voice.wav
const total = chunks.reduce((n, c) => n + c.length, 0);
const wav = Buffer.alloc(44 + total * 2);
wav.write('RIFF', 0); wav.writeUInt32LE(36 + total * 2, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(SR, 24);
wav.writeUInt32LE(SR * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(total * 2, 40);
let off = 44;
for (const c of chunks) { Buffer.from(c.buffer, c.byteOffset, c.length * 2).copy(wav, off); off += c.length * 2; }
fs.writeFileSync(path.join(dir, '07-audio/voice.wav'), wav);
const duration = total / SR;

// ---- resolve storyboard anchors
const secOf = (sceneId) => sceneId.split('.')[0];
const inSec = (sec) => words.filter((w) => w.section === sec);
const findSeq = (list, phrase, from = 0) => {
  const toks = phrase.split(/\s+/).map(key).filter(Boolean);
  for (let i = from; i <= list.length - toks.length; i++) {
    if (toks.every((t, k) => key(list[i + k].w) === t || (k === toks.length - 1 && key(list[i + k].w).startsWith(t)))) return i;
  }
  return -1;
};
const scenes = [];
const warnings = [];
for (const sc of board.scenes) {
  const list = inSec(secOf(sc.scene_id));
  const prev = scenes.filter((x) => secOf(x.id) === secOf(sc.scene_id)).at(-1);
  const from = prev ? prev.firstLocal + 1 : 0;
  const first3 = sc.start_sentence.split(/\s+/).slice(0, 5).join(' ');
  let idx = findSeq(list, first3, from);
  if (idx < 0) { warnings.push(`scene ${sc.scene_id}: start "${first3}" not found`); idx = from; }
  scenes.push({ id: sc.scene_id, section: sc.section, firstLocal: idx, start: list[idx].start });
}
scenes.forEach((s, i) => { s.end = i < scenes.length - 1 ? scenes[i + 1].start : duration; });

const events = [];
board.scenes.forEach((sc, si) => {
  const S = scenes[si];
  const list = inSec(secOf(sc.scene_id));
  const endLocal = si < scenes.length - 1 && secOf(scenes[si + 1].id) === secOf(sc.scene_id) ? scenes[si + 1].firstLocal : list.length;
  let from = S.firstLocal;
  for (const a of sc.animation) {
    // anchors are searched in order inside the scene, then anywhere after it
    let idx = findSeq(list.slice(0, endLocal), a.anchor, from);
    if (idx < 0) idx = findSeq(list.slice(0, endLocal), a.anchor, S.firstLocal);
    if (idx < 0) { warnings.push(`${sc.scene_id}: anchor "${a.anchor}" not found`); idx = from; }
    else from = idx;
    events.push({ scene: sc.scene_id, anchor: a.anchor, word: list[idx].w, t: +(list[idx].start + (a.at || 0)).toFixed(3), action: a.action });
  }
});

const timeline = {
  course, fps: board.format.fps, width: board.format.width, height: board.format.height,
  duration: +duration.toFixed(3), audio: '07-audio/voice.wav',
  sections: sectionsOut,
  scenes: scenes.map(({ firstLocal, ...s }) => ({ ...s, start: +s.start.toFixed(3), end: +s.end.toFixed(3) })),
  events, words,
};
fs.writeFileSync(path.join(dir, '05-timeline.json'), JSON.stringify(timeline, null, 1));
warnings.forEach((w) => console.warn('WARN', w));
console.log(`voice.wav ${duration.toFixed(1)} s · ${words.length} words · ${scenes.length} scenes · ${events.length} events`);
