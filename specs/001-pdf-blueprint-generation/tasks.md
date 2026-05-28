# Tasks: PDF Blueprint Generation

**Input**: Design documents from `/specs/001-pdf-blueprint-generation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested. Test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create template directory structure

- [X] T001 Install `puppeteer-core` dependency in `discovery-engine-backend/package.json` and run `npm install`
- [X] T002 [P] Create template directory `discovery-engine-backend/src/templates/pdf/` with master shell `blueprint.html`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create all HTML template partials and the template compilation engine. MUST be complete before ANY user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Create `discovery-engine-backend/src/templates/pdf/cover.html` — branded cover page partial with logo placeholder, niche title slot, and generation date slot
- [X] T004 [P] Create `discovery-engine-backend/src/templates/pdf/persona.html` — audience persona partial with demographics, pain points, desires, and quote sections
- [X] T005 [P] Create `discovery-engine-backend/src/templates/pdf/program.html` — program details partial with name, description, pricing strategy, and pricing evolution table
- [X] T006 [P] Create `discovery-engine-backend/src/templates/pdf/roadmap.html` — 12-week roadmap partial with phase groupings, week badges, milestones, and deliverable lists
- [X] T007 [P] Create `discovery-engine-backend/src/templates/pdf/next-steps.html` — action page partial with numbered next steps and CTA footer
- [X] T008 Implement `discovery-engine-backend/src/services/templateEngine.ts` — reads all partials, replaces `{{placeholder}}` tokens with blueprint data, returns compiled HTML string (depends on T003–T007)

**Checkpoint**: Foundation ready — template engine can compile a complete HTML document from a Blueprint object

---

## Phase 3: User Story 1 — Generate and Download Complete Blueprint PDF (Priority: P1) 🎯 MVP

**Goal**: End-to-end PDF generation pipeline. User completes Step 4, clicks download, and receives a real branded PDF within 5 seconds.

**Independent Test**: Complete all 4 wizard steps, click "Download My Blueprint PDF", verify the browser downloads a valid PDF file containing all 5 sections.

### Implementation for User Story 1

- [X] T009 Implement `discovery-engine-backend/src/services/pdfService.ts` — replace mock with Puppeteer-based PDF generation, in-memory `Map<string, { buffer: Buffer; timestamp: number }>` cache with 1-hour TTL, and Chromium resolution logic (env var → system Chrome → fallback) (depends on T008)
- [X] T010 Update `discovery-engine-backend/src/controllers/blueprintController.ts` — rewrite `downloadPDF` handler to fetch blueprint from SQLite via `getBlueprintById`, validate completeness, call `pdfService.streamPDF()`, set `Content-Type: application/pdf` and `Content-Disposition: attachment` headers, and stream the buffer (depends on T009)
- [X] T011 Update `app/src/lib/api.ts` — rewrite `downloadPDF(id)` to use `fetch()` with blob response, create object URL, trigger download via temporary `<a>` tag, and throw on non-ok responses
- [X] T012 [P] [US1] Update `app/src/pages/Blueprint.tsx` — add `isPdfLoading` state to Step 4, show spinner on download button click, disable button during generation, and display error toast on failure (depends on T011)

**Checkpoint**: User Story 1 is fully functional. The complete end-to-end PDF download flow works.

---

## Phase 4: User Story 2 — View Branded Cover Page (Priority: P2)

**Goal**: The PDF cover page uses exact brand colors, DM Serif Display headline font, and a professional centered layout.

**Independent Test**: Generate a PDF and verify the first page displays the logo, niche title in DM Serif Display, accent line in #F05A28, and generation date with correct styling.

### Implementation for User Story 2

- [X] T013 [P] [US2] Polish `discovery-engine-backend/src/templates/pdf/cover.html` — add inline CSS with exact brand colors (`#F05A28` accent, `#0A0A0A` headings, `#4A4A4A` body), DM Serif Display `font-family` for title, centered vertical layout, and horizontal orange accent line
- [X] T014 [P] [US2] Update `discovery-engine-backend/src/templates/pdf/blueprint.html` — add Google Fonts CDN link (`https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap`) in the `<head>` and define the shared inline CSS block for all partials
- [X] T015 [US2] Add Discovery Engine logo to `discovery-engine-backend/src/templates/pdf/cover.html` — embed as inline SVG or base64 PNG with max-width constraint (depends on T013, T014)

**Checkpoint**: User Stories 1 and 2 both work independently. Cover page is on-brand.

---

## Phase 5: User Story 3 — Reference Visual 12-Week Roadmap (Priority: P2)

**Goal**: The roadmap section displays all 12 weeks in a clear visual timeline with phase groupings, week badges, and readable deliverables.

**Independent Test**: Generate a PDF with a 12-week roadmap and verify all weeks are visible, correctly ordered, and fit within A4 page boundaries without text cutoff.

### Implementation for User Story 3

- [X] T016 [P] [US3] Polish `discovery-engine-backend/src/templates/pdf/roadmap.html` — add visual timeline layout with phase-colored left borders, week number badges, milestone titles, and deliverable bullet lists using inline CSS
- [X] T017 [US3] Add CSS page break rules to `discovery-engine-backend/src/templates/pdf/roadmap.html` — ensure phases gracefully split across pages with `page-break-inside: avoid` on week cards and `page-break-before: auto` on phase headers (depends on T016)

**Checkpoint**: All user stories independently functional. Roadmap renders correctly across page boundaries.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, caching refinements, filename customization, and quality gates

- [X] T018 Add blueprint completeness validation to `discovery-engine-backend/src/controllers/blueprintController.ts` `downloadPDF` — return 400 with `missingFields` array if `niche`, `audience`, `program`, or `roadmap` data is absent
- [X] T019 Set dynamic `Content-Disposition` filename in `discovery-engine-backend/src/controllers/blueprintController.ts` — use sanitized niche name (e.g., `Discovery-Engine-Blueprint-Career-Coaching.pdf`)
- [X] T020 Add PDF cache invalidation to `discovery-engine-backend/src/services/pdfService.ts` — expose `invalidateCache(blueprintId)` and call it from `updateBlueprint` flow (or on blueprint mutation)
- [X] T021 [P] Run `cd discovery-engine-backend && npm run typecheck && npm run lint` — fix all TypeScript strict errors and ESLint warnings
- [X] T022 [P] Run `cd app && npm run build` — verify frontend compiles without errors after Blueprint.tsx and api.ts changes
- [X] T023 Validate end-to-end flow per `specs/001-pdf-blueprint-generation/quickstart.md` — complete wizard, download PDF, verify 5 sections, check brand colors and fonts render correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001–T002) — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend on Foundational phase completion
  - US1 (P1) must complete before US2 and US3 polish can be evaluated
  - US2 and US3 can proceed in parallel once US1 is functional
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2). No dependencies on other stories. This is the MVP.
- **User Story 2 (P2)**: Can start after US1 core pipeline works. Polishes cover page styling.
- **User Story 3 (P2)**: Can start after US1 core pipeline works. Polishes roadmap layout.

### Within Each User Story

- Models/services before controller endpoints
- Backend implementation before frontend integration
- Core functionality before polish tasks

### Parallel Opportunities

- All template partials (T003–T007) can be written in parallel
- Frontend API change (T011) and backend pdfService (T009) can be developed in parallel until integration
- US2 cover page polish (T013–T015) and US3 roadmap polish (T016–T017) can run in parallel
- Lint/typecheck tasks (T021–T022) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch template partials together:
Task: "Create cover.html partial"
Task: "Create persona.html partial"
Task: "Create program.html partial"
Task: "Create roadmap.html partial"
Task: "Create next-steps.html partial"

# Launch frontend and backend integration in parallel:
Task: "Implement pdfService.ts with Puppeteer + cache"
Task: "Update frontend api.ts downloadPDF with fetch/blob"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup — install puppeteer-core, create directories
2. Complete Phase 2: Foundational — write all 5 template partials and templateEngine.ts
3. Complete Phase 3: User Story 1 — pdfService, controller, frontend API, loading state
4. **STOP and VALIDATE**: Test end-to-end PDF download. Verify file is valid PDF with all sections.
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Template engine ready
2. Add User Story 1 → End-to-end download works → Deploy/Demo (MVP!)
3. Add User Story 2 → Cover page is on-brand with exact colors and fonts
4. Add User Story 3 → Roadmap is visual and readable across pages
5. Complete Phase 6: Polish → Error handling, filename, cache, lint/typecheck

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: T009 (pdfService) + T010 (controller)
   - Developer B: T011 (frontend API) + T012 (Blueprint.tsx loading state)
   - Developer C: T003–T007 (template partials) + T008 (templateEngine)
3. After US1 works:
   - Developer A: T013–T015 (cover page polish)
   - Developer B: T016–T017 (roadmap polish)
   - Developer C: T018–T023 (cross-cutting concerns)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- The `pdfService.ts` file is completely replaced — do not preserve old mock methods
- Puppeteer `page.pdf()` should use `{ format: 'A4', printBackground: true }`
- All inline CSS in templates must use exact hex values: `#F05A28`, `#0A0A0A`, `#4A4A4A`
