// SFX pass: generate a small sound library once (ElevenLabs sound-generation,
// cached in 07-audio/sfx/) and lay every cue on the timeline → 07-audio/sfx.wav.
// Usage: node engine/sfx.mjs [COURSE_DIR]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const course = process.argv[2] || 'COURSE_01_SWITCHING_VLAN';
const dir = path.join(root, course);
const FF = path.join(root, 'node_modules/ffmpeg-static/ffmpeg');
const SR = 44100;
const cfg = JSON.parse(fs.readFileSync(path.join(dir, '08-source/sfx.json'), 'utf8'));
const T = JSON.parse(fs.readFileSync(path.join(dir, '05-timeline.json'), 'utf8'));
const lib = path.join(dir, '07-audio/sfx');
fs.mkdirSync(lib, { recursive: true });

for (const [name, s] of Object.entries(cfg.library)) {
  const f = path.join(lib, `${name}.mp3`);
  if (fs.existsSync(f)) continue;
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ text: s.prompt, duration_seconds: s.duration, prompt_influence: 0.6 }),
  });
  if (!res.ok) throw new Error(`sound-generation ${name}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  fs.writeFileSync(f, Buffer.from(await res.arrayBuffer()));
  console.log('generated', name);
}

const decode = (f) => {
  const b = execFileSync(FF, ['-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 1 << 28 });
  return new Float32Array(b.buffer, b.byteOffset, b.length / 4);
};
const pcm = Object.fromEntries(Object.keys(cfg.library).map((n) => [n, decode(path.join(lib, `${n}.mp3`))]));
// normalise every sound to the same peak so cue gains are comparable
for (const a of Object.values(pcm)) { let m = 0; for (const v of a) m = Math.max(m, Math.abs(v)); if (m > 0) for (let i = 0; i < a.length; i++) a[i] /= m; }

const out = new Float32Array(Math.ceil(T.duration * SR));
let placed = 0;
for (const [scene, anchor, name, offset, gainDb] of cfg.cues) {
  const ev = T.events.find((e) => e.scene === scene && e.anchor === anchor);
  if (!ev) { console.warn(`cue ${scene}/${anchor} not found`); continue; }
  const start = Math.round((ev.t + offset) * SR), g = 10 ** (gainDb / 20), a = pcm[name];
  // 8 ms fade-in/out so no cue ever clicks
  const fade = Math.round(0.008 * SR);
  for (let i = 0; i < a.length && start + i < out.length; i++) {
    const env = Math.min(1, i / fade, (a.length - i) / fade);
    out[start + i] += a[i] * g * env;
  }
  placed++;
}
let peak = 0; for (const v of out) peak = Math.max(peak, Math.abs(v));
const norm = peak > 0 ? 0.9 / peak : 1;
const wav = Buffer.alloc(44 + out.length * 2);
wav.write('RIFF', 0); wav.writeUInt32LE(36 + out.length * 2, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(SR, 24);
wav.writeUInt32LE(SR * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(out.length * 2, 40);
for (let i = 0; i < out.length; i++) wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[i] * norm)) * 32767), 44 + i * 2);
fs.writeFileSync(path.join(dir, '07-audio/sfx.wav'), wav);
console.log(`sfx.wav: ${placed} cues`);
