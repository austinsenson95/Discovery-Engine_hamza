# Feature Specification: Coach Readiness Quiz — Pre-Blueprint Assessment

**Feature Branch**: `007-coach-readiness-quiz`

**Created**: 2026-05-29

**Status**: Draft

**Input**: User description: "Feature: Coach Readiness Quiz — Pre-Blueprint Assessment. Add a 5-question Coach Readiness Quiz to the DISCOVERY ENGINE blueprint wizard. The quiz appears after the 12-week roadmap is generated and before the user sees the call-booking link and PDF download button. The quiz score (out of 10) is displayed to the user, and the full quiz responses are appended to the blueprint context sent to Claude during the final roadmap + PDF generation step. This gives Claude richer context about the user's preparedness, mindset, and constraints — resulting in a more accurate, personalized, and actionable PDF blueprint."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete the Coach Readiness Quiz (Priority: P1)

As a coach who has just generated my 12-week roadmap, I want to answer a short readiness quiz so that the platform understands my current preparedness level and can personalize my blueprint and action plan accordingly.

**Why this priority**: This is the core value of the feature — collecting structured readiness data that feeds back into the blueprint personalization. Without this, the AI lacks critical context about the user's constraints (time, finances, sales comfort, assets).

**Independent Test**: Can be fully tested by completing the first 4 wizard steps, generating the roadmap, and then answering all 5 quiz questions. The system should calculate a score, assign a readiness persona, and present personalized action tips.

**Acceptance Scenarios**:

1. **Given** a user has completed the roadmap generation step, **When** the quiz is presented, **Then** 5 questions are displayed with 4 multiple-choice options each, and the user can select one option per question.
2. **Given** a user answers all 5 quiz questions, **When** they submit the quiz, **Then** the appropriate number of credits is deducted, the quiz result is persisted, and the user sees their score, persona label, and personalized action plan.
3. **Given** a user is viewing the quiz, **When** they attempt to skip it and proceed to the PDF download or call booking, **Then** they are blocked and prompted to complete the quiz first.

---

### User Story 2 - View Personalized Quiz Results (Priority: P2)

As a coach who has completed the readiness quiz, I want to see an animated score reveal with a persona label and personalized tips, so that I understand my strengths and weakest area and know exactly what to focus on first.

**Why this priority**: The score reveal is the moment of insight for the user. It transforms raw quiz data into an actionable, motivating summary that builds trust in the platform's personalization.

**Independent Test**: Can be fully tested by submitting a completed quiz with known answers and verifying the calculated score, persona label, and the 3-bullet action plan match the expected output for those answers.

**Acceptance Scenarios**:

1. **Given** a user submits the quiz with a raw score of 17–20, **When** the results are displayed, **Then** they see a score of 9/10, the persona "Launch-Ready", and action tips tailored to their weakest question.
2. **Given** a user submits the quiz with a raw score of 5–8, **When** the results are displayed, **Then** they see a score of 3/10, the persona "Early Explorer", and conservative, foundational action tips.
3. **Given** a user views their quiz results, **When** they look at the action plan, **Then** the 3 bullets explicitly address their weakest question area (niche clarity, time commitment, financial runway, sales comfort, or existing assets).

---

### User Story 3 - Quiz Data Enhances Blueprint Personalization (Priority: P3)

As a coach downloading my final Blueprint PDF, I want the roadmap, tone, and action items to reflect my readiness level and weakest area, so that the advice feels relevant and realistic for my situation.

**Why this priority**: This is the ultimate value proposition — the quiz data directly improves the quality of the deliverable. A low-readiness user should not receive aggressive launch tactics, and a high-readiness user should not be bored with foundational advice.

**Independent Test**: Can be fully tested by comparing two PDFs generated from identical blueprints but different quiz scores (one low, one high) and verifying that the tone, urgency, and Week 1 tasks differ accordingly.

**Acceptance Scenarios**:

1. **Given** a user with a low readiness score (< 5/10), **When** the PDF is generated, **Then** the roadmap emphasizes foundational steps, conservative timelines, and explicit guidance on the weakest area in Week 1 tasks.
2. **Given** a user with a high readiness score (> 7/10), **When** the PDF is generated, **Then** the roadmap emphasizes acceleration, premium pricing, and aggressive launch tactics.
3. **Given** a user's weakest area is "sales comfort", **When** the PDF is generated, **Then** Week 1 tasks explicitly address sales mindset and scripts.

---

### Edge Cases

- What happens if the user refreshes the page mid-quiz?
- What happens if the AI generation service fails after the quiz is submitted — is the quiz data still persisted?
- What happens if the user retakes the quiz — does the new result overwrite the old one, and are credits deducted again?
- How does the quiz behave on a slow network connection?
- What happens if the user answers questions inconsistently (e.g., high niche clarity but no assets)?
- How does the system handle partial quiz submissions (e.g., only 3 of 5 questions answered)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present a 5-question Coach Readiness Quiz after the 12-week roadmap is generated and before the PDF download or call-booking link is shown.
- **FR-002**: Each quiz question MUST have exactly 4 multiple-choice options (A, B, C, D), scored from 1 to 4 points.
- **FR-003**: The system MUST calculate a raw score (sum of all answers, range 5–20) and map it to a score out of 10 with a corresponding readiness persona.
- **FR-004**: The persona mapping MUST be: 5–8 raw → 3/10 "Early Explorer"; 9–12 raw → 5/10 "Building Momentum"; 13–16 raw → 7.5/10 "Almost Ready"; 17–20 raw → 9/10 "Launch-Ready".
- **FR-005**: The system MUST identify the user's weakest question (lowest individual answer) and generate a 3-bullet personalized action plan addressing that area.
- **FR-006**: The quiz MUST be mandatory — users cannot access the PDF download or call-booking link without completing it.
- **FR-007**: The system MUST allow users to retake the quiz exactly once, overwriting the previous result.
- **FR-008**: The system MUST deduct credits from the user's balance upon successful quiz submission.
- **FR-009**: The quiz result (answers, score, persona, weakest area) MUST be persisted in the Blueprint state and included in the context sent to the AI during roadmap and PDF generation.
- **FR-010**: The AI-generated roadmap and PDF MUST tailor their tone, urgency, and action items based on the readiness score and weakest area.
- **FR-011**: The quiz UI MUST display one question at a time or all at once with smooth transitions, and MUST be mobile-responsive.
- **FR-012**: The quiz result UI MUST display an animated score reveal, a persona badge, and the personalized 3-bullet action plan.

### Key Entities *(include if feature involves data)*

- **QuizQuestion**: Represents a single readiness question. Contains: question text, 4 options (each with text and point value), and question category.
- **ReadinessQuiz**: The top-level quiz result entity. Contains: an ordered array of answer selections, computed score (out of 10), persona label, weakest area category, and timestamp.
- **QuizAnswer**: A single user selection. Contains: question index, selected option index, and points earned.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the 5-question quiz in under 2 minutes.
- **SC-002**: 100% of submitted quizzes produce a correct score and persona mapping (verified against manual calculation).
- **SC-003**: 100% of submitted quizzes correctly identify the weakest question and generate actionable tips for that area.
- **SC-004**: Users with a low readiness score (< 5/10) receive a PDF with conservative, foundation-first language; users with a high score (> 7/10) receive aggressive, acceleration-focused language.
- **SC-005**: 0% of users can access the PDF download or call-booking link without first completing the quiz.

## Assumptions

- Users have already completed Steps 1–3 of the Blueprint wizard before reaching the quiz, so they have niche, audience, and program data.
- The quiz is positioned within Step 4 (Roadmap & PDF) as an intermediate sub-step.
- Credit cost for the quiz is set to a reasonable default (e.g., 5 credits), lower than AI generation steps.
- The AI service (Claude) can accept and interpret the quiz context block appended to its prompt.
- Mobile responsiveness follows the same patterns as existing wizard sub-steps.
- The existing Blueprint state storage mechanism is sufficient for persisting quiz results during the demo/harness phase.
