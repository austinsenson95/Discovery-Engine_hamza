# Tasks: Credits Dashboard & Razorpay Integration

**Input**: Design documents from `/specs/011-credits-razorpay-dashboard/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/payments.md, research.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing project state and install Razorpay SDK

- [X] T001 Verify backend dev server starts cleanly and `npm run typecheck` passes; then install `razorpay` package via `npm install razorpay` in `discovery-engine-backend/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Environment config, database schema, and static data. Must complete before any user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `discovery-engine-backend/src/config/index.ts` with empty defaults
- [X] T003 [P] Create `payment_transactions` table in `discovery-engine-backend/src/db/schema.sql` (or migration file) with fields: `id`, `user_id`, `razorpay_order_id`, `razorpay_payment_id UNIQUE`, `status`, `amount`, `credits_added`, `created_at`
- [X] T004 [P] Add `creditPackages` array to `discovery-engine-backend/src/data/dummyData.ts` with 3 packages (Starter 50/₹499, Growth 100/₹899, Pro 250/₹1,999)
- [X] T005 Update `discovery-engine-backend/.env` template to include `RAZORPAY_KEY_ID=` and `RAZORPAY_KEY_SECRET=`

**Checkpoint**: Foundation ready — Razorpay SDK installed, env vars configured, database table exists, packages defined

---

## Phase 3: User Story 1 - Buy Credits via Razorpay (Priority: P1) 🎯 MVP

**Goal**: End-to-end payment flow — select package, create Razorpay order, open Checkout, verify signature, add credits.

**Independent Test**: Navigate to Profile page, click "Purchase Credits", select a package, complete Razorpay test checkout, verify credits are added and appear in history.

### Implementation for User Story 1

#### Backend (Payment API)

- [X] T006 [P] Implement `razorpayService.ts` in `discovery-engine-backend/src/services/razorpayService.ts` — createOrder, verifySignature, and webhook signature verification
- [X] T007 [P] Implement `paymentController.ts` in `discovery-engine-backend/src/controllers/paymentController.ts` — createOrder, verifyPayment, webhookHandler with idempotency check
- [X] T008 Create `payments.ts` route file in `discovery-engine-backend/src/routes/payments.ts` — routes for GET /packages, POST /create-order, POST /verify, POST /webhook
- [X] T009 Register payments router in `discovery-engine-backend/src/index.ts` under `/api/payments`

#### Frontend (Payment Flow)

- [X] T010 Add `fetchCreditPackages()`, `createPaymentOrder()`, `verifyPayment()` to `app/src/lib/api.ts`
- [X] T011 Create `CreditPurchaseModal.tsx` in `app/src/components/CreditPurchaseModal.tsx` — loads Razorpay Checkout.js, displays packages, handles payment lifecycle, calls `onSuccess` callback
- [X] T012 Enable the "Purchase Credits" button on `app/src/pages/Profile.tsx` and wire it to open `CreditPurchaseModal`
- [X] T013 Wire `UserContext.tsx` to call `refreshCredits()` inside `CreditPurchaseModal` `onSuccess`

**Checkpoint**: User Story 1 is fully functional — credits can be purchased end-to-end via Razorpay

---

## Phase 4: User Story 2 - Credits Management Dashboard (Priority: P1)

**Goal**: Dedicated `/credits` page with balance, transaction history, cost breakdown, and purchase packages.

**Independent Test**: Navigate to `/credits`. Verify balance, history table, cost grid, and package cards are all visible. Purchase a package directly from the dashboard.

### Implementation for User Story 2

- [X] T014 [P] Create `Credits.tsx` page in `app/src/pages/Credits.tsx` with sections: balance hero, transaction history table, AI step cost breakdown grid, purchase package cards
- [X] T015 Add `/credits` route to `app/src/App.tsx` inside the Layout wrapper
- [X] T016 Add "Credits" link to the Sidebar navigation in `app/src/components/Sidebar.tsx`
- [X] T017 Import and use `CreditPurchaseModal` inside `Credits.tsx` for in-page purchases

**Checkpoint**: User Story 2 is fully functional — Credits Dashboard is accessible, displays all data, and supports in-page purchases

---

## Phase 5: User Story 3 - Improved 402 / Out-of-Credits UX (Priority: P2)

**Goal**: Replace generic 402 toast in the Blueprint wizard with a branded purchase modal that auto-retries after payment.

**Independent Test**: Exhaust credits in the Blueprint wizard, trigger an AI step. Verify a branded modal appears, purchase credits, and the wizard auto-retries the step.

### Implementation for User Story 3

- [X] T018 Modify `app/src/pages/Blueprint.tsx` to detect 402 responses from AI generation endpoints and open `CreditPurchaseModal` instead of showing an error toast
- [X] T019 Add auto-retry logic in `app/src/pages/Blueprint.tsx` — after `CreditPurchaseModal` `onSuccess`, retry the failed AI generation step automatically
- [X] T020 Ensure `Blueprint.tsx` preserves wizard state (selections, inputs) when the purchase modal is opened and closed

**Checkpoint**: User Story 3 is fully functional — 402s trigger a purchase modal, payment resumes the wizard seamlessly

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, type safety, and documentation

- [X] T021 [P] Run `cd discovery-engine-backend && npm run typecheck` and fix all TypeScript errors
- [X] T022 [P] Run `cd app && npx tsc --noEmit` and fix all TypeScript errors (pay special attention to `noUnusedLocals` and `noUnusedParameters`)
- [X] T023 Verify all new files follow the project's decorative block comment header pattern
- [X] T024 Update `AGENTS.md` to reflect the new Credits Dashboard and Razorpay payment flow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup. Blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational (T002–T005). Core payment flow.
- **User Story 2 (Phase 4)**: Depends on Foundational and US1 (T011 `CreditPurchaseModal`).
- **User Story 3 (Phase 5)**: Depends on US1 (T011 `CreditPurchaseModal`).
- **Polish (Phase 6)**: Depends on all user stories.

### User Story Dependencies

| Story | Dependencies on Other Stories | Notes |
|-------|------------------------------|-------|
| US1 (P1) | None | Core payment flow; can start after Foundational |
| US2 (P1) | US1 (soft) | Needs `CreditPurchaseModal` from US1; can start in parallel if modal interface is agreed |
| US3 (P2) | US1 | Needs `CreditPurchaseModal` from US1 |

### Within Each User Story

- US1: Backend service → controller → routes → frontend API → modal → Profile wiring
- US2: Page component → route → sidebar → modal integration
- US3: Blueprint error handling → modal integration → auto-retry logic

### Parallel Opportunities

- **Phase 2**: T002 (config), T003 (DB), T004 (dummyData) are fully parallel
- **Phase 3**: T006 (razorpayService) and T010 (api.ts) can be parallel
- **Phase 3**: T007 (controller) depends on T006; T008 (routes) depends on T007
- **Phase 3 + Phase 4**: T014 (Credits.tsx) can be parallel with T006–T009 (backend) if the `CreditPurchaseModal` interface is defined first
- **Phase 5**: T018–T020 are all edits to `Blueprint.tsx` — sequential by nature
- **Phase 6**: T021 (backend typecheck) and T022 (frontend typecheck) are fully parallel

---

## Parallel Example: User Story 1

```bash
# Backend tasks (sequential within backend):
Task: "Implement razorpayService.ts"
Task: "Implement paymentController.ts" (depends on razorpayService)
Task: "Create payments.ts routes" (depends on controller)

# Frontend tasks (parallel with backend):
Task: "Add payment API functions to api.ts"
Task: "Create CreditPurchaseModal.tsx"

# Integration:
Task: "Register payments router in index.ts"
Task: "Wire Profile page to CreditPurchaseModal"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational — env vars, DB table, packages
3. Complete Phase 3: US1 — end-to-end payment flow works
4. **STOP and VALIDATE**: Purchase credits from Profile page, verify balance updates
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Payment flow works → Demo (MVP!)
3. Add US2 → Credits Dashboard → Demo
4. Add US3 → Wizard 402 modal → Demo
5. Polish → Typecheck clean, docs updated

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational together
2. Once Foundational is done:
   - Developer A: US1 — backend service/controller/routes + frontend modal
   - Developer B: US2 — Credits.tsx page + routing
   - Developer C: US3 — Blueprint.tsx 402 handling
3. Merge US1 first (provides `CreditPurchaseModal`)
4. Merge US2 and US3 (both depend on US1)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Total tasks**: 24
- **Tasks per story**: US1 = 8, US2 = 4, US3 = 3
- **MVP scope**: Phase 1 + Phase 2 + Phase 3 (US1 only) = 13 tasks
