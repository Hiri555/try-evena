// Subtitles pass: timeline words → 12-subtitles.srt (deliverable) and
// renders/subtitles.ass (burn-in style: white, black outline, 2 lines max).
// Spoken spellings are turned back into technical notation for display.
// Usage: node engine/subtitles.mjs [COURSE_DIR]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const course = process.argv[2] || 'COURSE_01_SWITCHING_VLAN';
const dir = path.join(root, course);
const T = JSON.parse(fs.readFileSync(path.join(dir, '05-timeline.json'), 'utf8'));

// spoken phrase → display text (matched on whole words, punctuation kept)
const DISPLAY = [
  ['huit cent deux point un Q', '802.1Q'],
  ['le switch un', 'SW1'], ['Le switch un', 'SW1'], ['le switch deux', 'SW2'], ['Le switch deux', 'SW2'],
  ['VLAN dix, vingt, trente', 'VLAN 10, 20, 30'], ['VLAN dix', 'VLAN 10'], ['VLAN vingt', 'VLAN 20'], ['VLAN trente', 'VLAN 30'],
  ['PC A', 'PC-A'], ['PC B', 'PC-B'],
  ['A-A', 'AA:AA'], ['B-B', 'BB:BB'], ['C-C', 'CC:CC'], ['D-D', 'DD:DD'],
  ['port un', 'port 1'], ['port deux', 'port 2'], ['port trois', 'port 3'], ['Port deux', 'Port 2'],
  ['quarante-huit bits', '48 bits'], ['quatre octets', '4 octets'], ['Cinq ports', '5 ports'],
  ['cinquante', '50'], ['Question un', 'Question 1'], ['Question deux', 'Question 2'], ['Question trois', 'Question 3'],
];
const KEYWORDS = /^(source|destination|flooding|broadcast|VLAN|trunk|tag|802\.1Q|apprend|apprentissage|décide|inonde|routeur)$/i;

// Restore the punctuation the aligner dropped (French spacing puts « ? » or « : »
// in their own token): walk each section's script text alongside its words.
const words = T.words.map((w) => ({ ...w }));
for (const f of fs.readdirSync(path.join(dir, '07-audio/alignment')).filter((x) => x.endsWith('.json'))) {
  const al = JSON.parse(fs.readFileSync(path.join(dir, '07-audio/alignment', f), 'utf8'));
  const ws = words.filter((w) => w.section === al.section);
  let k = -1;
  for (const tok of al.text.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean)) {
    if (/[\p{L}\p{N}]/u.test(tok)) { k++; if (ws[k]) ws[k].w = tok; } else if (ws[k]) ws[k].w += `\u00A0${tok}`;
  }
}
T.words = words;
const bare = (w) => w.replace(/^[«"(]+\u00A0?|\u00A0?[»",.;:!?…)]+$/g, '').replace(/\u00A0[»:;!?]+$/, '');
const tokens = [];
for (let i = 0; i < T.words.length;) {
  let hit = null;
  for (const [spoken, shown] of DISPLAY) {
    const parts = spoken.split(' ');
    const slice = T.words.slice(i, i + parts.length);
    if (slice.length === parts.length && slice.every((w, k) => w.section === T.words[i].section && (k === parts.length - 1 ? bare(w.w) === bare(parts[k]) : w.w.replace(/[»"]+$/, '') === parts[k]))) {
      const last = slice.at(-1).w;
      const lead = slice[0].w.match(/^[«"(]+/)?.[0] || '';
      const trail = last.slice(bare(last).length + (last.match(/^[«"(]+/)?.[0].length || 0));
      hit = { w: lead + shown + trail, start: slice[0].start, end: slice.at(-1).end, section: slice[0].section, n: parts.length };
      break;
    }
  }
  if (hit) { tokens.push(hit); i += hit.n; } else { tokens.push(T.words[i]); i++; }
}

// group into cues: break on sentence end, section change, long pauses, or 2×42 chars
const MAX = 42;
const cues = [];
let cur = [];
const lenOf = (ws) => ws.map((w) => w.w).join(' ').length;
tokens.forEach((w, i) => {
  const next = tokens[i + 1];
  cur.push(w);
  const end = /[.?!](\u00A0»)?$/.test(w.w) || !next || next.section !== w.section || next.start - w.end > 0.7;
  const full = next && lenOf([...cur, next]) > MAX * 2 - 4;
  const softBreak = /[,:;]$/.test(w.w) && lenOf(cur) > MAX;
  if (end || full || softBreak) { cues.push(cur); cur = []; }
});

const lines = (ws) => {
  const txt = ws.map((w) => w.w).join(' ');
  if (txt.length <= MAX) return [ws];
  // balanced split near the middle
  let best = 1, bestD = Infinity;
  for (let k = 1; k < ws.length; k++) { const d = Math.abs(lenOf(ws.slice(0, k)) - lenOf(ws.slice(k))); if (d < bestD) { bestD = d; best = k; } }
  return [ws.slice(0, best), ws.slice(best)];
};
const ts = (s, sep) => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, x = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}${sep}${String(ms % 1000).padStart(3, '0')}`; };
const assT = (s) => { const cs = Math.round(s * 100); return `${Math.floor(cs / 360000)}:${String(Math.floor(cs / 6000) % 60).padStart(2, '0')}:${String(Math.floor(cs / 100) % 60).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`; };

const timed = cues.map((ws, i) => {
  const start = ws[0].start;
  const nextStart = cues[i + 1]?.[0].start ?? T.duration;
  const end = Math.min(nextStart - 0.04, Math.max(ws.at(-1).end + 0.35, start + 1.0));
  return { start, end, lines: lines(ws) };
});

const srt = timed.map((c, i) => `${i + 1}\n${ts(c.start, ',')} --> ${ts(c.end, ',')}\n${c.lines.map((l) => l.map((w) => w.w).join(' ')).join('\n')}\n`).join('\n');
fs.writeFileSync(path.join(dir, '12-subtitles.srt'), srt);

const accent = (w) => (KEYWORDS.test(bare(w)) ? `{\\c&HFFD38F&}${w}{\\c&HFFFFFF&}` : w);
const ass = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Inter SemiBold,46,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,4.5,1.5,2,160,160,52,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${timed.map((c) => `Dialogue: 0,${assT(c.start)},${assT(c.end)},Default,,0,0,0,,${c.lines.map((l) => l.map((w) => accent(w.w)).join(' ')).join('\\N')}`).join('\n')}
`;
fs.mkdirSync(path.join(dir, 'renders'), { recursive: true });
fs.writeFileSync(path.join(dir, 'renders/subtitles.ass'), ass);
console.log(`${timed.length} cues · longest line ${Math.max(...timed.flatMap((c) => c.lines.map((l) => lenOf(l))))} chars`);
