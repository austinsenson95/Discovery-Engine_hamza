# Feature Specification: Course Curriculum Generation

**Feature Branch**: `003-course-curriculum-generation`

**Created**: 2026-05-29

**Status**: Draft

**Input**: User description: "Add a Course Curriculum generation step to the Program Builder wizard. After Pricing, the AI should generate a structured course curriculum with modules, lessons, durations, and learning outcomes. The curriculum must be stored in the Blueprint, displayed in the frontend as a new sub-step, and rendered as a dedicated page in the downloadable PDF. Frontend and backend types, API endpoint, LLM service, PDF template, and mock data must all be updated."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Course Curriculum (Priority: P1)

As a coach who has completed the Program Builder steps (Problem Selection, Program Naming, and Pricing), I want the AI to generate a structured course curriculum for my signature program so that I can see exactly what content to deliver, in what order, and how long each module and lesson takes.

**Why this priority**: This is the core value of the feature — transforming a high-level program concept into a concrete, teachable curriculum. Without this, coaches lack the detailed content roadmap needed to build and deliver their program.

**Independent Test**: Can be fully tested by completing the first three Program Builder sub-steps (Problems, Program Name, Pricing) and triggering curriculum generation. The system should return a structured curriculum with modules, lessons, durations, and learning outcomes, deduct the appropriate credits, and store the result in the Blueprint.

**Acceptance Scenarios**:

1. **Given** a user has completed the Problems, Program Name, and Pricing steps in the Blueprint wizard, **When** they initiate curriculum generation, **Then** the AI generates a structured curriculum containing 4–8 modules, each with 3–6 lessons, estimated durations per lesson, and clear learning outcomes.
2. **Given** a user triggers curriculum generation, **When** the AI processes the request, **Then** the appropriate number of credits is deducted from their balance and the curriculum is persisted in their Blueprint state.
3. **Given** a user views the generated curriculum, **When** they navigate to the Curriculum sub-step, **Then** they see an expandable, visually organized display of modules and lessons with durations and learning outcomes clearly presented.

---

### User Story 2 - Review and Navigate Curriculum (Priority: P2)

As a coach reviewing my generated curriculum, I want to explore modules and lessons in an intuitive, expandable interface so that I can understand the full structure of my program at both a high level and in detail.

**Why this priority**: While the generation itself is the primary value, the ability to clearly review and navigate the curriculum is essential for user satisfaction and trust in the AI-generated content.

**Independent Test**: Can be fully tested by rendering the Curriculum sub-step UI with mock curriculum data and verifying that users can expand/collapse modules, see lesson details, and understand durations and outcomes without confusion.

**Acceptance Scenarios**:

1. **Given** a curriculum has been generated, **When** a user opens the Curriculum sub-step, **Then** they see a list of modules with titles and total durations, and can expand any module to view its lessons.
2. **Given** a user is viewing an expanded module, **When** they look at a lesson, **Then** they see the lesson title, estimated duration, and learning outcome in a clear, scannable format.
3. **Given** a user is on the Curriculum sub-step, **When** they have not yet generated a curriculum, **Then** they see a clear call-to-action prompting them to generate one, with an explanation of what they will receive.

---

### User Story 3 - Curriculum in Downloadable PDF (Priority: P3)

As a coach downloading my completed Blueprint PDF, I want the curriculum to appear as a dedicated, well-formatted page (or pages) within the PDF so that I have a professional, printable reference for my entire program structure.

**Why this priority**: The PDF is the final deliverable of the Blueprint wizard. Including the curriculum ensures the document is complete and actionable for the coach.

**Independent Test**: Can be fully tested by triggering PDF generation after a curriculum exists in the Blueprint and verifying that the downloaded PDF contains a clearly labeled Curriculum section with all modules, lessons, durations, and learning outcomes formatted for print readability.

**Acceptance Scenarios**:

1. **Given** a Blueprint contains a generated curriculum, **When** the user requests a PDF download, **Then** the PDF includes a dedicated Curriculum page (or pages) showing all modules, lessons, durations, and learning outcomes in a structured layout.
2. **Given** a Blueprint does not yet contain a curriculum, **When** the user requests a PDF download, **Then** the PDF omits the Curriculum section or displays a placeholder indicating it has not been generated yet.

---

### Edge Cases

- What happens when the user attempts to generate a curriculum before completing the preceding Program Builder steps (Problems, Program Name, Pricing)?
- How does the system handle insufficient credits when the user tries to generate a curriculum?
- What happens if the AI generation service is temporarily unavailable or returns malformed data?
- How does the frontend display a curriculum when the Blueprint contains an older version with a different data structure?
- What happens when a curriculum contains a very large number of modules or lessons (e.g., 20+ modules)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST add a "Curriculum" sub-step to the Program Builder wizard, positioned immediately after the "Pricing" sub-step.
- **FR-002**: The system MUST expose an API endpoint that accepts the current Blueprint context (niche, audience, problems, program name, pricing) and returns a structured course curriculum.
- **FR-003**: The generated curriculum MUST contain modules, and each module MUST contain lessons with titles, estimated durations, and learning outcomes.
- **FR-004**: The system MUST deduct credits from the user's balance upon successful curriculum generation.
- **FR-005**: The generated curriculum MUST be persisted in the Blueprint state and retrievable on subsequent requests.
- **FR-006**: The frontend MUST display the Curriculum sub-step as an interactive, expandable view where users can browse modules and lessons.
- **FR-007**: The PDF generation service MUST include the curriculum as a dedicated section in the downloadable Blueprint PDF.
- **FR-008**: The system MUST provide mock/dummy curriculum data for frontend development and backend testing when AI services are not available.
- **FR-009**: The system MUST validate that the preceding Program Builder sub-steps (Problems, Program Name, Pricing) are completed before allowing curriculum generation.
- **FR-010**: The system MUST handle and surface clear error messages when curriculum generation fails due to insufficient credits, missing prerequisite data, or service unavailability.

### Key Entities *(include if feature involves data)*

- **Curriculum**: The top-level entity representing the full course structure for a program. Contains a title, description, total estimated duration, and an ordered list of modules.
- **Module**: A major section of the curriculum (e.g., "Module 1: Foundations"). Contains a title, description, order index, total duration, and an ordered list of lessons.
- **Lesson**: The smallest teachable unit within a module. Contains a title, estimated duration (in minutes or hours), learning outcome (what the student will be able to do after completing it), and order index.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can generate a complete curriculum in under 5 seconds after initiating the request (measured from click to rendered result).
- **SC-002**: 100% of generated curricula include at least 3 modules, each with at least 2 lessons, and every lesson has a defined duration and learning outcome.
- **SC-003**: Users can navigate and review the full curriculum structure in the frontend without requiring more than 3 clicks to reach any lesson's details.
- **SC-004**: The downloadable PDF includes a clearly formatted Curriculum section that is visually distinct and readable when printed.
- **SC-005**: The curriculum generation endpoint returns a consistent, validated data structure in 100% of successful requests.

## Assumptions

- Users have already completed the Niche Discovery and Audience Mapping wizard steps before reaching the Program Builder, so the AI has sufficient context to generate a relevant curriculum.
- The credit cost for curriculum generation is set to a reasonable default (e.g., 10 credits), comparable to other AI generation steps.
- Mobile responsiveness for the Curriculum sub-step UI follows the same patterns as existing wizard sub-steps.
- The existing Blueprint state storage mechanism (in-memory Map) is sufficient for persisting curriculum data during the demo/harness phase.
- PDF generation uses the existing placeholder or template system; the Curriculum section is added as an additional page block rather than requiring a complete PDF redesign.
