// Voice QA: transcribe every track back with ElevenLabs Scribe and diff it
// against the script text, to catch mispronounced, skipped or invented words.
// Usage: node engine/voice-qa.mjs [COURSE_DIR] [--only 05,07]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const course = args.find((a) => !a.startsWith('--') && !/^\d/.test(a)) || 'COURSE_01_SWITCHING_VLAN';
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const dir = path.join(root, course, '07-audio');
const qaDir = path.join(root, course, '09-contact-sheets');

// Spellings that differ only in form, not in what was said.
const EQUIV = {
  dix: '10', vingt: '20', trente: '30', cinquante: '50', 'quarante-huit': '48',
  'a-a': 'aa', 'b-b': 'bb', 'c-c': 'cc', 'd-d': 'dd', bébé: 'bb', switches: 'switchs', vlans: 'vlan',
};
export const norm = (t) => (t.replace(/<[^>]+>/g, ' ').toLowerCase().normalize('NFC').match(/[\p{L}\p{N}'-]+/gu) || [])
  .map((w) => EQUIV[w] || w);

// Word-level LCS diff.
export function diff(a, b) {
  const m = a.length, n = b.length;
  const L = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = [];
  let i = 0, j = 0, del = [], ins = [];
  const flush = () => { if (del.length || ins.length) out.push({ script: del.join(' '), heard: ins.join(' ') }); del = []; ins = []; };
  while (i < m || j < n) {
    if (i < m && j < n && a[i] === b[j]) { flush(); i++; j++; }
    else if (j < n && (i === m || L[i][j + 1] >= L[i + 1][j])) ins.push(b[j++]);
    else del.push(a[i++]);
  }
  flush();
  return { matched: L[0][0], out };
}

export async function stt(file) {
  const fd = new FormData();
  fd.append('model_id', 'scribe_v1');
  fd.append('language_code', 'fra');
  fd.append('file', new Blob([fs.readFileSync(file)]), path.basename(file));
  const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY }, body: fd });
  if (!res.ok) throw new Error(`STT ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).text;
}

if (import.meta.url === `file://${process.argv[1]}`) {
const files = fs.readdirSync(path.join(dir, 'alignment')).filter((f) => f.endsWith('.json')).sort()
  .filter((f) => !only || only.includes(f.slice(0, 2)));
const rows = await Promise.all(files.map(async (f) => {
  const al = JSON.parse(fs.readFileSync(path.join(dir, 'alignment', f), 'utf8'));
  const heard = await stt(path.join(dir, al.file));
  const ref = norm(al.text), hyp = norm(heard);
  const d = diff(ref, hyp);
  return { track: al.file, score: (2 * d.matched) / (ref.length + hyp.length), diffs: d.out, heard };
}));

const report = ['# Voice QA — transcription retour (ElevenLabs Scribe) vs script', '',
  '| Piste | Concordance | Écarts (script → entendu) |', '|---|---|---|',
  ...rows.map((r) => `| ${r.track} | ${(r.score * 100).toFixed(1)} % | ${r.diffs.map((d) => `« ${d.script || '∅'} » → « ${d.heard || '∅'} »`).join(' · ') || '—'} |`)];
if (!only) fs.writeFileSync(path.join(qaDir, 'voice-qa.md'), report.join('\n') + '\n');
console.log(report.slice(2).join('\n'));
}
