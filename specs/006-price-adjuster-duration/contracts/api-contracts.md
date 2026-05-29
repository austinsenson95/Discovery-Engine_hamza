# API Contracts: Price Adjuster and Course Duration Selector

**Feature**: 006-price-adjuster-duration

## Modified Endpoints

### POST /api/blueprint/pricing

**Change**: Response now includes `aiRecommendedPrice` alongside `startingPrice`.

**Response**:
```json
{
  "success": true,
  "data": {
    "pricing": {
      "startingPrice": 4999,
      "aiRecommendedPrice": 4999,
      "priceJustification": "...",
      "marketInsight": "...",
      "milestones": { "students10": 49990, "students50": 249950, "students100": 499900 },
      "priceEvolution": { "launch": 4999, "after10Students": "₹9,999 - ₹14,999", "premiumTier": "₹24,999 - ₹34,999" },
      "sweetSpotRange": "₹2,999 - ₹4,999"
    }
  }
}
```

---

### POST /api/blueprint/curriculum

**Change**: Accepts optional `duration` in request body. Returns curriculum adapted to duration.

**Request**:
```json
{
  "duration": "8_weeks"
}
```

**Response**: Unchanged shape, but `modules` count and `totalDuration` adapted to selected duration.

---

### POST /api/blueprint/roadmap

**Change**: Accepts optional `duration` in request body. Returns roadmap phases adapted to duration.

**Request**:
```json
{
  "duration": "8_weeks"
}
```

**Response**: Unchanged shape, but `phases` count and `weeks` labels adapted to selected duration.

## Type Changes

### Frontend: `app/src/types/index.ts`

```ts
export interface PricingStrategy {
  startingPrice: number;
  aiRecommendedPrice?: number;  // ← ADD
  priceJustification: string;
  marketInsight: string;
  milestones: { students10: number; students50: number; students100: number };
  priceEvolution: { launch: number; after10Students: string; premiumTier: string };
  sweetSpotRange: string;
}

export type CourseDuration = '4_weeks' | '8_weeks' | '12_weeks';  // ← ADD

export interface Blueprint {
  // ... existing fields ...
  program?: {
    selectedProblems: string[];
    selectedName: ProgramName;
    pricing: PricingStrategy;
    modules: any[];
    curriculum?: CourseCurriculum;
    duration?: CourseDuration;  // ← ADD
  };
}
```

### Backend: `discovery-engine-backend/src/types/index.ts`

Same changes as frontend to keep types aligned.
