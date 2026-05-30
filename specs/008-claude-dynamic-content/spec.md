# Feature Specification: Dynamic AI Content Generation

**Feature Branch**: `008-claude-dynamic-content`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "Replace static mockData pain points and curriculum with real-time Claude API generation. Pain points should be generated from niche+persona context. Curriculum should be generated from niche+program name+selected problems+duration context. Remove all silent mock fallbacks in the frontend"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - AI-Generated Pain Points (Priority: P1)

As a coach completing the Blueprint wizard, I want the system to generate a tailored list of problems my ideal audience faces based on my selected niche and persona, so that I can select the most relevant ones for my program instead of seeing generic, hardcoded options.

**Why this priority**: This is the core value of the feature — replacing static content with context-aware AI generation. Pain points that are specific to the user's niche and persona dramatically improve program relevance and user trust in the AI assistant.

**Independent Test**: Can be fully tested by completing Niche Discovery and Audience Mapping steps, then navigating to the Problem Selection sub-step. The system should generate 6–8 specific problems derived from the niche and persona context, deduct the appropriate credits, and present them in the UI.

**Acceptance Scenarios**:

1. **Given** a user has completed Niche Discovery and Audience Mapping with a specific niche (e.g., "Career Transition Coaching for IT Professionals") and persona, **When** they navigate to the Problem Selection step, **Then** the AI generates 6–8 contextually relevant problems specific to that niche and persona within 5 seconds.
2. **Given** a user triggers pain point generation, **When** the AI processes the request, **Then** the appropriate number of credits is deducted from their balance and the generated problems are persisted in their Blueprint state.
3. **Given** a user views the generated problems, **When** they select problems for their program, **Then** their selections are saved and flow correctly into downstream steps (Program Naming, Pricing, Curriculum).

---

### User Story 2 - Context-Aware Curriculum Generation (Priority: P1)

As a coach who has completed Problem Selection, Program Naming, and Pricing, I want the AI to generate a curriculum that deeply incorporates my niche, program name, selected problems, and chosen duration, so that the course structure feels custom-built for my program rather than generic.

**Why this priority**: Curriculum generation already exists, but users receive generic fallback content when the AI service is unavailable or unconfigured. Ensuring the curriculum is always generated from full context and never silently falls back to static data is critical for the platform's credibility.

**Independent Test**: Can be fully tested by completing all Program Builder sub-steps and triggering curriculum generation. The system should always call the Claude API with full context (niche, program name, selected problems, duration) and return a unique curriculum. If the API is unavailable, the system surfaces a clear error instead of silently serving dummy data.

**Acceptance Scenarios**:

1. **Given** a user has completed all prerequisite steps (niche, persona, problems, program name, pricing, duration), **When** they initiate curriculum generation, **Then** the AI receives the complete context and generates a curriculum with modules and lessons directly addressing the selected problems.
2. **Given** the Claude API is unavailable or returns an error, **When** a user attempts to generate a curriculum, **Then** the frontend displays a clear error message explaining the issue and suggesting a retry, rather than showing generic mock curriculum content.
3. **Given** a user selects different problems or changes duration, **When** they regenerate the curriculum, **Then** the new curriculum reflects the updated context with different module titles, lesson content, or structure.

---

### User Story 3 - No Silent Mock Fallbacks (Priority: P2)

As a coach using the Discovery Engine platform, I want to always know whether the content I'm seeing is AI-generated or if there's a system issue, so that I never unknowingly receives placeholder or generic content.

**Why this priority**: Silent fallbacks erode user trust. When users believe they are receiving AI-generated, personalized content but are actually seeing hardcoded mock data, the platform's value proposition is undermined. Explicit error handling is preferable to silent degradation.

**Independent Test**: Can be fully tested by simulating API failures (e.g., invalid API key, network error, rate limit) and verifying that every AI-dependent endpoint surfaces an explicit error to the user instead of returning mock data transparently.

**Acceptance Scenarios**:

1. **Given** the backend AI service is misconfigured or unavailable, **When** any AI generation endpoint is called (niche, persona, problems, program names, pricing, curriculum, roadmap), **Then** the response returns an HTTP error status with a descriptive message, and the frontend displays a user-friendly error notification.
2. **Given** the frontend API layer, **When** any function that previously returned mock data with a simulated delay is invoked, **Then** it calls the real backend endpoint and propagates errors transparently instead of silently falling back to local mock data.
3. **Given** a user encounters an AI generation failure, **When** they see the error message, **Then** they have the option to retry the request without losing their previous wizard progress.

---

### Edge Cases

- What happens when a user navigates directly to the Problem Selection step without completing Niche Discovery and Audience Mapping first?
- How does the system handle rate limiting from the Claude API during high-traffic periods?
- What happens if the generated problems contain duplicates or near-duplicates?
- How does the system handle malformed or unexpected JSON responses from Claude?
- What happens when a user regenerates problems — are previous selections preserved or reset?
- How does the curriculum generation behave when the user has selected fewer than 3 problems?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a new backend API endpoint that accepts niche and persona context and returns AI-generated problems specific to that context.
- **FR-002**: The problem generation endpoint MUST call the Claude API with a detailed prompt containing the niche name, persona details (role, situation, goals, pain points), and request 6–8 specific, actionable problems.
- **FR-003**: The system MUST deduct credits from the user's balance upon successful problem generation, consistent with other AI generation steps.
- **FR-004**: The generated problems MUST be persisted in the Blueprint state and retrievable on subsequent requests.
- **FR-005**: The curriculum generation endpoint MUST continue to call the Claude API with full context (niche, program name, selected problems, duration) and MUST NOT silently fall back to dummy data on API failure.
- **FR-006**: On any AI generation failure (missing API key, API error, malformed response, timeout), the backend MUST return an explicit HTTP error response with a descriptive message instead of dummy data.
- **FR-007**: The frontend MUST call the real backend endpoint for problem retrieval and MUST NOT contain any silent mock data fallbacks or simulated delays that bypass the API.
- **FR-008**: The frontend MUST surface backend errors to users through clear, actionable toast notifications or inline messages with retry options.
- **FR-009**: The frontend MUST remove all hardcoded mock data references from the problem selection flow, including imports from `mockData.ts` for problems.
- **FR-010**: The backend MUST validate that prerequisite steps (niche and persona completed) are satisfied before allowing problem generation, returning a 400 error if prerequisites are missing.

### Key Entities *(include if feature involves data)*

- **GeneratedProblems**: A list of problem strings produced by the AI for a specific blueprint. Contextually tied to the niche and persona. Contains 6–8 items.
- **CurriculumContext**: The composite input used for curriculum generation, consisting of niche name, program name, selected problems array, and course duration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of problem lists presented to users are AI-generated from niche+persona context — no hardcoded lists are served in production flows.
- **SC-002**: Users can generate a tailored problem list in under 5 seconds after initiating the request (measured from click to rendered result).
- **SC-003**: 0% of AI generation failures result in silent mock data fallback — every failure surfaces an explicit error to the user.
- **SC-004**: 100% of generated curricula include module and lesson content that directly references at least one of the user's selected problems.
- **SC-005**: Users can retry a failed AI generation request within 2 clicks, without losing prior wizard progress or selections.

## Assumptions

- The Claude API integration and authentication setup (ANTHROPIC_API_KEY) is already functional in the backend environment.
- The credit system remains unchanged; problem generation will use a credit cost comparable to other generation steps (e.g., 5 credits).
- The existing Blueprint state persistence mechanism (in-memory Map) is sufficient for storing generated problems during the demo/harness phase.
- Users have a stable internet connection; offline support is out of scope.
- The frontend already has toast/notification infrastructure capable of displaying error messages from API failures.
