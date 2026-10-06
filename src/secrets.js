// Encrypts small secrets (e.g. the SMTP app password) before they are stored in the settings table.
// AES-GCM with a key derived from a Worker secret. The box remembers which secret was used,
// so adding SETTINGS_KEY / SESSION_SECRET later does not break an already-saved password.
const enc = new TextEncoder();
const dec = new TextDecoder();
const b64 = (u8) => btoa(String.fromCharCode(...u8));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const SOURCES = ['SETTINGS_KEY', 'SESSION_SECRET', 'ADMIN_PASSWORD'];

async function keyFrom(env, source) {
  const base = env[source];
  if (!base) throw new Error(`${source} is not set`);
  const raw = await crypto.subtle.digest('SHA-256', enc.encode(`dep-settings:${base}`));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function seal(env, text) {
  const k = SOURCES.find((s) => env[s]);
  if (!k) throw new Error('No encryption key available. Set the SETTINGS_KEY secret in Cloudflare.');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await keyFrom(env, k), enc.encode(text)));
  return { k, iv: b64(iv), ct: b64(ct) };
}

// Returns the plain text, or null when the box is missing / cannot be decrypted.
export async function unseal(env, box) {
  if (!box || !box.iv || !box.ct) return null;
  try {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(box.iv) }, await keyFrom(env, box.k || 'ADMIN_PASSWORD'), unb64(box.ct));
    return dec.decode(pt);
  } catch {
    return null;
  }
}
