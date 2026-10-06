// Admin authentication: one admin password (secret ADMIN_PASSWORD) and an HMAC-signed session cookie.
const COOKIE = 'dep_admin';
const TTL = 60 * 60 * 12; // 12 hours
const enc = new TextEncoder();

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function safeEqual(a, b) {
  // Compare HMACs of both values so timing doesn't leak the secret.
  const k = crypto.getRandomValues(new Uint8Array(16)).join(',');
  const [x, y] = await Promise.all([hmac(k, String(a)), hmac(k, String(b))]);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.min(x.length, y.length); i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

const secretOf = (env) => env.SESSION_SECRET || env.ADMIN_PASSWORD;

export async function createSession(env) {
  const exp = Math.floor(Date.now() / 1000) + TTL;
  const value = `${exp}.${await hmac(secretOf(env), `admin.${exp}`)}`;
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL}`;
}

export const clearSession = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export async function isAuthed(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const m = (request.headers.get('cookie') || '').match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, await hmac(secretOf(env), `admin.${exp}`));
}

// Blocks cross-site form posts / fetches to admin endpoints.
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return request.method === 'GET' || request.method === 'HEAD';
  return new URL(origin).host === new URL(request.url).host;
}
