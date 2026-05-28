# Implementation Plan: PDF Blueprint Generation

**Branch**: `001-pdf-blueprint-generation` | **Date**: 2026-05-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-pdf-blueprint-generation/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace the backend's mock PDF service and placeholder download endpoint with a real Puppeteer-based PDF generation pipeline. The system will fetch completed blueprint data from SQLite, render an HTML template with inline brand CSS (orange #F05A28, black #0A0A0A, gray #4A4A4A, DM Serif Display headlines), convert to PDF via puppeteer-core using system Chrome or @sparticuz/chromium, and stream the buffer back with `Content-Type: application/pdf`. Generated PDFs are cached in memory with a 1-hour TTL to avoid re-rendering on repeated downloads. The frontend Step 4 wizard gains a loading state during PDF generation.

## Technical Context

**Language/Version**: TypeScript 5.5, Node.js 18+

**Primary Dependencies**: Express.js 4.19, better-sqlite3, puppeteer-core

**Storage**: SQLite via better-sqlite3 (`discovery-engine-backend/data/discovery-engine.db`)

**Testing**: Vitest + supertest (to be installed; constitution requirement)

**Target Platform**: Node.js server (backend), Browser (frontend)

**Project Type**: Web application (React frontend + Express backend)

**Performance Goals**: PDF generation completes within 5 seconds of user request

**Constraints**: 
- Server-side PDF rendering only (no client-side generation)
- puppeteer-core must not download Chromium (use system Chrome or @sparticuz/chromium)
- Memory cache TTL: 1 hour for generated PDF buffers
- Inline CSS in HTML templates (no external stylesheets for Puppeteer reliability)
- DM Serif Display loaded via Google Fonts CDN in the HTML `<head>`

**Scale/Scope**: Single-user demo/harness phase. Blueprint data per user is small (< 50 KB JSON). PDFs are 3–5 pages.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. TypeScript Strictness | ✅ PASS | All new code in TypeScript with `strict: true` |
| II. 4-Step Wizard Sacred | ✅ PASS | PDF is the endpoint of Step 4; flow is preserved and enhanced |
| III. Brand Consistency | ✅ PASS | Exact brand colors (#F05A28, #0A0A0A, #4A4A4A) and DM Serif Display enforced in PDF templates |
| IV. Backend-First Persistence | ✅ PASS | Blueprint data fetched from SQLite via `blueprintRepository`; no in-memory Map usage for PDF data |
| V. Real AI or Nothing | ✅ PASS | PDF generation is deterministic rendering, not AI; no LLM integration required |

**Gate Result**: ALL CLEAR. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-pdf-blueprint-generation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
discovery-engine-backend/
├── src/
│   ├── db/
│   │   ├── index.ts              # SQLite connection (existing)
│   │   └── blueprintRepository.ts # Blueprint CRUD (existing)
│   ├── templates/
│   │   └── pdf/
│   │       ├── blueprint.html    # Master HTML template for PDF
│   │       ├── cover.html        # Cover page partial
│   │       ├── persona.html      # Audience persona partial
│   │       ├── program.html      # Program details partial
│   │       ├── roadmap.html      # 12-week roadmap partial
│   │       └── next-steps.html   # Action page partial
│   ├── services/
│   │   ├── pdfService.ts         # Puppeteer PDF generation + cache (replaces mock)
│   │   └── templateEngine.ts     # HTML template compilation with data injection
│   ├── controllers/
│   │   └── blueprintController.ts # downloadPDF handler (replaces mock streaming)
│   ├── routes/
│   │   └── blueprint.ts          # GET /api/blueprint/pdf/:id (existing route)
│   └── types/
│       └── index.ts              # Blueprint, Persona, RoadmapPhase, etc.
├── data/
│   └── discovery-engine.db       # SQLite database
├── package.json                  # Add puppeteer-core dependency
└── tsconfig.json                 # Existing

app/
├── src/
│   ├── pages/
│   │   └── Blueprint.tsx         # Add loading state to Step 4 download
│   ├── lib/
│   │   └── api.ts                # downloadPDF fetch with blob handling + loading
│   └── types/
│       └── index.ts              # Shared TypeScript types
```

**Structure Decision**: Option 2 (Web application). The backend gains a `templates/pdf/` directory for HTML partials and two new service files (`pdfService.ts` replaces the mock, `templateEngine.ts` is new). The frontend modifies `Blueprint.tsx` and `api.ts` only.

## Complexity Tracking

No constitution violations. Complexity is justified by the requirement for professionally formatted, brand-consistent PDF output that cannot be achieved with simpler text-to-PDF libraries.
