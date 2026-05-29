# Feature Specification: Interactive Stepper Navigation

**Feature Branch**: `004-interactive-stepper`

**Created**: 2026-05-29

**Status**: Draft

**Input**: User description: "Make the main Stepper component interactive so users can click on completed (green) and current (orange) step circles to navigate back to previous stages of the blueprint wizard. Future steps should remain disabled. Add hover feedback and ensure the stepper accepts an onStepClick callback prop wired to the existing navigation handler."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate Back via Stepper (Priority: P1)

As a coach progressing through the Blueprint wizard, I want to click on a completed or current step in the main Stepper component to jump back to that stage, so that I can review or edit my previous inputs without using the browser back button or clicking multiple "Back" buttons.

**Why this priority**: This is the core value of the feature — reducing friction in the wizard by providing a direct, visual navigation mechanism. Coaches often realize they need to adjust earlier inputs, and the stepper is the most intuitive place to do so.

**Independent Test**: Can be fully tested by progressing to Step 3 or 4 of the wizard and clicking on a completed step circle (green) to jump back to that step. The wizard should render the correct step content and preserve all previously entered data.

**Acceptance Scenarios**:

1. **Given** a user is on Step 3 of the Blueprint wizard, **When** they click the Step 1 circle (which is completed/green), **Then** the wizard navigates to Step 1 and displays the Niche Discovery content with all previously selected data intact.
2. **Given** a user is on Step 3 of the Blueprint wizard, **When** they click the Step 3 circle (which is current/orange), **Then** the wizard remains on Step 3 with no disruption to the current state.
3. **Given** a user is on Step 2 of the Blueprint wizard, **When** they click the Step 3 or Step 4 circle (future steps), **Then** nothing happens — the future steps are visually and functionally disabled.

---

### User Story 2 - Hover Feedback on Interactive Steps (Priority: P2)

As a coach using the stepper, I want clear visual feedback when I hover over a clickable step, so that I know which steps are interactive before I click.

**Why this priority**: Hover feedback is essential for discoverability. Without it, users may not realize the stepper is clickable, defeating the purpose of the feature.

**Independent Test**: Can be fully tested by hovering over completed and current step circles in the Stepper component and verifying that a visual change (scale, shadow, cursor) indicates interactivity. Future steps should show no hover feedback and a default cursor.

**Acceptance Scenarios**:

1. **Given** a completed step circle in the Stepper, **When** a user hovers over it, **Then** the circle shows a subtle visual feedback (e.g., slight scale up, shadow, or brightness change) and the cursor changes to a pointer.
2. **Given** a future step circle in the Stepper, **When** a user hovers over it, **Then** the circle remains visually unchanged and the cursor remains default (not a pointer).
3. **Given** the current step circle in the Stepper, **When** a user hovers over it, **Then** it shows the same hover feedback as completed steps, indicating it is also clickable.

---

### Edge Cases

- What happens when the user clicks a step while a background operation (e.g., AI generation) is in progress?
- How does the stepper behave when the Blueprint is in a partially completed state (e.g., Step 2 started but not finished)?
- What happens to sub-step navigation within Program Builder when jumping back via the main stepper?
- How does the stepper behave on mobile/touch devices where hover is not available?
- What happens if the `onStepClick` callback is not provided (backward compatibility)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Stepper component MUST accept an optional `onStepClick` callback prop that receives the clicked step index as an argument.
- **FR-002**: Completed steps (visually green) in the Stepper MUST be clickable and trigger the `onStepClick` callback with their step index.
- **FR-003**: The current step (visually orange) in the Stepper MUST be clickable and trigger the `onStepClick` callback with its step index.
- **FR-004**: Future steps (visually gray or inactive) in the Stepper MUST NOT be clickable and MUST NOT trigger the `onStepClick` callback.
- **FR-005**: Completed and current steps MUST display a hover feedback effect (e.g., `scale`, `shadow`, or brightness change) and show a `cursor-pointer` on hover.
- **FR-006**: Future steps MUST show no hover feedback and MUST display a `cursor-default` (or `cursor-not-allowed`).
- **FR-007**: The `Blueprint.tsx` page MUST wire the `onStepClick` prop of the Stepper to the existing step navigation handler, enabling backward navigation to previous wizard stages.
- **FR-008**: When navigating backward via the stepper, the wizard MUST preserve all previously entered data and state for the target step.
- **FR-009**: The Stepper component MUST remain backward compatible — if `onStepClick` is not provided, the component renders and behaves as a non-interactive stepper.

### Key Entities *(include if feature involves data)*

- **Stepper Props**: The component's prop interface is extended with an optional `onStepClick?: (stepIndex: number) => void` callback.
- **Step State**: Each step has a visual state (`completed`, `current`, `future`) that determines its clickability and hover behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate to any previous wizard step in a single click from the Stepper, reducing navigation time from multiple "Back" clicks to one click.
- **SC-002**: 100% of completed and current steps in the Stepper show hover feedback (visual change + pointer cursor) within 100ms of mouse enter.
- **SC-003**: 0% of future steps respond to click events or show pointer cursor.
- **SC-004**: When navigating backward via the Stepper, 100% of previously entered data is preserved and displayed correctly.
- **SC-005**: The Stepper component renders without errors when `onStepClick` is omitted (backward compatibility).

## Assumptions

- The existing Stepper component is a React component that renders step circles with visual states (green for completed, orange for current, gray for future).
- The Blueprint wizard's step state (current step, completed steps) is already tracked in the parent component (`Blueprint.tsx`).
- The existing navigation logic in `Blueprint.tsx` can handle arbitrary step jumps (not just sequential forward/backward).
- Touch/mobile devices will rely on visual affordances (pointer cursor on desktop) and tap feedback; hover is a desktop-only enhancement.
- No new dependencies are needed — hover/scale effects can be achieved with Tailwind CSS and Framer Motion (already in use).
