# Research: PDF Blueprint Generation

**Date**: 2026-05-28
**Feature**: PDF Blueprint Generation

## Unknowns Resolved

### 1. PDF Generation Library Selection

**Decision**: Use `puppeteer-core` (not full `puppeteer`) to avoid automatic Chromium download.

**Rationale**:
- Full `puppeteer` downloads ~170 MB of Chromium on `npm install`, which is slow and unnecessary for development environments that already have Chrome.
- `puppeteer-core` is the same API without the bundled browser. We provide the browser executable path via `PUPPETEER_EXECUTABLE_PATH` env var or use `@sparticuz/chromium` for serverless deployments.
- Alternative `jsPDF` was rejected because it cannot render Google Fonts or complex CSS layouts reliably. HTML-to-PDF via Puppeteer is the only approach that guarantees pixel-perfect brand styling.
- Alternative `pdfmake` was rejected because it uses a declarative JSON DSL, making brand-styled templates verbose and hard to maintain.
- Alternative `@react-pdf/renderer` was rejected because it requires React as a server dependency and has limited CSS support compared to a real browser engine.

**Alternatives considered**: jsPDF, pdfmake, @react-pdf/renderer, Playwright

### 2. Chromium Provisioning Strategy

**Decision**: Support three Chromium sources in priority order:
1. `PUPPETEER_EXECUTABLE_PATH` environment variable (local dev with installed Chrome/Edge)
2. System default via `puppeteer.executablePath()` fallback
3. `@sparticuz/chromium` for serverless/Docker environments (optional dependency)

**Rationale**: The project is in demo/harness phase running locally. Developers likely have Chrome installed. The env var approach is zero-config for most users while remaining flexible for deployment.

### 3. Template Engine Approach

**Decision**: Use native JavaScript template literals with a lightweight `compileTemplate()` helper rather than a full template engine like Handlebars or EJS.

**Rationale**:
- The template is internal, not user-editable. No need for sandboxing or complex logic.
- TypeScript template literals preserve type safety when injecting blueprint data.
- Fewer dependencies align with the constitution's simplicity principle.
- Each section (cover, persona, program, roadmap, next-steps) is a separate `.html` partial file that gets concatenated into a master template.

**Template structure**:
```
templates/pdf/
  blueprint.html   → HTML shell with <head> (Google Fonts, inline CSS)
  cover.html       → Partial: logo + niche title + date
  persona.html     → Partial: demographics + pain points + desires
  program.html     → Partial: name + pricing strategy
  roadmap.html     → Partial: 12-week timeline
  next-steps.html  → Partial: actionable guidance
```

The `templateEngine.ts` service reads each partial, replaces `{{placeholder}}` tokens with blueprint data, and assembles the final HTML string.

### 4. PDF Caching Strategy

**Decision**: In-memory `Map<string, { buffer: Buffer; timestamp: number }>` with 1-hour TTL.

**Rationale**:
- Blueprints are immutable once completed (status = 'completed'). Re-rendering the same PDF is pure waste.
- A 5-page PDF buffer is ~100–300 KB. Even 1000 cached PDFs = ~300 MB max, well within Node.js heap limits for demo scale.
- TTL prevents unbounded growth if blueprints are edited (though current flow doesn't allow editing).
- SQLite persistence is not suitable for binary blobs at this scale; file system cache would require cleanup jobs. In-memory is simplest and fastest.

**Cache eviction**: LRU-style manual cleanup on each `get()` call — delete entries older than 1 hour.

### 5. Frontend PDF Download Handling

**Decision**: Use `fetch()` with `response.blob()` to enable a loading state, then trigger download via `URL.createObjectURL()`.

**Rationale**:
- The current `window.open()` approach does not allow the frontend to detect when the download starts or fails.
- Fetching as a blob lets us show a spinner during generation (2–5 seconds) and handle errors gracefully (e.g., 404, 500).
- The download filename can be set client-side via `download` attribute on a temporary `<a>` tag.

## Decisions Summary

| Decision | Choice | Rejected Alternatives |
|---|---|---|
| PDF engine | puppeteer-core | jsPDF, pdfmake, @react-pdf/renderer |
| Chromium source | env var / system Chrome / @sparticuz/chromium | Bundled puppeteer Chromium |
| Templating | Native template literals + partial files | Handlebars, EJS |
| Cache | In-memory Map with 1h TTL | File system, Redis, SQLite BLOB |
| Frontend download | fetch(blob) + object URL | window.open() |
