// Block renderers. Each returns the HTML for one section of a page.
import { esc, lines, md, mdInline, linkAttrs, srcset, pathFor, fmtDate } from './util.js';

const BADGE_RGB = { cyan: '34,211,238', sync: '34,211,238', look: '232,121,249', seo: '52,211,153', mw: '96,165,250', violet: '168,85,247' };
const acc = (a) => `var(--${BADGE_RGB[a] ? a : 'cyan'})`;

const SVG = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const VALUE_ICONS = {
  tech: SVG('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
  flex: SVG('<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'),
  part: SVG('<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/>'),
};
const SERVICE_ICONS = {
  web: SVG('<rect x="2" y="4" width="14" height="11" rx="2"/><path d="M6 19h6M9 15v4"/><rect x="17" y="8" width="5" height="12" rx="1.5"/><path d="M19.5 17.5h0"/>'),
  shop: SVG('<path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M10 13l1.5 1.5L14.5 11"/>'),
  zoho: SVG('<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8.3 7.2l2.5 8.6M15.7 7.2l-2.5 8.6M8.5 6h7"/>'),
  ai: SVG('<path d="M4 5h16v11H9l-5 4z"/><path d="M12 8.5l.9 1.8 1.8.9-1.8.9-.9 1.8-.9-1.8-1.8-.9 1.8-.9z"/>'),
};

function button(b, cls = 'btn-primary') {
  if (!b?.label) return '';
  if (!b.url) return `<span class="btn btn-disabled">${esc(b.label)}</span>`;
  return `<a${linkAttrs(b.url)} class="btn ${cls}">${esc(b.label)}</a>`;
}
const buttons = (d, wrap = 'hero-cta') =>
  d.primary?.label || d.secondary?.label ? `<div class="${wrap}">${button(d.primary)}${button(d.secondary, 'btn-ghost')}</div>` : '';

function sectionHead(d, id, center = true, lead = true) {
  return `<div class="${center ? 'center ' : ''}reveal">
      ${d.eyebrow ? `<span class="eyebrow">${esc(d.eyebrow)}</span>` : ''}
      ${d.heading ? `<h2 id="${id}-title">${esc(d.heading)}</h2>` : ''}
      ${lead && d.lead ? `<p class="lead">${esc(d.lead)}</p>` : ''}
    </div>`;
}
const sid = (d, i, fallback) => (d.anchor || fallback || `s${i}`).replace(/[^a-zA-Z0-9_-]/g, '');
const secAttrs = (d, id, extra = '') => ` id="${id}"${extra}${d.heading ? ` aria-labelledby="${id}-title"` : ''}`;

const moreLink = (d) => (d.more?.label && d.more?.url ? `<div class="more-link reveal"><a${linkAttrs(d.more.url)} class="btn btn-ghost">${esc(d.more.label)}</a></div>` : '');

function picture(image, sizes, { lazy = true, priority = false, small, large } = {}) {
  if (!image?.src) return '';
  const dims = image.width && image.height ? ` width="${Number(image.width)}" height="${Number(image.height)}"` : '';
  return `<img src="${esc(image.src)}"${srcset(image, small, large)}${image.src_large ? ` sizes="${esc(sizes)}"` : ''}${dims} alt="${esc(image.alt || '')}"${priority ? ' fetchpriority="high"' : ''}${lazy && !priority ? ' loading="lazy" decoding="async"' : ''}>`;
}

/* ---------------- page header illustrations (decorative) ---------------- */
const HEADER_VISUALS = {
  web: `<div class="hv hv-web" aria-hidden="true">
    <div class="hv-browser"><div class="hv-bar"><i></i><i></i><i></i><span>yourbrand.com</span></div>
      <div class="hv-site"><div class="hv-nav"><b></b><span></span><span></span><span></span><em></em></div>
        <div class="hv-hero"><div><b style="width:80%"></b><b style="width:60%"></b><span style="width:90%"></span><span style="width:70%"></span><em></em></div><div class="hv-img"></div></div>
        <div class="hv-cards"><div></div><div></div><div></div></div></div></div>
    <div class="hv-phone"><div class="hv-notch"></div><div class="hv-app"><b></b><div class="hv-img sm"></div><span></span><span style="width:70%"></span><div class="hv-row"><i></i><i></i></div><em></em></div></div>
    <div class="hv-chip c1">● 98 Performance</div><div class="hv-chip c2">✓ SEO ready</div>
  </div>`,
  shop: `<div class="hv hv-shop" aria-hidden="true">
    <div class="hv-panel"><div class="hv-ph"><span class="dot" style="background:#95bf47"></span>Store apps</div>
      <div class="hv-apps"><div><i style="background:linear-gradient(135deg,#22d3ee,#3b82f6)"></i><b>CRM sync</b><small>Active</small></div><div><i style="background:linear-gradient(135deg,#e879f9,#7c3aed)"></i><b>Bundles</b><small>Active</small></div><div><i style="background:linear-gradient(135deg,#34d399,#0ea5e9)"></i><b>SEO</b><small>Active</small></div><div><i style="background:linear-gradient(135deg,#fbbf24,#f97316)"></i><b>Custom app</b><small>Building</small></div></div>
      <div class="hv-flow"><span>Order #10482</span><em>→</em><span>Automation</span><em>→</em><span>CRM</span></div></div>
    <div class="hv-toast"><b>New order</b><span>$156.40 · bundle of 3</span></div>
  </div>`,
  zoho: `<div class="hv hv-zoho" aria-hidden="true">
    <div class="hv-panel"><div class="hv-ph"><span class="dot" style="background:#60a5fa"></span>Sales pipeline</div>
      <div class="hv-kanban">
        <div><h5>New</h5><p><b>Acme Retail</b><small>$4,200</small></p><p><b>Lumen Co</b><small>$1,800</small></p></div>
        <div><h5>Proposal</h5><p><b>Nova Studio</b><small>$7,500</small></p></div>
        <div><h5>Won</h5><p class="won"><b>Bright Labs</b><small>$12,000</small></p><p class="won"><b>Order #10482</b><small>$156</small></p></div>
      </div></div>
    <div class="hv-toast"><b>Synced</b><span>Shopify → Zoho CRM</span></div>
  </div>`,
  ai: `<div class="hv hv-ai" aria-hidden="true">
    <div class="hv-panel"><div class="hv-ph"><span class="hv-orb"></span>AI assistant <small>online</small></div>
      <div class="hv-chat"><p class="u">Can I change my delivery address?</p><p class="a">Yes! I've found order #10482. What's the new address?</p><p class="u">12 Le Loi, District 1</p><p class="a">Done. I updated the order and your CRM record.</p></div></div>
    <div class="hv-actions"><b>Agent actions</b><span>✓ Order updated</span><span>✓ CRM note added</span><span>● Refund needs approval</span></div>
  </div>`,
  services: `<div class="hv hv-services" aria-hidden="true">
    <div class="hv-grid4"><div style="--c:#22d3ee"><i>${SERVICE_ICONS.web}</i><b>Web &amp; mobile</b></div><div style="--c:#34d399"><i>${SERVICE_ICONS.shop}</i><b>Shopify apps</b></div><div style="--c:#60a5fa"><i>${SERVICE_ICONS.zoho}</i><b>Zoho</b></div><div style="--c:#e879f9"><i>${SERVICE_ICONS.ai}</i><b>AI agents</b></div></div>
  </div>`,
};

/* ---------------- hero ---------------- */
const HERO_CARDS = `<div class="art" aria-hidden="true">
      <div class="card c-sync">
        <h3><span class="dot" style="background:var(--sync)"></span>ZohoSync · live</h3>
        <div class="sync-row"><div class="node s">Shopify</div><div class="flow"><svg viewBox="0 0 200 34" preserveAspectRatio="none"><path d="M0 11 H200" stroke="#22d3ee" stroke-width="2" class="dash" fill="none"/><path d="M200 23 H0" stroke="#a855f7" stroke-width="2" class="dash" fill="none" style="animation-direction:reverse"/></svg></div><div class="node z">Zoho CRM</div></div>
        <div class="sync-list"><div>Order #10482 → Deal <em>synced</em></div><div>New customer → Contact <em>synced</em></div><div>Stock · SKU-2291 <em>updated</em></div></div>
      </div>
      <div class="card c-look">
        <h3><span class="dot" style="background:var(--look)"></span>Lookfit AI · Complete the look</h3>
        <div class="bundle"><div class="thumb t1"></div><div class="thumb t2"></div><div class="thumb t3"></div></div>
        <div class="bundle-foot"><small><s>$184</s><b>$156</b> · 15% off</small><span class="mini-btn">Add bundle</span></div>
      </div>
      <div class="card c-seo">
        <h3><span class="dot" style="background:var(--seo)"></span>SEO health</h3>
        <div class="gauge"><svg viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#34d399"/></linearGradient></defs><circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,.08)" stroke-width="10" fill="none"/><circle cx="50" cy="50" r="40" stroke="url(#g)" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="251" stroke-dashoffset="45" transform="rotate(-90 50 50)"/><text x="50" y="58" text-anchor="middle" fill="#fff" font-size="24" font-weight="800" font-family="Inter,sans-serif">82</text></svg>
          <div class="bars"><div class="bar">SEO<span><i style="width:86%"></i></span></div><div class="bar">Content<span><i style="width:72%;background:#fbbf24"></i></span></div><div class="bar">Images<span><i style="width:91%"></i></span></div></div>
        </div>
      </div>
    </div>`;

function hero(d) {
  const img = d.image?.src
    ? `<figure class="hero-logo"><img src="${esc(d.image.src)}"${srcset(d.image, 640, 1080)}${d.image.src_large ? ' sizes="(max-width:980px) 80vw, 540px"' : ''} width="${Number(d.image.width) || 1080}" height="${Number(d.image.height) || 1080}" fetchpriority="high" alt="${esc(d.image.alt || '')}"></figure>`
    : '';
  return `<section class="hero" aria-labelledby="hero-title">
  <div class="wrap">
    <div>
      ${d.pill || d.badge ? `<span class="pill">${d.badge ? `<b>${esc(d.badge)}</b> ` : ''}${esc(d.pill || '')}</span>` : ''}
      <h1 id="hero-title">${esc(d.title || '')}${d.highlight ? ` <span class="grad">${esc(d.highlight)}</span>` : ''}</h1>
      ${d.lead ? `<p class="lead">${esc(d.lead)}</p>` : ''}
      ${buttons(d)}
      ${lines(d.bullets).length ? `<ul class="hero-meta">${lines(d.bullets).map((b) => `<li><i></i>${esc(b)}</li>`).join('')}</ul>` : ''}
    </div>
    ${img}
    ${d.show_cards ? HERO_CARDS : ''}
  </div>
</section>`;
}

function pageHeader(d, i, ctx) {
  const title = d.title || ctx.page.title;
  const art = !d.image?.src && HEADER_VISUALS[d.visual] ? HEADER_VISUALS[d.visual] : '';
  const hasImg = !!d.image?.src || !!art;
  return `<section class="page-head" aria-labelledby="page-title">
  <div class="wrap${hasImg ? '' : ' single'}">
    <div>
      ${ctx.crumbs}
      ${d.eyebrow ? `<span class="eyebrow" style="margin-top:18px">${esc(d.eyebrow)}</span>` : ''}
      <h1 id="page-title">${esc(title)}</h1>
      ${d.lead ? `<p class="lead">${esc(d.lead)}</p>` : ''}
      ${buttons(d)}
    </div>
    ${art || (hasImg ? `<figure class="ph-photo"><div class="ph-frame">${picture(d.image, '(max-width:860px) 92vw, 440px', { priority: true, small: 640, large: 1080 })}</div></figure>` : '')}
  </div>
</section>`;
}

function partners(d) {
  // many logos → compact chips (logo + name, the subtitle becomes a tooltip)
  const compact = (d.items || []).length > 8;
  const items = (d.items || []).map((p) => `<li class="partner${p.wide ? ' is-wide' : ''}"${compact && p.subtitle ? ` title="${esc(p.subtitle)}"` : ''}><div class="ico brand${p.wide ? ' wide' : ''}">${p.logo ? `<img src="${esc(p.logo)}" alt="${esc(p.name)} logo" width="${p.wide ? 84 : 32}" height="${p.wide ? 37 : 32}" loading="lazy" decoding="async">` : esc((p.name || '?')[0])}</div><div><strong>${esc(p.name)}</strong>${p.subtitle ? `<small>${esc(p.subtitle)}</small>` : ''}</div></li>`).join('');
  const more = d.more_text ? `<li class="partner more"><span>${esc(d.more_text)}</span></li>` : '';
  return `<section class="partners" aria-labelledby="works-with">
  <div class="wrap">
    <h2 id="works-with">${esc(d.heading || 'Works with')}</h2>
    <ul class="partner-row${compact ? ' compact' : ''}">${items}${more}</ul>
  </div>
</section>`;
}

function services(d, i) {
  const id = sid(d, i, 'services');
  const values = (d.values || []).length
    ? `<ul class="values reveal">${d.values.map((v) => `<li>${VALUE_ICONS[v.icon] || VALUE_ICONS.tech}<div><b>${esc(v.title)}</b><span>${esc(v.text)}</span></div></li>`).join('')}</ul>`
    : '';
  const cards = (d.items || []).map((s) => `<article class="svc${s.image?.src ? ' has-ph' : ''} reveal" style="--accent:${acc(s.accent)}">
        ${s.image?.src ? `<figure class="svc-ph">${picture({ ...s.image, alt: s.image.alt || '' }, '(max-width:560px) 92vw, (max-width:1080px) 46vw, 280px', { small: 640, large: 1080 })}</figure>` : ''}
        <div class="si" aria-hidden="true">${SERVICE_ICONS[s.icon] || SERVICE_ICONS.web}</div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
        <ul>${lines(s.bullets).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
        ${s.link_label ? `<a${linkAttrs(s.link_url || '#contact')}${s.form_service ? ` data-service="${esc(s.form_service)}"` : ''}>${esc(s.link_label)}</a>` : ''}
      </article>`).join('\n      ');
  return `<section${secAttrs(d, id)}>
  <div class="wrap">
    ${sectionHead(d, id)}
    ${values}
    <div class="svc-grid">
      ${cards}
    </div>
    ${buttons(d, 'svc-cta reveal')}
    ${moreLink(d)}
  </div>
</section>`;
}

const VISUALS = {
  sync: `<div class="visual" aria-hidden="true"><div class="vrow"><span class="k">Customers</span><span class="chip ok">Real-time</span></div><div class="vrow"><span class="k">Products</span><span class="chip ok">Real-time</span></div><div class="vrow"><span class="k">Stock levels</span><span class="chip ok">Real-time</span></div><div class="vrow"><span class="k">Orders → Deals</span><span class="chip ok">Real-time</span></div><div class="vrow"><span class="k">CSV exports needed</span><span class="chip bad">0</span></div></div>`,
  seo: `<div class="visual" aria-hidden="true"><div class="stat-grid"><div class="stat"><b>22</b><small>checks</small></div><div class="stat"><b>0–100</b><small>health score</small></div><div class="stat"><b>∞</b><small>products</small></div></div><div class="vrow"><span class="k">Meta description empty</span><span class="chip bad">148</span></div><div class="vrow"><span class="k">Thin description</span><span class="chip warn">63</span></div><div class="diff"><div class="old"><b>Before</b>Blue shirt.</div><div class="new"><b>After · AI</b>Breathable cotton oxford shirt in sky blue, relaxed fit…</div></div></div>`,
  middleware: `<div class="visual" aria-hidden="true">
<pre class="code"><span class="c"># List bookings from Zoho Creator</span>
curl -H <span class="s">"x-api-key: zmk_••••"</span> \\
  <span class="s">".../api/m/bookings/records?limit=2"</span>

{
  <span class="k">"ok"</span>: <span class="n">true</span>,
  <span class="k">"data"</span>: [{ <span class="k">"Customer"</span>: <span class="s">"Linh Tran"</span>,
             <span class="k">"Booking_Date"</span>: <span class="s">"2026-10-01"</span> }],
  <span class="k">"next"</span>: <span class="s">"MjAw"</span>
}</pre>
<div class="price-row"><div class="price"><b>$0</b><small>Free · Zoho CRM</small></div><div class="price hl"><b>$4.99<small style="font-size:13px">/mo</small></b><small>All services · unlimited</small></div></div></div>`,
};

function products(d, i) {
  const id = sid(d, i, 'apps');
  const items = (d.items || []).map((p, n) => {
    const pid = (p.anchor || `${id}-${n + 1}`).replace(/[^a-zA-Z0-9_-]/g, '');
    const visual = p.visual === 'image'
      ? (p.image?.src ? `<figure class="visual-img">${picture(p.image, '(max-width:900px) 92vw, 520px', { small: 600, large: 1000 })}</figure>` : '')
      : VISUALS[p.visual] || '';
    const ext = (b) => (b?.url && /^https?:/i.test(b.url) ? ` aria-label="${esc(b.label)} (opens in a new tab)"` : '');
    const btn = (b, cls) => (!b?.label ? '' : !b.url ? `<span class="btn btn-disabled">${esc(b.label)}</span>` : `<a${linkAttrs(b.url)} class="btn ${cls}"${cls === 'btn-primary' ? ext(b) : ''}>${esc(b.label)}</a>`);
    return `<article class="app${n % 2 ? ' rev' : ''} reveal" id="${pid}" style="--accent:${acc(p.accent)}" aria-labelledby="${pid}-title">
        <div class="app-body">
          <span class="app-tag"><span class="n">${String(n + 1).padStart(2, '0')}</span>${esc(p.tag || '')}</span>
          <h3 id="${pid}-title">${esc(p.title)}</h3>
          <p>${esc(p.text)}</p>
          <ul class="checks">${lines(p.checks).map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
          <div class="app-cta">${btn(p.primary, 'btn-primary')}${btn(p.secondary, 'btn-ghost')}</div>
        </div>
        ${visual}
      </article>`;
  }).join('\n      ');
  return `<section${secAttrs(d, id)}>
  <div class="wrap">
    ${sectionHead(d, id)}
    <div class="apps-grid">
      ${items}
    </div>
    ${moreLink(d)}
  </div>
</section>`;
}

function about(d, i) {
  const id = sid(d, i, 'about');
  return `<section${secAttrs(d, id, ' style="padding-top:0"')}>
  <div class="wrap about">
    ${d.image2?.src ? `<div class="about-img collage reveal">
      <div class="c-main">${picture(d.image, '(max-width:900px) 380px, 440px', { small: 560, large: 960 })}</div>
      <div class="c-sub">${picture(d.image2, '(max-width:900px) 200px, 240px', { small: 360, large: 640 })}</div>
      ${d.badge_title ? `<div class="c-badge"><i aria-hidden="true">✓</i><span><b>${esc(d.badge_title)}</b>${d.badge_text ? `<small>${esc(d.badge_text)}</small>` : ''}</span></div>` : ''}
    </div>` : `<div class="about-img reveal">${picture(d.image, '(max-width:900px) 440px, 520px', { small: 620, large: 1040 })}</div>`}
    <div class="reveal">
      ${d.eyebrow ? `<span class="eyebrow">${esc(d.eyebrow)}</span>` : ''}
      ${d.heading ? `<h2 id="${id}-title">${esc(d.heading)}</h2>` : ''}
      ${d.lead ? `<p class="lead">${esc(d.lead)}</p>` : ''}
      <ul class="pillars">${(d.pillars || []).map((p) => `<li><strong>${esc(p.title)}</strong><span>${esc(p.text)}</span></li>`).join('')}</ul>
      ${d.more?.label && d.more?.url ? `<div style="margin-top:24px"><a${linkAttrs(d.more.url)} class="btn btn-ghost">${esc(d.more.label)}</a></div>` : ''}
    </div>
  </div>
</section>`;
}

function steps(d, i) {
  const id = sid(d, i, 'how');
  return `<section${secAttrs(d, id, ' style="padding-top:0"')}>
  <div class="wrap">
    ${sectionHead(d, id, true, true)}
    <ol class="steps"${(d.items || []).length === 4 ? ' style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))"' : ''}>${(d.items || []).map((s, n) => `<li class="step reveal"><div class="num">STEP ${String(n + 1).padStart(2, '0')}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ol>
    ${moreLink(d)}
  </div>
</section>`;
}

function cards(d, i) {
  const id = sid(d, i);
  return `<section${secAttrs(d, id)}>
  <div class="wrap">
    ${sectionHead(d, id)}
    <ul class="cards-grid" style="--cols:${Number(d.columns) || 3}">${(d.items || []).map((c) => `<li class="reveal"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p>${c.url ? `<a${linkAttrs(c.url)}>Learn more →</a>` : ''}</li>`).join('')}</ul>
    ${moreLink(d)}
  </div>
</section>`;
}

function carousel(d, i) {
  const id = sid(d, i, 'reviews');
  const slides = d.slides || [];
  return `<section${secAttrs(d, id, ' class="reviews"')}>
  <div class="wrap">
    <div class="car-head reveal">
      <div>
        ${d.eyebrow ? `<span class="eyebrow">${esc(d.eyebrow)}</span>` : ''}
        ${d.heading ? `<h2 id="${id}-title">${esc(d.heading)}</h2>` : ''}
      </div>
      <div class="car-nav"><button class="car-btn" data-dir="-1" aria-label="Previous slide">←</button><button class="car-btn" data-dir="1" aria-label="Next slide">→</button></div>
    </div>
    <div class="carousel reveal" aria-roledescription="carousel" aria-label="${esc(d.heading || 'Highlights')}">
      <div class="track" tabindex="0" aria-label="Slides">
      ${slides.map((s, n) => `<div class="slide" role="group" aria-roledescription="slide" aria-label="${n + 1} of ${slides.length}"><article class="quote"><span class="app-badge" style="background:rgba(${BADGE_RGB[s.accent] || BADGE_RGB.cyan},.14);color:${acc(s.accent)}">${esc(s.badge)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article></div>`).join('\n      ')}
      </div>
      <div class="dots" role="tablist" aria-label="Choose slide"></div>
    </div>
    ${d.cta?.title ? `<div class="rating-bar reveal"><a class="rating"${linkAttrs(d.cta.url)}><b aria-hidden="true">★</b><div><strong style="font-size:15px">${esc(d.cta.title)}</strong><small>${esc(d.cta.text || '')}</small></div></a></div>` : ''}
    ${moreLink(d)}
  </div>
</section>`;
}

function faq(d, i) {
  const id = sid(d, i, 'faq');
  return `<section${secAttrs(d, id)}>
  <div class="wrap">
    ${sectionHead(d, id, true, false)}
    <div class="faq">
      ${(d.items || []).map((f, n) => `<details${n === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><p>${mdInline(f.a)}</p></details>`).join('\n      ')}
    </div>
    ${moreLink(d)}
  </div>
</section>`;
}

function richtext(d, i) {
  const id = d.anchor ? ` id="${sid(d, i)}"` : '';
  return `<section${id} class="rt"><div class="wrap"><div class="prose-wrap"><div class="prose">${md(d.body)}</div></div></div></section>`;
}

function image(d) {
  if (!d.image?.src) return '';
  return `<section style="padding-top:0"><div class="wrap"><figure class="figure reveal">${picture(d.image, '(max-width:1000px) 92vw, 980px', { small: 1000, large: 1600 })}${d.caption ? `<figcaption>${esc(d.caption)}</figcaption>` : ''}</figure></div></section>`;
}

function cta(d, i) {
  const id = d.anchor ? ` id="${sid(d, i)}"` : '';
  return `<section${id}><div class="wrap"><div class="cta-band reveal">${d.heading ? `<h2>${esc(d.heading)}</h2>` : ''}${d.text ? `<p class="lead" style="margin:0 auto">${esc(d.text)}</p>` : ''}<div style="margin-top:26px">${buttons(d)}</div></div></div></section>`;
}

function contact(d, i, ctx) {
  const id = sid(d, i, 'contact');
  const email = d.email || ctx.settings.site?.contact_email || '';
  const opts = (arr, first, sel = '') => `<option value="">${first}</option>${lines(arr).map((o) => `<option${o === sel ? ' selected' : ''}>${esc(o)}</option>`).join('')}`;
  return `<section${secAttrs(d, id, ' style="padding-top:0"')}>
  <div class="wrap">
    <div class="contact-box reveal">
      <div class="contact-info">
        ${d.eyebrow ? `<span class="eyebrow">${esc(d.eyebrow)}</span>` : ''}
        ${d.heading ? `<h2 id="${id}-title">${esc(d.heading)}</h2>` : ''}
        ${d.lead ? `<p class="lead">${esc(d.lead)}</p>` : ''}
        <ol class="next">${(d.steps || []).map((s, n) => `<li><b>${n + 1}</b><div><strong>${esc(s.title)}</strong><span>${esc(s.text)}</span></div></li>`).join('')}</ol>
        ${email ? `<a class="mail" href="mailto:${esc(email)}?subject=New%20project%20enquiry"><span class="mi" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg></span><span class="mt"><small>Prefer email?</small>${esc(email)}</span></a>` : ''}
      </div>
      <form class="cform" id="contact-form" action="/api/contact" method="post" novalidate>
        <div class="field"><label for="cf-name">Name <i aria-hidden="true">*</i></label><input id="cf-name" name="name" type="text" autocomplete="name" required minlength="2" maxlength="100" placeholder="Jane Nguyen" aria-describedby="cf-name-err"><span class="err" id="cf-name-err" role="alert"></span></div>
        <div class="field"><label for="cf-email">Work email <i aria-hidden="true">*</i></label><input id="cf-email" name="email" type="email" autocomplete="email" inputmode="email" required maxlength="200" placeholder="jane@company.com" aria-describedby="cf-email-err"><span class="err" id="cf-email-err" role="alert"></span></div>
        <div class="field"><label for="cf-company">Company <small>(optional)</small></label><input id="cf-company" name="company" type="text" autocomplete="organization" maxlength="150" placeholder="Company name"></div>
        <div class="field"><label for="cf-budget">Budget <small>(optional)</small></label><select id="cf-budget" name="budget">${opts(d.budgets, 'Select a range')}</select></div>
        <div class="field full"><label for="cf-service">What do you need help with? <i aria-hidden="true">*</i></label><select id="cf-service" name="service" required aria-describedby="cf-service-err">${opts(d.services, 'Choose a service', d.preselect)}</select><span class="err" id="cf-service-err" role="alert"></span></div>
        <div class="field full"><label for="cf-message">Tell us about your project <i aria-hidden="true">*</i></label><textarea id="cf-message" name="message" required minlength="10" maxlength="5000" placeholder="What are you building, and what would success look like?" aria-describedby="cf-message-err"></textarea><span class="err" id="cf-message-err" role="alert"></span></div>
        <div class="hp" aria-hidden="true"><label for="cf-website">Leave this field empty</label><input id="cf-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
        <input type="hidden" name="t" value="">
        <div class="form-status" role="status" aria-live="polite"></div>
        <div class="form-foot"><p>${esc(d.note || '')}</p><button class="btn btn-primary submit" type="submit"><span class="spin" aria-hidden="true"></span><span class="lbl">${esc(d.button || 'Send message')}</span></button></div>
      </form>
    </div>
  </div>
</section>`;
}

function split(d, i) {
  const id = sid(d, i);
  const checks = lines(d.checklist);
  const aside = d.aside_title || lines(d.aside_items).length
    ? `<aside class="split-aside reveal">${d.aside_title ? `<h3>${esc(d.aside_title)}</h3>` : ''}<ul>${lines(d.aside_items).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></aside>`
    : '';
  return `<section${secAttrs(d, id)}>
  <div class="wrap split${d.reverse ? ' rev' : ''}${aside ? '' : ' solo'}">
    <div class="reveal">
      ${d.eyebrow ? `<span class="eyebrow">${esc(d.eyebrow)}</span>` : ''}
      ${d.heading ? `<h2 id="${id}-title">${esc(d.heading)}</h2>` : ''}
      ${d.body ? `<div class="prose">${md(d.body)}</div>` : ''}
      ${checks.length ? `<ul class="checks split-checks" style="--accent:var(--cyan)">${checks.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
    </div>
    ${aside}
  </div>
</section>`;
}

function tags(d, i) {
  const id = sid(d, i);
  return `<section${secAttrs(d, id)}>
  <div class="wrap">
    ${sectionHead(d, id)}
    <div class="tag-groups">${(d.groups || []).map((g) => `<div class="tag-group reveal"><h3>${esc(g.title)}</h3><ul>${lines(g.items).map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`).join('')}</div>
  </div>
</section>`;
}

// Blog card, shared by the "Latest posts" block and the /blog index.
// Covers from public/assets/photos (…-1200.webp) also have a 640px copy: let the browser pick the smaller one.
export function postCard(p, { heading = 'h2' } = {}) {
  const c = p.cover_image || '';
  const set = /^\/assets\/photos\/[a-z0-9-]+-1200\.webp$/.test(c)
    ? ` srcset="${esc(c.replace(/-1200\.webp$/, '-640.webp'))} 640w, ${esc(c)} 1200w" sizes="(max-width:700px) 92vw, 380px"` : '';
  return `<li><a class="post-card" href="${pathFor(p)}">${c ? `<div class="pc-img"><img src="${esc(c)}"${set} width="1200" height="675" alt="" loading="lazy" decoding="async"></div>` : ''}<div class="pc"><span class="post-meta">${fmtDate(p.published_at || p.updated_at)}</span><${heading}>${esc(p.title)}</${heading}>${p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ''}</div></a></li>`;
}

function posts(d, i, ctx) {
  const list = (ctx.posts || []).slice(0, Math.min(Math.max(Number(d.count) || 3, 1), 9));
  if (!list.length) return '';
  const id = sid(d, i, 'blog');
  return `<section${secAttrs(d, id)}>
  <div class="wrap">
    ${sectionHead(d, id)}
    <ul class="post-grid reveal">${list.map((p) => postCard(p, { heading: 'h3' })).join('')}</ul>
    ${moreLink(d)}
  </div>
</section>`;
}

const RENDERERS = { posts, split, tags, hero, page_header: pageHeader, partners, services, products, about, steps, cards, carousel, faq, richtext, image, cta, contact };

export function renderBlocks(blocks = [], ctx) {
  const visible = blocks.filter((b) => b && RENDERERS[b.type] && !b.hidden);
  return visible
    .map((b, i) => {
      ctx.prev = i ? visible[i - 1].type : ctx.page?.type === 'home' ? 'hero' : 'page_header';
      try { return RENDERERS[b.type](b.data || {}, i, ctx).replace(ctx.prev === 'page_header' ? ' style="padding-top:0"' : '\u0000', ''); }
      catch (e) { console.error('block render failed', b.type, e); return ''; }
    })
    .join('\n\n');
}
