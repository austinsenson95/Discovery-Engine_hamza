# Tasks: Frontend Real-Time Data Sync

**Input**: Design documents from `/specs/009-frontend-backend-data-sync/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Minimal setup — project already initialized. Only new directories/files needed.

- [X] T001 [P] Create `app/src/context/` directory for React Context
- [X] T002 [P] Create `app/src/hooks/` directory if missing (check existing hooks)
- [X] T003 [P] Create `discovery-engine-backend/src/db/userRepository.ts`
- [X] T004 [P] Create `discovery-engine-backend/src/db/creditRepository.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema migration, repository layer, shared frontend context. MUST complete before ANY user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Add `users` and `credit_transactions` tables to SQLite schema in `discovery-engine-backend/src/db/index.ts`
- [X] T006 [P] Implement `userRepository.ts` — `getUserById`, `createUser`, `updateUser`, `getAllUsers`
- [X] T007 [P] Implement `creditRepository.ts` — `getTransactionsByUser`, `addTransaction`, `getBalance`
- [X] T008 Update `creditService.ts` to use `creditRepository` instead of in-memory `Map`
- [X] T009 Update `userController.ts` `getMe` and `updateProfile` to use `userRepository` instead of in-memory `userStore`
- [X] T010 Seed the dummy user into the `users` table on first read if missing
- [X] T011 Create `app/src/context/UserContext.tsx` — React Context with `{ user, credits, refreshUser, refreshCredits, isLoading }`
- [X] T012 Create `app/src/hooks/useUser.ts` — hook that consumes `UserContext`
- [X] T013 Add new API functions to `app/src/lib/api.ts` — `fetchActivity`, `fetchAchievements`, `fetchCreditHistory`, `updateProfile`

**Checkpoint**: Foundation ready — SQLite has users + credit_transactions tables, backend uses repositories, frontend has UserContext and API functions.

---

## Phase 3: User Story 1 — Real-Time Credits and User Info Display (Priority: P1) 🎯 MVP

**Goal**: Credits badge in Navbar and user info in Sidebar show real API data. App wrapper provides shared context.

**Independent Test**: Load any page. Navbar credit badge matches `/api/user/credits` response. Sidebar shows real name/email from `/api/user/me`.

### Implementation for User Story 1

- [X] T014 Update `app/src/App.tsx` to wrap routes with `UserProvider`
- [X] T015 [P] Update `app/src/components/Navbar.tsx` to consume `useUser()` and display real credits
- [X] T016 [P] Update `app/src/components/Sidebar.tsx` to consume `useUser()` and display real name/email
- [X] T017 Update `app/src/pages/Blueprint.tsx` to call `refreshCredits()` after any credit-deducting API call

**Checkpoint**: User Story 1 complete — Navbar and Sidebar show real data. Credits update after blueprint steps.

---

## Phase 4: User Story 2 — Dynamic My Journey Page (Priority: P1)

**Goal**: My Journey page shows real timeline progress, achievements, and activity feed from the backend.

**Independent Test**: Visit My Journey after completing some blueprint steps. Timeline icons/statuses match `currentStep`. Activity feed shows real events. Achievements reflect actual progress.

### Implementation for User Story 2

- [X] T018 Implement `GET /api/user/activity` endpoint in `discovery-engine-backend/src/routes/user.ts` and `userController.ts`
- [X] T019 Implement `GET /api/user/achievements` endpoint in `discovery-engine-backend/src/routes/user.ts` and `userController.ts`
- [X] T020 Update `app/src/pages/Journey.tsx` to derive `timelineSteps` from blueprint `currentStep` and `status` instead of hardcoded array
- [X] T021 [P] Update `app/src/pages/Journey.tsx` to fetch achievements from `/api/user/achievements`
- [X] T022 [P] Update `app/src/pages/Journey.tsx` to fetch activity from `/api/user/activity` and render relative timestamps
- [X] T023 Create frontend utility for human-readable relative time (e.g., "2 hours ago") in `app/src/lib/utils.ts`

**Checkpoint**: User Story 2 complete — My Journey reflects real blueprint progress, achievements, and activity.

---

## Phase 5: User Story 3 — Working Dark/Light Mode Toggle (Priority: P2)

**Goal**: Theme toggle in Profile settings actually switches the entire app between light and dark modes, persisted across reloads.

**Independent Test**: Click Dark in Profile → entire app switches to dark. Reload page → dark mode persists. Click Light → switches back.

### Implementation for User Story 3

- [X] T024 Update `app/tailwind.config.js` to add `darkMode: 'class'` strategy
- [X] T025 Update `app/src/main.tsx` to wrap app with `ThemeProvider` from `next-themes`
- [X] T026 Update `app/src/pages/Profile.tsx` theme toggle to use `useTheme()` from `next-themes` instead of local state
- [X] T027 [P] Update `app/index.html` to prevent flash of wrong theme on load (add suppressHydrationWarning or script)
- [X] T028 [P] Add `dark:` variants to Layout/Sidebar/Navbar backgrounds so dark mode renders correctly

**Checkpoint**: User Story 3 complete — theme toggle works and persists.

---

## Phase 6: User Story 4 — Real-Time Dashboard Data (Priority: P2)

**Goal**: Dashboard (Home) shows real user name, real blueprint progress, real credit usage, and real recent activity.

**Independent Test**: Dashboard welcome message shows real name. Progress ring matches blueprint `progress`. Stats cards show real values. Activity list shows API data.

### Implementation for User Story 4

- [X] T029 Update `app/src/pages/Home.tsx` welcome header to use `useUser()` instead of `mockUser`
- [X] T030 Update `app/src/pages/Home.tsx` credits display to compute from real blueprint + API credits
- [X] T031 Update `app/src/pages/Home.tsx` activity section to fetch from `/api/user/activity`
- [X] T032 [P] Add loading skeleton for Dashboard stats cards using shadcn/ui Skeleton

**Checkpoint**: User Story 4 complete — Dashboard is fully personalized with real data.

---

## Phase 7: User Story 5 — Profile Page with Real Data and Credit History (Priority: P2)

**Goal**: Profile page shows real user info, real credit balance, real blueprint count, and real credit transaction history.

**Independent Test**: Profile account card shows real name/email. Credits section matches API. Credit history table shows transactions with correct running balances.

### Implementation for User Story 5

- [X] T033 Implement `GET /api/user/credit-history` endpoint in `discovery-engine-backend/src/routes/user.ts` and `userController.ts`
- [X] T034 Update `app/src/pages/Profile.tsx` account section to use `useUser()` for name, email, avatar
- [X] T035 Update `app/src/pages/Profile.tsx` stats cards (credits, blueprints, language) to use real data
- [X] T036 Update `app/src/pages/Profile.tsx` credit balance card to use real credits
- [X] T037 Update `app/src/pages/Profile.tsx` credit history table to fetch from `/api/user/credit-history`
- [X] T038 Wire `app/src/pages/Profile.tsx` "Save Preferences" to call `PUT /api/user/profile` and refresh context

**Checkpoint**: User Story 5 complete — Profile is fully real and editable.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, error handling, loading states, build verification.

- [X] T039 Remove `mockUser` and unused mock data imports from `Home.tsx`, `Journey.tsx`, `Profile.tsx`, `Navbar.tsx`, `Sidebar.tsx`
- [X] T040 Add error boundaries / fallback UI for all data-fetching components (empty states, retry buttons)
- [X] T041 Add loading states (spinners/skeletons) to Navbar credits, Sidebar user card, Journey activity, Profile credit history
- [X] T042 Run `cd app && npm run lint` and fix all TypeScript errors
- [X] T043 Run `cd app && npm run build` and verify production build succeeds
- [X] T044 Run `cd discovery-engine-backend && npm run lint` and fix all errors
- [X] T045 Run `cd discovery-engine-backend && npm run typecheck` and fix all errors
- [X] T046 Verify `quickstart.md` validation steps pass end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
  - T005 (schema) → T006, T007 (repositories) → T008, T009 (services/controllers) → T011, T012, T013 (frontend context + API)
- **User Stories (Phase 3-7)**: All depend on Foundational phase
  - US1 must complete before US4/US5 (they rely on shared context being wired)
  - US2, US3, US4, US5 can run in parallel after US1
- **Polish (Phase 8)**: Depends on all user stories

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|---|---|---|
| US1 (Credits/User Info) | Foundational | — |
| US2 (My Journey) | Foundational + US1 | US3, US4, US5 |
| US3 (Dark Mode) | Foundational | US2, US4, US5 |
| US4 (Dashboard) | Foundational + US1 | US2, US3, US5 |
| US5 (Profile) | Foundational + US1 | US2, US3, US4 |

### Within Each User Story

- Backend endpoints before frontend wiring
- Context/hooks before component consumption
- Core data before polish (loading states, error handling)

### Parallel Opportunities

- All Setup tasks (T001-T004) can run in parallel
- All repository tasks (T006, T007) can run in parallel
- All frontend context/API tasks (T011, T012, T013) can run in parallel
- All user story frontend wiring tasks can run in parallel across stories once US1 is done
- T027, T028 (dark mode CSS) can run in parallel
- T032 (skeleton) can run in parallel with other US4 tasks

---

## Parallel Example: User Story 1

```bash
# Backend + frontend can be developed in parallel after Foundational:
Task: "Update Navbar.tsx to consume useUser() and display real credits"
Task: "Update Sidebar.tsx to consume useUser() and display real name/email"
Task: "Update App.tsx to wrap routes with UserProvider"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Navbar + Sidebar real data)
4. **STOP and VALIDATE**: Load app, verify Navbar credits and Sidebar name are real
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → Navbar/Sidebar wired → Deploy/Demo (MVP!)
3. US2 → My Journey wired → Deploy/Demo
4. US3 → Dark mode works → Deploy/Demo
5. US4 → Dashboard real → Deploy/Demo
6. US5 → Profile real → Deploy/Demo
7. Polish → Cleanup and build verification

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 + US4 (shared context, closely related)
   - Developer B: US2 (My Journey — backend + frontend)
   - Developer C: US3 + US5 (theme + profile)
3. Polish phase: team reviews together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- If backend DB is empty, seed dummy user on first API hit
- No tests were requested — add test tasks later if needed
