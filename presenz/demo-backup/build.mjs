import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
const FF = '/home/user/try-evena/courses/node_modules/ffmpeg-static/ffmpeg';
const C = '/home/user/try-evena/presenz/presenz-captures/';
const FONT = '/home/user/try-evena/courses/engine/fonts/Inter-700.ttf';
// [image, duration, crop [x,y,w,h] | null, caption, phone?]
const S = [
  [C + 'professeur/02-projeter-qr-liste.png', 5, [256, 0, 1184, 760], 'Le prof choisit son cours'],
  [C + 'professeur/04-projection-plein-ecran.png', 7, [420, 190, 600, 480], 'Le QR est projeté. Il se renouvelle tout seul.'],
  [C + 'etudiant/04-pointage-valider.png', 6, null, "L'étudiant scanne le QR", true],
  [C + 'etudiant/04-pointage-valider.png', 4, null, 'Son empreinte confirme que c\u2019est bien lui', true],
  [C + 'etudiant/05-presence-validee.png', 5, null, 'Présence validée', true],
  [C + 'professeur/05-suivi-direct.png', 9, [256, 100, 1184, 740], 'Côté prof : la liste se remplit en direct'],
  [C + 'scolarite/01-dashboard.png', 7, [256, 0, 1184, 620], "Côté scolarité : l'info arrive seule"],
  [C + 'scolarite/08-reporting.png', 7, [256, 0, 1184, 900], 'Absents chroniques · relance en 1 clic'],
  ['d2.png', 5, null, ''],
];
execSync(`node caps.cjs '${JSON.stringify(S.map(x => x[3])).replace(/'/g, "'\\''")}'`);
const segs = [];
S.forEach(([img, d, crop, cap, phone], i) => {
  const out = `seg${i}.mp4`; segs.push(out);
  const fit = phone ? 'scale=-2:920' : 'scale=1720:900:force_original_aspect_ratio=decrease';
  const f = [
    crop ? `crop=${crop[2]}:${crop[3]}:${crop[0]}:${crop[1]}` : 'null',
    fit,
    phone ? 'pad=iw+28:ih+28:14:14:color=0x1b4332' : 'null',
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2-(${cap ? 40 : 0}):color=0xf6f8f7`,
    `scale=w='trunc(1920*(1+0.05*t/${d})/2)*2':h=-2:eval=frame`, `crop=1920:1080`,
  ].join(',') + (cap ? `[v];[v][1:v]overlay=0:0` : '') + `,fade=t=in:st=0:d=0.35,fade=t=out:st=${d - 0.35}:d=0.35,format=yuv420p`;
  execFileSync(FF, ['-v', 'error', '-y', '-loop', '1', '-framerate', '30', '-t', String(d), '-i', img, ...(cap ? ['-loop', '1', '-t', String(d), '-i', `cap${i}.png`] : []), '-filter_complex', f, '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-r', '30', out]);
  console.log('seg', i);
});
fs.writeFileSync('list.txt', segs.map(s => `file '${s}'`).join('\n'));
execFileSync(FF, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', '-movflags', '+faststart', 'presenz-demo-backup.mp4']);
segs.forEach(s => fs.unlinkSync(s)); fs.unlinkSync('list.txt');
console.log('done');
