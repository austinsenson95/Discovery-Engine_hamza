# Quickstart: Frontend Real-Time Data Sync

**Date**: 2026-05-30
**Feature**: specs/009-frontend-backend-data-sync

## Prerequisites

- Node.js 18+ installed
- Backend dependencies installed (`cd discovery-engine-backend && npm install`)
- Frontend dependencies installed (`cd app && npm install`)
- `next-themes` package already in `app/package.json` (verify with `npm ls next-themes`)

## One-Time Setup

### 1. Initialize new database tables

The backend will auto-create the new `users` and `credit_transactions` tables on next startup (via `initDb()` in `db/index.ts`). No manual migration needed for this feature.

### 2. Seed the initial user

Since auth is mocked, the dummy user will be auto-inserted into the `users` table on first API call. Verify with:

```bash
curl http://localhost:3001/api/user/me
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "credits": 100,
      "language": "english"
    }
  }
}
```

### 3. Verify new endpoints

After implementing the backend changes, test each new endpoint:

```bash
# Activity feed
curl http://localhost:3001/api/user/activity

# Achievements
curl http://localhost:3001/api/user/achievements

# Credit history (initially empty or shows seeded transactions)
curl http://localhost:3001/api/user/credit-history
```

## Running the Feature

### Terminal 1: Backend
```bash
cd discovery-engine-backend
npm run dev
```

### Terminal 2: Frontend
```bash
cd app
npm run dev
```

### Verify in browser

1. Open `http://localhost:3000`
2. Check Navbar — credits badge should show real value (e.g., "100 credits")
3. Navigate to **My Journey** — timeline should show actual blueprint progress
4. Navigate to **Profile** — name/email/credits should match API. Toggle Dark mode and verify the app switches.
5. Complete a blueprint step (e.g., Niche Discovery) — credits should decrement and all pages should reflect the new balance.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Navbar shows "100 credits" after deduction | Frontend cache not refreshed | Call `refreshCredits()` from `UserContext` after API response |
| Dark mode doesn't persist | `next-themes` not wrapped around app | Check `ThemeProvider` is in `main.tsx` |
| Activity feed empty | No activities in database | Complete a blueprint step; activities are auto-inserted |
| Credit history empty | `credit_transactions` table has no rows | The credit service must be updated to insert rows on deduction |
| "User not found" error | `users` table empty | Restart backend; the user repository will seed the dummy user |
| TypeScript errors on build | Unused imports/variables | Run `npm run lint` and clean up |
