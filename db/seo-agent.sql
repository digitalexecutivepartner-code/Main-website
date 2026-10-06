-- SEO Agent (trend → proposal → draft). Run once: psql "$DATABASE_URL" -f db/seo-agent.sql

-- Raw signals gathered by the Trend Scout on every run (Search Console, autocomplete, HN, RSS…)
CREATE TABLE IF NOT EXISTS seo_signals (
  id          SERIAL PRIMARY KEY,
  source      TEXT NOT NULL,                 -- gsc | autocomplete | hn | rss | reddit
  keyword     TEXT NOT NULL,
  url         TEXT NOT NULL DEFAULT '',
  metrics     JSONB NOT NULL DEFAULT '{}'::jsonb, -- impressions, ctr, position, points, growth…
  seen_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS seo_signals_kw_idx ON seo_signals (lower(keyword), seen_at DESC);

-- What the agents suggest. Humans approve before anything is written, and again before publishing.
CREATE TABLE IF NOT EXISTS seo_proposals (
  id            SERIAL PRIMARY KEY,
  keyword       TEXT NOT NULL,
  action        TEXT NOT NULL CHECK (action IN ('new_post', 'refresh', 'skip')),
  target_page   INTEGER REFERENCES pages (id) ON DELETE SET NULL, -- page to refresh, or the draft created
  score         INTEGER NOT NULL DEFAULT 0,  -- 0–100 relevance × opportunity
  intent        TEXT NOT NULL DEFAULT '',
  lifespan      TEXT NOT NULL DEFAULT '',    -- spike | seasonal | evergreen
  brief         JSONB NOT NULL DEFAULT '{}'::jsonb, -- angle, outline, product to link, reasoning
  status        TEXT NOT NULL DEFAULT 'proposed'
                CHECK (status IN ('proposed', 'approved', 'drafted', 'published', 'rejected', 'failed')),
  error         TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS seo_proposals_open_kw ON seo_proposals (lower(keyword)) WHERE status IN ('proposed', 'approved');
CREATE INDEX IF NOT EXISTS seo_proposals_status_idx ON seo_proposals (status, score DESC);

-- One row per cron run: cost, counts, errors (Admin → SEO Agent → History)
CREATE TABLE IF NOT EXISTS seo_runs (
  id          SERIAL PRIMARY KEY,
  kind        TEXT NOT NULL,                 -- scan | write | measure
  stats       JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
