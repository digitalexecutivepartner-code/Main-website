// Renders a public CMS URL (home, pages, blog, sitemap/robots/llms) straight from the database.
// Used by the worker on a cache miss and by the admin to pre-warm the cache after a save.
import { db, Pages, Settings } from '../db.js';
import { renderPage, renderBlogIndex, renderNotFound } from './layout.js';
import { sitemapXml, robotsTxt } from './seo.js';
import { pathFor } from './util.js';

const HTML = { 'content-type': 'text/html; charset=utf-8' };
const renderNotFoundText = () => new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });

export async function route(pathname, env, request) {
  const q = db(env);
  const settings = await Settings.get(q);

  if (pathname === '/sitemap.xml') {
    const pages = await Pages.published(q);
    return new Response(sitemapXml(pages, settings, pages.some((p) => p.type === 'post')), { headers: { 'content-type': 'application/xml; charset=utf-8' } });
  }
  if (pathname === '/robots.txt') return new Response(robotsTxt(settings), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  if (pathname === '/llms.txt') return new Response(settings.llms_txt || '', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  // IndexNow ownership key (created by the SEO Agent, src/seo-agent/boost.js)
  if (pathname === '/indexnow.txt') return settings.indexnow?.key ? new Response(settings.indexnow.key, { headers: { 'content-type': 'text/plain; charset=utf-8' } }) : renderNotFoundText();

  if (pathname === '/') {
    const home = await Pages.byPath(q, 'home', '');
    if (home) return new Response(renderPage(home, settings, { posts: await postsFor(q, home) }), { headers: HTML });
  } else if (pathname === '/blog' || /^\/blog\/page\/\d{1,4}$/.test(pathname)) {
    const n = pathname === '/blog' ? 1 : Number(pathname.split('/').pop());
    if (n === 1 && pathname !== '/blog') return Response.redirect(new URL('/blog', request.url).toString(), 301);
    const posts = await Pages.posts(q);
    const html = posts.length ? renderBlogIndex(posts, settings, n) : null;
    if (html) return new Response(html, { headers: HTML });
  } else {
    const isPost = pathname.startsWith('/blog/');
    const slug = decodeURIComponent(pathname.slice(isPost ? 6 : 1)).toLowerCase();
    const page = await Pages.byPath(q, isPost ? 'post' : 'page', slug);
    if (page) {
      if (pathFor(page) !== pathname) return Response.redirect(new URL(pathFor(page), request.url).toString(), 301);
      return new Response(renderPage(page, settings, { posts: await postsFor(q, page) }), { headers: HTML });
    }
  }

  // Not a CMS page: try a static file (e.g. /favicon.ico rewrites), otherwise our 404 page.
  const asset = await env.ASSETS.fetch(request);
  if (asset.status !== 404) return asset;
  return new Response(renderNotFound(settings), { status: 404, headers: { ...HTML, 'x-robots-tag': 'noindex' } });
}

// Same as route(), for a bare path (no incoming request) — used when pre-warming the cache.
export const renderPath = (env, origin) => (path) => route(path, env, new Request(`${origin}${path}`, { method: 'GET' }));

// Recent posts, loaded only for pages that show a "Latest posts" block.
export async function postsFor(q, page) {
  return (page.blocks || []).some((b) => b?.type === 'posts' && !b.hidden) ? Pages.posts(q) : [];
}
