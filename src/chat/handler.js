// POST /api/chat — AI sales & support assistant for the website chat widget.
// Answers from the live CMS content (see ./knowledge.js) using the DeepSeek API, streamed as plain text.
//
// DeepSeek API key, in order of priority:
//   1. Admin → Settings → AI chat → API key (stored encrypted in the settings table as _deepseek_key)
//   2. Cloudflare secret DEEPSEEK_API_KEY (npx wrangler secret put DEEPSEEK_API_KEY)
// Instructions, model, greeting, extra knowledge: Admin → Settings → AI chat.
import { db } from '../db.js';
import { unseal } from '../secrets.js';
import { loadKnowledge, retrieve, sha } from './knowledge.js';
import { CHAT_DEFAULTS, DEFAULT_INSTRUCTIONS, LEAD_TOKEN } from './config.js';

const API = 'https://api.deepseek.com';
const ORIGINS = ['https://digitalexecutivepartner.app', 'https://www.digitalexecutivepartner.app', 'https://shop.digitalexecutivepartner.app'];
const MAX_TURNS = 6; // messages of history sent to the model (fewer = faster, cheaper)
const ANSWER_TTL = 6 * 60 * 60; // first questions (e.g. the suggestion chips) are answered from cache for 6h
const MAX_LEN = 1500; // characters per visitor message
const RATE = { window: 10 * 60 * 1000, max: 30 }; // per IP, per isolate
const hits = new Map();

const jsonRes = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE.window);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] > RATE.window) hits.delete(k);
  return list.length > RATE.max;
}

// Normalises a pasted key ("Bearer sk-…", quotes, spaces).
export const cleanKey = (v) => String(v || '').trim().replace(/^bearer\s+/i, '').replace(/^["']|["']$/g, '').trim();

// source: 'admin' | 'secret' | 'broken' (saved but cannot be decrypted) | 'none'
export async function deepseekKey(env, settings = {}) {
  const box = settings._deepseek_key;
  if (box) {
    const key = await unseal(env, box);
    if (key) return { key, source: 'admin', updated_at: box.updated_at || null, hint: box.hint || '' };
    if (env.DEEPSEEK_API_KEY) return { key: env.DEEPSEEK_API_KEY, source: 'secret', broken: true, updated_at: box.updated_at || null };
    return { key: '', source: 'broken', updated_at: box.updated_at || null };
  }
  return env.DEEPSEEK_API_KEY ? { key: env.DEEPSEEK_API_KEY, source: 'secret', hint: mask(env.DEEPSEEK_API_KEY) } : { key: '', source: 'none' };
}
export const mask = (k) => (k && k.length > 10 ? `${k.slice(0, 3)}…${k.slice(-4)}` : '');

// Chat settings with defaults for anything left empty.
export function chatConfig(settings = {}) {
  const set = Object.fromEntries(Object.entries(settings.chat || {}).filter(([, v]) => v !== '' && v != null));
  return { ...CHAT_DEFAULTS, ...set };
}

// Prompt layout: [rules + core summary] is identical on every request, so DeepSeek's prompt cache
// serves it (faster, ~10× cheaper); only the retrieved details and the page line change per question.
export function systemPrompt(settings, index, query, page, known = null) {
  const site = settings.site || {};
  const c = chatConfig(settings);
  const vars = {
    bot_name: c.bot_name || 'DEP Assistant',
    site_name: site.name || 'Digital Executive Partner',
    site_url: (site.url || 'https://digitalexecutivepartner.app').replace(/\/+$/, ''),
    email: site.contact_email || 'digitalexecutivepartner@gmail.com',
  };
  const rules = String(c.instructions || DEFAULT_INSTRUCTIONS).replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) => (k in vars ? vars[k] : m));
  const details = retrieve(index, query);
  // Fixed reasoning rules (not editable) so the assistant consults like a senior solution architect.
  const think = `\n- Technology questions: WHAT WE BUILD is authoritative. If the visitor names any mainstream language, framework, CMS, platform or cloud, even one not listed, say yes we can work with it (or suggest a better-fitting option and why). Never say we only use one technology; Flutter, Shopify, WordPress or Zoho on other pages are examples, not limits.\n- Consult: work out the real goal (new build, redesign, migration, integration, AI feature, maintenance), recommend a concrete approach or stack with one-line reasoning, then the next step. Ask at most one clarifying question.\n- Be specific to what they said (their platform, industry, size); avoid generic marketing lines.`;
  const lead = known
    ? `\n- CONTACT DETAILS ALREADY RECEIVED: this visitor${known.name ? ` (${known.name})` : ''} has already given us their name and email. Never ask for contact details again, never mention or point to a form, and never output ${LEAD_TOKEN}. For quotes, calls or next steps: confirm the team already has their details and will contact them soon, then help further, e.g. ask what to add to the brief (pages, features, integrations, deadline, budget range).`
    : c.lead_enabled === false ? '' : `\n- Lead capture: when the visitor wants a quote, a demo, a call, pricing that is not listed, or to start a project, invite them to leave their name and email in the form shown here, and end your reply with ${LEAD_TOKEN} (exactly, once). Do not ask them to type contact details into the chat.`;
  return `${rules}${think}${lead}\n\nKNOWLEDGE\n${index.core}${details ? `\n\nRELEVANT DETAILS\n${details}` : ''}\n\n(Visitor is on: ${page || vars.site_url})${known ? '\n(Reminder: contact details already received — do not ask for them or mention a form.)' : ''}`;
}

// One call to DeepSeek. Returns the fetch Response (stream or JSON).
export function callDeepseek(key, settings, system, messages, stream) {
  const c = chatConfig(settings);
  const temperature = Math.min(1.5, Math.max(0, Number(c.temperature)));
  const max_tokens = Math.min(2000, Math.max(100, Number(c.max_tokens) || 400));
  return fetch(`${API}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: c.model || 'deepseek-chat',
      messages: [{ role: 'system', content: system }, ...messages],
      stream, temperature: Number.isFinite(temperature) ? temperature : 0.3, max_tokens,
    }),
  });
}

// Checks a key by listing models (free, no tokens used).
export async function verifyKey(key) {
  const r = await fetch(`${API}/models`, { headers: { authorization: `Bearer ${key}` } }).catch((e) => ({ ok: false, status: 0, text: async () => String(e?.message || e) }));
  if (r.ok) { const j = await r.json().catch(() => ({})); return { ok: true, models: (j.data || []).map((m) => m.id) }; }
  const body = (await r.text().catch(() => '')).slice(0, 300);
  if (r.status === 401) return { ok: false, error: 'DeepSeek rejected this key (401 – invalid key).' };
  if (r.status === 402) return { ok: false, error: 'DeepSeek account has no balance (402). Top up at platform.deepseek.com.' };
  return { ok: false, error: `DeepSeek error ${r.status || ''}: ${body || 'could not connect'}` };
}

export function upstreamError(status, text = '') {
  if (status === 401) return 'The DeepSeek API key is invalid. Update it in Admin → Settings → AI chat.';
  if (status === 402) return 'The DeepSeek account is out of balance. Top up at platform.deepseek.com.';
  if (status === 429) return 'DeepSeek is rate-limiting requests. Try again in a moment.';
  return `DeepSeek error ${status}: ${String(text).slice(0, 200)}`;
}

// GET /api/chat — warm-up ping sent when the widget opens: loads the knowledge index into this
// isolate so the first real question doesn't wait for the database. Uses no tokens.
export async function warmChat(request, env) {
  try { await loadKnowledge(db(env), new URL(request.url).origin); } catch {}
  return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
}

export async function handleChat(request, env, ctx) {
  const origin = request.headers.get('origin');
  if (origin) {
    const host = new URL(origin).hostname;
    if (!ORIGINS.includes(origin) && !host.endsWith('.workers.dev') && host !== new URL(request.url).hostname) return jsonRes(403, { error: 'Forbidden' });
  }

  const ip = request.headers.get('cf-connecting-ip') || 'local';
  if (limited(ip)) return jsonRes(429, { error: 'You are sending messages too quickly. Please wait a few minutes, or use the contact form.' });

  let body;
  try { body = await request.json(); } catch { return jsonRes(400, { error: 'Invalid request.' }); }
  const messages = (Array.isArray(body?.messages) ? body.messages : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').slice(0, m.role === 'user' ? MAX_LEN : 600) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') return jsonRes(400, { error: 'Please type a message.' });
  const page = String(body.page || '').slice(0, 300);

  const q = db(env);
  let kb;
  try { kb = await loadKnowledge(q, new URL(request.url).origin); } catch (e) {
    console.error('chat: knowledge unavailable', e);
    return jsonRes(503, { error: 'The assistant is temporarily unavailable. Please use the contact form.' });
  }
  if (chatConfig(kb.settings).enabled === false) return jsonRes(503, { error: 'The chat assistant is turned off.' });
  const question = messages[messages.length - 1].content;
  const clean = (v) => String(v || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 40);
  const meta = { session: clean(body.session), visitor: clean(body.visitor), device: device(request.headers.get('user-agent')), ip, country: request.cf?.country || '', page, question };

  // Opening questions are often identical (suggestion chips): answer them from the edge cache.
  const cache = globalThis.caches?.default;
  // Visitor already left their details (in the chat or the contact form): never ask again.
  const known = body.lead && typeof body.lead === 'object' ? { name: String(body.lead.name || '').replace(/[^\p{L}\p{N} .'-]/gu, '').trim().slice(0, 60) } : null;
  const cacheKey = messages.length === 1 && !known && cache
    ? `https://dep-chat.internal/answer/${kb.version}/${await sha(`${chatConfig(kb.settings).model}|${question.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()}`)}`
    : null;
  if (cacheKey) {
    const hit = await cache.match(cacheKey).catch(() => null);
    if (hit) {
      const text = await hit.text();
      ctx.waitUntil(logChat(q, { ...meta, answer: text }));
      return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-chat-cache': 'HIT' } });
    }
  }

  const { key } = await deepseekKey(env, kb.settings);
  if (!key) return jsonRes(503, { error: 'The chat assistant is not configured yet.' });

  // Retrieval uses the last two visitor messages, so follow-ups ("how much is it?") keep their topic.
  const query = messages.filter((m) => m.role === 'user').slice(-2).map((m) => m.content).join(' ');
  const upstream = await callDeepseek(key, kb.settings, systemPrompt(kb.settings, kb.index, query, page, known), messages, true)
    .catch((e) => { console.error('chat: deepseek unreachable', e); return null; });
  if (!upstream || !upstream.ok || !upstream.body) {
    console.error('chat:', upstream ? upstreamError(upstream.status, await upstream.text().catch(() => '')) : 'no response');
    return jsonRes(502, { error: 'The assistant could not answer right now. Please try again, or use the contact form.' });
  }

  // DeepSeek SSE → plain text stream. The full answer is logged afterwards (best effort).
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  let buf = '';
  let answer = '';
  const stream = new TransformStream({
    transform(chunk, controller) {
      buf += dec.decode(chunk, { stream: true });
      const parts = buf.split('\n');
      buf = parts.pop();
      for (const line of parts) {
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const delta = JSON.parse(data).choices?.[0]?.delta?.content;
          if (delta) { answer += delta; controller.enqueue(enc.encode(delta)); }
        } catch {}
      }
    },
    flush() {
      ctx.waitUntil(logChat(q, { ...meta, answer }));
      if (cacheKey && answer.trim()) {
        ctx.waitUntil(cache.put(cacheKey, new Response(answer, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': `max-age=${ANSWER_TTL}` } })).catch(() => {}));
      }
    },
  });
  return new Response(upstream.body.pipeThrough(stream), {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' },
  });
}

// Short device label for the admin log, e.g. "Chrome · macOS", "Safari · iPhone".
export function device(ua = '') {
  ua = String(ua || '');
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
  const br = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : /bot|crawl|spider/i.test(ua) ? 'Bot' : '';
  return [br, os].filter(Boolean).join(' · ').slice(0, 60);
}

// Conversation log for the team (table chat_logs, created by `npm run db:setup`). Never blocks the reply.
async function logChat(q, r) {
  try {
    await q(`INSERT INTO chat_logs (session, visitor, device, ip, country, page, question, answer) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [r.session, r.visitor || '', r.device || '', r.ip, r.country, r.page, r.question, String(r.answer || '').split(LEAD_TOKEN).join('').trim()]);
  } catch (e) { console.error('chat: log failed', e?.message || e); }
}
