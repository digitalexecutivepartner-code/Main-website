// Cloudflare Worker entry: CMS-rendered site, admin, contact form and static assets.
import { handleContact } from './contact.js';
import { route } from './site/router.js';
import { handleAdmin } from './admin/routes.js';
import { servePage } from './cache.js';
import { serveMedia } from './media.js';
import { handleChat, warmChat } from './chat/handler.js';
import { handleLead } from './chat/lead.js';
import { runSeoAgent } from './seo-agent/index.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/api/contact') {
      if (request.method === 'POST') return handleContact(request, env);
      return new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });
    }
    if (pathname === '/api/chat/lead') {
      if (request.method === 'POST') return handleLead(request, env, ctx);
      return new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });
    }
    if (pathname === '/api/chat') {
      if (request.method === 'POST') return handleChat(request, env, ctx);
      if (request.method === 'GET') return warmChat(request, env);
      return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, POST' } });
    }
    if (pathname === '/admin' || pathname.startsWith('/admin/')) return handleAdmin(request, env, ctx);
    if (pathname.startsWith('/media/')) return serveMedia(request, env, ctx);

    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method Not Allowed', { status: 405 });

    // Static files (anything with an extension, except the generated SEO files)
    const dynamicFiles = ['/sitemap.xml', '/robots.txt', '/llms.txt', '/indexnow.txt'];
    if (/\.[a-z0-9]+$/i.test(pathname) && !dynamicFiles.includes(pathname)) {
      if (pathname === '/index.html') return Response.redirect(`${url.origin}/`, 301);
      return env.ASSETS.fetch(request);
    }
    if (pathname.length > 1 && pathname.endsWith('/')) return Response.redirect(`${url.origin}${pathname.replace(/\/+$/, '')}${url.search}`, 301);

    return servePage(request, env, ctx, () => route(pathname, env, request));
  },

  // SEO Agent Autopilot — cron "0 23 * * *" (UTC) = 06:00 Vietnam, see wrangler.toml. Does nothing while Autopilot is off.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runSeoAgent(env).catch((e) => console.error('seo-agent', e)));
  },
};
