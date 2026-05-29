# Tasks: Dashboard and Journey Blueprint Integration

**Input**: Design documents from `/specs/005-dashboard-journey-wiring/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested. Manual end-to-end verification per quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify both dev servers are running and project compiles cleanly before changes begin.

- [ ] T001 Verify frontend compiles: `cd app && npx tsc --noEmit`
- [ ] T002 Verify backend compiles: `cd discovery-engine-backend && npm run typecheck`
- [ ] T003 Verify both dev servers start cleanly and health check passes at `http://localhost:3001/health`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type alignment and backend bug fixes that MUST be complete before ANY user story can be safely implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 [P] Align `ActivityItem` type in `app/src/types/index.ts` — rename `timestamp` to `createdAt`, add `userId` and `blueprintId`, make `description` optional
- [ ] T005 [P] Add `fetchUser()` API function in `app/src/lib/api.ts` — calls `GET /api/user/me`
- [ ] T006 [P] Add `fetchActivities()` API function in `app/src/lib/api.ts` — calls `GET /api/user/activities`
- [ ] T007 Update `fetchProblems()` in `app/src/lib/api.ts` to accept `blueprintId` and call `GET /api/blueprint/problems`
- [ ] T008 Fix backend `generateCurriculum` controller in `discovery-engine-backend/src/controllers/blueprintController.ts` — remove `currentStep: 7` and `progress: 80` overwrites
- [ ] T009 Fix backend `generateRoadmap` controller in `discovery-engine-backend/src/controllers/blueprintController.ts` — remove `currentStep: 8` and `progress: 100` overwrites
- [ ] T010 Add `GET /api/user/activities` route and controller in `discovery-engine-backend/src/routes/user.ts` and `discovery-engine-backend/src/controllers/userController.ts`
- [ ] T011 Add `GET /api/blueprint/problems` route and controller in `discovery-engine-backend/src/routes/blueprint.ts` and `discovery-engine-backend/src/controllers/blueprintController.ts` — return niche-scoped problems from dummy data
- [ ] T012 Run TypeScript compilation on both frontend and backend after foundational changes to verify zero errors

**Checkpoint**: Foundation ready — types aligned, backend bugs fixed, new API endpoints exposed, compilation clean.

---

## Phase 3: User Story 1 — Live Dashboard Stats (Priority: P1) 🎯 MVP

**Goal**: Wire the Dashboard (Home.tsx) to real blueprint data, sync credit badge in Navbar, and display real user profile info in Sidebar.

**Independent Test**: Complete Niche Discovery in the wizard, return to Dashboard, and verify progress ring, step label, credits used, and status all reflect backend state. Verify Navbar credit badge and Sidebar user name are not hardcoded.

### Implementation for User Story 1

- [ ] T013 [P] [US1] Wire `Home.tsx` to call `fetchAllBlueprints()` and derive `latestBlueprint` on mount (already partially done; ensure error handling and empty state)
- [ ] T014 [P] [US1] Replace hardcoded `mockUser` in `Home.tsx` with `fetchUser()` call and display real `user.name` in welcome header
- [ ] T015 [US1] Replace hardcoded credit computation in `Home.tsx` with credit data from `fetchUser()` (or backend credit endpoint) — derive `creditsUsed` from activity history or backend meta
- [ ] T016 [US1] Wire `Home.tsx` activity feed to call `fetchActivities()` and render real `ActivityItem[]` instead of static `activityItems` array
- [ ] T017 [US1] Add empty state to Dashboard when `blueprints.length === 0` — show welcoming CTA card to start wizard
- [ ] T018 [US1] Replace `useState<any[]>` with `useState<Blueprint[]>` in `Home.tsx`
- [ ] T019 [US1] Wire `Navbar.tsx` to call `fetchUser()` on mount and display real `user.credits` balance instead of hardcoded "100 credits"
- [ ] T020 [US1] Wire `Sidebar.tsx` user card to display real `user.name` and `user.email` from `fetchUser()` instead of hardcoded "John Doe"
- [ ] T021 [US1] Remove unused `mockUser` import from `Home.tsx` after wiring

**Checkpoint**: At this point, User Story 1 should be fully functional. Dashboard shows real data. Navbar and Sidebar show real user info.

---

## Phase 4: User Story 2 — Live Journey Timeline and Achievements (Priority: P2)

**Goal**: Wire the My Journey page to real blueprint data — dynamic timeline, earned achievements, accurate progress ring, and real activity feed.

**Independent Test**: Complete steps 1 and 2 of the blueprint, open My Journey, and verify timeline shows correct statuses, achievements unlock, progress ring matches `latest.progress`, and activity timeline shows real entries.

### Implementation for User Story 2

- [ ] T022 [P] [US2] Wire `Journey.tsx` to call `fetchAllBlueprints()` and derive `latestBlueprint` on mount (already partially done for library; extend to timeline/achievements)
- [ ] T023 [US2] Replace hardcoded `percentage={50}` in `Journey.tsx` progress ring with `latestBlueprint?.progress || 0`
- [ ] T024 [US2] Derive `timelineSteps` dynamically in `Journey.tsx` from `latestBlueprint.currentStep`, `status`, `createdAt`, and `updatedAt` instead of static array
- [ ] T025 [US2] Derive `achievements` dynamically in `Journey.tsx` from `latestBlueprint` fields instead of static `earned: true/false` flags
- [ ] T026 [US2] Wire `Journey.tsx` activity timeline to call `fetchActivities()` and render real entries instead of static `activities` array
- [ ] T027 [US2] Ensure Blueprints Library cards in `Journey.tsx` handle empty state gracefully when no blueprints exist
- [ ] T028 [US2] Replace `useState<any[]>` with `useState<Blueprint[]>` in `Journey.tsx`
- [ ] T029 [US2] Fix dead CSS classes in `Journey.tsx` — remove `label-badge` and `btn-ghost` usage or define them properly in Tailwind config

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Journey page shows real data.

---

## Phase 5: User Story 3 — Bug-Free Wizard State Restoration (Priority: P2)

**Goal**: Fix state restoration so refreshing the browser on any wizard step keeps the user exactly where they left off, including custom problems.

**Independent Test**: Advance to Curriculum sub-step, refresh browser, verify user remains on Curriculum view with data intact. Repeat for Roadmap step. Add a custom problem, refresh, verify it persists.

### Implementation for User Story 3

- [ ] T030 [US3] Update `Blueprint.tsx` restore logic to handle `currentStep === 6` correctly — map backend step 6 to frontend `step=3, subStep=4` (Curriculum) not `step=4` (Roadmap)
- [ ] T031 [US3] Persist custom problems to backend by merging `customProblems` into `program.selectedProblems` on `handleConfirmProblems` before calling `updateBlueprint`
- [ ] T032 [US3] On Blueprint mount restore, read `program.selectedProblems` from backend and split into `problems` (pre-defined) and `customProblems` (not in the original fetched list)
- [ ] T033 [US3] Verify that after fixing backend `generateCurriculum` (T008) and `generateRoadmap` (T009), refreshing on Curriculum and Roadmap steps lands on the correct view
- [ ] T034 [US3] Handle stale `blueprintId` in URL query param after `handleReset` — if `fetchAllBlueprints` returns no match for `?id=`, start fresh wizard instead of silent blank state

**Checkpoint**: Wizard state restoration works correctly for all steps. Custom problems survive refresh.

---

## Phase 6: User Story 4 — Consistent Type Contracts and Code Health (Priority: P3)

**Goal**: Eliminate `any` types, fix dead code, and align frontend/backend contracts.

**Independent Test**: Run `npx tsc --noEmit` in both frontend and backend. Verify zero errors and zero `any` types in blueprint-related code.

### Implementation for User Story 4

- [ ] T035 [P] [US4] Fix `any[]` typing in `Home.tsx` — replace `useState<any[]>([])` with `useState<Blueprint[]>([])` and fix downstream type issues
- [ ] T036 [P] [US4] Fix `any[]` typing in `Journey.tsx` — replace `useState<any[]>([])` with `useState<Blueprint[]>([])` and fix downstream type issues
- [ ] T037 [P] [US4] Fix redundant italic styling in `Journey.tsx` and `Profile.tsx` — remove `not-italic` class where inline `style={{ fontStyle: 'italic' }}` is present
- [ ] T038 [US4] Delete dead `App.css` file and remove its import from `main.tsx` if present
- [ ] T039 [US4] Fix import inconsistency in `App.tsx` — change `react-router` import to `react-router-dom` to match other files
- [ ] T040 [US4] Verify `selectedProgramName` state in `Blueprint.tsx` is either rendered or removed — if orphaned, remove the state and its setter to reduce complexity
- [ ] T041 [US4] Run ESLint (`npm run lint`) in both frontend and backend and fix any new warnings introduced by changes
- [ ] T042 [US4] Run full TypeScript build (`npm run build`) in both frontend and backend and verify success

**Checkpoint**: TypeScript strict mode passes cleanly. No `any` types in blueprint-related code. Dead code removed.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories — final validation, cleanup, and documentation.

- [ ] T043 [P] Run end-to-end wizard flow: all 4 steps + sub-steps + back navigation + reset + page refresh at each step
- [ ] T044 [P] Run quickstart.md validation scenarios (Dashboard wiring, Journey wiring, state restoration, type checks)
- [ ] T045 Verify brand consistency — no rogue colors, fonts, or button styles introduced by changes
- [ ] T046 Verify mobile responsiveness of Dashboard stats cards and Journey timeline on narrow viewports
- [ ] T047 Update `AGENTS.md` if any new API patterns or file structures were introduced
- [ ] T048 Commit all changes and tag the feature branch for review

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - Can proceed sequentially in priority order (P1 → P2 → P2 → P3)
  - US1 (Dashboard) and US2 (Journey) can be done in parallel after Foundational if team capacity allows
  - US3 (Wizard fixes) should follow US1/US2 since it touches shared Blueprint component
  - US4 (Type health) should follow all implementation to catch accumulated issues
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — Can run in parallel with US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) — Best done after US1/US2 to avoid merge conflicts in Blueprint.tsx
- **User Story 4 (P3)**: Can start after all implementation stories complete — cleanup and validation only

### Within Each User Story

- Frontend API wiring before UI rendering changes
- Backend controller fixes before frontend state restoration tests
- Type fixes before build verification

### Parallel Opportunities

- T004-T007 (type alignment + API functions) can run in parallel
- T008-T009 (backend controller fixes) can run in parallel
- T013-T021 (Dashboard + Navbar + Sidebar wiring) can be parallelized by component
- T022-T029 (Journey wiring) can be parallelized by section (progress, timeline, achievements, activities)
- T035-T039 (code health fixes) can run in parallel by file

---

## Parallel Example: User Story 1

```bash
# Launch all component wiring tasks together:
Task: "Wire Home.tsx to fetchUser and fetchActivities"
Task: "Wire Navbar.tsx credit badge to fetchUser"
Task: "Wire Sidebar.tsx user card to fetchUser"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Dashboard + Navbar + Sidebar)
4. **STOP and VALIDATE**: Test Dashboard independently using quickstart.md scenarios
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test Dashboard independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test Journey independently → Deploy/Demo
4. Add User Story 3 → Test wizard restoration → Deploy/Demo
5. Add User Story 4 → Run type checks + build → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Dashboard + Navbar + Sidebar)
   - Developer B: User Story 2 (Journey timeline + achievements + activities)
   - Developer C: User Story 3 (Wizard state restoration + custom problem persistence)
3. Stories complete and integrate independently
4. Developer D (or any): User Story 4 (Type fixes + cleanup) after implementation stabilizes

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (if tests were requested)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
