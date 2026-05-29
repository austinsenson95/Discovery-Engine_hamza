# Implementation Plan: Interactive Stepper Navigation

**Branch**: `004-interactive-stepper` | **Date**: 2026-05-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-interactive-stepper/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Enhance the main Stepper component to provide interactive step navigation within the Blueprint wizard. Users can click completed (green) and current (orange) step circles to jump back to previous stages. Future steps remain disabled. Hover feedback (scale/shadow + pointer cursor) indicates interactivity. The Stepper already accepts an `onStepClick` prop and `Blueprint.tsx` already wires it to `goToStep`. The remaining work focuses on verifying the existing behavior, enhancing hover feedback for discoverability, and ensuring edge cases (disabled button hover, mobile touch, loading states) are handled correctly.

## Technical Context

**Language/Version**: TypeScript 5.9

**Primary Dependencies**: React 19.2, Framer Motion 12, Tailwind CSS 3.4.19, Lucide React

**Storage**: N/A — pure UI component change

**Testing**: None currently installed (Vitest + React Testing Library to be installed per constitution)

**Target Platform**: Web (browser)

**Project Type**: Web application (full-stack)

**Performance Goals**: Hover feedback renders within 100ms; step navigation is instantaneous

**Constraints**: TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`), Tailwind-only styling (no custom CSS), Framer Motion for animations

**Scale/Scope**: Single component enhancement affecting one page (`Blueprint.tsx`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. TypeScript Strictness | ✅ PASS | Feature modifies existing TS component; no strictness violations anticipated |
| II. 4-Step Wizard is Sacred | ✅ PASS | Enhances wizard navigation without disrupting the flow |
| III. Brand Consistency | ✅ PASS | Uses existing Tailwind + Framer Motion patterns; brand colors already applied |
| IV. Backend-First Data Persistence | N/A | No backend changes |
| V. Real AI or Nothing | N/A | No AI changes |

## Project Structure

### Documentation (this feature)

```text
specs/004-interactive-stepper/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal — no new entities)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (from /speckit-tasks)
```

### Source Code (repository root)

```text
app/                          # Frontend React application
├── src/
│   ├── components/
│   │   └── Stepper.tsx      # Main component to enhance (already has onStepClick prop)
│   └── pages/
│       └── Blueprint.tsx    # Already wires onStepClick to goToStep
│
discovery-engine-backend/     # No changes required
```

**Structure Decision**: Option 2 (Web application). Only the frontend `app/` directory is affected. No backend changes.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations to justify.
