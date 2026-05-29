# Data Model: Interactive Stepper Navigation

**Feature**: Interactive Stepper Navigation  
**Date**: 2026-05-29  
**Plan**: [plan.md](./plan.md)

## Entities

No new data entities are introduced by this feature. It is a pure UI/UX enhancement to an existing React component.

## Component Props

### StepperProps (extended)

The existing `StepperProps` interface in `app/src/components/Stepper.tsx` already contains the required prop:

```typescript
interface StepperProps {
  currentStep: number;
  steps: string[];
  onStepClick?: (step: number) => void;  // ← Already exists
}
```

## State Transitions

The Stepper is a presentational (dumb) component. State transitions occur in the parent (`Blueprint.tsx`):

1. **User clicks a completed step** → `onStepClick(stepNum)` is called → `goToStep(stepNum)` is invoked in `Blueprint.tsx` → `setStep(stepNum)` updates state → wizard renders the target step.
2. **User clicks the current step** → `onStepClick(stepNum)` is called → `goToStep(currentStep)` is invoked → state remains unchanged.
3. **User clicks a future step** → Button is `disabled` → `onClick` is suppressed → no state change.

## No Database Changes

This feature requires no database schema changes, no API endpoint changes, and no new backend services.
