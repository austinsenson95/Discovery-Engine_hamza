# Research: Dashboard and Journey Blueprint Integration

**Date**: 2026-05-29
**Feature**: 005-dashboard-journey-wiring

## Decision: Use Existing SQLite Backend + Add Minimal Endpoints

**Rationale**: The backend already persists blueprints, activities, and user data in SQLite. The frontend already calls `fetchAllBlueprints()` successfully. The gap is missing frontend API functions and a few backend endpoint gaps. No new database schema or storage technology is needed.

**Alternatives considered**:
- Add a GraphQL layer — Rejected: overkill for a demo-phase app with ~15 endpoints.
- Add Redux/Zustand for frontend state — Rejected: Constitution forbids new state-management libraries; React state + props are sufficient for this wiring.
- Add WebSocket real-time updates — Rejected: polling/page-refresh is acceptable per spec assumptions.

## Decision: Fix currentStep Overwrite in Backend Controllers

**Rationale**: The frontend controls sub-step navigation (e.g., curriculum is subStep 4 of step 3). The backend should persist the data payload (curriculum, roadmap phases) but NOT advance `currentStep` beyond what the frontend explicitly sets. This is the simplest fix and aligns with "Backend-First Data Persistence" without violating "The 4-Step Wizard is Sacred."

**Alternatives considered**:
- Frontend reads `currentStep` and manually corrects it — Rejected: fragile; backend is the source of truth.
- Add a separate `viewedStep` field — Rejected: adds schema complexity for a bug that can be fixed with a one-line change.

## Decision: Derive Journey Timeline and Achievements from Blueprint Data

**Rationale**: The `blueprints` table already contains `currentStep`, `status`, `createdAt`, and `updatedAt`. Timeline status (`completed`/`in_progress`/`upcoming`) can be derived by comparing step IDs to `currentStep`. Achievement `earned` state can be derived from `status === 'completed'` and `currentStep` thresholds. No new tables needed.

## Decision: Add `fetchActivities()` and `fetchUser()` to Frontend API Layer

**Rationale**: The backend already has `addActivity` calls in controllers and an `activities` table. The frontend needs two new API functions: `fetchActivities()` (GET `/api/user/activities`) and `fetchUser()` (GET `/api/user/me`). These are thin wrappers around existing backend infrastructure.

## Decision: Persist Custom Problems via `updateBlueprint`

**Rationale**: Custom problems are currently stored in local React state only (`customProblems`) and lost on refresh. The backend `program` JSON column already has a `selectedProblems` array. Custom problems can be appended to this array when the user confirms problems, making them survive refresh without schema changes.
