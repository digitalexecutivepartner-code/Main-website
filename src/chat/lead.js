// POST /api/chat/lead — a visitor leaves their contact details inside the chat widget.
// Saved to contact_submissions (source = 'chat', with phone + chat transcript) so it shows up in
// Admin → Inbox next to contact-form enquiries, then emailed to the team with the same email setup
// and templates as the contact form (Admin → Settings → Email sending).
import { db, Settings, Contacts } from '../db.js';
import { mailSetup, sendMail } from '../contact.js';
import { ownerEmail, customerEmail } from '../../lib/email.js';
import { device } from './handler.js';

const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i;
const ORIGINS = ['https://digitalexecutivepartner.app', 'https://www.digitalexecutivepartner.app', 'https://shop.digitalexecutivepartner.app'];
const line = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const block = (v, max) => String(v ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, max);
const id = (v) => String(v || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 40);
const res = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

const hits = new Map(); // 5 leads / hour / IP, per isolate
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 3600e3);
  list.push(now); hits.set(ip, list);
  return list.length > 5;
}

export async function handleLead(request, env, ctx) {
  const origin = request.headers.get('origin');
  if (origin) {
    const host = new URL(origin).hostname;
    if (!ORIGINS.includes(origin) && !host.endsWith('.workers.dev') && host !== new URL(request.url).hostname) return res(403, { ok: false, error: 'Forbidden' });
  }
  const ip = request.headers.get('cf-connecting-ip') || 'local';
  if (limited(ip)) return res(429, { ok: false, error: 'Too many requests. Please email us instead.' });

  let raw;
  try { raw = await request.json(); } catch { return res(400, { ok: false, error: 'Invalid request.' }); }
  if (line(raw.website, 100)) return res(200, { ok: true }); // honeypot

  const d = {
    name: line(raw.name, 100),
    email: line(raw.email, 200).toLowerCase(),
    phone: line(raw.phone, 40),
    need: block(raw.need, 2000),
  };
  const errors = {};
  if (d.name.length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL_RE.test(d.email)) errors.email = 'Please enter a valid email.';
  if (d.phone && !/^[+()\d\s.-]{6,40}$/.test(d.phone)) errors.phone = 'Please check the phone number.';
  if (Object.keys(errors).length) return res(422, { ok: false, error: 'Please check the highlighted fields.', errors });

  const transcript = (Array.isArray(raw.transcript) ? raw.transcript : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20).map((m) => ({ role: m.role, content: block(m.content, 1500) }));
  const meta = {
    visitor: id(raw.visitor), session: id(raw.session), page: line(raw.page, 300),
    ip, country: request.cf?.country || '', device: device(request.headers.get('user-agent')),
  };

  // 1) Store first (Admin → Inbox), so the lead is never lost even if email fails.
  let q = null, saved = null;
  try {
    q = db(env);
    saved = await Contacts.create(q, {
      name: d.name, email: d.email, phone: d.phone, company: '', service: 'AI chat', budget: '',
      message: d.need || lastQuestion(transcript) || '(Left contact details in the chat)',
      page: meta.page, ip, country: meta.country, device: meta.device,
      source: 'chat', visitor: meta.visitor, session: meta.session, transcript,
    });
  } catch (e) { console.error('lead: could not store the lead', e?.message || e); }

  // Not stored (database down): the email is the only copy, so wait for it and report failure.
  if (!saved) {
    const r = await notify(env, d, transcript, meta).catch((e) => ({ status: 'failed', error: e?.message || String(e) }));
    if (r.status === 'sent') return res(200, { ok: true });
    console.error('lead: lost —', r.error);
    return res(502, { ok: false, error: 'We could not save your details right now. Please email us instead.' });
  }

  // 2) Email in the background; the result is recorded on the inbox item.
  ctx.waitUntil(notify(env, d, transcript, meta).then(
    (r) => mark(q, saved, r.status, r.error),
    (e) => { console.error('lead: email failed', e?.message || e); return mark(q, saved, 'failed', e?.message || String(e)); },
  ));
  return res(200, { ok: true });
}

const lastQuestion = (t) => [...t].reverse().find((m) => m.role === 'user')?.content || '';
async function mark(q, saved, status, error = '') {
  if (!q || !saved) return;
  try { await Contacts.setEmail(q, saved.id, status, error); } catch (e) { console.error('lead: email status not saved', e?.message || e); }
}

// Emails the team (and a confirmation to the visitor when enabled) with the existing templates.
async function notify(env, d, transcript, meta) {
  let settings = {};
  try { settings = await Settings.get(db(env)); } catch {}
  const cfg = await mailSetup(env, settings);
  if (!cfg.user || !cfg.pass) return { status: 'skipped', error: 'SMTP user / app password is not set' };
  const convo = transcript.map((m) => `${m.role === 'user' ? 'Visitor' : 'Assistant'}: ${m.content}`).join('\n\n');
  const enquiry = {
    name: d.name, email: d.email, company: d.phone ? `Phone: ${d.phone}` : '', service: 'AI chat', budget: '',
    message: [d.need || '(No message — see the chat below.)', convo && `\n— Chat transcript —\n\n${convo}`].filter(Boolean).join('\n'),
  };
  const info = { time: new Date().toUTCString(), country: meta.country, ip: meta.ip };
  await sendMail(cfg, async (mailer) => {
    const owner = ownerEmail(enquiry, info, settings.email_templates, settings.site);
    await mailer.send({ from: cfg.from, to: cfg.to.map((email) => ({ email })), ...(cfg.cc.length ? { cc: cfg.cc.map((email) => ({ email })) } : {}),
      reply: { name: d.name, email: d.email }, ...owner, subject: `[Chat lead] ${d.name}${d.phone ? ` · ${d.phone}` : ''}` });
    if (cfg.autoreply) {
      try {
        const c = customerEmail({ ...enquiry, message: d.need || 'Your conversation with our website assistant.' }, cfg.to[0], settings.email_templates, settings.site);
        await mailer.send({ from: cfg.from, to: { name: d.name, email: d.email }, reply: { name: cfg.from.name, email: cfg.to[0] }, ...c });
      } catch (e) { console.error('lead: confirmation failed', e?.message || e); }
    }
  });
  return { status: 'sent' };
}
