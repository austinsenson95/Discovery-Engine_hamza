# Feature Specification: Dashboard and Journey Blueprint Integration

**Feature Branch**: `005-dashboard-journey-wiring`

**Created**: 2026-05-29

**Status**: Draft

**Input**: User description: "make sure all dashboards and my journey components are functional with the blueprint generation and review the codebase for bugs"

## User Scenarios & Testing

### User Story 1 - Live Dashboard Stats (Priority: P1)

As a coach using the Discovery Engine, when I land on the Dashboard after completing some blueprint steps, I want to see my actual progress, real credit balance, and latest activity so that I have an accurate snapshot of where I stand.

**Why this priority**: The Dashboard is the first screen users see after login. Showing stale or hardcoded data destroys trust and makes the product feel broken. This is the highest-impact fix for perceived product quality.

**Independent Test**: Can be tested by creating a blueprint, advancing through wizard steps, returning to the Dashboard, and verifying that the progress ring, step label, credits used, and status all reflect the backend state.

**Acceptance Scenarios**:

1. **Given** a user has a blueprint at step 3 (Audience Mapping) with 35% progress, **When** they open the Dashboard, **Then** the progress ring shows 35%, the "Current Step" card shows "Audience Mapping", and the status shows "In Progress".
2. **Given** a user has spent 25 credits across wizard steps, **When** they view the Dashboard, **Then** the "Credits Used" stat shows 25 and the "Credits Remaining" shows 75 (synced from the backend credit service).
3. **Given** a user has completed the Niche Discovery step, **When** they view the Dashboard activity feed, **Then** they see a real activity entry for "Niche Discovery Completed" with the correct timestamp.

---

### User Story 2 - Live Journey Timeline and Achievements (Priority: P2)

As a coach tracking my progress over time, I want the My Journey page to show my real blueprint timeline, earned achievements based on actual completion, and an accurate overall progress ring so that I can celebrate milestones and see what is left.

**Why this priority**: The Journey page is the motivational hub. Static placeholder data (hardcoded 50% progress, fake dates, static achievements) makes the entire coaching journey feel fake. Real data here drives user retention.

**Independent Test**: Can be tested by completing various blueprint steps and reloading the Journey page to verify the timeline updates, achievements unlock, and the progress ring matches `latest.progress`.

**Acceptance Scenarios**:

1. **Given** a user has completed steps 1 and 2 of the blueprint, **When** they open My Journey, **Then** the timeline shows Niche Discovery and Audience Mapping as "completed" with real dates, Program Builder as "in_progress", and Roadmap as "upcoming".
2. **Given** a user has generated a PDF blueprint, **When** they view the Achievements section, **Then** the "Blueprint Master" badge is shown as earned.
3. **Given** a user has a blueprint at 60% progress, **When** they view the overall progress ring, **Then** it displays 60%, not a hardcoded value.

---

### User Story 3 - Bug-Free Wizard State Restoration (Priority: P2)

As a coach working through the blueprint wizard, when I refresh the page at any step, I want to land exactly where I left off so that I do not lose my place or skip steps accidentally.

**Why this priority**: State restoration bugs (backend jumping `currentStep` ahead of the frontend view) cause users to miss the Curriculum step entirely on refresh. This is a critical functional bug that breaks the core user flow.

**Independent Test**: Can be tested by advancing to the Curriculum sub-step, refreshing the browser, and verifying the user remains on the Curriculum view rather than being teleported to Roadmap.

**Acceptance Scenarios**:

1. **Given** a user is viewing the Curriculum sub-step (subStep 4, frontend step 3), **When** they refresh the page, **Then** they remain on the Curriculum view with their data intact.
2. **Given** a user is viewing the Roadmap step (step 4), **When** they refresh the page, **Then** they land on the Roadmap view, not an earlier step.
3. **Given** a user has selected custom problems, **When** they refresh the page, **Then** their custom problems are still visible and selected.

---

### User Story 4 - Consistent Type Contracts and Code Health (Priority: P3)

As a developer maintaining the Discovery Engine, I want the frontend and backend type definitions to stay in sync and avoid `any` types so that future changes are safe and predictable.

**Why this priority**: Type mismatches (`ActivityItem` shape differences, missing `ModuleItem` on frontend, `any[]` arrays) are technical debt that slows development and causes runtime bugs. Fixing them now prevents larger issues later.

**Independent Test**: Can be tested by running the TypeScript compiler on both frontend and backend and verifying zero errors, plus confirming that frontend types structurally match backend types.

**Acceptance Scenarios**:

1. **Given** the frontend and backend type files, **When** compared side-by-side, **Then** `ActivityItem` fields match (including `userId`, `blueprintId`, `createdAt` naming).
2. **Given** the Dashboard and Journey components, **When** TypeScript compiles them, **Then** no `any[]` types remain for blueprint arrays.

---

### Edge Cases

- What happens when the backend is unavailable? Dashboard and Journey should gracefully degrade (empty states, not crashes).
- What happens when a user has zero blueprints? Dashboard should show a welcoming empty state with a CTA to start the wizard.
- What happens when a user bookmarks `/blueprint?id=deleted_id`? The wizard should start fresh rather than showing a silent blank state.
- How does the system handle activities when the backend has an activity table but no frontend fetch exists? A new frontend API function and backend endpoint must be wired.
- What happens to custom problems on page refresh? They are stored in local state only and will be lost unless persisted to the backend.

## Requirements

### Functional Requirements

- **FR-001**: The Dashboard MUST fetch and display the user's latest blueprint progress, current step, status, and credits used from the backend instead of hardcoded values.
- **FR-002**: The Dashboard activity feed MUST display real activities fetched from the backend `/api/user/activities` endpoint instead of a static array.
- **FR-003**: The Navbar credit badge MUST sync with the backend credit balance on every relevant page load.
- **FR-004**: The Journey page timeline MUST dynamically derive step statuses and timestamps from the latest blueprint's `currentStep`, `createdAt`, and `updatedAt` fields.
- **FR-005**: The Journey page achievements MUST derive their `earned` state from actual blueprint completion data (e.g., `status === 'completed'`, `currentStep >= 2`).
- **FR-006**: The Journey page overall progress ring MUST display `latest.progress` from the backend instead of a hardcoded percentage.
- **FR-007**: The Journey page activity timeline MUST display real activities fetched from the backend.
- **FR-008**: The backend MUST NOT overwrite `currentStep` ahead of the frontend view during curriculum and roadmap generation; the frontend controls navigation timing.
- **FR-009**: The frontend MUST align `ActivityItem` type fields with the backend (`createdAt` instead of `timestamp`, include `userId` and `blueprintId`).
- **FR-010**: The frontend MUST replace `any[]` typing for blueprint arrays with proper `Blueprint[]` types in Dashboard and Journey.
- **FR-011**: The frontend MUST expose and call a `fetchActivities()` API function that queries the backend activity log.
- **FR-012**: The Blueprint wizard SHOULD persist custom problems to the backend so they survive page refreshes.

### Key Entities

- **Blueprint**: The core coaching plan document. Key attributes: `id`, `currentStep`, `progress`, `status`, `niche`, `audience`, `program`, `roadmap`, `createdAt`, `updatedAt`.
- **ActivityItem**: A log entry representing user actions. Key attributes: `id`, `userId`, `blueprintId`, `title`, `description`, `type`, `createdAt`.
- **DashboardStats**: Derived view-model for the Dashboard. Attributes: `progress`, `currentStepLabel`, `creditsUsed`, `creditsRemaining`, `status`, `latestBlueprintTitle`.
- **JourneyTimelineStep**: Derived view-model for the Journey timeline. Attributes: `id`, `title`, `status` ('completed' | 'in_progress' | 'upcoming'), `timestamp`.

## Success Criteria

### Measurable Outcomes

- **SC-001**: After completing any blueprint step, the Dashboard reflects the updated state within 2 seconds of page load (no hardcoded values visible).
- **SC-002**: The Journey page progress ring displays the exact `latest.progress` value from the backend, accurate to the nearest whole percent.
- **SC-003**: Refreshing the browser on the Curriculum sub-step keeps the user on the Curriculum view 100% of the time (zero teleports to Roadmap).
- **SC-004**: Both frontend and backend pass TypeScript compilation with zero errors and zero `any` types in blueprint-related code.
- **SC-005**: Activity feeds on both Dashboard and Journey display entries with correct timestamps and titles derived from the backend activity table.

## Assumptions

- The backend SQLite database and existing `activities` table will be used for activity persistence; no new database schema changes are required beyond potential frontend type alignment.
- The backend credit service remains in-memory for this feature; credit sync is read-only from the frontend perspective.
- Mobile responsiveness of the Dashboard and Journey pages is already implemented; this feature focuses on data wiring only.
- The existing auth system (mock JWT) is sufficient for identifying the current user to fetch their blueprints and activities.
- Real-time updates (WebSockets) are out of scope; polling or page-refresh is acceptable for data sync.
