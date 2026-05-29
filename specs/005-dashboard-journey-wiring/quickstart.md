# Quickstart: Dashboard and Journey Blueprint Integration

**Feature**: 005-dashboard-journey-wiring

## Prerequisites

- Backend dev server running: `cd discovery-engine-backend && npm run dev` (port 3001)
- Frontend dev server running: `cd app && npm run dev` (port 3000)
- Both servers must be running to test data wiring

## Development Workflow

### 1. Start both servers

```bash
# Terminal 1
cd discovery-engine-backend && npm run dev

# Terminal 2
cd app && npm run dev
```

### 2. Test Dashboard wiring

1. Open `http://localhost:3000`
2. Complete Niche Discovery in the wizard
3. Return to Dashboard
4. Verify:
   - Progress ring reflects actual `latest.progress`
   - "Current Step" card shows correct step label
   - "Credits Used" matches backend deductions
   - Activity feed shows real entries (not static mock list)

### 3. Test Journey wiring

1. Navigate to `/journey`
2. Verify:
   - Overall progress ring shows `latest.progress` (not 50%)
   - Timeline steps derive status from `currentStep`
   - Achievements unlock based on actual completion
   - Blueprints Library cards show real data
   - Activity timeline shows real entries

### 4. Test wizard state restoration

1. Advance to the Curriculum sub-step (subStep 4 of Program Builder)
2. Refresh the browser
3. Verify you remain on the Curriculum view
4. Repeat for Roadmap step

### 5. Run type checks

```bash
# Frontend
cd app && npx tsc --noEmit

# Backend
cd discovery-engine-backend && npm run typecheck
```

## Common Issues

| Issue | Cause | Fix |
|---|---|---|
| Dashboard shows "Not Started" | Backend not running | Start `discovery-engine-backend` |
| Journey timeline still static | Missing data derivation logic | Check `Journey.tsx` timeline mapping |
| Refresh jumps to wrong step | Backend overwrites `currentStep` | Verify controller changes in `blueprintController.ts` |
| Activities empty | No `fetchActivities()` call | Check `useEffect` in `Home.tsx` and `Journey.tsx` |
| Credit badge stale | Navbar not calling `fetchUser()` | Add `fetchUser()` call in `Navbar.tsx` mount |
