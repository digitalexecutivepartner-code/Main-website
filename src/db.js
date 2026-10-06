// Database access (Neon serverless driver over HTTPS — works in Cloudflare Workers).
import { neon, neonConfig } from '@neondatabase/serverless';

export function db(env) {
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL secret is not set');
  if (env.NEON_FETCH_ENDPOINT) neonConfig.fetchEndpoint = env.NEON_FETCH_ENDPOINT; // local testing only
  const sql = neon(env.DATABASE_URL);
  return (text, params = []) => sql.query(text, params);
}

const COLS = 'id, type, slug, title, excerpt, cover_image, status, blocks, seo, published_at, created_at, updated_at';

export const Pages = {
  async list(q, { type } = {}) {
    return type
      ? q(`SELECT id, type, slug, title, status, seo, published_at, updated_at FROM pages WHERE type = $1 ORDER BY type, updated_at DESC`, [type])
      : q(`SELECT id, type, slug, title, status, seo, published_at, updated_at FROM pages ORDER BY CASE type WHEN 'home' THEN 0 WHEN 'page' THEN 1 ELSE 2 END, updated_at DESC`);
  },
  async get(q, id) {
    return (await q(`SELECT ${COLS} FROM pages WHERE id = $1`, [id]))[0] || null;
  },
  async byPath(q, type, slug) {
    return (await q(`SELECT ${COLS} FROM pages WHERE type = $1 AND slug = $2 AND status = 'published'`, [type, slug]))[0] || null;
  },
  async published(q) {
    return q(`SELECT id, type, slug, title, excerpt, cover_image, status, seo, published_at, updated_at FROM pages WHERE status = 'published' ORDER BY type, published_at DESC NULLS LAST`);
  },
  async posts(q) {
    return q(`SELECT id, type, slug, title, excerpt, cover_image, status, seo, published_at, updated_at FROM pages WHERE type = 'post' AND status = 'published' ORDER BY published_at DESC NULLS LAST`);
  },
  async create(q, p) {
    return (await q(
      `INSERT INTO pages (type, slug, title, excerpt, cover_image, status, blocks, seo, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, CASE WHEN $6 = 'published' THEN now() END) RETURNING ${COLS}`,
      [p.type, p.slug, p.title, p.excerpt || '', p.cover_image || '', p.status || 'draft', JSON.stringify(p.blocks || []), JSON.stringify(p.seo || {})]
    ))[0];
  },
  async update(q, id, p) {
    const prev = await Pages.get(q, id);
    if (!prev) return null;
    await q(`INSERT INTO page_revisions (page_id, snapshot) VALUES ($1, $2::jsonb)`, [id, JSON.stringify(prev)]);
    await q(`DELETE FROM page_revisions WHERE page_id = $1 AND id NOT IN (SELECT id FROM page_revisions WHERE page_id = $1 ORDER BY created_at DESC LIMIT 30)`, [id]);
    return (await q(
      `UPDATE pages SET slug = $2, title = $3, excerpt = $4, cover_image = $5, status = $6, blocks = $7::jsonb, seo = $8::jsonb,
         published_at = CASE WHEN $6 = 'published' THEN COALESCE($9::timestamptz, published_at, now()) ELSE published_at END,
         updated_at = now()
       WHERE id = $1 RETURNING ${COLS}`,
      [id, p.slug, p.title, p.excerpt || '', p.cover_image || '', p.status, JSON.stringify(p.blocks || []), JSON.stringify(p.seo || {}), p.published_at || null]
    ))[0];
  },
  async remove(q, id) {
    await q(`DELETE FROM pages WHERE id = $1 AND type <> 'home'`, [id]);
  },
  async revisions(q, id) {
    return q(`SELECT id, created_at, snapshot->>'title' AS title, snapshot->>'status' AS status FROM page_revisions WHERE page_id = $1 ORDER BY created_at DESC LIMIT 30`, [id]);
  },
  async revision(q, id, revId) {
    return (await q(`SELECT snapshot FROM page_revisions WHERE page_id = $1 AND id = $2`, [id, revId]))[0]?.snapshot || null;
  },
};

export const Settings = {
  async get(q) {
    const rows = await q(`SELECT key, value FROM settings`);
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },
  async save(q, obj) {
    for (const [k, v] of Object.entries(obj)) {
      await q(`INSERT INTO settings (key, value, updated_at) VALUES ($1, $2::jsonb, now())
               ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`, [k, JSON.stringify(v)]);
    }
  },
};

// Contact form enquiries (Admin → Inbox).
const CONTACT_COLS = 'id, name, email, phone, company, service, budget, message, page, ip, country, device, source, visitor, session, transcript, status, email_status, email_error, note, created_at, updated_at';
export const CONTACT_STATUSES = ['new', 'read', 'replied', 'archived', 'spam'];

export const Contacts = {
  async create(q, c) {
    return (await q(
      `INSERT INTO contact_submissions (name, email, company, service, budget, message, page, ip, country, device, phone, source, visitor, session, transcript)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb) RETURNING id`,
      [c.name, c.email, c.company || '', c.service || '', c.budget || '', c.message || '', c.page || '', c.ip || '', c.country || '', c.device || '',
       c.phone || '', c.source === 'chat' ? 'chat' : 'form', c.visitor || '', c.session || '', JSON.stringify(Array.isArray(c.transcript) ? c.transcript : [])]
    ))[0];
  },
  async setEmail(q, id, status, error = '') {
    await q(`UPDATE contact_submissions SET email_status = $2, email_error = $3 WHERE id = $1`, [id, status, String(error).slice(0, 500)]);
  },
  // filter: status ('' = everything except archived/spam, 'all' = everything) and free-text search.
  where({ status = '', search = '' } = {}) {
    const conds = [], params = [];
    if (status === 'all') {} else if (CONTACT_STATUSES.includes(status)) { params.push(status); conds.push(`status = $${params.length}`); }
    else conds.push(`status NOT IN ('archived', 'spam')`);
    const s = String(search || '').trim();
    if (s) { params.push(`%${s.replace(/[%_\\]/g, '\\$&')}%`); conds.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length} OR company ILIKE $${params.length} OR message ILIKE $${params.length} OR service ILIKE $${params.length})`); }
    return { sql: conds.length ? `WHERE ${conds.join(' AND ')}` : '', params };
  },
  async list(q, opts = {}, { limit = 20, offset = 0 } = {}) {
    const w = Contacts.where(opts);
    const rows = await q(`SELECT ${CONTACT_COLS}, count(*) OVER()::int AS total FROM contact_submissions ${w.sql} ORDER BY created_at DESC LIMIT $${w.params.length + 1} OFFSET $${w.params.length + 2}`, [...w.params, limit, offset]);
    let total = rows[0]?.total;
    if (total == null) total = offset ? (await q(`SELECT count(*)::int AS n FROM contact_submissions ${w.sql}`, w.params))[0].n : 0;
    return { total, rows: rows.map(({ total: _t, ...r }) => r) };
  },
  async all(q, opts = {}) {
    const w = Contacts.where(opts);
    return q(`SELECT ${CONTACT_COLS} FROM contact_submissions ${w.sql} ORDER BY created_at DESC LIMIT 10000`, w.params);
  },
  async counts(q) {
    const rows = await q(`SELECT status, count(*)::int AS n FROM contact_submissions GROUP BY status`);
    const out = Object.fromEntries(CONTACT_STATUSES.map((s) => [s, 0]));
    rows.forEach((r) => { out[r.status] = r.n; });
    out.inbox = out.new + out.read + out.replied;
    out.all = out.inbox + out.archived + out.spam;
    return out;
  },
  async get(q, id) {
    return (await q(`SELECT ${CONTACT_COLS} FROM contact_submissions WHERE id = $1`, [id]))[0] || null;
  },
  async update(q, id, { status, note }) {
    return (await q(
      `UPDATE contact_submissions SET status = COALESCE($2, status), note = COALESCE($3, note), updated_at = now() WHERE id = $1 RETURNING ${CONTACT_COLS}`,
      [id, CONTACT_STATUSES.includes(status) ? status : null, note == null ? null : String(note).slice(0, 5000)]
    ))[0] || null;
  },
  async bulk(q, ids, status) {
    if (!CONTACT_STATUSES.includes(status) || !ids.length) return 0;
    const r = await q(`UPDATE contact_submissions SET status = $2, updated_at = now() WHERE id = ANY($1::int[]) RETURNING id`, [ids, status]);
    return r.length;
  },
  async remove(q, ids) {
    if (!ids.length) return;
    await q(`DELETE FROM contact_submissions WHERE id = ANY($1::int[])`, [ids]);
  },
};
