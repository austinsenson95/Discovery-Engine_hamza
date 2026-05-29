# Data Model: Dashboard and Journey Blueprint Integration

**Feature**: 005-dashboard-journey-wiring

## Entities

### Blueprint (existing, no schema changes)

The central aggregate. Already stored in SQLite `blueprints` table with JSON-serialized nested columns.

| Field | Type | Source |
|---|---|---|
| id | string | SQLite primary key |
| userId | string | foreign key to users |
| status | 'draft' \| 'in_progress' \| 'completed' | updated by frontend + backend |
| currentStep | number (1-8) | frontend sets; backend must not overwrite ahead |
| progress | number (0-100) | derived from currentStep mapping |
| niche | JSON | `{ selectedNiche, skills, experience, passions, domains }` |
| audience | JSON | `{ persona }` |
| program | JSON | `{ selectedProblems, selectedName, pricing, curriculum }` |
| roadmap | JSON | `{ phases, pdfUrl }` |
| createdAt | ISO date string | auto-set |
| updatedAt | ISO date string | auto-updated |

### ActivityItem (frontend type alignment required)

Log entries for user actions. Stored in SQLite `activities` table.

| Field | Type | Notes |
|---|---|---|
| id | string | UUID |
| userId | string | foreign key |
| blueprintId | string? | optional link to blueprint |
| title | string | e.g. "Niche Discovery Completed" |
| description | string? | optional detail |
| type | enum | 'blueprint' \| 'niche' \| 'audience' \| 'program' \| 'roadmap' \| 'credit' |
| createdAt | Date | **frontend must rename from `timestamp` to `createdAt`** |

### User (existing, no schema changes)

| Field | Type | Notes |
|---|---|---|
| id | string | UUID |
| email | string | |
| name | string | displayed in Dashboard welcome, Sidebar, Navbar |
| avatar | string? | URL or null |
| credits | number | in-memory only; resets on restart |
| language | 'english' \| 'hindi' | |

## State Transitions

### Wizard Step → currentStep Mapping

| Frontend View | currentStep | progress |
|---|---|---|
| Niche Discovery (form) | 1 | 0 |
| Niche Discovery (results) | 2 | 10 |
| Audience Mapping | 3 | 20 |
| Problem Selection | 4 | 35 |
| Program Naming | 5 | 45 |
| Pricing Strategy | 6 | 55 |
| Curriculum | 6 (subStep 4) | 65 |
| Roadmap | 7 | 80 |
| PDF Downloaded | 8 | 100 |

### Activity Type Mapping

| User Action | Activity Type | Title |
|---|---|---|
| Blueprint created | blueprint | Blueprint Created |
| Niche form submitted | niche | Niche Discovery Completed |
| Persona generated | audience | Audience Persona Generated |
| Problems confirmed | program | Problems Selected |
| Program name chosen | program | Program Name Selected |
| Pricing generated | program | Pricing Strategy Set |
| Curriculum built | program | Curriculum Generated |
| Roadmap generated | roadmap | Roadmap Generated |
| PDF downloaded | blueprint | Blueprint PDF Downloaded |
| Credits deducted | credit | Credits Used |

## Derived View Models

### DashboardStats (computed in Home.tsx from latest Blueprint)

```
progress: blueprint.progress
currentStepLabel: mapStepToLabel(blueprint.currentStep)
creditsUsed: computeFromCurrentStep(blueprint.currentStep)
status: blueprint.status
latestBlueprintTitle: blueprint.niche?.selectedNiche?.name || 'Untitled Blueprint'
```

### JourneyTimelineStep (computed in Journey.tsx from latest Blueprint)

```
For each wizard step i in [1, 2, 3, 4]:
  status =
    blueprint.currentStep > stepEnd(i)  → 'completed'
    blueprint.currentStep within stepRange(i) → 'in_progress'
    else → 'upcoming'
  timestamp =
    'completed' → blueprint.updatedAt (approximate)
    'in_progress' → 'Started on {blueprint.updatedAt}'
    'upcoming' → 'Complete previous step to unlock'
```

### Achievement (computed in Journey.tsx from latest Blueprint)

| Achievement | Earned Condition |
|---|---|
| First Steps | blueprint.currentStep >= 2 |
| Niche Master | blueprint.currentStep >= 3 |
| Audience Builder | blueprint.currentStep >= 4 |
| Program Architect | blueprint.currentStep >= 6 |
| Pricing Pro | blueprint.currentStep >= 6 && blueprint.program?.pricing != null |
| Curriculum Creator | blueprint.program?.curriculum != null |
| Roadmap Planner | blueprint.currentStep >= 7 |
| Blueprint Master | blueprint.status === 'completed' |
