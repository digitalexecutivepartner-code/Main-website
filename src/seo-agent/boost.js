// Cheap SEO boosters (no or tiny DeepSeek cost), run after publishing:
//   1. indexNow()       tell Bing / Yandex / Seznam / Naver (and AI search built on Bing) about new or changed URLs
//   2. addBacklinks()   link a new post from 2–3 older related agent posts (keyword overlap, no LLM)
//   3. refreshMeta()    posts on Google positions 8–20 with low CTR get a new meta title + description (~300 tokens each)
import { Pages, Settings } from '../db.js';
import { pathFor } from '../site/util.js';
import { purge } from '../cache.js';
import { renderPath } from '../site/router.js';
import { key, hasKw } from './seo-polish.js';
import { llmJson } from './llm.js';
import { gscCreds, gscPageStats, gscTopQueries } from './sources.js';

// ── 1. IndexNow ─────────────────────────────────────────────────────────────────────────
// The key is created once and served at /indexnow.txt (src/site/router.js). Google does not use IndexNow;
// it finds new posts through the sitemap and the internal links below.
export async function indexNowKey(q) {
  const s = await Settings.get(q);
  if (s.indexnow?.key) return s.indexnow.key;
  const k = crypto.randomUUID().replace(/-/g, '');
  await Settings.save(q, { indexnow: { key: k, created_at: new Date().toISOString() } });
  return k;
}

export async function indexNow(q, origin, paths = []) {
  const urls = [...new Set(paths.filter(Boolean))].map((p) => `${origin}${p}`);
  if (!urls.length) return { sent: 0 };
  try {
    const k = await indexNowKey(q);
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(origin).host, key: k, keyLocation: `${origin}/indexnow.txt`, urlList: urls.slice(0, 1000) }),
    });
    return { sent: urls.length, status: res.status }; // 200/202 = accepted
  } catch (e) { return { sent: 0, error: String(e?.message || e) }; }
}

// ── 2. Backlinks from older posts ───────────────────────────────────────────────────────
// Only touches posts the agent wrote (seo._agent), never pages you wrote yourself. Each edit is a normal
// Pages.update, so it shows up in the post's Version history.
export async function addBacklinks(q, page, keyword, max = 3) {
  const target = pathFor(page);
  const want = new Set(key(`${keyword} ${page.title}`));
  if (!want.size) return [];
  const rows = await q(`SELECT id, type, slug, title, excerpt, cover_image, status, blocks, seo, published_at FROM pages
                         WHERE type = 'post' AND status = 'published' AND id <> $1 AND seo ? '_agent'`, [page.id]);
  const picked = rows
    .map((r) => ({ r, s: key(`${r.seo?._agent?.keyword || ''} ${r.title}`).filter((t) => want.has(t)).length }))
    .filter((x) => x.s >= 2 && !JSON.stringify(x.r.blocks || []).includes(`](${target})`))
    .sort((a, b) => b.s - a.s).slice(0, max);
  const changed = [];
  for (const { r } of picked) {
    const blocks = JSON.parse(JSON.stringify(r.blocks || []));
    const rich = blocks.find((b) => b.type === 'richtext');
    if (!rich) continue;
    const line = `- [${page.title}](${target})`;
    let body = String(rich.data.body || '').trimEnd();
    body = /^## Related reading\s*$/m.test(body)
      ? body.replace(/(^## Related reading\s*\n(?:\s*\n)?(?:- .*\n?)*)/m, (m) => `${m.trimEnd()}\n${line}\n`)
      : `${body}\n\n## Related reading\n\n${line}`;
    rich.data.body = body.trimEnd();
    await Pages.update(q, r.id, { ...r, blocks });
    changed.push(pathFor(r));
  }
  return changed;
}

// ── 3. Meta refresh for posts close to page 1 ───────────────────────────────────────────
// Needs Search Console. Picks agent posts at positions 8–20 with ≥ 50 impressions and CTR < 2 % (28 days),
// at most `max` per run, each at most once every 30 days. One small DeepSeek call per post.
export async function refreshMeta(q, env, settings, { origin, max = 3, usage } = {}) {
  const creds = await gscCreds(env, settings);
  if (!creds.sa || !creds.site) return { skipped: 'Search Console not connected', changed: [] };
  const stats = await gscPageStats(creds);
  const byPath = new Map(stats.map((x) => { try { return [new URL(x.url).pathname, x]; } catch { return [x.url, x]; } }));
  const posts = await q(`SELECT id, type, slug, title, excerpt, cover_image, status, blocks, seo, published_at FROM pages
                          WHERE type = 'post' AND status = 'published' AND seo ? '_agent'`);
  const month = Date.now() - 30 * 864e5;
  const todo = posts
    .map((p) => ({ p, g: byPath.get(pathFor(p)) }))
    .filter(({ p, g }) => g && g.position >= 8 && g.position <= 20 && g.impressions >= 50 && g.ctr < 0.02
      && !(Date.parse(p.seo?._agent?.meta_refreshed_at || 0) > month))
    .sort((a, b) => b.g.impressions - a.g.impressions).slice(0, max);
  const changed = [];
  for (const { p, g } of todo) {
    try {
      const queries = await gscTopQueries(creds, g.url);
      const main = queries[0]?.query || p.seo?._agent?.keyword || p.title;
      const out = await llmJson(env, settings, {
        system: `You rewrite the Google snippet of one blog post to win more clicks. Return JSON {"title","description"}.
title: 45–60 chars, starts with or contains the main query, specific benefit or number, no clickbait, no brand suffix.
description: 130–155 chars, contains the main query, says exactly what the reader gets, ends with a reason to click.
Write in English. Do not promise anything the post does not contain.`,
        user: { main_query: main, other_queries: queries.slice(1).map((x) => x.query), current: { title: p.seo?.title || p.title, description: p.seo?.description || p.excerpt }, post_title: p.title, excerpt: p.excerpt },
        temperature: 0.5, max_tokens: 300,
      }, usage);
      const title = String(out.title || '').trim(), description = String(out.description || '').trim();
      if (title.length < 30 || title.length > 60 || description.length < 70 || description.length > 160 || !hasKw(`${title} ${description}`, main)) continue;
      const before = { title: p.seo?.title || '', description: p.seo?.description || '' };
      const seo = { ...p.seo, title, description, og_title: title, og_description: description,
        _agent: { ...p.seo._agent, meta_refreshed_at: new Date().toISOString(), meta_before: before, meta_stats: { position: Math.round(g.position * 10) / 10, impressions: g.impressions, ctr: Math.round(g.ctr * 1000) / 10 } } };
      await Pages.update(q, p.id, { ...p, seo });
      changed.push(pathFor(p));
    } catch (e) { console.error('meta refresh', p.id, e); }
  }
  if (changed.length) await purge(env, origin, changed, renderPath(env, origin)).catch((e) => console.error('meta refresh purge', e));
  return { changed, candidates: todo.length };
}
