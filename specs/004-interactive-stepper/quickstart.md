# Quickstart: Interactive Stepper Navigation

**Feature**: Interactive Stepper Navigation  
**Date**: 2026-05-29  
**Plan**: [plan.md](./plan.md)

## Prerequisites

- Frontend dev server running: `cd app && npm run dev` (port 3000)
- Backend dev server running: `cd discovery-engine-backend && npm run dev` (port 3001)

## Development Workflow

### 1. Verify Existing Wiring

1. Open the frontend at `http://localhost:3000`
2. Navigate to the Blueprint wizard
3. Progress through Step 1 (Niche Discovery) and Step 2 (Audience Mapping)
4. On Step 3 (Program Builder), verify that:
   - The Step 1 circle is green (completed)
   - The Step 2 circle is green (completed)
   - The Step 3 circle is orange (current)
   - The Step 4 circle is gray (future)

### 2. Test Click Navigation

1. While on Step 3, click the Step 1 circle (green)
2. Expect: The wizard jumps to Step 1 (Niche Discovery) with all previously entered data intact
3. Click the Step 2 circle (green)
4. Expect: The wizard jumps to Step 2 (Audience Mapping) with persona data intact
5. Click the Step 3 circle (orange)
6. Expect: The wizard remains on Step 3

### 3. Test Disabled Future Steps

1. While on Step 2, click the Step 3 or Step 4 circle (gray)
2. Expect: Nothing happens — the wizard remains on Step 2

### 4. Test Hover Feedback

1. Hover over a green (completed) step circle
2. Expect: The circle scales up slightly or shows a shadow; cursor becomes a pointer
3. Hover over a gray (future) step circle
4. Expect: No visual change; cursor remains default

### 5. Test Mobile/Touch

1. Open the app on a mobile device or use browser dev tools mobile emulation
2. Tap a completed step circle
3. Expect: The wizard navigates to that step (tap works like click)

## Testing Checklist

### Component-Level

- [ ] `Stepper` renders without errors when `onStepClick` is omitted
- [ ] `Stepper` renders without errors when `onStepClick` is provided
- [ ] Completed steps trigger `onStepClick` with the correct step number
- [ ] Current step triggers `onStepClick` with the correct step number
- [ ] Future steps do NOT trigger `onStepClick`
- [ ] Completed steps show hover feedback (scale/shadow + pointer cursor)
- [ ] Current step shows hover feedback (scale/shadow + pointer cursor)
- [ ] Future steps show NO hover feedback and default cursor

### Page-Level

- [ ] Clicking a completed step in the main Stepper navigates to that step
- [ ] Previously entered data is preserved after navigating back
- [ ] The wizard animation direction (`setDirection`) is correct when navigating backward
- [ ] Future steps remain non-interactive at all times

### Edge Cases

- [ ] Clicking during AI loading state does not crash the app
- [ ] Rapid clicking on multiple steps does not cause state corruption
- [ ] Keyboard navigation (Tab + Enter) works on clickable steps
- [ ] Screen readers announce step buttons correctly (completed/current/future)
