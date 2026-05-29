# Data Model: Course Curriculum Generation

**Feature**: Course Curriculum Generation  
**Date**: 2026-05-29  
**Plan**: [plan.md](./plan.md)

## Entities

### CurriculumLesson

The smallest teachable unit within a module.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique identifier (e.g., `les_001`) |
| `title` | `string` | Yes | Lesson title |
| `duration` | `string` | No | Estimated duration (e.g., "25 min", "1.5 hrs") |
| `learningOutcome` | `string` | No | What the student will be able to do after completing this lesson |

**Validation Rules**:
- `id` must be non-empty and unique within the curriculum
- `title` must be non-empty
- `duration` should follow a human-readable format (e.g., "15 min", "1 hr 30 min")
- `learningOutcome` should be a single, actionable sentence

---

### CurriculumModule

A major section of the curriculum containing related lessons.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique identifier (e.g., `mod_foundation`) |
| `title` | `string` | Yes | Module title (e.g., "Module 1: Foundations") |
| `subtitle` | `string` | No | Brief descriptive subtitle |
| `description` | `string` | No | Longer module description |
| `lessons` | `CurriculumLesson[]` | Yes | Ordered list of lessons |
| `output` | `string` | No | Tangible deliverable or result upon completing the module |

**Validation Rules**:
- `id` must be non-empty and unique within the curriculum
- `title` must be non-empty
- `lessons` must contain at least 1 lesson
- `lessons` array order defines the sequence

---

### CourseCurriculum

The top-level entity representing the full course structure.

| Field | Type | Required | Description |
|---|---|---|---|
| `modules` | `CurriculumModule[]` | Yes | Ordered list of modules |
| `totalLessons` | `number` | Yes | Computed count of all lessons across all modules |
| `totalDuration` | `string` | Yes | Human-readable total duration (e.g., "12 weeks", "40 hours") |

**Validation Rules**:
- `modules` must contain at least 1 module
- `totalLessons` must equal the sum of lessons across all modules
- `totalDuration` should be a human-readable string

---

### Blueprint (updated `program` field)

The `program` field within `Blueprint` is extended to include the generated curriculum.

```typescript
interface Blueprint {
  // ... existing fields ...
  program?: {
    selectedProblems: string[];
    selectedName: ProgramName;
    pricing: PricingStrategy;
    modules: ModuleItem[];
    curriculum?: CourseCurriculum;  // ← NEW
  };
}
```

**State Transitions**:
1. `program.curriculum` is `undefined` when Pricing is complete but curriculum has not been generated.
2. `program.curriculum` is populated after `POST /api/blueprint/curriculum` succeeds.
3. `program.curriculum` persists across Blueprint fetches and page refreshes.

## Relationships

```
Blueprint ──1:1──→ CourseCurriculum (via program.curriculum)
CourseCurriculum ──1:N──→ CurriculumModule
CurriculumModule ──1:N──→ CurriculumLesson
```

## JSON Storage Format

In SQLite, the curriculum is stored as a JSON object within the `blueprints.program` column:

```json
{
  "selectedProblems": ["..."],
  "selectedName": { "id": "...", "name": "...", "description": "...", "isAiRecommended": true },
  "pricing": { "startingPrice": 15000, ... },
  "modules": [...],
  "curriculum": {
    "modules": [
      {
        "id": "mod_1",
        "title": "Module 1: Foundations",
        "subtitle": "Building the base",
        "lessons": [
          { "id": "les_1", "title": "Lesson 1", "duration": "25 min", "learningOutcome": "Define your niche clearly" }
        ],
        "output": "A defined niche statement"
      }
    ],
    "totalLessons": 1,
    "totalDuration": "25 min"
  }
}
```
