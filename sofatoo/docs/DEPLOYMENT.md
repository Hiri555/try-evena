# DEPLOYMENT

The deliverable in `site/` is **plain static HTML, CSS, JS and media**. There is no build
step, no server runtime, no framework and no database. Any web server that returns files
can host it, which is the point: the project is not tied to a platform.

## What you need

| | |
|---|---|
| To **host** `site/` | nothing — a static web server |
| To **re-run** the rebuild or the tests | Node.js **≥ 18** (developed on 22.x) |
| Output directory | `site/` |
| Build command | *none* (optionally `npm run build` to regenerate from source) |
| Environment variables | *none* |
| Server-side redirects required | *none* |

Routing is directory-based: every route is a real `index.html` at a real path
(`/our-brand/` → `site/our-brand/index.html`). No SPA rewrite rule, no catch-all, no
`_redirects` needed.

## Get the project and run it locally

```bash
git clone https://github.com/hiri555/try-evena.git
```

```bash
cd try-evena && git checkout claude/quirky-goldberg-k1sqkf
```

```bash
npm run dev
```

`npm run dev` serves `site/` on <http://127.0.0.1:8777>. Any static server works just as
well — pick one:

```bash
npx serve site
```

```bash
python3 -m http.server 8000 --directory site
```

> Opening `site/index.html` straight off the disk mostly works, because every path is
> relative, but browsers block some requests over `file://`. Use a server.

## Netlify

Publish directory `site`, build command empty.

```bash
npx netlify-cli deploy --dir=site --prod
```

Or commit this `netlify.toml` (already included at the repo root):

```toml
[build]
  publish = "site"
  command = ""
```

## Vercel

Framework preset **Other**, output directory `site`, build command empty.

```bash
npx vercel deploy site --prod
```

`vercel.json` is included at the repo root.

## Cloudflare Pages

Build command empty, build output directory `site`.

```bash
npx wrangler pages deploy site
```

## GitHub Pages

The repository root already contains a `CNAME` for a **different** project, so if you
publish this site via Pages, serve it from a branch whose root *is* the site:

```bash
git subtree push --prefix site origin gh-pages
```

Then set Pages to deploy from branch `gh-pages`, folder `/`.

## Classic shared hosting (cPanel, Plesk, OVH, FTP)

Upload the **contents** of `site/` into `public_html/` (or `www/`). Nothing else is
needed — no PHP, no `.htaccess`, no database.

```bash
rsync -av --delete site/ user@host:/home/user/public_html/
```

## Your own server (nginx)

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/sofatoo/site;
    index index.html;

    # directory-based routes: /our-brand/ -> /our-brand/index.html
    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }

    # long cache for immutable media, short for html
    location ~* \.(jpg|jpeg|png|webp|avif|svg|mp4|mov|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    location ~* \.html$ { expires 10m; }
}
```

Apache needs no config at all beyond `DirectoryIndex index.html`, which is the default.

## Node.js hosting (only if you want it)

Not required, but if your platform insists on a Node process:

```bash
npx serve site --listen ${PORT:-3000}
```

## Large media and Git LFS

**Git LFS is not needed.** The largest file is 41.6 MB
(`site/wp-content/uploads/2026/07/Alliages.mov`), under GitHub's 50 MB warning and well
under the 100 MB hard limit. A plain `git clone` retrieves every image and video.

Total payload is ~123 MB, of which ~70 MB is video. If you want a lighter deployment,
these three files are the whole story:

| File | Size |
|---|---:|
| `site/wp-content/uploads/2026/07/Alliages.mov` | 41.6 MB |
| `site/wp-content/themes/sofatoo-maison-disabled/assets/media/laamu-return.mp4` | 22.7 MB |
| `site/wp-content/uploads/2026/01/YAAYOU-NENE-SCREEN-RECORDING.mov` | 7.9 MB |

Transcoding the two `.mov` files to H.264/AAC MP4 would cut most of that, but it changes
bytes the original site serves, so it was **not** done here. That is your call.

## Regenerating the site from source

```bash
ARCHIVE_DIR=/path/to/extracted-archive ARCHIVE_HOME=/path/to/archive-home.html npm run build
```

`tools/build.mjs` re-derives `site/` from the archive plus the live origin. Without
`ARCHIVE_DIR` it falls back to the origin for everything, which loses the archive's
authority over `/` — pass both when you have the zip.

## Re-running the visual and functional checks

```bash
npm run dev
```

```bash
npm test
```

`npm test` drives real Chromium over all 51 routes at 375 / 768 / 1024 / 1440 px, writes
`tests/verify-report.json` and screenshots into `tests/screenshots/`. It needs Playwright:

```bash
npm install && npx playwright install chromium
```
