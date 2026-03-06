-- Orbit OS – Refactored CMS schemas (production-grade)
-- Run once. No child tables for project/experience; JSONB + slugs.

-- About (singleton)
CREATE TABLE IF NOT EXISTS about (
  id            SERIAL PRIMARY KEY,
  content       TEXT NOT NULL DEFAULT '',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO about (content) SELECT '' WHERE NOT EXISTS (SELECT 1 FROM about LIMIT 1);

-- Experience (impact as JSONB, slug for URLs)
CREATE TABLE IF NOT EXISTS experience (
  id         SERIAL PRIMARY KEY,
  slug       VARCHAR(255) NOT NULL UNIQUE,
  mission    VARCHAR(255) NOT NULL,
  role       VARCHAR(120) NOT NULL,
  status     VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  period     VARCHAR(80) NOT NULL,
  impact     JSONB NOT NULL DEFAULT '[]',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_experience_slug ON experience(slug);
CREATE INDEX IF NOT EXISTS idx_experience_order ON experience(sort_order);

-- Project (document-style: all list data in JSONB, slug for URLs)
CREATE TABLE IF NOT EXISTS project (
  id                    SERIAL PRIMARY KEY,
  slug                  VARCHAR(255) NOT NULL UNIQUE,
  title                 VARCHAR(255) NOT NULL,
  status                VARCHAR(40) NOT NULL DEFAULT 'OPERATIONAL',
  project_type          VARCHAR(80) NOT NULL,
  role                  VARCHAR(80) NOT NULL,
  scale                 VARCHAR(40) NOT NULL,
  mission_objective     TEXT NOT NULL,
  architecture_overview TEXT,
  github_url            VARCHAR(512),
  live_url              VARCHAR(512),
  featured              BOOLEAN NOT NULL DEFAULT false,
  state                 VARCHAR(20) NOT NULL DEFAULT 'published',
  impact                JSONB NOT NULL DEFAULT '[]',
  design_decisions      JSONB NOT NULL DEFAULT '[]',
  technical_challenges  JSONB NOT NULL DEFAULT '[]',
  tech_stack            JSONB NOT NULL DEFAULT '[]',
  screenshots           JSONB NOT NULL DEFAULT '[]',
  sort_order            INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_slug ON project(slug);
CREATE INDEX IF NOT EXISTS idx_project_state_order ON project(state, sort_order);

-- Skill category (for orbital viz: orbit_index, color)
CREATE TABLE IF NOT EXISTS skill_category (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(80) NOT NULL UNIQUE,
  orbit_index INT NOT NULL DEFAULT 0,
  color       VARCHAR(40),
  sort_order  INT NOT NULL DEFAULT 0
);

-- Skill (FK to category)
CREATE TABLE IF NOT EXISTS skill (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(80) NOT NULL,
  category_id INT NOT NULL REFERENCES skill_category(id) ON DELETE RESTRICT,
  sort_order  INT NOT NULL DEFAULT 0,
  UNIQUE (name, category_id)
);
CREATE INDEX IF NOT EXISTS idx_skill_category_order ON skill(category_id, sort_order);

-- Resume (singleton; URLs only, no binary)
CREATE TABLE IF NOT EXISTS resume (
  id           SERIAL PRIMARY KEY,
  view_url     VARCHAR(512) NOT NULL DEFAULT '',
  download_url VARCHAR(512) NOT NULL DEFAULT '',
  terminal_data JSONB,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO resume (view_url, download_url) SELECT '', '' WHERE NOT EXISTS (SELECT 1 FROM resume LIMIT 1);

-- Social links
CREATE TABLE IF NOT EXISTS social_link (
  id         SERIAL PRIMARY KEY,
  icon       VARCHAR(40) NOT NULL,
  label      VARCHAR(80) NOT NULL,
  href       VARCHAR(512) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_social_link_order ON social_link(sort_order);

-- Publication (slug for URLs)
CREATE TABLE IF NOT EXISTS publication (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  title       VARCHAR(512) NOT NULL,
  authors     VARCHAR(255),
  venue       VARCHAR(255),
  year        VARCHAR(20),
  url         VARCHAR(512),
  description TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_publication_slug ON publication(slug);
CREATE INDEX IF NOT EXISTS idx_publication_order ON publication(sort_order);
