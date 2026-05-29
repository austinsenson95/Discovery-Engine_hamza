# Research: Price Adjuster and Course Duration Selector

**Date**: 2026-05-29
**Feature**: 006-price-adjuster-duration

## Decision: Use shadcn/ui Slider for Price Adjuster

**Rationale**: The project already has shadcn/ui installed with a Slider component (`src/components/ui/slider.tsx`). It is accessible, keyboard-navigable, and styled with Tailwind. Using it avoids custom component work and maintains design system consistency.

**Alternatives considered**:
- Custom range input with Tailwind — Rejected: shadcn/ui Slider already exists and is more polished.
- React Slider libraries (rc-slider, react-range) — Rejected: Constitution forbids new UI component libraries.

## Decision: Client-Side Revenue Projection Calculation

**Rationale**: Revenue projections are simple multiplication (`price * studentCount`). Computing them client-side gives instant feedback (<100ms) without round-tripping to the backend. The backend only needs to persist the final adjusted price.

**Alternatives considered**:
- Backend API to recalculate projections on each slider change — Rejected: unnecessary network overhead for simple math.

## Decision: Duration as Enum String, Not Number

**Rationale**: Using `'4_weeks' | '8_weeks' | '12_weeks'` instead of a raw number makes the data more explicit and self-documenting. It also prevents invalid durations from being submitted.

**Alternatives considered**:
- Free-form number input for weeks — Rejected: allows invalid values (e.g., 7 weeks) and complicates LLM prompt engineering.

## Decision: Adapt Dummy Data Distribution for Duration

**Rationale**: The LLM service (`llmService.ts`) currently returns canned dummy data. For this feature, we will adapt the dummy data based on duration:
- 4 weeks → 3-4 modules, dense lessons
- 8 weeks → 5-6 modules, standard lessons
- 12 weeks → 8+ modules, spread-out lessons

This is a pragmatic approach until real LLM integration replaces the placeholder.

**Alternatives considered**:
- Wait for real LLM integration before adding duration — Rejected: duration selector provides user value now; dummy data adaptation is trivial.

## Decision: Add `aiRecommendedPrice` to PricingStrategy

**Rationale**: We need to track the original AI recommendation separately from the user-adjusted price so the "Reset" button works and so we can display both values. Adding it as an optional field (`aiRecommendedPrice?: number`) ensures backward compatibility with legacy blueprints.
