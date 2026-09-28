// Master pass: voice (loudness-normalised) + SFX (well under the voice) →
// 10-final.mp4, then burn subtitles → 11-final-subtitles.mp4.
// Usage: node engine/master.mjs [COURSE_DIR]
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const course = process.argv[2] || 'COURSE_01_SWITCHING_VLAN';
const dir = path.join(root, course);
const FF = path.join(root, 'node_modules/ffmpeg-static/ffmpeg');
const r = (p) => path.join(dir, p);
const ff = (args) => {
  const p = spawnSync(FF, ['-y', '-hide_banner', ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (p.status !== 0) throw new Error(p.stderr.slice(-2000));
  return p.stderr;
};

const LN = 'I=-16:TP=-1.5:LRA=11';
const SFX_GAIN_DB = -20; // SFX bus relative to its own peak-normalised level

// 1. voice: two-pass EBU R128 loudness normalisation
const log = ff(['-i', r('07-audio/voice.wav'), '-af', `loudnorm=${LN}:print_format=json`, '-f', 'null', '-']);
const m = JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));
const voiceNorm = `loudnorm=${LN}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;

// 2. mix: voice + SFX bus, then a limiter so nothing clips
ff(['-i', r('07-audio/voice.wav'), '-i', r('07-audio/sfx.wav'), '-filter_complex',
  `[0:a]${voiceNorm},aresample=48000[v];[1:a]volume=${SFX_GAIN_DB}dB,aresample=48000[s];[v][s]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.84:level=false[out]`,
  '-map', '[out]', '-ac', '2', '-c:a', 'pcm_s16le', r('renders/mix.wav')]);
const check = ff(['-i', r('renders/mix.wav'), '-af', `loudnorm=${LN}:print_format=json`, '-f', 'null', '-']);
const c = JSON.parse(check.slice(check.lastIndexOf('{'), check.lastIndexOf('}') + 1));
console.log(`mix: ${c.input_i} LUFS · true peak ${c.input_tp} dBTP · LRA ${c.input_lra}`);

// 3. 10-final.mp4: rendered picture + mix
ff(['-i', r('renders/video.mp4'), '-i', r('renders/mix.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', r('10-final.mp4')]);
console.log('10-final.mp4');

// 4. 11-final-subtitles.mp4: burn the ASS subtitles (Inter, white, black outline)
const fonts = path.join(root, 'engine/fonts');
ff(['-i', r('10-final.mp4'), '-vf', `subtitles=${r('renders/subtitles.ass')}:fontsdir=${fonts}`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', r('11-final-subtitles.mp4')]);
console.log('11-final-subtitles.mp4');
