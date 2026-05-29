# API Contract: Course Curriculum Generation

**Feature**: Course Curriculum Generation  
**Date**: 2026-05-29  
**Plan**: [plan.md](./plan.md)

## Endpoint

### POST /api/blueprint/curriculum

Generate a structured course curriculum for the current Blueprint.

#### Request

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**: No request body required. The curriculum is generated from the existing Blueprint context (niche, audience, program name, pricing, selected problems).

#### Response

**Success — 200 OK**

```json
{
  "success": true,
  "data": {
    "curriculum": {
      "modules": [
        {
          "id": "mod_foundation",
          "title": "Module 1: Foundation",
          "subtitle": "Build your coaching foundation",
          "description": "In this module, you will establish...",
          "lessons": [
            {
              "id": "les_001",
              "title": "Defining Your Niche",
              "duration": "25 min",
              "learningOutcome": "Articulate a clear, profitable coaching niche statement"
            },
            {
              "id": "les_002",
              "title": "Understanding Your Audience",
              "duration": "30 min",
              "learningOutcome": "Create a detailed ideal client persona"
            }
          ],
          "output": "A defined niche and ideal client profile"
        }
      ],
      "totalLessons": 2,
      "totalDuration": "55 min"
    }
  },
  "message": "Course curriculum generated successfully",
  "meta": {
    "creditsDeducted": 10,
    "remainingCredits": 80,
    "processingTime": 2150
  }
}
```

**Error — 400 Bad Request**

```json
{
  "success": false,
  "message": "Pricing strategy must be completed before generating a curriculum"
}
```

**Error — 402 Payment Required**

```json
{
  "success": false,
  "message": "Insufficient credits. Curriculum generation requires 10 credits."
}
```

**Error — 500 Internal Server Error**

```json
{
  "success": false,
  "message": "Failed to generate curriculum. Please try again later."
}
```

#### Preconditions

1. User must be authenticated.
2. User must have an active Blueprint.
3. The Blueprint must have completed the preceding Program Builder sub-steps:
   - Problem selection (`program.selectedProblems` is non-empty)
   - Program naming (`program.selectedName` is set)
   - Pricing strategy (`program.pricing` is set)
4. User must have at least 10 credits.

#### Side Effects

1. Credits deducted: 10 credits subtracted from user's balance.
2. Blueprint updated: `program.curriculum` is populated with the generated curriculum.
3. Activity logged: A credit transaction record is created.

---

## Related Endpoints

### GET /api/blueprint

Returns the full Blueprint including `program.curriculum` if it has been generated.

```json
{
  "success": true,
  "data": {
    "id": "bp_123",
    "program": {
      "selectedProblems": ["..."],
      "selectedName": { "..." },
      "pricing": { "..." },
      "modules": [],
      "curriculum": { "..." }
    }
  }
}
```

### GET /api/blueprint/pdf/:id

Generates and downloads the Blueprint PDF. If `program.curriculum` exists, the PDF includes a dedicated Curriculum page.
