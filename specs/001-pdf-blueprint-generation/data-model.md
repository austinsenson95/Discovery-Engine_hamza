# Data Model: PDF Blueprint Generation

**Date**: 2026-05-28
**Feature**: PDF Blueprint Generation

## Entities

### Blueprint (Existing — extended context)

The central aggregate. All PDF content is derived from this entity.

| Field | Type | Source |
|---|---|---|
| `id` | string | Primary key |
| `userId` | string | Foreign key to User |
| `status` | `'in_progress' \| 'completed'` | Wizard completion state |
| `currentStep` | number | 1–7 |
| `progress` | number | 0–100 |
| `niche` | JSON | `{ selectedNiche: NicheOption, skills, experience, passions }` |
| `audience` | JSON | `{ persona: Persona }` |
| `program` | JSON | `{ selectedProblems, selectedName: ProgramName, pricing: PricingStrategy, modules }` |
| `roadmap` | JSON | `{ phases: RoadmapPhase[], pdfUrl, completedAt }` |
| `createdAt` | Date | — |
| `updatedAt` | Date | — |

**Validation rules for PDF generation**:
- `status` MUST be `'completed'` or `currentStep` MUST be `>= 7` before allowing PDF download.
- `niche.selectedNiche.name` MUST be present for the cover page.
- `audience.persona` MUST be present for the persona page.
- `program.selectedName.name` and `program.pricing` MUST be present for the program page.
- `roadmap.phases` MUST be a non-empty array for the roadmap page.

### PDF Cache Entry (New — in-memory only)

| Field | Type | Description |
|---|---|---|
| `blueprintId` | string | Key (matches Blueprint.id) |
| `buffer` | Buffer | Raw PDF bytes |
| `timestamp` | number | Unix ms when cached |

**State transitions**:
```
[Cache Miss] → generate HTML → render PDF → store in Map
[Cache Hit (TTL valid)] → return cached buffer
[Cache Hit (TTL expired)] → regenerate → update Map
[Blueprint updated] → invalidate cache entry
```

### NicheOption (Existing — used in PDF)

| Field | Type | PDF Usage |
|---|---|---|
| `name` | string | Cover page title |
| `whoYouHelp` | string | Optional cover subtitle |
| `problemSolved` | string | Optional context |
| `resultDelivered` | string | Optional context |

### Persona (Existing — used in PDF)

| Field | Type | PDF Usage |
|---|---|---|
| `name` | string | Persona page heading |
| `ageRange` | string | Demographics section |
| `role` | string | Demographics section |
| `location` | string | Demographics section |
| `currentSituation` | string | Demographics section |
| `biggestDesire` | string | Desires section |
| `onlinePlatforms` | string[] | Demographics section |
| `payingCapacity` | string | Demographics section |
| `painPoints` | string[] | Pain points section |
| `goals` | string[] | Desires section |
| `quote` | string | Pull quote / testimonial style |

### ProgramName (Existing — used in PDF)

| Field | Type | PDF Usage |
|---|---|---|
| `name` | string | Program page title |
| `description` | string | Program page subtitle |

### PricingStrategy (Existing — used in PDF)

| Field | Type | PDF Usage |
|---|---|---|
| `startingPrice` | number | Program page highlight |
| `priceJustification` | string | Program page body |
| `marketInsight` | string | Program page body |
| `milestones` | object | Pricing evolution table |
| `priceEvolution` | object | Pricing evolution table |
| `sweetSpotRange` | string | Program page highlight |

### RoadmapPhase (Existing — used in PDF)

| Field | Type | PDF Usage |
|---|---|---|
| `phase` | number | Roadmap section grouping |
| `weeks` | string | Roadmap header (e.g., "Weeks 1–4") |
| `title` | string | Roadmap phase title |
| `color` | string | Roadmap accent color (mapped to brand palette) |
| `items` | `{ week: string; tasks: string[] }[]` | Weekly milestones and deliverables |

## Relationships

```
Blueprint 1──1 PDF Cache Entry (when generated)
Blueprint 1──1 NicheOption (via niche.selectedNiche)
Blueprint 1──1 Persona (via audience.persona)
Blueprint 1──1 ProgramName (via program.selectedName)
Blueprint 1──1 PricingStrategy (via program.pricing)
Blueprint 1──* RoadmapPhase (via roadmap.phases)
```

## Data Flow for PDF Generation

```
User clicks "Download My Blueprint PDF"
  → Frontend: show loading spinner
  → GET /api/blueprint/pdf/:id
    → Controller: validate blueprintId
    → Cache check: Map.has(id) && not expired?
      → YES: return cached Buffer
      → NO:
        → Repository: getBlueprintById(id) from SQLite
        → Validate: all required fields present?
          → NO: 400 Bad Request with missing fields list
          → YES:
            → TemplateEngine: compile HTML partials with blueprint data
            → PDFService: puppeteer-core render HTML → Buffer
            → Cache: store Buffer with timestamp
            → Response: stream Buffer with Content-Type: application/pdf
  → Frontend: hide spinner, trigger blob download
```
