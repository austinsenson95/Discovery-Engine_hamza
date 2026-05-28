# Feature Specification: PDF Blueprint Generation

**Feature Branch**: `001-pdf-blueprint-generation`

**Created**: 2026-05-28

**Status**: Draft

**Input**: User description: "Generate a downloadable PDF blueprint that summarizes the user's complete coaching business plan. The PDF must include: (1) a branded cover page with the Discovery Engine logo and user's selected niche, (2) a summary of the audience persona with demographics, pain points, and desires, (3) the chosen program name and pricing strategy, (4) a visual 12-week roadmap with weekly milestones and deliverables, and (5) a final 'Your Next Steps' action page. The PDF must use the brand colors: primary orange #F05A28, black #0A0A0A headings, gray #4A4A4A body text, and DM Serif Display for headlines. The user triggers PDF generation at the final wizard step (Step 4) after the roadmap is generated. The existing backend has a placeholder GET /api/blueprint/pdf/:id endpoint and a pdfService.ts that returns a mock buffer — both must be replaced with real implementation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate and Download Complete Blueprint PDF (Priority: P1)

A coach who has completed all four steps of the blueprint wizard wants to download a professionally formatted PDF document that captures their entire coaching business plan. After generating the 12-week roadmap in Step 4, they click a "Download My Blueprint" button. The system produces a branded, multi-page PDF and initiates a file download.

**Why this priority**: This is the core deliverable of the entire Discovery Engine platform — the tangible output that coaches can reference, share, and act upon. Without it, the wizard has no meaningful endpoint.

**Independent Test**: Can be fully tested by completing the blueprint wizard through Step 4, clicking the download button, and verifying that a branded PDF file is downloaded containing all five required sections.

**Acceptance Scenarios**:

1. **Given** a user has completed all four wizard steps and generated a roadmap, **When** they click the download button, **Then** the system generates a PDF and the browser initiates a file download within 5 seconds.
2. **Given** a user triggers PDF generation, **When** the PDF is created, **Then** it contains exactly five pages/sections in the correct order: cover page, audience persona, program details, 12-week roadmap, and next steps.
3. **Given** a generated PDF blueprint, **When** viewed in any standard PDF reader, **Then** all text is selectable, images render clearly, and the layout is consistent across pages.

---

### User Story 2 - View Branded Cover Page (Priority: P2)

A user opens their downloaded blueprint and sees a professional cover page that establishes trust and brand recognition. The cover prominently displays the Discovery Engine logo, the user's selected niche as the document title, and the generation date.

**Why this priority**: The cover page sets the tone for the entire document and reinforces brand identity. It transforms a generic document into a professional business asset.

**Independent Test**: Can be tested by generating a PDF and verifying that the first page displays the logo, niche title, and date with correct brand styling.

**Acceptance Scenarios**:

1. **Given** a user has selected a niche during the wizard, **When** the PDF is generated, **Then** the cover page displays the Discovery Engine logo at the top and the user's exact niche name as the main title.
2. **Given** a generated cover page, **When** viewed, **Then** it uses the primary brand color for accent elements and the specified headline typeface for the title.

---

### User Story 3 - Reference Visual 12-Week Roadmap (Priority: P2)

A user flips to the roadmap section of their blueprint and sees a clear, visual timeline showing all 12 weeks of their launch plan. Each week displays its milestone, key deliverables, and objectives in an easy-to-scan layout.

**Why this priority**: The roadmap is the most complex data visualization in the blueprint and the primary action-oriented content. Users will reference this page repeatedly during their launch.

**Independent Test**: Can be tested by generating a PDF with a 12-week roadmap and verifying that all 12 weeks are visible, correctly ordered, and include milestone titles and deliverable descriptions.

**Acceptance Scenarios**:

1. **Given** a generated 12-week roadmap, **When** viewed in the PDF, **Then** all 12 weeks are displayed sequentially with each week's number, phase name, milestone, and deliverables clearly separated.
2. **Given** the roadmap section, **When** printed on standard letter/A4 paper, **Then** all content remains legible and no text is cut off at page boundaries.

---

### Edge Cases

- What happens when a user attempts to download a PDF before completing all wizard steps?
- How does the system handle PDF generation if the user's blueprint data is incomplete or partially missing?
- What happens if PDF generation fails due to a server error — is the user informed with a clear message?
- How does the system handle very long niche names, program names, or roadmap deliverables that may overflow layout boundaries?
- What happens when multiple users request PDF generation simultaneously?
- How are special characters in user-generated content (niche names, persona descriptions) handled in the PDF?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST generate a downloadable PDF file when the user triggers download at the final wizard step.
- **FR-002**: The PDF MUST contain a branded cover page as the first page, including the Discovery Engine logo, the user's selected niche title, and the generation date.
- **FR-003**: The PDF MUST include an audience persona summary page containing demographics, pain points, and desires collected during the wizard.
- **FR-004**: The PDF MUST include a program details page showing the chosen program name and pricing strategy.
- **FR-005**: The PDF MUST include a visual 12-week roadmap page displaying weekly milestones and deliverables in sequential order.
- **FR-006**: The PDF MUST include a final "Your Next Steps" action page with actionable guidance for the user to begin implementing their plan.
- **FR-007**: The PDF MUST use the established brand color palette: primary orange (#F05A28) for accent elements, black (#0A0A0A) for headings, and gray (#4A4A4A) for body text.
- **FR-008**: The PDF MUST use DM Serif Display (or a compatible serif typeface) for headline text.
- **FR-009**: The system MUST replace the existing placeholder PDF endpoint with a fully functional endpoint that returns a real PDF document.
- **FR-010**: The system MUST replace the existing mock PDF service with a real implementation that constructs the PDF from the user's blueprint data.
- **FR-011**: The PDF generation endpoint MUST accept a blueprint identifier and retrieve the corresponding user's completed wizard data.
- **FR-012**: The system MUST return the PDF with appropriate file headers so the browser initiates a download rather than displaying the file inline.
- **FR-013**: The generated PDF filename SHOULD include the user's niche name for easy identification (e.g., "Discovery-Engine-Blueprint-[Niche].pdf").
- **FR-014**: If PDF generation fails, the system MUST return an error response with a user-friendly message instead of a server error.

### Key Entities *(include if feature involves data)*

- **Blueprint**: The user's complete coaching business plan, comprising all data collected across the four wizard steps.
- **Niche**: The user's selected coaching niche, displayed prominently on the cover page.
- **Audience Persona**: Demographics, pain points, and desires generated during Step 2 of the wizard.
- **Program**: The coaching program definition, including name and pricing strategy from Step 3.
- **Roadmap**: A structured 12-week launch timeline with weekly milestones and deliverables from Step 4.
- **PDF Document**: The generated output file combining all blueprint components into a branded, downloadable format.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can generate and download their complete blueprint PDF within 5 seconds of clicking the download button.
- **SC-002**: 100% of generated PDFs contain all five required sections in the correct order.
- **SC-003**: The PDF renders consistently across major PDF viewers (Adobe Acrobat, Preview, Chrome PDF viewer, Firefox PDF viewer) without layout breakage.
- **SC-004**: All user-generated content (niche names, persona text, program descriptions, roadmap items) is preserved accurately in the PDF without truncation or data loss.
- **SC-005**: Users report the blueprint PDF as "professional and on-brand" in qualitative feedback.
- **SC-006**: The PDF download endpoint returns a valid PDF file (correct MIME type and file structure) for every successful request.

## Assumptions

- Users have completed all four wizard steps before attempting to download the PDF.
- The user's blueprint data is stored and retrievable by a unique identifier at the time of PDF generation.
- The Discovery Engine logo asset is available in a format suitable for embedding into a PDF document.
- PDF generation is performed server-side to ensure consistent output quality and layout.
- Standard letter or A4 page size is sufficient for all blueprint content.
- The DM Serif Display typeface can be embedded or referenced within the PDF output.
- Users have a PDF viewer installed on their device to open the downloaded file.
