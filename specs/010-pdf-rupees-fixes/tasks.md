# Tasks: PDF Currency, Label Fixes & Booking Link

**Input**: Design documents from `/specs/010-pdf-rupees-fixes/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing project state before making changes

- [X] T001 Verify backend dev server starts cleanly and `npm run typecheck` passes in `discovery-engine-backend/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add booking link configuration before any template changes

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Add `BOOKING_LINK` environment variable to `discovery-engine-backend/src/config/index.ts` with sensible default (`https://discoveryengine.app/book`)

**Checkpoint**: Foundation ready — booking link is configurable via `.env`

---

## Phase 3: User Story 1 - Pricing in Indian Rupees (Priority: P1) 🎯 MVP

**Goal**: Replace all hard-coded `$` symbols with `₹` in the Program page PDF template.

**Independent Test**: Generate a Blueprint PDF and verify the Program page shows `₹4,999` instead of `$4,999`. All 5 pricing locations use `₹`.

### Implementation for User Story 1

- [X] T003 Replace `$` with `₹` in `discovery-engine-backend/src/templates/pdf/program.html` — Starting Price display (`${{startingPrice}}` → `₹{{startingPrice}}`)
- [X] T004 Replace `$` with `₹` in `discovery-engine-backend/src/templates/pdf/program.html` — Launch Price table cell (`${{launchPrice}}` → `₹{{launchPrice}}`)
- [X] T005 Replace `$` with `₹` in `discovery-engine-backend/src/templates/pdf/program.html` — Revenue Milestones table cells (`${{revenue10}}`, `${{revenue50}}`, `${{revenue100}}`)

**Checkpoint**: User Story 1 is fully functional — all pricing figures display `₹`

---

## Phase 4: User Story 2 - Remove Duplicate "Week" Labels (Priority: P1)

**Goal**: Fix the template engine so week badges display "Week N" exactly once.

**Independent Test**: Generate a Blueprint PDF and verify roadmap week badges read "Week 1", "Week 2", etc. — never "Week Week 1".

### Implementation for User Story 2

- [X] T006 Fix duplicate "Week" label in `discovery-engine-backend/src/services/templateEngine.ts` `buildRoadmapPage` — change `<span class="badge">Week ${item.week}</span>` to `<span class="badge">${item.week}</span>`

**Checkpoint**: User Story 2 is fully functional — week badges display correctly for 4, 8, and 12-week roadmaps

---

## Phase 5: User Story 3 - Embed Call Booking Link (Priority: P2)

**Goal**: Add a configurable call booking CTA to the final page of the generated PDF.

**Independent Test**: Generate a Blueprint PDF and verify the last page shows a "Book Your Free Strategy Call" section with a clickable link matching the `BOOKING_LINK` env var.

### Implementation for User Story 3

- [X] T007 Replace the static CTA bar in `discovery-engine-backend/src/templates/pdf/next-steps.html` with a branded booking section containing `{{bookingLink}}` placeholder
- [X] T008 Add `{{bookingLink}}` replacement to `discovery-engine-backend/src/services/templateEngine.ts` `buildNextStepsPage` using `config.bookingLink`

**Checkpoint**: User Story 3 is fully functional — booking link appears on final PDF page and is configurable via `.env`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates and validation

- [X] T009 Run `cd discovery-engine-backend && npm run typecheck` and fix all TypeScript errors
- [X] T010 Generate a test PDF and manually verify: (a) ₹ symbols on Program page, (b) correct week labels on Roadmap page, (c) booking link on Next Steps page
- [X] T011 Update `AGENTS.md` to reflect PDF output uses Indian Rupees (if currency is mentioned)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup. Blocks US3 (booking link needs config).
- **User Story 1 (Phase 3)**: Can start immediately after Setup — no dependencies on Phase 2.
- **User Story 2 (Phase 4)**: Can start immediately after Setup — no dependencies on Phase 2 or US1.
- **User Story 3 (Phase 5)**: Depends on Foundational (T002) — needs `config.bookingLink`.
- **Polish (Phase 6)**: Depends on all user stories.

### User Story Dependencies

| Story | Dependencies on Other Stories | Notes |
|-------|------------------------------|-------|
| US1 (P1) | None | Pure template change; parallel with US2 |
| US2 (P1) | None | Pure template engine change; parallel with US1 |
| US3 (P2) | Phase 2 (T002) | Needs `BOOKING_LINK` config before template can reference it |

### Parallel Opportunities

- **Phase 3 (US1)**: T003, T004, T005 are all edits to the same file (`program.html`) — can be done as a single find-and-replace sweep
- **Phase 3 + Phase 4**: US1 and US2 are fully parallel (different files, no dependencies)
- **Phase 6**: T009 and T010 are independent

---

## Parallel Example: User Stories 1 & 2

```bash
# These two tasks can run in parallel:
Task: "Replace $ with ₹ in templates/pdf/program.html"
Task: "Fix duplicate Week label in services/templateEngine.ts buildRoadmapPage"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1: Setup
2. Complete Phase 3: US1 — currency fix (3 tasks, same file)
3. Complete Phase 4: US2 — week label fix (1 task)
4. **STOP and VALIDATE**: Generate PDF, verify ₹ symbols and week labels
5. Complete Phase 2: Foundational — add BOOKING_LINK config
6. Complete Phase 5: US3 — booking link
7. Polish

### Incremental Delivery

1. Setup + US1 + US2 → PDF looks correct → Demo
2. Add Foundational + US3 → PDF has booking CTA → Demo
3. Polish → Typecheck clean → Ship

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Total tasks**: 11
- **Tasks per story**: US1 = 3, US2 = 1, US3 = 2
- **MVP scope**: Phase 1 + Phase 3 + Phase 4 = 5 tasks
