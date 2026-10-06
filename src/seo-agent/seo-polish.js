// SEO polish: runs after the Writer, before the draft is saved.
// 1) fixes structure the layout depends on (one H1, no page_header in posts),
// 2) asks DeepSeek once to repair meta fields that fail the checks, then hard-trims as a last resort,
// 3) adds internal links and OG fields (no featured image — the social image falls back to the site default),
// 4) returns an SEO report (same checks as the editor + on-page keyword checks) stored on the page.
import { llmJson } from './llm.js';

const terms = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').match(/[a-z0-9]+/g) || [];
const STOP = new Set(['the', 'and', 'for', 'with', 'how', 'what', 'your', 'you', 'are', 'can', 'from', 'that', 'this', 'into', 'best', 'vs', 'to', 'of', 'in', 'on', 'a', 'an', 'is', 'do', 'it', 'by', 'or']);
export const key = (s) => terms(s).filter((t) => t.length > 2 && !STOP.has(t));
// Keyword "present" = the exact phrase, or at least 70% of its meaningful words.
// Light stemming: "agent" ↔ "agents", "integrate" ↔ "integration" (shared prefix of 4+ letters).
const near = (a, b) => a === b || (Math.min(a.length, b.length) >= 4 && (a.startsWith(b) || b.startsWith(a) || (a.length >= 6 && b.length >= 6 && a.slice(0, 6) === b.slice(0, 6))));
export const hasKw = (text, kw) => {
  const words = terms(text), k = key(kw);
  if (` ${words.join(' ')} `.includes(` ${terms(kw).join(' ')} `)) return true;
  return k.length > 0 && k.filter((w) => words.some((t) => near(t, w))).length / k.length >= 0.7;
};
const clip = (s, max) => { s = String(s || '').replace(/\s+/g, ' ').trim(); if (s.length <= max) return s; const c = s.slice(0, max - 1); return `${c.slice(0, Math.max(c.lastIndexOf(' '), max * 0.6)).replace(/[\s,;:.–-]+$/, '')}…`; };
const plain = (md) => String(md || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[#*_>`|]/g, ' ').replace(/\s+/g, ' ').trim();
const internalLinks = (md) => (String(md || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').match(/\]\((\/[^)\s]*)\)/g) || []).map((x) => x.slice(2, -1));

// Checks shown in the admin (mirrors seoInfo() in admin/ui.js, plus on-page keyword checks).
export function seoReport(d, keyword, settings = {}) {
  const seo = d.seo || {}, site = settings.site || {};
  const body = (d.blocks || []).filter((b) => b.type === 'richtext').map((b) => b.data?.body || '').join('\n\n');
  const text = plain(body), words = text ? text.split(' ').length : 0;
  const firstPara = plain(body.split(/\n\s*\n/).find((p) => p.trim() && !p.trim().startsWith('#')) || '');
  const h2 = (body.match(/^##\s+/gm) || []).length;
  const faq = (d.blocks || []).filter((b) => b.type === 'faq').flatMap((b) => b.data?.items || []).filter((q) => q.q && q.a).length;
  const links = internalLinks(body + '\n' + (d.blocks || []).map((b) => JSON.stringify(b.data || {})).join(''));
  const h1s = (d.type === 'post' ? 1 : 0) + (d.blocks || []).filter((b) => b.type === 'page_header' || b.type === 'hero').length + (body.match(/^#\s+/gm) || []).length;
  const checks = [
    { ok: (seo.title || '').length >= 30 && (seo.title || '').length <= 60, t: `Meta title is 30–60 characters (${(seo.title || '').length})` },
    { ok: (seo.description || '').length >= 70 && (seo.description || '').length <= 160, t: `Meta description is 70–160 characters (${(seo.description || '').length})` },
    { ok: !!(seo.og_image || d.cover_image || site.default_og_image), t: 'Has a social share image' },
    { ok: words >= 600, t: `Content length: ${words} words (aim for 600+)` },
    { ok: (d.slug || '').length <= 60, t: 'Short, readable URL' },
    { ok: h1s === 1, t: h1s === 1 ? 'Exactly one H1' : `${h1s} H1 headings (should be 1)` },
    { ok: hasKw(seo.title, keyword), t: 'Keyword in meta title' },
    { ok: hasKw(d.title, keyword), t: 'Keyword in H1' },
    { ok: hasKw(seo.description, keyword), t: 'Keyword in meta description' },
    { ok: hasKw(firstPara, keyword), t: 'Keyword in the first paragraph' },
    { ok: h2 >= 3, t: `${h2} H2 sections (aim for 3+)` },
    { ok: links.length >= 2, t: `${links.length} internal links (aim for 2+)` },
    { ok: faq >= 3, t: `${faq} FAQ questions → FAQ rich result (aim for 3+)` },
  ];
  return { score: Math.round((100 * checks.filter((c) => c.ok).length) / checks.length), words, checks };
}

// d = Writer output; ctx = { keyword, brief, type, settings, published: [{title, path, type, blocks?}], productPage }
export async function polish(env, d, ctx, usage) {
  const { keyword, brief = {}, type, settings = {} } = ctx;
  d = { ...d, type, seo: { ...(d.seo || {}) }, blocks: Array.isArray(d.blocks) ? d.blocks.filter((b) => b && b.type && b.data) : [] };

  // ── Structure: posts get their H1 from the title (layout.js), so no page_header/hero and no "# " in the body
  if (type === 'post') {
    const head = d.blocks.find((b) => b.type === 'page_header');
    if (head && !d.excerpt) d.excerpt = head.data.lead || '';
    d.blocks = d.blocks.filter((b) => b.type !== 'page_header' && b.type !== 'hero');
  }
  d.blocks.forEach((b) => { if (b.type === 'richtext') b.data.body = String(b.data.body || '').replace(/^#\s+/gm, '## '); });
  if (!d.blocks.some((b) => b.type === 'richtext')) throw new Error('Writer returned no article body');

  // ── Meta fields: one repair round-trip if anything is off
  const issues = metaIssues(d, keyword);
  if (issues.length) {
    try {
      const fix = await llmJson(env, settings, {
        system: `You fix SEO metadata for one article. Return JSON {"title","slug","excerpt","seo":{"title","description","keywords"}}.
Rules: title = the H1, 40–65 chars, contains the keyword naturally. seo.title 45–60 chars incl. the keyword, no brand suffix.
seo.description 130–155 chars, contains the keyword, ends with a reason to click. excerpt 120–160 chars. slug: lowercase-hyphens, ≤ 60 chars, based on the keyword.
keywords: the main keyword + 3–5 close variants, comma separated. Keep anything that already meets the rules.`,
        user: { keyword, issues, title: d.title, slug: d.slug, excerpt: d.excerpt, seo: d.seo, angle: brief.angle },
        temperature: 0.2, max_tokens: 600,
      }, usage);
      if (fix.title) d.title = fix.title;
      if (fix.slug) d.slug = fix.slug;
      if (fix.excerpt) d.excerpt = fix.excerpt;
      d.seo = { ...d.seo, ...(fix.seo || {}) };
    } catch (e) { console.error('seo polish: meta repair failed', e); }
  }
  // Hard limits, whatever the model did
  d.title = clip(d.title || brief.h1 || keyword, 70);
  d.seo.title = clip(d.seo.title || d.title, 60);
  d.seo.description = clip(d.seo.description || d.excerpt || plain(d.blocks.find((b) => b.type === 'richtext').data.body), 160);
  d.excerpt = clip(d.excerpt || d.seo.description, 200);
  d.slug = terms(d.slug || keyword).join('-');
  if (d.slug.length > 60) d.slug = d.slug.slice(0, 61).replace(/-[^-]*$/, '');
  const kws = String(d.seo.keywords || '').split(',').map((s) => s.trim()).filter(Boolean);
  d.seo.keywords = [...new Set([keyword, ...kws].map((s) => s.toLowerCase()))].slice(0, 6).join(', ');
  d.seo.og_title = d.seo.title;
  d.seo.og_description = d.seo.description;
  if (type !== 'post') d.seo.schema_type = d.seo.schema_type || 'WebPage';

  // ── Internal links: the product/service page from the brief + up to 2 related published pages
  const rich = d.blocks.find((b) => b.type === 'richtext');
  const have = new Set(internalLinks(rich.data.body));
  const product = brief.product_link && brief.product_link.startsWith('/') ? brief.product_link : '';
  const kwTerms = new Set(key(keyword + ' ' + (brief.angle || '')));
  const related = (ctx.published || [])
    .filter((p) => p.path !== product && p.path !== '/' && !have.has(p.path))
    .map((p) => ({ ...p, s: key(p.title).filter((t) => kwTerms.has(t)).length }))
    .filter((p) => p.s > 0).sort((a, b) => b.s - a.s).slice(0, 2);
  const add = [];
  if (product && !have.has(product)) add.push(`- [${ctx.productPage?.title || 'See how we can help'}](${product})`);
  related.forEach((p) => add.push(`- [${p.title}](${p.path})`));
  if (add.length && have.size + add.length >= 1) rich.data.body = `${rich.data.body.trim()}\n\n## Related reading\n\n${add.join('\n')}`;
  const cta = d.blocks.find((b) => b.type === 'cta');
  if (cta && product && !cta.data.secondary?.url) cta.data.secondary = { label: ctx.productPage?.title ? `Explore ${ctx.productPage.title}` : 'Learn more', url: product };

  delete d.cover_image; delete d.seo.og_image;

  const report = seoReport(d, keyword, settings);
  return { draft: d, report };
}

function metaIssues(d, kw) {
  const out = [], s = d.seo || {};
  const tl = (s.title || '').length, dl = (s.description || '').length;
  if (tl < 30 || tl > 60) out.push(`seo.title is ${tl} chars`);
  if (dl < 70 || dl > 160) out.push(`seo.description is ${dl} chars`);
  if (!hasKw(s.title, kw)) out.push('keyword missing from seo.title');
  if (!hasKw(s.description, kw)) out.push('keyword missing from seo.description');
  if (!hasKw(d.title, kw)) out.push('keyword missing from title (H1)');
  if (!d.slug || d.slug.length > 60) out.push('slug missing or longer than 60 chars');
  if (!d.excerpt) out.push('excerpt missing');
  return out;
}
