// The two LLM agents. Each one is a single DeepSeek call with a strict JSON contract.
import { llmJson } from './llm.js';

// ── Agent 1: Strategist ──────────────────────────────────────────────────────────────────
// In: up to 60 keyword signals + what the business sells + existing pages. Out: only the best `n` NEW post ideas.
// One call per run, small output → cheap. The business context is identical every run → prompt cache.
export async function strategize(env, settings, { business, pages, signals, n = 2 }, usage) {
  const system = `You are the SEO strategist for a B2B software studio. Return JSON only.
BUSINESS (what we sell — the only topics worth ranking for):
${business}

EXISTING PAGES (path | title) — do NOT pick a topic these already cover:
${pages.map((p) => `${p.path} | ${p.title}`).join('\n')}

From the keyword signals, pick the ${n} best ideas for NEW blog posts:
- the searcher could plausibly buy one of our services or products (web/mobile development, Shopify apps, Zoho, AI agents, our products); ignore news, gossip, unrelated tech
- prefer Search Console keywords with impressions but weak position, then clear commercial or problem-solving intent, then evergreen topics
- the ${n} ideas must target different intents and different services where possible
For each idea: keyword, score 0–100 (relevance × opportunity), intent (informational | commercial | transactional),
brief: { angle (1 sentence), h1, outline: [4–6 short H2s], product_link: path of the most relevant service/product page }.
Output: {"items":[{"keyword","score","intent","brief"}]} — at most ${n} items, fewer if nothing is relevant.`;
  const out = await llmJson(env, settings, { system, user: { signals: signals.map((s) => ({ k: s.keyword, src: s.source, m: s.metrics })) }, temperature: 0.2, max_tokens: 2000 }, usage);
  return (out.items || []).filter((i) => i.keyword).slice(0, n);
}

// ── Agent 3: Writer ──────────────────────────────────────────────────────────────────────
// Produces CMS blocks directly (page_header, richtext, faq, cta) so the draft opens in the existing editor.
export async function writeDraft(env, settings, { business, proposal }, usage) {
  const post = true;
  const system = `You write SEO content for the website below. Return JSON only.
FACTS YOU MAY USE (never invent prices, client names, numbers, timelines or features not listed here):
${business}

Target keyword: use it in the title (H1), in the first paragraph (first 100 words), in at least one H2, and 3–6 times overall — naturally, never stuffed.
Style: English, practical, written for Shopify merchants / ops managers / CTOs. Short paragraphs, concrete steps, a comparison table
or checklist where useful, no fluff, no "In today's fast-paced world". Answer the search intent in the first 2 sentences.
Link to our product/service page naturally 1–2 times with Markdown links (relative paths like /products). 1000–1500 words.
Headings: only ## (H2) and ### (H3) inside the body — ${post ? 'the page already prints the title as the H1' : 'the page_header block holds the H1'}.
Output JSON:
{"title": "the H1, 40–65 chars, contains the keyword",
 "slug": "lowercase-hyphens ≤ 60 chars",
 "excerpt": "120–160 chars, shown under the H1 and in the blog list",
 "seo": {"title": "45–60 chars with the keyword", "description": "130–155 chars with the keyword", "keywords": "main keyword, 3–5 variants"},
 "blocks": [
   ${post ? '' : '{"type":"page_header","data":{"eyebrow","title","lead"}},\n   '}{"type":"richtext","data":{"body":"Markdown article: intro paragraph (no heading), then ## sections, lists, tables"}},
   {"type":"faq","data":{"eyebrow":"FAQ","heading":"Frequently asked questions","items":[{"q","a"}]}} (4–6 real questions people search),
   {"type":"cta","data":{"heading","text","primary":{"label":"Start a project","url":"/#contact"}}}
 ]}`;
  return llmJson(env, settings, {
    system,
    user: { keyword: proposal.keyword, intent: proposal.intent, brief: proposal.brief },
    temperature: 0.6, max_tokens: 7000,
  }, usage);
}
