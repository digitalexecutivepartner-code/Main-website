// Real photos for the site (free Unsplash License: commercial use OK, no attribution required).
// One source of truth used by db/seed.js (fresh installs) and scripts/seed-photos.mjs (download + patch the live DB).
// Files live in public/assets/photos/<key>-<width>.webp and are deployed with the site.

const U = (id) => `https://images.unsplash.com/photo-${id}`;

// size sets per use:  header = page_header (4:3), inline = image block (16:9), cover = blog cover (16:9)
export const SIZES = {
  header: [[640, 480], [1080, 810]],
  inline: [[1000, 563], [1600, 900]],
  cover: [[640, 360], [1200, 675]],
  portrait: [[560, 700], [960, 1200]],
  square: [[360, 360], [640, 640]],
};

export const PHOTOS = {
  // ---- page headers ----
  'hdr-products':     { kind: 'header', src: U('1460925895917-afdab827c52f'), alt: 'Laptop on a glass desk showing an analytics dashboard with sales charts' },
  'hdr-about':        { kind: 'header', src: U('1522071820081-009f0129c71c'), alt: 'A small team working together around laptops at a shared table' },
  'hdr-how':          { kind: 'header', src: U('1531403009284-440f080d1e12'), alt: 'Person arranging a project plan with notes and diagrams on a wall board' },
  'hdr-why':          { kind: 'header', src: U('1521737852567-6949f3f9f2b5'), alt: 'Colleagues discussing a project around a table in a bright office' },
  'hdr-faq':          { kind: 'header', src: U('1553775282-20af80779df7'), alt: 'Support headset resting next to a laptop on a desk' },
  'hdr-contact':      { kind: 'header', src: U('1600880292203-757bb62b4baf'), alt: 'Two people talking through a project in a meeting room' },
  'hdr-services':     { kind: 'header', src: U('1519389950473-47ba0277781c'), alt: 'Team members working on several laptops around one table' },
  'hdr-web':          { kind: 'header', src: U('1498050108023-c5249f4df085'), alt: 'MacBook showing lines of code on a developer desk' },
  'hdr-shopify':      { kind: 'header', src: U('1742454582165-deab666a8763'), alt: 'Smartphone showing a Shopify app setup screen' },
  'hdr-zoho':         { kind: 'header', src: U('1504868584819-f8e8b4b6d7e3'), alt: 'Laptop displaying business reports and charts' },
  'hdr-ai':           { kind: 'header', src: U('1677442135703-1787eea5ce01'), alt: 'Illustration of a brain made of circuit board lines, representing AI' },

  // ---- about collage (home + /about) ----
  'about-main':       { kind: 'portrait', crop: 'faces,entropy', src: U('1702047094974-a3475a6e37f5'), alt: 'Four colleagues smiling while reviewing a project on a laptop' },
  'about-sub':        { kind: 'square', src: U('1575089976121-8ed7b2a54265'), alt: 'Developer writing code on a laptop next to a large monitor' },

  // ---- image blocks between sections ----
  'in-about':         { kind: 'inline', src: U('1531545514256-b1400bc00f31'), alt: 'Four people reviewing work together on a laptop' },
  'in-how':           { kind: 'inline', src: U('1586936893354-362ad6ae47ba'), alt: 'Team planning a project with colorful sticky notes on a table' },
  'in-why':           { kind: 'inline', src: U('1672380135241-c024f7fbfa13'), alt: 'Two people shaking hands over a laptop after agreeing a plan' },
  'in-services':      { kind: 'inline', src: U('1629904853893-c2c8981a1dc5'), alt: 'Two developers writing code at monitors in a bright workspace' },
  'in-web':           { kind: 'inline', src: U('1607799279861-4dd421887fb3'), alt: 'Laptop screen with colorful source code for a web project' },
  'in-shopify':       { kind: 'inline', src: U('1449247666642-264389f5f5b1'), alt: 'Packing an online order in a cardboard box' },
  'in-zoho':          { kind: 'inline', src: U('1551434678-e076c223a692'), alt: 'People working at computers in an open office' },
  'in-ai':            { kind: 'inline', src: U('1762330465857-07e4c81c0dfa'), alt: 'Person typing a question to an AI chatbot on a smartphone' },

  // ---- blog covers ----
  'post-trend-to-store':        { kind: 'cover', src: U('1551288049-bebda4e38f71'), tags: 'trend, trends, analytics, data, growth, search, keyword, report, insights, marketing', alt: 'Performance analytics graphs on a laptop screen' },
  'post-choose-web-company':    { kind: 'cover', src: U('1556761175-b413da4baf72'), tags: 'web development company, agency, choose, hire, partner, vendor, web development, website', alt: 'Business meeting with a web development team' },
  'post-mobile-cost-2026':      { kind: 'cover', src: U('1554224155-8d04cb21cd6c'), tags: 'cost, price, pricing, budget, estimate, mobile app, app cost', alt: 'Calculator app on a smartphone held over budget papers' },
  'post-mobile-services':       { kind: 'cover', src: U('1512941937669-90a1b58e7e9c'), tags: 'mobile app, mobile app development, ios, android, apps, smartphone', alt: 'Smartphone home screen full of apps' },
  'post-native-vs-cross':       { kind: 'cover', src: U('1480694313141-fce5e697ee25'), tags: 'native, cross-platform, flutter, react native, android, ios, mobile app', alt: 'Android smartphone with app icons on a dark surface' },
  'post-outsource-mobile':      { kind: 'cover', src: U('1588196749597-9ff075ee6b5b'), tags: 'outsource, outsourcing, remote, offshore, team, hire, freelancer, communication', alt: 'Laptop showing a video call with a remote team' },
  'post-mobile-vs-web':         { kind: 'cover', src: U('1605379399642-870262d3d051'), tags: 'mobile vs web, web app, mobile app, responsive, pwa, website', alt: 'Smartphone on a desk in front of monitors showing code' },
  'post-zoho-crm-cost':         { kind: 'cover', src: U('1554224155-6726b3ff858f'), tags: 'zoho, crm, cost, pricing, implementation, license, budget', alt: 'Person reviewing costs on paper with a calculator' },
  'post-ai-chatbot':            { kind: 'cover', src: U('1694903089438-bf28d4697d9a'), tags: 'ai, chatbot, artificial intelligence, llm, gpt, agent, bot', alt: 'Robot hand and human hand reaching toward the letters AI' },
  'post-zoho-api-limits':       { kind: 'cover', src: U('1558494949-ef010cbdcc31'), tags: 'api, limits, credits, rate limit, server, integration, sync, zoho', alt: 'Network cables connected to servers in a data center' },
  'post-zoho-api-key':          { kind: 'cover', src: U('1619410283995-43d9134e7656'), tags: 'api key, api, oauth, token, console, scopes, developer, code, zoho', alt: 'Code editor showing source code on a dark screen' },
  'post-choose-mobile-company': { kind: 'cover', src: U('1551650975-87deedd944c3'), tags: 'mobile app development company, choose, hire, app agency, mobile app', alt: 'Person holding a smartphone showing an app dashboard' },
  'post-mobile-cost-budget':    { kind: 'cover', src: U('1633158829585-23ba8f7c8caf'), tags: 'cost, budget, price, money, save, roi, investment', alt: 'Hand stacking coins on a table, a symbol of budgeting' },
  'post-shopify-descriptions':  { kind: 'cover', src: U('1542291026-7eec264c27ff'), tags: 'shopify, product, product description, ecommerce, catalog, seo, copywriting, store', alt: 'Red sneaker product photo on a red background' },

  // ---- extra covers: only used by the SEO agent's automatic cover picker (src/seo-agent/covers.js) ----
  'pool-ecommerce':  { kind: 'cover', src: U('1563013544-824ae1b704d3'), tags: 'ecommerce, shopify, shopify app, store, checkout, payment, online store, sales, order, bundle', alt: 'Person shopping online on a laptop with a payment card' },
  'pool-code':       { kind: 'cover', src: U('1515879218367-8466d910aaa4'), tags: 'code, developer, programming, api, integration, webhook, javascript, custom app', alt: 'Computer screen full of source code' },
  'pool-ai':         { kind: 'cover', src: U('1709120395858-92f1c7c577f5'), tags: 'ai, artificial intelligence, automation, ai agents, machine learning', alt: 'The letters AI on a dark teal circuit board' },
  'pool-support':    { kind: 'cover', src: U('1626863905121-3b0c0ed7b94c'), tags: 'customer support, customer service, helpdesk, support, call center, chatbot', alt: 'Two support agents wearing headsets in a bright office' },
  'pool-dashboard':  { kind: 'cover', src: U('1526628953301-3e589a6a8b74'), tags: 'dashboard, monitoring, crm, sync, inventory sync, data, reporting, automation, inventory', alt: 'Monitoring dashboard with charts on a screen' },
  'pool-planning':   { kind: 'cover', src: U('1758691736836-0413b066787a'), tags: 'strategy, planning, process, project, workflow, roadmap, implementation, migration, consultant, consulting, checklist', alt: 'Team planning a project with sticky notes on a glass wall' },
  'pool-phone':      { kind: 'cover', src: U('1533022139390-e31c488d69e2'), tags: 'iphone, ios, mobile, app store, smartphone, ux', alt: 'Person holding a smartphone' },

  // ---- cover library: extra choices for the SEO agent (cover + in-article photo) ----
  'lib-store-laptop': { kind: 'cover', src: U('1658297063569-162817482fb6'), tags: 'shopify, online store, ecommerce, website, storefront, store', alt: 'Laptop showing an online store on a wooden desk' },
  'lib-shopping-app': { kind: 'cover', src: U('1586880244543-0528a802be97'), tags: 'mobile commerce, shopify app, shopping, mobile, ecommerce, checkout', alt: 'Hand holding a smartphone with a shopping app open' },
  'lib-shipping-boxes': { kind: 'cover', src: U('1766040923580-16ad32fae8b4'), tags: 'shipping, fulfillment, orders, order management, ecommerce, delivery', alt: 'Pile of taped cardboard shipping boxes' },
  'lib-owner-orders': { kind: 'cover', src: U('1770013413878-2530e2c3d82b'), tags: 'small business, store owner, orders, shopify, fulfillment, merchant', alt: 'Store owner checking an order on her phone next to parcels and a laptop' },
  'lib-shop-counter': { kind: 'cover', src: U('1740126102510-8e09dd492f62'), tags: 'small business, store owner, retail, merchant, dtc, brand', alt: 'Shop owner preparing products at a counter' },
  'lib-retail-display': { kind: 'cover', src: U('1764795849694-34b3316b3de4'), tags: 'retail, omnichannel, pos, in-store, customer experience', alt: 'Shoppers using a digital display in a store' },
  'lib-spreadsheet': { kind: 'cover', src: U('1783115259399-3a5a3e0e4592'), tags: 'spreadsheet, csv, import, export, bulk edit, data migration, catalog data', alt: 'Hands typing on a laptop with a data spreadsheet' },
  'lib-outfit-boots': { kind: 'cover', src: U('1479064555552-3ef4979f8908'), tags: 'complete the look, outfit, fashion, apparel, cross-sell, bundles', alt: 'Flat lay of leather boots, a belt and a shirt' },
  'lib-outfit-shirt': { kind: 'cover', src: U('1739169585911-1ad4376bf85e'), tags: 'bundle, product bundles, outfit, upsell, fashion, complete the look', alt: 'Flat lay of a checked shirt, jeans and shoes' },
  'lib-product-flatlay': { kind: 'cover', src: U('1616761512547-ea151d8a56d5'), tags: 'product photography, product images, product, catalog, apparel, product page', alt: 'Product flat lay of a denim shirt, trousers and a camera' },
  'lib-sales-meeting': { kind: 'cover', src: U('1603201667106-0e3e0ae584c5'), tags: 'sales team, crm, pipeline, leads, deals, meeting', alt: 'Two colleagues reviewing work on a laptop in a meeting room' },
  'lib-team-laptop': { kind: 'cover', src: U('1754531976828-69e42ce4e0d9'), tags: 'team, agency, company, developers, hire, development team', alt: 'Team gathered around a laptop' },
  'lib-team-celebrate': { kind: 'cover', src: U('1758691737492-48e8fdd336f7'), tags: 'success, results, roi, growth, launch, case study, wins', alt: 'Colleagues celebrating a success in the office' },
  'lib-analytics-desk': { kind: 'cover', src: U('1542744173-05336fcc7ad4'), tags: 'analytics, reporting, kpi, dashboard, marketing, metrics', alt: 'Laptop with analytics charts next to a phone and glasses' },
  'lib-growth-chart': { kind: 'cover', src: U('1591696205602-2f950c417cb9'), tags: 'growth, traffic, trends, performance, rankings, forecast', alt: 'Line chart of growth on a laptop screen' },
  'lib-dashboard-screen': { kind: 'cover', src: U('1560472354-b33ff0c44a43'), tags: 'google analytics, metrics, traffic, seo report, search console, conversion', alt: 'Website analytics dashboard on a screen' },
  'lib-cloud-sync': { kind: 'cover', src: U('1667984390553-7f439e6ae401'), tags: 'cloud, integration, sync, middleware, connect, api, saas, webhook', alt: '3D illustration of a cloud connected to blocks' },
  'lib-cloud-dark': { kind: 'cover', src: U('1667984390535-6d03cff0b11a'), tags: 'cloud, hosting, serverless, infrastructure, deployment, cloudflare', alt: '3D illustration of a glowing cloud on a dark background' },
  'lib-padlock-3d': { kind: 'cover', src: U('1667372283587-e1557c08aca4'), tags: 'oauth, oauth scopes, api scopes, authentication, access token, permissions, scopes, security', alt: '3D illustration of a padlock on a dark background' },
  'lib-code-monitor': { kind: 'cover', src: U('1610563166150-b34df4f3bcd6'), tags: 'code, backend, api, rest api, programming, script, deluge', alt: 'Monitor showing backend code' },
  'lib-code-js': { kind: 'cover', src: U('1627398242454-45a1465c2479'), tags: 'javascript, frontend, liquid, theme, react, custom code, node', alt: 'JavaScript code with colorful syntax highlighting' },
  'lib-developer': { kind: 'cover', src: U('1534665482403-a909d0d97c67'), tags: 'developer, freelancer, programmer, hire developer, custom development', alt: 'Developer programming on a laptop' },
  'lib-wireframe': { kind: 'cover', src: U('1576153192396-180ecef2a715'), tags: 'wireframe, ux, website design, prototype, mvp, sitemap', alt: 'Hand sketching website wireframes on paper' },
  'lib-ux-workshop': { kind: 'cover', src: U('1576595580361-90a855b84b20'), tags: 'ux design, workshop, user research, discovery, design sprint', alt: 'Team sketching interface ideas with sticky notes' },
  'lib-app-sketch': { kind: 'cover', src: U('1581291518633-83b4ebd1d83e'), tags: 'mobile app design, app design, wireframe, ui, screens', alt: 'Hand drawing a mobile app wireframe' },
  'lib-imac-desk': { kind: 'cover', src: U('1467232004584-a241de8bcf5d'), tags: 'web design, website, workspace, web development, agency', alt: 'Designer desk with a desktop computer in a dark room' },
  'lib-laptop-imac': { kind: 'cover', src: U('1499951360447-b19be8fe80f5'), tags: 'website, responsive, landing page, web development, redesign', alt: 'Laptop and desktop computer on a bright desk' },
  'lib-brainstorm': { kind: 'cover', src: U('1587440871875-191322ee64b0'), tags: 'brainstorm, ideas, requirements, scope, planning, discovery', alt: 'Team brainstorming with sticky notes on a table' },
  'lib-webapp-ui': { kind: 'cover', src: U('1559028012-481c04fa702d'), tags: 'web app, saas, dashboard, admin panel, customer portal, ui', alt: 'Monitor displaying a web app dashboard' },
  'lib-toy-robot': { kind: 'cover', src: U('1527430253228-e93688616381'), tags: 'bot, chatbot, ai assistant, virtual assistant, conversational', alt: 'Vintage toy robot' },
  'lib-robot-arm': { kind: 'cover', src: U('1655393001768-d946c97d6fd1'), tags: 'automation, workflow automation, robotics, ai agents, process automation', alt: 'White robotic arm in a bright showroom' },
  'lib-robot-hand': { kind: 'cover', src: U('1531746790731-6c087fecd65a'), tags: 'ai, machine learning, artificial intelligence, ai agent, llm, future', alt: 'Close-up of a white robot hand' },
  'lib-strategy-table': { kind: 'cover', src: U('1758873271740-f1fd6c6f1524'), tags: 'strategy, consulting, consultant, workshop, planning, audit', alt: 'Four people discussing charts around a table' },
  'lib-handshake': { kind: 'cover', src: U('1758519288905-38b7b00c1023'), tags: 'partnership, agency, partner, hire, deal, vendor, zoho partner', alt: 'Two businessmen shaking hands across a table' },
  'lib-presentation': { kind: 'cover', src: U('1542744173-8e7e53415bb0'), tags: 'training, onboarding, presentation, adoption, team training', alt: 'Presenter talking to a team with laptops' },
  'lib-signing': { kind: 'cover', src: U('1450101499163-c8848c66ca85'), tags: 'contract, agreement, statement of work, terms, nda, proposal', alt: 'Person signing a document' },
  'lib-notes': { kind: 'cover', src: U('1521791055366-0d553872125f'), tags: 'requirements, documentation, brief, specification, rfp, guide', alt: 'Hand writing notes on paper' },
  'lib-calc-coffee': { kind: 'cover', src: U('1626266061368-46a8f578ddd6'), tags: 'cost, price, budget, pricing, estimate, quote, how much', alt: 'Person using a calculator at a desk with a coffee mug' },
  'lib-calc-pen': { kind: 'cover', src: U('1648201637025-1c77b9be3013'), tags: 'cost, invoice, fees, pricing, budget, hourly rate', alt: 'Calculator and pen on a sheet of paper' },
  'lib-calc-charts': { kind: 'cover', src: U('1711606815631-38d32cdaec3e'), tags: 'roi, cost, savings, finance, budget, pricing, tco', alt: 'Calculator on printed charts next to a laptop' },
  'lib-woman-laptop': { kind: 'cover', src: U('1758876202726-bdb6c1272152'), tags: 'freelancer, small business, founder, productivity, remote', alt: 'Woman smiling while working on a laptop' },
  'lib-video-call': { kind: 'cover', src: U('1612831455359-970e23a1e4e9'), tags: 'video call, remote team, meeting, communication, outsourcing', alt: 'Video call with a team on a laptop' },
  'lib-remote-woman': { kind: 'cover', src: U('1760346546839-aced24accdff'), tags: 'remote work, outsourcing, offshore, communication, collaboration', alt: 'Woman in a video conference on her laptop' },
  'lib-remote-man': { kind: 'cover', src: U('1759752394757-323a0adc0d62'), tags: 'offshore team, standup, communication, nearshore, dedicated team', alt: 'Man joining a video conference call' },
  'lib-seo-blocks': { kind: 'cover', src: U('1637606346315-d23ed32a6cfc'), tags: 'seo, search engine optimization, keywords, ranking, on-page seo', alt: 'Wooden blocks spelling SEO' },
  'lib-seo-desk': { kind: 'cover', src: U('1709281847802-9aef10b6d4bf'), tags: 'seo, organic traffic, search, google, content, meta description', alt: 'Large SEO letters on a desk beside a laptop' },
  'lib-bar-chart': { kind: 'cover', src: U('1608222351212-18fe0ec7b13b'), tags: 'sales report, analytics, revenue, kpi, reporting, sales', alt: 'Laptop showing sales bar charts' },
  'lib-circuit': { kind: 'cover', src: U('1550751827-4bd374c3f58b'), tags: 'technology, tech stack, hardware, iot, architecture', alt: 'Glowing circuit board in teal light' },
  'lib-padlock-keys': { kind: 'cover', src: U('1614064641938-3bbee52942c7'), tags: 'cybersecurity, data protection, privacy, gdpr, compliance, security', alt: 'Red padlock on a backlit keyboard' },
  'lib-kanban': { kind: 'cover', src: U('1542626991-cbc4e32524cc'), tags: 'kanban, agile, scrum, sprint, project management, backlog, zoho projects', alt: 'Sticky notes arranged on a board' },
  'lib-plan-wall': { kind: 'cover', src: U('1590402494587-44b71d7772f6'), tags: 'project plan, roadmap, timeline, milestones, agile, implementation plan', alt: 'Two people planning a project on a glass wall' },
  'lib-task-wall': { kind: 'cover', src: U('1631203928493-a4e4eb2b8da1'), tags: 'task management, organization, workflow, process, productivity', alt: 'Woman organising tasks with sticky notes' },
  'lib-warehouse-aisle': { kind: 'cover', src: U('1664382953403-fc1ac77073a0'), tags: 'warehouse, inventory, logistics, stock, fulfillment, 3pl', alt: 'Two women walking through a warehouse aisle' },
  'lib-warehouse-shelves': { kind: 'cover', src: U('1749244768351-2726dc23d26c'), tags: 'inventory, stock, supply chain, multi-location, inventory sync', alt: 'Warehouse shelves filled with boxes' },
  'lib-stockroom': { kind: 'cover', src: U('1724709162875-fe100dd0e04b'), tags: 'inventory management, stock levels, sku, products, zoho inventory', alt: 'Stockroom full of labelled boxes' },
  'lib-founder': { kind: 'cover', src: U('1622151834677-70f982c9adef'), tags: 'startup, founder, entrepreneur, small business, mvp', alt: 'Founder working on a laptop' },
  'lib-laptop-table': { kind: 'cover', src: U('1555117391-6c0795768da8'), tags: 'saas, software, tools, apps, productivity, app store', alt: 'Laptop on a wooden table' },
  'lib-merchant': { kind: 'cover', src: U('1668112262164-56e782a6e07a'), tags: 'business owner, merchant, entrepreneur, ecommerce owner, shopify merchant', alt: 'Business owner working on a laptop' },
  'lib-app-screens': { kind: 'cover', src: U('1581287053822-fd7bf4f4bfec'), tags: 'mobile app, app ui, ios, android, flutter, react native', alt: 'Two smartphones showing colorful app screens' },
  'lib-app-prototype': { kind: 'cover', src: U('1576153192286-defd01e1e4b4'), tags: 'app prototype, mvp, mobile app development, wireframe, app idea', alt: 'Smartphone held over paper app wireframes' },
  'lib-tablet-sketch': { kind: 'cover', src: U('1578401057158-0e58789f5947'), tags: 'design, tablet app, prototyping, ux, product design', alt: 'Tablet next to design sketches' },
  'lib-laptop-dusk': { kind: 'cover', src: U('1503945438517-f65904a52ce6'), tags: 'deadline, productivity, focus, timeline, launch', alt: 'Woman working on a laptop at dusk' },
  'lib-dev-night': { kind: 'cover', src: U('1758876204245-ee540a3af69f'), tags: 'developer, coding, software engineer, maintenance, support, bug fix', alt: 'Developer working on a laptop in a dim office' },
};

// page slug → header photo + optional image block inserted before the first block of type `before`
export const PAGE_PHOTOS = {
  products: { header: 'hdr-products' },
  about: { header: 'hdr-about', inline: 'in-about', before: 'richtext' },
  'how-it-works': { header: 'hdr-how', inline: 'in-how', before: 'richtext' },
  'why-us': { header: 'hdr-why', inline: 'in-why', before: 'richtext' },
  faq: { header: 'hdr-faq' },
  contact: { header: 'hdr-contact' },
  services: { header: 'hdr-services', inline: 'in-services', before: 'faq' },
  'services/web-mobile-development': { header: 'hdr-web', inline: 'in-web', before: 'tags' },
  'services/shopify-apps': { header: 'hdr-shopify', inline: 'in-shopify', before: 'tags' },
  'services/zoho-consulting': { header: 'hdr-zoho', inline: 'in-zoho', before: 'tags' },
  'services/ai-agents': { header: 'hdr-ai', inline: 'in-ai', before: 'tags' },
};

// Services grid (home + /services): photo per card, matched by the card's icon.
export const SERVICE_CARD_PHOTOS = { web: 'hdr-web', shop: 'hdr-shopify', zoho: 'hdr-zoho', ai: 'hdr-ai' };
// About block (home + /about): photo collage. The old illustration is replaced; any other image set in Admin is kept.
export const ABOUT_COLLAGE = { main: 'about-main', sub: 'about-sub', badge_title: 'You approve every change', badge_text: 'Nothing goes live on its own', replace: ['/assets/about-visual-620.webp'] };
// Home: "Latest blog posts" section, inserted before the FAQ.
export const HOME_POSTS = { type: 'posts', data: { anchor: 'blog', eyebrow: 'From the blog', heading: 'Guides for Shopify, Zoho, apps and AI', lead: 'Practical answers on costs, choices and how-tos, written for business owners.', count: '3', more: { label: 'Read all posts', url: '/blog' } } };

// "Works with" logos (official logos from the CC0 gilbarbara/logos set, saved in public/assets/brands/).
// Added to the home partners block when missing (matched by name); existing items are kept as they are.
export const PARTNER_LOGOS = [
  { name: 'Shopify', subtitle: 'Built for Shopify stores', logo: '/assets/brands/shopify.svg', wide: false, replaces: '/assets/brands/shopify.webp' },
  { name: 'Magento', subtitle: 'Adobe Commerce stores', logo: '/assets/brands/magento.svg', wide: false },
  { name: 'WordPress', subtitle: 'Websites & WooCommerce', logo: '/assets/brands/wordpress.svg', wide: false },
  { name: 'Payload', subtitle: 'Headless CMS', logo: '/assets/brands/payload.svg', wide: false },
  { name: 'Zoho', subtitle: 'CRM, Creator, Projects & Bookings', logo: '/assets/brands/zoho.webp', wide: true },
  { name: 'Figma', subtitle: 'Designs & prototypes', logo: '/assets/brands/figma.svg', wide: false },
  { name: 'Adobe', subtitle: 'Creative assets & files', logo: '/assets/brands/adobe.svg', wide: false },
  { name: 'Diagrams.net', subtitle: 'Flowcharts & architecture diagrams', logo: '/assets/brands/diagrams.svg', wide: false },
  { name: 'Motion', subtitle: 'Web animations', logo: '/assets/brands/motion.svg', wide: false },
  { name: 'React Native', subtitle: 'Cross-platform mobile apps', logo: '/assets/brands/react-native.svg', wide: false },
  { name: 'Flutter', subtitle: 'iOS & Android apps', logo: '/assets/brands/flutter.svg', wide: false },
  { name: 'Next.js', subtitle: 'Fast React websites & web apps', logo: '/assets/brands/nextjs.svg', wide: false },
  { name: 'Node.js', subtitle: 'APIs & backends', logo: '/assets/brands/nodejs.svg', wide: false },
  { name: 'Python', subtitle: 'Automation, data & AI', logo: '/assets/brands/python.svg', wide: false },
  { name: 'PHP', subtitle: 'Server-side web apps', logo: '/assets/brands/php.svg', wide: false },
  { name: 'Laravel', subtitle: 'PHP web apps & APIs', logo: '/assets/brands/laravel.svg', wide: false },
  { name: 'Neon', subtitle: 'Serverless Postgres', logo: '/assets/brands/neon.svg', wide: false },
  { name: 'PostgreSQL', subtitle: 'Relational databases', logo: '/assets/brands/postgresql.svg', wide: false },
  { name: 'MySQL', subtitle: 'Relational databases', logo: '/assets/brands/mysql.svg', wide: false },
  { name: 'MongoDB', subtitle: 'Document databases', logo: '/assets/brands/mongodb.svg', wide: false },
  { name: 'NoSQL', subtitle: 'Flexible document & key-value data', logo: '/assets/brands/nosql.svg', wide: false },
  { name: 'BigQuery', subtitle: 'Data warehouse & analytics', logo: '/assets/brands/bigquery.svg', wide: false },
  { name: 'DeepSeek', subtitle: 'AI chat & agents', logo: '/assets/brands/deepseek.svg', wide: false },
  { name: 'Claude', subtitle: 'AI assistants & agents', logo: '/assets/brands/claude.svg', wide: false },
  { name: 'LLM', subtitle: 'Large language models', logo: '/assets/brands/llm.svg', wide: false },
  { name: 'RAG', subtitle: 'Answers from your own data', logo: '/assets/brands/rag.svg', wide: false },
  { name: 'Vector DB', subtitle: 'Semantic search & embeddings', logo: '/assets/brands/vector-db.svg', wide: false },
  { name: 'NotebookLM', subtitle: 'AI research notebooks', logo: '/assets/brands/notebooklm.svg', wide: false },
  { name: 'n8n', subtitle: 'Workflow automation', logo: '/assets/brands/n8n.svg', wide: false },
  { name: 'Make', subtitle: 'No-code automation', logo: '/assets/brands/make.svg', wide: false },
  { name: 'Notion', subtitle: 'Docs & knowledge bases', logo: '/assets/brands/notion.svg', wide: false },
  { name: 'AWS', subtitle: 'Cloud infrastructure', logo: '/assets/brands/aws.svg', wide: false },
  { name: 'Vercel', subtitle: 'Front-end hosting', logo: '/assets/brands/vercel.svg', wide: false },
  { name: 'Cloudflare', subtitle: 'Fast, secure hosting', logo: '/assets/brands/cloudflare.svg', wide: false },
  { name: 'Cloudways', subtitle: 'Managed cloud hosting', logo: '/assets/brands/cloudways.svg', wide: false },
  { name: 'GoDaddy', subtitle: 'Domains & hosting', logo: '/assets/brands/godaddy.svg', wide: false },
];
export const PARTNERS_MORE = 'and more';

// blog post slug → cover photo (posts are written by the SEO agent, so they only exist in the live DB)
export const POST_COVERS = {
  'trend-to-store-shopify-app-idea': 'post-trend-to-store',
  'choose-web-development-company-stack-fit': 'post-choose-web-company',
  'mobile-app-development-cost-2026': 'post-mobile-cost-2026',
  'mobile-app-development-services-guide': 'post-mobile-services',
  'native-vs-cross-platform-mobile-app-development': 'post-native-vs-cross',
  'how-to-outsource-mobile-app-development': 'post-outsource-mobile',
  'mobile-app-development-vs-web-development': 'post-mobile-vs-web',
  'zoho-crm-implementation-cost': 'post-zoho-crm-cost',
  'how-to-build-an-ai-chatbot-from-scratch': 'post-ai-chatbot',
  'zoho-crm-api-limits-and-credits-guide': 'post-zoho-api-limits',
  'how-to-get-zoho-crm-api-key-console-scopes': 'post-zoho-api-key',
  'how-to-choose-a-mobile-app-development-company': 'post-choose-mobile-company',
  'how-much-does-mobile-app-development-cost': 'post-mobile-cost-budget',
  'shopify-product-description-examples': 'post-shopify-descriptions',
};

export const fileFor = (key, w) => `/assets/photos/${key}-${w}.webp`;

// Image object in the shape the block renderers expect.
export function imageFor(key) {
  const p = PHOTOS[key];
  const [[w1, h1], [w2, h2]] = SIZES[p.kind];
  return { src: fileFor(key, w1), src_large: fileFor(key, w2), width: w1, height: h1, width_large: w2, height_large: h2, alt: p.alt };
}
export const coverFor = (key) => fileFor(key, SIZES.cover[1][0]);

// Adds photos to a page's blocks without touching anything already set. Returns a list of what changed.
export function applyPagePhotos(page) {
  const cfg = PAGE_PHOTOS[page.slug] || {};
  const changes = [];
  if (!Array.isArray(page.blocks)) return changes;
  for (const b of page.blocks) {
    if (b.type === 'partners' && b.data) {
      const items = (b.data.items ||= []);
      const have = new Set(items.map((x) => String(x.name || '').toLowerCase()));
      for (const { replaces, ...p } of PARTNER_LOGOS) {
        const cur = items.find((x) => String(x.name || '').toLowerCase() === p.name.toLowerCase());
        if (!cur) { items.push(p); changes.push(`logo ← ${p.name}`); }
        else if (replaces && cur.logo === replaces) { cur.logo = p.logo; changes.push(`logo ${p.name} → ${p.logo.split('/').pop()}`); }
      }
      // keep the recommended order (items added in Admin that aren't in the list stay at the end)
      if (changes.some((c) => c.startsWith('logo'))) {
        const rank = (x) => { const k = PARTNER_LOGOS.findIndex((p) => p.name.toLowerCase() === String(x.name || '').toLowerCase()); return k < 0 ? 999 : k; };
        items.sort((a, b) => rank(a) - rank(b));
      }
      if (!b.data.more_text) { b.data.more_text = PARTNERS_MORE; changes.push(`"${PARTNERS_MORE}" tile`); }
    }
    if (b.type === 'services') for (const it of b.data?.items || []) {
      const key = SERVICE_CARD_PHOTOS[it.icon];
      if (key && !it.image?.src) { it.image = { ...imageFor(key), alt: '' }; changes.push(`service card "${it.title}" ← ${key}`); }
    }
    if (b.type === 'about' && b.data) {
      const d = b.data;
      if (!d.image?.src || ABOUT_COLLAGE.replace.includes(d.image.src)) { d.image = imageFor(ABOUT_COLLAGE.main); changes.push(`about photo ← ${ABOUT_COLLAGE.main}`); }
      if (!d.image2?.src) {
        d.image2 = imageFor(ABOUT_COLLAGE.sub);
        if (!d.badge_title) Object.assign(d, { badge_title: ABOUT_COLLAGE.badge_title, badge_text: ABOUT_COLLAGE.badge_text });
        changes.push(`about collage ← ${ABOUT_COLLAGE.sub}`);
      }
    }
  }
  if (page.type === 'home' && !page.blocks.some((b) => b.type === 'posts')) {
    let at = page.blocks.findIndex((b) => b.type === 'faq');
    if (at < 0) at = page.blocks.length;
    page.blocks.splice(at, 0, structuredClone(HOME_POSTS));
    changes.push('"Latest blog posts" section');
  }
  const header = page.blocks.find((b) => b.type === 'page_header');
  if (cfg.header && header && !header.data?.image?.src) {
    header.data = { ...(header.data || {}), image: imageFor(cfg.header) };
    changes.push(`header ← ${cfg.header}`);
  }
  if (cfg.inline) {
    const img = imageFor(cfg.inline);
    const exists = page.blocks.some((b) => b.type === 'image' && b.data?.image?.src === img.src);
    if (!exists) {
      let at = page.blocks.findIndex((b) => b.type === cfg.before);
      if (at < 0) at = page.blocks.length;
      page.blocks.splice(at, 0, { type: 'image', data: { image: img, caption: '' } });
      changes.push(`image block ← ${cfg.inline}`);
    }
  }
  return changes;
}

// ---- automatic cover for new blog posts ----
const norm = (s) => ` ${String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()} `;

// Picks the cover whose tags best match the post. Title + keyword count double, the excerpt once.
// Ties go to the photo used by the fewest posts, so the blog doesn't repeat the same picture.
// `used` = { '/assets/photos/…-1200.webp': number of posts using it }. Returns a cover path.
export function pickCover({ title = '', keyword = '', excerpt = '' } = {}, used = {}, exclude = []) {
  const head = norm(`${title} ${keyword}`), body = norm(excerpt);
  let best = null;
  Object.entries(PHOTOS).forEach(([key, p], order) => {
    if (p.kind !== 'cover' || !p.tags) return;
    let score = 0;
    for (const t of p.tags.split(',').map((x) => norm(x)).filter((x) => x.trim())) {
      const w = t.trim().split(' ').length; // multi-word tags are more specific
      if (head.includes(t)) score += 2 * w; else if (body.includes(t)) score += w;
    }
    const src = coverFor(key), n = used[src] || 0;
    if (exclude.includes(src)) return;
    const cand = { src, score, n, order };
    if (!best || score > best.score || (score === best.score && (n < best.n || (n === best.n && order < best.order)))) best = cand;
  });
  return best?.src || '';
}

// ---- photo inside the article ----
// Puts one photo in the middle of the article body (Markdown), just before a middle "## " section, so long posts
// are easier to read. Uses a different photo than the cover. Returns { body, src } or null when nothing changes
// (the body already has an image, or has fewer than 2 sections).
export function addBodyImage(body, post = {}, { cover = '', used = {} } = {}) {
  const text = String(body || '');
  if (!text.trim() || /!\[[^\]]*\]\(/.test(text)) return null;
  const lines = text.split('\n');
  let fence = false;
  const h2 = [];
  lines.forEach((l, i) => {
    if (/^\s*(```|~~~)/.test(l)) fence = !fence;
    else if (!fence && /^##\s+\S/.test(l) && !/^##\s+related reading/i.test(l)) h2.push(i);
  });
  if (h2.length < 2) return null;
  const at = h2[Math.max(1, Math.floor(h2.length / 2))];
  const src = pickCover(post, used, [cover].filter(Boolean));
  if (!src) return null;
  const key = src.split('/').pop().replace(/-\d+\.webp$/, '');
  const alt = String(PHOTOS[key]?.alt || '').replace(/[[\]]/g, '');
  lines.splice(at, 0, `![${alt}](${src})`, '');
  return { body: lines.join('\n'), src };
}
