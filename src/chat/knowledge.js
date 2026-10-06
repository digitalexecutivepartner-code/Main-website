// AI chat knowledge, built from the live CMS (published pages + settings).
//
// Speed / token strategy:
//   • core   = llms.txt summary + "Extra knowledge" from the admin. Small and identical on every request,
//              so DeepSeek serves it from its prompt cache (cheaper and faster).
//   • chunks = every page section as a short text chunk. Per question only the few most relevant chunks
//              are sent (keyword retrieval) instead of the whole website (~9k tokens → ~2k).
//   • The compiled index lives in memory and in the edge cache, so most requests skip the database.
import { Settings } from '../db.js';
import { pathFor } from '../site/util.js';
import { DEFAULT_CAPABILITIES } from './config.js';

const TTL_S = 10 * 60;
const CACHE_URL = 'https://dep-chat.internal/kb/v2';
const CORE_MAX = 8000; // chars
let memo = null; // { at, value } — per isolate

// Presentation-only fields, and button/heading text that costs tokens but carries no facts.
const SKIP = new Set(['src', 'src_large', 'width', 'height', 'width_large', 'logo', 'icon', 'accent', 'visual', 'anchor', 'wide', 'hidden',
  'show_cards', 'reverse', 'columns', 'schema_name', 'schema_url', 'schema_category', 'schema_type', 'image', 'alt', 'form_service',
  'preselect', 'note', 'button', 'badge', 'eyebrow', 'pill', 'more', 'cta', 'link_label', 'values']);
const SKIP_BLOCKS = new Set(['contact', 'partners', 'cta', 'image']);

// Light Markdown → text: keeps link targets, drops images and formatting marks.
const clean = (s) => String(s ?? '')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => (u.startsWith('#') ? t : `${t} (${u})`))
  .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
  .replace(/(\*\*|__|`)/g, '')
  .replace(/\s+/g, ' ').trim();

function flatten(value, out, key = '') {
  if (value == null || SKIP.has(key)) return;
  if (typeof value === 'string' || typeof value === 'number') {
    for (const part of String(value).split('\n')) { const t = clean(part); if (t) out.push(t); }
    return;
  }
  if (Array.isArray(value)) { value.forEach((v) => flatten(v, out, key)); return; }
  if (typeof value === 'object') {
    if ('label' in value && 'url' in value && Object.keys(value).length <= 3) {
      if (value.label && /^(https?:|\/)/.test(String(value.url || ''))) out.push(`${clean(value.label)}: ${value.url}`);
      return;
    }
    if ('q' in value && 'a' in value) { out.push(`Q: ${clean(value.q)} A: ${clean(value.a)}`); return; }
    if (value.link_url && /^(https?:|\/)/.test(value.link_url)) out.push(`More: ${value.link_url}`);
    for (const [k, v] of Object.entries(value)) if (k !== 'link_url') flatten(v, out, k);
  }
}

const STOP = new Set('a an and are as at be by can do does for from have how i in is it me my of on or our that the this to we what when where which who why will with you your us about there their them they get need want'.split(' '));
export const terms = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w)).map((w) => (w.length > 4 ? w.replace(/(ies|es|s|ing|ed)$/, '') : w));

// Splits the site into ≤650-char chunks, one or more per page section.
export function buildIndex(pages, settings, origin = '') {
  const base = (settings.site?.url || origin || '').replace(/\/+$/, '');
  const seen = new Set();
  const chunks = [];
  for (const p of pages) {
    const url = `${base}${pathFor(p)}`;
    const blocks = [{ data: { excerpt: p.excerpt } }, ...(p.blocks || []).filter((b) => !b.hidden && !SKIP_BLOCKS.has(b.type))];
    for (const b of blocks) {
      const lines = [];
      flatten(b.data, lines);
      const fresh = lines.filter((l) => { const k = l.toLowerCase(); if (l.length < 4 || seen.has(k)) return false; seen.add(k); return true; });
      let cur = '';
      const push = () => { if (cur.trim()) chunks.push({ title: p.title, url, text: cur.trim() }); cur = ''; };
      for (const l of fresh) { if (cur && cur.length + l.length > 650) push(); cur += (cur ? '\n' : '') + l; }
      push();
    }
  }
  for (const c of chunks) c.t = [...new Set(terms(`${c.title} ${c.text}`))];
  // Inverse document frequency: rare words ("middleware", "bundle") count more than common ones.
  const df = {};
  for (const c of chunks) for (const w of c.t) df[w] = (df[w] || 0) + 1;
  const idf = Object.fromEntries(Object.entries(df).map(([w, n]) => [w, +Math.log(1 + chunks.length / n).toFixed(3)]));

  const extra = String(settings.chat?.knowledge || '').trim();
  const caps = String(settings.chat?.capabilities || '').trim() || DEFAULT_CAPABILITIES;
  let core = [extra && `Team notes (highest priority):\n${extra}`, `WHAT WE BUILD (technologies & platforms):\n${caps}`, String(settings.llms_txt || '').trim()].filter(Boolean).join('\n\n');
  if (core.length > CORE_MAX) core = core.slice(0, CORE_MAX) + '…';
  return { core, chunks, idf };
}

// Picks the chunks that best match the question, up to `budget` characters.
export function retrieve(index, query, budget = 2600, max = 4) {
  const qset = new Set(terms(query));
  if (!qset.size) return '';
  const scored = index.chunks.map((c) => {
    let s = 0;
    for (const w of c.t) if (qset.has(w)) s += index.idf[w] || 0;
    for (const w of terms(c.title)) if (qset.has(w)) s += 1.5;
    return { c, s };
  }).filter((x) => x.s > 1.2).sort((a, b) => b.s - a.s);
  const out = [];
  let used = 0;
  for (const { c } of scored) {
    if (out.length >= max) break;
    if (used + c.text.length > budget) continue;
    out.push(`[${c.title} — ${c.url}]\n${c.text}`);
    used += c.text.length;
  }
  return out.join('\n\n');
}

export async function sha(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const PAGES_SQL = `SELECT type, slug, title, excerpt, blocks FROM pages WHERE status = 'published' AND COALESCE(seo->>'noindex', '') <> 'true'
  ORDER BY CASE type WHEN 'home' THEN 0 WHEN 'page' THEN 1 ELSE 2 END, slug`;

export async function compile(settings, pages, origin) {
  // Keep only what the chat needs (the cached copy never holds other settings).
  settings = { site: settings.site || {}, chat: settings.chat || {}, llms_txt: settings.llms_txt || '', _deepseek_key: settings._deepseek_key || null };
  const index = buildIndex(pages, settings, origin);
  // Changes whenever content or chat settings change → used to key cached answers.
  const version = await sha(JSON.stringify([index.core, index.chunks.map((c) => c.text), settings.chat || {}, settings.site?.url]));
  return { settings, index, version };
}

export async function loadKnowledge(q, origin) {
  if (memo && Date.now() - memo.at < TTL_S * 1000) return memo.value;
  const cache = globalThis.caches?.default;
  let value = null;
  if (cache) {
    const hit = await cache.match(CACHE_URL).catch(() => null);
    if (hit) value = await hit.json().catch(() => null);
  }
  if (!value) {
    const [settings, pages] = await Promise.all([Settings.get(q), q(PAGES_SQL)]);
    value = await compile(settings, pages, origin);
    if (cache) await cache.put(CACHE_URL, new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json', 'cache-control': `max-age=${TTL_S}` } })).catch(() => {});
  }
  memo = { at: Date.now(), value };
  return value;
}

// Called after any admin change so the assistant re-reads the site right away (in this data center).
export async function resetKnowledge() {
  memo = null;
  await globalThis.caches?.default?.delete(CACHE_URL).catch(() => {});
}
