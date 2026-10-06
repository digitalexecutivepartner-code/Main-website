// Seed content: the digitalexecutivepartner.app home page, the section pages (products, about, …),
// draft service pages, and site settings including email delivery and email templates.
import { applyPagePhotos } from './photos.js';
import { DEFAULT_TEMPLATES } from '../lib/email.js';
import { CHAT_DEFAULTS } from '../src/chat/config.js';

const EMAIL = 'digitalexecutivepartner@gmail.com';

export const SETTINGS = {
  site: {
    name: 'Digital Executive Partner',
    url: 'https://digitalexecutivepartner.app',
    title_suffix: ' | Digital Executive Partner',
    default_og_image: '/assets/og-image.jpg',
    theme_color: '#050818',
    contact_email: EMAIL,
    google_verification: '',
    bing_verification: '',
  },
  header: {
    nav: [
      { label: 'Services', url: '/services' },
      { label: 'Products', url: '/products' },
      { label: 'About', url: '/about' },
      { label: 'How it works', url: '/how-it-works' },
      { label: 'Why us', url: '/why-us' },
      { label: 'FAQ', url: '/faq' },
      { label: 'Contact', url: '/contact' },
    ],
    cta: { label: 'Start a project', url: '/contact' },
  },
  footer: {
    tagline: 'Modern technology · Flexible solutions · Long-term partnership.',
    columns: [
      { title: 'Products', links: [
        { label: 'All products', url: '/products' },
        { label: 'ZohoSync', url: 'https://zohosync.digitalexecutivepartner.app/' },
        { label: 'Lookfit AI', url: 'https://lookfit.digitalexecutivepartner.app/' },
        { label: 'SEO Products', url: 'https://apps.shopify.com/seo-products-with-epdigital' },
        { label: 'Zoho Middleware', url: 'https://zoho.digitalexecutivepartner.app/' },
      ] },
      { title: 'Services', links: [
        { label: 'All services', url: '/services' },
        { label: 'Website & Mobile Apps', url: '/services/web-mobile-development' },
        { label: 'Shopify Apps', url: '/services/shopify-apps' },
        { label: 'Zoho Consulting', url: '/services/zoho-consulting' },
        { label: 'AI Chat & Agents', url: '/services/ai-agents' },
      ] },
      { title: 'Company', links: [
        { label: 'About us', url: '/about' },
        { label: 'How it works', url: '/how-it-works' },
        { label: 'Why us', url: '/why-us' },
        { label: 'FAQ', url: '/faq' },
        { label: 'Contact', url: '/contact' },
      ] },
    ],
    copyright: 'Digital Executive Partner. Shopify and Zoho are trademarks of their respective owners.',
  },
  org: {
    name: 'Digital Executive Partner',
    alternate_names: 'EP Digital\nDEP',
    slogan: 'Modern technology. Flexible solutions. Long-term partnership.',
    description: 'Digital Executive Partner builds websites, mobile apps, Shopify apps, Zoho integrations and AI agents for growing businesses.',
    logo: '/assets/icon-512.png',
    same_as: 'https://apps.shopify.com/seo-products-with-epdigital',
    knows_about: 'Website development\nMobile app development\nShopify app development\nZoho CRM\nZoho Creator\nZoho implementation\nAI chatbots\nAI agents\nE-commerce SEO',
    languages: 'English\nVietnamese',
  },
  email: {
    to: EMAIL, cc: '', from_name: 'Digital Executive Partner', from_email: '',
    smtp_host: 'smtp.gmail.com', smtp_port: '465', smtp_user: '', autoreply: true,
  },
  email_templates: DEFAULT_TEMPLATES,
  chat: CHAT_DEFAULTS,
  robots_txt: "# robots.txt \u2014 https://digitalexecutivepartner.app\n# All search engines and AI assistants may crawl the public site.\n\nUser-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\n\n# Search engines\nUser-agent: Googlebot\nAllow: /\nDisallow: /api/\nDisallow: /admin\n\nUser-agent: Bingbot\nAllow: /\nDisallow: /api/\nDisallow: /admin\n\n# AI search & assistants (lets the site appear in AI answers)\nUser-agent: GPTBot\nAllow: /\nDisallow: /api/\nDisallow: /admin\n\nUser-agent: OAI-SearchBot\nAllow: /\nDisallow: /api/\nDisallow: /admin\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\nDisallow: /api/\nDisallow: /admin\n\nUser-agent: Claude-SearchBot\nAllow: /\nDisallow: /api/\nDisallow: /admin\n\nUser-agent: PerplexityBot\nAllow: /\nDisallow: /api/\nDisallow: /admin\n\nUser-agent: Google-Extended\nAllow: /\n",
  llms_txt: "# Digital Executive Partner\n\n> Digital Executive Partner (DEP) builds websites, mobile apps, Shopify apps, Zoho integrations and AI agents for growing businesses. Modern technology, flexible solutions, long-term partnership.\n\nWebsite: https://digitalexecutivepartner.app/\nContact: digitalexecutivepartner@gmail.com \u00b7 https://digitalexecutivepartner.app/contact\n\n## Pages\n\n- [Products](https://digitalexecutivepartner.app/products): all four products compared.\n- [About us](https://digitalexecutivepartner.app/about): who we are and how we work.\n- [How it works](https://digitalexecutivepartner.app/how-it-works): installing our products and our process for custom builds.\n- [Why us](https://digitalexecutivepartner.app/why-us): what makes us different.\n- [FAQ](https://digitalexecutivepartner.app/faq): answers about products, services and projects.\n- [Contact](https://digitalexecutivepartner.app/contact): send us a message; we reply as soon as possible.\n\n## Services\n\n- Website & Mobile App Development: business websites, landing pages, web apps, customer portals, and iOS/Android apps built with Flutter.\n- Shopify Apps: ready-made apps plus custom private and public Shopify apps, store automation and integrations.\n- Zoho Consulting & Implementation: Zoho CRM, Creator, Projects and Bookings setup, customization, data migration and integrations.\n- AI Chat & AI Agents: website and support chatbots, and AI agents that automate workflows using the customer's CRM and store data.\n\n## Products\n\n- [ZohoSync](https://zohosync.digitalexecutivepartner.app/): keeps a Shopify store and Zoho CRM in sync in real time. Customers, products, stock and orders flow into Zoho CRM with no CSV exports or Zapier chains. Shopify App Store listing coming soon.\n- [Lookfit AI](https://lookfit.digitalexecutivepartner.app/): reads a Shopify catalogue and builds \"Complete The Look\" bundles for every product page. The merchant reviews and approves; shoppers add the whole bundle in one click with a real Shopify discount. Shopify App Store listing coming soon.\n- [SEO Products by EP Digital](https://apps.shopify.com/seo-products-with-epdigital): audits a whole Shopify catalog with 22 checks and a 0\u2013100 health score, then fixes product and collection fields in bulk with AI or custom rules, with side-by-side review before anything goes live. Install: https://seo.digitalexecutivepartner.app\n- [Zoho Middleware](https://zoho.digitalexecutivepartner.app/): one secure REST API for Zoho Creator, CRM, Projects and Bookings. Handles OAuth tokens, refresh, date formats and field metadata. Free plan (Zoho CRM, 10 requests/day) and a paid plan at $4.99/month for all services with unlimited requests.\n\n## Key facts\n\n- Platforms: Shopify, Zoho (CRM, Creator, Projects, Bookings).\n- Approach: AI proposes, the customer approves; nothing is published without the customer's review.\n- Replies to enquiries as soon as possible.\n",
};

const SERVICE_OPTIONS = 'Website & Mobile App Development\nShopify Apps\nZoho Consulting & Implementation\nZoho Middleware\nAI Chat & AI Agents\nSomething else';

const HOME_BLOCKS = [
  { type: 'hero', data: {
    badge: 'DEP', pill: 'Digital solutions for growing businesses',
    title: 'Digital solutions that', highlight: 'sync, sell and scale.',
    lead: 'Digital Executive Partner builds websites, mobile apps, Shopify apps, Zoho integrations and AI agents. Start with one of our ready-made products, or let our team build exactly what your business needs.',
    primary: { label: 'Our services →', url: '#services' },
    secondary: { label: 'See products', url: '#apps' },
    bullets: 'Modern technology\nFlexible solutions\nLong-term partnership',
    image: { src: '/assets/hero-visual-640.webp', src_large: '/assets/hero-visual-1080.webp', width: 1080, height: 1080, alt: 'Illustration of a store dashboard on a laptop with real-time Shopify to Zoho CRM sync, an SEO health score of 92 and an AI assistant chatting with a customer on a phone' },
    show_cards: true,
  } },
  { type: 'partners', data: { heading: 'Works with', items: [
    { name: 'Shopify', subtitle: 'Built for Shopify stores', logo: '/assets/brands/shopify.svg', wide: false },
    { name: 'Zoho', subtitle: 'CRM, Creator, Projects & Bookings', logo: '/assets/brands/zoho.webp', wide: true },
  ] } },
  { type: 'services', data: {
    anchor: 'services', eyebrow: 'Services', heading: 'Digital solutions, built around your business',
    lead: 'From your first website to AI agents that run part of your operations, one team designs, builds and supports it.',
    values: [
      { icon: 'tech', title: 'Modern technology', text: 'Current, proven stacks that are fast, secure and easy to grow.' },
      { icon: 'flex', title: 'Flexible solutions', text: 'Start with a ready-made product or get a fully custom build.' },
      { icon: 'part', title: 'Long-term partnership', text: 'We stay after launch with support, updates and new features.' },
    ],
    items: [
      { icon: 'web', accent: 'cyan', title: 'Website & Mobile App Development', text: 'Fast websites, web apps and iOS/Android apps, from design to launch.', bullets: 'Business websites & landing pages\nWeb apps & customer portals\niOS & Android apps (Flutter)', link_label: 'Learn more →', link_url: '/services/web-mobile-development', form_service: '' },
      { icon: 'shop', accent: 'seo', title: 'Shopify Apps', text: 'Ready-made apps plus custom Shopify apps and integrations for your store.', bullets: 'ZohoSync, Lookfit AI & SEO Products\nCustom private & public apps\nStore automation & integrations', link_label: 'Learn more →', link_url: '/services/shopify-apps', form_service: '' },
      { icon: 'zoho', accent: 'mw', title: 'Zoho Consulting & Implementation', text: 'Set up Zoho the way your team works, and connect it to the rest of your tools.', bullets: 'Zoho CRM, Creator, Projects & Bookings\nCustomization & data migration\nAPIs & integrations via Zoho Middleware', link_label: 'Learn more →', link_url: '/services/zoho-consulting', form_service: '' },
      { icon: 'ai', accent: 'look', title: 'AI Chat & AI Agents', text: 'AI that answers customers and handles repetitive work using your own data.', bullets: 'Website & support chatbots\nAI agents that automate workflows\nConnected to your CRM & store data', link_label: 'Learn more →', link_url: '/services/ai-agents', form_service: '' },
    ],
    primary: { label: 'Start a project', url: '#contact' },
    secondary: { label: 'Browse our products', url: '#apps' },
    more: { label: 'Explore all services →', url: '/services' },
  } },
  { type: 'products', data: {
    anchor: 'apps', eyebrow: 'Our products', heading: 'Four products, one team behind them',
    lead: 'Three Shopify apps and one API for Zoho. Each works on its own, so start with the one you need.',
    more: { label: 'Explore all products →', url: '/products' },
    items: [
      { anchor: 'zohosync', accent: 'sync', tag: 'ZohoSync · Shopify Zoho CRM integration', title: 'Your Shopify store and Zoho CRM, always in sync.',
        text: 'Customers, products, stock and orders flow into Zoho CRM in real time — no CSV exports, no Zapier chains, no copy and paste.',
        checks: 'Customers become Zoho contacts the moment they buy\nOrders arrive as deals with line items attached\nProducts and stock levels stay current on both sides',
        primary: { label: 'Install ZohoSync', url: 'https://zohosync.digitalexecutivepartner.app/' }, secondary: { label: 'App Store · Coming soon', url: '' },
        visual: 'sync', image: {}, schema_name: 'ZohoSync', schema_url: 'https://zohosync.digitalexecutivepartner.app/', schema_category: 'BusinessApplication', offers: '' },
      { anchor: 'lookfit', accent: 'look', tag: 'Lookfit AI · Shopify bundle app', title: '“Complete The Look” bundles for every product page.',
        text: 'Lookfit AI reads your catalogue and builds bundles for every product page: outfits, skincare routines, room sets, tech setups and more. You review, approve and publish. Shoppers add the whole bundle in one click, with a real Shopify discount at checkout.',
        checks: 'AI builds bundles from your own catalogue\nNothing goes live until you approve it\nOne-click add to cart with a native Shopify discount',
        primary: { label: 'Install Lookfit AI', url: 'https://lookfit.digitalexecutivepartner.app/' }, secondary: { label: 'App Store · Coming soon', url: '' },
        visual: 'image', image: { src: '/assets/lookfit-visual-600.webp', src_large: '/assets/lookfit-visual-1000.webp', width: 1000, height: 600, alt: 'Shopify product page for a linen overshirt with a Complete the look bundle built by Lookfit AI: organic tee, slim chinos and canvas sneakers, saving 15 percent' },
        schema_name: 'Lookfit AI', schema_url: 'https://lookfit.digitalexecutivepartner.app/', schema_category: 'BusinessApplication', offers: '' },
      { anchor: 'seo-products', accent: 'seo', tag: 'SEO Products · Shopify SEO app', title: 'Find weak and missing product content instantly. Fix it all with AI.',
        text: 'Find every SEO problem in your Shopify catalog, then fix them in bulk. The audit has no product limit: it reads your whole store and lists every problem it finds, including empty fields, descriptions too thin to rank, and copy duplicated across products. AI or rules you write yourself fill in product and collection fields, and you see each new value side by side with the old one before it goes live. Nothing publishes without you.',
        checks: '22 checks covering SEO problems, content, images and product data\nA 0–100 health score, broken down by category\nCatches thin descriptions, missing fields and copy repeated across products\nFilter the issue list and export the whole thing to CSV\nRun it again later to see what changed since the last run',
        primary: { label: 'Install SEO Products', url: 'https://seo.digitalexecutivepartner.app' }, secondary: { label: 'View on Shopify App Store ↗', url: 'https://apps.shopify.com/seo-products-with-epdigital' },
        visual: 'seo', image: {}, schema_name: 'SEO Products by EP Digital', schema_url: 'https://apps.shopify.com/seo-products-with-epdigital', schema_category: 'BusinessApplication', offers: '' },
      { anchor: 'zoho-middleware', accent: 'mw', tag: 'Zoho Middleware · REST API for Zoho', title: 'One secure API for all your Zoho apps.',
        text: 'Connect your Zoho account once. Your mobile and web apps call a clean REST API, and the middleware handles OAuth tokens, refresh, date formats and field metadata for you. No servers to run and no Zoho tokens in your app.',
        checks: 'Works with Zoho Creator, CRM, Projects and Bookings\nCRUD on any module with cursor pagination, plus built-in bookings\nNormalized fields and ISO dates, so forms are built once\nScoped API keys, every Zoho data center, AES-256-GCM encrypted tokens',
        primary: { label: 'Start free', url: 'https://zoho.digitalexecutivepartner.app/' }, secondary: { label: 'See how it works ↗', url: 'https://zoho.digitalexecutivepartner.app/' },
        visual: 'middleware', image: {}, schema_name: 'Zoho Middleware', schema_url: 'https://zoho.digitalexecutivepartner.app/', schema_category: 'DeveloperApplication', offers: 'Free | 0\nPaid — all services | 4.99 | MONTH' },
    ],
  } },
  { type: 'about', data: {
    anchor: 'about', eyebrow: 'About us', heading: 'Your long-term digital partner',
    lead: 'Digital Executive Partner builds websites, mobile apps, Shopify apps, Zoho solutions and AI agents for growing businesses. We pair modern technology with flexible engagement, from a ready-made product to a fully custom build, and we stay with you long after launch.',
    more: { label: 'More about us →', url: '/about' },
    image: { src: '/assets/about-visual-620.webp', src_large: '/assets/about-visual-1040.webp', width: 1040, height: 1040, alt: 'Illustration of a project roadmap from discovery to growth, a dedicated team, the technology stack and an active long-term support plan' },
    pillars: [
      { title: 'Products and services', text: 'Use our ready-made products, or have us build something custom.' },
      { title: 'Shopify & Zoho experts', text: 'Deep, hands-on work with both platforms every day.' },
      { title: 'You stay in control', text: 'AI proposes, you approve. Nothing goes live on its own.' },
      { title: 'Direct support', text: 'Talk to the team that builds your product.' },
    ],
  } },
  { type: 'steps', data: {
    anchor: 'how', eyebrow: 'How it works', heading: 'Live in minutes, and you stay in control',
    more: { label: 'See how it works →', url: '/how-it-works' },
    items: [
      { title: 'Install', text: "Add the app to your Shopify store in a couple of clicks. You don't need a developer." },
      { title: 'Review', text: 'See the sync, bundles or SEO fixes before anything touches your live store.' },
      { title: 'Publish', text: 'Approve what you like and push it live. Run it again whenever your catalog changes.' },
    ],
  } },
  { type: 'carousel', data: {
    anchor: 'reviews', eyebrow: 'Why merchants choose us', heading: 'Built around how you already work',
    more: { label: 'Why choose us →', url: '/why-us' },
    slides: [
      { badge: 'ZohoSync', accent: 'sync', title: 'No more Friday exports', text: 'Orders, customers and stock reach Zoho CRM the moment they happen in Shopify.' },
      { badge: 'ZohoSync', accent: 'sync', title: 'Orders become deals', text: 'Every Shopify order lands in Zoho CRM as a deal, with its line items attached.' },
      { badge: 'Zoho Middleware', accent: 'mw', title: 'One API for every Zoho app', text: 'Creator, CRM, Projects and Bookings behind one REST API, with tokens handled for you.' },
      { badge: 'Lookfit AI', accent: 'look', title: 'Bundles in seconds, not days', text: 'AI builds a Complete The Look set for every product page from your own catalogue.' },
      { badge: 'Lookfit AI', accent: 'look', title: 'Works for any catalogue', text: 'Outfits, skincare routines, room sets, tech setups: whatever you sell.' },
      { badge: 'Lookfit AI', accent: 'look', title: 'Real Shopify discounts', text: 'Shoppers add the whole bundle in one click and the discount applies at checkout.' },
      { badge: 'SEO Products', accent: 'seo', title: '22 checks, whole store', text: 'No product limit. The audit reads every product and lists every problem it finds.' },
      { badge: 'SEO Products', accent: 'seo', title: 'A score you can track', text: 'A 0–100 health score by category, and each new run shows what changed.' },
      { badge: 'SEO Products', accent: 'seo', title: 'See every fix first', text: 'Each AI or rule-based rewrite sits next to the old copy until you approve it.' },
      { badge: 'All apps', accent: 'violet', title: 'You stay in control', text: 'Nothing publishes to your store without you. That rule runs through every app.' },
    ],
    cta: { title: 'Using SEO Products?', text: 'Leave a review on the Shopify App Store ↗', url: 'https://apps.shopify.com/seo-products-with-epdigital' },
  } },
  { type: 'faq', data: {
    anchor: 'faq', eyebrow: 'FAQ', heading: 'Frequently asked questions',
    more: { label: 'See all questions →', url: '/faq' },
    items: [
      { q: 'Do the apps change my store without asking?', a: 'No. Lookfit AI bundles and SEO Products fixes both wait for your review and approval, and nothing publishes without you. ZohoSync only writes to your Zoho CRM.' },
      { q: 'What does ZohoSync sync to Zoho CRM?', a: "Customers, products, stock levels and orders, in real time. You don't need CSV exports, Zapier chains or manual copy and paste." },
      { q: 'What kinds of bundles can Lookfit AI build?', a: 'Any “Complete The Look” set that fits your catalogue, such as outfits, skincare routines, room sets or tech setups. Shoppers add the whole bundle in one click and get a real Shopify discount at checkout.' },
      { q: 'Is there a product limit on the SEO audit?', a: 'No. The audit reads your whole store, runs 22 checks and gives you a 0–100 health score broken down by category. You can filter the issues and export everything to CSV.' },
      { q: 'Can I write my own rules instead of using AI?', a: 'Yes. SEO Products fills product and collection fields using either AI or rules you write, and it shows each new value next to the old one before it goes live.' },
      { q: 'When will ZohoSync and Lookfit AI be on the Shopify App Store?', a: 'Both listings are coming soon. You can already install them through the install links above.' },
      { q: 'What is Zoho Middleware?', a: 'One secure REST API for Zoho Creator, CRM, Projects and Bookings. You connect Zoho once, and your web or mobile app calls a clean API while the middleware handles OAuth tokens, refresh, date formats and field metadata. It starts free, and the paid plan is $4.99 per month. [Learn more](https://zoho.digitalexecutivepartner.app/).' },
      { q: 'Do you take on custom projects?', a: `Yes. Besides our products, we build websites, web and mobile apps, custom Shopify apps, Zoho implementations, and AI chat and AI agents. Email [${EMAIL}](mailto:${EMAIL}?subject=New%20project%20enquiry) with a short description of your project.` },
      { q: 'How do I get support?', a: `Email us at [${EMAIL}](mailto:${EMAIL}) and we'll get back to you.` },
    ],
  } },
  { type: 'contact', data: {
    anchor: 'contact', eyebrow: 'Get in touch', heading: 'Have a project in mind?',
    lead: "Tell us what you want to build, whether it's a website, an app, a Zoho setup or an AI agent, and we'll get back to you with next steps.",
    steps: [
      { title: 'Send us a message', text: 'A few lines about your goals is enough.' },
      { title: 'We’ll get back to you as soon as possible', text: 'With questions, ideas or a time for a short call.' },
      { title: 'We plan it together', text: 'Scope, timeline and the right solution for you.' },
    ],
    email: EMAIL,
    services: SERVICE_OPTIONS,
    budgets: 'Under $1,000\n$1,000 – $5,000\n$5,000 – $15,000\n$15,000+\nNot sure yet',
    note: 'We only use your details to reply to this enquiry. No spam, ever.',
    button: 'Send message',
  } },
];

const HOME_SEO = {
  title: 'Web, Shopify, Zoho & AI Agents | Digital Executive Partner',
  description: 'Websites, mobile apps, Shopify apps, Zoho consulting and AI agents. Try ZohoSync, Lookfit AI, SEO Products and Zoho Middleware by Digital Executive Partner.',
  keywords: 'Digital Executive Partner, website development, mobile app development, Zoho consulting, Zoho implementation, Zoho partner, Zoho REST API, Zoho Creator API, Zoho middleware, AI chatbot, AI agents, Shopify apps, Shopify Zoho CRM integration, Zoho CRM sync, Shopify bundle app, complete the look, AI product bundles, Shopify SEO app, product SEO audit, bulk SEO fix',
  canonical: '', og_title: 'Digital Solutions that Sync, Sell & Scale | Digital Executive Partner',
  og_description: 'Web & mobile apps, Shopify apps, Zoho consulting and AI agents. Modern technology, flexible solutions, long-term partnership.',
  og_image: '/assets/og-image.jpg', schema_type: 'WebPage', noindex: false, json_ld: '',
};

/* ---------- Section pages (linked from the menu and the home page) ---------- */
const fromHome = (type, patch = {}) => {
  const b = structuredClone(HOME_BLOCKS.find((x) => x.type === type));
  delete b.data.more;
  Object.assign(b.data, patch);
  return b;
};
const homeFaq = HOME_BLOCKS.find((b) => b.type === 'faq').data.items;
const contactCta = (heading = 'Have a project in mind?', text = "Tell us what you want to build and we'll get back to you as soon as possible.") =>
  ({ type: 'cta', data: { heading, text, primary: { label: 'Contact us', url: '/contact' }, secondary: { label: 'See our products', url: '/products' } } });

const PROCESS_FAQ = [
  { q: 'How do I start a project?', a: 'Send us a message through the [contact form](/contact) with a few lines about your goals. We’ll get back to you as soon as possible with questions, ideas or a time for a short call.' },
  { q: 'How long does a project take?', a: 'It depends on the scope. After our first conversation we share a plan with the steps and a timeline for your project, so you know what to expect before we start.' },
  { q: 'Which platforms do you work with?', a: 'Shopify, Zoho (CRM, Creator, Projects and Bookings), modern web stacks for websites and web apps, Flutter for iOS and Android apps, and AI chat and AI agents connected to your own data.' },
  { q: 'Can you work with my existing Zoho or Shopify setup?', a: 'Yes. We start from what you already have, keep what works, and extend or connect it rather than rebuilding everything.' },
  { q: 'Do you offer support after launch?', a: 'Yes. We stay after launch with support, updates and new features, so your product keeps working as your business grows.' },
];

const PRODUCTS_PAGE = {
  type: 'page', slug: 'products', title: 'Products', status: 'published',
  excerpt: 'Four focused products from one team: Shopify apps for Zoho CRM sync, AI bundles and catalog SEO, plus one secure REST API for Zoho.',
  seo: {
    title: 'Shopify Apps & Zoho REST API | Digital Executive Partner',
    description: 'ZohoSync, Lookfit AI, SEO Products and Zoho Middleware: Shopify apps for CRM sync, AI bundles and catalog SEO, plus one secure REST API for Zoho.',
    keywords: 'Shopify apps, Shopify Zoho CRM integration, Shopify bundle app, Shopify SEO app, Zoho REST API, Zoho middleware',
    schema_type: 'CollectionPage', og_image: '/assets/og-image.jpg',
  },
  blocks: [
    { type: 'page_header', data: { eyebrow: 'Products', title: 'Shopify apps and a REST API for Zoho', lead: 'Four focused products from one team: sync Shopify with Zoho CRM, build “Complete The Look” bundles, fix catalog SEO in bulk, and connect any app to Zoho through one secure API.', primary: { label: 'Compare products', url: '#compare' }, secondary: { label: 'Talk to us', url: '/contact' }, image: {} } },
    fromHome('products', { anchor: 'all-products', eyebrow: 'All products', heading: 'Pick the tool for the job', lead: 'Each product works on its own. Install one today and add others when you need them.' }),
    { type: 'richtext', data: { anchor: 'compare', body: `## Which product is right for you?

| If you want to… | Use | Works with |
|---|---|---|
| Keep customers, orders and stock in sync between Shopify and Zoho CRM | [ZohoSync](https://zohosync.digitalexecutivepartner.app/) | Shopify, Zoho CRM |
| Raise order value with “Complete The Look” bundles on every product page | [Lookfit AI](https://lookfit.digitalexecutivepartner.app/) | Shopify |
| Find and fix missing, thin or duplicated product content for SEO | [SEO Products](https://apps.shopify.com/seo-products-with-epdigital) | Shopify |
| Read and write Zoho data from your own web or mobile app | [Zoho Middleware](https://zoho.digitalexecutivepartner.app/) | Zoho Creator, CRM, Projects, Bookings |

## Built the same way

- **You stay in control.** Lookfit AI bundles and SEO Products fixes wait for your approval. Nothing publishes on its own.
- **No product limits.** The SEO audit reads your whole store, not a sample of it.
- **Native to the platform.** Real Shopify discounts, real Zoho fields and modules, no workarounds.
- **Backed by the team that built them.** Questions go straight to the people who wrote the code.

Need something none of these do? We also build custom Shopify apps, Zoho integrations and AI agents. [See our services](/#services).` } },
    { type: 'faq', data: { anchor: 'products-faq', eyebrow: 'FAQ', heading: 'Questions about our products', items: homeFaq.slice(0, 7) } },
    contactCta('Not sure which product fits?', "Tell us about your store or app and we'll point you to the right tool, or build what's missing."),
  ],
};

const ABOUT_PAGE = {
  type: 'page', slug: 'about', title: 'About us', status: 'published',
  excerpt: 'We build websites, mobile apps, Shopify apps, Zoho solutions and AI agents for growing businesses, and we stay with you after launch.',
  seo: {
    title: 'About Us | Digital Executive Partner',
    description: 'Digital Executive Partner builds websites, mobile apps, Shopify apps, Zoho solutions and AI agents, with modern technology and long-term support.',
    schema_type: 'AboutPage', og_image: '/assets/og-image.jpg',
  },
  blocks: [
    { type: 'page_header', data: { eyebrow: 'About us', title: 'Your long-term digital partner', lead: 'We build websites, mobile apps, Shopify apps, Zoho solutions and AI agents for growing businesses, and we stay with you after launch.', primary: { label: 'Work with us', url: '/contact' }, secondary: { label: 'See our products', url: '/products' }, image: {} } },
    fromHome('about', { anchor: 'who-we-are', eyebrow: 'Who we are', heading: 'One team for products and custom builds' }),
    { type: 'cards', data: { anchor: 'values', eyebrow: 'Our values', heading: 'What we stand for', lead: '', columns: '3', items: [
      { title: 'Modern technology', text: 'Current, proven stacks that are fast, secure and easy to grow.', url: '' },
      { title: 'Flexible solutions', text: 'Start with a ready-made product or get a fully custom build.', url: '' },
      { title: 'Long-term partnership', text: 'We stay after launch with support, updates and new features.', url: '' },
    ] } },
    { type: 'richtext', data: { anchor: 'what-we-do', body: `## What we do

We work in two ways:

- **Ready-made products.** ZohoSync, Lookfit AI, SEO Products and Zoho Middleware each solve one specific problem for Shopify merchants and Zoho users. [See all products](/products).
- **Custom builds.** Websites, web and mobile apps, custom Shopify apps, Zoho implementations, and AI chat and AI agents, designed around how your team already works.

## How we work with you

Every project starts with your goals, not a template. We agree the scope together, build in short steps you can review, and keep you in control of anything that touches your live store or CRM. After launch we stay on for support, updates and new features. [See how it works](/how-it-works).

## Platforms we know well

- **Shopify:** apps, store automation and integrations.
- **Zoho:** CRM, Creator, Projects and Bookings, plus APIs through Zoho Middleware.
- **Web and mobile:** modern web stacks, and Flutter for iOS and Android apps.
- **AI:** chatbots and AI agents connected to your own CRM and store data.` } },
    contactCta(),
  ],
};

const HOW_PAGE = {
  type: 'page', slug: 'how-it-works', title: 'How it works', status: 'published',
  excerpt: 'Install one of our products in minutes, or work with our team on a custom build. Either way, you approve every change.',
  seo: {
    title: 'How It Works | Digital Executive Partner',
    description: 'How Digital Executive Partner works: install our Shopify and Zoho products in minutes, or follow a clear four-step process for custom builds.',
    schema_type: 'WebPage', og_image: '/assets/og-image.jpg',
  },
  blocks: [
    { type: 'page_header', data: { eyebrow: 'How it works', title: 'From first message to long-term support', lead: 'Two simple paths: install one of our products in minutes, or work with our team on a custom build. Either way, you approve every change.', primary: { label: 'Start a project', url: '/contact' }, secondary: { label: 'See our products', url: '/products' }, image: {} } },
    fromHome('steps', { anchor: 'products-path', eyebrow: 'Using our products', heading: 'Live in minutes, and you stay in control' }),
    { type: 'steps', data: { anchor: 'projects-path', eyebrow: 'Custom projects', heading: 'A clear process for custom builds', lead: 'Websites, apps, Zoho implementations and AI agents all follow the same four steps.', items: [
      { title: 'Discover', text: 'We learn your goals, your users and what success looks like, then agree the scope together.' },
      { title: 'Design', text: 'You review the flows and the interface before we build anything.' },
      { title: 'Build', text: 'We build in short steps and show you working results along the way.' },
      { title: 'Launch & grow', text: 'Testing, release and training, then ongoing support, updates and new features.' },
    ] } },
    { type: 'richtext', data: { anchor: 'what-to-expect', body: `## What you can expect

- **One team, end to end.** The people who plan your project are the people who build and support it.
- **You approve before anything goes live.** That applies to our products and to custom work.
- **Clear communication.** We reply to every enquiry as soon as possible.
- **Support after launch.** We stay on for maintenance, updates and new features.` } },
    { type: 'faq', data: { anchor: 'process-faq', eyebrow: 'FAQ', heading: 'Questions about working with us', items: [
      PROCESS_FAQ[0], PROCESS_FAQ[1],
      { q: 'Do I need a developer to install your apps?', a: "No. Our Shopify apps install in a couple of clicks, and you review every change before it touches your live store." },
      PROCESS_FAQ[3], PROCESS_FAQ[4],
    ] } },
    contactCta(),
  ],
};

const WHY_PAGE = {
  type: 'page', slug: 'why-us', title: 'Why us', status: 'published',
  excerpt: 'Focused products, a team that knows Shopify and Zoho deeply, and one simple rule: you approve every change.',
  seo: {
    title: 'Why Choose Us | Digital Executive Partner',
    description: 'Why choose Digital Executive Partner: focused Shopify and Zoho products, hands-on experts, modern technology, and you approve every change.',
    schema_type: 'WebPage', og_image: '/assets/og-image.jpg',
  },
  blocks: [
    { type: 'page_header', data: { eyebrow: 'Why us', title: 'Why businesses choose Digital Executive Partner', lead: 'Focused products, a team that knows Shopify and Zoho deeply, and one simple rule: you approve every change.', primary: { label: 'Talk to us', url: '/contact' }, secondary: { label: 'See our products', url: '/products' }, image: {} } },
    fromHome('carousel', { anchor: 'reasons' }),
    { type: 'cards', data: { anchor: 'different', eyebrow: 'What makes us different', heading: 'Six reasons to work with us', lead: '', columns: '3', items: [
      { title: 'Products and services', text: 'Use our ready-made products, or have us build something custom. One team for both.', url: '/products' },
      { title: 'Shopify & Zoho experts', text: 'Deep, hands-on work with both platforms every day.', url: '' },
      { title: 'You stay in control', text: 'AI proposes, you approve. Nothing goes live on its own.', url: '' },
      { title: 'Direct support', text: 'Talk to the team that builds your product, not a ticket queue.', url: '/contact' },
      { title: 'Modern technology', text: 'Fast, secure, proven stacks that are easy to grow.', url: '' },
      { title: 'Long-term partnership', text: 'We stay after launch with support, updates and new features.', url: '/how-it-works' },
    ] } },
    { type: 'richtext', data: { anchor: 'promise', body: `## Our promise

We build tools we would use ourselves. Each one solves one problem well, never changes your store or CRM without your approval, and is backed by the team that built it.

Using one of our apps? We'd love to hear what you think on the [Shopify App Store](https://apps.shopify.com/seo-products-with-epdigital).` } },
    contactCta(),
  ],
};

const FAQ_PAGE = {
  type: 'page', slug: 'faq', title: 'FAQ', status: 'published',
  excerpt: 'Answers about our products, services and how we work.',
  seo: {
    title: 'Frequently Asked Questions | Digital Executive Partner',
    description: 'Answers about ZohoSync, Lookfit AI, SEO Products, Zoho Middleware and working with Digital Executive Partner on websites, apps, Zoho and AI.',
    schema_type: 'WebPage', og_image: '/assets/og-image.jpg',
  },
  blocks: [
    { type: 'page_header', data: { eyebrow: 'FAQ', title: 'Frequently asked questions', lead: "Answers about our products, services and how we work. Can't find what you need? Ask us.", primary: { label: 'Ask a question', url: '/contact' }, secondary: { label: '', url: '' }, image: {} } },
    { type: 'faq', data: { anchor: 'products-faq', eyebrow: 'Products', heading: 'Questions about our products', items: homeFaq.slice(0, 7) } },
    { type: 'faq', data: { anchor: 'services-faq', eyebrow: 'Services & projects', heading: 'Working with us', items: [homeFaq[7], ...PROCESS_FAQ, homeFaq[8]] } },
    contactCta('Still have a question?', "Send us a message and we'll get back to you as soon as possible."),
  ],
};

const CONTACT_PAGE = {
  type: 'page', slug: 'contact', title: 'Contact us', status: 'published',
  excerpt: 'Tell us about your project or ask about our products. We’ll get back to you as soon as possible.',
  seo: {
    title: 'Contact Us | Digital Executive Partner',
    description: 'Contact Digital Executive Partner about websites, mobile apps, Shopify apps, Zoho or AI agents. Send a message and we reply as soon as possible.',
    schema_type: 'ContactPage', og_image: '/assets/og-image.jpg',
  },
  blocks: [
    { type: 'page_header', data: { eyebrow: 'Contact', title: 'Contact us', lead: 'Tell us about your project or ask a question about our products. We’ll get back to you as soon as possible.', primary: { label: '', url: '' }, secondary: { label: '', url: '' }, image: {} } },
    fromHome('contact', { anchor: 'contact', eyebrow: 'Get in touch', heading: 'Send us a message' }),
    { type: 'cards', data: { anchor: 'other-ways', eyebrow: 'Other ways to reach us', heading: 'We’re easy to reach', lead: '', columns: '3', items: [
      { title: 'Email', text: EMAIL, url: `mailto:${EMAIL}` },
      { title: 'Response time', text: 'We reply to every enquiry as soon as possible.', url: '' },
      { title: 'Languages', text: 'We work in English and Vietnamese.', url: '' },
    ] } },
    { type: 'faq', data: { anchor: 'contact-faq', eyebrow: 'FAQ', heading: 'Before you write', items: [PROCESS_FAQ[0], homeFaq[8], PROCESS_FAQ[4]] } },
  ],
};


/* ---------- Services: overview + detail pages ---------- */
const SERVICE_LIST = [
  { slug: 'web-mobile-development', title: 'Website & Mobile App Development', short: 'Fast websites, web apps and iOS/Android apps, from design to launch.' },
  { slug: 'shopify-apps', title: 'Shopify Apps', short: 'Ready-made apps plus custom Shopify apps and integrations for your store.' },
  { slug: 'zoho-consulting', title: 'Zoho Consulting & Implementation', short: 'Set up Zoho the way your team works, and connect it to the rest of your tools.' },
  { slug: 'ai-agents', title: 'AI Chat & AI Agents', short: 'AI that answers customers and handles repetitive work using your own data.' },
];
const otherServices = (current) => ({ type: 'cards', data: { anchor: 'other-services', eyebrow: 'More services', heading: 'Other ways we can help', lead: '', columns: '3',
  items: SERVICE_LIST.filter((s) => s.slug !== current).map((s) => ({ title: s.title, text: s.short, url: `/services/${s.slug}` })),
  more: { label: 'All services →', url: '/services' } } });
const serviceContact = (service, heading) => fromHome('contact', { anchor: 'contact', eyebrow: 'Start a project', heading, preselect: service });
const CUSTOM_PROCESS = (overrides = {}) => ({ type: 'steps', data: { anchor: 'process', eyebrow: 'How we work', heading: overrides.heading || 'A clear, four-step process', lead: overrides.lead || 'You see progress at every step and approve before anything goes live.', items: overrides.items } });

const SERVICES_PAGE = {
  type: 'page', slug: 'services', title: 'Services', status: 'published',
  excerpt: 'Websites and mobile apps, Shopify apps, Zoho consulting and AI agents, designed, built and supported by one team.',
  seo: {
    title: 'Web, Shopify, Zoho & AI Services | Digital Executive Partner',
    description: 'Website and mobile app development, custom Shopify apps, Zoho consulting and implementation, and AI chatbots and agents from one team.',
    keywords: 'website development, mobile app development, Flutter, Shopify app development, Zoho consulting, Zoho implementation, AI chatbot, AI agents',
    schema_type: 'CollectionPage', og_image: '/assets/og-image.jpg',
  },
  blocks: [
    { type: 'page_header', data: { eyebrow: 'Services', title: 'Digital solutions, built around your business', lead: 'From your first website to AI agents that run part of your operations, one team designs, builds and supports it.', primary: { label: 'Start a project', url: '/contact' }, secondary: { label: 'See our products', url: '/products' }, image: {}, visual: 'services' } },
    (() => { const b = fromHome('services', { anchor: 'all-services', eyebrow: 'What we do', heading: 'Four services, one team', lead: 'Pick a service to see what we deliver, how we work and answers to common questions.', primary: { label: '', url: '' }, secondary: { label: '', url: '' } }); return b; })(),
    CUSTOM_PROCESS({ items: [
      { title: 'Discover', text: 'We learn your goals, your users and what success looks like, then agree the scope together.' },
      { title: 'Design', text: 'You review the flows and the interface before we build anything.' },
      { title: 'Build', text: 'We build in short steps and show you working results along the way.' },
      { title: 'Launch & grow', text: 'Testing, release and training, then ongoing support, updates and new features.' },
    ] }),
    { type: 'cards', data: { anchor: 'products', eyebrow: 'Prefer a ready-made tool?', heading: 'Start with one of our products', lead: 'If one of our products already solves your problem, you can be live in minutes.', columns: '4', items: [
      { title: 'ZohoSync', text: 'Shopify and Zoho CRM, always in sync.', url: '/products#zohosync' },
      { title: 'Lookfit AI', text: '“Complete The Look” bundles for every product page.', url: '/products#lookfit' },
      { title: 'SEO Products', text: 'Find and fix catalog SEO problems in bulk.', url: '/products#seo-products' },
      { title: 'Zoho Middleware', text: 'One secure REST API for all your Zoho apps.', url: '/products#zoho-middleware' },
    ] } },
    { type: 'faq', data: { anchor: 'services-faq', eyebrow: 'FAQ', heading: 'Questions about our services', items: [homeFaq[7], ...PROCESS_FAQ] } },
    contactCta('Not sure which service you need?', "Describe what you want to achieve and we'll suggest the right approach, product or custom build."),
  ],
};

const SERVICE_PAGES = [
  {
    type: 'page', slug: 'services/web-mobile-development', title: 'Website & Mobile App Development', status: 'published',
    excerpt: 'Fast, modern websites, web apps and iOS/Android apps, designed around your users, built to grow and supported after launch.',
    seo: {
      title: 'Website & Mobile App Development | Digital Executive Partner',
      description: 'Fast websites, web apps, customer portals and iOS/Android apps built with Flutter. SEO-ready, connected to Shopify or Zoho, supported after launch.',
      keywords: 'website development, web app development, mobile app development, Flutter app, customer portal, landing page',
      schema_type: 'Service', og_image: '/assets/og-image.jpg',
    },
    blocks: [
      { type: 'page_header', data: { eyebrow: 'Service', title: 'Website & Mobile App Development', lead: 'Fast, modern websites, web apps and iOS/Android apps, designed around your users, built to grow and supported after launch.', primary: { label: 'Start a project', url: '#contact' }, secondary: { label: 'See how we work', url: '#process' }, image: {}, visual: 'web' } },
      { type: 'cards', data: { anchor: 'deliverables', eyebrow: 'What we deliver', heading: 'Everything you need to launch and grow online', lead: '', columns: '3', items: [
        { title: 'Business websites & landing pages', text: 'Clear, fast pages that explain what you do and turn visitors into enquiries.', url: '' },
        { title: 'Web apps & customer portals', text: 'Logins, dashboards, bookings and self-service tools for your customers or team.', url: '' },
        { title: 'iOS & Android apps', text: 'One Flutter codebase for both platforms, so you launch on both stores together.', url: '' },
        { title: 'E-commerce & integrations', text: 'Connect your site or app to Shopify, Zoho, payments and email.', url: '' },
        { title: 'Performance & SEO built in', text: 'Fast loading, structured data, clean URLs and accessible design from day one.', url: '' },
        { title: 'Content you can edit', text: 'A simple CMS so you can update pages, posts and SEO without a developer.', url: '' },
      ] } },
      { type: 'split', data: { anchor: 'why', eyebrow: 'Why it matters', heading: 'Built for speed, search and growth', body: 'Your website is often the first conversation a customer has with you. We build sites and apps that load quickly, are easy to find on Google, and are simple for your team to keep up to date.\n\nEverything is built on modern, proven technology, so it stays fast and secure as your business grows.', checklist: 'Fast loading on every device\nSEO-ready structure, meta tags and structured data\nAccessible design that works for everyone\nEasy content updates with a CMS\nConnected to your CRM, store or booking tools', aside_title: 'A good fit if you…', aside_items: 'Need a new website or a redesign\nWant a customer portal or internal tool\nNeed an iOS and Android app from one codebase\nWant your site or app connected to Zoho or Shopify', reverse: false } },
      CUSTOM_PROCESS({ items: [
        { title: 'Discover', text: 'We map your goals, your users and the pages or screens you need.' },
        { title: 'Design', text: 'Wireframes and visual design you review and approve before we build.' },
        { title: 'Build', text: 'We develop in short steps with a working preview you can try along the way.' },
        { title: 'Launch & grow', text: 'Testing on real devices, release, training, then support and new features.' },
      ] }),
      { type: 'tags', data: { anchor: 'technology', eyebrow: 'Technology', heading: 'Modern, proven technology', lead: 'We choose the stack that fits your project and is easy to maintain long term.', groups: [
        { title: 'Web', items: 'Modern JavaScript frameworks\nCloudflare Workers & Pages\nREST APIs\nHeadless CMS' },
        { title: 'Mobile', items: 'Flutter\niOS\nAndroid\nPush notifications' },
        { title: 'Integrations', items: 'Shopify\nZoho\nPayments\nEmail & SMTP' },
      ] } },
      { type: 'faq', data: { anchor: 'faq', eyebrow: 'FAQ', heading: 'Website & app questions', items: [
        { q: 'Can you build both the website and the mobile app?', a: 'Yes. We often build a website and an iOS/Android app together, sharing the same backend and data so everything stays in sync.' },
        { q: 'Can I update the content myself?', a: 'Yes. We can include a simple content management system, like the one this website runs on, so you can edit pages, posts, images and SEO without a developer.' },
        { q: 'Will my website be SEO-friendly?', a: 'Yes. Clean URLs, fast loading, meta tags, structured data, a sitemap and accessible markup are part of every build, not an extra.' },
        { q: 'Can you connect my site or app to Zoho or Shopify?', a: 'Yes. We connect to Shopify directly, and to Zoho CRM, Creator, Projects and Bookings through [Zoho Middleware](https://zoho.digitalexecutivepartner.app/) or Zoho’s own APIs.' },
        PROCESS_FAQ[4],
      ] } },
      serviceContact('Website & Mobile App Development', 'Tell us about your website or app'),
      otherServices('web-mobile-development'),
    ],
  },
  {
    type: 'page', slug: 'services/shopify-apps', title: 'Shopify App Development', status: 'published',
    excerpt: 'Ready-made Shopify apps for CRM sync, bundles and SEO, plus custom private and public apps built around how your store works.',
    seo: {
      title: 'Custom Shopify App Development | Digital Executive Partner',
      description: 'Custom private and public Shopify apps, store automation and integrations, plus ready-made apps for Zoho CRM sync, AI bundles and catalog SEO.',
      keywords: 'Shopify app development, custom Shopify app, Shopify private app, Shopify integration, Shopify automation',
      schema_type: 'Service', og_image: '/assets/og-image.jpg',
    },
    blocks: [
      { type: 'page_header', data: { eyebrow: 'Service', title: 'Shopify App Development', lead: 'Ready-made apps for CRM sync, bundles and SEO, plus custom private and public Shopify apps built around how your store works.', primary: { label: 'Discuss your app', url: '#contact' }, secondary: { label: 'See our Shopify apps', url: '#apps' }, image: {}, visual: 'shop' } },
      { type: 'cards', data: { anchor: 'deliverables', eyebrow: 'What we deliver', heading: 'Apps that fit your store, not the other way round', lead: '', columns: '3', items: [
        { title: 'Custom private apps', text: 'Tools built only for your store, for the workflows off-the-shelf apps don’t cover.', url: '' },
        { title: 'Public App Store apps', text: 'From idea to a listed app, including billing and the Shopify review process.', url: '' },
        { title: 'Store automation', text: 'Remove repetitive work: tagging, order routing, stock rules and notifications.', url: '' },
        { title: 'Integrations', text: 'Connect Shopify to your CRM, ERP, marketing or fulfilment tools.', url: '' },
        { title: 'Storefront extensions', text: 'Theme app extensions and blocks that add features without editing theme code.', url: '' },
        { title: 'Data sync & reporting', text: 'Keep products, customers and orders consistent across systems.', url: '' },
      ] } },
      { type: 'split', data: { anchor: 'why', eyebrow: 'Why custom', heading: 'Automate the work that slows your store down', body: 'Most stores outgrow a stack of disconnected apps. We look at how your team actually works, then build the app or integration that removes the manual steps.\n\nEvery app we build follows the same rule as our own products: it never changes your live store without your approval.', checklist: 'Built on Shopify’s official APIs and webhooks\nLightweight, so your storefront stays fast\nChanges reviewed and approved by you\nDocumented and supported after launch', aside_title: 'A good fit if you…', aside_items: 'Copy data between Shopify and other tools by hand\nPay for several apps that each do part of the job\nNeed a feature no App Store app offers\nWant to launch your own app on the App Store', reverse: false } },
      { type: 'cards', data: { anchor: 'apps', eyebrow: 'Ready-made', heading: 'Or start with one of our Shopify apps', lead: 'Already solves your problem? Install in minutes.', columns: '3', items: [
        { title: 'ZohoSync', text: 'Customers, products, stock and orders flow into Zoho CRM in real time.', url: '/products#zohosync' },
        { title: 'Lookfit AI', text: '“Complete The Look” bundles for every product page, with a real Shopify discount.', url: '/products#lookfit' },
        { title: 'SEO Products', text: '22 checks across your whole catalog, then bulk fixes you approve.', url: '/products#seo-products' },
      ] } },
      CUSTOM_PROCESS({ items: [
        { title: 'Discover', text: 'We map your current apps, data and manual steps, and agree what the app must do.' },
        { title: 'Design', text: 'Screens and data flows you approve, built with Shopify’s design guidelines.' },
        { title: 'Build & review', text: 'We build on a development store first, so you can test safely.' },
        { title: 'Launch & support', text: 'Install on your live store, or submit to the App Store, then ongoing support.' },
      ] }),
      { type: 'tags', data: { anchor: 'technology', eyebrow: 'Technology', heading: 'Built on Shopify’s official platform', lead: '', groups: [
        { title: 'Shopify APIs', items: 'Admin API (GraphQL)\nStorefront API\nWebhooks\nShopify Functions' },
        { title: 'Storefront', items: 'Theme app extensions\nApp blocks\nCheckout UI extensions' },
        { title: 'Connected to', items: 'Zoho CRM\nERP & accounting\nMarketing tools\nFulfilment' },
      ] } },
      { type: 'faq', data: { anchor: 'faq', eyebrow: 'FAQ', heading: 'Shopify app questions', items: [
        { q: 'Should I use a ready-made app or a custom one?', a: 'If an existing app does what you need, start there; it’s faster and cheaper. A custom app makes sense when you’re combining several apps, copying data by hand, or need a feature no app offers.' },
        { q: 'Can you build an app for the Shopify App Store?', a: 'Yes. We handle the app, billing, listing and the Shopify review process, and support it after launch.' },
        { q: 'Will a custom app slow down my store?', a: 'We keep storefront code minimal and do heavy work in the background, so your store stays fast.' },
        { q: 'Do your apps change my store automatically?', a: 'No. Like our own products, the apps we build propose changes and wait for your approval before anything touches your live store.' },
        { q: 'Can you connect Shopify with my CRM or ERP?', a: 'Yes. For Zoho CRM you can use [ZohoSync](https://zohosync.digitalexecutivepartner.app/) today; for other systems we build a custom integration.' },
      ] } },
      serviceContact('Shopify Apps', 'Tell us about your Shopify app'),
      otherServices('shopify-apps'),
    ],
  },
  {
    type: 'page', slug: 'services/zoho-consulting', title: 'Zoho Consulting & Implementation', status: 'published',
    excerpt: 'Set up Zoho CRM, Creator, Projects and Bookings the way your team works, move your data safely, and connect Zoho to your store and apps.',
    seo: {
      title: 'Zoho Consulting & Implementation | Digital Executive Partner',
      description: 'Zoho CRM, Creator, Projects and Bookings setup and customization, data migration, and integrations with Shopify and your own apps.',
      keywords: 'Zoho consulting, Zoho implementation, Zoho CRM setup, Zoho Creator development, Zoho integration, Zoho data migration',
      schema_type: 'Service', og_image: '/assets/og-image.jpg',
    },
    blocks: [
      { type: 'page_header', data: { eyebrow: 'Service', title: 'Zoho Consulting & Implementation', lead: 'Set up Zoho CRM, Creator, Projects and Bookings the way your team works, move your data safely, and connect Zoho to your store and apps.', primary: { label: 'Talk to a Zoho expert', url: '#contact' }, secondary: { label: 'See our Zoho tools', url: '#tools' }, image: {}, visual: 'zoho' } },
      { type: 'cards', data: { anchor: 'deliverables', eyebrow: 'What we deliver', heading: 'Zoho, set up for how you work', lead: '', columns: '3', items: [
        { title: 'Zoho CRM setup', text: 'Modules, fields, pipelines, layouts and automation that match your sales process.', url: '' },
        { title: 'Zoho Creator apps', text: 'Custom apps and forms for the workflows your team runs every day.', url: '' },
        { title: 'Projects & Bookings', text: 'Project tracking and online booking connected to your CRM.', url: '' },
        { title: 'Data migration', text: 'Move data from spreadsheets or another CRM, cleaned and mapped correctly.', url: '' },
        { title: 'Integrations', text: 'Connect Zoho to Shopify, your website and your mobile apps.', url: '' },
        { title: 'Training & support', text: 'Hands-on training for your team, then ongoing help as you grow.', url: '' },
      ] } },
      { type: 'split', data: { anchor: 'why', eyebrow: 'Why it matters', heading: 'One system your whole team actually uses', body: 'Zoho is powerful, but out of the box it rarely matches how a business works. We start from your process, configure only what you need, and connect Zoho to the tools you already use, so your team works in one place instead of five.', checklist: 'Configured around your real sales and service process\nClean data, migrated and checked\nConnected to Shopify and your apps\nYour team trained and confident', aside_title: 'A good fit if you…', aside_items: 'Are moving to Zoho from spreadsheets or another CRM\nHave Zoho but your team doesn’t use it fully\nWant Shopify orders and customers in Zoho CRM\nNeed your web or mobile app to read and write Zoho data', reverse: false } },
      { type: 'cards', data: { anchor: 'tools', eyebrow: 'Our Zoho tools', heading: 'Products that make Zoho easier', lead: '', columns: '2', items: [
        { title: 'ZohoSync', text: 'Keep your Shopify store and Zoho CRM in sync in real time, with no CSV exports or Zapier chains.', url: '/products#zohosync' },
        { title: 'Zoho Middleware', text: 'One secure REST API for Zoho Creator, CRM, Projects and Bookings, for your web and mobile apps.', url: '/products#zoho-middleware' },
      ] } },
      CUSTOM_PROCESS({ items: [
        { title: 'Audit', text: 'We review your current tools, data and process, and agree the target setup.' },
        { title: 'Configure', text: 'Modules, fields, automation and permissions, tested with your team.' },
        { title: 'Migrate & connect', text: 'Data moved and checked, and Zoho connected to your store and apps.' },
        { title: 'Train & support', text: 'Training for each role, then ongoing support and improvements.' },
      ] }),
      { type: 'tags', data: { anchor: 'technology', eyebrow: 'Platforms', heading: 'The Zoho apps we work with', lead: '', groups: [
        { title: 'Zoho apps', items: 'Zoho CRM\nZoho Creator\nZoho Projects\nZoho Bookings' },
        { title: 'Development', items: 'Deluge scripts\nZoho REST APIs\nWebhooks\nZoho Middleware' },
        { title: 'Data centers', items: 'US\nEU\nIndia\nAustralia\nJapan\nCanada\nSaudi Arabia\nChina' },
      ] } },
      { type: 'faq', data: { anchor: 'faq', eyebrow: 'FAQ', heading: 'Zoho questions', items: [
        { q: 'Can you work with my existing Zoho setup?', a: 'Yes. We review what you already have, keep what works, and fix or extend the rest rather than starting over.' },
        { q: 'Can you migrate data from spreadsheets or another CRM?', a: 'Yes. We map your fields, clean duplicates and check the result with you before your team switches over.' },
        { q: 'How do you connect Zoho with Shopify?', a: 'With [ZohoSync](https://zohosync.digitalexecutivepartner.app/), customers, products, stock and orders flow from Shopify into Zoho CRM in real time. For special cases we build a custom integration.' },
        { q: 'Can my website or mobile app read and write Zoho data?', a: 'Yes. [Zoho Middleware](https://zoho.digitalexecutivepartner.app/) gives your app one secure REST API for Zoho Creator, CRM, Projects and Bookings, without storing Zoho tokens in your app.' },
        { q: 'Which Zoho data centers do you support?', a: 'All of them: US, EU, India, Australia, Japan, Canada, Saudi Arabia and China.' },
      ] } },
      serviceContact('Zoho Consulting & Implementation', 'Tell us about your Zoho project'),
      otherServices('zoho-consulting'),
    ],
  },
  {
    type: 'page', slug: 'services/ai-agents', title: 'AI Chat & AI Agents', status: 'published',
    excerpt: 'AI chatbots and AI agents that answer customers and handle repetitive work, using your own data and connected to your CRM and store.',
    seo: {
      title: 'AI Chatbots & AI Agents | Digital Executive Partner',
      description: 'AI chatbots and AI agents that answer customers and automate workflows using your own content, connected to your CRM and store, with human approval.',
      keywords: 'AI chatbot, AI agent, customer support chatbot, AI automation, AI for Shopify, AI for Zoho CRM',
      schema_type: 'Service', og_image: '/assets/og-image.jpg',
    },
    blocks: [
      { type: 'page_header', data: { eyebrow: 'Service', title: 'AI Chat & AI Agents', lead: 'AI chatbots and AI agents that answer customers and take care of repetitive work, using your own data and connected to your CRM and store.', primary: { label: 'Discuss your AI project', url: '#contact' }, secondary: { label: 'See how it works', url: '#process' }, image: {}, visual: 'ai' } },
      { type: 'cards', data: { anchor: 'deliverables', eyebrow: 'What we deliver', heading: 'AI that does real work for your business', lead: '', columns: '3', items: [
        { title: 'Website & support chatbots', text: 'Answer common questions instantly, day and night, in your brand’s voice.', url: '' },
        { title: 'AI agents for workflows', text: 'Agents that take actions: update orders, create CRM records, draft replies.', url: '' },
        { title: 'Grounded in your data', text: 'Answers come from your own help content, products and policies.', url: '' },
        { title: 'Human handoff & approvals', text: 'The AI hands over to a person when unsure, and asks before sensitive actions.', url: '' },
        { title: 'Connected to your tools', text: 'Works with Zoho CRM, Shopify and the systems you already use.', url: '' },
        { title: 'Monitoring & improvement', text: 'Logs of every conversation and action, so we can keep improving answers.', url: '' },
      ] } },
      { type: 'split', data: { anchor: 'why', eyebrow: 'Our approach', heading: 'AI that works with your team, not around it', body: 'Good AI is less about the model and more about the guardrails. We ground answers in your own content, connect the AI only to the data it needs, and keep a person in the loop for anything that matters.\n\nThe result is an assistant your customers can trust and your team can supervise.', checklist: 'Answers based on your own content\nHands off to a person when it isn’t sure\nAsks for approval before sensitive actions\nClear logs of what the AI said and did', aside_title: 'A good fit if you…', aside_items: 'Answer the same customer questions every day\nCopy information between email, chat and your CRM\nWant support outside business hours\nWant to try AI safely on one workflow first', reverse: false } },
      CUSTOM_PROCESS({ heading: 'From pilot to production', lead: 'We start small, prove it works on one workflow, then expand.', items: [
        { title: 'Discover', text: 'We pick one high-value workflow and the data the AI needs to handle it.' },
        { title: 'Prototype', text: 'A working assistant tested on real questions, reviewed by your team.' },
        { title: 'Connect & test', text: 'Connected to your CRM or store with the right permissions and approvals.' },
        { title: 'Launch & improve', text: 'Go live, monitor conversations and keep improving answers and actions.' },
      ] }),
      { type: 'tags', data: { anchor: 'technology', eyebrow: 'Technology', heading: 'What powers it', lead: '', groups: [
        { title: 'AI', items: 'Large language models\nRetrieval from your documents\nTool use & actions' },
        { title: 'Channels', items: 'Website chat widget\nEmail\nInternal tools' },
        { title: 'Data', items: 'Zoho CRM\nShopify\nHelp articles & policies' },
      ] } },
      { type: 'faq', data: { anchor: 'faq', eyebrow: 'FAQ', heading: 'AI questions', items: [
        { q: 'Will the AI make things up?', a: 'We reduce this by grounding answers in your own content and telling the AI to hand over to a person when it isn’t sure. No AI is perfect, so we also log conversations and review them to keep improving.' },
        { q: 'Can the AI take actions, like updating an order or a CRM record?', a: 'Yes, with the permissions you choose. Sensitive actions, such as refunds, can require approval from your team before they happen.' },
        { q: 'What data does the AI need?', a: 'Only what the workflow requires, such as your help articles, product details and the CRM or order fields it needs to read or update.' },
        { q: 'Can it work in English and Vietnamese?', a: 'Modern AI models handle many languages. We test the assistant in the languages your customers use before launch.' },
        { q: 'Can a person take over a conversation?', a: 'Yes. Handoff to your team is built in, so customers are never stuck with the bot.' },
      ] } },
      serviceContact('AI Chat & AI Agents', 'Tell us about your AI project'),
      otherServices('ai-agents'),
    ],
  },
];

export const PAGES = [
  { type: 'home', slug: '', title: 'Home', status: 'published', excerpt: '', blocks: HOME_BLOCKS, seo: HOME_SEO },
  PRODUCTS_PAGE, ABOUT_PAGE, HOW_PAGE, WHY_PAGE, FAQ_PAGE, CONTACT_PAGE,
  SERVICES_PAGE, ...SERVICE_PAGES,
];

// Real photos (page headers + image blocks), see db/photos.js
for (const p of PAGES) applyPagePhotos(p);

