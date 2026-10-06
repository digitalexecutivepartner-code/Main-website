// POST /api/contact — contact form handler (called from src/worker.js)
// Validates the contact form, stores it in the database (Admin → Inbox), emails the team,
// and sends a confirmation to the sender. If the enquiry was stored, the visitor sees success
// even when the notification email fails — the admin Inbox shows the email status.
//
// SMTP password: saved (encrypted) from Admin → Settings → Email sending → App password.
// Fallback secrets (set in Cloudflare, never in code):
//   SMTP_USER   Gmail address used to send (e.g. the account that owns the app password)
//   SMTP_PASS   Gmail app password (used only when no app password is saved in the admin)
// Optional variables:
//   CONTACT_TO        where enquiries are delivered (default: digitalexecutivepartner@gmail.com)
//   SMTP_HOST / SMTP_PORT   default smtp.gmail.com / 465
//   TURNSTILE_SECRET  enables Cloudflare Turnstile verification when set

import { WorkerMailer } from 'worker-mailer';
import { ownerEmail, customerEmail } from '../lib/email.js';
import { db, Settings, Contacts } from './db.js';
import { device } from './chat/handler.js';
import { unseal } from './secrets.js';

const BUDGETS = ['', 'Under $1,000', '$1,000 – $5,000', '$5,000 – $15,000', '$15,000+', 'Not sure yet'];
const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i;
const ORIGINS = ['https://digitalexecutivepartner.app', 'https://www.digitalexecutivepartner.app', 'https://shop.digitalexecutivepartner.app'];

// Single-line fields: strip control characters (prevents header injection) and collapse whitespace.
const line = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const block = (v, max) => String(v ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, max);

export async function handleContact(request, env) {
  const ct = request.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');

  const reply = (status, body) =>
    isJson
      ? new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })
      : Response.redirect(new URL(`/?sent=${body.ok ? 1 : 0}#contact`, request.url).toString(), 303);

  // Same-site requests only (allows the production domain and *.pages.dev previews).
  const origin = request.headers.get('origin');
  if (origin) {
    const host = new URL(origin).hostname;
    if (!ORIGINS.includes(origin) && !host.endsWith('.pages.dev') && host !== new URL(request.url).hostname) {
      return reply(403, { ok: false, error: 'This form only accepts messages sent from our website.' });
    }
  }

  let raw;
  try {
    raw = isJson ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return reply(400, { ok: false, error: 'We could not read your message. Please try again.' });
  }

  // Spam traps: hidden honeypot field, and forms submitted faster than a human can type.
  const elapsed = Date.now() - Number(raw.t || 0);
  if (line(raw.website, 200) || (raw.t && elapsed < 2500)) {
    return reply(200, { ok: true });
  }

  const d = {
    name: line(raw.name, 100),
    email: line(raw.email, 200).toLowerCase(),
    company: line(raw.company, 150),
    service: line(raw.service, 80),
    budget: line(raw.budget, 40),
    message: block(raw.message, 5000),
  };

  const errors = {};
  if (d.name.length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL_RE.test(d.email)) errors.email = 'Please enter a valid email address.';
  if (d.service.length < 2) errors.service = 'Please choose what you need help with.';
  if (!BUDGETS.includes(d.budget)) d.budget = '';
  if (d.message.length < 10) errors.message = 'Please tell us a little more (at least 10 characters).';
  if (Object.keys(errors).length) {
    return reply(422, { ok: false, error: 'Please check the highlighted fields.', errors });
  }

  if (env.TURNSTILE_SECRET) {
    const form = new FormData();
    form.append('secret', env.TURNSTILE_SECRET);
    form.append('response', String(raw['cf-turnstile-response'] || ''));
    form.append('remoteip', request.headers.get('cf-connecting-ip') || '');
    const v = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form }).then((r) => r.json()).catch(() => ({}));
    if (!v.success) return reply(400, { ok: false, error: 'Please complete the verification and try again.' });
  }

  const meta = { time: new Date().toUTCString(), country: request.cf?.country || '', ip: request.headers.get('cf-connecting-ip') || '' };

  // 1) Store the enquiry first, so it is never lost even if email sending fails.
  let q = null, saved = null;
  try {
    q = db(env);
    saved = await Contacts.create(q, { ...d, page: line(request.headers.get('referer'), 500), ip: meta.ip, country: meta.country, device: device(request.headers.get('user-agent') || '') });
  } catch (e) { console.error('contact: could not store the enquiry', e); }
  const markEmail = async (status, err = '') => { if (saved) { try { await Contacts.setEmail(q, saved.id, status, err); } catch (e) { console.error('contact: email status not saved', e); } } };

  // 2) Email settings come from the CMS (Settings → Email sending); the password is the saved app password or the SMTP_PASS secret.
  let settings = {};
  try { settings = await Settings.get(q || db(env)); } catch (e) { console.error('contact: settings unavailable, using defaults', e); }
  const cfg = await mailSetup(env, settings);
  if (!cfg.user || !cfg.pass) {
    console.error('contact: SMTP user / app password is not set');
    if (saved) { await markEmail('skipped', 'SMTP user / app password is not set'); return reply(200, { ok: true }); }
    return reply(500, { ok: false, error: 'Our contact form is temporarily unavailable.' });
  }

  try {
    await sendMail(cfg, async (mailer) => {
      const owner = ownerEmail(d, meta, settings.email_templates, settings.site);
      await mailer.send({ from: cfg.from, to: cfg.to.map((email) => ({ email })), ...(cfg.cc.length ? { cc: cfg.cc.map((email) => ({ email })) } : {}), reply: { name: d.name, email: d.email }, ...owner });
      if (cfg.autoreply) {
        // Best effort: the enquiry has already reached the team.
        try {
          const customer = customerEmail(d, cfg.to[0], settings.email_templates, settings.site);
          await mailer.send({ from: cfg.from, to: { name: d.name, email: d.email }, reply: { name: cfg.from.name, email: cfg.to[0] }, ...customer });
        } catch (e) { console.error('contact: confirmation email failed', e); }
      }
    });
  } catch (e) {
    console.error('contact: send failed', e);
    if (saved) { await markEmail('failed', e?.message || e); return reply(200, { ok: true }); }
    return reply(502, { ok: false, error: `We couldn't send your message right now. Please email us at ${cfg.to[0]}.` });
  }

  await markEmail('sent');
  return reply(200, { ok: true });
}

const list = (v) => (Array.isArray(v) ? v : String(v || '').split(/[\n,;]/)).map((s) => s.trim()).filter((s) => EMAIL_RE.test(s));

export function mailConfig(env, settings = {}) {
  const e = settings.email || {};
  const user = (e.smtp_user || env.SMTP_USER || '').trim();
  const to = list(e.to).length ? list(e.to) : list(env.CONTACT_TO || 'digitalexecutivepartner@gmail.com');
  return {
    host: (e.smtp_host || env.SMTP_HOST || 'smtp.gmail.com').trim(),
    port: Number(e.smtp_port || env.SMTP_PORT || 465),
    user,
    from: { name: e.from_name || settings.site?.name || 'Digital Executive Partner', email: (e.from_email || user).trim() },
    to, cc: list(e.cc),
    autoreply: e.autoreply !== false,
  };
}

// Normalises an app password: Gmail shows it as "abcd efgh ijkl mnop" — the spaces are not part of it.
export function cleanPassword(v) {
  const s = String(v || '').trim();
  return /^[a-z]{4}( [a-z]{4}){3}$/i.test(s) ? s.replace(/ /g, '') : s;
}

// Resolves the SMTP password. Order: app password saved in the admin → SMTP_PASS secret.
// source: 'admin' | 'secret' | 'broken' (saved but cannot be decrypted) | 'none'
export async function smtpPassword(env, settings = {}) {
  const box = settings._smtp_pass;
  if (box) {
    const pass = await unseal(env, box);
    if (pass) return { pass, source: 'admin', updated_at: box.updated_at || null };
    if (env.SMTP_PASS) return { pass: env.SMTP_PASS, source: 'secret', broken: true, updated_at: box.updated_at || null };
    return { pass: '', source: 'broken', updated_at: box.updated_at || null };
  }
  return env.SMTP_PASS ? { pass: env.SMTP_PASS, source: 'secret' } : { pass: '', source: 'none' };
}

export async function mailSetup(env, settings = {}) {
  const pw = await smtpPassword(env, settings);
  return { ...mailConfig(env, settings), pass: pw.pass, passSource: pw.source, passBroken: !!pw.broken || pw.source === 'broken', passUpdatedAt: pw.updated_at || null };
}

export async function sendMail(cfg, fn) {
  const mailer = await WorkerMailer.connect({
    host: cfg.host, port: cfg.port, secure: cfg.port === 465, startTls: true,
    authType: ['plain', 'login'],
    credentials: { username: cfg.user, password: cfg.pass },
    socketTimeoutMs: 15000, responseTimeoutMs: 15000,
  });
  try { await fn(mailer); } finally { try { await mailer.close(); } catch {} }
}
