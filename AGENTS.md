# CatVac — Agent Instructions

`client/`, `server/`, and `android/` are live codebases — follow the conventions below when editing.

## Project Structure (current)

```
catvac/
├── client/               # React SPA (Vite, Tailwind, TanStack Query)
│   └── src/
│       ├── components/   # Presentational (CatCard, VaccineRow, StatusPill)
│       ├── pages/        # Containers (LoginPage, DashboardPage, CatDetailPage)
│       ├── hooks/        # Custom hooks (useAuth, useDashboard, useVaccines)
│       ├── context/      # AuthContext
│       └── lib/          # api.js fetch wrapper, validators
├── server/               # Express API (Mongoose, Zod, pino, node-cron)
│   └── src/
│       ├── routes/       # Express routers (thin — URL mapping only)
│       ├── controllers/  # Parse req, call service, format res (thin)
│       ├── services/     # Business logic (accept ownerId, never call models directly)
│       ├── models/       # Mongoose schemas
│       ├── middleware/    # auth, validate, error, notFound
│       ├── schemas/      # Zod validation
│       ├── lib/           # Pure utilities (computeStatus, fcmClient, errors, env)
│       ├── cron/         # node-cron reminder engine
│       └── emails/       # HTML email templates (plain strings, no template engine)
├── android/              # Kotlin + Jetpack Compose (Material 3)
│   └── app/src/main/java/com/catvac/app/
│       ├── data/         # DTOs, APIs (Retrofit), repositories, local (EncryptedTokenStore)
│       ├── data/repository/  # AuthRepository, CatsRepository, VaccinesRepository, DashboardRepository, DevicesRepository
│       ├── domain/       # ComputeStatusUseCase
│       ├── ui/           # Screens + components (Compose)
│       └── push/         # CatVacFcmService
├── docker-compose.yml    # api:3000, web:5173, mongo:27017, mailhog:8025
└── context/              # PRD, DESIGN, ARCHITECTURE, SCHEMA, RULES, MOBILE
```

## Architecture Rules

### Backend Layer Flow
```
Route → Middleware (auth → validate) → Controller → Service → Model → MongoDB
```
- **Routes**: Express routers, URL mapping only
- **Controllers**: Parse `req`, call one service method, send response. No business logic.
- **Services**: All business logic. Accept `ownerId` param on every method. Throw domain errors (`NotFoundError`, `ValidationError`, `UnauthorizedError`). Never import models from other domains.
- **Middleware**: `auth.middleware.js` verifies JWT from httpOnly cookie OR `Authorization: Bearer <token>` header (mobile fallback). Sets `req.userId`. `validate.middleware.js` runs Zod schemas. Error handler is last.
- **Models**: Mongoose schemas + indexes. No business logic.

### Every query must include `ownerId: req.userId` — no exception. This is the app's only RLS mechanism.

### Mobile Auth (Bearer Token)

Android cannot use browser cookies, so the auth middleware falls back to `req.headers.authorization?.replace('Bearer ', '')`. Login/signup responses include `{ user, token }` in the body — the Android app stores the JWT in `EncryptedSharedPreferences` and injects it as a Bearer header via an OkHttp interceptor.

## Key Conventions

- **Named exports** for everything (no default exports)
- **kebab-case** for module files (`vaccine.service.js`), PascalCase for React components (`CatCard.jsx`)
- **Pure functions** for derived state (status computation — never stored, computed at query time)
- **Dependency injection** for side-effectful services (mailer, logger, timeProvider passed to constructor)
- **DRY threshold**: extract shared business logic at the 4th occurrence. Client/server duplication is explicitly allowed (no monorepo shared types for MVP)
- **No console.log** — use `req.log` (pino child logger) or `console.warn`/`console.error`
- **No magic strings/numbers** — constants in UPPER_SNAKE_CASE, secrets from env only
- **httpOnly cookies** for JWT (not localStorage). `Secure` in production, `SameSite=Lax`.
- **Vaccine status derived server-side** via `computeStatus(dueDate, leadDays, administered, snoozedUntil)` — not stored
- **ownerId denormalized** on vaccines collection (avoids two-hop lookup on dashboard queries)

## Developer Commands (npm scripts — create as needed)

```bash
# Local dev (Docker Compose)
docker compose up                    # starts api:3000, web:5173, mongo:27017, mailhog:8025

# Or run individually:
cd server && npm run dev             # Express with nodemon on :3000
cd client && npm run dev             # Vite on :5173, proxies /api → :3000

# Seed demo data
cd server && npm run seed:demo       # demo@catvac.app / password123

# Migrations
cd server && npm run migrate:up
cd server && npm run migrate:down

# Testing
cd server && npm test                # Vitest + Supertest (unit + integration)
cd client && npm test                # Vitest + React Testing Library

# Android (personal-use, no Play Store)
export ANDROID_HOME=/path/to/sdk
cd android && ./gradlew assembleDebug     # Build debug APK (app/build/outputs/apk/debug/)
cd android && ./gradlew assembleRelease   # Build release APK (signed via key.properties)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk  # Install on device

# Full validation gate (run before every commit/PR)
cd server && npm test && cd ../android && ./gradlew assembleDebug
```

## Testing

- **Backend**: Vitest + Supertest for services/controllers. Mock mailer, logger, timeProvider via DI. Coverage target ≥ 60%.
- **Frontend**: Vitest + React Testing Library for components and hooks.
- **No E2E** for MVP — manual smoke test before deploy.
- Mailhog at `http://localhost:8025` catches all dev SMTP.

## Env Variables (server)

```
MONGODB_URI=mongodb://mongo:27017/catvac
JWT_SECRET=<random-64-chars>
JWT_EXPIRES_IN=30d
SMTP_HOST=mailhog              # localhost for dev outside Docker
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=reminders@catvac.app
FRONTEND_ORIGIN=http://localhost:5173
SENTRY_DSN=                    # optional in dev
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json  # optional, enables FCM push
UNSUBSCRIBE_SECRET=<random>
```

## Source of Truth Hierarchy

1. `context/RULES.md` — coding standards, ESLint config, PR checklist, anti-patterns
2. `context/SCHEMA.md` — Mongoose schemas, indexes, migrations, cascading deletes
3. `context/ARCHITECTURE.md` — layered architecture, middleware order, data flow, deployment
4. `context/DESIGN.md` — Tailwind palette, typography, spacing, component styling
5. `context/PRD.md` — user stories, functional requirements, milestones
6. `context/MOBILE.md` — Android architecture (Kotlin + Compose), auth, push, distribution

If docs conflict, trust the executable source (package.json scripts, config files) over prose.
