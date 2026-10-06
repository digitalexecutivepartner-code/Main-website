import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

export const esc = (s = '') =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Images in Markdown (article bodies): lazy-loaded, and our own photos (…/assets/photos/x-1200.webp) get a
// 640px copy + fixed size so the page doesn't jump while they load.
marked.use({
  renderer: {
    image({ href, title, text }) {
      const src = String(href || '');
      if (/^\s*(javascript|data|vbscript):/i.test(src)) return esc(text || '');
      const ours = /^\/assets\/photos\/[a-z0-9-]+-1200\.webp$/.test(src);
      const set = ours ? ` srcset="${esc(src.replace(/-1200\.webp$/, '-640.webp'))} 640w, ${esc(src)} 1200w" sizes="(max-width:760px) 92vw, 720px" width="1200" height="675"` : '';
      return `<img src="${esc(src)}"${set} alt="${esc(text || '')}"${title ? ` title="${esc(title)}"` : ''} loading="lazy" decoding="async">`;
    },
  },
});

export const lines = (v) =>
  (Array.isArray(v) ? v : String(v ?? '').split('\n')).map((s) => String(s).trim()).filter(Boolean);

export const md = (s = '') => marked.parse(String(s ?? ''));
export const mdInline = (s = '') => marked.parseInline(String(s ?? ''));

export const slugify = (s = '') =>
  String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
    .replace(/[^a-z0-9/]+/g, '-').replace(/-+/g, '-').replace(/(^[-/]+|[-/]+$)/g, '').replace(/\/+/g, '/');

export const isExternal = (url = '') => /^https?:\/\//i.test(url);

export function linkAttrs(url = '') {
  return isExternal(url) ? ` href="${esc(url)}" target="_blank" rel="noopener"` : ` href="${esc(url || '#')}"`;
}

export const pathFor = (p) => (p.type === 'home' ? '/' : p.type === 'post' ? `/blog/${p.slug}` : `/${p.slug}`);

export const stripMd = (s = '') =>
  String(s).replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[#>*_`~|-]+/g, ' ').replace(/\s+/g, ' ').trim();

export function srcset(image = {}, small = 640, large = 1080) {
  if (!image?.src) return '';
  const s = image.width_large ? Number(image.width) || small : small;
  const l = Number(image.width_large) || large;
  return image.src_large ? ` srcset="${esc(image.src)} ${s}w, ${esc(image.src_large)} ${l}w"` : '';
}

// Intermediate breadcrumb for nested pages, e.g. services/zoho-consulting → Services (/services)
export function parentCrumb(page) {
  if (page.type !== 'page' || !String(page.slug).includes('/')) return null;
  const seg = page.slug.split('/')[0];
  return { name: seg.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()), path: `/${seg}` };
}

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : '';
