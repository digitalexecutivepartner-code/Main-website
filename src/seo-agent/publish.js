// Publishes an agent draft — shared by the "Publish" button (admin.js) and the run (index.js).
// Same effect as saving in the page editor: version history, cache purge + pre-render, sitemap, chat knowledge refresh.
import { Pages } from '../db.js';
import { purge } from '../cache.js';
import { renderPath } from '../site/router.js';
import { pathFor } from '../site/util.js';
import { resetKnowledge } from '../chat/knowledge.js';
import { seoReport } from './seo-polish.js';
import { addBacklinks, indexNow } from './boost.js';

export class GateError extends Error {
  constructor(message, status, data = {}) { super(message); this.status = status; this.data = data; }
}

// p = seo_proposals row. min = publish only when the SEO score is ABOVE this.
// Returns { page, path, score, purging } — `purging` is a promise (pass it to ctx.waitUntil, or await it).
export async function publishProposal(q, env, p, { min, settings, origin }) {
  const draft = p?.target_page && (await Pages.get(q, p.target_page));
  if (!draft) throw new GateError('Draft not found.', 404);
  // Quality gate: recomputed on the current draft, so fixes made in the editor count.
  const report = seoReport(draft, p.keyword, settings);
  if (report.score <= min) {
    const todo = report.checks.filter((c) => !c.ok).map((c) => c.t);
    throw new GateError(`SEO score ${report.score} — publishing needs more than ${min}. Fix in the editor: ${todo.join('; ')}.`, 422, { score: report.score, min, todo });
  }
  const { _agent, noindex, ...seo } = draft.seo || {};
  const page = await Pages.update(q, draft.id, { ...draft, seo: { ...seo, _agent }, status: 'published' });
  await q(`UPDATE seo_proposals SET status = 'published', target_page = $2, updated_at = now() WHERE id = $1`, [p.id, page.id]);
  // After publishing: link it from older related posts → refresh the cache for all of them → ping IndexNow.
  const purging = (async () => {
    const backlinks = await addBacklinks(q, page, p.keyword).catch((e) => (console.error('backlinks', e), []));
    await Promise.all([purge(env, origin, [pathFor(page), ...backlinks], renderPath(env, origin)), resetKnowledge()]);
    const ping = await indexNow(q, origin, [pathFor(page), ...backlinks, '/blog']);
    return { backlinks, indexnow: ping };
  })().catch((e) => (console.error('seo publish purge', e), { backlinks: [], indexnow: { sent: 0 } }));
  return { page, path: pathFor(page), score: report.score, purging };
}
