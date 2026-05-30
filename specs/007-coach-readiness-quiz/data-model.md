# Data Model: Coach Readiness Quiz — Pre-Blueprint Assessment

**Feature**: Coach Readiness Quiz  
**Date**: 2026-05-29  
**Plan**: [plan.md](./plan.md)

## Entities

### QuizOption

A single multiple-choice option for a quiz question.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Option identifier (e.g., "A", "B", "C", "D") |
| `text` | `string` | Yes | Human-readable option text |
| `points` | `number` | Yes | Point value (1–4) |

---

### QuizQuestion

A single readiness quiz question.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Question identifier (e.g., "q1", "q2") |
| `category` | `string` | Yes | Category slug: `niche_clarity`, `time_commitment`, `financial_runway`, `sales_comfort`, `existing_assets` |
| `question` | `string` | Yes | Question text |
| `options` | `QuizOption[]` | Yes | 4 multiple-choice options |

---

### ReadinessQuiz

The result of a completed quiz, stored in the Blueprint.

| Field | Type | Required | Description |
|---|---|---|---|
| `answers` | `number[]` | Yes | Selected option indices per question, e.g., `[0, 2, 1, 3, 2]` |
| `rawScore` | `number` | Yes | Sum of points, range 5–20 |
| `score` | `number` | Yes | Mapped score out of 10 (3, 5, 7.5, or 9) |
| `persona` | `string` | Yes | Readiness label: "Early Explorer", "Building Momentum", "Almost Ready", "Launch-Ready" |
| `weakestArea` | `string` | Yes | Category slug of the question with the lowest answer |
| `actionTips` | `string[]` | Yes | 3 personalized action bullets based on weakest area |
| `completedAt` | `Date` | Yes | Timestamp of quiz submission |
| `retakeCount` | `number` | No | Number of times the quiz has been retaken (default 0, max 1) |

---

### Blueprint (updated)

The `Blueprint` type is extended to include the quiz result:

```typescript
interface Blueprint {
  // ... existing fields ...
  program?: {
    selectedProblems: string[];
    selectedName: ProgramName;
    pricing: PricingStrategy;
    modules: any[];
    curriculum?: CourseCurriculum;
    duration?: CourseDuration;
  };
  roadmap?: {
    phases: RoadmapPhase[];
    pdfUrl: string;
    completedAt?: Date;
  };
  readinessQuiz?: ReadinessQuiz;  // ← NEW
}
```

---

### CreditDeductions (updated)

The `CreditDeductions` type is extended with the quiz action:

```typescript
interface CreditDeductions {
  niche: number;
  audience: number;
  program: number;
  pricing: number;
  curriculum: number;
  roadmap: number;
  quiz: number;  // ← NEW (default: 5)
}
```

## JSON Storage Format

In SQLite, the quiz result is stored as a JSON object within the `blueprints` row:

```json
{
  "readinessQuiz": {
    "answers": [3, 2, 1, 3, 2],
    "rawScore": 11,
    "score": 5,
    "persona": "Building Momentum",
    "weakestArea": "financial_runway",
    "actionTips": [
      "Plan a financial safety net",
      "Focus on low-cost launch strategies",
      "Consider starting with a side-hustle model"
    ],
    "completedAt": "2026-05-29T10:00:00.000Z",
    "retakeCount": 0
  }
}
```

## Relationships

```
Blueprint ──1:1──→ ReadinessQuiz (optional, via readinessQuiz field)
ReadinessQuiz ──references──→ QuizQuestion (via answer indices)
```
