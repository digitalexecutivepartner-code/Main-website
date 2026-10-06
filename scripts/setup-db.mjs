#!/usr/bin/env node
// Creates the CMS tables in Neon and imports the seed content.
//   npm run db:setup            → create tables, add seed content that doesn't exist yet
//   npm run db:setup -- --force → also overwrite existing settings and seed pages with the seed version
//   npm run db:setup -- --force=home,header,footer → overwrite only these (page slugs or settings keys; "home" = home page;
//                                                     "services" = /services and every /services/… page)
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { neon, neonConfig } from '@neondatabase/serverless';
import { SETTINGS, PAGES } from '../db/seed.js';
import { seal } from '../src/secrets.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const forceArg = process.argv.find((a) => a.startsWith('--force'));
const forceList = forceArg && forceArg.includes('=') ? forceArg.split('=')[1].split(',').map((s) => s.trim()) : [];
const forced = (key) => forceArg === '--force' || forceList.includes(key) || forceList.some((f) => String(key).startsWith(`${f}/`));

function readDevVars() {
  const f = join(root, '.dev.vars');
  if (!existsSync(f)) return {};
  return Object.fromEntries(readFileSync(f, 'utf8').split('\n').map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/)).filter(Boolean).map((m) => [m[1], m[2]]));
}
const vars = { ...readDevVars(), ...process.env };
if (!vars.DATABASE_URL) {
  console.error('✗ DATABASE_URL not found. Put it in .dev.vars (DATABASE_URL=postgresql://...) or export it first.');
  process.exit(1);
}
if (vars.NEON_FETCH_ENDPOINT) neonConfig.fetchEndpoint = vars.NEON_FETCH_ENDPOINT;
const sql = neon(vars.DATABASE_URL);
const q = (t, p = []) => sql.query(t, p);

const schema = readFileSync(join(root, 'db/schema.sql'), 'utf8')
  .split('\n').filter((l) => !l.trim().startsWith('--')).join('\n')
  .split(';').map((s) => s.trim()).filter(Boolean);

console.log('→ Creating tables…');
for (const stmt of schema) await q(stmt);

console.log('→ Importing settings…');
for (const [key, value] of Object.entries(SETTINGS)) {
  if (forced(key)) {
    await q(`INSERT INTO settings (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`, [key, JSON.stringify(value)]);
  } else {
    await q(`INSERT INTO settings (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO NOTHING`, [key, JSON.stringify(value)]);
  }
}

// DeepSeek API key for the AI chat: DEEPSEEK_API_KEY in .dev.vars is saved encrypted, exactly like
// Admin → Settings → AI chat → Save key. Encryption uses SETTINGS_KEY (or SESSION_SECRET / ADMIN_PASSWORD)
// from .dev.vars, which must have the SAME value as the Cloudflare secret, otherwise the site cannot read it.
const dsKey = String(vars.DEEPSEEK_API_KEY || '').trim();
if (dsKey) {
  const saved = (await q(`SELECT 1 FROM settings WHERE key = '_deepseek_key'`)).length > 0;
  const encKey = ['SETTINGS_KEY', 'SESSION_SECRET', 'ADMIN_PASSWORD'].find((k) => vars[k]);
  if (saved && !forced('_deepseek_key') && !forced('chat')) {
    console.log('  = DeepSeek API key (already saved, kept — use --force=chat to replace it)');
  } else if (!encKey) {
    console.log('  ! DeepSeek API key NOT saved: add SETTINGS_KEY=<same value as the Cloudflare secret> to .dev.vars,');
    console.log('    or paste the key in Admin → Settings → AI chat, or run: npx wrangler secret put DEEPSEEK_API_KEY');
  } else {
    const box = { ...(await seal(vars, dsKey)), hint: `${dsKey.slice(0, 3)}…${dsKey.slice(-4)}`, updated_at: new Date().toISOString() };
    await q(`INSERT INTO settings (key, value) VALUES ('_deepseek_key', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`, [JSON.stringify(box)]);
    console.log(`  + DeepSeek API key saved (encrypted with ${encKey})`);
  }
}

console.log('→ Importing pages…');
for (const p of PAGES) {
  const existing = (await q(`SELECT id FROM pages WHERE type = $1 AND slug = $2`, [p.type, p.slug]))[0];
  const args = [p.type, p.slug, p.title, p.excerpt || '', p.cover_image || '', p.status, JSON.stringify(p.blocks), JSON.stringify(p.seo || {})];
  if (!existing) {
    await q(`INSERT INTO pages (type, slug, title, excerpt, cover_image, status, blocks, seo, published_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb, CASE WHEN $6 = 'published' THEN now() END)`, args);
    console.log(`  + ${p.type === 'home' ? '/' : '/' + p.slug} (${p.status})`);
  } else if (forced(p.type === 'home' ? 'home' : p.slug)) {
    await q(`UPDATE pages SET title=$3, excerpt=$4, cover_image=$5, status=$6, blocks=$7::jsonb, seo=$8::jsonb, updated_at=now() WHERE type=$1 AND slug=$2`, args);
    console.log(`  ↻ ${p.type === 'home' ? '/' : '/' + p.slug} (overwritten)`);
  } else {
    console.log(`  = ${p.type === 'home' ? '/' : '/' + p.slug} (already exists, kept)`);
  }
}
const [{ n }] = await q(`SELECT count(*)::int AS n FROM pages`);
console.log(`✓ Done. ${n} pages in the database.`);
