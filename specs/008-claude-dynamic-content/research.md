# Research: Dynamic AI Content Generation

**Date**: 2026-05-30

## Unknowns Resolved

### 1. How should the backend generate problems from niche+persona context?

**Decision**: Add a new `generateProblems()` method in `llmService.ts` that constructs a detailed prompt including the niche name and all persona fields (role, current situation, biggest desire, goals, existing pain points). The prompt requests 6–8 specific, actionable problems the target audience faces.

**Rationale**: This follows the existing pattern for other generation methods (generatePersona, generatePricing, etc.). The prompt should leverage the persona's existing pain points as inspiration while generating fresh, problem-statement-formatted items suitable for program builder selection.

**Alternatives considered**:
- Reuse the persona's `painPoints` field directly — rejected because the persona pain points are descriptive ("Feeling unfulfilled...") while program builder problems should be actionable statements ("No clear roadmap to transition out of corporate").
- Generate problems during persona generation — rejected because it would couple two independent steps and prevent users from regenerating problems independently.

### 2. What should happen when the Claude API fails?

**Decision**: The `callClaude()` helper must throw an explicit `ApiError` (or standard Error) on any failure (missing API key, API error, timeout, malformed JSON). The controller catch blocks propagate this to the global error handler, which returns an HTTP 500/502 with a descriptive message. The frontend displays the error via the existing toast system.

**Rationale**: Per the spec, silent fallbacks erode user trust. The existing backend already has an `ApiError` class and global error handler in `middleware/errorHandler.ts`.

**Alternatives considered**:
- Return partial data with a warning flag — rejected because the frontend would need to handle mixed success/failure states, increasing complexity.
- Add a separate `callClaudeStrict()` helper for only problems and curriculum — rejected because it creates inconsistent behavior across endpoints and the spec applies to all AI generation.

### 3. Where should generated problems be stored in the Blueprint state?

**Decision**: Store generated problems in `blueprint.program.generatedProblems` (or `blueprint.program.problems` if we rename the existing `selectedProblems`). The existing `selectedProblems` field holds user selections. We need a new field for the AI-generated pool.

**Rationale**: The user flow is: (1) AI generates a pool of problems, (2) user selects from the pool, (3) selected problems flow into curriculum generation. Separating the pool from selections preserves the pool for potential regeneration.

**Alternatives considered**:
- Overwrite `selectedProblems` with generated problems — rejected because it would lose user selections on regeneration.
- Store problems at the blueprint root level — rejected because problems are logically part of the Program Builder step.

### 4. Should the frontend keep any mock data at all?

**Decision**: Remove all mock data imports and silent fallbacks from `Blueprint.tsx` and `api.ts`. Keep `mockData.ts` for other pages (Dashboard, Journey) that may still use it during development. The `mockData.ts` file itself is not deleted; only the imports in Blueprint.tsx are removed.

**Rationale**: The spec targets the wizard flow specifically. Other pages may have legitimate development uses for mock data. Removing imports from Blueprint.tsx eliminates the silent fallback paths.

## Research Findings

### Existing Error Handling Infrastructure

The backend already has robust error handling:
- `middleware/errorHandler.ts` — Global Express error handler
- `middleware/errorHandler.ts` — `ApiError` class with status codes
- The frontend already has `useToast()` hook and `<ToastContainer />`

This means no new error-handling infrastructure is needed; we only need to ensure errors propagate correctly.

### Existing Claude Integration

The backend already integrates with Claude via `@anthropic-ai/sdk`:
- `llmService.ts` has `callClaude()` helper
- System prompts exist for niche, persona, program names, pricing, curriculum, roadmap
- The `ANTHROPIC_API_KEY` is read from `config.anthropicApiKey`

Adding a new prompt for problem generation follows the established pattern.

### Credit System

The existing credit system in `services/creditService.ts` supports:
- `hasEnoughCredits(userId, 'problems')` — check balance
- `deductCredits(userId, 'problems')` — deduct and return new balance
- Cost mapping is in the service itself

We need to add a `problems` entry to the cost map (default: 5 credits, comparable to program naming and pricing).
