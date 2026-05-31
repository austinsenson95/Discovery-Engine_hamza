# Implementation Plan: PDF Currency, Label Fixes & Booking Link

**Branch**: `010-pdf-rupees-fixes` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/010-pdf-rupees-fixes/spec.md`

## Summary

Fix three visible defects in the generated Blueprint PDF output:
1. Replace hard-coded `$` currency symbols with `₹` in the Program page pricing tables.
2. Fix duplicate "Week" labels in the Roadmap page by changing the template engine to use `item.week` directly instead of prepending `"Week "`.
3. Embed a configurable call booking link in the Next Steps page at the end of the PDF.

All changes are localized to the backend PDF template system (`templateEngine.ts` + HTML partials).

## Technical Context

**Language/Version**: TypeScript 5.5 (backend), HTML templates

**Primary Dependencies**: Puppeteer (PDF generation), Express.js 4.19

**Storage**: N/A — no data model changes

**Testing**: No test framework installed (acknowledged debt)

**Target Platform**: Node.js backend server generating PDFs for web download

**Project Type**: Full-stack web application (PDF generation subsystem)

**Performance Goals**: PDF generation must remain under 3 seconds; template changes have negligible impact

**Constraints**: Must preserve existing PDF styling (A4, brand colors, DM Serif Display font). Must not break existing blueprint data structures.

**Scale/Scope**: Single-user demo/harness phase; changes affect all generated PDFs going forward (no retroactive fix for already-generated PDFs)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| TypeScript Strictness | ✅ PASS | All changes are TypeScript; no exceptions needed |
| 4-Step Wizard Preservation | ✅ PASS | No wizard flow changes; only PDF output changes |
| Brand Consistency | ✅ PASS | ₹ symbol and booking CTA use existing brand colors/fonts |
| Backend-First Data Persistence | ✅ PASS | No data model changes; env var for booking link is config |
| Real AI or Nothing | ✅ PASS | No AI generation changes in this feature |

## Project Structure

### Documentation (this feature)

```text
specs/010-pdf-rupees-fixes/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit-tasks)
```

### Source Code (repository root)

```text
discovery-engine-backend/
├── src/
│   ├── templates/
│   │   └── pdf/
│   │       ├── program.html       # CHANGE: replace $ with ₹ in pricing markup
│   │       ├── roadmap.html       # NO CHANGE (shell only; week labels are in templateEngine.ts)
│   │       └── next-steps.html    # CHANGE: add {{bookingLink}} placeholder + CTA section
│   ├── services/
│   │   ├── templateEngine.ts      # CHANGE: fix buildRoadmapPage week label; add buildNextStepsPage booking link
│   │   └── pdfService.ts          # NO CHANGE
│   ├── config/
│   │   └── index.ts               # CHANGE: add BOOKING_LINK env var with default
│   └── data/
│       └── dummyData.ts           # NO CHANGE
```

**Structure Decision**: Changes are confined to the PDF template system — 3 HTML partials and 1 TypeScript service file. No frontend, database, or API changes.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All gates pass.
