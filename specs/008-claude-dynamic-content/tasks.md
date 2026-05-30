# Tasks: Dynamic AI Content Generation

**Input**: Design documents from `/specs/008-claude-dynamic-content/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.md, research.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing project state before making changes

- [X] T001 Verify both frontend and backend dev servers start cleanly and `npm run lint` passes in `app/` and `discovery-engine-backend/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend changes that affect ALL AI generation endpoints. Must complete before any user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Modify `callClaude()` in `discovery-engine-backend/src/services/llmService.ts` to throw an explicit `Error` on missing API key, API failure, timeout, or malformed JSON response instead of returning fallback dummy data
- [X] T003 [P] Add `SYSTEM_PROMPT_PROBLEMS` constant and `generateProblems(nicheName, persona)` method in `discovery-engine-backend/src/services/llmService.ts` following the existing pattern for other generation methods
- [X] T004 Add `'problems': 5` to the credit cost map in `discovery-engine-backend/src/services/creditService.ts`

**Checkpoint**: Foundation ready — all AI endpoints will now throw explicit errors on failure; problem generation service exists

---

## Phase 3: User Story 1 - AI-Generated Pain Points (Priority: P1) 🎯 MVP

**Goal**: Replace static mock problems with AI-generated, niche+persona-specific problems via a new backend endpoint. Wire the frontend to call it and persist results.

**Independent Test**: Complete Niche Discovery and Audience Mapping, then navigate to Problem Selection. Click "Generate Problems" — 6–8 contextually relevant problems should appear within 5 seconds. If Claude API is unavailable, an explicit error toast appears (no silent fallback).

### Implementation for User Story 1

- [X] T005 [P] Add `generatedProblems?: string[]` field to `Blueprint.program` in `app/src/types/index.ts`
- [X] T006 [P] Add `generatedProblems?: string[]` field to `Blueprint.program` in `discovery-engine-backend/src/types/index.ts`
- [X] T007 Add `POST /api/blueprint/generate-problems` route in `discovery-engine-backend/src/routes/blueprint.ts` mapping to `generateProblems` controller
- [X] T008 Implement `generateProblems` controller in `discovery-engine-backend/src/controllers/blueprintController.ts` with prerequisite validation (niche + persona required), credit deduction, and blueprint state persistence
- [X] T009 Add `generateProblems()` API function in `app/src/lib/api.ts` that calls `POST /blueprint/generate-problems` and returns `{ problems, creditsDeducted }`
- [X] T010 Update Problem Selection sub-step in `app/src/pages/Blueprint.tsx` to call `generateProblems()` instead of `fetchProblems()`, remove the `catch { setProblems(mockProblems) }` fallback block
- [X] T011 Remove `mockProblems` import from `app/src/pages/Blueprint.tsx` and delete `fetchProblems()` function from `app/src/lib/api.ts`

**Checkpoint**: User Story 1 is fully functional — AI-generated problems appear contextually, errors surface explicitly, no mock fallbacks

---

## Phase 4: User Story 2 - Context-Aware Curriculum Generation (Priority: P1)

**Goal**: Ensure curriculum generation always uses full context (niche + program name + selected problems + duration) and never silently falls back to dummy data.

**Independent Test**: Complete all Program Builder steps, select problems and duration, then generate curriculum. Verify curriculum modules reference selected problems. With Claude API unavailable, an explicit error appears instead of mock curriculum.

### Implementation for User Story 2

- [X] T012 Verify the `generateCurriculum()` method in `discovery-engine-backend/src/services/llmService.ts` already passes `problems` to the user prompt (it does — confirm no changes needed)
- [X] T013 Remove the silent `catch { setCurriculum(mockCurriculum) }` fallback block in `app/src/pages/Blueprint.tsx` for curriculum generation; let errors propagate to the toast system
- [X] T014 Remove `mockCurriculum` import from `app/src/pages/Blueprint.tsx`

**Checkpoint**: User Story 2 is fully functional — curriculum is context-aware, errors are explicit

---

## Phase 5: User Story 3 - No Silent Mock Fallbacks (Priority: P2)

**Goal**: Remove every remaining mock data import and silent fallback in the frontend Blueprint wizard so all AI-dependent calls surface real backend responses or explicit errors.

**Independent Test**: With Claude API unavailable, trigger each wizard step (niche, persona, program names, pricing, curriculum, roadmap). Every step should show an explicit error toast. No step should display hardcoded mock data.

### Implementation for User Story 3

- [X] T015 [P] Remove `mockNiches` import and the `catch { setNicheOptions(mockNiches) }` fallback block in `app/src/pages/Blueprint.tsx`
- [X] T016 [P] Remove `mockPersona` import and the `catch { setPersona(mockPersona) }` fallback block in `app/src/pages/Blueprint.tsx`
- [X] T017 [P] Remove `mockProgramNames` import and the `catch { setProgramNames(mockProgramNames) }` fallback block in `app/src/pages/Blueprint.tsx`
- [X] T018 [P] Remove `mockPricing` import and the `catch { setPricing(mockPricing) }` fallback block in `app/src/pages/Blueprint.tsx`
- [X] T019 [P] Remove `mockRoadmap` import and the `catch { setRoadmap(mockRoadmap) }` fallback block in `app/src/pages/Blueprint.tsx`
- [X] T020 Remove all remaining direct references to mock data objects in `app/src/pages/Blueprint.tsx` (e.g., `persona || mockPersona`, `mockProgramNames[1]`, `mockPricing` in default object construction)
- [X] T021 Verify `app/src/lib/api.ts` contains NO hardcoded mock data returns or simulated delays for any AI-dependent function; ensure all functions call real backend endpoints and propagate errors

**Checkpoint**: All user stories independently functional — zero silent mock fallbacks remain in the frontend wizard

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, type safety, and documentation updates

- [X] T022 [P] Run `cd app && npm run lint` and fix all errors
- [X] T023 [P] Run `cd discovery-engine-backend && npm run lint` and fix all errors
- [X] T024 Run `cd app && npx tsc --noEmit` and fix all TypeScript errors (pay special attention to `noUnusedLocals` and `noUnusedParameters`)
- [X] T025 Run `cd discovery-engine-backend && npm run typecheck` and fix all TypeScript errors
- [X] T026 Update `AGENTS.md` to reflect that the frontend Blueprint wizard no longer uses mock data and is fully wired to the backend

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup. Blocks all user stories. `callClaude()` change affects every AI endpoint.
- **User Story 1 (Phase 3)**: Depends on Foundational (T002, T003, T004). Adds the new `generate-problems` endpoint and frontend wiring.
- **User Story 2 (Phase 4)**: Depends on Foundational (T002). Curriculum endpoint already exists; this phase only removes frontend fallback.
- **User Story 3 (Phase 5)**: Depends on Foundational (T002) and is easiest to execute after US1 and US2 to avoid merge conflicts on `Blueprint.tsx`. Removes all remaining mock fallbacks.
- **Polish (Phase 6)**: Depends on all user stories.

### User Story Dependencies

| Story | Dependencies on Other Stories | Notes |
|-------|------------------------------|-------|
| US1 (P1) | None | Can start immediately after Foundational |
| US2 (P1) | None | Can start immediately after Foundational; parallel with US1 |
| US3 (P2) | US1, US2 (soft) | Best executed after US1/US2 to avoid `Blueprint.tsx` conflicts |

### Within Each User Story

- Backend routes → controllers → services (in dependency order)
- Frontend API functions → page components
- Error handling and mock removal last within each story

### Parallel Opportunities

- **Phase 2**: T002 (llmService callClaude) and T003 (llmService generateProblems) and T004 (creditService) are in different files — fully parallel
- **Phase 3**: T005 (frontend types) and T006 (backend types) and T007 (routes) are independent — parallel
- **Phase 3**: T009 (api.ts) and T007 (routes) can be parallel if T007 is route-only
- **Phase 5**: T015 through T019 are all edits to the same file (`Blueprint.tsx`) but in different catch blocks — can be done as a single sweep or in parallel if carefully scoped
- **Phase 6**: T022 (frontend lint) and T023 (backend lint) are fully parallel

---

## Parallel Example: User Story 1

```bash
# Backend tasks (can run in parallel):
Task: "Add generatedProblems field to types in app/src/types/index.ts"
Task: "Add generatedProblems field to types in discovery-engine-backend/src/types/index.ts"
Task: "Add POST /generate-problems route in discovery-engine-backend/src/routes/blueprint.ts"
Task: "Add generateProblems() API function in app/src/lib/api.ts"

# Then sequential (depends on routes existing):
Task: "Implement generateProblems controller in discovery-engine-backend/src/controllers/blueprintController.ts"

# Then frontend (depends on API function):
Task: "Update Blueprint.tsx problem step to call generateProblems() and remove mock fallback"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational — `callClaude()` throws, `generateProblems()` exists
3. Complete Phase 3: User Story 1 — end-to-end problem generation works
4. **STOP and VALIDATE**: Test problem generation with real Claude key, verify error toast with invalid key
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → AI-generated problems work end-to-end → Demo (MVP!)
3. Add User Story 2 → Curriculum never falls back → Demo
4. Add User Story 3 → Zero silent fallbacks anywhere → Demo
5. Polish → Lint clean, types clean, docs updated

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (backend endpoint + frontend wiring)
   - Developer B: User Story 2 (curriculum fallback removal)
   - Developer C: User Story 3 (sweep all remaining mock fallbacks)
3. Merge US1 and US2 first (they touch different parts of Blueprint.tsx)
4. Merge US3 last (sweeping cleanup)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Total tasks**: 26
- **Tasks per story**: US1 = 7, US2 = 3, US3 = 7
- **MVP scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 12 tasks
