// Media library on Cloudflare R2: upload (admin only), list, delete, and public serving at /media/<key>.
const MAX_BYTES = 15 * 1024 * 1024;
const TYPES = { webp: 'image/webp', jpg: 'image/jpeg', png: 'image/png', gif: 'image/gif', avif: 'image/avif' };

// Identify the real file type from its first bytes (never trust the browser's label).
export function sniff(bytes) {
  const b = new Uint8Array(bytes.slice(0, 16));
  const s = (i, n) => String.fromCharCode(...b.slice(i, i + n));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b[0] === 0x89 && s(1, 3) === 'PNG') return 'png';
  if (s(0, 3) === 'GIF') return 'gif';
  if (s(0, 4) === 'RIFF' && s(8, 4) === 'WEBP') return 'webp';
  if (s(4, 4) === 'ftyp' && /avi[fs]/.test(s(8, 4))) return 'avif';
  return null;
}

const slugName = (name = 'image') =>
  String(name).replace(/\.[a-z0-9]+$/i, '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'image';

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const toItem = (o) => ({
  key: o.key, url: `/media/${o.key}`, size: o.size, uploaded: o.uploaded,
  type: o.httpMetadata?.contentType || '',
  width: Number(o.customMetadata?.width) || null, height: Number(o.customMetadata?.height) || null,
  name: o.customMetadata?.name || o.key.split('/').pop(),
  large: o.customMetadata?.large ? `/media/${o.customMetadata.large}` : null,
  width_large: Number(o.customMetadata?.width_large) || null, height_large: Number(o.customMetadata?.height_large) || null,
});

export async function mediaApi(request, env, sub) {
  if (!env.MEDIA) return json({ error: 'Image storage (R2) is not set up yet. Run: npx wrangler r2 bucket create dep-media, then deploy again.' }, 503);
  const m = request.method;

  if (sub === '' && m === 'GET') {
    const url = new URL(request.url);
    const res = await env.MEDIA.list({ prefix: 'uploads/', limit: 200, cursor: url.searchParams.get('cursor') || undefined, include: ['customMetadata', 'httpMetadata'] });
    // hide the "-2x" companions; they're returned through their main image
    const items = res.objects.filter((o) => !o.customMetadata?.companion).map(toItem).sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
    return json({ items, cursor: res.truncated ? res.cursor : null });
  }

  if (sub === '' && m === 'POST') {
    const form = await request.formData().catch(() => null);
    const file = form?.get('file');
    if (!file || typeof file === 'string') return json({ error: 'No file received.' }, 400);
    const large = form.get('large');
    const meta = (k) => String(form.get(k) || '').replace(/[^0-9]/g, '').slice(0, 6);

    const put = async (blob, key, custom) => {
      if (blob.size > MAX_BYTES) throw new Error(`Image is too large (max ${MAX_BYTES / 1024 / 1024} MB).`);
      const bytes = await blob.arrayBuffer();
      const ext = sniff(bytes);
      if (!ext) throw new Error('Only JPG, PNG, WebP, GIF and AVIF images can be uploaded.');
      const finalKey = `${key}.${ext}`;
      await env.MEDIA.put(finalKey, bytes, { httpMetadata: { contentType: TYPES[ext], cacheControl: 'public, max-age=31536000, immutable' }, customMetadata: custom });
      return finalKey;
    };

    try {
      const d = new Date();
      const base = `uploads/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${slugName(form.get('name') || file.name)}-${crypto.randomUUID().slice(0, 8)}`;
      let largeKey = '';
      if (large && typeof large !== 'string') largeKey = await put(large, `${base}-2x`, { companion: '1', width: meta('width_large'), height: meta('height_large') });
      const key = await put(file, base, {
        name: String(form.get('name') || file.name).slice(0, 120),
        width: meta('width'), height: meta('height'),
        ...(largeKey ? { large: largeKey, width_large: meta('width_large'), height_large: meta('height_large') } : {}),
      });
      const obj = await env.MEDIA.head(key);
      return json(toItem(obj), 201);
    } catch (e) {
      return json({ error: e.message || 'Upload failed.' }, 400);
    }
  }

  if (sub.startsWith('/') && m === 'DELETE') {
    const key = decodeURIComponent(sub.slice(1));
    if (!key.startsWith('uploads/') || key.includes('..')) return json({ error: 'Invalid file.' }, 400);
    const obj = await env.MEDIA.head(key);
    await env.MEDIA.delete([key, ...(obj?.customMetadata?.large ? [obj.customMetadata.large] : [])]);
    return json({ ok: true });
  }
  return json({ error: 'Unknown endpoint.' }, 404);
}

// Public: GET /media/uploads/... — served from the edge cache, falling back to R2.
export async function serveMedia(request, env, ctx) {
  const url = new URL(request.url);
  const key = decodeURIComponent(url.pathname.slice('/media/'.length));
  if (!env.MEDIA || !key.startsWith('uploads/') || key.includes('..')) return new Response('Not found', { status: 404 });
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method Not Allowed', { status: 405 });

  const cache = caches.default;
  const ck = new Request(`${url.origin}${url.pathname}`, { method: 'GET' });
  let res = await cache.match(ck);
  if (!res) {
    const obj = await env.MEDIA.get(key);
    if (!obj) return new Response('Not found', { status: 404, headers: { 'cache-control': 'public, max-age=60' } });
    const h = new Headers();
    obj.writeHttpMetadata(h);
    h.set('etag', obj.httpEtag);
    h.set('cache-control', 'public, max-age=31536000, immutable');
    h.set('x-content-type-options', 'nosniff');
    h.set('content-security-policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    res = new Response(obj.body, { headers: h });
    ctx.waitUntil(cache.put(ck, res.clone()));
  }
  if (request.headers.get('if-none-match') && request.headers.get('if-none-match') === res.headers.get('etag')) {
    return new Response(null, { status: 304, headers: { etag: res.headers.get('etag'), 'cache-control': res.headers.get('cache-control') } });
  }
  return request.method === 'HEAD' ? new Response(null, { headers: res.headers }) : res;
}
