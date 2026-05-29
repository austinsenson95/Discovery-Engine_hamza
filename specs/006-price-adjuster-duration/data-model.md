# Data Model: Price Adjuster and Course Duration Selector

**Feature**: 006-price-adjuster-duration

## Extended Entities

### PricingStrategy (extended)

| Field | Type | Notes |
|---|---|---|
| startingPrice | number | User-adjusted price. Initialized to AI recommendation. |
| aiRecommendedPrice | number? | Original AI recommendation. Optional for backward compatibility. |
| priceJustification | string | Unchanged |
| marketInsight | string | Unchanged |
| milestones | object | Recalculated client-side when price changes |
| priceEvolution | object | Unchanged |
| sweetSpotRange | string | Unchanged |

### Program (extended, nested in Blueprint)

| Field | Type | Notes |
|---|---|---|
| selectedProblems | string[] | Unchanged |
| selectedName | ProgramName | Unchanged |
| pricing | PricingStrategy | Extended with `aiRecommendedPrice` |
| modules | any[] | Unchanged |
| curriculum | CourseCurriculum? | Unchanged |
| duration | CourseDuration? | **NEW** — '4_weeks' \| '8_weeks' \| '12_weeks' |

### CourseDuration (new enum)

```ts
type CourseDuration = '4_weeks' | '8_weeks' | '12_weeks';
```

### Blueprint (no schema changes)

The `program` JSON column already stores all program data. Adding `duration` and `aiRecommendedPrice` to the nested object requires no database migration.

## Duration-to-Curriculum Mapping

| Duration | Modules | Lessons/Module | Total Lessons | Character |
|---|---|---|---|---|
| 4 Weeks | 3-4 | 4-6 | ~16 | Intensive, dense |
| 8 Weeks | 5-6 | 3-4 | ~20 | Standard, balanced |
| 12 Weeks | 8+ | 2-3 | ~24 | Comprehensive, spread |

## Duration-to-Roadmap Mapping

| Duration | Phases | Weeks/Phase | Character |
|---|---|---|---|
| 4 Weeks | 2 | 2 weeks each | Sprint mode |
| 8 Weeks | 3 | 2-3 weeks each | Standard |
| 12 Weeks | 4 | 3 weeks each | Deep-dive |

## Revenue Projection Formula (Client-Side)

```
students10Revenue  = startingPrice * 10
students50Revenue  = startingPrice * 50
students100Revenue = startingPrice * 100
```

## Price Slider Constraints

```
minPrice = max(aiRecommendedPrice * 0.5, 500)  // floor at ₹500
maxPrice = aiRecommendedPrice * 2.0
step     = 100  // increment by ₹100
```
