# Research: Frontend Real-Time Data Sync

**Date**: 2026-05-30
**Feature**: specs/009-frontend-backend-data-sync

## Phase 0: Unknowns & Resolutions

### Unknown 1: Theme Implementation Strategy

**Task**: Research best practice for dark mode in a React + Tailwind app with `next-themes` already in package.json.

**Decision**: Use `next-themes` with Tailwind's `darkMode: 'class'` strategy. `next-themes` is already listed in `package.json` but unused. It provides `ThemeProvider`, `useTheme()`, and automatic `localStorage` persistence.

**Rationale**: 
- Already a project dependency (no new packages)
- Handles SSR/localStorage/class toggling correctly
- Works with Tailwind's `dark:` prefix system
- Constitution forbids new state libraries; `next-themes` is not a state library, it's a theme utility

**Alternatives considered**:
- Manual `localStorage` + `document.documentElement.classList` — rejected because `next-themes` already exists and handles edge cases (hydration mismatch, system preference)
- CSS `prefers-color-scheme` only — rejected because user must be able to override system preference via toggle

### Unknown 2: Shared State Strategy for User/Credits

**Task**: Determine how to share user profile and credit balance across Navbar, Sidebar, Dashboard, Journey, and Profile without prop drilling.

**Decision**: Create a single `UserContext` (React Context) that fetches `/api/user/me` and `/api/user/credits` on mount and exposes `{ user, credits, refreshCredits, refreshUser }`.

**Rationale**:
- Constitution explicitly forbids Redux, MobX, Zustand
- React Context is sufficient for read-heavy, low-frequency data (user profile, credits)
- Only 2 consumers need to *write* (Profile edit, Blueprint step completion) — both can call `refreshCredits()`
- No performance concerns: data changes infrequently, context consumers are <20 components

**Alternatives considered**:
- Prop drilling through Layout → Navbar/Sidebar + each page — rejected because Layout doesn't know page-specific needs and it creates tight coupling
- React Query / SWR — rejected because no new dependencies allowed; raw `fetch` + Context is sufficient for this scale

### Unknown 3: Credit Transaction History Source

**Task**: Determine whether to create a dedicated `credit_transactions` table or derive history from existing `activities` table.

**Decision**: Create a dedicated `credit_transactions` table and update `creditService` to write to it on every deduction.

**Rationale**:
- Constitution IV states: "Credit transactions MUST be recorded in a `credit_transactions` table"
- The `activities` table records *what happened* but not the *credit delta* or *running balance*
- A dedicated table allows accurate balance reconstruction and audit trails
- Migration is simple: create table, update `deductCredits()` to insert a row, backfill is not required (demo/harness phase)

**Alternatives considered**:
- Derive from `activities` table + hardcoded costs — rejected because activities don't reliably contain credit deltas and the constitution mandates a transactions table
- Store in `users` table as a JSON array — rejected because querying and aggregation would be inefficient

### Unknown 4: Achievement Computation Strategy

**Task**: Determine whether achievements are computed on the backend or frontend.

**Decision**: Compute achievements server-side in `GET /api/user/achievements`.

**Rationale**:
- Achievements depend on blueprint state, PDF downloads, and credit usage — all backend data
- Server-side computation keeps achievement logic in one place
- Frontend simply renders what the API returns
- Easy to add new achievements later without changing frontend code

**Alternatives considered**:
- Frontend computation from blueprint data — rejected because it requires fetching all blueprints + activities, and duplicates business logic

## Research Complete

All unknowns resolved. No blockers. Ready for Phase 1 design.
