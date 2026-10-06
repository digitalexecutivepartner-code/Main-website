# SEO Agent — Autopilot (DeepSeek)

Every day at **06:00 Vietnam** (cron `0 23 * * *` UTC) when Autopilot is on — or any time with **▶ Run now**:

```
scan (GSC · Google autocomplete · RSS, max 60 keywords) ──► ONE strategist call → best 2 new-post ideas ──► write + SEO polish ──► Draft → Published if SEO > 60
```

- Exactly “Posts per run” posts (default 2) per run — no idea queue, no approval step, so no tokens spent on ideas that are never written.
- Only new blog posts; existing pages are never rewritten. No featured image, no fact check.
- Boosters in every run (boost.js): **IndexNow** ping for new/changed URLs (key served at `/indexnow.txt`), **backlinks** to each new post from up to 3 older related agent posts, **title rewrite** for agent posts at Google positions 8–20 with CTR < 2 % (max 3/run, once per 30 days, needs Search Console, ~300 tokens each).
- Posts with SEO ≤ threshold wait in “Draft ready” → fix in the editor, then Publish (or the next run publishes them).

## Go live

1. `npm run db:setup` (creates `seo_proposals`, `seo_runs`; safe to re-run)
2. `npm run deploy`
3. Admin → **SEO Agent** → Settings → **🚀 Autopilot → Turn on** (optionally ▶ Run now to see it work)
4. Recommended: upload the Google Search Console service-account `.json` in the same Settings tab

## Files

| File | Role |
|---|---|
| `index.js` | `runSeoAgent(env, { manual })`: scan → write → publish; settings defaults |
| `sources.js` | Search Console (service-account JWT, encrypted key), Google autocomplete, RSS |
| `agents.js` | Strategist (one call → best N ideas), Writer (outputs CMS blocks) |
| `seo-polish.js` | One H1, meta 30–60 / 70–160 with keyword, OG, keywords, internal links, cover image; 13-point SEO report |
| `boost.js` | IndexNow, backlinks from older posts, meta title/description rewrite from Search Console data |
| `publish.js` | Draft → Published with the SEO gate, cache purge, sitemap, chat knowledge refresh |
| `admin.js` | `/admin/api/seo/*`: overview, proposals, run, draft, publish, gsc, settings |
| `llm.js` | DeepSeek JSON-mode call: tolerant parsing, one retry on cut-off/empty/invalid replies (reuses the chat widget's key) |

UI: `src/admin/ui.js` (SEO Agent tab: Posts [Draft ready · Published · Failed] · History · Settings). Cron: `src/worker.js` `scheduled()` + `wrangler.toml`.

## Settings (`settings.seo_agent`)

`autopilot` (off) · `per_run` posts per run (2) · `publish_min_seo` (60, publish when score is above) · `min_score` idea score (55) · `model` · `seeds` · `feeds`.
Search Console key: `settings._gsc`, AES-GCM encrypted, never sent to the browser (fallback: `GSC_SA_JSON` + `GSC_SITE` secrets).

Test the cron locally: `npx wrangler dev --test-scheduled` then `curl "http://localhost:8787/__scheduled?cron=0+23+*+*+*"`

## Photos

Each new post gets two real photos, chosen from the library of tagged cover photos in `db/photos.js` (84 photos):

- **Cover**: `src/seo-agent/covers.js` matches the post title, keyword and excerpt against each photo's `tags`; on a tie the photo used by the fewest posts wins.
- **Photo in the article**: one more photo (never the same as the cover) is inserted as Markdown (`![alt](/assets/photos/…-1200.webp)`) just before a middle `##` section. Posts with fewer than 2 sections, or that already contain an image, are left alone. It stays editable in the post's text in Admin.

Photos are only used when the file is deployed in `public/assets/photos/`. To add more choices, add a `kind: 'cover'` entry with `tags` in `db/photos.js`, run `node scripts/seed-photos.mjs download` and deploy. `node scripts/seed-photos.mjs db` adds the in-article photo to existing posts too.
