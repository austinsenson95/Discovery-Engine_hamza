# Implementation Plan: Price Adjuster and Course Duration Selector

**Branch**: `006-price-adjuster-duration` | **Date**: 2026-05-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-price-adjuster-duration/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add an interactive price adjuster slider to the Pricing step (subStep 3) of the blueprint wizard and a course duration selector to the Curriculum step (subStep 4). The price adjuster lets coaches tweak the AI-recommended price with real-time revenue projection updates. The duration selector lets coaches choose 4, 8, or 12 weeks, which tailors both curriculum module distribution and roadmap week distribution.

## Technical Context

**Language/Version**: TypeScript 5.9 (frontend), TypeScript 5.5 (backend), Node.js 18+

**Primary Dependencies**: React 19.2, Tailwind CSS 3.4.19, shadcn/ui, Express.js 4.19, better-sqlite3

**Storage**: SQLite with JSON-serialized columns for nested blueprint data

**Testing**: Manual end-to-end verification via browser + backend dev server

**Target Platform**: Web browser (Chrome, Safari, Firefox) + Node.js backend

**Project Type**: Web application (React frontend + Express backend)

**Performance Goals**: Price slider updates revenue projections within 100ms. Duration selection triggers curriculum/roadmap regeneration within 2 seconds.

**Constraints**: Must preserve existing 4-step wizard flow. Must not break legacy blueprints that lack `aiRecommendedPrice` or `duration` fields. No new state-management libraries.

**Scale/Scope**: Single-user demo phase. Price calculations are client-side simple math. Duration affects dummy data distribution only (LLM is still placeholder).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Justification |
|---|---|---|
| I. TypeScript Strictness | ✅ PASS | Type extensions are additive; no `any` introduced. Slider uses native HTML range input. |
| II. 4-Step Wizard Sacred | ✅ PASS | Both features enhance existing wizard sub-steps (Pricing and Curriculum) without adding new steps. |
| III. Brand Consistency | ✅ PASS | Slider styled with brand orange. Duration selector uses existing card/checkbox patterns. |
| IV. Backend-First Persistence | ✅ PASS | `aiRecommendedPrice` and `duration` stored in existing JSON columns. |
| V. Real AI or Nothing | ⚪ N/A | No new AI features; existing LLM placeholder remains. Duration affects dummy data distribution. |

## Project Structure

### Documentation (this feature)

```text
specs/006-price-adjuster-duration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
app/                          # Frontend
├── src/
│   ├── pages/
│   │   └── Blueprint.tsx     # Add price slider to subStep 3, duration selector to subStep 4
│   ├── types/
│   │   └── index.ts          # Extend PricingStrategy with aiRecommendedPrice
│   └── lib/
│       └── mockData.ts       # Add duration-aware mockCurriculum variants
│
discovery-engine-backend/     # Backend
├── src/
│   ├── types/
│   │   └── index.ts          # Extend PricingStrategy with aiRecommendedPrice
│   ├── controllers/
│   │   └── blueprintController.ts  # Pass duration to generateCurriculum/generateRoadmap
│   ├── services/
│   │   └── llmService.ts     # Accept duration parameter (affects dummy data)
│   └── data/
│       └── dummyData.ts      # Add duration-aware curriculum/roadmap variants
```

**Structure Decision**: Option 2 (Web application). Changes are localized to the wizard's Pricing and Curriculum sub-steps with minor backend type extensions.

## Complexity Tracking

> No constitution violations require justification.

## Phase 0: Research Summary

See [research.md](./research.md) for full details. Key findings:

- **Price adjuster** is pure frontend interaction: HTML range input + client-side math for revenue projections. No backend changes needed beyond persisting the final `startingPrice`.
- **Duration selector** requires frontend UI + backend data variation: the LLM service (currently dummy data) must return different module counts and roadmap week distributions based on the selected duration.
- **Backward compatibility**: Legacy blueprints without `aiRecommendedPrice` should treat `startingPrice` as the AI recommendation. Legacy blueprints without `duration` should default to 12 weeks.
- **shadcn/ui Slider** component exists in `src/components/ui/slider.tsx` and can be reused for the price adjuster.
