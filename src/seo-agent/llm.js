// DeepSeek helper for the SEO agents: JSON-in / JSON-out, with token accounting.
// Reuses the key the chat widget already uses (Admin → Settings → AI chat, or the DEEPSEEK_API_KEY secret).
import { deepseekKey } from '../chat/handler.js';

const API = 'https://api.deepseek.com/chat/completions';
const MAX_OUT = 8192; // deepseek-chat output limit

// Pulls the JSON object out of a reply, even if wrapped in ```json fences or surrounded by text.
export function parseJson(text) {
  const t = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(t); } catch {}
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch {} }
  return null;
}

// One retry when the reply is cut off (finish_reason "length"), empty, or not valid JSON.
export async function llmJson(env, settings, { system, user, model, temperature = 0.4, max_tokens = 2000 }, usage) {
  const { key } = await deepseekKey(env, settings);
  if (!key) throw new Error('No DeepSeek API key configured');
  const cfg = settings.seo_agent || {};
  let tokens = Math.min(MAX_OUT, max_tokens), last = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: model || cfg.model || 'deepseek-chat',
        response_format: { type: 'json_object' }, // the prompt must contain the word "JSON"
        temperature, max_tokens: tokens,
        messages: [{ role: 'system', content: system }, { role: 'user', content: typeof user === 'string' ? user : JSON.stringify(user) }],
      }),
    });
    if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const j = await res.json();
    if (usage && j.usage) {
      usage.prompt = (usage.prompt || 0) + j.usage.prompt_tokens;
      usage.completion = (usage.completion || 0) + j.usage.completion_tokens;
      usage.cached = (usage.cached || 0) + (j.usage.prompt_cache_hit_tokens || 0);
    }
    const choice = j.choices?.[0] || {};
    const out = parseJson(choice.message?.content);
    if (out && typeof out === 'object') return out;
    last = choice.finish_reason === 'length' ? `reply cut off at ${tokens} tokens` : !choice.message?.content ? 'empty reply' : `invalid JSON: ${String(choice.message.content).slice(0, 80)}…`;
    if (choice.finish_reason === 'length') tokens = MAX_OUT; // retry with the full budget
  }
  throw new Error(`DeepSeek returned invalid JSON (${last})`);
}
