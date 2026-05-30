# Implementation Plan: Coach Readiness Quiz — Pre-Blueprint Assessment

**Branch**: `007-coach-readiness-quiz` | **Date**: 2026-05-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-coach-readiness-quiz/spec.md`

## Summary

Add a 5-question Coach Readiness Quiz to the Blueprint wizard, positioned after the 12-week roadmap generation and before the PDF download / call-booking stage. The quiz collects structured data about the user's niche clarity, time commitment, financial runway, sales comfort, and existing assets. A computed score (out of 10), readiness persona, and personalized action plan are displayed to the user. Quiz results are persisted in the Blueprint state and injected into the AI prompt context for roadmap and PDF generation, enabling tone and action-item personalization based on readiness level.

## Technical Context

**Language/Version**: TypeScript 5.9 (frontend), TypeScript 5.5 (backend)

**Primary Dependencies**: React 19.2 + Vite 7.2.4 (frontend), Express.js 4.19 (backend), Tailwind CSS 3.4.19, shadcn/ui "new-york", Framer Motion 12, Lucide React, better-sqlite3

**Storage**: SQLite via better-sqlite3 (Blueprint JSON field stores quiz result)

**Testing**: None currently installed (Vitest + React Testing Library for frontend, Vitest + supertest for backend — to be installed per constitution)

**Target Platform**: Web (browser + Node.js server)

**Project Type**: Web application (full-stack)

**Performance Goals**: Quiz submission completes in under 3 seconds; score reveal animation completes in under 1 second

**Constraints**: TypeScript strict mode (frontend: `noUnusedLocals`, `noUnusedParameters`; backend: `strict: true`), no new state management libraries, Tailwind-only styling, Framer Motion for animations

**Scale/Scope**: Single-user demo/harness phase; quiz data stored as JSON within Blueprint record

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. TypeScript Strictness | ✅ PASS | Feature uses existing TS stack |
| II. 4-Step Wizard is Sacred | ✅ PASS | Quiz is added as a sub-step within Step 4 (Roadmap & PDF), enhancing the wizard without disrupting the 4-step flow |
| III. Brand Consistency | ✅ PASS | Uses existing shadcn/ui + Tailwind + Framer Motion patterns; orange `#F05A28`, emerald `#059669`, DM Serif Display |
| IV. Backend-First Data Persistence | ✅ PASS | Quiz result stored in Blueprint JSON field via SQLite |
| V. Real AI or Nothing | ⚠️ JUSTIFIED | The existing `llmService.ts` uses dummy data + `setTimeout`. This feature follows the same established pattern. Quiz context is appended to the dummy prompt structure. |

## Project Structure

### Documentation (this feature)

```text
specs/007-coach-readiness-quiz/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-contract.md
└── tasks.md             # Phase 2 output (from /speckit-tasks)
```

### Source Code (repository root)

```text
app/                          # Frontend React application
├── src/
│   ├── types/index.ts        # Add ReadinessQuiz, QuizQuestion, QuizOption types
│   ├── lib/api.ts            # Add submitQuiz() API function
│   ├── lib/mockData.ts       # Add quizQuestions and sample quiz result data
│   ├── components/
│   │   ├── ReadinessQuiz.tsx # NEW — 5-question quiz UI with radio options
│   │   └── QuizResult.tsx    # NEW — animated score, persona badge, action tips
│   └── pages/Blueprint.tsx   # Add quiz sub-step between roadmap and PDF/call booking
│
discovery-engine-backend/     # Backend Express API
├── src/
│   ├── types/index.ts        # Add ReadinessQuiz, QuizQuestion, QuizOption types
│   ├── routes/blueprint.ts   # Add POST /api/blueprint/quiz route
│   ├── controllers/
│   │   └── blueprintController.ts  # Add submitQuiz handler
│   ├── services/
│   │   ├── llmService.ts     # Append quiz context to roadmap/PDF generation prompts
│   │   ├── creditService.ts  # Add quiz: 5 to credit deductions
│   │   └── templateEngine.ts # Add quiz result section to PDF template
│   └── data/dummyData.ts     # Add quizQuestions, sample quiz results
```

**Structure Decision**: Option 2 (Web application with frontend + backend). Both frontend and backend require changes.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| V. Real AI or Nothing — using dummy data | The project is in demo/harness phase; all wizard steps use the same placeholder pattern. Quiz context is appended to the existing dummy prompt structure. | N/A — this is the established project pattern. |
