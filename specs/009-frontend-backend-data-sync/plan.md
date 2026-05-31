# Implementation Plan: Frontend Real-Time Data Sync

**Branch**: `009-frontend-backend-data-sync` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-frontend-backend-data-sync/spec.md`

## Summary

Replace all hardcoded mock data across the Discovery Engine frontend with real-time API data. Wire the Navbar, Sidebar, Dashboard (Home), My Journey, and Profile pages to the backend. Fix the non-functional dark/light mode toggle. Create three new backend endpoints (`/api/user/activity`, `/api/user/achievements`, `/api/user/credit-history`) and migrate the in-memory user/credit stores to SQLite. Introduce a lightweight React Context for shared user/credit state to avoid prop drilling across the component tree.

## Technical Context

**Language/Version**: TypeScript 5.9 (frontend), TypeScript 5.5 (backend), Node.js 18+

**Primary Dependencies**: React 19.2, Express.js 4.19, Tailwind CSS 3.4.19, better-sqlite3, Framer Motion 12, Lucide React

**Storage**: SQLite (`discovery-engine-backend/data/discovery-engine.db`) via `better-sqlite3`

**Testing**: Vitest + React Testing Library (frontend), Vitest + supertest (backend) — *to be installed, not in scope for this feature*

**Target Platform**: Web (Chrome, Safari, Firefox) — responsive down to mobile

**Project Type**: Web application (full-stack: React frontend + Express backend)

**Performance Goals**: API endpoints respond in <200ms; UI updates within 1s of data change; theme switch <500ms

**Constraints**: No new state management libraries (Redux, MobX, Zustand) — React Context + hooks only. No new UI libraries — shadcn/ui + Tailwind only. No new databases — SQLite only.

**Scale/Scope**: Single user per demo session (mock auth). Data sizes: <100 activities, <50 credit transactions, <20 blueprints.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. TypeScript Strictness | ✅ Pass | All changes must pass `noUnusedLocals` / `noUnusedParameters` frontend, `strict: true` backend |
| II. Sacred 4-Step Wizard | ✅ Pass | No wizard changes; only data wiring around it |
| III. Brand Consistency | ✅ Pass | No new colors/fonts; theme toggle must preserve brand palette in both modes |
| IV. Backend-First Persistence | ⚠️ Partial | In-memory `userStore` and `userCredits` Map MUST be migrated to SQLite as part of this feature |
| V. Real AI or Nothing | ✅ Pass | No AI changes in this feature |

**Constitution Violation Justification**: Principle IV is partially violated because the current `userStore` (in-memory Map) and `creditService` (in-memory Map) have not yet been migrated to SQLite. This feature **requires** that migration to serve real user data. A new `users` table and `credit_transactions` table will be created, and the in-memory stores will be deprecated.

## Project Structure

### Documentation (this feature)

```text
specs/009-frontend-backend-data-sync/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.yaml         # OpenAPI spec for new endpoints
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
app/                              # Frontend React application
├── src/
│   ├── main.tsx                  # Entry point — add ThemeProvider
│   ├── App.tsx                   # Add UserProvider wrapper
│   ├── pages/
│   │   ├── Home.tsx              # Replace mockUser with real data
│   │   ├── Journey.tsx           # Replace static timeline/achievements/activity
│   │   └── Profile.tsx           # Replace static data, wire theme toggle
│   ├── components/
│   │   ├── Navbar.tsx            # Wire credits badge to API
│   │   ├── Sidebar.tsx           # Wire user name/email to API
│   │   └── ui/                   # shadcn/ui components (no changes)
│   ├── lib/
│   │   ├── api.ts                # Add new endpoint functions
│   │   └── mockData.ts           # Mark deprecated (keep for fallback)
│   ├── hooks/
│   │   └── useUser.ts            # NEW: React hook for user/credit context
│   └── context/
│       └── UserContext.tsx       # NEW: React Context for shared user state
├── index.html                    # Add dark class support
└── tailwind.config.js            # Add dark mode strategy

discovery-engine-backend/         # Backend Express API
├── src/
│   ├── index.ts                  # No changes (routes already wired)
│   ├── db/
│   │   ├── index.ts              # Add users + credit_transactions schema
│   │   ├── blueprintRepository.ts # No schema changes
│   │   ├── userRepository.ts     # NEW: SQLite user CRUD
│   │   └── creditRepository.ts   # NEW: SQLite credit transaction CRUD
│   ├── routes/
│   │   └── user.ts               # Add GET /activity, GET /achievements, GET /credit-history
│   ├── controllers/
│   │   └── userController.ts     # Add handlers for new endpoints
│   ├── services/
│   │   └── creditService.ts      # Migrate from in-memory Map to SQLite
│   └── types/
│       └── index.ts              # Add CreditTransaction type
└── data/
    └── discovery-engine.db       # SQLite file (auto-created)
```

**Structure Decision**: Option 2 (Web application) — full-stack with separate frontend/backend directories. All changes are additive (new files) or surgical refactors (replacing hardcoded values with API calls). No new dependencies outside the approved stack.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| SQLite migration for users & credits | Constitution IV requires backend-first persistence; in-memory stores lose data on restart | Keeping in-memory stores rejected because it violates the constitution and breaks user trust when credits reset |
| React Context for shared state | Constitution forbids Redux/MobX/Zustand; prop drilling across 5+ components is unmaintainable | Prop drilling rejected because it would require changing 15+ component signatures for a single data source |
