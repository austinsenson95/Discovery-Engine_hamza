# Implementation Plan: Course Curriculum Generation

**Branch**: `003-course-curriculum-generation` | **Date**: 2026-05-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-course-curriculum-generation/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a Course Curriculum generation sub-step to the Program Builder wizard (Step 3), positioned after Pricing. The AI generates a structured curriculum with modules, lessons, durations, and learning outcomes. The curriculum is persisted in the Blueprint, displayed in an expandable frontend UI, and rendered as a dedicated page in the downloadable PDF. While types, API endpoints, controllers, routes, mock data, and basic UI scaffolding already exist in the codebase, the feature requires type enrichment (adding `learningOutcome` to lessons), data updates across mock/dummy sources, frontend UI enhancement to display learning outcomes, and PDF template engine updates to include learning outcomes in the rendered output.

## Technical Context

**Language/Version**: TypeScript 5.9 (frontend), TypeScript 5.5 (backend)

**Primary Dependencies**: React 19.2 + Vite 7.2.4 (frontend), Express.js 4.19 (backend), Tailwind CSS 3.4.19, shadcn/ui "new-york", Framer Motion 12, better-sqlite3

**Storage**: SQLite via better-sqlite3 (Blueprint state stored as JSON in `blueprints` table)

**Testing**: None currently installed (Vitest + React Testing Library for frontend, Vitest + supertest for backend — to be installed per constitution)

**Target Platform**: Web (browser + Node.js server)

**Project Type**: Web application (full-stack)

**Performance Goals**: Curriculum generation completes in under 5 seconds (measured from user click to rendered result)

**Constraints**: TypeScript strict mode (frontend: `noUnusedLocals`, `noUnusedParameters`; backend: `strict: true`), no new state management libraries, no new databases, no new CSS-in-JS libraries

**Scale/Scope**: Single-user demo/harness phase; curriculum data stored as JSON within the Blueprint record

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. TypeScript Strictness | ✅ PASS | Feature uses existing TS stack; no strictness violations anticipated |
| II. 4-Step Wizard is Sacred | ✅ PASS | Curriculum is added as a sub-step within Program Builder (Step 3), enhancing the wizard without disrupting the 4-step flow |
| III. Brand Consistency | ✅ PASS | Uses existing shadcn/ui + Tailwind patterns; orange (`#F05A28`), DM Serif Display, Framer Motion easing |
| IV. Backend-First Data Persistence | ✅ PASS | Curriculum stored in Blueprint JSON field via SQLite (`better-sqlite3`) |
| V. Real AI or Nothing | ⚠️ JUSTIFIED | The existing `llmService.ts` uses dummy data + `setTimeout`. This feature follows the same established pattern as all other wizard steps. Replacing the LLM placeholder is a cross-cutting concern outside the scope of this feature. Constitution acknowledges this is a demo/harness phase. |

## Project Structure

### Documentation (this feature)

```text
specs/003-course-curriculum-generation/
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
│   ├── types/index.ts        # Add learningOutcome to CurriculumLesson
│   ├── lib/api.ts            # Real fetch to backend (already wired)
│   ├── lib/mockData.ts       # Add learningOutcome to mockCurriculum lessons
│   ├── pages/Blueprint.tsx   # Enhance subStep === 4 UI to show learning outcomes
│   └── components/ui/        # shadcn/ui components for expandable modules
│
discovery-engine-backend/     # Backend Express API
├── src/
│   ├── types/index.ts        # Add learningOutcome to CurriculumLesson
│   ├── routes/blueprint.ts   # POST /curriculum route (already exists)
│   ├── controllers/
│   │   └── blueprintController.ts  # generateCurriculum handler (already exists)
│   ├── services/
│   │   ├── llmService.ts     # Enrich dummy curriculum with learning outcomes
│   │   ├── creditService.ts  # Curriculum cost already configured (10 credits)
│   │   └── templateEngine.ts # Add learningOutcome column to PDF curriculum table
│   └── data/dummyData.ts     # Add learningOutcome to dummyCurriculum lessons
├── src/templates/pdf/
│   └── curriculum.html       # Already exists
```

**Structure Decision**: Option 2 (Web application with frontend + backend). The existing codebase already follows this structure. No new directories needed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| V. Real AI or Nothing — using dummy data | The project is in demo/harness phase; all wizard steps use the same placeholder pattern. Replacing the LLM is a separate infrastructure effort. | N/A — this is the established project pattern. |
