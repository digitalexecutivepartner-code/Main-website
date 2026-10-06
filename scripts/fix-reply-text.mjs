// Replace '1–2 business days' wording in the Neon DB (pages + settings).
//   node scripts/fix-reply-text.mjs          → dry run, lists what would change
//   node scripts/fix-reply-text.mjs --apply  → update + save a backup JSON in backup/
import { readFileSync, writeFileSync } from 'node:fs';
import { neon, neonConfig } from '@neondatabase/serverless';
const vars = Object.fromEntries(readFileSync(new URL('../.dev.vars', import.meta.url),'utf8').split('\n').map(l=>l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/)).filter(Boolean).map(m=>[m[1],m[2]]));
if (vars.NEON_FETCH_ENDPOINT) neonConfig.fetchEndpoint = vars.NEON_FETCH_ENDPOINT;
const sql = neon(vars.DATABASE_URL); const q=(t,p=[])=>sql.query(t,p);
const APPLY = process.argv.includes('--apply');
const RE = /1(–|–|-)2 business days/;
const fix = (s) => s.replace(/We reply within 1(–|-)2 business days/g, 'We’ll get back to you as soon as possible')
                    .replace(/ within 1(–|-)2 business days/g, ' as soon as possible');
const walk = (v) => typeof v === 'string' ? fix(v) : Array.isArray(v) ? v.map(walk) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k,x])=>[k,walk(x)])) : v;
const backup = { pages: [], settings: [] }; let left = [];
for (const p of await q('SELECT id,type,slug,title,excerpt,blocks,seo FROM pages')) {
  if (!RE.test(JSON.stringify([p.title,p.excerpt,p.blocks,p.seo]))) continue;
  const n = { title: walk(p.title), excerpt: walk(p.excerpt), blocks: walk(p.blocks), seo: walk(p.seo) };
  console.log('page', p.type, '/'+p.slug, RE.test(JSON.stringify(n)) ? '(STILL HAS LEFTOVER)' : '');
  backup.pages.push(p);
  if (APPLY) await q('UPDATE pages SET title=$2, excerpt=$3, blocks=$4::jsonb, seo=$5::jsonb, updated_at=now() WHERE id=$1',[p.id,n.title,n.excerpt,JSON.stringify(n.blocks),JSON.stringify(n.seo)]);
}
for (const s of await q('SELECT key,value FROM settings')) {
  if (s.key.startsWith('_') || !RE.test(JSON.stringify(s.value))) continue;
  const n = walk(s.value);
  console.log('setting', s.key, RE.test(JSON.stringify(n)) ? '(STILL HAS LEFTOVER)' : '');
  backup.settings.push(s);
  if (APPLY) await q('UPDATE settings SET value=$2::jsonb, updated_at=now() WHERE key=$1',[s.key,JSON.stringify(n)]);
}
if (APPLY) { const f='backup/db-before-reply-text-'+Date.now()+'.json'; writeFileSync(f, JSON.stringify(backup,null,2)); console.log('backup ->', f); }
console.log(APPLY?'APPLIED':'DRY RUN');
