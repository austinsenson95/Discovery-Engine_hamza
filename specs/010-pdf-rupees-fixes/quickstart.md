# Quickstart: PDF Currency, Label Fixes & Booking Link

**Date**: 2026-05-30

## Prerequisites

- Node.js 18+ installed
- Backend dev server can start
- A completed Blueprint with pricing, roadmap, and next steps data

## Start Development Server

```bash
cd discovery-engine-backend
npm run dev
# Server runs on http://localhost:3001
```

## Test the Feature

### 1. Verify ₹ Currency Symbol

1. Complete the Blueprint wizard through the Pricing step (or use existing dummy data)
2. Trigger PDF generation via `POST /api/blueprint/roadmap`
3. Download the PDF via `GET /api/blueprint/pdf/:id`
4. Open the Program page of the PDF
5. **Expected**: All pricing figures show `₹` (e.g., "₹4,999"). No `$` symbols anywhere.

### 2. Verify Fixed Week Labels

1. Open the Roadmap page of the generated PDF
2. **Expected**: Week badges read "Week 1", "Week 2", etc. — never "Week Week 1"
3. Verify for 4-week, 8-week, and 12-week roadmap variants

### 3. Verify Call Booking Link

1. Open the last page (Next Steps) of the generated PDF
2. **Expected**: A booking CTA section appears with text like "Book Your Free Strategy Call" and a clickable link
3. **Default link**: `https://discoveryengine.app/book`

### 4. Verify Configurable Booking Link

1. Set `BOOKING_LINK=https://calendly.com/your-link` in `.env`
2. Restart the backend server
3. Generate a new PDF
4. **Expected**: The booking link in the PDF points to your Calendly URL

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| ₹ symbol shows as □ or ? | Font doesn't support Unicode | Verify Puppeteer has access to system fonts; ₹ is in most modern fonts |
| Week labels still duplicated | Old cached PDF | Clear PDF cache or generate a fresh blueprint |
| Booking link missing | `BOOKING_LINK` not set and default not applied | Check `config/index.ts` has fallback value; restart server |
| PDF generation fails | Template syntax error | Run `npm run typecheck` to catch TypeScript errors |

## Verify Changes

```bash
# Backend type-check
cd discovery-engine-backend && npm run typecheck

# Generate a test PDF (requires a blueprint ID)
curl -X POST http://localhost:3001/api/blueprint/roadmap
curl -o test.pdf http://localhost:3001/api/blueprint/pdf/YOUR_BLUEPRINT_ID
```
