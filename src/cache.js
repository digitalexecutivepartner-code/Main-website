// Page cache for rendered CMS pages — two layers, stale-while-revalidate.
//
//  L1  Cloudflare Cache API (caches.default): per data center, ~1 ms.
//  L2  Workers KV (binding PAGE_CACHE): shared by every data center, so a page rendered once is
//      fast for visitors everywhere, not only near the visitor who triggered the render.
//
// Once a page has been rendered, visitors never wait for the database again: a copy older than
// FRESH_TTL is still served instantly and refreshed in the background. Admin saves bump a global
// "generation" number and pre-render the changed pages, so edits go live in every data center
// within about a minute. Without the KV binding it falls back to L1 only (gen "0").

const FRESH_KV = 60 * 60;           // with KV: refresh in the background after 1 hour (edits invalidate explicitly)
const FRESH_L1 = 2 * 60;            // without KV: other data centers can't be purged, so refresh sooner
const KEEP_TTL = 60 * 60 * 24 * 30; // how long any copy is kept (also the fallback if the database is down)
const KV_TOUCH = 6 * 60 * 60;       // re-write an unchanged page to KV at most this often (keeps KV writes low)
const GEN_TTL = 30;                 // seconds a data center trusts its local copy of the generation number
const GEN_KEY = 'meta:gen';
const KEEP_HEADERS = ['content-type', 'x-robots-tag'];

const l1Key = (origin, path, tag) => new Request(`${origin}${path}?__cms=${encodeURIComponent(tag)}`, { method: 'GET' });
const kvKey = (gen, path) => `page:${gen}:${path}`;
const freshFor = (env) => (env.PAGE_CACHE ? FRESH_KV : FRESH_L1) * 1000;

async function getGen(env, origin) {
  if (!env.PAGE_CACHE) return '0';
  const k = l1Key(origin, '/__gen', 'gen');
  const hit = await caches.default.match(k);
  if (hit) return hit.text();
  const gen = (await env.PAGE_CACHE.get(GEN_KEY, { cacheTtl: 60 }).catch(() => null)) || '0';
  await setLocalGen(origin, gen);
  return gen;
}
const setLocalGen = (origin, gen) =>
  caches.default.put(l1Key(origin, '/__gen', 'gen'), new Response(gen, { headers: { 'cache-control': `public, max-age=${GEN_TTL}` } }));

// ---- entries: { body: ArrayBuffer, headers: {..}, ts: ms rendered, hash } ----
async function toEntry(res) {
  const body = await res.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-1', body);
  const hash = [...new Uint8Array(digest)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
  const headers = {};
  for (const k of KEEP_HEADERS) if (res.headers.get(k)) headers[k] = res.headers.get(k);
  return { body, headers, ts: Date.now(), hash };
}

const fromL1 = async (res) => ({
  body: await res.arrayBuffer(),
  headers: JSON.parse(res.headers.get('x-cms-h') || '{}'),
  ts: Number(res.headers.get('x-cms-ts')) || 0,
  hash: res.headers.get('x-cms-hash') || '',
});

const putL1 = (origin, path, tag, e) =>
  caches.default.put(l1Key(origin, path, tag), new Response(e.body, {
    headers: { 'cache-control': `public, max-age=${KEEP_TTL}`, 'x-cms-h': JSON.stringify(e.headers), 'x-cms-ts': String(e.ts), 'x-cms-hash': e.hash },
  }));

async function readEntry(env, ctx, origin, path, gen) {
  const hit = await caches.default.match(l1Key(origin, path, `v${gen}`));
  if (hit) return fromL1(hit);
  if (!env.PAGE_CACHE) return null;
  const { value, metadata } = await env.PAGE_CACHE.getWithMetadata(kvKey(gen, path), { type: 'arrayBuffer' });
  if (!value || !metadata) return null;
  const e = { body: value, headers: metadata.h || {}, ts: metadata.ts || 0, hash: metadata.hash || '' };
  ctx.waitUntil(Promise.all([putL1(origin, path, `v${gen}`, e), putL1(origin, path, 'last', e)]).catch(() => {}));
  return e;
}

async function store(env, origin, path, gen, e, writeKv) {
  const jobs = [putL1(origin, path, `v${gen}`, e), putL1(origin, path, 'last', e)];
  if (writeKv && env.PAGE_CACHE) {
    jobs.push(env.PAGE_CACHE.put(kvKey(gen, path), e.body, { expirationTtl: KEEP_TTL, metadata: { h: e.headers, ts: e.ts, hash: e.hash } }));
  }
  await Promise.all(jobs);
}

const cacheable = (res) => res.status === 200 && !res.headers.get('location');

async function refresh(env, origin, path, gen, render, prev) {
  // Mark the copy as fresh for 30 s so concurrent visitors don't all trigger a re-render.
  await putL1(origin, path, `v${gen}`, { ...prev, ts: Date.now() - freshFor(env) + 30_000 });
  const res = await render();
  if (!cacheable(res)) { // page was removed or moved: stop serving the old copy
    await Promise.all([caches.default.delete(l1Key(origin, path, `v${gen}`)), env.PAGE_CACHE?.delete(kvKey(gen, path))]);
    return;
  }
  const e = await toEntry(res);
  await store(env, origin, path, gen, e, e.hash !== prev.hash || Date.now() - prev.ts > KV_TOUCH * 1000);
}

function respond(request, e, state) {
  const h = new Headers(e.headers);
  h.set('cache-control', 'public, max-age=0, must-revalidate');
  h.set('etag', `"${e.hash}"`);
  h.set('x-cms-cache', state);
  if (request.headers.get('if-none-match') === `"${e.hash}"`) return new Response(null, { status: 304, headers: h });
  return new Response(request.method === 'HEAD' ? null : e.body, { status: 200, headers: h });
}

// Serve a public CMS URL through the cache. `render()` builds the response from the database.
export async function servePage(request, env, ctx, render) {
  const { origin, pathname: path } = new URL(request.url);
  const gen = await getGen(env, origin).catch(() => '0');
  const e = await readEntry(env, ctx, origin, path, gen).catch((err) => (console.error('cache read failed', err), null));

  if (e) {
    if (Date.now() - e.ts < freshFor(env)) return respond(request, e, 'HIT');
    ctx.waitUntil(refresh(env, origin, path, gen, render, e).catch((err) => console.error('background refresh failed', err)));
    return respond(request, e, 'STALE');
  }

  let res;
  try {
    res = await render();
  } catch (err) {
    console.error('render failed', err);
    const last = await caches.default.match(l1Key(origin, path, 'last'));
    if (last) return respond(request, await fromL1(last), 'FALLBACK');
    return new Response('<!doctype html><title>Temporarily unavailable</title><p style="font-family:sans-serif;text-align:center;margin-top:20vh">We’re updating the site. Please try again in a minute.</p>', { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'retry-after': '60' } });
  }
  if (!cacheable(res)) return res;
  const fresh = await toEntry(res);
  ctx.waitUntil(store(env, origin, path, gen, fresh, true).catch((err) => console.error('cache write failed', err)));
  return respond(request, fresh, 'MISS');
}

// Called after an admin save: start a new cache generation and pre-render the affected pages,
// so the change is live everywhere and the first visitor after a save doesn't wait for the database.
export async function purge(env, origin, paths = [], render) {
  const all = [...new Set(['/', '/sitemap.xml', '/robots.txt', '/llms.txt', '/blog', ...paths])];
  let gen = '0';
  if (env.PAGE_CACHE) {
    gen = String(Date.now());
    await env.PAGE_CACHE.put(GEN_KEY, gen);
    await setLocalGen(origin, gen);
  } else {
    await Promise.all(all.map((p) => caches.default.delete(l1Key(origin, p, 'v0'))));
  }
  if (!render) return;
  await Promise.all(all.map(async (p) => {
    try {
      const res = await render(p);
      if (cacheable(res)) await store(env, origin, p, gen, await toEntry(res), true);
    } catch (err) { console.error('pre-render failed', p, err); }
  }));
}
