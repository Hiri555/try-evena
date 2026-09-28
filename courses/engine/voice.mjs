// Voice pass: 03-script.md → one ElevenLabs track per section + word timestamps.
// Reads ELEVENLABS_API_KEY from the environment only; never logs it.
// Usage: node engine/voice.mjs [COURSE_DIR] [--only 01,02] [--force]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stt, norm, diff } from './voice-qa.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const course = args.find((a) => !a.startsWith('--') && !/^\d/.test(a)) || 'COURSE_01_SWITCHING_VLAN';
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const force = args.includes('--force');
const bestOf = args.includes('--best-of') ? +args[args.indexOf('--best-of') + 1] : 1;
const dir = path.join(root, course);
const outDir = path.join(dir, '07-audio');
const alignDir = path.join(outDir, 'alignment');
fs.mkdirSync(alignDir, { recursive: true });

export const VOICE_DEFAULT = {
  voice_id: '5OnMHwgTFgvPVwE8jP6B', // « Anaïs - Instructor » — française, posée, pédagogue
  model_id: 'eleven_multilingual_v2',
  voice_settings: { stability: 0.42, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: 1.0 },
};
const PAUSE = '<break time="1.2s" />';
// a course can override the voice/model (e.g. eleven_v3) in 08-source/voice.json
const overridePath = path.join(dir, '08-source/voice.json');
export const VOICE = fs.existsSync(overridePath) ? { ...VOICE_DEFAULT, ...JSON.parse(fs.readFileSync(overridePath, 'utf8')) } : VOICE_DEFAULT;

export function parseScript(md) {
  const sections = [];
  let cur = null;
  for (const line of md.split('\n')) {
    const h = line.match(/^## (S\d+) · (.+?) — /);
    if (h) { cur = { id: h[1], title: h[2], lines: [] }; sections.push(cur); continue; }
    const f = line.match(/^`audio\/([\w-]+)\.mp3`/);
    if (f && cur) cur.file = f[1];
    const v = line.match(/^> VOICE : (.+)$/);
    if (v && cur) cur.lines.push(v[1]);
  }
  return sections.filter((s) => s.file && s.lines.length).map((s) => ({
    ...s,
    text: s.lines.join(' ')
      .replace(/\*\*/g, '').replace(/(^|\s)\*(\S[^*]*?)\*/g, '$1$2')
      .replace(/⏸\s*/g, `${PAUSE} `)
      .replace(/\s+/g, ' ').trim(),
  }));
}

// Character alignment → words (skips SSML tags if the API echoes them).
export function wordsFromAlignment(al) {
  const words = [];
  let w = null, inTag = false;
  al.characters.forEach((ch, i) => {
    // SSML tags <…> and ElevenLabs v3 audio tags […] are not spoken words
    if (ch === '<' || ch === '[') inTag = ch;
    if (inTag) { if ((inTag === '<' && ch === '>') || (inTag === '[' && ch === ']')) inTag = false; return; }
    if (/\s/.test(ch)) { if (w) { words.push(w); w = null; } return; }
    if (!w) w = { word: '', start: al.character_start_times_seconds[i], end: 0 };
    w.word += ch;
    w.end = al.character_end_times_seconds[i];
  });
  if (w) words.push(w);
  // a pause tag can leave a bare punctuation token behind: drop it
  return words.filter((x) => /[\p{L}\p{N}]/u.test(x.word)).map((x) => ({ ...x, start: +x.start.toFixed(3), end: +x.end.toFixed(3) }));
}

async function tts(text) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY is not set');
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE.voice_id}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ text, model_id: VOICE.model_id, voice_settings: VOICE.voice_settings, ...(VOICE.language_code ? { language_code: VOICE.language_code } : {}) }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sections = parseScript(fs.readFileSync(path.join(dir, '03-script.md'), 'utf8'));
  for (const s of sections) {
    const num = s.file.slice(0, 2);
    if (only && !only.includes(num)) continue;
    const mp3 = path.join(outDir, `${s.file}.mp3`);
    if (fs.existsSync(mp3) && !force) { console.log('skip', s.file); continue; }
    // best-of-N: every take is transcribed back and the most faithful one wins
    let r, best = -1;
    for (let k = 0; k < bestOf; k++) {
      const take = await tts(s.text);
      if (bestOf === 1) { r = take; break; }
      const tmp = `${mp3}.take${k}.mp3`;
      fs.writeFileSync(tmp, Buffer.from(take.audio_base64, 'base64'));
      const ref = norm(s.text), hyp = norm(await stt(tmp));
      const score = (2 * diff(ref, hyp).matched) / (ref.length + hyp.length);
      fs.unlinkSync(tmp);
      console.log(`  ${s.file} take ${k + 1}: ${(score * 100).toFixed(1)} %`);
      if (score > best) { best = score; r = take; }
      if (score >= 0.995) break;
    }
    fs.writeFileSync(mp3, Buffer.from(r.audio_base64, 'base64'));
    // raw alignment: the normalized one rewrites « as "<<", which reads as a tag
    const words = wordsFromAlignment(r.alignment || r.normalized_alignment);
    fs.writeFileSync(path.join(alignDir, `${s.file}.json`), JSON.stringify({ section: s.id, file: `${s.file}.mp3`, text: s.text, voice: VOICE, words, alignment: r.alignment }, null, 1));
    console.log(`${s.file}: ${s.text.length} chars, ${words.length} words, ${words.at(-1)?.end.toFixed(1)} s`);
  }
}
