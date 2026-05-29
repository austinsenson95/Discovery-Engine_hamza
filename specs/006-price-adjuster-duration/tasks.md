# Tasks: Price Adjuster and Course Duration Selector

**Input**: Design documents from `/specs/006-price-adjuster-duration/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested. Manual end-to-end verification per quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify both dev servers compile cleanly before changes begin.

- [ ] T001 Verify frontend compiles: `cd app && npx tsc --noEmit`
- [ ] T002 Verify backend compiles: `cd discovery-engine-backend && npm run typecheck`
- [ ] T003 Verify shadcn/ui Slider component exists at `app/src/components/ui/slider.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend types in both frontend and backend, and prepare duration-aware dummy data.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 [P] Extend `PricingStrategy` in `app/src/types/index.ts` — add optional `aiRecommendedPrice?: number`
- [ ] T005 [P] Extend `PricingStrategy` in `discovery-engine-backend/src/types/index.ts` — add optional `aiRecommendedPrice?: number`
- [ ] T006 [P] Add `CourseDuration` type in `app/src/types/index.ts` — `export type CourseDuration = '4_weeks' | '8_weeks' | '12_weeks'`
- [ ] T007 [P] Add `CourseDuration` type in `discovery-engine-backend/src/types/index.ts` — same enum
- [ ] T008 Extend `Blueprint.program` in `app/src/types/index.ts` — add optional `duration?: CourseDuration`
- [ ] T009 Extend `Blueprint.program` in `discovery-engine-backend/src/types/index.ts` — add optional `duration?: CourseDuration`
- [ ] T010 [P] Update `mockPricing` in `app/src/lib/mockData.ts` — add `aiRecommendedPrice: 4999`
- [ ] T011 [P] Update `dummyPricing` in `discovery-engine-backend/src/data/dummyData.ts` — add `aiRecommendedPrice: 4999`
- [ ] T012 Create duration-aware mock curriculum variants in `app/src/lib/mockData.ts` — `mockCurriculum4Weeks`, `mockCurriculum8Weeks`, `mockCurriculum12Weeks`
- [ ] T013 Create duration-aware dummy curriculum variants in `discovery-engine-backend/src/data/dummyData.ts` — `dummyCurriculum4Weeks`, `dummyCurriculum8Weeks`, `dummyCurriculum12Weeks`
- [ ] T014 Create duration-aware mock roadmap variants in `app/src/lib/mockData.ts` — `mockRoadmap4Weeks`, `mockRoadmap8Weeks`, `mockRoadmap12Weeks`
- [ ] T015 Create duration-aware dummy roadmap variants in `discovery-engine-backend/src/data/dummyData.ts` — `dummyRoadmap4Weeks`, `dummyRoadmap8Weeks`, `dummyRoadmap12Weeks`
- [ ] T016 Run TypeScript compilation on both frontend and backend after type changes to verify zero errors

**Checkpoint**: Foundation ready — types extended, mock data prepared, compilation clean.

---

## Phase 3: User Story 1 — Price Adjuster (Priority: P1) 🎯 MVP

**Goal**: Add an interactive price slider to the Pricing step with real-time revenue projection updates and a reset button.

**Independent Test**: Reach the Pricing step, drag the slider, verify projections update, click reset, verify restoration.

### Implementation for User Story 1

- [ ] T017 [P] [US1] Import shadcn/ui Slider into `app/src/pages/Blueprint.tsx`
- [ ] T018 [US1] Add `adjustedPrice` local state to `Blueprint.tsx` (initialized from `pricing.startingPrice`)
- [ ] T019 [US1] Add price slider UI to Pricing step in `Blueprint.tsx` — range from `max(aiRecommendedPrice * 0.5, 500)` to `aiRecommendedPrice * 2.0`, step ₹100
- [ ] T020 [US1] Display both AI-recommended price and adjusted price in the Pricing step UI
- [ ] T021 [US1] Wire revenue projection cards to recalculate client-side based on `adjustedPrice` — `students10 = adjustedPrice * 10`, etc.
- [ ] T022 [US1] Wire price evolution timeline to reflect `adjustedPrice` as the Launch value
- [ ] T023 [US1] Add "Reset to AI Recommendation" button that restores `adjustedPrice` to `aiRecommendedPrice`
- [ ] T024 [US1] On "Build Course Curriculum" click, save `adjustedPrice` to `pricing.startingPrice` via `updateBlueprint`
- [ ] T025 [US1] On Blueprint mount restore, initialize `adjustedPrice` from `program.pricing.startingPrice`
- [ ] T026 [US1] Add fallback for legacy blueprints without `aiRecommendedPrice` — treat `startingPrice` as the AI recommendation

**Checkpoint**: Price slider works, projections update in real time, reset button restores AI recommendation, adjusted price persists.

---

## Phase 4: User Story 2 — Course Duration Selector (Priority: P1)

**Goal**: Add a duration selector to the Curriculum step that adapts curriculum module count and roadmap week distribution.

**Independent Test**: Select 4 Weeks, generate curriculum, verify 3-4 modules. Select 12 Weeks, regenerate, verify 8+ modules. Verify roadmap matches duration.

### Implementation for User Story 2

- [ ] T027 [P] [US2] Add `selectedDuration` local state to `Blueprint.tsx` — initialized to `'12_weeks'` or restored from `program.duration`
- [ ] T028 [US2] Add duration selector UI to Curriculum step in `Blueprint.tsx` — three card options: 4 Weeks (Intensive), 8 Weeks (Standard), 12 Weeks (Comprehensive)
- [ ] T029 [US2] Style duration selector cards with brand colors — selected state uses orange border, unselected uses gray
- [ ] T030 [US2] Update `handleBuildCurriculum` in `Blueprint.tsx` to pass `selectedDuration` to backend and save it to `program.duration`
- [ ] T031 [US2] Update frontend `generateCurriculum` API call in `app/src/lib/api.ts` to accept and send `duration` parameter
- [ ] T032 [US2] Update backend `generateCurriculum` controller in `discovery-engine-backend/src/controllers/blueprintController.ts` to read `duration` from request body
- [ ] T033 [US2] Update backend `llmService.generateCurriculum` in `discovery-engine-backend/src/services/llmService.ts` to accept `duration` and return appropriate dummy curriculum variant
- [ ] T034 [US2] Update frontend `generateRoadmap` API call in `app/src/lib/api.ts` to accept and send `duration` parameter
- [ ] T035 [US2] Update backend `generateRoadmap` controller in `discovery-engine-backend/src/controllers/blueprintController.ts` to read `duration` from request body
- [ ] T036 [US2] Update backend `llmService.generateRoadmap` in `discovery-engine-backend/src/services/llmService.ts` to accept `duration` and return appropriate dummy roadmap variant
- [ ] T037 [US2] On Blueprint mount restore, read `program.duration` from backend and initialize `selectedDuration`
- [ ] T038 [US2] Add fallback for legacy blueprints without `duration` — default to `'12_weeks'`

**Checkpoint**: Duration selector visible on Curriculum step, selection adapts curriculum and roadmap, persists on refresh.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation, type safety, and cleanup.

- [ ] T039 [P] Run end-to-end wizard flow with price adjustment and duration selection
- [ ] T040 [P] Run quickstart.md validation scenarios (price slider, reset button, duration selector, persistence)
- [ ] T041 Verify brand consistency — slider track uses orange, duration cards match existing patterns
- [ ] T042 Verify mobile responsiveness of price slider and duration selector cards on narrow viewports
- [ ] T043 Run `npx tsc --noEmit` in frontend and `npm run typecheck` in backend — zero errors
- [ ] T044 Run `npm run lint` in both frontend and backend — no new warnings
- [ ] T045 Update `AGENTS.md` if any new component patterns were introduced
- [ ] T046 Commit all changes and tag the feature branch for review

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-4)**: All depend on Foundational phase completion
  - US1 (Price Adjuster) and US2 (Duration Selector) can be developed in parallel
- **Polish (Phase 5)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — Can run in parallel with US1

### Within Each User Story

- UI components before state wiring
- State wiring before backend integration
- Backend integration before persistence testing

### Parallel Opportunities

- T004-T007 (type extensions) can run in parallel across frontend/backend
- T012-T015 (mock data creation) can run in parallel
- T017-T026 (price adjuster UI + logic) can be parallelized by sub-task
- T027-T038 (duration selector UI + logic) can be parallelized by sub-task

---

## Parallel Example: User Story 1

```bash
# Launch UI and state tasks together:
Task: "Import shadcn/ui Slider and add price slider UI"
Task: "Add adjustedPrice state and reset button"

# Launch backend API tasks together:
Task: "Update generateCurriculum API call to accept duration"
Task: "Update backend generateCurriculum controller to read duration"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Price Adjuster)
4. **STOP and VALIDATE**: Test price slider, reset, and persistence
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Polish → Final validation → Deploy/Demo

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Price Adjuster UI + logic)
   - Developer B: User Story 2 (Duration Selector UI + logic)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
