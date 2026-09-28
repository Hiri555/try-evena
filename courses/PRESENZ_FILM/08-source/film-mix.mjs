// Film mix: voice (EBU R128) + Suno bed placed so its drop lands on « Présenz »,
// a hard silence break before it, sidechain ducking under the voice, SFX bus, limiter.
// Usage: node PRESENZ_FILM/08-source/film-mix.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const FF = require('ffmpeg-static');
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const r = (p) => path.join(dir, p);
const ff = (args) => execFileSync(FF, ['-hide_banner', '-y', ...args], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26 }).toString() + '';
const ffLog = (args) => String(spawnSync(FF, ['-hide_banner', '-y', ...args], { maxBuffer: 1 << 26 }).stderr);

const T = JSON.parse(fs.readFileSync(r('05-timeline.json'), 'utf8'));
const word = (w, after = 0) => T.words.find((x) => x.start >= after && x.w.replace(/[.,!?…]/g, '') === w).start;
const drop = word('Présenz');                       // first « Présenz » (S03)
const s3 = T.sections.find((s) => s.id === 'S03').start;
const dur = T.duration;
const TRACK_DROP = 33.43;                           // measured kick of the drop in a-pulse.mp3
const delay = drop - TRACK_DROP;
console.log(`drop ${drop.toFixed(2)} s · music delay ${delay.toFixed(2)} s`);

// voice loudnorm (2 pass)
const LN = 'I=-16:TP=-1.5:LRA=11';
const log = ffLog(['-i', r('07-audio/voice.wav'), '-af', `loudnorm=${LN}:print_format=json`, '-f', 'null', '-']);
const m = JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));
const voiceNorm = `loudnorm=${LN}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;

// music gain envelope (linear), evaluated per frame
const dB = (x) => Math.pow(10, x / 20).toFixed(4);
const pre = dB(-11), gap = dB(-38), post = dB(-6);
const env = `if(lt(t,${(s3 - 0.1).toFixed(2)}),${pre},if(lt(t,${(s3 + 0.5).toFixed(2)}),${pre}+(${gap}-${pre})*(t-${(s3 - 0.1).toFixed(2)})/0.6,if(lt(t,${(drop - 0.03).toFixed(2)}),${gap},${post})))`;
const ms = Math.round(delay * 1000);
const graph =
  `[0:a]${voiceNorm},aresample=48000,aformat=channel_layouts=stereo,asplit=2[v][key];` +
  `[1:a]volume=-9dB,aresample=48000,aformat=channel_layouts=stereo[s];` +
  `[2:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${ms}|${ms},atrim=0:${dur.toFixed(2)},volume='${env}':eval=frame,afade=t=out:st=${(dur - 3.2).toFixed(2)}:d=3.2[mraw];` +
  `[mraw][key]sidechaincompress=threshold=0.02:ratio=5:attack=20:release=380:makeup=1[m];` +
  `[v][m][s]amix=inputs=3:normalize=0:duration=first,alimiter=limit=0.89:level=false[out]`;
ff(['-i', r('07-audio/voice.wav'), '-i', r('07-audio/sfx.wav'), '-i', r('07-audio/music/a-pulse.mp3'), '-filter_complex', graph, '-map', '[out]', '-c:a', 'pcm_s16le', r('renders/mix.wav')]);
const chk = ffLog(['-i', r('renders/mix.wav'), '-af', `loudnorm=${LN}:print_format=json`, '-f', 'null', '-']);
const c = JSON.parse(chk.slice(chk.lastIndexOf('{'), chk.lastIndexOf('}') + 1));
console.log(`mix: ${c.input_i} LUFS · TP ${c.input_tp} dBTP · LRA ${c.input_lra}`);

ff(['-i', r('renders/video.mp4'), '-i', r('renders/mix.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', r('10-final.mp4')]);
console.log('10-final.mp4');
