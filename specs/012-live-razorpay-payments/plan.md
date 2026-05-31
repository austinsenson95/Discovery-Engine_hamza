# Implementation Plan: Live Razorpay Payment Integration

**Branch**: `012-live-razorpay-payments` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-live-razorpay-payments/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Fix the Razorpay payment integration to work end-to-end: repair webhook signature verification by using raw request body parsing, add strict schema validation for all payment endpoints, support test mode for safe validation, and ensure the credit system is fully live with proper transaction tracking. The frontend CreditPurchaseModal and Credits page are already built; this plan focuses on backend reliability, schema correctness, and testability.

## Technical Context

**Language/Version**: TypeScript 5.5 (backend), TypeScript 5.9 (frontend), Node.js 18+

**Primary Dependencies**: Express.js 4.19, React 19.2, Razorpay SDK 2.9.6, better-sqlite3, Tailwind CSS 3.4.19, Framer Motion 12

**Storage**: SQLite via better-sqlite3 (`discovery-engine-backend/data/discovery-engine.db`)

**Testing**: No test framework installed yet (acknowledged debt; manual end-to-end testing via Razorpay test mode)

**Target Platform**: Web (Chrome/Firefox/Safari + Node.js server)

**Project Type**: Web application (full-stack React frontend + Express backend)

**Performance Goals**: Payment checkout end-to-end under 60 seconds; webhook processing under 5 seconds; credit balance update visible to user within 1 second of payment confirmation

**Constraints**: TypeScript strict mode (`strict: true` backend, `noUnusedLocals`/`noUnusedParameters` frontend); no new dependencies beyond Razorpay SDK (already installed); must preserve existing SQLite schema; webhook endpoint must not use `express.json()` middleware

**Scale/Scope**: Single-user demo/harness phase. All auth is mocked (single dummy user). In-memory stores deprecated in favor of SQLite.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. TypeScript Strictness | ✅ Pass | All changes in TS, strict mode enforced. No `@ts-ignore` anticipated. |
| II. 4-Step Wizard Sacred | ✅ Pass | Payment system enhances wizard via 402 → CreditPurchaseModal flow. No wizard steps modified. |
| III. Brand Consistency | ✅ Pass | No new UI surfaces. Existing modal and Credits page reused. |
| IV. Backend-First Persistence | ✅ Pass | Payment and credit transactions already use SQLite. No in-memory stores touched. |
| V. Real AI or Nothing | ➖ N/A | This feature does not involve AI generation. |

**Result**: All gates pass. No complexity tracking required.

### Post-Design Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. TypeScript Strictness | ✅ Pass | All proposed changes use strict types. Zod schemas add runtime validation alongside compile-time safety. |
| II. 4-Step Wizard Sacred | ✅ Pass | Design only touches payment routes and webhook handling. Wizard routes unchanged. |
| III. Brand Consistency | ✅ Pass | No UI changes proposed beyond toast/error message copy. |
| IV. Backend-First Persistence | ✅ Pass | All payment state stored in SQLite. Idempotency enforced at DB level via UNIQUE constraint. |
| V. Real AI or Nothing | ➖ N/A | No AI features in scope. |

**Result**: All gates still pass post-design.

## Project Structure

### Documentation (this feature)

```text
specs/012-live-razorpay-payments/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit-tasks)
```

### Source Code (repository root)

```text
discovery-engine-backend/
├── src/
│   ├── index.ts              # Express app setup (webhook raw body middleware)
│   ├── config/
│   │   └── index.ts          # Env validation (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
│   ├── controllers/
│   │   └── paymentController.ts  # Fixed webhook handler, schema validation
│   ├── services/
│   │   ├── razorpayService.ts    # Already implemented (lazy singleton)
│   │   └── creditService.ts      # Already implemented (SQLite-backed)
│   ├── routes/
│   │   └── payments.ts           # Route definitions
│   ├── db/
│   │   ├── index.ts              # DB connection + schema
│   │   ├── paymentRepository.ts  # Payment transaction CRUD
│   │   └── creditRepository.ts   # Credit transaction CRUD
│   └── middleware/
│       └── validateRequest.ts    # Extend for payment schema validation

app/
├── src/
│   ├── pages/
│   │   └── Credits.tsx           # Already implemented (cost breakdown fix needed)
│   ├── components/
│   │   └── CreditPurchaseModal.tsx  # Already implemented (test mode awareness)
│   ├── lib/
│   │   └── api.ts                # Payment API functions (already wired)
│   └── types/
│       └── index.ts              # Shared types (PaymentTransaction, CreditPackage)
```

**Structure Decision**: Option 2 — Full-stack web application. Backend handles Razorpay integration, webhook processing, and SQLite persistence. Frontend handles checkout modal and credits dashboard. Both already exist; this plan focuses on fixing and hardening the backend integration.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. This section intentionally left blank.
