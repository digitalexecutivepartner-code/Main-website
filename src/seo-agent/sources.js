import { Settings, db } from '../db.js';
import { unseal } from '../secrets.js';

// Trend Scout: gathers raw keyword signals. Every source is optional and fails soft.
//
// Search Console: upload the service-account JSON in Admin → SEO Agent → Settings (stored encrypted),
//   or set the GSC_SA_JSON + GSC_SITE secrets (npx wrangler secret put …).
// Settings (Admin → SEO Agent → Settings): seed topics for autocomplete, RSS/Atom feeds.

const UA = { 'user-agent': 'DEP-SEO-Agent/0.1 (+https://digitalexecutivepartner.app)' };

// 1) Google Search Console — the most valuable source: real queries we already show up for.
//    "Opportunity" = many impressions, position 5–30, low CTR → refresh or write a dedicated page.
//    creds = await gscCreds(env, settings): the JSON key uploaded in Admin → SEO Agent → Settings
//    (stored encrypted as settings._gsc), or the GSC_SA_JSON / GSC_SITE secrets as a fallback.
export async function searchConsole(env, days = 28, creds) {
  creds = creds || (await gscCreds(env));
  if (!creds?.sa || !creds.site) return [];
  const token = await googleToken(creds.sa, 'https://www.googleapis.com/auth/webmasters.readonly');
  const end = new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10); // GSC lags ~2 days
  const start = new Date(Date.now() - (days + 2) * 864e5).toISOString().slice(0, 10);
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(creds.site)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ startDate: start, endDate: end, dimensions: ['query', 'page'], rowLimit: 500 }),
  });
  if (!res.ok) throw new Error(gscError(res.status, await res.text().catch(() => '')));
  const { rows = [] } = await res.json();
  return rows
    .filter((r) => r.impressions >= 20 && r.position >= 4 && r.position <= 30)
    .map((r) => ({ source: 'gsc', keyword: r.keys[0], url: r.keys[1], metrics: { impressions: r.impressions, clicks: r.clicks, ctr: r.ctr, position: Math.round(r.position * 10) / 10 } }));
}

// 2) Google autocomplete — what people are typing right now around our seed topics (unofficial endpoint).
export async function autocomplete(seeds = []) {
  const out = [];
  for (const seed of seeds.slice(0, 15)) {
    for (const suffix of ['', ' how', ' vs', ' best', ' 2026']) {
      const r = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(seed + suffix)}`, { headers: UA }).catch(() => null);
      if (!r?.ok) continue;
      const [, list = []] = await r.json().catch(() => []);
      list.forEach((k) => out.push({ source: 'autocomplete', keyword: k, metrics: { seed } }));
    }
  }
  return dedupe(out);
}

// 3) RSS / Atom — platform changelogs (Shopify, Zoho) and competitor blogs. New API = new content opportunity.
export async function feeds(urls = []) {
  const out = [];
  const week = Date.now() - 7 * 864e5;
  for (const u of urls.slice(0, 15)) {
    const r = await fetch(u, { headers: UA }).catch(() => null);
    if (!r?.ok) continue;
    const xml = await r.text();
    for (const item of xml.split(/<item[\s>]|<entry[\s>]/).slice(1, 20)) {
      const title = tag(item, 'title');
      const date = Date.parse(tag(item, 'pubDate') || tag(item, 'updated') || tag(item, 'published'));
      if (title && (!date || date > week)) out.push({ source: 'rss', keyword: title, url: tag(item, 'link') || (item.match(/href="([^"]+)"/) || [])[1] || '', metrics: { feed: u } });
    }
  }
  return out;
}

const tag = (s, t) => (s.match(new RegExp(`<${t}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${t}>`)) || [])[1]?.trim() || '';
const dedupe = (arr) => [...new Map(arr.map((x) => [x.keyword.toLowerCase(), x])).values()];

// Per-page totals (last `days`) and the top queries of one page — used by the meta refresh in boost.js.
export async function gscQuery(creds, body, days = 28) {
  const token = await googleToken(creds.sa, 'https://www.googleapis.com/auth/webmasters.readonly');
  const end = new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10);
  const start = new Date(Date.now() - (days + 2) * 864e5).toISOString().slice(0, 10);
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(creds.site)}/searchAnalytics/query`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ startDate: start, endDate: end, ...body }),
  });
  if (!res.ok) throw new Error(gscError(res.status, await res.text().catch(() => '')));
  return (await res.json()).rows || [];
}
export async function gscPageStats(creds) {
  return (await gscQuery(creds, { dimensions: ['page'], rowLimit: 1000 }))
    .map((r) => ({ url: r.keys[0], impressions: r.impressions, clicks: r.clicks, ctr: r.ctr, position: r.position }));
}
export async function gscTopQueries(creds, url, limit = 5) {
  return (await gscQuery(creds, { dimensions: ['query'], rowLimit: limit, dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'equals', expression: url }] }] }))
    .map((r) => ({ query: r.keys[0], impressions: r.impressions, position: Math.round(r.position * 10) / 10 }));
}

// ── Search Console credentials ──────────────────────────────────────────────────────────

// { sa, site, source: 'admin' | 'secret' | 'broken' | 'none', client_email, updated_at }
export async function gscCreds(env, settings) {
  settings = settings || (await Settings.get(db(env)));
  const box = settings._gsc;
  if (box?.ct) {
    const raw = await unseal(env, box);
    if (raw) { try { return { sa: JSON.parse(raw), site: box.site || '', source: 'admin', client_email: box.client_email, updated_at: box.updated_at }; } catch {} }
    if (!env.GSC_SA_JSON) return { source: 'broken', client_email: box.client_email, site: box.site || '', updated_at: box.updated_at };
  }
  if (env.GSC_SA_JSON) {
    try { const sa = JSON.parse(env.GSC_SA_JSON); return { sa, site: env.GSC_SITE || '', source: 'secret', client_email: sa.client_email }; } catch { return { source: 'broken' }; }
  }
  return { source: 'none' };
}

// Validates an uploaded service-account key file. Returns the parsed object or throws a readable error.
export function parseServiceAccount(text) {
  let sa;
  try { sa = JSON.parse(String(text || '').trim()); } catch { throw new Error('This file is not valid JSON. Upload the key file downloaded from Google Cloud (…-xxxxxxxx.json).'); }
  if (sa.type !== 'service_account') throw new Error(sa.web || sa.installed ? 'This is an OAuth client file, not a service-account key. In Google Cloud open IAM → Service accounts → your account → Keys → Add key → JSON.' : 'This JSON is not a service-account key (missing "type": "service_account").');
  if (!/@.+\.iam\.gserviceaccount\.com$/.test(sa.client_email || '')) throw new Error('The key file has no valid client_email.');
  if (!/BEGIN PRIVATE KEY/.test(sa.private_key || '')) throw new Error('The key file has no private_key.');
  return { type: sa.type, project_id: sa.project_id, client_email: sa.client_email, private_key: sa.private_key, token_uri: sa.token_uri };
}

// Properties the service account can read: [{ siteUrl, permissionLevel }]
export async function gscSites(sa) {
  const token = await googleToken(sa, 'https://www.googleapis.com/auth/webmasters.readonly');
  const r = await fetch('https://www.googleapis.com/webmasters/v3/sites', { headers: { authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(gscError(r.status, await r.text().catch(() => '')));
  return ((await r.json()).siteEntry || []).filter((x) => x.permissionLevel !== 'siteUnverifiedUser');
}

export function gscError(status, text = '') {
  if (status === 403 && /has not been used|disabled/i.test(text)) return 'The “Google Search Console API” is not enabled in this Google Cloud project. Enable it (APIs & Services → Library), wait a minute, then test again.';
  if (status === 403) return 'The service account has no access to this property. In Search Console → Settings → Users and permissions, add its email.';
  if (status === 404) return 'Property not found. Pick one of the properties listed for this service account.';
  return `Search Console error ${status}: ${String(text).slice(0, 160)}`;
}

// Service-account OAuth (JWT RS256 signed with WebCrypto — no Node libraries needed in Workers).
export async function googleToken(sa, scope) {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => btoa(typeof o === 'string' ? o : JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: sa.client_email, scope, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const der = Uint8Array.from(atob(sa.private_key.replace(/-----[^-]+-----|\s/g, '')), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned)));
  const jwt = `${unsigned}.${b64(String.fromCharCode(...sig))}`;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  if (!r.ok) { const t = await r.text().catch(() => ''); throw new Error(/invalid_grant|account not found/i.test(t) ? 'Google rejected this key (it may have been deleted or disabled in Google Cloud). Create a new JSON key and upload it.' : `Google sign-in failed (${r.status}): ${t.slice(0, 160)}`); }
  return (await r.json()).access_token;
}
