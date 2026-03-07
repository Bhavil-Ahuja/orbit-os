# Orbit OS Frontend

React + Vite frontend for the Orbit OS portfolio CMS.

## Run locally

```bash
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` (see `.env.example`). Default in dev: `http://localhost:8080`.

## Deploy on Vercel (free, custom domain)

1. **Connect repo**
   - Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
   - Import your Git repo (e.g. GitHub). If the repo is **orbit-os** with a `frontend/` folder, continue.

2. **Configure project**
   - **Root Directory:** Click **Edit** → set to `frontend` (so Vercel builds from this folder).
   - **Framework Preset:** Vite (auto-detected).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Environment variable**
   - In the project, open **Settings** → **Environment Variables**.
   - Add:
     - **Name:** `VITE_API_BASE_URL`
     - **Value:** Your backend URL, e.g. `https://orbit-os-k2y3.onrender.com` (no trailing slash).
   - Apply to **Production** (and Preview if you want previews to use the same API).

4. **Deploy**
   - Click **Deploy**. Vercel will build and host the site (e.g. `orbit-os.vercel.app`).

5. **Custom domain**
   - **Settings** → **Domains** → add your domain (e.g. `yourdomain.com`).
   - At your domain registrar, add the A/CNAME records Vercel shows.

6. **Backend CORS**
   - On Render (backend), add an env var: **`APP_CORS_ALLOWED_ORIGINS`** = your frontend URL(s), e.g. `https://yourdomain.com,https://www.yourdomain.com` (and optionally `https://orbit-os.vercel.app` if you use that).
   - Redeploy the backend so CORS allows the frontend origin.

## Build

```bash
npm run build
```

Output is in `dist/`. Preview with `npm run preview`.
