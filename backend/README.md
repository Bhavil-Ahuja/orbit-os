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
- `migrations/` — PostgreSQL schema (run manually or via your migration tool)

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
