# Quickstart: Course Curriculum Generation

**Feature**: Course Curriculum Generation  
**Date**: 2026-05-29  
**Plan**: [plan.md](./plan.md)

## Prerequisites

- Backend dev server running: `cd discovery-engine-backend && npm run dev` (port 3001)
- Frontend dev server running: `cd app && npm run dev` (port 3000)
- Both servers using the same `better-sqlite3` database file (`discovery-engine-backend/data/discovery-engine.db`)

## Development Workflow

### 1. Start from a clean Blueprint

1. Open the frontend at `http://localhost:3000`
2. Navigate to the Blueprint wizard
3. Complete Steps 1 and 2 (Niche Discovery, Audience Mapping)
4. In Step 3 (Program Builder), complete:
   - Sub-step 1: Problem Selection
   - Sub-step 2: Program Naming
   - Sub-step 3: Pricing Strategy

### 2. Trigger Curriculum Generation

1. Advance to Sub-step 4: Course Curriculum
2. Click the "Generate Curriculum" button
3. Expect:
   - Loading state: "AI is building your curriculum..."
   - After ~2 seconds: Curriculum renders with modules, lessons, durations, and learning outcomes
   - Credit balance decreases by 10

### 3. Verify Data Persistence

1. Refresh the page
2. Navigate back to the Blueprint wizard
3. The curriculum should still be visible in Sub-step 4
4. Check the database: `SELECT program FROM blueprints WHERE id = '<your-blueprint-id>';`
   - The `program` JSON should contain a `curriculum` object

### 4. Test PDF Generation

1. Complete Step 4 (Roadmap & PDF)
2. Click "Download PDF"
3. Open the PDF and verify:
   - A "Course Curriculum" page is present
   - All modules, lessons, durations, and learning outcomes are rendered
   - The page uses the brand colors (orange `#F05A28`, black `#0A0A0A`)

## Testing Checklist

### Frontend

- [ ] Sub-step 4 appears after Pricing in the Program Builder MiniStepper
- [ ] Curriculum loads from Blueprint state on page refresh
- [ ] Each module is expandable/collapsible (or visually distinct)
- [ ] Each lesson shows: title, duration, and learning outcome
- [ ] Module outputs are displayed when present
- [ ] Loading state appears during generation
- [ ] Error state appears if generation fails
- [ ] Mobile: curriculum is scrollable and readable on small screens

### Backend

- [ ] `POST /api/blueprint/curriculum` returns 200 with curriculum data
- [ ] `POST /api/blueprint/curriculum` returns 400 if prerequisites are missing
- [ ] `POST /api/blueprint/curriculum` returns 402 if credits < 10
- [ ] Credit balance decreases by exactly 10 on success
- [ ] Blueprint `program.curriculum` is persisted in SQLite
- [ ] PDF includes Curriculum page when curriculum exists
- [ ] PDF omits Curriculum page when curriculum is missing

### Data Integrity

- [ ] Frontend `CurriculumLesson` type has `learningOutcome` field
- [ ] Backend `CurriculumLesson` type has `learningOutcome` field
- [ ] `mockCurriculum` lessons include `learningOutcome`
- [ ] `dummyCurriculum` lessons include `learningOutcome`
- [ ] TypeScript compilation passes in both frontend and backend
