# Implementation Plan: Dashboard and Journey Blueprint Integration

**Branch**: `005-dashboard-journey-wiring` | **Date**: 2026-05-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-dashboard-journey-wiring/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Wire the Dashboard (Home) and Journey pages to real blueprint data from the SQLite backend, fix critical wizard state-restoration bugs, align frontend/backend type contracts, and replace hardcoded UI placeholders with dynamic data. This is primarily a data-integration and bug-fix feature with no new user-facing screens.

## Technical Context

**Language/Version**: TypeScript 5.9 (frontend), TypeScript 5.5 (backend), Node.js 18+

**Primary Dependencies**: React 19.2, Vite 7.2.4, Tailwind CSS 3.4.19, Express.js 4.19, better-sqlite3

**Storage**: SQLite (`discovery-engine-backend/data/discovery-engine.db`) via `better-sqlite3`. JSON-serialized columns for nested blueprint objects.

**Testing**: No test framework installed yet. Manual end-to-end verification via browser + backend dev server.

**Target Platform**: Web browser (Chrome, Safari, Firefox) + Node.js backend server

**Project Type**: Web application (React frontend + Express backend)

**Performance Goals**: Dashboard and Journey page loads complete within 1.5 seconds including API calls. Wizard state restore after refresh is instantaneous.

**Constraints**: Must preserve existing SQLite schema. No new CSS-in-JS or state-management libraries. Must work with existing mock JWT auth.

**Scale/Scope**: Single-user demo/harness phase. All data is user-scoped.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Justification |
|---|---|---|
| I. TypeScript Strictness | ✅ PASS | All changes are typed; `any[]` replacements are part of the scope. |
| II. 4-Step Wizard Sacred | ✅ PASS | Bug fixes preserve the wizard flow; no steps are added or removed. |
| III. Brand Consistency | ✅ PASS | No new UI components or styles; only data wiring within existing cards. |
| IV. Backend-First Persistence | ✅ PASS | Feature explicitly wires frontend to existing SQLite backend. |
| V. Real AI or Nothing | ⚪ N/A | No new AI features; existing LLM placeholder remains untouched. |

## Project Structure

### Documentation (this feature)

```text
specs/005-dashboard-journey-wiring/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-contracts.md
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
app/                          # Frontend React application
├── src/
│   ├── pages/
│   │   ├── Home.tsx          # Dashboard — wire to real blueprint + user + activities
│   │   ├── Journey.tsx       # My Journey — wire timeline, achievements, progress, activities
│   │   └── Blueprint.tsx     # Fix state-restoration bugs + custom problem persistence
│   ├── components/
│   │   ├── Navbar.tsx        # Sync credit badge from backend
│   │   └── Sidebar.tsx       # Sync user name/avatar from backend
│   ├── lib/
│   │   └── api.ts            # Add fetchActivities, fetchUser, fix fetchProblems
│   └── types/
│       └── index.ts          # Align ActivityItem with backend
│
discovery-engine-backend/     # Backend Express API
├── src/
│   ├── controllers/
│   │   ├── blueprintController.ts   # Fix currentStep overwrites in curriculum + roadmap
│   │   └── userController.ts        # Expose GET /api/user/activities endpoint
│   ├── routes/
│   │   ├── blueprint.ts      # Add GET /problems (niche-scoped)
│   │   └── user.ts           # Add GET /activities route
│   ├── services/
│   │   └── creditService.ts  # In-memory — no changes needed for this feature
│   ├── db/
│   │   └── blueprintRepository.ts   # Already persists everything needed
│   └── types/
│       └── index.ts          # Source of truth — no changes needed
```

**Structure Decision**: Option 2 (Web application) — existing frontend/backend split. All changes are additive or corrective within the current structure.

## Complexity Tracking

> No constitution violations require justification. All changes fit within the approved stack and architecture.

## Phase 0: Research Summary

See [research.md](./research.md) for full details. Key findings:

- **Dashboard** (`Home.tsx`) is ~40% wired: progress ring, step label, and status read from backend. Credits, user name, and activity feed are hardcoded.
- **Journey** (`Journey.tsx`) is ~15% wired: only the Blueprints Library uses real data. Timeline, achievements, progress ring, and activity feed are static.
- **Backend** stores all blueprint data in SQLite and writes activities, but no frontend endpoint consumes activities.
- **Critical bug**: Backend controllers for `generateCurriculum` and `generateRoadmap` overwrite `currentStep` ahead of the frontend view, causing refresh-to-wrong-step.
- **Type drift**: `ActivityItem` shapes differ between frontend (`timestamp`) and backend (`createdAt`).
