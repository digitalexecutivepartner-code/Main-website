#!/usr/bin/env node
// Real photos for the site — see db/photos.js for the list.
//   node scripts/seed-photos.mjs download   → fetch every photo (WebP, 2 sizes) into public/assets/photos/
//   npm run deploy                          → publish the files
//   node scripts/seed-photos.mjs db         → add the photos to the live pages and blog posts
//   node scripts/seed-photos.mjs db --dry   → only show what would change
// Safe to run again: existing files are skipped, and the DB step never replaces an image that is already set.
import { mkdirSync, existsSync, writeFileSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PHOTOS, SIZES, fileFor, applyPagePhotos, POST_COVERS, coverFor, pickCover, addBodyImage } from '../db/photos.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cmd = process.argv[2];
const dry = process.argv.includes('--dry');

async function download() {
  const dir = join(root, 'public/assets/photos');
  mkdirSync(dir, { recursive: true });
  let got = 0, skip = 0, fail = 0, bytes = 0;
  for (const [key, p] of Object.entries(PHOTOS)) {
    for (const [w, h] of SIZES[p.kind]) {
      const out = join(root, 'public', fileFor(key, w));
      if (existsSync(out) && statSync(out).size > 1000) { skip++; continue; }
      const url = `${p.src}?w=${w}&h=${h}&fit=crop&crop=${p.crop || 'entropy'}&fm=webp&q=${w > 1000 ? 64 : 72}`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') throw new Error('not a WebP file');
        writeFileSync(out, buf);
        got++; bytes += buf.length;
        console.log(`  ✓ ${fileFor(key, w)}  ${(buf.length / 1024).toFixed(0)} KB`);
      } catch (e) {
        fail++;
        console.log(`  ✗ ${fileFor(key, w)}  ${e.message}  (${url})`);
      }
    }
  }
  console.log(`\nDownloaded ${got} (${(bytes / 1024 / 1024).toFixed(1)} MB), already there ${skip}, failed ${fail}.`);
  if (!fail) console.log('Next: npm run deploy, then node scripts/seed-photos.mjs db');
  process.exitCode = fail ? 1 : 0;
}

async function patchDb() {
  // every referenced file must exist locally, otherwise the live site would show broken images
  const missing = Object.keys(PHOTOS).flatMap((k) => SIZES[PHOTOS[k].kind].map(([w]) => fileFor(k, w))).filter((f) => !existsSync(join(root, 'public', f)));
  if (missing.length) { console.error(`✗ ${missing.length} photo files are missing — run "node scripts/seed-photos.mjs download" first.`); process.exit(1); }

  const { neon, neonConfig } = await import('@neondatabase/serverless');
  const f = join(root, '.dev.vars');
  const vars = { ...(existsSync(f) ? Object.fromEntries(readFileSync(f, 'utf8').split('\n').map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/)).filter(Boolean).map((m) => [m[1], m[2]])) : {}), ...process.env };
  if (!vars.DATABASE_URL) { console.error('✗ DATABASE_URL not found in .dev.vars'); process.exit(1); }
  if (vars.NEON_FETCH_ENDPOINT) neonConfig.fetchEndpoint = vars.NEON_FETCH_ENDPOINT;
  const sql = neon(vars.DATABASE_URL);
  const q = (t, p = []) => sql.query(t, p);

  const rows = await q(`SELECT id, type, slug, title, excerpt, cover_image, status, blocks, seo, published_at FROM pages WHERE type IN ('home','page','post')`);
  let changed = 0;
  const used = {};
  for (const r of rows) if (r.type === 'post' && r.cover_image) used[r.cover_image] = (used[r.cover_image] || 0) + 1;
  for (const r of rows) {
    const before = JSON.parse(JSON.stringify(r));
    let notes = [];
    if (r.type !== 'post') notes = applyPagePhotos(r);
    if (r.type === 'post' && !r.cover_image) {
      // hand-picked photo when listed in POST_COVERS, otherwise the same automatic match the SEO agent uses
      r.cover_image = POST_COVERS[r.slug] ? coverFor(POST_COVERS[r.slug]) : pickCover({ title: r.title, keyword: r.seo?._agent?.keyword, excerpt: r.excerpt }, used);
      if (r.cover_image) { used[r.cover_image] = (used[r.cover_image] || 0) + 1; notes.push(`cover ← ${r.cover_image.split('/').pop()}${POST_COVERS[r.slug] ? '' : ' (auto)'}`); }
    }
    if (r.type === 'post') {
      // one photo in the middle of the article (skipped when the body already has an image)
      const rich = (r.blocks || []).find((b) => b.type === 'richtext');
      const res = rich && addBodyImage(rich.data?.body, { title: r.title, keyword: r.seo?._agent?.keyword, excerpt: r.excerpt }, { cover: r.cover_image, used });
      if (res) { rich.data.body = res.body; used[res.src] = (used[res.src] || 0) + 1; notes.push(`photo in article ← ${res.src.split('/').pop()}`); }
    }
    if (!notes.length) continue;
    changed++;
    console.log(`  ${dry ? '·' : '✓'} ${r.type === 'post' ? '/blog/' : '/'}${r.slug}: ${notes.join(', ')}`);
    if (dry) continue;
    // keep a revision so the change can be undone from Admin → page → History
    await q(`INSERT INTO page_revisions (page_id, snapshot) VALUES ($1, $2::jsonb)`, [r.id, JSON.stringify(before)]);
    await q(`UPDATE pages SET cover_image = $2, blocks = $3::jsonb, updated_at = now() WHERE id = $1`, [r.id, r.cover_image, JSON.stringify(r.blocks)]);
  }
  console.log(`\n${dry ? 'Would update' : 'Updated'} ${changed} page(s).`);
  if (!dry && changed) console.log('Pages refresh by themselves within an hour. To show them right away: Admin → "⟳ Clear cache" (top bar).');
}

if (cmd === 'download') await download();
else if (cmd === 'db') await patchDb();
else console.log('Usage: node scripts/seed-photos.mjs download | db [--dry]');
