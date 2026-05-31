# Implementation Plan: Credits Dashboard & Razorpay Integration

**Branch**: `011-credits-razorpay-dashboard` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-credits-razorpay-dashboard/spec.md`

## Summary

Build a complete monetization layer for the Discovery Engine platform:
1. **Backend**: Integrate Razorpay for credit purchases — create orders, verify payments, handle webhooks, and add credits atomically.
2. **Frontend**: Create a dedicated Credits Dashboard (`/credits`) with balance, transaction history, AI step costs, and purchasable credit packages.
3. **Frontend UX**: Replace the generic 402 toast in the Blueprint wizard with a branded purchase modal that preserves wizard state and auto-retries after payment.
4. **Frontend UX**: Wire the existing disabled "Purchase Credits" button on the Profile page to the new purchase flow.

## Technical Context

**Language/Version**: TypeScript 5.9 (frontend), TypeScript 5.5 (backend), Node.js 18+

**Primary Dependencies**: React 19.2, Express.js 4.19, Razorpay SDK (`razorpay`), better-sqlite3, Tailwind CSS 3.4

**Storage**: SQLite + better-sqlite3 (existing). `credit_transactions` table already exists and supports top-ups.

**Testing**: No test framework installed (acknowledged debt)

**Target Platform**: Web (Chrome, Safari, Firefox) + Node.js backend

**Project Type**: Full-stack web application

**Performance Goals**: Credits Dashboard loads in <2s; payment completes in <5s; 402 modal appears in <1s

**Constraints**: Must preserve the 4-Step Wizard. Must use existing brand palette. Must handle idempotency for Razorpay webhooks.

**Scale/Scope**: Single-user demo/harness phase; in-memory stores acceptable

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| TypeScript Strictness | ✅ PASS | All changes are TypeScript |
| 4-Step Wizard Preservation | ✅ PASS | Purchase modal is additive; no flow disruption |
| Brand Consistency | ✅ PASS | Dashboard uses existing Tailwind + shadcn/ui + brand colors |
| Backend-First Data Persistence | ✅ PASS | Uses existing SQLite `credit_transactions` table |
| Real AI or Nothing | ✅ PASS | No AI changes in this feature |

## Project Structure

### Documentation (this feature)

```text
specs/011-credits-razorpay-dashboard/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── payments.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
app/                          # Frontend
├── src/
│   ├── pages/
│   │   └── Credits.tsx       # NEW: Credits Dashboard page
│   ├── components/
│   │   └── CreditPurchaseModal.tsx  # NEW: Reusable purchase modal (wizard + dashboard)
│   ├── lib/
│   │   └── api.ts            # ADD: createOrder, verifyPayment, fetchCreditPackages
│   ├── App.tsx               # ADD: /credits route
│   └── context/
│       └── UserContext.tsx   # MODIFY: refreshCredits after purchase

discovery-engine-backend/     # Backend
├── src/
│   ├── routes/
│   │   ├── payments.ts       # NEW: POST /create-order, /verify, /webhook
│   │   └── index.ts          # MODIFY: register payments router
│   ├── controllers/
│   │   └── paymentController.ts  # NEW: createOrder, verifyPayment, webhookHandler
│   ├── services/
│   │   ├── razorpayService.ts    # NEW: Razorpay order creation, signature verification
│   │   └── creditService.ts      # MODIFY: addCredits method
│   ├── config/
│   │   └── index.ts              # ADD: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
│   ├── db/
│   │   └── creditRepository.ts   # MODIFY: addTransaction supports 'add' type
│   └── data/
│       └── dummyData.ts          # ADD: creditPackages array
├── package.json              # ADD: razorpay dependency
└── .env                      # ADD: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
```

**Structure Decision**: Standard full-stack addition — new page, new component, new backend service/controller/route trio. No new directories needed beyond the existing structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All gates pass.
