# Deploying the men's pre-lander

Everything below runs through the Shopify Admin API. It was written after the
template was committed but before it could be deployed, because the Shopify
connector had dropped its authentication and connectors are only read when a
session starts. Reconnect at https://claude.ai/customize/connectors, start a
fresh session, then work through this in order.

Shop: `1rjtw9-pu` · try-rosalia.com · Impact 4.3.4

## What is already done

- `templates/page.men-prelander.json` — the page, 11 sections, ~1,290 words,
  built entirely from existing `rosalia-funnel-*` sections. No new section code.
- `layout/theme.liquid` — `men-prelander` and `quiz-men` added to `rf_funnel`
  so both render without the Shopify header and footer.

Both are committed on `claude/allez-au-boulot-6hs6g3`.

## What is NOT done

- **`/pages/quiz-men` does not exist.** The Clarflow flow has not been created
  and neither has the Shopify page. Until both exist the three CTAs 404.
- **No hero image.** `sections.hero.settings.image` is empty; only `image_alt`
  is set. Either pick one in the theme editor or generate one (see the end).

## Order of operations

### 1. Find the live theme

```graphql
query { themes(first: 25) { edges { node { id name role updatedAt } } } }
```

Take the node whose `role` is `MAIN`. As of 2026-09-13 that was
`151321018412` ("Rosalia — HW + Daily Body 2026-09-13"), but the user
publishes themes between sessions, so read it, never assume it.

### 2. Duplicate it

```graphql
mutation Dup($id: ID!, $name: String!) {
  themeDuplicate(id: $id, name: $name) {
    theme { id name role }
    userErrors { field message }
  }
}
```

Name it in the house style: `Rosalia — Men prelander <YYYY-MM-DD>`.

Duplication is asynchronous. Poll the new theme's `processing` field until it
is false before writing files to it, or the writes are silently dropped.

### 3. Push the two files to the duplicate

**Never to the live theme.** The MCP layer blocks writes to MAIN anyway, but
the rule stands regardless of what the tooling enforces.

```graphql
mutation Upsert($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
  themeFilesUpsert(themeId: $themeId, files: $files) {
    upsertedThemeFiles { filename }
    userErrors { filename code message }
  }
}
```

Files:
- `templates/page.men-prelander.json`
- `layout/theme.liquid`

**Verify every write.** With body type `URL`, `themeFilesUpsert` returns an
empty `userErrors` even when it rejected the file — validation failures are
silent. Read the file back and compare `checksumMd5` against the local MD5:

```graphql
query Check($id: ID!, $names: [String!]) {
  theme(id: $id) {
    files(filenames: $names, first: 10) {
      nodes { filename checksumMd5 size }
    }
  }
}
```

If a checksum does not match, the file did not land. The usual cause is a
schema/template mismatch: Shopify rejects a template that references a section
setting or block type the section's schema does not declare. That is why the
template was validated against every section schema before committing.

### 4. Create the page

```graphql
mutation NewPage($page: PageCreateInput!) {
  pageCreate(page: $page) {
    page { id handle title templateSuffix isPublished }
    userErrors { field message }
  }
}
```

```json
{
  "page": {
    "title": "It isn't the razor. It isn't the beer.",
    "handle": "men-prelander",
    "templateSuffix": "men-prelander",
    "isPublished": true,
    "body": ""
  }
}
```

The body stays empty on purpose — all the content lives in the template.

**A published page with a template suffix the live theme does not have will
fall back to the default page template on the live storefront**, so until the
duplicated theme is published, `/pages/men-prelander` renders as a blank
default page for anyone who finds it. Nothing links to it, so the exposure is
an unadvertised URL, but say so rather than leaving it to be discovered.

### 5. Hand over the preview link

```
https://try-rosalia.com/pages/men-prelander?preview_theme_id=<new theme id>
```

The `preview_theme_id` query parameter alone gets stripped by the storefront
redirect when fetching with curl. To read the served HTML, use a cookie jar:

```sh
curl -c cj.txt -b cj.txt "https://try-rosalia.com/?preview_theme_id=<ID>"
curl -b cj.txt "https://try-rosalia.com/pages/men-prelander" -o out.html
```

In a browser the plain preview URL works normally.

Do not publish the theme. The user publishes.

## The quiz, which is the actual blocker

The page exists to move cold male traffic into a quiz that has not been built.
Two existing Clarflow flows, both written for women:

| page | clarflow id |
|---|---|
| `/pages/quiz-flusher` | `983c965a-5589-4a6e-857b-cee54e4476ad` |
| `/pages/quiz-postpartum` | `318efa75-6694-4c6c-9940-cf5d58c3b8e9` |

A men's flow has to be created in Clarflow first — that is outside the Shopify
API and needs the user. Once it exists, create `/pages/quiz-men` the same way
as the two above: a page carrying the `rosalia-clarflow` section with the new
flow's `data-clarflow-id`. `quiz-men` is already in `rf_funnel`.

Until then, the three CTAs can be pointed at the PDP as a stopgap by editing
`button_url` in `quiz1`, `quiz2` and `sticky`. Worth resisting: over 30 days
the median PDP session is 83 seconds and one click, and 84% of them leave from
that page, while the quiz holds 208 seconds of active time at 80% scroll. The
PDP is the wrong destination for cold traffic, which is the whole reason this
page exists.

## Hero image

`sections.hero.settings.image` takes a Shopify file reference
(`shopify://shop_images/...`). `.rf-figure` in the hero is not aspect-locked
the way `.rf-slot` is elsewhere, but the funnel art pipeline standardised on
3:2 — keep to it.

`scripts/rosalia_art.py` generates through kie.ai (`nano-banana-pro`, ~18
credits and ~18s per image) and needs `KIE_API_KEY` in the environment, which
the container did not have. Note that Google's content filter refuses prompts
featuring people often enough to plan around: the two article heroes both had
to be reshot as objects alone.

Subject that fits the copy: a men's bathroom shelf or sink in flat morning
light, razor and a plain unbranded bottle, no face, no model, cool daylight,
nothing styled as a beauty shot.
