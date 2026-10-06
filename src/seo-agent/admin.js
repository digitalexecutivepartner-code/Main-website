// /admin/api/seo/* — JSON API for Admin → SEO Agent.
import { Settings, Pages } from '../db.js';
import { pathFor } from '../site/util.js';
import { seoReport } from './seo-polish.js';
import { publishProposal, GateError } from './publish.js';
import { seal } from '../secrets.js';
import { gscCreds, parseServiceAccount, gscSites, searchConsole } from './sources.js';
import { deepseekKey } from '../chat/handler.js';
import { runSeoAgent, seoConfig, SEO_DEFAULTS } from './index.js';

const STATUSES = ['drafted', 'published', 'failed'];
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' } });
const list = (v) => (Array.isArray(v) ? v : String(v || '').split('\n')).map((s) => String(s).trim()).filter(Boolean).slice(0, 30);

export async function seoApi(q, env, ctx, m, sub, url, body) {
  try {
    if (sub === 'overview' && m === 'GET') {
      const settings = await Settings.get(q);
      const [counts, runs, key] = await Promise.all([
        q(`SELECT status, count(*)::int n FROM seo_proposals GROUP BY status`),
        q(`SELECT id, kind, stats, started_at, finished_at FROM seo_runs ORDER BY started_at DESC LIMIT 15`),
        deepseekKey(env, settings),
      ]);
      return json({
        counts: Object.fromEntries(STATUSES.map((s) => [s, counts.find((c) => c.status === s)?.n || 0])),
        config: seoConfig(settings), defaults: SEO_DEFAULTS,
        sources: { gsc: await gscCreds(env, settings).then((c) => !!(c.sa && c.site)), deepseek: key.source !== 'none' && key.source !== 'broken' },
        runs,
      });
    }

    if (sub === 'proposals' && m === 'GET') {
      const status = url.searchParams.get('status') || 'drafted';
      const items = await q(
        `SELECT sp.*, p.title AS page_title, p.type AS page_type, p.slug AS page_slug, p.status AS page_status
           FROM seo_proposals sp LEFT JOIN pages p ON p.id = sp.target_page
          WHERE ($1 = 'all' OR sp.status = $1) AND sp.status IN ('drafted', 'published', 'failed')
          ORDER BY sp.updated_at DESC LIMIT 200`, [status]);
      return json({ items });
    }

    const one = sub.match(/^proposals\/(\d+)$/);
    if (one && m === 'DELETE') { await q(`DELETE FROM seo_proposals WHERE id = $1`, [Number(one[1])]); return json({ ok: true }); }

    if (sub === 'proposals/bulk' && m === 'POST') {
      const ids = (body.ids || []).map(Number).filter(Boolean).slice(0, 500);
      if (!ids.length) return json({ error: 'Nothing selected.' }, 400);
      if (body.action !== 'delete') return json({ error: 'Unknown action.' }, 400);
      const r = await q(`DELETE FROM seo_proposals WHERE id = ANY($1::int[]) RETURNING id`, [ids]);
      return json({ count: r.length });
    }

    // "Run now": the same job as the 06:00 Autopilot run. Awaited (not waitUntil) so it can take minutes; the UI shows a spinner.
    if (sub === 'run' && m === 'POST') {
      const stats = await runSeoAgent(env, { manual: true });
      return json(stats || {}, stats?.error ? 500 : 200);
    }

    // The post the agent wrote: page + live SEO report (recomputed, so edits made in the editor count).
    const dr = sub.match(/^draft\/(\d+)$/);
    if (dr && m === 'GET') {
      const [p] = await q(`SELECT * FROM seo_proposals WHERE id = $1`, [Number(dr[1])]);
      if (!p?.target_page) return json({ error: 'This proposal has no draft yet.' }, 404);
      const [page, settings] = await Promise.all([Pages.get(q, p.target_page), Settings.get(q)]);
      if (!page) return json({ error: 'The draft page was deleted.' }, 404);
      const site = settings.site || {};
      return json({
        proposal: p, page, report: seoReport(page, p.keyword, settings),
        min_score: Number(seoConfig(settings).publish_min_seo),
        snippet: { title: page.seo?.title || page.title, url: `${(site.url || url.origin).replace(/\/+$/, '')}${pathFor(page)}`, description: page.seo?.description || page.excerpt },
      });
    }

    // Publish a draft by hand ("Post ready" screen). Same SEO gate and cache purge as the run.
    const pub = sub.match(/^publish\/(\d+)$/);
    if (pub && m === 'POST') {
      const [p] = await q(`SELECT * FROM seo_proposals WHERE id = $1`, [Number(pub[1])]);
      const settingsNow = await Settings.get(q);
      try {
        const r = await publishProposal(q, env, p, { min: Number(seoConfig(settingsNow).publish_min_seo), settings: settingsNow, origin: url.origin });
        ctx.waitUntil(r.purging);
        return json({ ok: true, path: r.path, url: `${url.origin}${r.path}`, id: r.page.id });
      } catch (e) {
        if (e instanceof GateError) return json({ error: e.message, ...e.data }, e.status);
        throw e;
      }
    }

    // ── Google Search Console: service-account JSON uploaded here, stored encrypted (settings._gsc, never sent back)
    if (sub === 'gsc' && m === 'GET') {
      const c = await gscCreds(env);
      let sites = null, error = '';
      if (c.sa && url.searchParams.get('sites')) { try { sites = await gscSites(c.sa); } catch (e) { error = String(e.message || e); } }
      return json({ source: c.source, connected: !!(c.sa && c.site), client_email: c.client_email || '', site: c.site || '', updated_at: c.updated_at || null, sites, error, env_secret: !!env.GSC_SA_JSON });
    }
    if (sub === 'gsc' && m === 'PUT') {
      let sa;
      try { sa = parseServiceAccount(body.json); } catch (e) { return json({ error: e.message }, 400); }
      let sites;
      try { sites = await gscSites(sa); } catch (e) { return json({ error: e.message }, 400); } // proves the key works before saving
      const host = new URL((await Settings.get(q)).site?.url || url.origin).hostname.replace(/^www\./, '');
      const pick = body.site && sites.some((x) => x.siteUrl === body.site) ? body.site
        : (sites.find((x) => x.siteUrl === `sc-domain:${host}`) || sites.find((x) => x.siteUrl.includes(host)) || sites[0])?.siteUrl || '';
      await Settings.save(q, { _gsc: { ...(await seal(env, JSON.stringify(sa))), client_email: sa.client_email, project_id: sa.project_id || '', site: pick, updated_at: new Date().toISOString() } });
      return json({ ok: true, client_email: sa.client_email, site: pick, sites,
        warning: sites.length ? '' : `Key saved, but this service account cannot see any property yet. Add ${sa.client_email} as a user in Search Console → Settings → Users and permissions, then click “Test connection”.` });
    }
    if (sub === 'gsc/site' && m === 'PUT') {
      const box = (await Settings.get(q))._gsc;
      if (!box) return json({ error: 'Upload the JSON key first.' }, 400);
      await Settings.save(q, { _gsc: { ...box, site: String(body.site || '').slice(0, 300), updated_at: new Date().toISOString() } });
      return json({ ok: true, site: body.site });
    }
    if (sub === 'gsc/test' && m === 'POST') {
      const c = await gscCreds(env);
      if (!c.sa) return json({ error: c.source === 'broken' ? 'The saved key cannot be decrypted (the encryption secret changed). Upload the JSON again.' : 'Upload the JSON key first.' }, 400);
      try {
        const sites = await gscSites(c.sa);
        if (!c.site) return json({ ok: true, sites, rows: 0, message: sites.length ? 'Key works — choose a property.' : `Key works, but no property is shared with ${c.client_email} yet.` });
        if (!sites.some((x) => x.siteUrl === c.site)) return json({ error: `${c.client_email} has no access to ${c.site}. Add it as a user in Search Console, or pick another property.`, sites }, 400);
        const rows = await searchConsole(env, 28, c);
        return json({ ok: true, sites, rows: rows.length, message: `Connected to ${c.site} — ${rows.length} keyword opportunities in the last 28 days.` });
      } catch (e) { return json({ error: String(e.message || e) }, 400); }
    }
    if (sub === 'gsc' && m === 'DELETE') {
      await q(`DELETE FROM settings WHERE key = '_gsc'`);
      return json({ ok: true });
    }

    if (sub === 'settings' && m === 'PUT') {
      const n = (v, d, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(Number(v)) ? Math.round(Number(v)) : d));
      const value = {
        autopilot: body.autopilot === true,
        per_run: n(body.per_run, SEO_DEFAULTS.per_run, 1, 5),
        publish_min_seo: n(body.publish_min_seo, SEO_DEFAULTS.publish_min_seo, 0, 99),
        min_score: n(body.min_score, SEO_DEFAULTS.min_score, 0, 100),
        model: ['deepseek-chat', 'deepseek-reasoner'].includes(body.model) ? body.model : 'deepseek-chat',
        seeds: list(body.seeds), feeds: list(body.feeds).filter((u) => /^https?:\/\//i.test(u)),
      };
      await Settings.save(q, { seo_agent: value });
      return json(seoConfig({ seo_agent: value }));
    }

    return json({ error: 'Unknown endpoint.' }, 404);
  } catch (e) {
    if (/relation "seo_\w+" does not exist/i.test(String(e?.message))) return json({ error: 'SEO Agent tables are missing. Run: npm run db:setup', setup: true }, 404);
    throw e;
  }
}
