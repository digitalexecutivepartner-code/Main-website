import { CSS, CLIENT_JS } from './assets.js';
import { esc, linkAttrs, pathFor, fmtDate, mdInline, parentCrumb } from './util.js';
import { renderBlocks, postCard } from './blocks.js';
import { pageMeta, headTags, jsonLd } from './seo.js';
import { chatWidget } from '../chat/widget.js';

function header(settings) {
  const h = settings.header || {};
  const nav = (h.nav || []).map((l) => `<a${linkAttrs(l.url)}>${esc(l.label)}</a>`).join('\n      ');
  const cta = h.cta?.label ? `<a${linkAttrs(h.cta.url)} class="btn btn-primary nav-cta">${esc(h.cta.label)}</a>` : '';
  return `<header class="site-nav">
  <div class="wrap">
    <a href="/" class="logo" aria-label="${esc(settings.site?.name)} — home">
      <img src="/assets/logo-96.webp" width="40" height="40" alt="" fetchpriority="high">
      <span>Digital Executive <b>Partner</b></span>
    </a>
    <nav class="nav-links" aria-label="Main">
      ${nav}
    </nav>
    <div class="nav-right">
      ${cta}
      <button class="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu"><i></i></button>
    </div>
  </div>
  <nav id="mobile-menu" class="mobile-menu" aria-label="Mobile">
    ${nav}
    ${h.cta?.label ? `<a${linkAttrs(h.cta.url)} class="btn btn-primary">${esc(h.cta.label)}</a>` : ''}
  </nav>
</header>`;
}

function footer(settings) {
  const f = settings.footer || {};
  const cols = (f.columns || []).map((c) => `<div>
        <h2>${esc(c.title)}</h2>
        <ul>${(c.links || []).map((l) => `<li><a${linkAttrs(l.url)}>${esc(l.label)}</a></li>`).join('')}</ul>
      </div>`).join('\n      ');
  return `<footer>
  <div class="wrap">
    <div class="foot">
      <div>
        <a href="/" class="logo"><img src="/assets/logo-96.webp" width="40" height="40" alt="" loading="lazy"><span>Digital Executive <b>Partner</b></span></a>
        <p>${esc(f.tagline || '')}</p>
      </div>
      ${cols}
    </div>
    <p class="foot-bottom">© <span id="yr">${new Date().getUTCFullYear()}</span> ${esc(f.copyright || '')}</p>
  </div>
</footer>`;
}

function crumbs(page) {
  if (page.type === 'home') return '';
  const items = [`<li><a href="/">Home</a></li>`];
  if (page.type === 'post') items.push(`<li><a href="/blog">Blog</a></li>`);
  const parent = parentCrumb(page);
  if (parent) items.push(`<li><a href="${parent.path}">${esc(parent.name)}</a></li>`);
  items.push(`<li aria-current="page">${esc(page.title)}</li>`);
  return `<nav aria-label="Breadcrumb"><ol class="crumbs">${items.join('')}</ol></nav>`;
}

// Covers from public/assets/photos (…-1200.webp) also have a 640px copy: let the browser pick the smaller one.
const coverSet = (src, sizes) => /^\/assets\/photos\/[a-z0-9-]+-1200\.webp$/.test(src || '')
  ? ` srcset="${esc(src.replace(/-1200\.webp$/, '-640.webp'))} 640w, ${esc(src)} 1200w" sizes="${sizes}"` : '';

export function renderPage(page, settings, opts = {}) {
  const m = pageMeta(page, settings);
  const ctx = { page, settings, crumbs: crumbs(page), posts: opts.posts || [] };
  const blocks = page.blocks || [];
  const first = blocks.find((b) => !b.hidden)?.type;
  let intro = '';
  if (page.type === 'post') {
    intro = `<section class="page-head" aria-labelledby="page-title"><div class="wrap single"><div>${ctx.crumbs}
      <h1 id="page-title">${esc(page.title)}</h1>
      ${page.excerpt ? `<p class="lead">${esc(page.excerpt)}</p>` : ''}
      <div class="post-meta"><time datetime="${page.published_at ? new Date(page.published_at).toISOString() : ''}">${fmtDate(page.published_at || page.updated_at)}</time><span>${esc(settings.org?.name || settings.site?.name || '')}</span></div>
    </div></div></section>
    ${page.cover_image ? `<section style="padding:32px 0 0"><div class="wrap"><figure class="figure post-cover"><img src="${esc(page.cover_image)}"${coverSet(page.cover_image, '(max-width:1000px) 92vw, 980px')} width="1200" height="675" alt="${esc(page.title)}" fetchpriority="high"></figure></div></section>` : ''}`;
  } else if (page.type !== 'home' && first !== 'page_header' && first !== 'hero') {
    intro = `<section class="page-head" aria-labelledby="page-title"><div class="wrap single"><div>${ctx.crumbs}<h1 id="page-title">${esc(page.title)}</h1>${page.excerpt ? `<p class="lead">${esc(page.excerpt)}</p>` : ''}</div></div></section>`;
  }
  const body = intro + renderBlocks(blocks, ctx) + (opts.after || '');
  const heroImg = blocks.find((b) => !b.hidden && (b.type === 'hero' || b.type === 'page_header'))?.data?.image;
  const preload = heroImg?.src
    ? `<link rel="preload" as="image" href="${esc(heroImg.src)}"${heroImg.src_large ? ` imagesrcset="${esc(heroImg.src)} 640w, ${esc(heroImg.src_large)} 1080w" imagesizes="(max-width:980px) 80vw, 540px"` : ''} fetchpriority="high">`
    : '';
  return documentHtml({ settings, head: headTags(page, settings, m) + '\n' + preload + (opts.head ? '\n' + opts.head : '') + '\n' + jsonLd(page, settings, m, opts.ld || {}), body, preview: opts.preview });
}

export const POSTS_PER_PAGE = 9;
export const blogPagePath = (n) => (n <= 1 ? '/blog' : `/blog/page/${n}`);

// /blog and /blog/page/N — 9 posts per page. Returns null when the page number is past the last page.
export function renderBlogIndex(posts, settings, n = 1) {
  const site = settings.site;
  const pages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  if (n < 1 || n > pages) return null;
  const list = posts.slice((n - 1) * POSTS_PER_PAGE, n * POSTS_PER_PAGE);
  const suffix = n > 1 ? ` — Page ${n}` : '';
  const page = {
    type: 'page', slug: blogPagePath(n).slice(1), title: `Blog${suffix}`,
    excerpt: `Guides and updates on Shopify, Zoho, web & mobile development and AI agents from ${site.name}.${n > 1 ? ` Page ${n} of ${pages}.` : ''}`,
    blocks: [], seo: { schema_type: 'CollectionPage', title: `Blog${n > 1 ? ` – Page ${n}` : ''}${site.title_suffix || ''}` },
  };
  const grid = list.length
    ? `<ul class="post-grid">${list.map((p) => postCard(p)).join('')}</ul>`
    : `<p class="empty">No posts yet. Check back soon.</p>`;
  const after = `<section><div class="wrap">${grid}${pager(n, pages)}</div></section>`;
  const base = String(site.url || '').replace(/\/+$/, '');
  const head = [n > 1 && `<link rel="prev" href="${esc(base + blogPagePath(n - 1))}">`, n < pages && `<link rel="next" href="${esc(base + blogPagePath(n + 1))}">`].filter(Boolean).join('\n');
  return renderPage(page, settings, { after, head });
}

// « Prev  1 2 3 … 9  Next » — always shows first, last and the pages around the current one.
function pager(n, pages) {
  if (pages <= 1) return '';
  const nums = [...new Set([1, pages, n - 1, n, n + 1].filter((x) => x >= 1 && x <= pages))].sort((a, b) => a - b);
  const items = [];
  nums.forEach((x, i) => {
    if (i && x - nums[i - 1] > 1) items.push('<li class="gap" aria-hidden="true">…</li>');
    items.push(x === n ? `<li><span class="pg on" aria-current="page">${x}</span></li>` : `<li><a class="pg" href="${blogPagePath(x)}" aria-label="Page ${x}">${x}</a></li>`);
  });
  const prev = n > 1 ? `<a class="pg nav" href="${blogPagePath(n - 1)}" rel="prev">← Newer</a>` : '<span class="pg nav off" aria-hidden="true">← Newer</span>';
  const next = n < pages ? `<a class="pg nav" href="${blogPagePath(n + 1)}" rel="next">Older →</a>` : '<span class="pg nav off" aria-hidden="true">Older →</span>';
  return `<nav class="pager" aria-label="Blog pages">${prev}<ol>${items.join('')}</ol>${next}</nav>`;
}

export function renderNotFound(settings) {
  const page = { type: 'page', slug: '404', title: 'Page not found', excerpt: "The page you're looking for doesn't exist or has moved.", blocks: [
    { type: 'cta', data: { heading: 'Let’s get you back on track', text: 'Explore our services and products, or get in touch.', primary: { label: 'Back to home', url: '/' }, secondary: { label: 'Contact us', url: '/#contact' } } },
  ], seo: { noindex: true, title: `Page not found${settings.site?.title_suffix || ''}` } };
  return renderPage(page, settings);
}

export function documentHtml({ settings, head, body, preview }) {
  const site = settings.site || {};
  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}
<meta name="theme-color" content="${esc(site.theme_color || '#050818')}">
<meta name="color-scheme" content="dark">
<meta name="format-detection" content="telephone=no">
<meta name="application-name" content="${esc(site.name || '')}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml">
<link rel="alternate" type="text/plain" title="LLM summary" href="/llms.txt">
<link rel="preload" href="/assets/inter-var-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>${CSS}</style>
</head>
<body class="no-js">
${preview ? '<div style="position:sticky;top:0;z-index:100;background:#fbbf24;color:#1a1300;text-align:center;font:600 13px/1.4 Inter,sans-serif;padding:8px">Preview — not live. This page is hidden from Google.</div>' : ''}
<a class="skip" href="#main">Skip to content</a>
${header(settings)}
<main id="main">
${body}
</main>
${footer(settings)}
<script>${CLIENT_JS}</script>
${chatWidget(settings)}
</body>
</html>`;
}

export { mdInline };
