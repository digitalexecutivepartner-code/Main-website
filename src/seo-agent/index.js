// SEO Agent — one job, run by the daily cron (06:00 Vietnam) when Autopilot is on, or by "Run now" in Admin → SEO Agent:
//
//   1. scan     Search Console + Google autocomplete + RSS → ONE strategist call → the best N new-post ideas (N = posts per run, 2)
//   2. write    those N posts: writer → SEO polish → page saved as Draft
//   3. publish  Draft → Published for every agent post with SEO score > threshold (lower scores wait in "Draft ready"),
//               then link it from older related posts and ping IndexNow (boost.js)
//   4. meta     posts on Google positions 8–20 with low CTR get a new meta title/description (Search Console needed)
import { db, Pages, Settings } from '../db.js';
import { loadKnowledge } from '../chat/knowledge.js';
import { pathFor, slugify as cmsSlug } from '../site/util.js';
import { searchConsole, gscCreds, autocomplete, feeds } from './sources.js';
import { strategize, writeDraft } from './agents.js';
import { polish } from './seo-polish.js';
import { publishProposal } from './publish.js';
import { refreshMeta, indexNow } from './boost.js';
import { purge } from '../cache.js';
import { autoCover, autoBodyImage } from './covers.js';
import { renderPath } from '../site/router.js';

const ORIGIN = 'https://digitalexecutivepartner.app';
export const SEO_DEFAULTS = {
  autopilot: false,        // daily 06:00 run on/off (Admin → SEO Agent → Settings)
  per_run: 2,              // posts written per run
  publish_min_seo: 60,     // publish only when the SEO score is ABOVE this
  min_score: 55,           // ideas scored below this by the strategist are dropped
  model: 'deepseek-chat',
  seeds: [
    // services
    'web development company', 'mobile app development', 'custom shopify app development', 'shopify integration',
    'zoho crm implementation', 'zoho consultant', 'ai chatbot for business', 'ai agents for business',
    // products
    'shopify zoho crm integration', 'shopify product seo', 'shopify bundle app', 'zoho api',
  ],
  feeds: ['https://shopify.dev/changelog/feed.xml'],
};
export function seoConfig(settings = {}) {
  const saved = settings.seo_agent || {};
  const cfg = { ...SEO_DEFAULTS, ...Object.fromEntries(Object.entries(saved).filter(([k, v]) => k in SEO_DEFAULTS && v !== '' && v != null)) };
  // Older settings had three switches (enabled / auto_approve / auto_publish) — all three on = Autopilot.
  if (saved.autopilot == null && saved.enabled && saved.auto_approve && saved.auto_publish) cfg.autopilot = true;
  return cfg;
}

// opts.manual = "Run now" from the admin (runs even when Autopilot is off).
export async function runSeoAgent(env, opts = {}) {
  const q = db(env);
  if (!opts.manual && seoConfig(await Settings.get(q)).autopilot !== true) return { skipped: 'Autopilot is off' };
  const [run] = await q(`INSERT INTO seo_runs (kind) VALUES ('daily') RETURNING id`);
  const stats = { usage: {} };
  try {
    const kb = await loadKnowledge(q, ORIGIN);          // same knowledge the chat widget uses
    const settings = await Settings.get(q);
    const cfg = seoConfig(settings);
    const n = Number(cfg.per_run) || 2;
    // Ideas are never queued for review: drop any left from older versions, then plan exactly n new posts.
    await q(`DELETE FROM seo_proposals WHERE status IN ('proposed', 'approved', 'rejected')`);
    await scan(q, env, settings, cfg, kb.index.core, stats, n);
    await write(q, env, settings, kb.index.core, stats, n);
    await publishDrafts(q, env, settings, cfg, stats);
    // Posts already on Google page 2 with low CTR: new meta title + description (needs Search Console).
    const origin = String(settings.site?.url || ORIGIN).replace(/\/+$/, '');
    try {
      const m = await refreshMeta(q, env, settings, { origin, usage: stats.usage });
      stats.meta_refreshed = m.changed.length;
      if (m.changed.length) { const ping = await indexNow(q, origin, m.changed); stats.indexnow = (stats.indexnow || 0) + ping.sent; }
    } catch (e) { (stats.source_errors ||= []).push(`meta refresh: ${String(e?.message || e).slice(0, 160)}`); }
    await clearAgentCovers(q, env, settings, stats);
  } catch (e) {
    stats.error = String(e?.message || e);
    console.error('seo-agent', e);
  } finally {
    await q(`UPDATE seo_runs SET stats = $2::jsonb, finished_at = now() WHERE id = $1`, [run.id, JSON.stringify({ ...stats, manual: !!opts.manual })]);
  }
  return stats;
}

async function scan(q, env, settings, cfg, business, stats, n) {
  const results = await Promise.allSettled([
    searchConsole(env, 28, await gscCreds(env, settings)),
    autocomplete(cfg.seeds),
    feeds(cfg.feeds),
  ]);
  const signals = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  stats.signals = signals.length;
  stats.source_errors = results.filter((r) => r.status === 'rejected').map((r) => String(r.reason));
  if (!signals.length) return;

  // Skip keywords already written in the last 60 days; Search Console first, max 60 signals → one small call.
  const recent = new Set((await q(`SELECT lower(keyword) k FROM seo_proposals WHERE created_at > now() - interval '60 days'`)).map((r) => r.k));
  const fresh = signals.filter((s) => !recent.has(s.keyword.toLowerCase())).slice(0, 60);
  const pages = (await Pages.list(q)).map((p) => ({ path: pathFor(p), title: p.title }));
  let items = [];
  try { items = await strategize(env, settings, { business, pages, signals: fresh, n }, stats.usage); }
  catch (e) { stats.source_errors.push(`strategist: ${String(e?.message || e).slice(0, 160)}`); }
  let created = 0;
  for (const it of items.filter((x) => Number(x.score) >= Number(cfg.min_score))) {
    const r = await q(
      `INSERT INTO seo_proposals (keyword, action, score, intent, brief, status)
       VALUES ($1, 'new_post', $2, $3, $4::jsonb, 'approved') ON CONFLICT DO NOTHING RETURNING id`,
      [String(it.keyword).slice(0, 300), Math.round(Number(it.score) || 0), it.intent || '', JSON.stringify(it.brief || {})]);
    created += r.length;
  }
  stats.proposals = created;
}

async function write(q, env, settings, business, stats, limit) {
  const todo = await q(`SELECT * FROM seo_proposals WHERE status = 'approved' ORDER BY score DESC LIMIT $1`, [limit]);
  stats.written = 0; stats.pages = [];
  if (!todo.length) return;
  // Published pages: candidates for internal links (and the product page title for link text).
  const published = (await q(`SELECT id, type, slug, title, blocks FROM pages WHERE status = 'published' AND COALESCE(seo->>'noindex', '') <> 'true'`))
    .map((p) => ({ ...p, path: pathFor(p) }));
  for (const p of todo) {
    try {
      const type = 'post';
      const raw = await writeDraft(env, settings, { business, proposal: p }, stats.usage);
      const productPage = published.find((x) => x.path === p.brief?.product_link) || null;
      const { draft: d, report } = await polish(env, raw, { keyword: p.keyword, brief: p.brief || {}, type, settings, published, productPage }, stats.usage);
      const seo = { ...d.seo, _agent: { proposal: p.id, keyword: p.keyword, report } };

      // a real photo matched to the topic (never set as seo.og_image: clearAgentCovers would remove it)
      const cover_image = await autoCover(q, env, { title: d.title, keyword: p.keyword, excerpt: d.excerpt });
      // and one more photo in the middle of the article, so long posts are easier to read
      const rich = d.blocks.find((b) => b.type === 'richtext');
      if (rich) rich.data.body = await autoBodyImage(q, env, rich.data.body, { title: d.title, keyword: p.keyword, excerpt: d.excerpt }, cover_image);
      const page = await Pages.create(q, { type: 'post', slug: await freeSlug(q, cmsSlug(d.slug || d.title) || `post-${p.id}`), title: d.title, excerpt: d.excerpt, cover_image, blocks: d.blocks, seo, status: 'draft' });
      await q(`UPDATE seo_proposals SET status = 'drafted', target_page = $2, error = $3, brief = brief || $4::jsonb, updated_at = now() WHERE id = $1`,
        [p.id, page.id, '', JSON.stringify({ seo_score: report.score })]);
      stats.written++;
      stats.pages.push({ id: page.id, proposal: p.id, title: page.title, path: pathFor(page), score: report.score, published: false });
    } catch (e) {
      await q(`UPDATE seo_proposals SET status = 'failed', error = $2, updated_at = now() WHERE id = $1`, [p.id, String(e?.message || e).slice(0, 500)]);
    }
  }
}

// Draft → Published for posts already waiting in "Draft ready" (written earlier, or fixed in the editor since).
// New posts only, SEO score (recomputed now, so editor fixes count) above the threshold.
async function publishDrafts(q, env, settings, cfg = seoConfig(settings), stats = {}) {
  const min = Number(cfg.publish_min_seo);
  const origin = String(settings.site?.url || ORIGIN).replace(/\/+$/, '');
  const rows = await q(`SELECT sp.* FROM seo_proposals sp JOIN pages p ON p.id = sp.target_page
                         WHERE sp.status = 'drafted' AND p.status = 'draft' ORDER BY sp.score DESC`);
  stats.published = 0; stats.held = [];
  for (const p of rows) {
    try {
      const r = await publishProposal(q, env, p, { min, settings, origin });
      const after = await r.purging;
      stats.backlinks = (stats.backlinks || 0) + after.backlinks.length;
      stats.indexnow = (stats.indexnow || 0) + (after.indexnow.sent || 0);
      stats.published++;
      const item = (stats.pages ||= []).find((x) => x.proposal === p.id);
      if (item) Object.assign(item, { published: true, path: r.path }); else stats.pages.push({ id: r.page.id, proposal: p.id, title: r.page.title, path: r.path, score: r.score, published: true });
    } catch (e) { stats.held.push(`${p.keyword}: ${String(e?.message || e).split('. Fix')[0]}`); }
  }
  return stats;
}

// Earlier versions copied the linked product page's first image as the post cover, which rarely matched the post.
// Remove those (recognised by cover_image === seo.og_image, both set by the agent) so posts show no featured image.
async function clearAgentCovers(q, env, settings, stats) {
  const rows = await q(`SELECT id, type, slug FROM pages WHERE type = 'post' AND seo ? '_agent' AND cover_image <> '' AND cover_image = COALESCE(seo->>'og_image', '')`);
  if (!rows.length) return;
  await q(`UPDATE pages SET cover_image = '', seo = seo - 'og_image' WHERE id = ANY($1::int[])`, [rows.map((r) => r.id)]);
  const origin = String(settings.site?.url || ORIGIN).replace(/\/+$/, '');
  await purge(env, origin, rows.map(pathFor), renderPath(env, origin)).catch((e) => console.error('cover cleanup purge', e));
  stats.covers_removed = rows.length;
}

// Avoid "duplicate key" when the writer suggests a slug that already exists.
async function freeSlug(q, slug, type = 'post') {
  if (type === 'post') slug = slug.replace(/\//g, '-');
  slug = slug.slice(0, 90);
  const taken = new Set((await q(`SELECT slug FROM pages WHERE type = $2 AND slug LIKE $1`, [`${slug}%`, type])).map((r) => r.slug));
  let s = slug, n = 2;
  while (taken.has(s)) s = `${slug}-${n++}`;
  return s;
}
