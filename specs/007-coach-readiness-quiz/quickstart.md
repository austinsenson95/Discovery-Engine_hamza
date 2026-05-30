# Quickstart: Coach Readiness Quiz

**Feature**: Coach Readiness Quiz  
**Date**: 2026-05-29  
**Plan**: [plan.md](./plan.md)

## Prerequisites

- Backend dev server running: `cd discovery-engine-backend && npm run dev` (port 3001)
- Frontend dev server running: `cd app && npm run dev` (port 3000)
- Both servers using the same SQLite database file

## Development Workflow

### 1. Start from a Completed Roadmap

1. Open the frontend at `http://localhost:3000`
2. Navigate to the Blueprint wizard
3. Complete Steps 1–3 (Niche Discovery, Audience Mapping, Program Builder)
4. In Step 4, generate the 12-week roadmap
5. After roadmap generation, the quiz should appear automatically

### 2. Complete the Quiz

1. Answer all 5 questions by selecting one option per question
2. Click "Submit Quiz"
3. Expect:
   - 5 credits deducted from balance
   - Animated score reveal (e.g., circular progress or number counter)
   - Persona label (e.g., "Building Momentum")
   - 3 personalized action bullets based on weakest area

### 3. Test Quiz Result Persistence

1. Refresh the page
2. Navigate back to the Blueprint wizard Step 4
3. The quiz result should still be visible
4. Check the database: `SELECT readinessQuiz FROM blueprints WHERE id = '<your-blueprint-id>';`

### 4. Test PDF Personalization

1. Click "Download My Blueprint PDF"
2. Open the PDF and verify:
   - A "Coach Readiness Assessment" section is present
   - The score, persona, and weakest area are displayed
   - Week 1 tasks explicitly address the weakest area

### 5. Test Quiz Gate

1. Create a new Blueprint and generate a roadmap without taking the quiz
2. Verify that the "Download PDF" and "Book Call" buttons are disabled or hidden
3. Verify that a prompt to complete the quiz is shown instead

## Testing Checklist

### Frontend

- [ ] 5 questions render with 4 options each
- [ ] User can select one option per question
- [ ] Submit button is disabled until all 5 questions are answered
- [ ] Score calculates correctly for known answer combinations
- [ ] Persona label matches the score mapping
- [ ] Weakest area is correctly identified
- [ ] Action tips address the weakest area
- [ ] Score reveal animation plays smoothly
- [ ] Quiz is mobile-responsive
- [ ] PDF download and call booking are gated behind quiz completion
- [ ] Retake button appears and allows one additional submission

### Backend

- [ ] `POST /api/blueprint/quiz` returns 200 with computed result
- [ ] `POST /api/blueprint/quiz` returns 400 for invalid answers (wrong length or out-of-range values)
- [ ] `POST /api/blueprint/quiz` returns 402 if credits < 5
- [ ] `POST /api/blueprint/quiz` returns 409 on second retake attempt
- [ ] Credit balance decreases by exactly 5 on success
- [ ] Blueprint `readinessQuiz` is persisted in SQLite
- [ ] `GET /api/blueprint` returns `readinessQuiz` in the response
- [ ] PDF includes Readiness Quiz section when quiz exists

### Data Integrity

- [ ] Score mapping is correct for all ranges:
  - Raw 5–8 → 3/10 "Early Explorer"
  - Raw 9–12 → 5/10 "Building Momentum"
  - Raw 13–16 → 7.5/10 "Almost Ready"
  - Raw 17–20 → 9/10 "Launch-Ready"
- [ ] Weakest area correctly identifies the question with the lowest answer value
- [ ] Action tips correspond to the weakest area category
- [ ] TypeScript compilation passes in both frontend and backend
