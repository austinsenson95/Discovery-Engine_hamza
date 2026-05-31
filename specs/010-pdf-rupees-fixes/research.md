# Research: PDF Currency, Label Fixes & Booking Link

**Date**: 2026-05-30

## Unknowns Resolved

### 1. Where exactly are the `$` symbols hard-coded?

**Decision**: The `$` symbol appears in `templates/pdf/program.html` in 5 locations:
- Line 14: Starting Price display: `${{startingPrice}}`
- Line 42: Launch Price table cell: `${{launchPrice}}`
- Line 68: Revenue 10 Students: `${{revenue10}}`
- Line 72: Revenue 50 Students: `${{revenue50}}`
- Line 76: Revenue 100 Students: `${{revenue100}}`

**Rationale**: The `$` is literal text in the HTML template, not injected by the template engine. Replacing each `$` with `₹` is the correct fix.

**Alternatives considered**:
- Add a `{{currency}}` token — rejected as over-engineering; the platform is exclusively Indian-market and will not support multiple currencies in the near term.
- Strip currency symbols in templateEngine.ts and inject via code — rejected; the template is the right place for presentation concerns and the fix is simpler there.

### 2. Why is "Week" duplicated?

**Decision**: In `services/templateEngine.ts` `buildRoadmapPage` (line 196), the code constructs:
```html
<span class="badge">Week ${item.week}</span>
```
But `item.week` already contains values like `"Week 1"`, `"Week 2"`, etc. (from `dummyData.ts` and the LLM-generated roadmap). This produces `"Week Week 1"`.

**Fix**: Change to `<span class="badge">${item.week}</span>` so the badge displays exactly what the data contains.

**Rationale**: The data already includes the "Week " prefix. The template engine should not add it again.

**Alternatives considered**:
- Strip "Week " from data before passing to template engine — rejected; would require modifying data generation and dummyData.ts, affecting other consumers.
- Use regex to detect and handle both formats — rejected; simply using the data value directly is cleaner and more robust.

### 3. Where and how to embed the call booking link?

**Decision**: Add a `{{bookingLink}}` token to `templates/pdf/next-steps.html` and replace it in `templateEngine.ts` `buildNextStepsPage`.

**Booking link source**: Read from environment variable `BOOKING_LINK` with a sensible default (e.g., `https://discoveryengine.app/book`).

**Placement**: Replace the existing static CTA bar at the bottom of `next-steps.html` with a branded booking CTA section.

**Rationale**: The Next Steps page is already the final page of the PDF. Adding the booking CTA there keeps the document flow natural.

**Alternatives considered**:
- Add a new dedicated page after Next Steps — rejected; would increase PDF length and feel like an ad rather than a natural conclusion.
- Store booking link in Blueprint state — rejected; it's global config, not per-blueprint data.

## Research Findings

### Puppeteer Unicode Rendering

The ₹ symbol (U+20B9) is a standard Unicode character supported by:
- All modern PDF readers (Adobe Acrobat, Preview, Chrome PDF viewer)
- Puppeteer's default font stack (system fonts on the host machine)
- The PDF's embedded CSS font-family (`'DM Serif Display', serif`)

No special font configuration is needed.

### Environment Variable Pattern

The backend already uses `dotenv` + `config/index.ts` for environment variables. Adding `BOOKING_LINK` follows the existing pattern:
```typescript
// config/index.ts
bookingLink: process.env.BOOKING_LINK || 'https://discoveryengine.app/book',
```

### Template Engine Pattern

The template engine uses simple regex replacement:
```typescript
readPartial('next-steps.html')
  .replace(/{{bookingLink}}/g, escapeHtml(config.bookingLink))
```

This is consistent with how all other template variables are handled.
