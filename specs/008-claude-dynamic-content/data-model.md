# Data Model: Dynamic AI Content Generation

**Date**: 2026-05-30

## Entity Changes

### Blueprint (existing entity — field additions)

The `Blueprint` type already exists in both frontend (`app/src/types/index.ts`) and backend (`discovery-engine-backend/src/types/index.ts`). This feature adds one new optional field to the `program` object.

```typescript
interface Blueprint {
  // ... existing fields ...
  program?: {
    selectedProblems: string[];
    generatedProblems?: string[];  // NEW: AI-generated problem pool
    selectedName: ProgramName;
    pricing: PricingStrategy;
    modules: ModuleItem[];
    curriculum?: CourseCurriculum;
    duration?: CourseDuration;
  };
  // ... rest of fields ...
}
```

**Field**: `generatedProblems?: string[]`
- **Purpose**: Stores the AI-generated pool of 6–8 problems from which the user selects
- **Optional**: Yes (absent before problem generation step is completed)
- **Persistence**: Stored as JSON in the `blueprints.program` column (SQLite)
- **Validation**: Array of non-empty strings; max length 12; min length 4

### CreditDeductions (existing entity — entry addition)

```typescript
interface CreditDeductions {
  niche: number;      // 10
  audience: number;   // 10
  program: number;    // 5  (program naming)
  pricing: number;    // 5
  problems: number;   // NEW: 5 (problem generation)
  curriculum: number; // 10
  roadmap: number;    // 15
  quiz: number;       // 5
}
```

## State Transitions

### Problem Generation Flow

```
[Blueprint with niche + persona]
        |
        v
POST /api/blueprint/generate-problems
        |
        v
[Credit check: >= 5 credits?]
    |--- No ---> 402 Insufficient Credits
    |
    Yes
    |
    v
[Claude API call with niche + persona context]
    |--- Error ---> 500/502 AI Service Error (explicit)
    |
    Success
    |
    v
[Store generatedProblems in blueprint.program]
[Deduct 5 credits]
[Return problems + meta]
```

### Curriculum Generation Flow (updated)

```
[Blueprint with niche + persona + problems + program name + pricing + duration]
        |
        v
POST /api/blueprint/curriculum
        |
        v
[Credit check: >= 10 credits?]
    |--- No ---> 402 Insufficient Credits
    |
    Yes
    |
    v
[Claude API call with full context]
    |--- Error ---> 500/502 AI Service Error (explicit)
    |
    Success
    |
    v
[Store curriculum in blueprint.program]
[Deduct 10 credits]
[Return curriculum + meta]
```

## Validation Rules

1. **Prerequisite check** (`FR-010`): Before problem generation, the blueprint MUST have:
   - `niche.selectedNiche` present
   - `audience.persona` present
   - If missing, return 400 Bad Request with message: "Please complete Niche Discovery and Audience Mapping before generating problems."

2. **Generated problems format**:
   - Each problem string: 20–200 characters
   - Total count: 6–8 items
   - No duplicates (case-insensitive comparison)
   - No empty strings

3. **Credit balance**:
   - Problem generation: 5 credits
   - Insufficient credits: 402 status with user-friendly message
