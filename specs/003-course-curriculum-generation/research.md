# Research: Course Curriculum Generation

**Feature**: Course Curriculum Generation  
**Date**: 2026-05-29  
**Plan**: [plan.md](./plan.md)

## Decision: No External Research Required

All technical unknowns for this feature are resolved by the existing codebase patterns. The project uses a well-established internal architecture:

- **AI Generation Pattern**: Dummy data with `setTimeout` delay (established across all wizard steps)
- **API Pattern**: Express controller → service → response with credit meta
- **State Persistence**: Blueprint JSON stored in SQLite via `better-sqlite3`
- **Frontend Pattern**: React state + `useEffect` to load from Blueprint, sub-step navigation via local state
- **PDF Pattern**: HTML template partials rendered server-side via `templateEngine.ts`, compiled with Puppeteer/jsPDF

## Rationale

This feature is a horizontal addition to an existing wizard step (Program Builder). It reuses:
- The same API endpoint pattern as `POST /api/blueprint/pricing`
- The same React sub-step rendering pattern as Pricing (`subStep === 3`)
- The same credit deduction flow via `creditService.ts`
- The same PDF partial template pattern as Roadmap

No new technologies, libraries, or integration patterns are introduced.

## Alternatives Considered

| Alternative | Evaluated | Rejected Because |
|---|---|---|
| Add a dedicated `curricula` database table | No | Over-engineering for demo phase; curriculum is intrinsically part of a Blueprint and fits naturally in the existing `program` JSON field |
| Use a new state management library (Zustand/Redux) | No | Violates constitution (no new state management); React local state + Blueprint persistence is sufficient |
| Client-side PDF generation (@react-pdf/renderer) | No | Backend already handles PDF generation via template engine; consistency with existing approach |
| Real LLM integration (Claude/OpenAI) | No | Out of scope for this feature; cross-cutting infrastructure concern |

## Open Questions Resolved

1. **Credit cost for curriculum**: Already defined as 10 credits in `creditService.ts` and `CreditDeductions` type.
2. **Data structure for lessons**: The existing `CurriculumLesson` type needs a `learningOutcome` field added to satisfy the spec requirement.
3. **PDF rendering of learning outcomes**: The `templateEngine.ts` `buildCurriculumPage` function needs a third column in the lesson table for learning outcomes.
