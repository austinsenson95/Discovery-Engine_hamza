# Implementation Plan: Dynamic AI Content Generation

**Branch**: `008-claude-dynamic-content` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-claude-dynamic-content/spec.md`

## Summary

Replace every instance of static mock data and silent AI fallbacks across the Discovery Engine wizard with real-time Claude API generation. The primary scope covers:
1. **Backend**: Add a new `POST /api/blueprint/generate-problems` endpoint that generates 6–8 contextually relevant audience problems from niche+persona via Claude.
2. **Backend**: Modify `llmService.callClaude()` to throw explicit errors on API failure instead of silently returning dummy data, affecting all AI generation endpoints (niche, persona, program names, pricing, curriculum, roadmap).
3. **Frontend**: Remove all mock data imports and silent fallbacks in `Blueprint.tsx` and `api.ts`, wiring every AI-dependent call to the real backend with explicit error surfacing.
4. **Frontend**: Update `fetchProblems()` to call the new backend endpoint and propagate errors transparently.

## Technical Context

**Language/Version**: TypeScript 5.9 (frontend), TypeScript 5.5 (backend), Node.js 18+

**Primary Dependencies**: React 19.2, Vite 7.2.4, Express.js 4.19, Anthropic SDK (@anthropic-ai/sdk)

**Storage**: SQLite + better-sqlite3 (existing), in-memory Map (deprecated, acknowledged debt)

**Testing**: No test framework currently installed (acknowledged debt per AGENTS.md)

**Target Platform**: Web (Chrome, Safari, Firefox) + Node.js backend server

**Project Type**: Full-stack web application (React frontend + Express backend)

**Performance Goals**: AI generation endpoints must return within 5 seconds (measured from request to rendered result)

**Constraints**: 
- Must preserve the 4-Step Wizard user journey
- Must maintain brand consistency (Tailwind + shadcn/ui)
- Frontend `noUnusedLocals` and `noUnusedParameters` enforced
- Backend `strict: true` enforced

**Scale/Scope**: Single-user demo/harness phase; in-memory stores acceptable for now per spec assumptions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| TypeScript Strictness | ✅ PASS | All changes are TypeScript; no exceptions needed |
| 4-Step Wizard Preservation | ✅ PASS | Feature enhances wizard steps 2 and 3; no flow disruption |
| Brand Consistency | ✅ PASS | Minimal UI changes (error toast states only); brand palette preserved |
| Backend-First Data Persistence | ⚠️ ACKNOWLEDGED | Constitution mandates SQLite migration, but spec assumes in-memory Map for this feature scope. The `blueprintRepository` already uses SQLite, so generated problems will persist to the DB via existing update path. No additional migration needed. |
| Real AI or Nothing | ✅ PASS | This feature directly replaces placeholder/dummy data with real Claude calls |

**Constitution Tension**: The constitution states "JSON parsing MUST have a fallback to dummy data on LLM failure," but the user explicitly requested removal of all silent mock fallbacks. User instructions take highest precedence. The implementation will throw explicit errors on LLM failure rather than silently serving dummy data.

## Project Structure

### Documentation (this feature)

```text
specs/008-claude-dynamic-content/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md
└── tasks.md             # Phase 2 output (created by /speckit-tasks)
```

### Source Code (repository root)

```text
app/                          # Frontend React application
├── src/
│   ├── pages/
│   │   └── Blueprint.tsx     # REMOVE all mock imports and silent catch→fallback blocks
│   ├── lib/
│   │   ├── api.ts            # ADD generateProblems(); REMOVE fetchProblems() mock fallback
│   │   └── mockData.ts       # KEEP for other pages; REMOVE exports used by Blueprint.tsx
│   └── types/
│       └── index.ts          # No changes needed

discovery-engine-backend/     # Backend Express API
├── src/
│   ├── routes/
│   │   └── blueprint.ts      # ADD POST /generate-problems route
│   ├── controllers/
│   │   └── blueprintController.ts  # ADD generateProblems(); REMOVE dummy fallbacks in catch blocks
│   ├── services/
│   │   └── llmService.ts     # ADD generateProblems(); MODIFY callClaude() to throw instead of fallback
│   ├── types/
│   │   └── index.ts          # No changes needed
│   └── data/
│       └── dummyData.ts      # No changes needed (retained for non-AI paths)
```

**Structure Decision**: The project is a full-stack web app with a clear frontend/backend split. Changes are localized to the Blueprint wizard flow on the frontend and the blueprint controller/LLM service on the backend. No new directories or services required.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Removing all silent fallbacks globally (not just problems + curriculum) | The `callClaude()` helper is shared by all generation endpoints. Making it throw instead of fallback affects niche, persona, program names, pricing, and roadmap as well. Per spec FR-006, all AI generation failures must surface errors. | Keeping fallback only for non-target endpoints would require duplicating the helper or adding conditional fallback logic, increasing complexity and creating inconsistent user experience. |
