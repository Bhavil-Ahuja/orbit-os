# Orbit OS Portfolio Backend

Production-ready Spring Boot 3 backend (Java 17, Maven) for the Orbit OS headless CMS.

## Requirements

- Java 17
- Maven (optional; use `./mvnw` if you don’t have Maven installed)

## Run

```bash
./mvnw spring-boot:run
```

Uses PostgreSQL by default. Configure in `src/main/resources/application.yml` (or env: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`).

To run **without PostgreSQL** (in-memory H2):

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

## Tests

```bash
./mvnw test
```

Tests use an in-memory H2 database (no PostgreSQL required).

## Project layout

- `src/main/java/com/orbitos/portfolio/` — application and config
- `src/main/resources/` — `application.yml`, profiles (`application-dev.yml`, `application-local.yml`)

## API structure

- **Public (read-only):** `/api/public/**` — no auth
- **Admin:** `/api/admin/**` — requires authentication (e.g. JWT later)
- **Health:** `/api/public/health`, `/actuator/health`

## JSON columns (Project entity)

JSON list fields (`impact`, `design_decisions`, `technical_challenges`, `tech_stack`, `screenshots`) are stored as:

- **PostgreSQL:** JSONB (detected from `spring.datasource.url` containing `postgresql`, or set `app.json.column-definition=jsonb`).
- **H2:** TEXT (default when not Postgres; local/test use `H2TextDialect` so CLOB is created as TEXT).

Serialization uses Jackson via `ListStringJsonType` (Hibernate UserType). No `@Column(columnDefinition)` on the entity; the type chooses the SQL type at runtime.

## Build

```bash
./mvnw clean package
java -jar target/portfolio-0.0.1-SNAPSHOT.jar
```

## Deploy on Render (Docker)

1. **Create a Web Service**
   - Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**.
   - Connect your GitHub account and select the repo that contains `backend/`.
   - When asked for **Runtime**, select **Docker**.

2. **Configure the service**
   - **Name:** e.g. `orbit-os-backend`.
   - **Root Directory:** `backend` (so Render uses `backend/Dockerfile`).
   - Leave **Build Command** and **Start Command** empty; the Dockerfile defines build and run.

3. **Environment variables** (Environment tab)
   - **DATABASE_PUBLIC_URL** — Your Postgres URL (e.g. from Railway: use the **public** URL, e.g. `postgresql://user:password@host.railway.app:PORT/railway`). The app uses this when not on Railway.
   - **ADMIN_USERNAME** — Admin login (e.g. `admin`).
   - **ADMIN_PASSWORD** or **ADMIN_PASSWORD_HASH** — Use a strong password; for hash use BCrypt.
   - **ADMIN_JWT_SECRET** — Long random string (min 32 chars) for signing JWTs.
   - **CLOUDINARY_CLOUD_NAME**, **CLOUDINARY_API_KEY**, **CLOUDINARY_API_SECRET** — If you use resume PDF upload in admin (optional).

4. **First deploy**
   - Click **Create Web Service**. Render will build and start the app.
   - To create tables on first run, add a one-off env var **SPRING_JPA_HIBERNATE_DDL_AUTO** = `update` for the first deploy, then remove it or set to `validate` for production.

5. **Public URL**
   - After deploy, open **Settings** → **Networking** and add a **Custom Domain** or use the default `*.onrender.com` URL.
