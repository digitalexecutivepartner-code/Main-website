// /admin — login, admin app, JSON API and previews.
import { db, Pages, Settings, Contacts, CONTACT_STATUSES } from '../db.js';
import { isAuthed, createSession, clearSession, safeEqual, sameOrigin } from '../auth.js';
import { renderPage } from '../site/layout.js';
import { pathFor, slugify } from '../site/util.js';
import { BLOCKS, SEO_FIELDS, SETTINGS_FIELDS, SETTINGS_TABS, RESERVED_SLUGS } from '../cms/schema.js';
import { purge } from '../cache.js';
import { renderPath, postsFor } from '../site/router.js';
import { resetKnowledge, compile, PAGES_SQL } from '../chat/knowledge.js';
import { deepseekKey, cleanKey, mask, verifyKey, callDeepseek, systemPrompt, upstreamError, chatConfig } from '../chat/handler.js';
import { mediaApi } from '../media.js';
import { mailConfig, mailSetup, sendMail, cleanPassword } from '../contact.js';
import { seal } from '../secrets.js';
import { ownerEmail, customerEmail, SAMPLE_ENQUIRY } from '../../lib/email.js';
import { loginHtml, appHtml } from './ui.js';
import { CHAT_DEFAULTS } from '../chat/config.js';
import { seoApi } from '../seo-agent/admin.js';

const SEC = {
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex, nofollow',
  'x-frame-options': 'DENY',
  'referrer-policy': 'same-origin',
  'content-security-policy': "default-src 'self'; img-src * data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'",
};
const html = (body, status = 200, extra = {}) => new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', ...SEC, ...extra } });
// Keys starting with "_" (e.g. the encrypted SMTP password) never leave the server.
const publicSettings = (s) => Object.fromEntries(Object.entries(s || {}).filter(([k]) => !k.startsWith('_')));
const smtpError = (e) => {
  const m = String(e?.message || e);
  if (/535|534|auth|password|credential|not accepted/i.test(m)) return `Login rejected by the mail server (${m}). For Gmail use a 16-character App Password, not your normal password, and the full Gmail address as username.`;
  if (/timeout|connect|refused|getaddrinfo|socket/i.test(m)) return `Could not reach the mail server (${m}). Check the SMTP host and port (Gmail: smtp.gmail.com, 465).`;
  return m;
};
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...SEC } });

export async function handleAdmin(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/admin';

  if (!env.ADMIN_PASSWORD) return html(loginHtml('The admin password is not set yet. Run: npx wrangler secret put ADMIN_PASSWORD'), 503);
  if (request.method !== 'GET' && request.method !== 'HEAD' && !sameOrigin(request)) return json({ error: 'Cross-site request blocked.' }, 403);

  if (path === '/admin/login' && request.method === 'POST') return login(request, env);
  if (path === '/admin/logout') return new Response(null, { status: 303, headers: { location: '/admin', 'set-cookie': clearSession(), ...SEC } });

  const authed = await isAuthed(request, env);
  if (!authed) {
    if (path.startsWith('/admin/api') || path.startsWith('/admin/preview')) return json({ error: 'Please sign in again.' }, 401);
    return html(loginHtml());
  }

  if (path === '/admin') return html(appHtml({ BLOCKS, SEO_FIELDS, SETTINGS_FIELDS, SETTINGS_TABS, CHAT_DEFAULTS }));
  if (path.startsWith('/admin/preview')) return preview(request, env, path);
  if (path.startsWith('/admin/api/')) {
    try {
      return await api(request, env, ctx, path.slice('/admin/api/'.length), url);
    } catch (e) {
      console.error('admin api', e);
      const msg = /duplicate key|unique/i.test(String(e?.message)) ? 'Another page already uses this URL. Choose a different slug.' : `Server error: ${e?.message || e}`;
      return json({ error: msg }, /duplicate key|unique/i.test(String(e?.message)) ? 409 : 500);
    }
  }
  return html('Not found', 404);
}

async function login(request, env) {
  const q = db(env);
  const ip = request.headers.get('cf-connecting-ip') || 'local';
  const form = await request.formData().catch(() => null);
  const password = String(form?.get('password') || '');
  const [{ n }] = await q(`SELECT count(*)::int AS n FROM login_attempts WHERE ip = $1 AND ok = false AND at > now() - interval '15 minutes'`, [ip]);
  if (n >= 8) return html(loginHtml('Too many attempts. Try again in 15 minutes.'), 429);
  const ok = password.length > 0 && (await safeEqual(password, env.ADMIN_PASSWORD));
  await q(`INSERT INTO login_attempts (ip, ok) VALUES ($1, $2)`, [ip, ok]);
  await q(`DELETE FROM login_attempts WHERE at < now() - interval '7 days'`);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 600));
    return html(loginHtml('Wrong password.'), 401);
  }
  return new Response(null, { status: 303, headers: { location: '/admin', 'set-cookie': await createSession(env), ...SEC } });
}

function validate(input, existing) {
  const type = existing?.type || input.type;
  if (!['home', 'page', 'post'].includes(type)) throw new Error('Invalid page type.');
  const title = String(input.title || '').trim();
  if (!title) return { error: 'Title is required.' };
  let slug = type === 'home' ? '' : slugify(input.slug || title);
  if (type !== 'home') {
    if (!slug) return { error: 'URL slug is required.' };
    if (type === 'page' && RESERVED_SLUGS.includes(slug.split('/')[0])) return { error: `"${slug.split('/')[0]}" is reserved. Choose another URL.` };
    if (type === 'post' && slug.includes('/')) slug = slug.replace(/\//g, '-');
  }
  const blocks = (Array.isArray(input.blocks) ? input.blocks : []).filter((b) => b && BLOCKS[b.type]).map((b) => ({ type: b.type, hidden: !!b.hidden, data: b.data && typeof b.data === 'object' ? b.data : {} }));
  const seo = input.seo && typeof input.seo === 'object' ? input.seo : {};
  if (seo.json_ld) { try { JSON.parse(seo.json_ld); } catch { return { error: 'Extra JSON-LD is not valid JSON.' }; } }
  return {
    value: {
      type, slug, title,
      excerpt: String(input.excerpt || '').slice(0, 500),
      cover_image: String(input.cover_image || ''),
      status: type === 'home' ? 'published' : input.status === 'published' ? 'published' : 'draft',
      blocks, seo, published_at: input.published_at || null,
    },
  };
}

async function api(request, env, ctx, route, url) {
  const q = db(env);
  const m = request.method;
  if (route === 'media' || route.startsWith('media/')) return mediaApi(request, env, route.slice(5));
  const body = m === 'POST' || m === 'PUT' ? await request.json().catch(() => ({})) : null;
  const origin = url.origin;
  if (route.startsWith('seo/')) return seoApi(q, env, ctx, m, route.slice(4), url, body);
  if (m !== 'GET' && !route.startsWith('contacts')) ctx.waitUntil(resetKnowledge()); // the AI chat re-reads the site content after any change

  if (route === 'pages' && m === 'GET') return json(await Pages.list(q));
  if (route === 'pages' && m === 'POST') {
    if (body.type === 'home') return json({ error: 'There is already a home page.' }, 400);
    const v = validate({ ...body, blocks: body.blocks || starterBlocks(body.type) }, null);
    if (v.error) return json({ error: v.error }, 400);
    const page = await Pages.create(q, v.value);
    if (page.status === 'published') ctx.waitUntil(purge(env, origin, [pathFor(page)], renderPath(env, origin)));
    return json(page, 201);
  }
  let mm = route.match(/^pages\/(\d+)$/);
  if (mm) {
    const id = Number(mm[1]);
    const existing = await Pages.get(q, id);
    if (!existing) return json({ error: 'Page not found.' }, 404);
    if (m === 'GET') return json(existing);
    if (m === 'PUT') {
      const v = validate(body, existing);
      if (v.error) return json({ error: v.error }, 400);
      const page = await Pages.update(q, id, v.value);
      ctx.waitUntil(purge(env, origin, [pathFor(existing), pathFor(page)], renderPath(env, origin)));
      return json(page);
    }
    if (m === 'DELETE') {
      if (existing.type === 'home') return json({ error: 'The home page cannot be deleted.' }, 400);
      await Pages.remove(q, id);
      ctx.waitUntil(purge(env, origin, [pathFor(existing)], renderPath(env, origin)));
      return json({ ok: true });
    }
  }
  mm = route.match(/^pages\/(\d+)\/revisions$/);
  if (mm && m === 'GET') return json(await Pages.revisions(q, Number(mm[1])));
  mm = route.match(/^pages\/(\d+)\/revisions\/(\d+)$/);
  if (mm && m === 'GET') {
    const snap = await Pages.revision(q, Number(mm[1]), Number(mm[2]));
    return snap ? json(snap) : json({ error: 'Revision not found.' }, 404);
  }
  if (route === 'email/status' && m === 'GET') {
    const s = await Settings.get(q); const cfg = await mailSetup(env, s);
    return json({ smtp_pass_set: !!cfg.pass, pass_source: cfg.passSource, pass_broken: cfg.passBroken, pass_updated_at: cfg.passUpdatedAt, env_secret: !!env.SMTP_PASS, smtp_user: cfg.user, host: cfg.host, port: cfg.port, from: cfg.from, to: cfg.to, cc: cfg.cc, autoreply: cfg.autoreply });
  }
  if (route === 'email/password' && m === 'PUT') {
    const pw = cleanPassword(body.password);
    if (pw.length < 6 || pw.length > 256) return json({ error: 'Enter the app password (Gmail: 16 letters).' }, 400);
    await Settings.save(q, { _smtp_pass: { ...(await seal(env, pw)), updated_at: new Date().toISOString() } });
    return json({ ok: true });
  }
  if (route === 'email/password' && m === 'DELETE') {
    await q(`DELETE FROM settings WHERE key = '_smtp_pass'`);
    return json({ ok: true });
  }
  if (route === 'email/verify' && m === 'POST') {
    // Checks host/port/username/password by logging in. Accepts unsaved values from the form.
    const s = await Settings.get(q); const base = await mailSetup(env, s);
    const cfg = { ...base, host: String(body.host || base.host).trim(), port: Number(body.port || base.port), user: String(body.user || base.user).trim(), pass: body.password ? cleanPassword(body.password) : base.pass };
    if (!cfg.user) return json({ error: 'Enter the SMTP username (your full email address).' }, 400);
    if (!cfg.pass) return json({ error: 'Enter an app password first.' }, 400);
    try { await sendMail(cfg, async () => {}); } catch (e) { return json({ error: smtpError(e) }, 502); }
    return json({ ok: true, host: cfg.host, port: cfg.port, user: cfg.user });
  }
  if (route === 'email/preview' && m === 'POST') {
    const s = body.settings && typeof body.settings === 'object' ? body.settings : await Settings.get(q);
    const meta = { time: new Date().toUTCString(), country: 'VN', ip: '' };
    const to = mailConfig(env, s).to[0];
    const out = body.kind === 'customer' ? customerEmail(SAMPLE_ENQUIRY, to, s.email_templates, s.site) : ownerEmail(SAMPLE_ENQUIRY, meta, s.email_templates, s.site);
    return json({ subject: out.subject, html: out.html });
  }
  if (route === 'email/test' && m === 'POST') {
    const s = await Settings.get(q); const cfg = await mailSetup(env, s);
    const to = String(body.to || '').trim();
    if (!/^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(to)) return json({ error: 'Enter a valid email address to send the test to.' }, 400);
    if (!cfg.user || !cfg.pass) return json({ error: 'Email is not configured yet: add the SMTP username and an app password in Settings → Email sending.' }, 400);
    const sample = { ...SAMPLE_ENQUIRY, email: to };
    const meta = { time: new Date().toUTCString(), country: '', ip: '' };
    try {
      await sendMail(cfg, async (mailer) => {
        const o = ownerEmail(sample, meta, s.email_templates, s.site);
        await mailer.send({ from: cfg.from, to: { email: to }, ...o, subject: `[Test] ${o.subject}` });
        const c = customerEmail(sample, cfg.to[0], s.email_templates, s.site);
        await mailer.send({ from: cfg.from, to: { email: to }, ...c, subject: `[Test] ${c.subject}` });
      });
    } catch (e) {
      return json({ error: `Sending failed: ${smtpError(e)}` }, 502);
    }
    return json({ ok: true });
  }
  // ---- AI chat: DeepSeek key (encrypted), test, conversation log ----
  if (route === 'chat/status' && m === 'GET') {
    const s = await Settings.get(q); const k = await deepseekKey(env, s); const c = chatConfig(s);
    let logs = null;
    try { logs = (await q(`SELECT count(*)::int AS n, count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS week FROM chat_logs`))[0]; } catch {}
    let leads = null;
    try { leads = (await q(`SELECT count(*)::int AS n, count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS week FROM contact_submissions WHERE source = 'chat'`))[0]; } catch {}
    return json({ key_set: !!k.key, source: k.source, broken: k.source === 'broken' || !!k.broken, hint: k.hint || '', updated_at: k.updated_at || null, env_secret: !!env.DEEPSEEK_API_KEY, enabled: c.enabled !== false, model: c.model, logs, leads, lead_enabled: c.lead_enabled !== false });
  }
  if (route === 'chat/key' && m === 'PUT') {
    const key = cleanKey(body.key);
    if (!/^sk-[A-Za-z0-9_-]{16,}$/.test(key)) return json({ error: 'That does not look like a DeepSeek API key (it starts with sk-).' }, 400);
    await Settings.save(q, { _deepseek_key: { ...(await seal(env, key)), hint: mask(key), updated_at: new Date().toISOString() } });
    return json({ ok: true, ...(await verifyKey(key)) });
  }
  if (route === 'chat/key' && m === 'DELETE') {
    await q(`DELETE FROM settings WHERE key = '_deepseek_key'`);
    return json({ ok: true });
  }
  if (route === 'chat/verify' && m === 'POST') {
    const key = body.key ? cleanKey(body.key) : (await deepseekKey(env, await Settings.get(q))).key;
    if (!key) return json({ error: 'Enter a DeepSeek API key first.' }, 400);
    const r = await verifyKey(key);
    return r.ok ? json(r) : json({ error: r.error }, 502);
  }
  if (route === 'chat/test' && m === 'POST') {
    // Asks the assistant one question using the settings on screen (saved or not).
    const saved = await Settings.get(q);
    const s = body.settings && typeof body.settings === 'object' ? { ...saved, ...publicSettings(body.settings) } : saved;
    const { key } = await deepseekKey(env, saved);
    if (!key) return json({ error: 'Add a DeepSeek API key first.' }, 400);
    const message = String(body.message || '').trim().slice(0, 1500);
    const t0 = Date.now();
    if (!message) return json({ error: 'Type a test question.' }, 400);
    const kb = await compile(s, await q(PAGES_SQL), origin);
    const system = systemPrompt(kb.settings, kb.index, message, `${origin}/`);
    const r = await callDeepseek(key, s, system, [{ role: 'user', content: message }], false).catch((e) => ({ ok: false, status: 0, text: async () => String(e?.message || e) }));
    if (!r.ok) return json({ error: upstreamError(r.status, await r.text().catch(() => '')) }, 502);
    const d = await r.json();
    return json({ answer: d.choices?.[0]?.message?.content || '', usage: d.usage || null, prompt_chars: system.length, ms: Date.now() - t0 });
  }
  if (route === 'chat/logs' && m === 'GET') {
    // One entry per visitor (browser id → chat session → IP), newest activity first, 15 per page.
    // ?leads=1 shows only visitors who left their contact details in the chat.
    const per = 15;
    const page = Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1);
    const onlyLeads = url.searchParams.get('leads') === '1';
    const who = `COALESCE(NULLIF(visitor, ''), NULLIF(session, ''), 'ip:' || ip)`;
    try {
      const people = await q(
        `WITH ev AS (
           SELECT ${who} AS id, created_at, country, device, ip, session, 1 AS msg, 0 AS lead FROM chat_logs
           UNION ALL
           SELECT ${who}, created_at, country, device, ip, session, 0, 1 FROM contact_submissions WHERE source = 'chat' AND status <> 'spam'
         )
         SELECT id, sum(msg)::int AS messages, sum(lead)::int AS leads, count(DISTINCT session) FILTER (WHERE msg = 1)::int AS sessions,
                min(created_at) AS first_at, max(created_at) AS last_at,
                (array_agg(country ORDER BY created_at DESC))[1] AS country, (array_agg(device ORDER BY created_at DESC))[1] AS device,
                (array_agg(ip ORDER BY created_at DESC))[1] AS ip, count(*) OVER()::int AS total
         FROM ev GROUP BY id ${onlyLeads ? 'HAVING sum(lead) > 0' : ''} ORDER BY last_at DESC LIMIT $1 OFFSET $2`, [per, (page - 1) * per]);
      const ids = people.map((p) => p.id);
      const [rows, leadRows] = ids.length ? await Promise.all([
        q(`SELECT ${who} AS id, session, page, question, answer, created_at FROM chat_logs WHERE ${who} = ANY($1::text[]) ORDER BY created_at ASC`, [ids]),
        q(`SELECT ${who} AS id, id AS contact_id, name, email, phone, message AS need, status, page, created_at FROM contact_submissions WHERE source = 'chat' AND status <> 'spam' AND ${who} = ANY($1::text[]) ORDER BY created_at DESC`, [ids]),
      ]) : [[], []];
      const total = people[0]?.total || 0;
      const ipMask = (ip) => String(ip || '').replace(/(\d+)\.(\d+)$/, 'x.x').replace(/(:[0-9a-f]*){3}$/i, ':…');
      return json({
        page, per, total, pages: Math.max(1, Math.ceil(total / per)), only_leads: onlyLeads,
        visitors: people.map(({ total: _t, ip, ...p }) => ({
          ...p, ip: ipMask(ip),
          contacts: leadRows.filter((r) => r.id === p.id).map(({ id, ...r }) => r),
          chats: rows.filter((r) => r.id === p.id).map(({ id, ...r }) => r),
        })),
      });
    } catch (e) {
      if (/does not exist/i.test(String(e?.message))) return json({ error: 'The chat log is not set up yet (or needs updating). Run: npm run db:setup' }, 404);
      throw e;
    }
  }
  if (route === 'contacts' || route.startsWith('contacts/')) return contactsApi(q, m, route.slice(8).replace(/^\//, ''), url, body);
  if (route === 'cache/clear' && m === 'POST') {
    // New cache generation = every cached copy (all data centers) is ignored from now on; then re-render in the background.
    const paths = (await Pages.published(q)).map(pathFor);
    await purge(env, origin, paths);
    ctx.waitUntil(purge(env, origin, paths, renderPath(env, origin)));
    return json({ ok: true, pages: new Set(['/', '/sitemap.xml', '/robots.txt', '/llms.txt', '/blog', ...paths]).size });
  }
  if (route === 'settings' && m === 'GET') return json(publicSettings(await Settings.get(q)));
  if (route === 'settings' && m === 'PUT') {
    const allowed = SETTINGS_FIELDS.map((f) => f.key);
    const clean = Object.fromEntries(Object.entries(body || {}).filter(([k]) => allowed.includes(k)));
    if (clean.site?.url) clean.site.url = String(clean.site.url).replace(/\/+$/, '');
    await Settings.save(q, clean);
    const pages = await Pages.published(q);
    ctx.waitUntil(purge(env, origin, pages.map(pathFor), renderPath(env, origin)));
    return json(publicSettings(await Settings.get(q)));
  }
  return json({ error: 'Unknown endpoint.' }, 404);
}

// ---- Contact form inbox: /admin/api/contacts… ----
const csvCell = (v) => {
  let s = v instanceof Date ? v.toISOString() : String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stops spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
async function contactsApi(q, m, sub, url, body) {
  const filter = { status: url.searchParams.get('status') || '', search: (url.searchParams.get('q') || '').slice(0, 100) };
  try {
    if (sub === '' && m === 'GET') {
      const per = 20;
      const page = Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1);
      const [{ total, rows }, counts] = await Promise.all([Contacts.list(q, filter, { limit: per, offset: (page - 1) * per }), Contacts.counts(q)]);
      return json({ page, per, total, pages: Math.max(1, Math.ceil(total / per)), counts, items: rows });
    }
    if (sub === 'counts' && m === 'GET') return json(await Contacts.counts(q));
    if (sub === 'export.csv' && m === 'GET') {
      const rows = await Contacts.all(q, filter);
      const cols = ['id', 'created_at', 'status', 'source', 'name', 'email', 'phone', 'company', 'service', 'budget', 'message', 'note', 'page', 'country', 'device', 'email_status'];
      const csv = '\ufeff' + [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\r\n');
      const name = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
      return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${name}"`, ...SEC } });
    }
    if (sub === 'bulk' && m === 'POST') {
      const ids = (Array.isArray(body?.ids) ? body.ids : []).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 500);
      if (!ids.length) return json({ error: 'Select at least one message.' }, 400);
      if (body.action === 'delete') { await Contacts.remove(q, ids); return json({ ok: true, count: ids.length }); }
      if (!CONTACT_STATUSES.includes(body.action)) return json({ error: 'Unknown action.' }, 400);
      return json({ ok: true, count: await Contacts.bulk(q, ids, body.action) });
    }
    const mm = sub.match(/^(\d+)$/);
    if (mm) {
      const id = Number(mm[1]);
      let item = await Contacts.get(q, id);
      if (!item) return json({ error: 'Message not found.' }, 404);
      if (m === 'GET') {
        if (item.status === 'new') item = await Contacts.update(q, id, { status: 'read' });
        return json(item);
      }
      if (m === 'PUT') {
        if (body.status != null && !CONTACT_STATUSES.includes(body.status)) return json({ error: 'Unknown status.' }, 400);
        return json(await Contacts.update(q, id, { status: body.status, note: body.note }));
      }
      if (m === 'DELETE') { await Contacts.remove(q, [id]); return json({ ok: true }); }
    }
    return json({ error: 'Unknown endpoint.' }, 404);
  } catch (e) {
    if (/does not exist/i.test(String(e?.message))) return json({ error: 'The contact inbox is not set up yet. Run: npm run db:setup' }, 404);
    throw e;
  }
}

function starterBlocks(type) {
  if (type === 'post') return [{ type: 'richtext', data: { body: 'Write your post here.\n\n## A section heading\n\nParagraph text with a [link](/).' } }, { type: 'cta', data: { heading: 'Have a project in mind?', text: 'Tell us what you want to build.', primary: { label: 'Start a project', url: '/#contact' } } }];
  return [{ type: 'page_header', data: { eyebrow: '', title: '', lead: '' } }, { type: 'richtext', data: { body: 'Write your page content here.' } }];
}

async function preview(request, env, path) {
  const q = db(env);
  const settings = await Settings.get(q);
  let page;
  if (request.method === 'POST') {
    const form = await request.formData();
    try { page = JSON.parse(String(form.get('payload') || '{}')); } catch { return html('Invalid preview data', 400); }
  } else {
    const id = Number(path.split('/').pop());
    page = await Pages.get(q, id);
    if (!page) return html('Not found', 404);
  }
  page.blocks = Array.isArray(page.blocks) ? page.blocks : [];
  page.seo = { ...(page.seo || {}), noindex: true };
  page.updated_at = page.updated_at || new Date().toISOString();
  const res = html(renderPage(page, settings, { preview: true, posts: await postsFor(q, page) }));
  res.headers.set('content-security-policy', "default-src 'self'; img-src * data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'self'");
  res.headers.set('x-frame-options', 'SAMEORIGIN');
  return res;
}
