# Orbit OS – Refactored CMS Schemas (Production-Grade)

**Design goal:** A headless personal CMS powering a highly interactive portfolio. Optimized for low write complexity, easy admin editing, minimal joins, and scalable frontend consumption.

---

## 1. Entity Relationship (Text Diagram)

```
about            (1 row)        — singleton profile/bio
experience       (many)         — mission, role, status, period, impact JSONB, slug
project          (many)         — full document with JSONB arrays, slug
skill_category   (many)         — name, orbit_index, color, sort_order
skill            (many)         — name, category_id FK, sort_order
resume           (1 row)        — view_url, download_url, terminal_data JSONB (URLs only, no binary)
social_link      (many)         — icon, label, href, sort_order
publication      (many)         — title, authors, venue, year, url, description, slug
```

**Removed tables (from previous design):**
- `project_impact`
- `project_design_decision`
- `project_technical_challenge`
- `project_tech_stack`
- `project_screenshot`
- `experience_impact`

**Reasoning:** Project and experience “list” data (impact, design decisions, tech stack, etc.) is always read and written as a unit with the parent. Storing them in JSONB columns reduces writes (one row update vs many), removes joins for public/admin reads, and keeps the API shape unchanged. Slug columns enable clean URLs without coupling routes to numeric IDs.

---

## 2. PostgreSQL Table Definitions

### 2.1 About (singleton)

```sql
CREATE TABLE about (
  id            SERIAL PRIMARY KEY,
  content       TEXT NOT NULL DEFAULT '',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO about (content) SELECT '' WHERE NOT EXISTS (SELECT 1 FROM about LIMIT 1);
```

### 2.2 Experience

```sql
CREATE TABLE experience (
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
CREATE UNIQUE INDEX idx_experience_slug ON experience(slug);
CREATE INDEX idx_experience_order ON experience(sort_order);
```

### 2.3 Project (document-style, JSONB)

```sql
CREATE TABLE project (
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
CREATE UNIQUE INDEX idx_project_slug ON project(slug);
CREATE INDEX idx_project_state_order ON project(state, sort_order);
```

**JSONB column semantics (ordered arrays):**
- `impact`: `["Line one", "Line two"]`
- `design_decisions`: `["Decision one", "Decision two"]`
- `technical_challenges`: `["Challenge one"]`
- `tech_stack`: `["React", "Node.js"]`
- `screenshots`: `["https://...", "https://..."]`

**Migration reasoning (project child tables → JSONB):** Admin edits a project by loading one row and saving one row. No need to sync multiple child tables, manage sort_order across five tables, or run deletes/inserts for list changes. Frontend always consumes project as a single document; JSONB keeps the response shape identical while reducing joins and write complexity.

### 2.4 Skill category + Skill

```sql
CREATE TABLE skill_category (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(80) NOT NULL UNIQUE,
  orbit_index INT NOT NULL DEFAULT 0,
  color       VARCHAR(40),
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE skill (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(80) NOT NULL,
  category_id INT NOT NULL REFERENCES skill_category(id) ON DELETE RESTRICT,
  sort_order  INT NOT NULL DEFAULT 0,
  UNIQUE (name, category_id)
);
CREATE INDEX idx_skill_category_order ON skill(category_id, sort_order);
```

### 2.5 Resume (singleton, URLs only)

```sql
CREATE TABLE resume (
  id           SERIAL PRIMARY KEY,
  view_url     VARCHAR(512) NOT NULL DEFAULT '',
  download_url VARCHAR(512) NOT NULL DEFAULT '',
  terminal_data JSONB,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO resume (view_url, download_url) SELECT '', '' WHERE NOT EXISTS (SELECT 1 FROM resume LIMIT 1);
```

**Media strategy:** DB stores URLs only. Files live in external storage (e.g. S3, Cloudinary). Resume PDF: store `view_url` (e.g. viewer link) and `download_url`; no binary in DB. Same for `project.screenshots` (array of URLs).

### 2.6 Social links

```sql
CREATE TABLE social_link (
  id         SERIAL PRIMARY KEY,
  icon       VARCHAR(40) NOT NULL,
  label      VARCHAR(80) NOT NULL,
  href       VARCHAR(512) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_social_link_order ON social_link(sort_order);
```

### 2.7 Publication

```sql
CREATE TABLE publication (
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
CREATE UNIQUE INDEX idx_publication_slug ON publication(slug);
CREATE INDEX idx_publication_order ON publication(sort_order);
```

---

## 3. Public vs Admin API Design

**Public API** — no auth; read-only; returns only published/visible data.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/public/about` | About content |
| GET | `/api/public/experience` | All experience (ordered) |
| GET | `/api/public/experience/:slug` | Single experience by slug |
| GET | `/api/public/projects` | Published projects only |
| GET | `/api/public/projects/:slug` | Single project by slug (e.g. `/projects/orbit-os`) |
| GET | `/api/public/skills` | Skills grouped by category (see shape below) |
| GET | `/api/public/resume` | Resume URLs + terminal_data |
| GET | `/api/public/social-links` | Social links |
| GET | `/api/public/publications` | Publications (ordered) |
| GET | `/api/public/publications/:slug` | Single publication by slug |

**Admin API** — JWT-ready; all mutations; can read drafts.

| Method | Path | Description |
|--------|------|-------------|
| GET/PATCH | `/api/admin/about` | Singleton about |
| GET/POST | `/api/admin/experience` | List, create |
| GET/PATCH/DELETE | `/api/admin/experience/:id` or `:slug` | Single experience |
| GET/POST | `/api/admin/projects` | List (incl. draft), create |
| GET/PATCH/DELETE | `/api/admin/projects/:id` or `:slug` | Single project |
| GET/POST/PATCH/DELETE | `/api/admin/skill-categories` | Category CRUD |
| GET/POST | `/api/admin/skills` | List, create |
| GET/PATCH/DELETE | `/api/admin/skills/:id` | Single skill |
| GET/PATCH | `/api/admin/resume` | Singleton resume |
| GET/POST/PATCH/DELETE | `/api/admin/social-links` | Social link CRUD |
| GET/POST | `/api/admin/publications` | List, create |
| GET/PATCH/DELETE | `/api/admin/publications/:id` or `:slug` | Single publication |

**Authorization boundary:** Public routes require no token. Admin routes expect `Authorization: Bearer <JWT>`. JWT payload can carry `sub` (admin user id) and `role`; backend validates token and rejects 401 if missing/invalid. No auth implementation in this doc—structure only.

---

## 4. JSON API Response Shapes (Refactored)

### 4.1 About

**GET /api/public/about**

```json
{
  "content": "> cat about_bhavil.txt\n\nBHAVIL AHUJA\nSoftware Engineer | Systems Architect\n\n..."
}
```

### 4.2 Experience

**GET /api/public/experience**

```json
[
  {
    "id": "1",
    "slug": "walmart-commerce-platform",
    "mission": "Walmart Commerce Platform",
    "role": "Software Engineer",
    "status": "ACTIVE",
    "period": "Present",
    "impact": [
      "Large-scale distributed commerce optimization.",
      "Real-time inventory and order systems."
    ]
  }
]
```

**GET /api/public/experience/:slug** — same shape as one element.

### 4.3 Projects (slug in response; use for routes)

**GET /api/public/projects**

```json
[
  {
    "id": 1,
    "slug": "orbit-os",
    "title": "Orbit OS",
    "flagship": true,
    "status": "OPERATIONAL",
    "type": "Console / Portfolio",
    "role": "Full Stack",
    "scale": "Production",
    "missionObjective": "Interactive spacecraft-style developer portfolio...",
    "impact": [
      "Real-time 3D starfield and section-aware environment",
      "Cinematic boot sequence and module activation transitions"
    ],
    "techStack": ["React", "Three.js", "Framer Motion", "TailwindCSS", "Zustand"],
    "githubUrl": "https://github.com/...",
    "liveUrl": "https://...",
    "architectureOverview": "Single-page React app with...",
    "designDecisions": [
      "Scroll-snap proximity (not mandatory)..."
    ],
    "technicalChallenges": [
      "Balancing 3D starfield performance..."
    ],
    "screenshots": []
  }
]
```

**GET /api/public/projects/:slug** — same shape (e.g. `/api/public/projects/orbit-os`). Frontend can route `/projects/orbit-os` and fetch by slug. API compatibility: still expose `id`; primary key for URLs is `slug`.

### 4.4 Skills (grouped by category for orbital viz)

**GET /api/public/skills**

Backend returns grouped by category with orbit metadata:

```json
{
  "Language": {
    "orbitIndex": 0,
    "color": "#00d4ff",
    "skills": [
      { "id": "1", "name": "TypeScript" },
      { "id": "2", "name": "Go" }
    ]
  },
  "Backend": {
    "orbitIndex": 2,
    "color": "#00d4ff",
    "skills": [
      { "id": "3", "name": "Node.js" },
      { "id": "4", "name": "GraphQL" }
    ]
  },
  "Frontend": {
    "orbitIndex": 4,
    "color": "#00d4ff",
    "skills": [
      { "id": "5", "name": "React" },
      { "id": "6", "name": "Three.js" }
    ]
  }
}
```

Optional: also expose a flat array for legacy consumers: `GET /api/public/skills?format=flat` → `[{ "id", "name", "category" }]` (category from join with `skill_category.name`).

### 4.5 Resume

**GET /api/public/resume**

```json
{
  "viewUrl": "https://res.cloudinary.com/.../view",
  "downloadUrl": "https://res.cloudinary.com/.../raw",
  "terminalData": {
    "name": "BHAVIL AHUJA",
    "title": "Software Engineer · Systems & Full-Stack",
    "sections": [
      { "title": "EXPERIENCE", "lines": ["..."] },
      { "title": "EDUCATION", "lines": ["..."] }
    ]
  }
}
```

All file references are URLs; no binary in DB.

### 4.6 Social links

**GET /api/public/social-links**

```json
[
  { "icon": "Linkedin", "label": "LinkedIn", "href": "https://linkedin.com/in/..." },
  { "icon": "Github", "label": "GitHub", "href": "https://github.com/..." }
]
```

### 4.7 Publications (slug for routes)

**GET /api/public/publications**

```json
[
  {
    "id": 1,
    "slug": "example-publication-2024",
    "title": "Example Publication Title",
    "authors": "B. Ahuja et al.",
    "venue": "Conference or Journal Name",
    "year": "2024",
    "url": "https://...",
    "description": "Brief summary or abstract of the publication."
  }
]
```

**GET /api/public/publications/:slug** — same shape as one item.

---

## 5. Migration Order (Clean)

1. `about`
2. `experience` (with slug, impact JSONB)
3. `project` (with slug, all JSONB columns)
4. `skill_category`
5. `skill` (with category_id)
6. `resume`
7. `social_link`
8. `publication` (with slug)

**Removed tables (do not create):**
- `project_impact`
- `project_design_decision`
- `project_technical_challenge`
- `project_tech_stack`
- `project_screenshot`
- `experience_impact`

---

## 6. Slug Conventions

- **VARCHAR(255)**, **UNIQUE**, **indexed** on `project`, `experience`, `publication`.
- URL-safe: lowercase, hyphens, no spaces (e.g. `orbit-os`, `walmart-commerce-platform`).
- Frontend routes: `/projects/orbit-os`, `/experience/walmart-commerce-platform`, `/publications/example-publication-2024`.
- Admin can set slug on create/update; backend can derive from title if omitted (e.g. slugify title).

---

## 7. Summary

| Concern | Choice |
|--------|--------|
| Writes | Single-row updates for project/experience; no child table sync. |
| Reads | No joins for project/experience; one row per entity. |
| URLs | Slug on project, experience, publication; indexed, unique. |
| Skills | Category table with orbit_index/color; skills grouped in API for orbital viz. |
| Media | URLs only in DB; files in S3/Cloudinary. |
| API | Public read-only under `/api/public/*`; admin CRUD under `/api/admin/*`; JWT-ready. |

This refactor keeps API compatibility (camelCase response fields, same payload shapes) while making the backend a production-grade, headless CMS with minimal joins and low write complexity.
