# Tasks: Coach Readiness Quiz — Pre-Blueprint Assessment

**Input**: Design documents from `/specs/007-coach-readiness-quiz/`

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

**Purpose**: Define shared types, quiz data, and credit deductions required by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Add `QuizOption`, `QuizQuestion`, and `ReadinessQuiz` interfaces to `app/src/types/index.ts`
- [x] T004 [P] Add `QuizOption`, `QuizQuestion`, and `ReadinessQuiz` interfaces to `discovery-engine-backend/src/types/index.ts`
- [x] T005 [P] Extend `CreditDeductions` interface with `quiz: number` in both `app/src/types/index.ts` and `discovery-engine-backend/src/types/index.ts`
- [x] T006 [P] Add `quiz: 5` to `creditDeductions` in `discovery-engine-backend/src/data/dummyData.ts`
- [x] T007 [P] Add the 5 quiz questions with options and scoring to `app/src/lib/mockData.ts`
- [x] T008 [P] Add the 5 quiz questions with options and scoring to `discovery-engine-backend/src/data/dummyData.ts`
- [x] T009 Add `quiz` cost to `discovery-engine-backend/src/services/creditService.ts` deductions and `canAfford` checks

**Checkpoint**: Types, credit deductions, and quiz question data are defined in both frontend and backend

---

## Phase 3: User Story 1 — Complete the Coach Readiness Quiz (Priority: P1) 🎯 MVP

**Goal**: Users can answer 5 quiz questions, submit their answers, have credits deducted, and see the quiz persisted.

**Independent Test**: Complete the roadmap generation step, answer all 5 quiz questions, submit, and verify 5 credits are deducted and the result is persisted.

### Implementation for User Story 1

#### Backend

- [x] T010 [US1] Add `POST /api/blueprint/quiz` route to `discovery-engine-backend/src/routes/blueprint.ts`
- [x] T011 [US1] Implement `submitQuiz` handler in `discovery-engine-backend/src/controllers/blueprintController.ts` that validates answers, calculates score/persona/weakestArea, saves to blueprint store, deducts 5 credits, and returns the result
- [x] T012 [US1] Create quiz scoring utility function in `discovery-engine-backend/src/services/quizService.ts` (or inline in controller) that maps raw score to persona and identifies weakest area

#### Frontend

- [x] T013 [US1] Add `submitQuiz(answers: number[])` function to `app/src/lib/api.ts`
- [x] T014 [US1] Create `app/src/components/ReadinessQuiz.tsx` — quiz UI with 5 questions, 4 radio options each, submit button disabled until all answered, Framer Motion transitions between questions
- [x] T015 [US1] Add quiz state (`readinessQuiz`) to `app/src/pages/Blueprint.tsx` and wire the quiz component between roadmap generation and PDF download
- [x] T016 [US1] Gate PDF download and call-booking buttons in `app/src/pages/Blueprint.tsx` — hide/disable them until `readinessQuiz` exists; show quiz prompt instead

**Checkpoint**: Quiz can be completed end-to-end; submission deducts credits and persists result; PDF/call booking is gated

---

## Phase 4: User Story 2 — View Personalized Quiz Results (Priority: P2)

**Goal**: Users see an animated score reveal, persona badge, and 3 personalized action bullets after submitting the quiz.

**Independent Test**: Submit a quiz with known answers and verify the score, persona label, and action tips match expected output.

### Implementation for User Story 2

- [x] T017 [US2] Create `app/src/components/QuizResult.tsx` — animated score reveal (circular progress or number counter), persona badge with brand styling, 3 action bullets based on weakest area, retake button (limited to 1 retake)
- [x] T018 [US2] Add score reveal animation using Framer Motion (animate number from 0 to final score, scale-in persona badge, staggered action bullet reveals)
- [x] T019 [US2] Wire `QuizResult` into `app/src/pages/Blueprint.tsx` Step 4 flow — display after quiz submission or when returning to a blueprint with existing quiz data
- [x] T020 [US2] Add retake logic in `app/src/pages/Blueprint.tsx` — allow one retake, show retake button only if `retakeCount < 1`, deduct credits on resubmission

**Checkpoint**: Score reveal animates smoothly; persona and tips are accurate; retake works once and only once

---

## Phase 5: User Story 3 — Quiz Data Enhances Blueprint Personalization (Priority: P3)

**Goal**: Quiz context is injected into AI prompts and the PDF reflects the readiness level.

**Independent Test**: Compare PDFs from identical blueprints with low vs. high quiz scores and verify tone and Week 1 tasks differ.

### Implementation for User Story 3

- [x] T021 [US3] Update `discovery-engine-backend/src/services/llmService.ts` `generateRoadmap()` to accept and inject `readinessQuiz` context into the prompt (score, persona, weakest area, individual answers)
- [x] T022 [US3] Update `discovery-engine-backend/src/services/llmService.ts` PDF generation prompt to include quiz context block
- [x] T023 [US3] Update `discovery-engine-backend/src/services/templateEngine.ts` to render a "Coach Readiness Assessment" section in the PDF (score, persona, weakest area, action tips)
- [x] T024 [US3] Update `discovery-engine-backend/src/controllers/blueprintController.ts` `generateRoadmap` handler to read `blueprint.readinessQuiz` and pass it to `llmService`

**Checkpoint**: PDF includes quiz section; AI prompts include quiz context; low/high scores produce different roadmap tones

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Type safety, build validation, and end-to-end verification across all user stories

- [x] T025 [P] Run `cd app && npm run typecheck` and fix any TypeScript compilation errors
- [x] T026 [P] Run `cd discovery-engine-backend && npm run typecheck` and fix any TypeScript compilation errors
- [x] T027 [P] Run `cd app && npm run build` and verify the production build succeeds without errors
- [x] T028 [P] Run `cd discovery-engine-backend && npm run build` and verify the production build succeeds without errors
- [x] T029 [P] Run `npm run lint` in both `app/` and `discovery-engine-backend/` and fix any linting issues
- [x] T030 Validate the complete end-to-end wizard flow per `quickstart.md`: complete all steps through quiz, verify score/persona/tips, download PDF, confirm quiz section appears

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend on Foundational phase completion
  - Can proceed sequentially in priority order (P1 → P2 → P3)
  - US2 can start as soon as US1's backend API is complete
  - US3 can start as soon as US1's data persistence is complete
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories. Must complete before US2 and US3.
- **User Story 2 (P2)**: Depends on US1's quiz submission API and data persistence.
- **User Story 3 (P3)**: Depends on US1's quiz data persistence in the Blueprint.

### Within Each User Story

- US1: Types (T003–T005) → Data (T006–T008) → Credit service (T009) → Backend API (T010–T012) → Frontend API (T013) → Quiz component (T014) → Blueprint wiring (T015–T016)
- US2: Quiz result component (T017) → Animation (T018) → Blueprint wiring (T019) → Retake logic (T020)
- US3: LLM prompt update (T021–T022) → PDF template update (T023) → Controller wiring (T024)

### Parallel Opportunities

- T001 and T002 (Setup) can run in parallel
- T003, T004, T005, T006, T007, T008 (Foundational types/data) can run in parallel
- T010 and T013 can run in parallel (backend route and frontend API are independent)
- T017 and T021 can run in parallel (frontend result component and backend LLM update are independent)
- T025, T026, T027, T028, T029 (Build/lint checks) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch foundational tasks together:
Task: "Add types to app/src/types/index.ts"
Task: "Add types to discovery-engine-backend/src/types/index.ts"
Task: "Add quiz data to app/src/lib/mockData.ts"
Task: "Add quiz data to discovery-engine-backend/src/data/dummyData.ts"

# After foundational, launch backend and frontend API tasks together:
Task: "Add POST /api/blueprint/quiz route"
Task: "Add submitQuiz() to app/src/lib/api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (types, data, credits)
3. Complete Phase 3: User Story 1 (quiz submission end-to-end)
4. **STOP and VALIDATE**: Test quiz submission, credit deduction, and gating
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Quiz works end-to-end → Validate
3. Add User Story 2 → Score reveal and tips → Validate
4. Add User Story 3 → AI personalization and PDF section → Validate
5. Add Phase 6: Polish → Full build and lint pass → Validate end-to-end

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (backend API + frontend quiz component)
   - Developer B: US2 (quiz result component + animation)
   - Developer C: US3 (LLM prompt + PDF template)
3. All stories integrate independently
4. Team reunites for Phase 6: Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
