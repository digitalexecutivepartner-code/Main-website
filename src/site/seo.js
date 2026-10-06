import { esc, lines, stripMd, pathFor, parentCrumb } from './util.js';

const abs = (site, u) => (!u ? '' : /^https?:\/\//i.test(u) ? u : `${site.url}${u.startsWith('/') ? '' : '/'}${u}`);

export function pageMeta(page, settings) {
  const site = settings.site || {};
  const seo = page.seo || {};
  const path = pathFor(page);
  const url = seo.canonical || `${site.url}${path === '/' ? '/' : path}`;
  const firstText = (page.blocks || []).map((b) => b.data?.lead || b.data?.body || '').find(Boolean) || '';
  const title = seo.title || (page.type === 'home' ? site.name : `${page.title}${site.title_suffix || ''}`);
  const description = seo.description || page.excerpt || stripMd(firstText).slice(0, 158);
  const image = abs(site, seo.og_image || page.cover_image || site.default_og_image);
  return { site, seo, path, url, title, description, image };
}

export function headTags(page, settings, m) {
  const { site, seo } = m;
  const isPost = page.type === 'post';
  const robots = seo.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  return [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}">`,
    seo.keywords ? `<meta name="keywords" content="${esc(seo.keywords)}">` : '',
    `<meta name="robots" content="${robots}">`,
    `<link rel="canonical" href="${esc(m.url)}">`,
    `<link rel="alternate" hreflang="en" href="${esc(m.url)}">`,
    `<link rel="alternate" hreflang="x-default" href="${esc(m.url)}">`,
    site.google_verification ? `<meta name="google-site-verification" content="${esc(site.google_verification)}">` : '',
    site.bing_verification ? `<meta name="msvalidate.01" content="${esc(site.bing_verification)}">` : '',
    `<meta property="og:type" content="${isPost ? 'article' : 'website'}">`,
    `<meta property="og:site_name" content="${esc(site.name)}">`,
    `<meta property="og:locale" content="en_US">`,
    `<meta property="og:url" content="${esc(m.url)}">`,
    `<meta property="og:title" content="${esc(seo.og_title || m.title)}">`,
    `<meta property="og:description" content="${esc(seo.og_description || m.description)}">`,
    m.image ? `<meta property="og:image" content="${esc(m.image)}">` : '',
    m.image ? `<meta property="og:image:alt" content="${esc(seo.og_title || m.title)}">` : '',
    page.updated_at ? `<meta property="og:updated_time" content="${new Date(page.updated_at).toISOString()}">` : '',
    isPost && page.published_at ? `<meta property="article:published_time" content="${new Date(page.published_at).toISOString()}">` : '',
    isPost && page.updated_at ? `<meta property="article:modified_time" content="${new Date(page.updated_at).toISOString()}">` : '',
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(seo.og_title || m.title)}">`,
    `<meta name="twitter:description" content="${esc(seo.og_description || m.description)}">`,
    m.image ? `<meta name="twitter:image" content="${esc(m.image)}">` : '',
  ].filter(Boolean).join('\n');
}

export function jsonLd(page, settings, m, extra = {}) {
  const site = settings.site || {};
  const org = settings.org || {};
  const base = site.url;
  const orgId = `${base}/#organization`;
  const graph = [];
  const blocks = page.blocks || [];
  const block = (t) => blocks.find((b) => b.type === t && !b.hidden)?.data;

  const orgNode = {
    '@type': 'Organization', '@id': orgId, name: org.name || site.name, url: `${base}/`,
    logo: org.logo ? { '@type': 'ImageObject', url: abs(site, org.logo), width: 512, height: 512 } : undefined,
    image: abs(site, site.default_og_image) || undefined,
    email: site.contact_email || undefined,
    slogan: org.slogan || undefined,
    description: org.description || undefined,
    alternateName: lines(org.alternate_names).length ? lines(org.alternate_names) : undefined,
    knowsAbout: lines(org.knows_about).length ? lines(org.knows_about) : undefined,
    areaServed: 'Worldwide',
    sameAs: lines(org.same_as).length ? lines(org.same_as) : undefined,
    contactPoint: site.contact_email ? { '@type': 'ContactPoint', contactType: 'sales', email: site.contact_email, url: `${base}/#contact`, availableLanguage: lines(org.languages).length ? lines(org.languages) : ['English'] } : undefined,
  };
  const svc = block('services');
  if (page.type === 'home' && svc?.items?.length) {
    orgNode.hasOfferCatalog = { '@type': 'OfferCatalog', name: svc.heading || 'Services', itemListElement: svc.items.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title, description: s.text } })) };
  }
  graph.push(orgNode);
  graph.push({ '@type': 'WebSite', '@id': `${base}/#website`, url: `${base}/`, name: site.name, inLanguage: 'en', publisher: { '@id': orgId } });

  const pageId = `${m.url}#webpage`;
  const isPost = page.type === 'post';
  const type = isPost ? 'WebPage' : page.seo?.schema_type === 'Service' ? 'WebPage' : page.seo?.schema_type || 'WebPage';
  const webpage = {
    '@type': type, '@id': pageId, url: m.url, name: m.title, description: m.description, inLanguage: 'en',
    isPartOf: { '@id': `${base}/#website` }, about: { '@id': orgId },
    primaryImageOfPage: m.image ? { '@type': 'ImageObject', url: m.image } : undefined,
    datePublished: page.published_at ? new Date(page.published_at).toISOString() : undefined,
    dateModified: page.updated_at ? new Date(page.updated_at).toISOString() : undefined,
  };
  if (page.type === 'home') webpage.potentialAction = [{ '@type': 'ContactAction', name: 'Start a project', target: `${base}/#contact` }];
  graph.push(webpage);

  if (page.type !== 'home') {
    const crumbs = [{ name: 'Home', item: `${base}/` }];
    if (isPost) crumbs.push({ name: 'Blog', item: `${base}/blog` });
    const parent = parentCrumb(page);
    if (parent) crumbs.push({ name: parent.name, item: `${base}${parent.path}` });
    crumbs.push({ name: page.title, item: m.url });
    graph.push({ '@type': 'BreadcrumbList', '@id': `${m.url}#breadcrumb`, itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })) });
    webpage.breadcrumb = { '@id': `${m.url}#breadcrumb` };
  }

  if (isPost) {
    graph.push({
      '@type': 'BlogPosting', '@id': `${m.url}#article`, headline: page.title, description: m.description,
      image: m.image || undefined, mainEntityOfPage: { '@id': pageId },
      datePublished: page.published_at ? new Date(page.published_at).toISOString() : undefined,
      dateModified: page.updated_at ? new Date(page.updated_at).toISOString() : undefined,
      author: { '@id': orgId }, publisher: { '@id': orgId },
    });
  }
  if (page.seo?.schema_type === 'Service') {
    graph.push({ '@type': 'Service', '@id': `${m.url}#service`, name: page.title, description: m.description, provider: { '@id': orgId }, areaServed: 'Worldwide', url: m.url });
  }

  if (page.type !== 'home' && svc?.items?.length) {
    graph.push({
      '@type': 'ItemList', '@id': `${m.url}#services`, name: svc.heading || 'Services', numberOfItems: svc.items.length,
      itemListElement: svc.items.map((s, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Service', name: s.title, description: s.text, provider: { '@id': orgId }, url: s.link_url && s.link_url.startsWith('/') ? `${base}${s.link_url}` : undefined } })),
    });
  }

  const prod = block('products');
  if (prod?.items?.length) {
    graph.push({
      '@type': 'ItemList', '@id': `${m.url}#products`, name: prod.heading || 'Products', numberOfItems: prod.items.length,
      itemListElement: prod.items.map((p, i) => {
        const offers = lines(p.offers).map((l) => {
          const [name, price, unit] = l.split('|').map((x) => x.trim());
          const o = { '@type': 'Offer', name, price: String(price || '0').replace(/[^0-9.]/g, '') || '0', priceCurrency: 'USD' };
          if (unit) o.priceSpecification = { '@type': 'UnitPriceSpecification', price: o.price, priceCurrency: 'USD', unitText: unit };
          return o;
        });
        return {
          '@type': 'ListItem', position: i + 1,
          item: {
            '@type': 'SoftwareApplication', name: p.schema_name || (p.tag || p.title).split('·')[0].trim(),
            url: p.schema_url || p.primary?.url || undefined, applicationCategory: p.schema_category || 'BusinessApplication',
            operatingSystem: 'Web', description: p.text, featureList: lines(p.checks).length ? lines(p.checks) : undefined,
            offers: offers.length ? offers : undefined, publisher: { '@id': orgId },
          },
        };
      }),
    });
  }

  const questions = blocks.filter((b) => b.type === 'faq' && !b.hidden).flatMap((b) => b.data?.items || []).filter((q) => q.q && q.a);
  if (questions.length) {
    graph.push({ '@type': 'FAQPage', '@id': `${m.url}#faq`, mainEntity: questions.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: stripMd(q.a) } })) });
  }
  if (extra.collection) graph.push(extra.collection);

  const clean = JSON.parse(JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }));
  let out = `<script type="application/ld+json">${JSON.stringify(clean).replace(/</g, '\\u003c')}</script>`;
  if (page.seo?.json_ld) {
    try { out += `\n<script type="application/ld+json">${JSON.stringify(JSON.parse(page.seo.json_ld)).replace(/</g, '\\u003c')}</script>`; } catch {}
  }
  return out;
}

export function sitemapXml(pages, settings, hasBlog) {
  const base = settings.site.url;
  const urls = pages
    .filter((p) => p.status === 'published' && !p.seo?.noindex)
    .map((p) => {
      const loc = p.seo?.canonical || `${base}${pathFor(p) === '/' ? '/' : pathFor(p)}`;
      const imgs = [p.seo?.og_image, p.cover_image].filter(Boolean).map((u) => abs(settings.site, u));
      return `  <url>\n    <loc>${esc(loc)}</loc>\n    <lastmod>${new Date(p.updated_at || Date.now()).toISOString().slice(0, 10)}</lastmod>\n${[...new Set(imgs)].map((u) => `    <image:image><image:loc>${esc(u)}</image:loc></image:image>\n`).join('')}  </url>`;
    });
  if (hasBlog) urls.push(`  <url>\n    <loc>${esc(base)}/blog</loc>\n  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`;
}

export function robotsTxt(settings) {
  const body = (settings.robots_txt || 'User-agent: *\nAllow: /').trim().replace(/^\s*Sitemap:.*$/gim, '').trim();
  return `${body}\n\nSitemap: ${settings.site.url}/sitemap.xml\n`;
}
