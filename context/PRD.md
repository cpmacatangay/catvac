# Product Requirements Document
## CatVac — Feline Vaccine Reminder System
**Stack:** MongoDB · Express · React · Node (MERN)
**Version:** MVP v1.0 · Status: Draft

---

## 1. Problem & Context

Cat owners frequently miss booster dates (rabies, FVRCP, FeLV core vaccines) because doses are spaced months or years apart, paper cards get lost, and vet clinics don't always follow up — leading to under-protected pets, expired booster validity, and avoidable bills.

**CatVac** is a personal multi-cat household web app that lets an owner maintain a small roster of cats and the vaccines each needs, with custom reminder dates and email nudges so no jab is ever skipped again.

---

## 2. Goals & Non-Goals

### Goals (MVP)
1. Let one user register, log in securely, and manage **multiple cat profiles** under a single household account.
2. Allow the owner to **define custom vaccines and reminder dates per cat** (no rigid preset schedule) — name, due date, recurrence interval, notes.
3. Send **email reminders** before a vaccine is due (configurable lead time), on the due date, and after it becomes overdue.
4. Provide a **dashboard** showing each cat's upcoming due/snoozed/overdue vaccines at a glance.
5. Allow marking a vaccine **administered**, which (if a recurrence is set) auto-schedules the next booster.

### Non-Goals (explicitly deferred to Phase 2+)
- SMS / in-app push notifications
- Preset vaccination schedules (AAHA/AAFP-driven)
- Vet clinic directory or appointment booking
- Photo/PDF vet record uploads
- Multi-user sharing (spouse/vet co-management)
- Per-region schedule configuration / admin tooling
- Native mobile apps
- Gamification, social features, marketplace

---

## 3. Project Scope

| In Scope (MVP) | Out of Scope (Phase 2) |
|---|---|
| Auth (email/password + JWT) | SMS, in-app push |
| Multi-cat CRUD | Vet records upload |
| Custom vaccine + reminder CRUD | Clinic directory/booking |
| Email reminder engine (cron) | Multi-user household sharing |
| Dashboard with status pills | Preset/auto schedules |
| Administer & auto-reschedule | i18n, mobile apps |

---

## 4. Users & Personas

**Primary persona — "Cat Parent":** A household owner with 1–5 cats. Technically comfortable, wants a lightweight web tool. Pain points: forgetting annual rabies boosters, unclear which cat is due, no central record. Needs: quick setup, reliable email nudges, a one-screen overview.

**Secondary (Phase 2) — Veterinarian/Clinic:** Not targeted in MVP.

---

## 5. MVP — User Stories

*Registration & Auth*
- US1: As a new user, I can sign up with email + password and receive a confirmation email.
- US2: As a returning user, I can log in and receive a JWT session (httpOnly cookie) valid for N days.

*Cat Profiles*
- US3: As a logged-in user, I can add a cat (name, breed, DOB/age, sex, photo URL optional, notes).
- US4: I can edit or delete a cat; deleting cascades its vaccines.
- US5: I can view all my cats and select one to manage its vaccines.

*Vaccines & Reminders (custom per cat)*
- US6: For a given cat, I can add a vaccine entry: name, planned due date, recurrence interval (one-off \| every N months/years), notes.
- US7: I can edit/snooze/delete a vaccine entry.
- US8: I can mark a vaccine as "administered" with an optional administered date + note; if recurring, the next occurrence auto-creates at due date + interval.
- US9: For a recurring vaccine I can skip a cycle (snooze to next occurrence).

*Reminders & Dashboard*
- US10: I can configure a default reminder lead time (e.g. 7 days before due) and which emails I receive (pre/due/overdue).
- US11: I can see a dashboard listing all upcoming (pre-due), due, overdue, and just-administered vaccines grouped per cat with color-coded status.
- US12: I can unsubscribe from reminder emails via a tokenized one-click link.

---

## 6. Functional Requirements

### 6.1 Authentication & Authorization
- Email/password signup with bcrypt hashing (cost ≥ 12).
- JWT issued in **httpOnly, Secure, SameSite=Lax** cookie; refresh token rotation recommended.
- Email verification on signup (optional for MVP; flagged).
- Password reset via signed token email link.
- All API routes except `/auth/*` and `/public/*` protected by middleware; data scoped to `ownerId`.

### 6.2 Cat Profile Management
- CRUD endpoints, max ~20 cats per account (soft cap).
- Schema: `{ _id, ownerId, name, breed, dob?, sex?, photoUrl?, notes?, createdAt, updatedAt }`.
- Delete cat → soft delete with confirmation; cascade soft-delete of vaccine entries.

### 6.3 Vaccine & Reminder Management (custom per cat)
- Vaccine schema: `{ _id, catId, ownerId, name (string), dueDate (Date), intervalMonths|null, administered (bool), administeredDate?, administeredNote?, snoozedUntil?, status (derived), createdAt, updatedAt }`.
- Derived `status`: `upcoming | due | overdue | administered` computed from `dueDate` vs today and `leadTime`.
- Administer action: set `administered=true`, stamp date; if `intervalMonths` set, create new sibling document with `dueDate = administeredDate + interval` and `administered=false`.
- Snooze: set `snoozedUntil` (default +7 or +30 days), excluded from "due/overdue" filters until that date.

### 6.4 Reminder Engine
- Background `node-cron` job runs nightly (configurable; e.g. 02:00 server time) in the Express process.
- Queries vaccines whose `dueDate` falls into pre-due / due / overdue windows relative to the owner's configured lead time.
- Deduplication uses a `ReminderLog` collection keyed by `(vaccineId, reminderType, dateWindow)` — skips if a log entry already exists for that window.
- Owner notification preferences stored on the User document: `{ leadDays (7), receivePreDue (true), receiveDue (true), receiveOverdue (true) }`.
- Email templates rendered as plain HTML strings (no template engine dependency for MVP).
- Transport via **nodemailer** over SMTP (Brevo/SendGrid/Resend). Sandbox mailtrap for dev.
- Retry: the cron re-processes failed sends in the next run (log status in `ReminderLog`).
- Email types: pre-due, due, overdue, administered-confirmation, welcome, reset-password, unsubscribe.
- Unsubscribe via signed token link in each email: `/api/unsubscribe?token=<hmac-signed (userId, email, type)>`.

### 6.5 Dashboard
- Frontend fetches a `GET /api/dashboard` aggregation returning `{ cats: [{ cat, vaccines: [...] }] }` with statuses precomputed server-side.
- Group and color-code by status; sort by due date ascending; quick "Mark administered" action inline.

### 6.6 Unsubscribe
- Each reminder email contains a link: `/api/unsubscribe?token=<signed token>`.
- On click: update owner preferences to disable that reminder type (or all) without requiring login.

---

## 7. Technical Requirements — MERN

### 7.1 Project Structure
- Two folders at the repo root: `client/` (React) and `server/` (Express).
- No monorepo tooling or shared types package for MVP — schemas can be duplicated where needed.

### 7.2 Backend (Node + Express)
- Node LTS (20.x+), Express 4.5+, modular route/controller structure.
- All dependencies, functions, methods, and packages must be the latest stable versions. Deprecated APIs and packages must not be used; any detected deprecation must be replaced before merging.
- **Mongoose** ODM; collections: `users`, `cats`, `vaccines`, `reminderlog`.
- Env config via `dotenv`; secrets in environment variables, never committed.
- Input validation via **Zod** at controller boundary.
- Central error handler middleware; structured logs (pino) with request id.
- Rate limiting (express-rate-limit) on auth endpoints (e.g. 5/min on login/signup).
- Helmet for security headers; CORS allowlist (frontend origin only).
- API versioning at mount: `/api/v1/...`.

### 7.3 Frontend (React)
- React 18 with **Vite**; functional components + hooks.
- Routing: **React Router v6**.
- State/server cache: **TanStack Query** for API data (mutations + invalidation), React Context for auth + UI.
- UI: **Tailwind CSS** + a small component kit (headless UI or shadcn-style).
- Forms: **React Hook Form + Zod** resolvers.
- Auth flows gated by a `ProtectedRoute` wrapper checking JWT presence + backend `/me` verify.
- Toasts for success/error; loading skeletons; empty states.

### 7.4 Database (MongoDB)
- Atlas free tier (M0) acceptable for MVP; connection via SRV URI.
- Indexes:
  - `vaccines`: `{ ownerId: 1, catId: 1, dueDate: 1 }`, `{ dueDate: 1, administered: 1 }` (for cron scan), `{ ownerId: 1, dueDate: 1 }`.
  - `users`: unique `email`, `passwordResetToken`.
  - `reminderlog`: unique `{ vaccineId: 1, type: 1, windowDate: 1 }` (idempotency).
- TTL index or nightly cleanup on old reminder log entries (>90 days).

### 7.5 Security & Compliance
- bcrypt password hashing; never log passwords/tokens/PII.
- Email unsubscribe token signed with server secret (HMAC).
- GDPR-friendly: minimal PII (email only); account deletion endpoint that hard-deletes user + cats + vaccines + reminder logs within 30 days.
- CSP, HSTS, XSS-safe rendering (React escapes by default; no `dangerouslySetInner`).
- Secrets via env; git pre-commit hook to scan for secrets.

### 7.6 Testing
- Backend: **Vitest** + **Supertest** for unit + integration on critical paths (auth, vaccine CRUD, reminder cron logic).
- Frontend: **Vitest + React Testing Library** for component and hook tests.
- Coverage target: ≥ 60% on services/controllers (pragmatic MVP level).
- No E2E framework for MVP — manual smoke test on critical flows before deploy.

### 7.7 Observability
- Structured logs (pino) → stdout.
- **Sentry** for error tracking (frontend + backend).
- Cron job logs start/finish/count per run; basic alert if no run in >36h.

### 7.8 Dev Tooling
- ESLint + Prettier; Husky lint-staged pre-commit.
- Docker compose: `web` (Vite dev), `api` (Express), `mongo`, `mailhog` for local dev.
- Seed script: demo user with 2 cats and several vaccine entries.
- README with one-command setup (`docker compose up`).
- OpenAPI spec at `/api/docs` (swagger-ui-express or scalar).

---

## 8. Data Model

```
User { _id, email, passwordHash, isVerified,
       prefs: { leadDays, receivePreDue, receiveDue, receiveOverdue },
       createdAt }

Cat { _id, ownerId→User, name, breed?, dob?, sex?, photoUrl?, notes,
      deletedAt? }

Vaccine { _id, ownerId, catId→Cat, name, dueDate, intervalMonths?,
          administered, administeredDate?, administeredNote?,
          snoozedUntil?, createdAt, updatedAt }

ReminderLog { _id, vaccineId→Vaccine, type("pre"|"due"|"overdue"),
              windowDate, sentAt, status("sent"|"failed"), error? }
```

---

## 9. Success Metrics

| Metric | MVP target (90 days post-launch) | Notes |
|---|---|---|
| Activation rate | ≥ 50% of signups add ≥1 cat within 24h | proxy for core value |
| Vaccine entries created | avg ≥ 3 per active household | engagement |
| Reminder delivery rate | ≥ 99% of due-vaccine emails sent successfully | ops SLO |
| Reminder → administration conversion | ≥ 40% of due/overdue vaccines marked administered within 14 days of first reminder | core outcome |
| Overdue vaccines trending down | avg overdue count per household ↓ 50% w/w | true north |
| 7-day retention | ≥ 60% returning users | stickiness |
| Cron reliability | 0 missed nightly runs / month | ops |
| Core API p95 latency | < 300 ms (dashboard, list vaccines) | perf |

---

## 10. Milestones (MVP build plan)

| Week | Focus | Deliverables |
|---|---|---|
| **Wk 1** | Scaffolding | Monorepo folders (`client/` + `server/`), Vite+React, Express+Mongoose, Atlas connection, Docker compose (api, web, mongo, mailhog), CI skeleton (lint + typecheck), README setup |
| **Wk 2** | Auth & cats | Signup/login/logout/reset-password (JWT in httpOnly cookie), `/me` endpoint, protected route wrapper on frontend, cat CRUD (model, routes, controller, React pages) |
| **Wk 3** | Vaccines | Vaccine CRUD (model, routes, controller, forms), administer + auto-reschedule, snooze, status derivation server-side, indexed queries |
| **Wk 4** | Reminder engine | `node-cron` job, nodemailer transport, 4 email templates (pre/due/overdue/administered), dedup via ReminderLog, unsubscribe endpoint, owner notification prefs UI |
| **Wk 5** | Dashboard & polish | Dashboard aggregation endpoint, React dashboard page with status pills grouping, loading/empty/error states, toast notifications, Sentry setup, error handling pass |
| **Wk 6** | Hardening & deploy | Rate limits, CSP/Helmet review, GDPR delete endpoint, seed script, env config, deploy API to Railway/Render (or EC2) + frontend to Vercel, smoke test in prod |
