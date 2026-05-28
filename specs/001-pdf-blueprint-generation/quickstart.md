# Quickstart: PDF Blueprint Generation

**Date**: 2026-05-28

## Prerequisites

- Node.js 18+ installed
- Chrome, Chromium, or Edge browser installed locally (for puppeteer-core)
- Backend dependencies installed (`cd discovery-engine-backend && npm install`)
- Frontend dependencies installed (`cd app && npm install`)
- SQLite database initialized (`discovery-engine-backend/data/discovery-engine.db` exists)

## Environment Variables

Add to `discovery-engine-backend/.env`:

```env
# Chromium executable path (optional — defaults to system Chrome)
# macOS example:
PUPPETEER_EXECUTABLE_PATH=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
# Linux example:
# PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
# Windows example:
# PUPPETEER_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

## Installation

### 1. Install puppeteer-core

```bash
cd discovery-engine-backend
npm install puppeteer-core
```

### 2. (Optional) Install @sparticuz/chromium for serverless

```bash
cd discovery-engine-backend
npm install @sparticuz/chromium
```

### 3. Create template directory

```bash
mkdir -p discovery-engine-backend/src/templates/pdf
```

## Running the Feature

### Start the Backend

```bash
cd discovery-engine-backend
npm run dev
```

Server starts on `http://localhost:3001`.

### Start the Frontend

```bash
cd app
npm run dev
```

Frontend starts on `http://localhost:3000`.

### Test PDF Generation

1. Complete all 4 wizard steps in the UI (or use existing seeded blueprint data).
2. On Step 4 "Roadmap & PDF", click **"Download My Blueprint PDF"**.
3. A loading spinner appears for 2–5 seconds.
4. The browser downloads a PDF file named `Discovery-Engine-Blueprint-[Niche].pdf`.
5. Open the PDF and verify all 5 sections render correctly with brand colors and DM Serif Display font.

### Test the API Directly

```bash
# Replace bp_xxx with an actual blueprint ID
curl -o test-blueprint.pdf http://localhost:3001/api/blueprint/pdf/bp_xxx

# Verify it's a valid PDF
file test-blueprint.pdf
# Expected: test-blueprint.pdf: PDF document, version 1.4
```

## Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| `Error: Could not find Chrome` | `PUPPETEER_EXECUTABLE_PATH` not set and no system Chrome found | Install Chrome or set the env var |
| PDF has no DM Serif Display font | Google Fonts failed to load | Check network access; font falls back to serif |
| `400 Bad Request — Incomplete Blueprint` | Blueprint missing required data | Complete all wizard steps before downloading |
| `500 Error — PDF generation failed` | Puppeteer crash or timeout | Check backend logs; ensure sufficient memory |
| Download starts but file is corrupted | Content-Type mismatch | Verify backend sends `application/pdf` |
