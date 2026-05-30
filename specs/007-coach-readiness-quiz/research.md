# Research: Coach Readiness Quiz — Pre-Blueprint Assessment

**Feature**: Coach Readiness Quiz  
**Date**: 2026-05-29  
**Plan**: [plan.md](./plan.md)

## Decision: No External Research Required

All technical patterns for this feature are established in the codebase:

- **Component Pattern**: React functional components with Framer Motion animations
- **Styling Pattern**: Tailwind CSS utility classes with shadcn/ui components
- **API Pattern**: Express controller → service → response with credit meta
- **State Persistence**: Blueprint JSON stored in SQLite via `better-sqlite3`
- **Credit Deduction**: `creditService.deductCredits(userId, action)` with `CreditDeductions` type
- **PDF Generation**: HTML template partials rendered server-side via `templateEngine.ts`
- **AI Prompt Pattern**: Dummy data context appended to LLM service prompts

## Quiz Scoring Algorithm

**Raw Score Calculation**:
```
rawScore = sum(answer[i]) for i = 0 to 4
range: 5 (all 1s) to 20 (all 4s)
```

**Mapped Score & Persona**:
| Raw Score | Out of 10 | Persona | Tone for AI |
|-----------|-----------|---------|-------------|
| 5–8 | 3/10 | Early Explorer | Conservative, foundational, patient |
| 9–12 | 5/10 | Building Momentum | Encouraging, step-by-step, structured |
| 13–16 | 7.5/10 | Almost Ready | Confident, accelerated, action-oriented |
| 17–20 | 9/10 | Launch-Ready | Aggressive, premium, high-ticket focus |

**Weakest Area Identification**:
```
weakestIndex = indexOf(min(answer[i]))
weakestArea = categories[weakestIndex]
categories = ['niche_clarity', 'time_commitment', 'financial_runway', 'sales_comfort', 'existing_assets']
```

**Personalized Action Tips** (based on weakest area):
- `niche_clarity` → "Focus on niche clarity first"
- `time_commitment` → "Block dedicated hours before starting"
- `financial_runway` → "Plan a financial safety net"
- `sales_comfort` → "Work on sales mindset and scripts"
- `existing_assets` → "Start building your personal brand now"

## Alternatives Considered

| Alternative | Evaluated | Rejected Because |
|---|---|---|
| Store quiz as a separate database table | Yes | Over-engineering for demo phase; quiz is intrinsically part of a Blueprint and fits naturally in the existing JSON field |
| Use a state machine for quiz flow | Yes | Over-engineering; 5 linear questions don't need complex state management |
| Client-side-only quiz (no backend persistence) | Yes | Would prevent quiz data from feeding into AI generation and PDF personalization |
| Allow unlimited retakes | Yes | Spec explicitly limits to one retake to prevent credit gaming |

## Open Questions Resolved

1. **Credit cost for quiz**: Set to 5 credits (lower than AI generation steps, comparable to program naming/pricing).
2. **Quiz position in wizard**: After roadmap generation (Step 4a), before PDF download / call booking (Step 4d).
3. **Retake logic**: One retake allowed, overwriting previous result. Credits deducted on each submission.
4. **AI prompt integration**: Quiz context appended as a structured block to the existing roadmap/PDF generation prompt in `llmService.ts`.
