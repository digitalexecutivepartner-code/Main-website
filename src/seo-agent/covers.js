// Automatic cover photo for posts written by the SEO agent (photo list + matching rules: db/photos.js).
import { pickCover, addBodyImage } from '../../db/photos.js';

// How many posts already use each cover, so new posts prefer pictures that aren't on the blog yet.
export async function coverUsage(q) {
  const rows = await q(`SELECT cover_image, count(*)::int AS n FROM pages WHERE type = 'post' AND cover_image <> '' GROUP BY cover_image`);
  return Object.fromEntries(rows.map((r) => [r.cover_image, r.n]));
}

const deployed = async (env, src) => {
  if (!env.ASSETS) return true;
  const res = await env.ASSETS.fetch(new Request(`https://assets.local${src}`, { method: 'HEAD' }));
  return res.ok;
};

// Returns a cover path for the post, or '' when the photo file isn't deployed yet (avoids broken images).
export async function autoCover(q, env, post) {
  try {
    const src = pickCover(post, await coverUsage(q));
    return src && (await deployed(env, src)) ? src : '';
  } catch (e) {
    console.error('auto cover', e);
    return '';
  }
}

// Adds one photo in the middle of the article (different from the cover). Returns the new Markdown body,
// or the unchanged body when there is nothing to add or the file isn't deployed.
export async function autoBodyImage(q, env, body, post, cover) {
  try {
    const r = addBodyImage(body, post, { cover, used: await coverUsage(q) });
    return r && (await deployed(env, r.src)) ? r.body : body;
  } catch (e) {
    console.error('auto body image', e);
    return body;
  }
}
