# API Contracts: Dynamic AI Content Generation

**Date**: 2026-05-30

## New Endpoint

### POST /api/blueprint/generate-problems

Generate AI-powered audience problems based on the current blueprint's niche and persona.

**Request Body**: None (uses current blueprint state from storage)

**Response — Success (200)**:
```json
{
  "success": true,
  "data": {
    "problems": [
      "Feeling stuck in corporate with no clear exit strategy or timeline",
      "Having expertise but no idea how to package it into a sellable coaching offer",
      "Overwhelmed by conflicting advice from generic online business gurus",
      "Fear of losing financial stability by leaving a well-paying corporate job",
      "Not knowing how to find the first paying clients without spending on ads",
      "Struggling with imposter syndrome about being a coach",
      "Lack of a structured framework to transition from employee to entrepreneur",
      "Difficulty balancing a full-time job with building a coaching business"
    ]
  },
  "meta": {
    "creditsDeducted": 5,
    "remainingCredits": 85,
    "processingTime": 2150
  }
}
```

**Response — Error (400 — Prerequisites Missing)**:
```json
{
  "success": false,
  "message": "Please complete Niche Discovery and Audience Mapping before generating problems."
}
```

**Response — Error (402 — Insufficient Credits)**:
```json
{
  "success": false,
  "message": "Insufficient credits. Please top up your credits to continue."
}
```

**Response — Error (500/502 — AI Service Failure)**:
```json
{
  "success": false,
  "message": "AI service temporarily unavailable. Please try again in a moment."
}
```

---

## Modified Endpoints (Error Behavior Change)

All existing AI generation endpoints now return explicit errors instead of silently falling back to dummy data when the Claude API fails.

### Affected Endpoints

| Endpoint | Previous Behavior | New Behavior |
|----------|-------------------|--------------|
| `POST /api/blueprint/niche` | Silent fallback to dummyNiches | 500/502 error on Claude failure |
| `POST /api/blueprint/audience` | Silent fallback to dummyPersona | 500/502 error on Claude failure |
| `POST /api/blueprint/program-name` | Silent fallback to dummyProgramNames | 500/502 error on Claude failure |
| `POST /api/blueprint/pricing` | Silent fallback to dummyPricing | 500/502 error on Claude failure |
| `POST /api/blueprint/curriculum` | Silent fallback to dummyCurriculum | 500/502 error on Claude failure |
| `POST /api/blueprint/roadmap` | Silent fallback to dummyRoadmap | 500/502 error on Claude failure |

### Standard Error Response Shape

All AI generation endpoints now return this shape on service failure:

```json
{
  "success": false,
  "message": "AI generation failed: [specific reason]. Please try again."
}
```

HTTP status codes:
- `500` — Claude API error, timeout, or malformed response
- `502` — Claude API unreachable (network/connection error)
- `503` — Rate limited by Claude API (retry-after header optional)

---

## Frontend API Functions

### New Function

```typescript
// app/src/lib/api.ts

export const generateProblems = async (): Promise<{ problems: string[]; creditsDeducted: number }> => {
  const res = await fetchJson<{
    data: { problems: string[] };
    meta?: { creditsDeducted?: number; remainingCredits?: number };
  }>('/blueprint/generate-problems', { method: 'POST' });
  return { problems: res.data.problems, creditsDeducted: res.meta?.creditsDeducted ?? 5 };
};
```

### Modified Function

```typescript
// app/src/lib/api.ts

// BEFORE: Returns hardcoded mock data with simulated delay
export const fetchProblems = async (): Promise<string[]> => {
  await new Promise(r => setTimeout(r, 800));
  return [
    'Feeling stuck in their career with no clear direction',
    // ... 5 more hardcoded items
  ];
};

// AFTER: Removed entirely. Replaced by generateProblems() above.
// The Blueprint.tsx component calls generateProblems() instead.
```

---

## Claude Prompt Contract

### Problem Generation Prompt

**System Prompt** (`SYSTEM_PROMPT_PROBLEMS`):
```
You are an expert coaching business strategist. Your job is to identify the specific, actionable problems that a target audience faces in a given coaching niche.

Return ONLY a valid JSON object with this exact shape:
{
  "problems": [
    "Problem statement 1",
    "Problem statement 2",
    "Problem statement 3",
    "Problem statement 4",
    "Problem statement 5",
    "Problem statement 6",
    "Problem statement 7",
    "Problem statement 8"
  ]
}

Rules:
- Generate exactly 8 problems.
- Each problem should be a specific, actionable statement (not vague or generic).
- Problems should reflect the real struggles of the target audience in this niche.
- Problems should be suitable for a coaching program to solve.
- Do NOT wrap the JSON in markdown code blocks.
```

**User Prompt**:
```
Generate 8 specific problems for coaches in the "{nicheName}" niche.

Target persona details:
- Name: {personaName}
- Role: {personaRole}
- Age: {personaAgeRange}
- Location: {personaLocation}
- Current situation: {personaCurrentSituation}
- Biggest desire: {personaBiggestDesire}
- Existing pain points: {personaPainPoints.join(', ')}
- Goals: {personaGoals.join(', ')}

Return the result as a JSON object with a "problems" array.
```
