# Tasks: Course Curriculum Generation

**Input**: Design documents from `/specs/003-course-curriculum-generation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested. Test validation is covered in the Polish phase via quickstart.md checklist.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project is ready for development

- [x] T001 [P] Verify backend dev server starts (`cd discovery-engine-backend && npm run dev` on port 3001) and SQLite database is accessible
- [x] T002 [P] Verify frontend dev server starts (`cd app && npm run dev` on port 3000) and API calls to backend succeed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Enrich shared type definitions with the `learningOutcome` field required by the spec

**⚠️ CRITICAL**: No user story work can begin until this phase is complete — frontend UI, backend services, and PDF rendering all depend on the updated types.

- [x] T003 [P] Add `learningOutcome?: string` field to `CurriculumLesson` interface in `app/src/types/index.ts`
- [x] T004 [P] Add `learningOutcome?: string` field to `CurriculumLesson` interface in `discovery-engine-backend/src/types/index.ts`

**Checkpoint**: Both frontend and backend TypeScript compilations include the updated `CurriculumLesson` type with `learningOutcome`

---

## Phase 3: User Story 1 — Generate Course Curriculum (Priority: P1) 🎯 MVP

**Goal**: The AI generates a structured course curriculum with modules, lessons, durations, and learning outcomes; credits are deducted; and the result is persisted in the Blueprint.

**Independent Test**: Complete Problems, Program Name, and Pricing sub-steps in the Blueprint wizard, then trigger curriculum generation. The backend returns a curriculum where every lesson has a `learningOutcome`, 10 credits are deducted, and the curriculum survives a page refresh.

### Implementation for User Story 1

- [x] T005 [P] [US1] Add `learningOutcome` values to every lesson in `app/src/lib/mockData.ts` `mockCurriculum`
- [x] T006 [P] [US1] Add `learningOutcome` values to every lesson in `discovery-engine-backend/src/data/dummyData.ts` `dummyCurriculum`
- [x] T007 [US1] Update `discovery-engine-backend/src/services/llmService.ts` `generateCurriculum()` to ensure generated lessons include `learningOutcome` (enrich the dummy curriculum mapping logic)

**Checkpoint**: At this point, `POST /api/blueprint/curriculum` returns a curriculum where 100% of lessons include a `learningOutcome`, and mock data is available for offline frontend development.

---

## Phase 4: User Story 2 — Review and Navigate Curriculum (Priority: P2)

**Goal**: Coaches can view the generated curriculum in an intuitive, expandable frontend UI with lessons, durations, and learning outcomes clearly presented.

**Independent Test**: Navigate to the Curriculum sub-step (subStep 4) in the Program Builder. Each module displays its lessons with title, duration, and learning outcome. The layout is scannable and matches the brand design system.

### Implementation for User Story 2

- [x] T008 [US2] Enhance `app/src/pages/Blueprint.tsx` subStep === 4 curriculum UI to display `learningOutcome` per lesson inside each module card
- [x] T009 [US2] Verify `app/src/pages/Blueprint.tsx` shows a clear "Generate Curriculum" call-to-action when `!curriculum && !loading`, and displays curriculum metadata (total lessons, total duration) when curriculum exists

**Checkpoint**: At this point, the frontend Curriculum sub-step renders all lesson data including learning outcomes, with proper loading and empty states.

---

## Phase 5: User Story 3 — Curriculum in Downloadable PDF (Priority: P3)

**Goal**: The downloadable Blueprint PDF includes a dedicated, well-formatted Curriculum page with all modules, lessons, durations, and learning outcomes.

**Independent Test**: Trigger PDF generation after a curriculum exists in the Blueprint. Open the downloaded PDF and confirm a "Course Curriculum" page is present, each lesson shows its title, duration, and learning outcome, and the layout is readable when printed.

### Implementation for User Story 3

- [x] T010 [US3] Update `discovery-engine-backend/src/services/templateEngine.ts` `buildCurriculumPage()` to render `learningOutcome` for each lesson in the PDF curriculum table
- [x] T011 [US3] Adjust PDF curriculum table layout in `buildCurriculumPage()` to accommodate the learning outcome column without breaking page formatting (use `page-break-inside: avoid` on module blocks)

**Checkpoint**: At this point, the PDF includes a complete Curriculum section with learning outcomes, and omits the section when no curriculum exists.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Type safety, build validation, and end-to-end verification across all user stories

- [x] T012 [P] Run `cd app && npm run typecheck` and fix any TypeScript compilation errors (e.g., unused imports, type mismatches from the `learningOutcome` addition)
- [x] T013 [P] Run `cd discovery-engine-backend && npm run typecheck` and fix any TypeScript compilation errors
- [x] T014 [P] Run `cd app && npm run build` and verify the production build succeeds without errors
- [x] T015 [P] Run `cd discovery-engine-backend && npm run build` and verify the production build succeeds without errors
- [x] T016 [P] Run `npm run lint` in both `app/` and `discovery-engine-backend/` and fix any linting issues
- [x] T017 Validate the complete end-to-end wizard flow per `quickstart.md`: complete all Program Builder sub-steps through Curriculum, generate and download the PDF, and verify the Curriculum page includes learning outcomes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend on Foundational phase completion
  - Can proceed sequentially in priority order (P1 → P2 → P3)
  - US2 and US3 can also run in parallel after US1 completes if staffed
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories. Must complete before US2/US3 because the data it produces (curriculum with learning outcomes) is consumed by US2 (display) and US3 (PDF).
- **User Story 2 (P2)**: Depends on US1 data being available in the Blueprint, but the UI work itself is independent of US3.
- **User Story 3 (P3)**: Depends on US1 data being available in the Blueprint. Can run in parallel with US2.

### Within Each User Story

- US1: Data updates (T005, T006 in parallel) → Service update (T007)
- US2: Single-file UI enhancement (T008) → State verification (T009)
- US3: Template engine update (T010) → Layout refinement (T011)

### Parallel Opportunities

- T001 and T002 (Setup) can run in parallel
- T003 and T004 (Foundational types) can run in parallel
- T005 and T006 (Mock/dummy data) can run in parallel
- T012, T013, T014, T015, T016 (Build/lint checks) can run in parallel
- US2 (T008–T009) and US3 (T010–T011) can be implemented in parallel after US1 completes

---

## Parallel Example: User Story 1

```bash
# Launch data updates in parallel:
Task: "Add learningOutcome values to app/src/lib/mockData.ts mockCurriculum"
Task: "Add learningOutcome values to discovery-engine-backend/src/data/dummyData.ts dummyCurriculum"

# After data updates complete, update service:
Task: "Update discovery-engine-backend/src/services/llmService.ts generateCurriculum()"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (type enrichment)
3. Complete Phase 3: User Story 1 (backend data + service updates)
4. **STOP and VALIDATE**: Verify `POST /api/blueprint/curriculum` returns lessons with `learningOutcome`
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Backend generates complete curriculum with learning outcomes → Validate API response
3. Add User Story 2 → Frontend displays learning outcomes in Curriculum sub-step → Validate UI
4. Add User Story 3 → PDF renders learning outcomes → Validate PDF output
5. Add Phase 6: Polish → Full build and lint pass → Validate end-to-end

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (backend data + service)
   - Developer B: US2 (frontend UI)
   - Developer C: US3 (PDF template engine)
3. All stories integrate independently
4. Team reunites for Phase 6: Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- The codebase already contains substantial scaffolding for this feature (types, API endpoint, controller, route, frontend UI skeleton, credit service, PDF template). Tasks focus on enriching the existing implementation with `learningOutcome` support.
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
