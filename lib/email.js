// Email templates for the contact form.
// Table-based layout with inline styles so they render in Gmail, Outlook, Apple Mail and mobile clients.

let SITE = 'https://digitalexecutivepartner.app';
let LOGO = `${SITE}/assets/email-logo.png`;
let BRAND = 'Digital Executive Partner';
function useSite(site = {}) {
  SITE = (site.url || 'https://digitalexecutivepartner.app').replace(/\/+$/, '');
  LOGO = `${SITE}/assets/email-logo.png`;
  BRAND = site.name || 'Digital Executive Partner';
}
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const nl2br = (s) => esc(s).replace(/\r?\n/g, '<br>');

function layout({ preheader, eyebrow, title, intro, body, footerNote }) {
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${esc(title)}</title>
<!--[if mso]><style>table,td,div,p,a{font-family:Arial,sans-serif!important}</style><![endif]-->
<style>
  @media (max-width:620px){
    .container{width:100%!important}
    .px{padding-left:22px!important;padding-right:22px!important}
    .stack td{display:block!important;width:100%!important;box-sizing:border-box}
    .label{padding-bottom:2px!important}
    .stack td+td{border-top:0!important;padding-top:0!important}
    h1{font-size:24px!important;line-height:30px!important}
  }
  a{color:#0891b2}
</style>
</head>
<body style="margin:0;padding:0;background:#eef1f8;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef1f8;">
  <tr><td align="center" style="padding:32px 12px;">
    <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

      <!-- Header -->
      <tr><td style="background:#050818;background-image:linear-gradient(135deg,#071a33 0%,#0b0f2e 55%,#1d0b3a 100%);border-radius:16px 16px 0 0;padding:26px 32px;" class="px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="70" style="width:70px;"><img src="${LOGO}" width="56" height="56" alt="DEP" style="display:block;width:56px;height:56px;border:0;outline:none;border-radius:12px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#22d3ee;"></td>
          <td style="font-family:${FONT};font-size:16px;font-weight:700;color:#ffffff;letter-spacing:-.2px;">Digital Executive <span style="color:#22d3ee;">Partner</span></td>
        </tr></table>
      </td></tr>
      <tr><td height="4" style="height:4px;line-height:4px;font-size:0;background:#22d3ee;background-image:linear-gradient(90deg,#22d3ee,#a855f7);">&nbsp;</td></tr>

      <!-- Body -->
      <tr><td class="px" style="background:#ffffff;padding:36px 40px 12px;">
        <p style="margin:0 0 10px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#0891b2;">${esc(eyebrow)}</p>
        <h1 style="margin:0 0 14px;font-family:${FONT};font-size:28px;line-height:34px;font-weight:800;color:#0b1024;letter-spacing:-.4px;">${esc(title)}</h1>
        <p style="margin:0 0 26px;font-family:${FONT};font-size:16px;line-height:25px;color:#4a5578;">${intro}</p>
        ${body}
      </td></tr>

      <!-- Footer -->
      <tr><td class="px" style="background:#ffffff;border-radius:0 0 16px 16px;padding:8px 40px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #e6e9f2;padding-top:20px;font-family:${FONT};font-size:12px;line-height:19px;color:#8a93b0;">
          <p style="margin:0 0 6px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#5b6588;">Modern technology &nbsp;·&nbsp; Flexible solutions &nbsp;·&nbsp; Long-term partnership</p>
          <p style="margin:0;">${footerNote}</p>
        </td></tr></table>
      </td></tr>

      <tr><td align="center" style="padding:18px 12px 0;font-family:${FONT};font-size:12px;line-height:18px;color:#8a93b0;">
        © ${new Date().getUTCFullYear()} ${BRAND} &nbsp;·&nbsp; <a href="${SITE}" style="color:#5b6588;text-decoration:underline;">${esc(SITE.replace(/^https?:\/\//, ''))}</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function detailsTable(rows) {
  const tr = rows
    .filter(([, v]) => v)
    .map(
      ([k, v], i) => `<tr class="stack">
        <td class="label" width="130" valign="top" style="width:130px;padding:12px 16px;${i ? 'border-top:1px solid #e6e9f2;' : ''}font-family:${FONT};font-size:13px;font-weight:600;color:#7a84a6;">${esc(k)}</td>
        <td valign="top" style="padding:12px 16px;${i ? 'border-top:1px solid #e6e9f2;' : ''}font-family:${FONT};font-size:15px;line-height:22px;color:#0b1024;">${v}</td>
      </tr>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e6e9f2;border-radius:12px;border-collapse:separate;background:#fafbfe;margin:0 0 22px;">${tr}</table>`;
}

const pill = (t) =>
  `<span style="display:inline-block;padding:4px 12px;border-radius:999px;background:#e0f7fb;color:#0e7490;font-size:13px;font-weight:700;">${esc(t)}</span>`;

function messageBlock(label, message) {
  return `<p style="margin:0 0 8px;font-family:${FONT};font-size:13px;font-weight:600;color:#7a84a6;">${esc(label)}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px;"><tr>
    <td width="4" style="width:4px;background:#22d3ee;background-image:linear-gradient(180deg,#22d3ee,#a855f7);border-radius:4px;">&nbsp;</td>
    <td style="padding:16px 18px;background:#f4f6fc;border-radius:0 12px 12px 0;font-family:${FONT};font-size:15px;line-height:24px;color:#1d2442;">${nl2br(message)}</td>
  </tr></table>`;
}

function button(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;"><tr>
    <td style="border-radius:12px;background:#0e9ab5;background-image:linear-gradient(135deg,#0e9ab5,#7c3aed);">
      <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${href}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="25%" stroke="f" fillcolor="#0e9ab5"><center style="color:#ffffff;font-family:Arial;font-size:15px;font-weight:bold;">${esc(label)}</center></v:roundrect><![endif]-->
      <!--[if !mso]><!--><a href="${href}" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">${esc(label)}</a><!--<![endif]-->
    </td></tr></table>`;
}

/* ---------- Editable text (Settings → Email templates) ---------- */
export const DEFAULT_TEMPLATES = {
  owner: {
    subject: 'New enquiry: {{service}} — {{name}}',
    eyebrow: 'New website enquiry',
    heading: '{{name}} wants to talk about {{service}}',
    intro: 'A new message just came in through the contact form on {{site_name}}. Reply to this email to answer {{first_name}} directly.',
    button: 'Reply to {{first_name}}',
    footer: 'This notification was sent automatically by your website.',
  },
  customer: {
    subject: 'We received your message — {{site_name}}',
    preheader: 'Thanks, {{first_name}}! We received your message about {{service}} and will reply as soon as possible.',
    eyebrow: 'Message received',
    heading: 'Thanks for reaching out, {{first_name}}!',
    intro: "We've received your message about {{service}}. Here's what happens next.",
    steps: [
      { title: 'We review your message', text: 'A member of our team reads every enquiry personally.' },
      { title: 'We’ll get back to you as soon as possible', text: 'With questions, ideas or a time for a short call.' },
      { title: 'We plan the next steps together', text: 'Scope, timeline and the right solution for your goals.' },
    ],
    show_message: true,
    products_title: 'While you wait',
    products: [
      { name: 'ZohoSync', text: 'Shopify and Zoho CRM, always in sync', url: 'https://zohosync.digitalexecutivepartner.app/' },
      { name: 'Lookfit AI', text: '“Complete The Look” bundles for Shopify', url: 'https://lookfit.digitalexecutivepartner.app/' },
      { name: 'SEO Products', text: 'Find and fix catalog SEO in bulk', url: 'https://apps.shopify.com/seo-products-with-epdigital' },
      { name: 'Zoho Middleware', text: 'One secure REST API for Zoho', url: 'https://zoho.digitalexecutivepartner.app/' },
    ],
    closing: 'Need to add something? Just reply to this email.',
    signature: 'The {{site_name}} team',
    footer: "You're receiving this email because you contacted us through our website. If that wasn't you, you can ignore this message.",
  },
};

const merge = (def, t) => {
  const o = { ...def };
  for (const [k, v] of Object.entries(t || {})) if (v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && !v.length)) o[k] = v;
  return o;
};
const vars = (d, site) => ({
  name: d.name, first_name: String(d.name || '').split(' ')[0], email: d.email, company: d.company || '',
  service: d.service, budget: d.budget || '', site_name: site?.name || BRAND, site_url: SITE,
});
const fill = (s, v) => String(s ?? '').replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, k) => (k in v ? String(v[k] ?? '') : m));
const fillHtml = (s, v) => nl2br(fill(s, v));

/* ---------- 1. Notification to the team ---------- */
export function ownerEmail(d, meta, templates = {}, site = {}) {
  useSite(site);
  const t = merge(DEFAULT_TEMPLATES.owner, templates.owner);
  const v = vars(d, site);
  const replyHref = `mailto:${encodeURIComponent(d.email)}?subject=${encodeURIComponent(`Re: Your ${d.service} enquiry`)}`;
  const html = layout({
    preheader: `${d.name} sent an enquiry about ${d.service}.`,
    eyebrow: fill(t.eyebrow, v),
    title: fill(t.heading, v),
    intro: fillHtml(t.intro, v),
    body:
      detailsTable([
        ['Name', esc(d.name)],
        ['Email', `<a href="mailto:${esc(d.email)}" style="color:#0891b2;text-decoration:none;font-weight:600;">${esc(d.email)}</a>`],
        ['Company', esc(d.company)],
        ['Service', pill(d.service)],
        ['Budget', esc(d.budget)],
      ]) +
      messageBlock('Message', d.message) +
      button(replyHref, fill(t.button, v)),
    footerNote: `Received ${esc(meta.time)}${meta.country ? ` · from ${esc(meta.country)}` : ''}${meta.ip ? ` · IP ${esc(meta.ip)}` : ''}. ${fillHtml(t.footer, v)}`,
  });
  const text = [
    fill(t.heading, v), '',
    `Name:    ${d.name}`, `Email:   ${d.email}`,
    ...(d.company ? [`Company: ${d.company}`] : []),
    `Service: ${d.service}`,
    ...(d.budget ? [`Budget:  ${d.budget}`] : []),
    '', 'Message:', d.message, '', `Received ${meta.time}${meta.country ? ` from ${meta.country}` : ''}.`,
  ].join('\n');
  return { subject: fill(t.subject, v), html, text };
}

/* ---------- 2. Confirmation to the customer ---------- */
export function customerEmail(d, contactEmail, templates = {}, site = {}) {
  useSite(site);
  const t = merge(DEFAULT_TEMPLATES.customer, templates.customer);
  const v = vars(d, site);
  const productRows = (t.products || []).filter((p) => p.name).map(
    (p, i) => `<tr><td style="padding:12px 0;${i ? 'border-top:1px solid #e6e9f2;' : ''}">
        <a href="${esc(p.url || SITE)}" style="font-family:${FONT};font-size:15px;font-weight:700;color:#0b1024;text-decoration:none;">${esc(p.name)} <span style="color:#0891b2;">→</span></a>
        <div style="font-family:${FONT};font-size:13px;line-height:19px;color:#7a84a6;">${esc(p.text || '')}</div>
      </td></tr>`
  ).join('');
  const steps = (t.steps || []).filter((s) => s.title).map(
    (s, n) => `<tr>
        <td width="40" valign="top" style="width:40px;padding:0 0 16px;">
          <div style="width:28px;height:28px;line-height:28px;border-radius:999px;background:#ecfeff;color:#0e7490;text-align:center;font-family:${FONT};font-size:13px;font-weight:800;">${n + 1}</div>
        </td>
        <td valign="top" style="padding:3px 0 16px;font-family:${FONT};">
          <div style="font-size:15px;font-weight:700;color:#0b1024;">${esc(fill(s.title, v))}</div>
          <div style="font-size:14px;line-height:21px;color:#5b6588;">${esc(fill(s.text, v))}</div>
        </td></tr>`
  ).join('');
  const section = (title) => `<p style="margin:0 0 12px;font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#7a84a6;">${esc(title)}</p>`;

  const html = layout({
    preheader: fill(t.preheader, v),
    eyebrow: fill(t.eyebrow, v),
    title: fill(t.heading, v),
    intro: fillHtml(t.intro, v).replace(esc(d.service), `<strong style="color:#0b1024;">${esc(d.service)}</strong>`),
    body:
      (steps ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;">${steps}</table>` : '') +
      (t.show_message !== false
        ? section('Your message') + detailsTable([['Service', pill(d.service)], ['Company', esc(d.company)], ['Budget', esc(d.budget)]]) + messageBlock('Message', d.message)
        : '') +
      (productRows ? section(fill(t.products_title, v)) + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px;">${productRows}</table>` : '') +
      `<p style="margin:0 0 4px;font-family:${FONT};font-size:15px;line-height:24px;color:#1d2442;">${fillHtml(t.closing, v)}</p>
       <p style="margin:0 0 28px;font-family:${FONT};font-size:15px;line-height:24px;color:#1d2442;">Best regards,<br><strong>${esc(fill(t.signature, v))}</strong></p>`,
    footerNote: `${fillHtml(t.footer, v)}${contactEmail ? ` Questions? <a href="mailto:${esc(contactEmail)}" style="color:#5b6588;">${esc(contactEmail)}</a>.` : ''}`,
  });

  const text = [
    fill(t.heading, v), '', fill(t.intro, v), '',
    ...(t.steps || []).filter((s) => s.title).map((s, n) => `${n + 1}. ${fill(s.title, v)} — ${fill(s.text, v)}`), '',
    ...(t.show_message !== false ? ['Your message:', d.message, ''] : []),
    ...((t.products || []).length ? [fill(t.products_title, v) + ':', ...t.products.filter((p) => p.name).map((p) => `- ${p.name}: ${p.text || ''} — ${p.url || ''}`), ''] : []),
    fill(t.closing, v), '', 'Best regards,', fill(t.signature, v), SITE,
  ].join('\n');

  return { subject: fill(t.subject, v), html, text };
}

export const SAMPLE_ENQUIRY = {
  name: 'Jane Nguyen', email: 'jane@company.com', company: 'Acme Retail', service: 'Zoho Consulting & Implementation', budget: '$5,000 – $15,000',
  message: 'Hi team,\nWe want to move our sales pipeline into Zoho CRM and connect it to our Shopify store. Can you help?',
};
