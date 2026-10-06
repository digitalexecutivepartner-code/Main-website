-- Digital Executive Partner CMS schema (PostgreSQL / Neon)

CREATE TABLE IF NOT EXISTS pages (
  id            SERIAL PRIMARY KEY,
  type          TEXT NOT NULL DEFAULT 'page' CHECK (type IN ('home', 'page', 'post')),
  slug          TEXT NOT NULL DEFAULT '',
  title         TEXT NOT NULL,
  excerpt       TEXT NOT NULL DEFAULT '',
  cover_image   TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  blocks        JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo           JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (type, slug)
);
CREATE INDEX IF NOT EXISTS pages_status_idx ON pages (type, status);

CREATE TABLE IF NOT EXISTS page_revisions (
  id          SERIAL PRIMARY KEY,
  page_id     INTEGER NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
  snapshot    JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS page_revisions_page_idx ON page_revisions (page_id, created_at DESC);

CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id    SERIAL PRIMARY KEY,
  ip    TEXT NOT NULL,
  ok    BOOLEAN NOT NULL DEFAULT false,
  at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_ip_idx ON login_attempts (ip, at DESC);

-- AI chat widget: every visitor question and answer (for reviewing and improving the assistant)
CREATE TABLE IF NOT EXISTS chat_logs (
  id          SERIAL PRIMARY KEY,
  session     TEXT NOT NULL DEFAULT '',
  ip          TEXT NOT NULL DEFAULT '',
  country     TEXT NOT NULL DEFAULT '',
  page        TEXT NOT NULL DEFAULT '',
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_logs_created_idx ON chat_logs (created_at DESC);
ALTER TABLE chat_logs ADD COLUMN IF NOT EXISTS visitor TEXT NOT NULL DEFAULT '';
ALTER TABLE chat_logs ADD COLUMN IF NOT EXISTS device TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS chat_logs_visitor_idx ON chat_logs (visitor, created_at DESC);

-- Contact form: every enquiry is stored here (Admin → Inbox), even if the notification email fails.
CREATE TABLE IF NOT EXISTS contact_submissions (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  company       TEXT NOT NULL DEFAULT '',
  service       TEXT NOT NULL DEFAULT '',
  budget        TEXT NOT NULL DEFAULT '',
  message       TEXT NOT NULL DEFAULT '',
  page          TEXT NOT NULL DEFAULT '',
  ip            TEXT NOT NULL DEFAULT '',
  country       TEXT NOT NULL DEFAULT '',
  device        TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived', 'spam')),
  email_status  TEXT NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed', 'skipped')),
  email_error   TEXT NOT NULL DEFAULT '',
  note          TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_submissions_created_idx ON contact_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS contact_submissions_status_idx ON contact_submissions (status, created_at DESC);

-- AI chat widget: contact details left inside the chat are saved as contact_submissions (source = 'chat').
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'form';
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS visitor TEXT NOT NULL DEFAULT '';
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS session TEXT NOT NULL DEFAULT '';
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS transcript JSONB NOT NULL DEFAULT '[]'::jsonb;
CREATE INDEX IF NOT EXISTS contact_submissions_visitor_idx ON contact_submissions (visitor) WHERE source = 'chat';

-- SEO Agent (src/seo-agent): ideas (seo_proposals) → drafts/posts, one row per run (seo_runs).

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

CREATE TABLE IF NOT EXISTS seo_runs (
  id          SERIAL PRIMARY KEY,
  kind        TEXT NOT NULL,                 -- daily
  stats       JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
