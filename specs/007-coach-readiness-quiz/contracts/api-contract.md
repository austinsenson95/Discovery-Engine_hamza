# API Contract: Coach Readiness Quiz

**Feature**: Coach Readiness Quiz  
**Date**: 2026-05-29  
**Plan**: [plan.md](./plan.md)

## Endpoint

### POST /api/blueprint/quiz

Submit the Coach Readiness Quiz answers, calculate the result, persist it, and deduct credits.

#### Request

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "answers": [3, 2, 1, 3, 2]
}
```

- `answers`: An array of 5 integers (0–3), representing the selected option index for each question.

#### Response

**Success — 200 OK**

```json
{
  "success": true,
  "data": {
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
  },
  "message": "Quiz submitted successfully",
  "meta": {
    "creditsDeducted": 5,
    "remainingCredits": 75,
    "processingTime": 450
  }
}
```

**Error — 400 Bad Request**

```json
{
  "success": false,
  "message": "Invalid quiz submission. Expected 5 answers with values 0–3."
}
```

**Error — 402 Payment Required**

```json
{
  "success": false,
  "message": "Insufficient credits. Quiz submission requires 5 credits."
}
```

**Error — 409 Conflict**

```json
{
  "success": false,
  "message": "Quiz retake limit reached. You can only retake the quiz once."
}
```

**Error — 500 Internal Server Error**

```json
{
  "success": false,
  "message": "Failed to process quiz. Please try again later."
}
```

#### Preconditions

1. User must be authenticated.
2. User must have an active Blueprint.
3. The Blueprint must have a generated roadmap (`roadmap.phases` is non-empty).
4. User must have at least 5 credits.
5. If a quiz already exists, `retakeCount` must be less than 1.

#### Side Effects

1. Credits deducted: 5 credits subtracted from user's balance.
2. Blueprint updated: `readinessQuiz` is populated with computed result.
3. Activity logged: A credit transaction record is created.

---

## Related Endpoints

### GET /api/blueprint

Returns the full Blueprint including `readinessQuiz` if it has been submitted.

```json
{
  "success": true,
  "data": {
    "id": "bp_123",
    "roadmap": { "..." },
    "readinessQuiz": { "..." }
  }
}
```

### GET /api/blueprint/pdf/:id

Generates and downloads the Blueprint PDF. If `readinessQuiz` exists, the PDF includes a dedicated Readiness Quiz section.
