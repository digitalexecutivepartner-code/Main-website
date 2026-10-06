// Content model shared by the public renderer and the admin editor.
// Field types: text, textarea, markdown, url, image, select, boolean, lines, group, list

export const ACCENTS = ['cyan', 'sync', 'look', 'seo', 'mw', 'violet'];
const accent = { key: 'accent', type: 'select', label: 'Accent colour', options: ACCENTS };
const btn = (key, label) => ({
  key, type: 'group', label,
  fields: [
    { key: 'label', type: 'text', label: 'Label' },
    { key: 'url', type: 'url', label: 'Link (leave empty to show as disabled)' },
  ],
});
const img = (key = 'image', label = 'Image') => ({
  key, type: 'group', label,
  fields: [
    { key: 'src', type: 'image', label: 'Image URL' },
    { key: 'src_large', type: 'image', label: 'Large version for high-res screens (optional)' },
    { key: 'alt', type: 'text', label: 'Alt text (describe the image for Google & screen readers)' },
  ],
});
const more = btn('more', 'Link to the full page (optional, e.g. “Explore all products” → /products)');
const head = [
  { key: 'anchor', type: 'text', label: 'Section ID (for links like /#services)' },
  { key: 'eyebrow', type: 'text', label: 'Eyebrow' },
  { key: 'heading', type: 'text', label: 'Heading (H2)' },
];

export const BLOCKS = {
  hero: {
    label: 'Hero banner', summary: 'title',
    fields: [
      { key: 'badge', type: 'text', label: 'Badge' },
      { key: 'pill', type: 'text', label: 'Pill text' },
      { key: 'title', type: 'text', label: 'Heading (H1)' },
      { key: 'highlight', type: 'text', label: 'Highlighted end of heading (gradient)' },
      { key: 'lead', type: 'textarea', label: 'Intro' },
      btn('primary', 'Primary button'),
      btn('secondary', 'Secondary button'),
      { key: 'bullets', type: 'lines', label: 'Bullets (one per line)' },
      img('image', 'Banner image'),
      { key: 'show_cards', type: 'boolean', label: 'Show the three product preview cards under the banner' },
    ],
  },
  page_header: {
    label: 'Page header', summary: 'title',
    fields: [
      { key: 'eyebrow', type: 'text', label: 'Eyebrow' },
      { key: 'title', type: 'text', label: 'Heading (H1) — defaults to the page title' },
      { key: 'lead', type: 'textarea', label: 'Intro' },
      btn('primary', 'Primary button'),
      btn('secondary', 'Secondary button'),
      img('image', 'Image (optional)'),
      { key: 'visual', type: 'select', label: 'Illustration (used when there is no image)', options: ['none', 'web', 'shop', 'zoho', 'ai', 'services'] },
    ],
  },
  partners: {
    label: 'Works with (logos)', summary: 'heading',
    fields: [
      { key: 'heading', type: 'text', label: 'Heading' },
      { key: 'items', type: 'list', label: 'Partners', item: 'name', fields: [
        { key: 'name', type: 'text', label: 'Name' },
        { key: 'subtitle', type: 'text', label: 'Subtitle' },
        { key: 'logo', type: 'image', label: 'Logo URL' },
        { key: 'wide', type: 'boolean', label: 'Wide logo' },
      ] },
      { key: 'more_text', type: 'text', label: 'Last tile text (optional, e.g. "and more")' },
    ],
  },
  services: {
    label: 'Services grid', summary: 'heading',
    fields: [
      ...head,
      { key: 'lead', type: 'textarea', label: 'Intro' },
      { key: 'values', type: 'list', label: 'Values row', item: 'title', fields: [
        { key: 'icon', type: 'select', label: 'Icon', options: ['tech', 'flex', 'part'] },
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'text', type: 'text', label: 'Text' },
      ] },
      { key: 'items', type: 'list', label: 'Services', item: 'title', fields: [
        { key: 'icon', type: 'select', label: 'Icon', options: ['web', 'shop', 'zoho', 'ai'] },
        accent,
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'text', type: 'textarea', label: 'Description' },
        { key: 'bullets', type: 'lines', label: 'Bullets (one per line)' },
        { key: 'link_label', type: 'text', label: 'Link label' },
        { key: 'link_url', type: 'url', label: 'Link URL (e.g. #contact or /services/zoho)' },
        { key: 'form_service', type: 'text', label: 'Pre-select this service in the contact form' },
        img('image', 'Photo on top of the card (optional)'),
      ] },
      btn('primary', 'Primary button'),
      btn('secondary', 'Secondary button'),
      more,
    ],
  },
  products: {
    label: 'Products', summary: 'heading',
    fields: [
      ...head,
      { key: 'lead', type: 'textarea', label: 'Intro' },
      { key: 'items', type: 'list', label: 'Products', item: 'title', fields: [
        { key: 'anchor', type: 'text', label: 'Product ID (anchor)' },
        accent,
        { key: 'tag', type: 'text', label: 'Tag line (e.g. "ZohoSync · Shopify Zoho CRM integration")' },
        { key: 'title', type: 'text', label: 'Title (H3)' },
        { key: 'text', type: 'textarea', label: 'Description' },
        { key: 'checks', type: 'lines', label: 'Checklist (one per line)' },
        btn('primary', 'Primary button'),
        btn('secondary', 'Secondary button'),
        { key: 'visual', type: 'select', label: 'Visual', options: ['image', 'sync', 'seo', 'middleware', 'none'] },
        img('image', 'Image (when Visual = image)'),
        { key: 'schema_name', type: 'text', label: 'SEO: product name (structured data)' },
        { key: 'schema_url', type: 'url', label: 'SEO: product URL' },
        { key: 'schema_category', type: 'select', label: 'SEO: category', options: ['BusinessApplication', 'DeveloperApplication', 'WebApplication'] },
        { key: 'offers', type: 'lines', label: 'SEO: prices, one per line as "Plan | price | MONTH" (optional)' },
      ] },
      more,
    ],
  },
  about: {
    label: 'About (image + text)', summary: 'heading',
    fields: [
      ...head,
      { key: 'lead', type: 'textarea', label: 'Text' },
      img('image', 'Image (main photo)'),
      img('image2', 'Second photo (optional — shows a photo collage)'),
      { key: 'badge_title', type: 'text', label: 'Collage badge: title (optional)' },
      { key: 'badge_text', type: 'text', label: 'Collage badge: text' },
      { key: 'pillars', type: 'list', label: 'Highlights', item: 'title', fields: [
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'text', type: 'text', label: 'Text' },
      ] },
      more,
    ],
  },
  steps: {
    label: 'Steps', summary: 'heading',
    fields: [
      ...head,
      { key: 'lead', type: 'textarea', label: 'Intro (optional)' },
      { key: 'items', type: 'list', label: 'Steps', item: 'title', fields: [
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'text', type: 'textarea', label: 'Text' },
      ] },
      more,
    ],
  },
  cards: {
    label: 'Cards grid', summary: 'heading',
    fields: [
      ...head,
      { key: 'lead', type: 'textarea', label: 'Intro' },
      { key: 'columns', type: 'select', label: 'Columns', options: ['2', '3', '4'] },
      { key: 'items', type: 'list', label: 'Cards', item: 'title', fields: [
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'text', type: 'textarea', label: 'Text' },
        { key: 'url', type: 'url', label: 'Link (optional)' },
      ] },
      more,
    ],
  },
  carousel: {
    label: 'Carousel (why us)', summary: 'heading',
    fields: [
      ...head,
      { key: 'slides', type: 'list', label: 'Slides', item: 'title', fields: [
        { key: 'badge', type: 'text', label: 'Badge' },
        accent,
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'text', type: 'textarea', label: 'Text' },
      ] },
      { key: 'cta', type: 'group', label: 'Card under the carousel', fields: [
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'text', type: 'text', label: 'Text' },
        { key: 'url', type: 'url', label: 'Link' },
      ] },
      more,
    ],
  },
  faq: {
    label: 'FAQ', summary: 'heading',
    fields: [
      ...head,
      { key: 'items', type: 'list', label: 'Questions', item: 'q', fields: [
        { key: 'q', type: 'text', label: 'Question' },
        { key: 'a', type: 'markdown', label: 'Answer (Markdown links allowed)' },
      ] },
      more,
    ],
  },
  split: {
    label: 'Split: text + checklist', summary: 'heading',
    fields: [
      ...head,
      { key: 'body', type: 'markdown', label: 'Text (Markdown)' },
      { key: 'checklist', type: 'lines', label: 'Checklist (one per line)' },
      { key: 'aside_title', type: 'text', label: 'Side card title' },
      { key: 'aside_items', type: 'lines', label: 'Side card items (one per line)' },
      { key: 'reverse', type: 'boolean', label: 'Put the side card on the left' },
    ],
  },
  tags: {
    label: 'Tags (technologies)', summary: 'heading',
    fields: [
      ...head,
      { key: 'lead', type: 'textarea', label: 'Intro' },
      { key: 'groups', type: 'list', label: 'Groups', item: 'title', fields: [
        { key: 'title', type: 'text', label: 'Group title' },
        { key: 'items', type: 'lines', label: 'Tags (one per line)' },
      ] },
    ],
  },
  richtext: {
    label: 'Rich text (Markdown)', summary: 'body',
    fields: [
      { key: 'anchor', type: 'text', label: 'Section ID (optional)' },
      { key: 'body', type: 'markdown', label: 'Content (Markdown: ## headings, lists, links, images, tables)' },
    ],
  },
  image: {
    label: 'Image', summary: 'caption',
    fields: [img('image', 'Image'), { key: 'caption', type: 'text', label: 'Caption' }],
  },
  posts: {
    label: 'Latest blog posts', summary: 'heading',
    fields: [
      ...head,
      { key: 'lead', type: 'textarea', label: 'Intro (optional)' },
      { key: 'count', type: 'select', label: 'How many posts', options: ['3', '6', '9'] },
      more,
    ],
  },
  cta: {
    label: 'Call to action', summary: 'heading',
    fields: [
      { key: 'anchor', type: 'text', label: 'Section ID (optional)' },
      { key: 'heading', type: 'text', label: 'Heading' },
      { key: 'text', type: 'textarea', label: 'Text' },
      btn('primary', 'Primary button'),
      btn('secondary', 'Secondary button'),
    ],
  },
  contact: {
    label: 'Contact form', summary: 'heading',
    fields: [
      ...head,
      { key: 'lead', type: 'textarea', label: 'Intro' },
      { key: 'steps', type: 'list', label: 'Next steps', item: 'title', fields: [
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'text', type: 'text', label: 'Text' },
      ] },
      { key: 'email', type: 'text', label: 'Email shown next to the form' },
      { key: 'services', type: 'lines', label: 'Service options (must match the list the server accepts)' },
      { key: 'budgets', type: 'lines', label: 'Budget options' },
      { key: 'preselect', type: 'text', label: 'Pre-select this service (must match one of the options)' },
      { key: 'note', type: 'text', label: 'Privacy note' },
      { key: 'button', type: 'text', label: 'Button label' },
    ],
  },
};

export const SEO_FIELDS = [
  { key: 'title', type: 'text', label: 'Meta title', max: 60 },
  { key: 'description', type: 'textarea', label: 'Meta description', max: 160 },
  { key: 'keywords', type: 'text', label: 'Keywords (comma separated)' },
  { key: 'canonical', type: 'url', label: 'Canonical URL (leave empty for default)' },
  { key: 'og_title', type: 'text', label: 'Social share title' },
  { key: 'og_description', type: 'textarea', label: 'Social share description' },
  { key: 'og_image', type: 'image', label: 'Social share image (1200×630)' },
  { key: 'schema_type', type: 'select', label: 'Page type for Google', options: ['WebPage', 'AboutPage', 'ContactPage', 'Service', 'CollectionPage'] },
  { key: 'noindex', type: 'boolean', label: 'Hide from Google (noindex)' },
  { key: 'json_ld', type: 'markdown', label: 'Extra JSON-LD (advanced, optional)' },
];

const link = { type: 'list', item: 'label', fields: [
  { key: 'label', type: 'text', label: 'Label' },
  { key: 'url', type: 'url', label: 'Link' },
] };

export const SETTINGS_FIELDS = [
  { key: 'site', type: 'group', label: 'Site', fields: [
    { key: 'name', type: 'text', label: 'Site name' },
    { key: 'url', type: 'url', label: 'Site URL', hint: 'No trailing slash, e.g. https://digitalexecutivepartner.app' },
    { key: 'title_suffix', type: 'text', label: 'Title suffix', hint: 'Added after every page title, e.g. " | Digital Executive Partner"' },
    { key: 'default_og_image', type: 'image', label: 'Default social share image' },
    { key: 'theme_color', type: 'text', label: 'Theme colour' },
    { key: 'contact_email', type: 'text', label: 'Contact email' },
    { key: 'google_verification', type: 'text', label: 'Google Search Console code', hint: 'Optional' },
    { key: 'bing_verification', type: 'text', label: 'Bing verification code', hint: 'Optional' },
  ] },
  { key: 'header', type: 'group', label: 'Header', fields: [
    { key: 'nav', label: 'Menu links', ...link },
    { key: 'cta', type: 'group', label: 'Header button', fields: [
      { key: 'label', type: 'text', label: 'Label' },
      { key: 'url', type: 'url', label: 'Link' },
    ] },
  ] },
  { key: 'footer', type: 'group', label: 'Footer', fields: [
    { key: 'tagline', type: 'text', label: 'Tagline' },
    { key: 'columns', type: 'list', label: 'Columns', item: 'title', fields: [
      { key: 'title', type: 'text', label: 'Title' },
      { key: 'links', label: 'Links', ...link },
    ] },
    { key: 'copyright', type: 'text', label: 'Copyright line', hint: 'The year is added automatically', wide: true },
  ] },
  { key: 'org', type: 'group', label: 'Organization (structured data)', fields: [
    { key: 'name', type: 'text', label: 'Name' },
    { key: 'alternate_names', type: 'lines', label: 'Alternate names' },
    { key: 'slogan', type: 'text', label: 'Slogan' },
    { key: 'description', type: 'textarea', label: 'Description' },
    { key: 'logo', type: 'image', label: 'Logo (square, at least 512px)' },
    { key: 'same_as', type: 'lines', label: 'Official profiles', hint: 'LinkedIn, App Store… one per line' },
    { key: 'knows_about', type: 'lines', label: 'Expertise topics' },
    { key: 'languages', type: 'lines', label: 'Support languages' },
  ] },
  { key: 'email', type: 'group', label: 'Email sending', fields: [
    { key: 'to', type: 'lines', label: 'Send enquiries to', hint: 'One email per line', half: true },
    { key: 'cc', type: 'lines', label: 'CC', hint: 'Optional, one per line', half: true },
    { key: 'from_name', type: 'text', label: 'Sender name', hint: 'Shown in the inbox, e.g. Digital Executive Partner' },
    { key: 'from_email', type: 'text', label: 'Sender email', hint: 'The SMTP account, or an alias added in Gmail → “Send mail as”' },
    { key: 'smtp_host', type: 'text', label: 'SMTP host', hint: 'Gmail: smtp.gmail.com' },
    { key: 'smtp_port', type: 'select', label: 'SMTP port', options: ['465', '587'], hint: '465 = SSL (recommended), 587 = STARTTLS' },
    { key: 'smtp_user', type: 'text', label: 'SMTP username', hint: 'Usually your full email address, e.g. you@gmail.com' },
    { key: 'autoreply', type: 'boolean', label: 'Send a confirmation email to the customer' },
  ] },
  { key: 'email_templates', type: 'group', label: 'Email templates', fields: [
    { key: 'owner', type: 'group', label: 'Notification to your team', fields: [
      { key: 'subject', type: 'text', label: 'Subject' },
      { key: 'eyebrow', type: 'text', label: 'Eyebrow' },
      { key: 'heading', type: 'text', label: 'Heading' },
      { key: 'intro', type: 'textarea', label: 'Intro' },
      { key: 'button', type: 'text', label: 'Reply button label' },
      { key: 'footer', type: 'textarea', label: 'Footer note' },
    ] },
    { key: 'customer', type: 'group', label: 'Confirmation to the customer', fields: [
      { key: 'subject', type: 'text', label: 'Subject' },
      { key: 'preheader', type: 'text', label: 'Preview text (shown next to the subject in the inbox)' },
      { key: 'eyebrow', type: 'text', label: 'Eyebrow' },
      { key: 'heading', type: 'text', label: 'Heading' },
      { key: 'intro', type: 'textarea', label: 'Intro' },
      { key: 'steps', type: 'list', label: 'What happens next', item: 'title', fields: [
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'text', type: 'text', label: 'Text' },
      ] },
      { key: 'show_message', type: 'boolean', label: 'Include a copy of their message' },
      { key: 'products_title', type: 'text', label: 'Products heading' },
      { key: 'products', type: 'list', label: 'Products to show', item: 'name', fields: [
        { key: 'name', type: 'text', label: 'Name' },
        { key: 'text', type: 'text', label: 'Short description' },
        { key: 'url', type: 'url', label: 'Link' },
      ] },
      { key: 'closing', type: 'textarea', label: 'Closing text' },
      { key: 'signature', type: 'text', label: 'Signature' },
      { key: 'footer', type: 'textarea', label: 'Footer note' },
    ] },
  ] },
  { key: 'chat', type: 'group', label: 'AI chat assistant', fields: [
    { key: 'enabled', type: 'boolean', label: 'Show the AI chat widget on the website' },
    { key: 'title', type: 'text', label: 'Chat window title', half: true },
    { key: 'subtitle', type: 'text', label: 'Subtitle', half: true },
    { key: 'button', type: 'text', label: 'Launcher button label', half: true },
    { key: 'bot_name', type: 'text', label: 'Assistant name', hint: 'Used as {{bot_name}} in the instructions', half: true },
    { key: 'greeting', type: 'textarea', label: 'Welcome message', hint: 'First message visitors see. Markdown links allowed.' },
    { key: 'suggestions', type: 'lines', label: 'Suggested questions', hint: 'One per line, up to 4' },
    { key: 'instructions', type: 'markdown', label: 'Instructions (system prompt)', hint: 'How the assistant behaves. Placeholders: {{bot_name}} {{site_name}} {{site_url}} {{email}}. Leave empty to use the default. The website content is added after this automatically.' },
    { key: 'capabilities', type: 'markdown', label: 'What we build (technologies & platforms)', hint: 'Every stack, CMS and platform the team works with. Sent with every message, so the assistant never says “we only do Flutter/Shopify”. Leave empty to use the default list.' },
    { key: 'knowledge', type: 'markdown', label: 'Extra knowledge', hint: 'The assistant already reads every published page and llms.txt. Add facts that are not on the site: pricing guidance, policies, timelines, promotions… This text has priority.' },
    { key: 'model', type: 'select', label: 'DeepSeek model', options: ['deepseek-chat', 'deepseek-reasoner'], hint: 'deepseek-chat: fast & cheap (recommended). deepseek-reasoner: slower, thinks first.' },
    { key: 'temperature', type: 'select', label: 'Creativity (temperature)', options: ['0.3', '0', '0.5', '0.7', '1'], hint: 'Lower = more factual' },
    { key: 'max_tokens', type: 'select', label: 'Max answer length (tokens)', options: ['400', '250', '600', '1000'] },
    { key: 'lead_enabled', type: 'boolean', label: 'Ask visitors to leave their contact details in the chat' },
    { key: 'lead_after', type: 'select', label: 'Show the contact form after this many answers', options: ['2', '1', '3', '5', 'only when relevant'], hint: 'The assistant also shows it whenever someone asks for a quote, demo or call', half: true },
    { key: 'lead_phone', type: 'boolean', label: 'Ask for a phone number (optional field)', half: true },
    { key: 'lead_title', type: 'text', label: 'Form title', half: true },
    { key: 'lead_text', type: 'text', label: 'Form intro', half: true },
    { key: 'lead_thanks', type: 'text', label: 'Thank-you message', hint: 'Placeholders: {{name}} {{email}}', wide: true },
  ] },
  { key: 'robots_txt', type: 'markdown', label: 'robots.txt', hint: 'The Sitemap line is added automatically' },
  { key: 'llms_txt', type: 'markdown', label: 'llms.txt', hint: 'A plain summary of the site for AI search engines' },
];

// How the Settings screen is grouped (left menu). `keys` are SETTINGS_FIELDS keys.
export const SETTINGS_TABS = [
  { id: 'general', label: 'General', desc: 'Site name, URL, verification', keys: ['site'] },
  { id: 'header', label: 'Header & menu', desc: 'Menu links and header button', keys: ['header'] },
  { id: 'footer', label: 'Footer', desc: 'Tagline, link columns, copyright', keys: ['footer'] },
  { id: 'org', label: 'Organization', desc: 'Brand info for Google', keys: ['org'] },
  { id: 'email', label: 'Email sending', desc: 'Recipients, SMTP, app password', keys: ['email'] },
  { id: 'templates', label: 'Email templates', desc: 'Notification & confirmation text', keys: ['email_templates'] },
  { id: 'chat', label: 'AI chat', desc: 'Chat widget, knowledge & tone', keys: ['chat'] },
  { id: 'search', label: 'robots.txt & llms.txt', desc: 'Search engine & AI files', keys: ['robots_txt', 'llms_txt'] },
];

export const RESERVED_SLUGS = ['admin', 'api', 'assets', 'blog', 'sitemap.xml', 'robots.txt', 'llms.txt', 'favicon.ico', 'site.webmanifest', '404', 'index.html'];
