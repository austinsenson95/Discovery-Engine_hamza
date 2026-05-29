# Research: Interactive Stepper Navigation

**Feature**: Interactive Stepper Navigation  
**Date**: 2026-05-29  
**Plan**: [plan.md](./plan.md)

## Decision: No External Research Required

All technical patterns for this feature are already established in the codebase:

- **Component Pattern**: React functional component with Framer Motion animations
- **Styling Pattern**: Tailwind CSS utility classes with brand colors (`bg-emerald-500`, `bg-orange-500`, `text-gray-400`)
- **Animation Pattern**: Framer Motion `motion.div` with `animate`, `transition`, `whileHover`, `whileTap`
- **Event Handling**: React `onClick` on `button` elements with `disabled` state
- **Callback Pattern**: Optional callback prop `(step: number) => void` passed from parent

## Key Finding: Feature is Substantially Pre-Implemented

Upon codebase inspection, the `Stepper.tsx` component already contains:

1. `onStepClick?: (step: number) => void` prop
2. `isClickable` logic: `!!onStepClick && (isCompleted || isCurrent)`
3. `disabled={!isClickable}` on the button element
4. `cursor-pointer` / `cursor-default` classes
5. Hover color classes (`hover:bg-emerald-600`, `hover:bg-orange-600`)

And `Blueprint.tsx` already passes:
```tsx
<Stepper currentStep={step} steps={steps} onStepClick={goToStep} />
```

## Gap Analysis

The pre-existing implementation covers the core functionality but has potential gaps:

1. **Hover feedback is subtle**: Only background color change. The spec asks for scale/shadow/brightness change for stronger discoverability.
2. **Disabled button hover**: The `disabled` attribute on `<button>` may suppress hover effects in some browsers, potentially breaking the hover feedback on clickable steps.
3. **No touch/mobile affordance**: No active/tap state for mobile devices.
4. **Label hover**: The step label (text below the circle) does not have hover feedback.

## Alternatives Considered

| Alternative | Evaluated | Rejected Because |
|---|---|---|
| Replace `<button>` with `<div>` + `role="button"` | Yes | Would lose native button accessibility and keyboard support; using `<button>` with `disabled` is correct |
| Add a separate overlay for click handling | Yes | Over-engineering; the existing `onClick` on the button is sufficient |
| Use a context provider for step state | Yes | Over-engineering for a single component; prop drilling is sufficient |
| Add route-based navigation | Yes | Would require router changes; the existing `setStep` state approach is simpler and matches the current wizard pattern |

## Open Questions Resolved

1. **Does the Stepper already support onStepClick?** → Yes, the prop exists and is wired.
2. **Does Blueprint.tsx handle arbitrary step jumps?** → Yes, `goToStep(targetStep)` sets the step directly.
3. **Are future steps disabled?** → Yes, `isClickable` only allows completed and current steps.
