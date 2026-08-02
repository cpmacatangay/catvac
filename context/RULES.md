# Coding Rules — CatVac
**Applicable to:** `server/`, `client/`, and `android/`  
**Enforcement:** ESLint · Husky · PR Review  
**Language:** JavaScript (ES2024+, Node LTS)  
**Version:** MVP v1.0 · Status: Draft

---

## 1. Purpose & Scope

This document defines the non-negotiable coding rules for the CatVac codebase. Every contributor MUST follow these rules. PRs that violate them WILL be rejected.

### Severity Levels (RFC 2119)

| Term | Meaning | Enforced By |
|---|---|---|
| **MUST** | Absolute requirement | CI / PR review gate |
| **SHOULD** | Strongly recommended; exception needs rationale | PR review |
| **MAY** | Optional guidance | Self-enforced |

---

## 2. SOLID Principles (Pragmatic JS Adaptation)

JavaScript has no native interfaces or abstract classes. SOLID is applied through conventions, duck typing, and module structure — not through language features.

### 2.1 Single Responsibility Principle (SRP)

**Each module MUST have exactly one reason to change.**

```javascript
// ❌ BAD: VaccineService handles vaccines AND sends emails
class VaccineService {
  async administer(id, ownerId) { /* ... */ }
  async sendReminderEmail(vaccine, owner) { /* ... */ }
  async generateOverdueReport() { /* ... */ }
}

// ✓ GOOD: VaccineService only handles vaccine mutations
// Email concerns go into ReminderService / MailService
class VaccineService {
  async administer(id, ownerId) { /* ... */ }
  async create(data, ownerId) { /* ... */ }
}

class ReminderService {
  async processDueVaccines() { /* queries vaccines, delegates to mail */ }
}
```

**SRP check for new modules:** Write a one-line description of the module's purpose. If it contains "and" or "or", split it.

### 2.2 Open-Closed Principle (OCP)

**Modules MUST be open for extension but closed for modification.** Prefer adding, not changing.

```javascript
// ❌ BAD: Adding a new reminder type requires modifying the switch
function getReminderText(vaccine, type) {
  switch (type) {
    case 'pre': return preText(vaccine)
    case 'due': return dueText(vaccine)
    // Adding 'overdue' here = modification ← violates OCP
  }
}

// ✓ GOOD: Registry pattern — add new types by creating new handlers, not editing existing code
const reminderTemplates = {
  pre: (v) => `Reminder: ${v.name} due in ${v.daysUntil} days`,
  due: (v) => `Due today: ${v.name}`,
  overdue: (v) => `Overdue: ${v.name} was due ${v.daysOverdue} days ago`,
}

function getReminderText(vaccine, type) {
  return reminderTemplates[type](vaccine)
}

// Adding a new type:
// 1. Create the template function
// 2. Add it to the registry object
// 3. No existing code changes needed ✓
```

### 2.3 Liskov Substitution Principle (LSP) — *Guiding Principle*

**A consuming function MUST work with any subtype of its expected input without knowing the difference.**

Applied as a convention to React component props and service function signatures:

```javascript
// Components accept props via explicit contract
// Any component that implements { vaccine, onAdminister, onSnooze } is interchangeable
function VaccineRow({ vaccine, status, onAdminister, onSnooze }) { /* ... */ }

// Services return consistent shapes
// DashboardService and VaccineService both return { vaccine, status }
// and consuming code treats them interchangeably
```

Use consistent response shapes. If a service method returns `{ vaccine, nextBooster }`, all similar methods SHOULD return the same shape.

### 2.4 Interface Segregation Principle (ISP) — *Guiding Principle*

**No module SHOULD depend on methods it does not use.**

```javascript
// ❌ BAD: A shared "CatService" that handles everything
class CatService {
  async list(ownerId) { /* ... */ }
  async create(data) { /* ... */ }
  async sendHealthTip(cat) { /* ... */ }     // ← Unrelated
  async scheduleVetVisit(cat) { /* ... */ }  // ← Unrelated
}

// ✓ GOOD: Separate aggregates
class CatService {
  async list(ownerId) { /* ... */ }
  async create(data) { /* ... */ }
}
class HealthService { /* unrelated concerns */ }
class VetService { /* unrelated concerns */ }
```

A component that renders a dashboard card SHOULD NOT receive props related to editing a user profile. Keep props lean.

### 2.5 Dependency Inversion Principle (DIP)

**High-level modules MUST NOT depend on low-level modules. Both MUST depend on abstractions.**

In practice: inject dependencies rather than importing them directly.

```javascript
// ❌ BAD: Service directly imports nodemailer
const nodemailer = require('nodemailer')
class ReminderService {
  async send(vaccine) {
    const transporter = nodemailer.createTransport({ /* ... */ })
    await transporter.sendMail({ /* ... */ })
  }
}

// ✓ GOOD: Dependencies injected via constructor or factory
class ReminderService {
  constructor(mailer, logger, timeProvider) {
    this.mailer = mailer      // Abstract mail interface
    this.logger = logger      // Abstract logger
    this.now = timeProvider   // Abstract time (enables frozen-time tests)
  }

  async send(vaccine) {
    await this.mailer.send(/* ... */)
    this.logger.info({ vaccineId: vaccine._id }, 'reminder sent')
  }
}

// Test injection:
const mockMailer = { send: vi.fn() }
const service = new ReminderService(mockMailer, mockLogger, mockTime)
```

**MVP exception:** For trivial utility modules (e.g., date formatters, string helpers) that have no side effects, direct import is acceptable.

---

## 3. DRY — The 4x Rule (Business Logic Only)

### 3.1 Threshold

**When identical or near-identical business logic code appears 4 or more times across the codebase, it MUST be extracted into a shared utility, helper, or service method.**

The count resets after extraction. The threshold applies to each independent extraction target.

### 3.2 What Counts as Business Logic

The rule applies to:

| Counts | Does NOT Count |
|---|---|
| Service layer logic | UI-only constants (colors, breakpoints) |
| Controller request handling patterns | Seed/scaffold/stub code |
| Domain-specific computation (status derivation, date math, message construction) | Schema/Zod type definitions |
| Hooks and their internal logic | ODM query wrappers that mirror API shape |
| Email template construction | Import/export statements |
| Error-handling patterns | Comments and documentation |

### 3.3 Burn-Down Behavior

| Occurrence | Action |
|---|---|
| 1st–3rd | Duplication is acceptable. No action required. |
| 4th | **MUST** extract to shared helper. Remove all 4 original copies. |

### 3.4 Extraction Targets in CatVac

These patterns are expected to hit the 4x threshold during or shortly after MVP build:

| Pattern | Likely Location | What to Extract |
|---|---|---|
| Status derivation (`upcoming`, `due`, `overdue`, `administered`) | Multiple places computing `diffDays` against `leadDays` | `lib/compute-status.js` |
| OwnerId query scoping (`{ ownerId: req.userId }`) | Every service method | Base service or query helper (but not abstract yet — wait for 4x) |
| Date math (`addDays`, `addMonths`, `startOfDay`, `differenceInDays`) | Vaccines, reminders, dashboard, cron | `lib/date-utils.js` |
| Error construction (`throw new NotFoundError(...)`) | Every service | Already centralized via `lib/errors.js` — fine |
| API response formatting (`{ vaccine, message }`) | Multiple controllers | `lib/respond.js` helpers |

### 3.5 The Client/Server Exception

Duplication between `client/` and `server/` is **explicitly allowed** per ARCHITECTURE.md (no monorepo shared types for MVP). Example:

```javascript
// In server/ (Zod schemas):
const createVaccineSchema = z.object({
  name: z.string().min(1).max(100),
  dueDate: z.string().datetime(),
})

// In client/ (duplicate Zod schemas for forms):
const createVaccineSchema = z.object({
  name: z.string().min(1).max(100),
  dueDate: z.string().datetime(),
})
```

**SHOULD** keep them in sync manually. When the 4x threshold is hit across the client AND server combined, extract to a shared third location (`/shared` or npm workspace) and revisit the monorepo decision.

---

## 4. KISS Principle

### 4.1 Smallest Viable Implementation

**Every new function or business logic unit MUST start as the simplest correct implementation.**

```javascript
// ❌ BAD: Premature abstraction
function processAdminister(vaccine, options = {}) {
  const { notifyOwner = true, createNext = true, intervalStrategy = 'strict' } = options
  // complex multi-path logic for edge cases that don't exist yet
}

// ✓ GOOD: Start simple; add complexity only when a real requirement demands it
function processAdminister(vaccine) {
  vaccine.administered = true
  vaccine.administeredDate = new Date()
  if (vaccine.intervalMonths) {
    return [vaccine, createNextBooster(vaccine)]
  }
  return [vaccine]
}
```

### 4.2 No Premature Configuration

**Do not add config parameters, flags, or callbacks until a concrete second use case exists.**

```javascript
// ❌ BAD: Future-proofing that never pays off
async function sendReminder(vaccine, user, { priority = 'normal', retries = 3, channel = 'email' } = {}) {
  // channel is always 'email'; priority is always 'normal'; retries is hardcoded in cron
}

// ✓ GOOD: Hard-code what's fixed; abstract only when a second variant appears
async function sendReminder(vaccine, user) {
  await mailer.send({ ... })
}
```

### 4.3 Explicit Over Clever

```javascript
// ❌ BAD: Clever — reader must pause to understand
const status = ['overdue', 'due', 'upcoming', 'on-track'][
  Math.min(3, diffDays < 0 ? 0 : diffDays === 0 ? 1 : diffDays <= leadDays ? 2 : 3)
]

// ✓ GOOD: Explicit — intent is clear at a glance
let status
if (diffDays < 0) status = 'overdue'
else if (diffDays === 0) status = 'due'
else if (diffDays <= leadDays) status = 'upcoming'
else status = 'on-track'
```

### 4.4 Avoid Over-Nesting

**Nesting depth MUST NOT exceed 3 levels (excluding try/catch and class/function boundaries).**

```javascript
// ❌ BAD: 5 levels deep
function process(vaccine) {
  if (vaccine) {
    if (!vaccine.administered) {
      if (vaccine.dueDate < now()) {
        if (vaccine.snoozedUntil < now()) {
          // ... logic
        }
      }
    }
  }
}

// ✓ GOOD: Early returns flatten the tree
function process(vaccine) {
  if (!vaccine) return
  if (vaccine.administered) return
  if (vaccine.dueDate >= now()) return
  if (vaccine.snoozedUntil >= now()) return
  // ... logic
}
```

### 4.5 Prefer Pure Functions

**Functions that compute derived state (status, intervals, text) MUST be pure — same input, same output, no side effects.**

```javascript
// ✓ GOOD: Pure — deterministic, testable, cacheable
function computeStatus(dueDate, leadDays, administered, snoozedUntil) {
  if (administered) return 'administered'
  // ...
}

// ❌ BAD: Impure — reads global state, produces different results per call
function computeStatus(vaccine) {
  const user = getCurrentUser()        // ← implicit dependency
  if (vaccine.administered) return 'administered'
  const diff = differenceInDays(vaccine.dueDate, user.localNow)  // ← mutation risk
  // ...
}
```

---

## 5. Code Quality Rules

### 5.1 Naming Conventions

| Category | Convention | Example |
|---|---|---|
| Variables / Functions | `camelCase` | `sendReminderEmail`, `dueDate` |
| Classes / Constructors | `PascalCase` | `VaccineService`, `CatModel` |
| Constants (project-wide) | `UPPER_SNAKE_CASE` | `MAX_LEAD_DAYS`, `JWT_EXPIRY` |
| Files — modules | `kebab-case` | `vaccine.service.js` |
| Files — React components | `PascalCase` | `CatCard.jsx` |
| Booleans | Prefix with `is`, `has`, `should` | `isVerified`, `hasIntervals`, `shouldNotify` |
| HTTP handlers | `getVerb(s)Noun / postVerb(s)Noun` | `getCats`, `postVaccines`, `patchAdminister` |

### 5.2 Size Limits

| Metric | Limit | Enforced By |
|---|---|---|
| Function length | **MUST** ≤ 50 lines | ESLint `max-lines-per-function` |
| File length | **MUST** ≤ 300 lines | ESLint `max-lines` |
| Function parameters | **SHOULD** ≤ 4 | ESLint `max-params` |
| Cyclomatic complexity | **MUST** ≤ 10 | ESLint `complexity` |
| Nesting depth | **MUST** ≤ 3 | ESLint `max-depth` |
| Line length | **SHOULD** ≤ 100 | Prettier |

### 5.3 Imports & Exports

- **Always use named exports** for functions and components. Default exports make refactoring and tree-shaking harder.
- Group imports in this order, separated by a blank line: (1) Node builtins, (2) NPM packages, (3) Internal modules.
- No relative imports that traverse up through siblings (`../../utils`). Prefer `src/`-relative paths with a jsconfig.json alias.

```javascript
// ✓ GOOD
import crypto from 'node:crypto'
import mongoose from 'mongoose'
import { Vaccine } from '../models/vaccine.model.js'
import { NotFoundError } from '../lib/errors.js'

// ❌ BAD
import Vaccine from '../models/vaccine.model'                        // default export
import { getText } from '../../../../../../client/src/lib/utils.js'  // path soup
```

### 5.4 Error Handling

```javascript
// ✓ GOOD: Services throw domain-specific errors; controllers catch and format
async function administer(vaccineId, ownerId) {
  const vaccine = await Vaccine.findOne({ _id: vaccineId, ownerId })
  if (!vaccine) {
    // Domain-specific, not generic Error
    throw new NotFoundError('Vaccine not found')
  }
  if (vaccine.administered) {
    throw new ValidationError('Vaccine already administered')
  }
  // ...
}
```

- **MUST** use custom error classes (`NotFoundError`, `ValidationError`, `UnauthorizedError`).
- **MUST NOT** throw raw strings, generic `Error`, or status codes.
- **MUST NOT** swallow errors in `catch` blocks — log and rethrow, or handle properly.

### 5.5 Asynchronous Code

- **MUST** use `async/await`. No raw `.then()` / `.catch()` chains.
- **MUST** use Promise.all for independent parallel operations (e.g., deleting multiple collections).
- **SHOULD** avoid Promise.all for operations >5 at once (use p-limit or similar).

### 5.6 Dependencies

- **MUST** use latest stable versions of all dependencies at the time of install.
- **MUST NOT** use any deprecated function, method, or package. Run `npm outdated` and `depcheck` before each milestone.
- **SHOULD** pin exact versions in `package.json` (no `^` / `~` for production deps).
- **MUST** remove unused dependencies immediately — `depcheck` is part of CI.

---

## 6. Anti-Patterns to Avoid

### 6.1 Fat Controllers

```javascript
// ❌ BAD: Controller calls models directly
async function administerVaccine(req, res, next) {
  const vaccine = await Vaccine.findOne({ _id: req.params.id, ownerId: req.userId })
  if (!vaccine) return res.status(404).json({ error: 'Not found' })
  vaccine.administered = true
  // 20 more lines of inline business logic...
  res.json({ vaccine })
}

// ✓ GOOD: Controller delegates to service
async function administerVaccine(req, res, next) {
  const result = await vaccineService.administer(req.params.id, req.userId)
  res.json(result)
}
```

### 6.2 Services Leaking HTTP Concerns

```javascript
// ❌ BAD: Service returns an HTTP response object
async function findOne(catId) {
  const cat = await Cat.findById(catId)
  if (!cat) return { status: 404, body: { error: 'Not found' } }
  return { status: 200, body: cat }
}

// ✓ GOOD: Service returns data; controller formats response
async function findOne(catId) {
  const cat = await Cat.findById(catId)
  if (!cat) throw new NotFoundError('Cat not found')
  return cat
}
```

### 6.3 Cross-Service Model Access

```javascript
// ❌ BAD: VaccineService directly queries User model
class VaccineService {
  async administer(id, ownerId) {
    const user = await User.findById(ownerId)       // ← should not reach into another domain
    // ...
  }
}

// ✓ GOOD: VaccineService stays in its domain; cross-domain queries happen in a controller or orchestrator
class VaccineService {
  async administer(id, ownerId) {
    // Only Vaccine and Cat models
  }
}
```

### 6.4 Comments That Parrot Code

```javascript
// ❌ BAD: Comment repeats what the code already says
vaccine.administered = true   // set administered to true
save(vaccine)                 // save the vaccine

// ✓ GOOD: Comment explains WHY, not WHAT
// Lock the vaccine row so the cron doesn't send duplicate reminders during the reschedule window
manager.administer(vaccine)
```

### 6.5 Negated Boolean Props

```javascript
// ❌ BAD
<StatusPill isNotAdministered={!vaccine.administered} />

// ✓ GOOD
<StatusPill isAdministered={vaccine.administered} />
```

### 6.6 Magic Strings / Numbers

```javascript
// ❌ BAD
if (dueDate < addDays(new Date(), 7)) { /* ... */ }
const token = jwt.sign(payload, 'my-secret-key')  // hardcoded secret

// ✓ GOOD
const LEAD_DAYS = 7
if (dueDate < addDays(new Date(), LEAD_DAYS)) { /* ... */ }
const token = jwt.sign(payload, process.env.JWT_SECRET)  // from env
```

---

## 7. Enforcement & Tooling

### 7.1 ESLint Configuration

Place this at `server/.eslintrc.cjs` and `client/.eslintrc.cjs` (adjust as needed):

```javascript
module.exports = {
  env: { node: true, es2024: true },
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    // ——— SOLID / DRY / KISS enforcement ———
    'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
    'max-params': ['warn', { max: 4 }],
    'complexity': ['warn', { max: 10 }],
    'max-depth': ['warn', { max: 3 }],
    'max-nested-callbacks': ['warn', { max: 3 }],

    // ——— Code quality ———
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-undef': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }], // forbid console.log
    'no-magic-numbers': ['warn', {
      ignore: [0, 1, -1],              // common in date math
      ignoreArrayIndexes: true,
      enforceConst: true,
    }],
    'no-var': 'error',
    'prefer-const': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-rename': 'error',
    'object-shorthand': 'error',

    // ——— Async / error handling ———
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error',
    'no-async-promise-executor': 'error',

    // ——— Naming ———
    'camelcase': ['warn', { properties: 'never', ignoreDestructuring: true }],
    'new-cap': ['warn', { newIsCap: true, capIsNew: false }],

    // ——— Import order (requires eslint-plugin-import) ———
    'import/order': ['warn', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
    }],
  },
}
```

### 7.2 Husky + lint-staged

```json
// server/package.json or client/package.json
"lint-staged": {
  "*.js": ["eslint --fix", "prettier --write"],
  "*.jsx": ["eslint --fix", "prettier --write"],
  "*.json": ["prettier --write"],
  "*.md": ["prettier --write"]
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

### 7.3 PR Review Checklist

Every PR MUST pass this checklist before merge:

| # | Check | Rule |
|---|---|---|
| 1 | No service calls another service's model directly | SRP / Anti-pattern 6.3 |
| 2 | No business logic in controllers | SRP / Anti-pattern 6.1 |
| 3 | Dependencies injected, not imported directly (for side-effectful modules) | DIP |
| 4 | No function exceeds 50 lines | Size limit |
| 5 | No file exceeds 300 lines | Size limit |
| 6 | No magic strings/numbers | Anti-pattern 6.6 |
| 7 | No deprecated APIs or packages | PRD requirement |
| 8 | No console.log (warn/error allowed) | ESLint rule |
| 9 | Functions are pure where they could be (no hidden state) | KISS 4.5 |
| 10 | If a 4th duplication of business logic was introduced instead of extracted | DRY |
| 11 | Custom error classes used (not raw Error or status numbers) | Quality 5.4 |
| 12 | All values from environment variables validated with defaults or explicit fail | Security |

### 7.4 CI Gate

```yaml
# .github/workflows/ci.yml
jobs:
  lint-and-test:
    steps:
      - run: npm ci
      - run: npx depcheck                    # unused dependencies check
      - run: npx eslint .                    # all rules above enforced
      - run: npx prettier --check .          # formatting compliance
      - run: npm run test                    # Vitest suite must pass
      - run: npx npm outdated --all          # fail if any dep is out of date (MVP strict)
```

---

## 8. Quick Reference Card

| Principle | TL;DR | CatVac Example |
|---|---|---|
| **SRP** | One reason to change per module | `VaccineService` does NOT send emails |
| **OCP** | Add new behavior, don't edit old code | New reminder type = add to registry, not edit switch |
| **LSP** | Consumers work with any implementation | Any component accepting `{ vaccine, status }` works |
| **ISP** | Don't depend on what you don't use | CatService doesn't handle vet scheduling |
| **DIP** | Inject side-effects (mailer, time, logger) | `new ReminderService(mailer, logger, time)` |
| **DRY** | Extract at 4th business-logic repetition | `computeStatus()` extracted after 4th usage |
| **KISS** | Start simple; add only when concrete need exists | No config flags until second use case |
