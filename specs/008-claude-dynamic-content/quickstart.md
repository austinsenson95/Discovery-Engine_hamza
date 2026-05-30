# Quickstart: Dynamic AI Content Generation

**Date**: 2026-05-30

## Prerequisites

- Node.js 18+ installed
- `ANTHROPIC_API_KEY` set in `discovery-engine-backend/.env`
- Both frontend and backend dev servers can start

## Start Development Servers

```bash
# Terminal 1: Backend
cd discovery-engine-backend
npm run dev
# Server runs on http://localhost:3001

# Terminal 2: Frontend
cd app
npm run dev
# Server runs on http://localhost:3000
```

## Test the Feature

### 1. Verify Problem Generation

1. Navigate to `http://localhost:3000`
2. Complete **Niche Discovery** (Step 1)
3. Complete **Audience Mapping** (Step 2) — persona is generated
4. Navigate to **Problem Selection** (Step 3, sub-step 1)
5. Click "Generate Problems" (or equivalent CTA)
6. **Expected**: 6–8 contextually relevant problems appear within 5 seconds
7. **Verify**: Problems reference your niche and persona context (not generic copy)

### 2. Verify Explicit Error on API Failure

1. Stop the backend server OR temporarily set an invalid `ANTHROPIC_API_KEY`
2. Try to generate problems again
3. **Expected**: A toast error appears saying "AI service temporarily unavailable"
4. **Verify**: No problems are displayed; the UI shows a retry button

### 3. Verify Curriculum Generation

1. Complete all Program Builder steps (Problems, Program Name, Pricing)
2. Select a duration (4, 8, or 12 weeks)
3. Click "Generate Curriculum"
4. **Expected**: Curriculum modules reference your selected problems
5. **Verify**: Module titles and lesson outcomes are specific to your niche/program

### 4. Verify No Silent Fallbacks

1. Open browser DevTools → Network tab
2. Trigger any AI generation step (niche, persona, problems, curriculum, etc.)
3. **Expected**: If the API fails, the Network tab shows a 500/502 response
4. **Verify**: The frontend NEVER shows content without a successful 200 response

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "AI service temporarily unavailable" toast | Missing or invalid `ANTHROPIC_API_KEY` | Set a valid key in `.env` and restart backend |
| "Insufficient credits" error | Credit balance below cost | Check `discovery-engine-backend/src/data/dummyData.ts` — `dummyUser.credits` defaults to 100 |
| "Please complete Niche Discovery..." error | Prerequisite steps missing | Complete Step 1 and Step 2 before generating problems |
| TypeScript build errors | `noUnusedLocals` / `noUnusedParameters` | Remove any leftover mock imports in `Blueprint.tsx` |

## Verify Changes

Run these checks before committing:

```bash
# Frontend type-check and lint
cd app && npm run lint && npx tsc --noEmit

# Backend type-check and lint
cd discovery-engine-backend && npm run lint && npm run typecheck
```
