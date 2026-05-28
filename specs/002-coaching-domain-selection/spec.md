# Feature Specification: Coaching Domain Selection

**Feature Branch**: `002-coaching-domain-selection`

**Created**: 2026-05-28

**Status**: Draft

**Input**: User description: "Make the coaching domain buttons in the Niche Discovery step selectable with multi-select toggle behavior and visual active state. Persist selected domains to the Blueprint backend model and include them as structured context data in the LLM prompt for AI niche generation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select Coaching Domains to Guide AI Niche Generation (Priority: P1)

A coach starting the blueprint wizard wants to indicate which coaching domains they are interested in (e.g., Fitness & Health, Business & Career, Mental Health) before submitting their skills, experience, and passions. They click domain buttons to toggle them on/off. The selected domains are sent to the AI along with their free-form inputs, resulting in niche recommendations that are more closely aligned with their chosen focus areas.

**Why this priority**: This is the core value of the feature — structured domain selection improves the relevance and quality of AI-generated niche recommendations. Without it, the AI has no explicit signal about the user's domain preferences.

**Independent Test**: Can be fully tested by opening Step 1 of the wizard, selecting one or more domain buttons, submitting the form, and verifying that the returned niche recommendations reference the selected domains.

**Acceptance Scenarios**:

1. **Given** a user is on Step 1 (Niche Discovery), **When** they click a coaching domain button, **Then** the button toggles to an active visual state and the domain is added to their selection.
2. **Given** a user has selected a coaching domain, **When** they click the same domain button again, **Then** the button toggles back to an inactive visual state and the domain is removed from their selection.
3. **Given** a user has selected multiple domains and submits the niche form, **When** the AI generates niche recommendations, **Then** at least one recommended niche references or aligns with one of the selected domains.

---

### User Story 2 - Persist and Restore Selected Domains Across Sessions (Priority: P2)

A user who previously started a blueprint and selected coaching domains returns to their blueprint later (via the Journey page or by reloading the app). Their previously selected domains are restored and displayed in the active state on Step 1.

**Why this priority**: Users expect their progress to be preserved. Losing selected domains on page reload would create friction and force them to re-select, degrading trust in the platform.

**Independent Test**: Can be tested by selecting domains in Step 1, navigating away, returning to the blueprint, and verifying that the same domain buttons are still in the active state.

**Acceptance Scenarios**:

1. **Given** a user previously selected coaching domains and saved their blueprint, **When** they return to the blueprint wizard, **Then** the previously selected domain buttons appear in the active visual state.
2. **Given** a user is viewing a blueprint loaded from the Journey page via `?id=xxx`, **When** Step 1 renders, **Then** any previously selected domains for that blueprint are restored and visually indicated.

---

### User Story 3 - Generate Niches Without Selecting Any Domains (Priority: P3)

A user who is unsure of their coaching domain skips the domain selection and proceeds directly to entering their skills, experience, and passions. The AI still generates niche recommendations based on the free-form inputs alone.

**Why this priority**: Domain selection must be optional. Forcing users to choose domains before they understand their niche would add unnecessary friction for early-stage coaches.

**Independent Test**: Can be tested by submitting the niche form without selecting any domains and verifying that the AI still returns three valid niche recommendations.

**Acceptance Scenarios**:

1. **Given** a user submits the niche form without selecting any domains, **When** the AI processes the request, **Then** three niche recommendations are still generated successfully.
2. **Given** a user submits the niche form with no domains selected, **When** the request is stored in the blueprint, **Then** the domains field is either absent or an empty array (not `null` or `undefined` in a way that breaks downstream processing).

---

### Edge Cases

- What happens when a user selects all 18 coaching domains? Does the AI prompt become too long or unfocused?
- How does the system handle duplicate domain submissions if the user rapidly clicks the same button?
- What happens if the backend receives a `domains` field that contains values not in the predefined coaching categories list?
- How does the system behave if the LLM service fails to incorporate the domain context into niche generation?
- What happens when a user resets their blueprint — are the selected domains cleared from state and storage?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Niche Discovery step (Step 1) MUST display coaching domain buttons that support multi-select toggle behavior.
- **FR-002**: Each domain button MUST have a clear visual active state when selected and an inactive state when deselected.
- **FR-003**: Clicking an already-selected domain button MUST deselect it (toggle behavior).
- **FR-004**: The system MUST accept zero or more selected domains — domain selection is optional, not required.
- **FR-005**: Selected domains MUST be persisted to the Blueprint model as part of the niche data when the user submits the niche form or selects a niche.
- **FR-006**: Selected domains MUST be included as structured context in the LLM prompt for AI niche generation.
- **FR-007**: When a user returns to an in-progress or completed blueprint, the system MUST restore previously selected domains to the UI in their active state.
- **FR-008**: Domain selection MUST be cleared when the user resets their blueprint.
- **FR-009**: The domain data MUST be stored in a format that supports an ordered array of domain strings (to preserve selection order if relevant).
- **FR-010**: If the backend receives invalid or unexpected domain values, it MUST gracefully ignore them rather than fail the request.

### Key Entities *(include if feature involves data)*

- **Coaching Domain**: A predefined category from a fixed list (e.g., "Fitness & Health", "Business & Career", "Mental Health"). Represented as a display string with an optional emoji prefix and a normalized string for storage.
- **Domain Selection**: An ordered array of normalized domain strings associated with a blueprint's niche data. Optional — may be empty.
- **Niche Form Input**: The complete set of user inputs for Step 1, comprising skills, experience, passions, and selected domains.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select and deselect coaching domain buttons with immediate visual feedback (toggle response time under 100ms).
- **SC-002**: 100% of niche generation requests that include selected domains pass those domains to the AI as structured context.
- **SC-003**: Blueprints with selected domains survive page refresh — domains are restored correctly when the blueprint is reloaded.
- **SC-004**: AI-generated niche recommendations for users who selected domains are rated as "more relevant" than recommendations generated without domain context (measured via qualitative user feedback).
- **SC-005**: Niche generation succeeds 100% of the time regardless of whether domains are selected, empty, or omitted.

## Assumptions

- The predefined list of coaching domains is static and managed in the frontend code. Adding or removing domains requires a code change.
- Domain selection is purely for AI context enrichment and does not restrict which niches the AI can recommend.
- The LLM service has enough prompt capacity to include domain context without exceeding token limits.
- Users understand that domain selection is optional and does not replace the free-form skills/experience/passions fields.
- Domain strings are normalized (emoji prefix removed) before storage and prompt inclusion to keep data clean and consistent.
