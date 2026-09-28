// KIE AI client: create a generation task, poll it, download the result.
// Reads KIE_API_KEY from the environment only; never logs it.
// Usage:
//   node engine/kie.mjs <out-file> <model> '<input-json>'
//   e.g. node engine/kie.mjs 06-assets/ai/crown.png seedream/5-pro-text-to-image '{"prompt":"…","aspect_ratio":"16:9","quality":"high"}'
import fs from 'node:fs';
import path from 'node:path';

const API = 'https://api.kie.ai/api/v1/jobs';
const headers = () => {
  if (!process.env.KIE_API_KEY) throw new Error('KIE_API_KEY is not set');
  return { Authorization: `Bearer ${process.env.KIE_API_KEY}`, 'Content-Type': 'application/json' };
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function createTask(model, input) {
  const res = await fetch(`${API}/createTask`, { method: 'POST', headers: headers(), body: JSON.stringify({ model, input }) });
  const j = await res.json();
  if (j.code !== 200) throw new Error(`createTask ${model}: ${j.code} ${j.msg}`);
  return j.data.taskId;
}

export async function waitTask(taskId, { timeoutMs = 15 * 60 * 1000, everyMs = 5000 } = {}) {
  const t0 = Date.now();
  for (;;) {
    const res = await fetch(`${API}/recordInfo?taskId=${encodeURIComponent(taskId)}`, { headers: headers() });
    const j = await res.json();
    const d = j.data || {};
    if (d.state === 'success') return { urls: JSON.parse(d.resultJson || '{}').resultUrls || [], credits: d.creditsConsumed ?? d.costTime };
    if (d.state === 'fail') throw new Error(`task ${taskId} failed: ${d.failMsg || d.failCode || 'unknown'}`);
    if (Date.now() - t0 > timeoutMs) throw new Error(`task ${taskId} timed out`);
    await sleep(everyMs);
  }
}

// Upload a local file to KIE's temporary storage (3 days) → public URL for image-to-video.
export async function upload(file, uploadPath = 'ccna-course') {
  const fd = new FormData();
  fd.append('file', new Blob([fs.readFileSync(file)]), path.basename(file));
  fd.append('uploadPath', uploadPath);
  fd.append('fileName', path.basename(file));
  const res = await fetch('https://kieai.redpandaai.co/api/file-stream-upload', { method: 'POST', headers: { Authorization: `Bearer ${process.env.KIE_API_KEY}` }, body: fd });
  const j = await res.json();
  if (!j.data?.downloadUrl) throw new Error(`upload failed: ${j.code} ${j.msg}`);
  return j.data.downloadUrl;
}

export async function generate(model, input, outFile) {
  const id = await createTask(model, input);
  const { urls, credits } = await waitTask(id);
  if (!urls.length) throw new Error(`task ${id}: no result url`);
  const buf = Buffer.from(await (await fetch(urls[0])).arrayBuffer());
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, buf);
  return { file: outFile, credits, taskId: id };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [out, model, json] = process.argv.slice(2);
  const r = await generate(model, JSON.parse(json), out);
  console.log(`${path.basename(r.file)} · ${r.credits ?? '?'} credits · ${r.taskId}`);
}
