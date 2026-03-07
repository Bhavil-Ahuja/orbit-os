# OrbitOS Backend API Documentation

## Overview

The OrbitOS backend is a **Spring Boot** application that serves as the headless CMS for the portfolio. It provides:

- **JWT admin authentication** for a single-owner admin console
- **Public read APIs** for the site (no auth required)
- **Admin write APIs** for content management (JWT required)
- **Cached read services** (in-memory) for navigation, portfolio, skill orbits, and resume terminal
- **Domain services** that perform persistence; admin controllers call them and then trigger cache eviction

The API is split into:

| Prefix | Auth | Purpose |
|--------|------|--------|
| `/api/public/**` | None | Read-only data for the frontend |
| `/api/admin/**` | JWT required (except `/api/admin/auth/login`) | Create, update, delete, publish |

---

# Authentication

## Admin Login

**POST** `/api/admin/auth/login`

Authenticates the admin and returns a JWT.

**Request body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK`

```json
{
  "token": "jwt-token"
}
```

**Errors:**

- `401 Unauthorized` — invalid username or password

**Usage:** Send the token in the `Authorization` header for all other admin endpoints:

```
Authorization: Bearer <token>
```

---

## Admin Identity

**GET** `/api/admin/whoami`

Returns the authenticated admin's username. Used to verify the token and show identity in the UI.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "username": "admin"
}
```

---

# Public APIs

All endpoints under `/api/public/**` are unauthenticated. Read services are cached (navigation, portfolio, skillOrbits, resumeTerminal).

---

## Health

**GET** `/api/public/health`

Simple health check.

**Response:** `200 OK`

```json
{
  "status": "UP",
  "service": "portfolio"
}
```

**Service:** In-memory response (no service).

---

## Bootstrap

**GET** `/api/public/bootstrap`

Returns the entire site payload in one request (navigation, portfolio, skills orbit, resume, resume terminal). Frontend loads the site with a single call; no separate resume request.

**Response:** `200 OK`

```json
{
  "navigation": { "sections": [], "socialLinks": [] },
  "portfolio": {
    "about": {},
    "experience": [],
    "projects": [],
    "skills": [],
    "publications": []
  },
  "skillsOrbit": [],
  "resume": { "viewUrl": "...", "downloadUrl": "...", "terminalData": {}, "updatedAt": "..." },
  "resumeTerminal": { "name": "", "title": "", "sections": [] }
}
```

**Service:** `BootstrapReadService` (delegates to NavigationReadService, PortfolioReadService, SkillOrbitReadService, ResumeService, ResumeTerminalReadService).

---

## Portfolio

**GET** `/api/public/portfolio`

Aggregated site data: about, experience, projects, skills, publications.

**Response:** `200 OK`

```json
{
  "about": {},
  "experience": [],
  "projects": [],
  "skills": [],
  "publications": []
}
```

**Service:** `PortfolioReadService` (cached: `portfolio`).

---

## Navigation

**GET** `/api/public/navigation`

Site navigation sections and social links.

**Response:** `200 OK`

```json
{
  "sections": [],
  "socialLinks": []
}
```

**Service:** `NavigationReadService` (cached: `navigation`).

---

## About

**GET** `/api/public/about`

Singleton about/profile content.

**Response:** `200 OK`

```json
{
  "content": "..."
}
```

**Service:** `AboutService`.

---

## Projects

**GET** `/api/public/projects`

Returns projects. By default only **published** projects are returned.

| Query param | Type | Description |
|-------------|------|-------------|
| `preview` | boolean | If `true`, returns both **published** and **draft** projects (for preview mode). |

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "slug": "my-project",
    "title": "My Project",
    "flagship": false,
    "state": "PUBLISHED",
    "status": "OPERATIONAL",
    "type": "Web",
    "role": "Developer",
    "scale": "Team",
    "missionObjective": "...",
    "impact": [],
    "techStack": [],
    "githubUrl": "",
    "liveUrl": "",
    "architectureOverview": "",
    "designDecisions": [],
    "technicalChallenges": [],
    "screenshots": []
  }
]
```

**Service:** `ProjectService.findAllPublished()` or `ProjectService.findAllForPreview()` when `preview=true`.

---

## Project by Slug

**GET** `/api/public/projects/{slug}`

Returns a single project by slug.

| Query param | Type | Description |
|-------------|------|-------------|
| `preview` | boolean | If `true`, returns the project even if it is **draft**. |

**Response:** `200 OK` — same shape as one element in the projects list.

**Errors:** `404 Not Found` if slug does not exist (or is draft when `preview` is not set).

**Service:** `ProjectService.findBySlug(slug)` or `ProjectService.findBySlugIncludingDraft(slug)` when `preview=true`.

---

## Experience

**GET** `/api/public/experience`

List of experience entries (ordered by sort order).

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "slug": "...",
    "mission": "...",
    "role": "...",
    "status": "ACTIVE",
    "period": "...",
    "impact": []
  }
]
```

**Service:** `ExperienceService`.

---

## Skills

**GET** `/api/public/skills`

Flat list of skills (with category name).

**Response:** `200 OK`

```json
[
  { "id": 1, "name": "Java", "category": "Backend" }
]
```

**Service:** `SkillService`.

---

## Skill Orbits

**GET** `/api/public/skills/orbits`

Skills grouped by category for the orbit visualization (category, orbitIndex, color, skills).

**Response:** `200 OK`

```json
[
  {
    "category": "Backend",
    "orbitIndex": 0,
    "color": "#...",
    "skills": [ { "id": 1, "name": "Java" } ]
  }
]
```

**Service:** `SkillOrbitReadService` (cached: `skillOrbits`).

---

## Publications

**GET** `/api/public/publications`

List of publications (ordered by sort order).

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "slug": "...",
    "title": "...",
    "authors": "...",
    "venue": "...",
    "year": "...",
    "url": "...",
    "description": "..."
  }
]
```

**Service:** `PublicationService`.

---

## Social Links

**GET** `/api/public/social-links`

List of social links.

**Response:** `200 OK`

```json
[
  { "id": 1, "label": "...", "url": "...", "sortOrder": 0 }
]
```

**Service:** `SocialLinkService`.

---

## Resume

**GET** `/api/public/resume`

Resume metadata: view URL, download URL, terminal data, updatedAt.

**Response:** `200 OK`

```json
{
  "viewUrl": "...",
  "downloadUrl": "...",
  "terminalData": { ... },
  "updatedAt": "..."
}
```

**Service:** `ResumeService` (domain).

---

## Resume Terminal

**GET** `/api/public/resume/terminal`

Terminal-render-ready resume (name, title, sections with lines).

**Response:** `200 OK`

```json
{
  "name": "...",
  "title": "...",
  "sections": [
    { "title": "...", "lines": ["..."] }
  ]
}
```

**Service:** `ResumeTerminalReadService` (cached: `resumeTerminal`).

---

# Admin APIs

All endpoints under `/api/admin/**` (except `/api/admin/auth/login`) require:

```
Authorization: Bearer <token>
```

Stateless session; no cookies. Failed auth results in `403 Forbidden`.

---

## About

**PATCH** `/api/admin/about`

Updates the singleton about content.

**Request body:**

```json
{
  "content": "string"
}
```

**Response:** `204 No Content`

**Cache evicted:** `portfolio`

**Service:** `AboutService.updateContent(content)` → `CacheEvictionService.evictPortfolio()`.

---

## Projects

### Create Project

**POST** `/api/admin/projects`

Creates a new project in **DRAFT** state.

**Request body:** `CreateProjectRequestDto`

```json
{
  "title": "string (required)",
  "slug": "string (required)",
  "status": "string",
  "type": "string (required)",
  "role": "string (required)",
  "scale": "string (required)",
  "missionObjective": "string (required)",
  "impact": ["string"],
  "techStack": ["string"],
  "githubUrl": "string",
  "liveUrl": "string",
  "architectureOverview": "string",
  "designDecisions": ["string"],
  "technicalChallenges": ["string"],
  "screenshots": ["string"]
}
```

**Response:** `200 OK`

```json
{
  "id": 1
}
```

**Errors:** `409 Conflict` if slug already exists.

**Cache evicted:** `portfolio`

**Service:** `ProjectService.createProject(dto)` → `CacheEvictionService.evictPortfolio()`.

---

### Update Project

**PATCH** `/api/admin/projects/{id}`

Updates an existing project. Only provided fields are updated.

**Request body:** `UpdateProjectRequestDto` (all fields optional)

```json
{
  "title": "string",
  "slug": "string",
  "status": "string",
  "type": "string",
  "role": "string",
  "scale": "string",
  "missionObjective": "string",
  "impact": ["string"],
  "techStack": ["string"],
  "githubUrl": "string",
  "liveUrl": "string",
  "architectureOverview": "string",
  "designDecisions": ["string"],
  "technicalChallenges": ["string"],
  "screenshots": ["string"]
}
```

**Response:** `200 OK` — full `ProjectDto` of the updated project.

**Errors:** `404 Not Found` if id does not exist; `409 Conflict` if new slug is already used by another project.

**Cache evicted:** `portfolio`

**Service:** `ProjectService.updateProject(id, dto)` → `CacheEvictionService.evictPortfolio()`.

---

### Delete Project

**DELETE** `/api/admin/projects/{id}`

Deletes the project.

**Response:** `204 No Content`

**Errors:** `404 Not Found` if id does not exist.

**Cache evicted:** `portfolio`

**Service:** `ProjectService.deleteProject(id)` → `CacheEvictionService.evictPortfolio()`.

---

### Publish Project

**POST** `/api/admin/projects/{id}/publish`

Sets project state to **PUBLISHED** so it appears on the public site (and in non-preview lists).

**Response:** `200 OK` — full `ProjectDto` with `state: "PUBLISHED"`.

**Errors:** `404 Not Found` if id does not exist.

**Cache evicted:** `portfolio`

**Service:** `ProjectService.publishProject(id)` → `CacheEvictionService.evictPortfolio()`.

---

## Experience

### Create Experience

**POST** `/api/admin/experience`

**Request body:** `CreateExperienceRequestDto`

```json
{
  "slug": "string (required)",
  "mission": "string (required)",
  "role": "string (required)",
  "status": "string",
  "period": "string (required)",
  "impact": ["string"],
  "sortOrder": 0
}
```

**Response:** `200 OK` — `{ "id": <long> }`

**Cache evicted:** `portfolio`

**Service:** `ExperienceService.createExperience(dto)` → `CacheEvictionService.evictPortfolio()`.

---

### Update Experience

**PATCH** `/api/admin/experience/{id}`

**Request body:** `UpdateExperienceRequestDto` (all fields optional: slug, mission, role, status, period, impact, sortOrder)

**Response:** `200 OK` — full `ExperienceDto`

**Cache evicted:** `portfolio`

**Service:** `ExperienceService.updateExperience(id, dto)` → `CacheEvictionService.evictPortfolio()`.

---

### Delete Experience

**DELETE** `/api/admin/experience/{id}`

**Response:** `204 No Content`

**Cache evicted:** `portfolio`

**Service:** `ExperienceService.deleteExperience(id)` → `CacheEvictionService.evictPortfolio()`.

---

## Skills

### Create Skill

**POST** `/api/admin/skills`

**Request body:** `CreateSkillRequestDto`

```json
{
  "name": "string (required)",
  "categoryId": 1,
  "sortOrder": 0
}
```

**Response:** `200 OK` — `{ "id": <long> }`

**Errors:** `404 Not Found` if `categoryId` does not exist.

**Cache evicted:** `portfolio`, `skillOrbits`

**Service:** `SkillService.createSkill(dto)` → `CacheEvictionService.evictPortfolio()`, `evictSkillOrbits()`.

---

### Update Skill

**PATCH** `/api/admin/skills/{id}`

**Request body:** `UpdateSkillRequestDto` (optional: name, categoryId, sortOrder)

**Response:** `200 OK` — full `SkillDto`

**Cache evicted:** `portfolio`, `skillOrbits`

**Service:** `SkillService.updateSkill(id, dto)` → `CacheEvictionService.evictPortfolio()`, `evictSkillOrbits()`.

---

### Delete Skill

**DELETE** `/api/admin/skills/{id}`

**Response:** `204 No Content`

**Cache evicted:** `portfolio`, `skillOrbits`

**Service:** `SkillService.deleteSkill(id)` → `CacheEvictionService.evictPortfolio()`, `evictSkillOrbits()`.

---

## Publications

### Create Publication

**POST** `/api/admin/publications`

**Request body:** `CreatePublicationRequestDto`

```json
{
  "slug": "string (required)",
  "title": "string (required)",
  "authors": "string",
  "venue": "string",
  "year": "string",
  "url": "string",
  "description": "string",
  "sortOrder": 0
}
```

**Response:** `200 OK` — `{ "id": <long> }`

**Cache evicted:** `portfolio`

**Service:** `PublicationService.createPublication(dto)` → `CacheEvictionService.evictPortfolio()`.

---

### Update Publication

**PATCH** `/api/admin/publications/{id}`

**Request body:** `UpdatePublicationRequestDto` (optional: slug, title, authors, venue, year, url, description, sortOrder)

**Response:** `200 OK` — full `PublicationDto`

**Cache evicted:** `portfolio`

**Service:** `PublicationService.updatePublication(id, dto)` → `CacheEvictionService.evictPortfolio()`.

---

### Delete Publication

**DELETE** `/api/admin/publications/{id}`

**Response:** `204 No Content`

**Cache evicted:** `portfolio`

**Service:** `PublicationService.deletePublication(id)` → `CacheEvictionService.evictPortfolio()`.

---

## Resume

**PATCH** `/api/admin/resume`

Updates the singleton resume: view URL, download URL, and optional terminal data (must match `ResumeTerminalDto` structure).

**Request body:** `UpdateResumeRequestDto`

```json
{
  "viewUrl": "string (required)",
  "downloadUrl": "string (required)",
  "terminalData": { "name": "", "title": "", "sections": [] }
}
```

**Response:** `200 OK` — full `ResumeDto`

**Errors:** `400 Bad Request` if `terminalData` does not match expected structure.

**Cache evicted:** `resumeTerminal`, `portfolio`

**Service:** `ResumeService.updateResume(dto)` → `CacheEvictionService.evictResumeTerminal()`, `evictPortfolio()`.

---

# Caching

- **Cache implementation:** In-memory (`ConcurrentMapCacheManager`). No Redis or external cache.
- **Cache names:** `navigation`, `portfolio`, `skillOrbits`, `resumeTerminal`.
- **Cached methods:** Read services use `@Cacheable(value = "<name>", key = "'all'")` for their main getter (e.g. `PortfolioReadService.getPortfolio()` → cache `portfolio`).
- **Eviction:** After every admin write, the relevant caches are cleared via `CacheEvictionService` so the next public read sees fresh data.

| Cache        | Evicted by                          |
|-------------|--------------------------------------|
| `portfolio` | About, Project, Experience, Skill, Publication, Resume admin writes |
| `navigation`| (evict method exists; used when nav data is written) |
| `skillOrbits` | Skill create/update/delete        |
| `resumeTerminal` | Resume update                   |

---

# Security Model

- **Admin auth:** Single-user. No users table; credentials come from configuration/environment.
- **JWT:** Issued on successful login. Validated on every request to `/api/admin/**` except `/api/admin/auth/login`. Token is passed as `Authorization: Bearer <token>`.
- **Session:** Stateless; no server-side session.
- **CSRF:** Disabled (API-only).
- **Public routes:** `/api/public/**`, `/api/admin/auth/login`, `/actuator/health` are `permitAll`. All other `/api/admin/**` require authentication.

**Environment variables (production):**

| Variable | Description |
|----------|-------------|
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD_HASH` | BCrypt hash of the admin password |
| `ADMIN_JWT_SECRET` | Secret for signing JWTs (min 32 characters) |
| `ADMIN_JWT_EXPIRATION_SECONDS` | Optional; default 86400 (24h) |

---

# Architecture Summary

**Public read flow:**

```
Client → Controller → Read Service (cached) → Domain/other services → Repository → DB
```

**Admin write flow:**

```
Client (JWT) → JwtAuthenticationFilter → Admin Controller → Domain Service → Repository → DB
                                           ↓
                                    CacheEvictionService.evict*()
```

**Layers:**

- **Controllers:** Thin; call one service (and optionally `CacheEvictionService`).
- **Read services** (`service.read`): `NavigationReadService`, `PortfolioReadService`, `SkillOrbitReadService`, `ResumeTerminalReadService`, `BootstrapReadService`. Cached where listed above.
- **Domain / persistence services:** `AboutService`, `ProjectService`, `ExperienceService`, `SkillService`, `PublicationService`, `ResumeService` (and others). No read services in admin write paths.
- **Cache eviction:** `CacheEvictionService` in `service.read`; invoked by admin controllers after successful writes.

---

*Generated from the OrbitOS Spring Boot backend codebase. All endpoints and DTOs reflect the current implementation.*
