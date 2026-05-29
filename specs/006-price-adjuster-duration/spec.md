# Feature Specification: Price Adjuster and Course Duration Selector

**Feature Branch**: `006-price-adjuster-duration`

**Created**: 2026-05-29

**Status**: Draft

**Input**: User description: "Implement a Price Adjuster for the blueprint course generation and allow users to select course duration as per their requirement"

## User Scenarios & Testing

### User Story 1 — Price Adjuster (Priority: P1)

As a coach building my program, after the AI recommends a starting price, I want to adjust it up or down using a slider so that I can set a price that feels right for my audience and see how my revenue projections change in real time.

**Why this priority**: Pricing is one of the most emotionally charged decisions for new coaches. Giving them control over the AI-recommended price builds confidence and ownership in their offer. This directly impacts their willingness to launch.

**Independent Test**: Can be tested by reaching the Pricing step in the wizard, dragging the price slider, and verifying that the revenue projection cards and price evolution timeline update instantly to reflect the new price.

**Acceptance Scenarios**:

1. **Given** the AI has recommended a starting price of ₹4,999, **When** the user drags the price slider to ₹6,999, **Then** the starting price display updates to ₹6,999, the revenue projections for 10/50/100 students recalculate, and the price evolution timeline adjusts proportionally.
2. **Given** the user has adjusted the price, **When** they click "Build Course Curriculum", **Then** the adjusted price is saved to the blueprint and persists on page refresh.
3. **Given** the user wants to reset the price, **When** they click a "Reset to AI Recommendation" button, **Then** the price returns to the original AI-recommended value and all projections update accordingly.

---

### User Story 2 — Course Duration Selector (Priority: P1)

As a coach designing my program, I want to select how long my course should run (e.g., 4 weeks, 8 weeks, 12 weeks) so that the AI-generated curriculum and 12-week roadmap are tailored to my chosen timeline.

**Why this priority**: Coaches have different capacities and audience expectations. Some want an intensive 4-week sprint; others prefer a 12-week deep-dive. A fixed 12-week roadmap does not fit everyone. This feature makes the blueprint personally relevant.

**Independent Test**: Can be tested by selecting a duration option before generating the curriculum, then verifying that the curriculum module count and roadmap week distribution match the selected duration.

**Acceptance Scenarios**:

1. **Given** the user is on the Program Builder step, **When** they select "8 Weeks" from the duration selector, **Then** the curriculum is generated with modules distributed across 8 weeks and the roadmap reflects an 8-week timeline.
2. **Given** the user selects "4 Weeks" (intensive), **When** the curriculum is generated, **Then** lessons are grouped into fewer, denser modules with longer individual lesson durations.
3. **Given** the user has selected a duration and generated a curriculum, **When** they refresh the page, **Then** the selected duration is restored and displayed alongside the curriculum.

---

### Edge Cases

- What happens when the user drags the price slider to zero or a negative value? The slider must have a minimum floor (e.g., ₹500) to prevent invalid pricing.
- What happens when the user selects a duration but then goes back and changes it? The curriculum and roadmap should regenerate with the new duration.
- How does the system handle duration selection for a blueprint that was created before this feature? Default to 12 weeks to maintain backward compatibility.
- What happens if the user sets a very high price (e.g., ₹50,000)? The revenue projections should still calculate correctly and the UI should handle large numbers gracefully.

## Requirements

### Functional Requirements

- **FR-001**: The Pricing step MUST display a price adjustment slider alongside the AI-recommended price, with a range from 50% below to 200% above the recommended price.
- **FR-002**: The price slider MUST update the starting price display, revenue projection cards, and price evolution timeline in real time as the user drags.
- **FR-003**: The Pricing step MUST include a "Reset to AI Recommendation" button that restores the original price and projections.
- **FR-004**: The adjusted price MUST be persisted to the blueprint's `pricing.startingPrice` field when the user proceeds to the Curriculum step.
- **FR-005**: The Curriculum step MUST include a duration selector with predefined options: 4 Weeks (Intensive), 8 Weeks (Standard), and 12 Weeks (Comprehensive).
- **FR-006**: The selected duration MUST be stored in the blueprint's `program.duration` field.
- **FR-007**: The curriculum generation MUST distribute modules across the selected duration — fewer modules for shorter durations, more modules for longer durations.
- **FR-008**: The roadmap generation MUST adapt its week distribution to match the selected duration instead of always being 12 weeks.
- **FR-009**: The duration selector MUST default to "12 Weeks" for existing blueprints that do not have a duration stored.
- **FR-010**: Both the adjusted price and selected duration MUST survive page refresh by being persisted to the backend SQLite database.

### Key Entities

- **PricingStrategy** (extended): Adds `aiRecommendedPrice: number` to track the original AI recommendation separately from the user-adjusted `startingPrice`.
- **CourseDuration**: An enum with values `'4_weeks' | '8_weeks' | '12_weeks'`. Stored in `program.duration`.
- **RevenueProjection**: Derived view-model. Calculated as `startingPrice * studentCount` for each milestone.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can adjust the price and see revenue projections update within 100ms of releasing the slider.
- **SC-002**: 100% of users who reach the Pricing step see the price adjuster and can interact with it.
- **SC-003**: The curriculum generated for "4 Weeks" has no more than 4 modules; for "12 Weeks" it has at least 8 modules.
- **SC-004**: Both price adjustment and duration selection persist correctly after page refresh in 100% of cases.

## Assumptions

- The backend LLM service (`llmService.ts`) can accept a `duration` parameter when generating curriculum and roadmap.
- The frontend can derive revenue projections client-side without backend re-calculation (simple multiplication).
- The existing `PricingStrategy` type can be extended with `aiRecommendedPrice` without breaking existing blueprints in the database (undefined for legacy data).
