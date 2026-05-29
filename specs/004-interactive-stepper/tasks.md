# Tasks: Interactive Stepper Navigation

**Input**: Design documents from `/specs/004-interactive-stepper/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Not explicitly requested. Test validation is covered in the Polish phase via quickstart.md checklist.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project is ready for development

- [x] T001 [P] Verify frontend dev server starts (`cd app && npm run dev` on port 3000) and TypeScript compilation passes (`npx tsc --noEmit`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Minimal — no blocking infrastructure needed for a pure component enhancement

- [x] T002 Inspect the current `Stepper.tsx` implementation and `Blueprint.tsx` wiring to confirm the existing `onStepClick` prop and `goToStep` handler are functional

**Checkpoint**: Confirmed that `Stepper` already accepts `onStepClick` and `Blueprint.tsx` already passes `goToStep`

---

## Phase 3: User Story 1 — Navigate Back via Stepper (Priority: P1) 🎯 MVP

**Goal**: Users can click completed (green) and current (orange) step circles to jump back to previous wizard stages. Future steps remain disabled. Data is preserved on navigation.

**Independent Test**: Progress to Step 3 of the Blueprint wizard, click the Step 1 circle, and verify the wizard renders Step 1 with all previously entered niche data intact.

### Implementation for User Story 1

- [x] T003 [US1] Verify `app/src/components/Stepper.tsx` click logic: ensure `isClickable = !!onStepClick && (isCompleted || isCurrent)` correctly allows clicks only on completed and current steps
- [x] T004 [US1] Verify `app/src/pages/Blueprint.tsx` passes `onStepClick={goToStep}` to the `Stepper` component and that `goToStep` preserves existing Blueprint state when navigating backward
- [x] T005 [US1] In `app/src/components/Stepper.tsx`, replace the native `<button disabled={!isClickable}>` behavior with an approach that preserves hover feedback on clickable steps while keeping future steps non-interactive (e.g., use `pointer-events-none` on future steps or remove `disabled` and handle click prevention via conditional logic)

**Checkpoint**: Clicking completed and current steps navigates correctly; future steps do not respond to clicks; hover feedback is visible on clickable steps

---

## Phase 4: User Story 2 — Hover Feedback on Interactive Steps (Priority: P2)

**Goal**: Completed and current steps display prominent hover feedback (scale/shadow + pointer cursor). Future steps show no hover feedback and default cursor.

**Independent Test**: Hover over each step circle in the Stepper and verify: green/orange circles scale up and show a shadow; gray circles remain unchanged; pointer cursor appears only on green/orange circles.

### Implementation for User Story 2

- [x] T006 [US2] Add Framer Motion `whileHover={{ scale: 1.15, boxShadow: '0 0 0 6px rgba(249,115,22,0.15)' }}` to the circle `motion.div` in `app/src/components/Stepper.tsx` for completed and current steps
- [x] T007 [US2] Ensure future steps in `app/src/components/Stepper.tsx` do not respond to hover (no scale, no shadow, `cursor-default`) and completed/current steps show `cursor-pointer`
- [x] T008 [US2] Add hover color transition to the step label (`span` below the circle) in `app/src/components/Stepper.tsx` so that completed/current labels subtly brighten on hover

**Checkpoint**: All completed and current steps show scale + shadow hover feedback; future steps are visually static; labels have subtle hover feedback

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Type safety, build validation, accessibility, and end-to-end verification

- [x] T009 [P] Run `cd app && npm run typecheck` and fix any TypeScript compilation errors
- [x] T010 [P] Run `cd app && npm run build` and verify the production build succeeds without errors
- [x] T011 [P] Run `cd app && npm run lint` and fix any linting issues introduced by the changes
- [x] T012 Validate end-to-end wizard flow per `quickstart.md`: progress through all 4 steps, click back to Step 1 and Step 2 via the Stepper, verify data persistence and hover feedback

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — confirms existing behavior
- **User Stories (Phase 3–4)**: Phase 3 can start immediately after Foundational; Phase 4 can run in parallel with Phase 3 since they touch the same file but different aspects (click logic vs. hover styling)
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories. Must complete before Polish.
- **User Story 2 (P2)**: Can run in parallel with US1 since both modify `Stepper.tsx` but different sections (click logic vs. hover styling).

### Within Each User Story

- US1: Verify existing click logic (T003) → Verify Blueprint wiring (T004) → Fix disabled button hover (T005)
- US2: Add circle hover animation (T006) → Ensure future step hover exclusion (T007) → Add label hover (T008)

### Parallel Opportunities

- T003 and T004 can run in parallel (different files)
- T006 and T007 are closely related but can be implemented together in one edit
- T009, T010, T011 (Build/lint checks) can run in parallel

---

## Parallel Example: User Story 1 + User Story 2

```bash
# US1 and US2 can be implemented together in Stepper.tsx:
Task: "Verify and fix click logic in app/src/components/Stepper.tsx"
Task: "Add Framer Motion hover animations in app/src/components/Stepper.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (verify existing wiring)
3. Complete Phase 3: User Story 1 (ensure click navigation works reliably)
4. **STOP and VALIDATE**: Test clicking back to previous steps via the Stepper
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Verified existing behavior
2. Add User Story 1 → Click navigation works on all clickable steps → Validate
3. Add User Story 2 → Hover feedback enhances discoverability → Validate
4. Add Phase 5: Polish → Build and lint pass → Validate end-to-end

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- The codebase already contains substantial scaffolding for this feature (`onStepClick` prop, `goToStep` handler, `isClickable` logic). Tasks focus on refining the implementation (fixing disabled button hover suppression, enhancing hover feedback).
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
