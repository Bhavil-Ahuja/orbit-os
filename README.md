# Orbit OS 🚀

## Overview
Personal interactive developer operating system — "Booting into a Software Engineer's Space Operating System". Space-themed portfolio with spacecraft console UX, terminal UI, and orbital visuals.

## Tech Stack
- **Framework:** React (Vite)
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **3D:** Three.js via @react-three/fiber + @react-three/drei
- **State:** Zustand
- **Routing:** React Router DOM
- **HTTP:** Axios
- **Code blocks:** react-syntax-highlighter
- **Icons:** lucide-react
- **Fonts:** Orbitron (headings), Space Mono (terminal/code), Exo 2 (body)

## Run (Phase 1)
```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
npm run build
```

## Secrets (no passwords in repo)
Passwords and API keys are **not** committed. Use env files (gitignored):

- **Repo root:** Copy `.env.example` to `.env` and set `POSTGRES_PASSWORD`, `PGADMIN_DEFAULT_PASSWORD` (required for `docker compose up -d`).
- **Backend:** Copy `backend/.env.example` to `backend/.env` and set `SPRING_DATASOURCE_PASSWORD`, `ADMIN_PASSWORD`, and optionally Cloudinary keys. For local dev, use the same password as in root `.env` for Postgres.

## Project Structure (Phase 1)
```
orbit-os/
├── frontend/           # React (Vite) app
│   ├── src/
│   │   ├── assets/
│   │   ├── animations/        # page transitions, variants
│   │   ├── components/
│   │   │   ├── SpaceBackground/   # Three.js starfield + camera drift
│   │   │   ├── Terminal/
│   │   │   ├── CodeCard/
│   │   │   ├── Navbar/            # floating spacecraft-style nav
│   │   │   ├── ResumeViewer/      # View / Download / Fullscreen, API-driven
│   │   │   ├── SocialDock/
│   │   │   └── ContactCard/
│   │   ├── pages/             # Home, Console (scroll sections), WhoAmI
│   │   ├── hooks/
│   │   ├── services/          # contentService + mockData (API placeholder)
│   │   ├── store/             # Zustand (boot, route, admin)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
├── docker/
├── docs/
└── README.md
```

## Routes
- `/` — Landing: boot sequence and "Explore the Universe".
- `/explore` — Main app (About, Experience, Projects, Skills, Resume, Stay in Touch).
- `/app`, `/console` — Redirect to `/explore`.
- `/whoami` — Admin login and dashboard.

## Data
No hardcoded personal data. All content is loaded via `contentService` (mock: `frontend/src/services/mockData.js`). When backend exists: `GET /api/about`, `/api/projects`, `/api/skills`, `/api/experience`, `/api/resume`, `/api/landing`.

## Architecture
Frontend → API → PostgreSQL → Cloudinary

## Roadmap
- Phase 1: Interactive Frontend ✅
- Phase 2: Backend CMS
- Phase 3: Secure Admin Portal