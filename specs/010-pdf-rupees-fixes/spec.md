# Feature Specification: PDF Currency, Label Fixes & Booking Link

**Feature Branch**: `010-pdf-rupees-fixes`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "In the PDF generated output, some of the pricing is in $, this should be changed throughout with rupees. in the pdf in the roadmap section week is being displayed twice and in some other sections as well. embedd the call booking link at the end of generated PDF."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pricing in Indian Rupees (Priority: P1)

As a coach downloading my Blueprint PDF, I want all pricing figures to display in Indian Rupees (₹) instead of US Dollars ($), so that the document is locally relevant and credible for the Indian coaching market.

**Why this priority**: The entire Discovery Engine platform targets the Indian market (personas reference Indian cities, salaries in ₹L, paying capacity in ₹). Displaying $ in the PDF undermines trust and creates confusion.

**Independent Test**: Generate a Blueprint PDF after completing the Pricing step, then open the Program page of the PDF. All price figures — starting price, launch price, revenue milestones, sweet spot range — must show the ₹ symbol. No $ symbols should appear anywhere in the pricing tables or headings.

**Acceptance Scenarios**:

1. **Given** a user has completed the Pricing step with a starting price of ₹4,999, **When** they download the Blueprint PDF, **Then** the Program page displays "₹4,999" as the starting price (not "$4,999").
2. **Given** a user views the Revenue Milestones table in the PDF, **When** they look at the 10 Students row, **Then** the revenue figure displays "₹49,990" (not "$49,990").
3. **Given** a user views the Price Evolution table in the PDF, **When** they look at the Launch row, **Then** the price displays with the ₹ prefix.

---

### User Story 2 - Remove Duplicate "Week" Labels (Priority: P1)

As a coach reviewing my 12-week roadmap in the Blueprint PDF, I want each week to be labeled once (e.g., "Week 1") rather than twice (e.g., "Week Week 1"), so that the document looks professional and polished.

**Why this priority**: Duplicate labels are a visible bug that makes the PDF feel unprofessional and auto-generated. This directly impacts the coach's confidence in sharing the document with peers or mentors.

**Independent Test**: Generate a Blueprint PDF after completing the Roadmap step, then open the Roadmap page. Every week badge should read "Week 1", "Week 2", etc. — never "Week Week 1".

**Acceptance Scenarios**:

1. **Given** a Blueprint contains a 12-week roadmap, **When** the PDF is generated, **Then** each week badge in the roadmap section displays "Week N" exactly once.
2. **Given** a Blueprint contains a 4-week or 8-week roadmap variant, **When** the PDF is generated, **Then** the week badges still display correctly without duplication.
3. **Given** the roadmap data stores week values as "Week 1", "Week 2", etc., **When** the template engine renders the roadmap page, **Then** it does not prepend an additional "Week " to the already-labeled value.

---

### User Story 3 - Embed Call Booking Link (Priority: P2)

As a coach who has completed my Blueprint, I want a clear call-to-action at the end of the PDF to book a strategy call with a coach/mentor, so that I can get personalized guidance on implementing my blueprint.

**Why this priority**: The PDF is the final deliverable of the wizard. Adding a booking link converts the document from a static plan into an actionable next step, increasing user engagement and potential conversion to paid coaching.

**Independent Test**: Generate a Blueprint PDF and scroll to the final page. A call booking CTA should appear with a clickable link (or visible URL for print) that directs to the booking page.

**Acceptance Scenarios**:

1. **Given** a user downloads a completed Blueprint PDF, **When** they view the last page, **Then** a call booking section is visible with a heading like "Book Your Free Strategy Call" and a link/URL.
2. **Given** the call booking link is configured, **When** the PDF is generated, **Then** the link appears as a clickable hyperlink in digital PDF viewers and as a readable URL for printed copies.
3. **Given** the call booking link is not configured (optional), **When** the PDF is generated, **Then** the booking section either shows a default link or is omitted entirely (no broken links).

---

### Edge Cases

- What happens if the pricing data contains a string that already includes a currency symbol (e.g., "₹4,999" or "$4,999")?
- How does the system handle week values stored in different formats ("Week 1" vs "1" vs "W1")?
- What happens if the call booking URL changes after PDFs have already been generated?
- How does the PDF render the ₹ symbol in older PDF readers that may not support Unicode?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All pricing figures in the generated Blueprint PDF MUST display the Indian Rupee symbol (₹) instead of the US Dollar symbol ($).
- **FR-002**: The ₹ symbol MUST appear before the starting price, launch price, and all revenue milestone figures in the Program page of the PDF.
- **FR-003**: The system MUST ensure the ₹ symbol is rendered correctly across digital PDF viewers and print outputs.
- **FR-004**: The roadmap week badges in the PDF MUST display "Week N" exactly once, with no duplication.
- **FR-005**: The template engine MUST handle week values gracefully whether they are stored as "Week 1" or "1".
- **FR-006**: The final page of the generated PDF MUST include a call booking section with a visible link/URL.
- **FR-007**: The call booking link MUST be configurable via an environment variable (e.g., `BOOKING_LINK`) with a sensible default.
- **FR-008**: The call booking section MUST be styled consistently with the existing PDF brand (orange accent, DM Serif Display headings).

### Key Entities *(include if feature involves data)*

- **PDF Template (`program.html`)**: Contains the pricing table markup; the `$` symbol is hard-coded in the HTML.
- **PDF Template (`roadmap.html` + `templateEngine.ts`)**: The roadmap page is assembled dynamically in `templateEngine.ts` where the duplicate "Week" label is generated.
- **PDF Template (`next-steps.html`)**: The closing page where the call booking CTA will be embedded.
- **Environment Config**: `BOOKING_LINK` env variable for the configurable call booking URL.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of pricing figures in the PDF Program page use the ₹ symbol; 0 instances of $ appear.
- **SC-002**: 100% of roadmap week badges in generated PDFs display "Week N" without duplication.
- **SC-003**: 100% of completed Blueprint PDFs include the call booking link on the final page.
- **SC-004**: The call booking link is configurable without requiring a code deployment (via environment variable).

## Assumptions

- The existing Puppeteer-based PDF generation pipeline renders Unicode symbols correctly (₹ is a standard Unicode character).
- The call booking link points to an external scheduling tool (e.g., Calendly, Cal.com) and does not require authentication.
- PDF templates are edited directly (HTML partials) rather than migrating to a new templating engine.
