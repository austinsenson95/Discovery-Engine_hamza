# Tasks: Live Razorpay Payment Integration

**Input**: Design documents from `/specs/012-live-razorpay-payments/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested. Manual end-to-end testing via Razorpay test mode.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Environment Verification)

**Purpose**: Verify existing infrastructure is ready. No new dependencies needed.

- [x] T001 Verify Razorpay SDK is installed in `discovery-engine-backend/package.json` (`razorpay` >= 2.9.6)
- [x] T002 [P] Verify SQLite schema in `discovery-engine-backend/src/db/index.ts` has `payment_transactions` and `credit_transactions` tables with correct columns and indexes
- [x] T003 [P] Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are referenced in `discovery-engine-backend/src/config/index.ts` env validation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core fixes and infrastructure that MUST be complete before user stories can be validated end-to-end.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Implement strict schema validation for payment endpoints in `discovery-engine-backend/src/middleware/validateRequest.ts`: `validateCreateOrderBody()` must check `packageId` is one of `starter`, `growth`, `pro`; `validateVerifyPaymentBody()` must check `orderId`, `paymentId`, `signature` are non-empty strings
- [x] T005 Fix Express middleware order in `discovery-engine-backend/src/index.ts`: Place the webhook route `app.post('/api/payments/webhook', ...)` BEFORE the global `app.use(express.json())` middleware, using `express.raw({ type: 'application/json' })` specifically for the webhook route to capture raw body bytes for signature verification
- [x] T006 [P] Verify `paymentRepository.ts` has idempotency guard: `getByPaymentId()` must return existing record; `create()` must handle UNIQUE constraint violation on `razorpay_payment_id` gracefully
- [x] T007 [P] Verify `creditService.ts` `addCredits()` method is atomic: it must update user balance AND insert credit_transaction in a single DB transaction

**Checkpoint**: Foundation ready — webhook raw body parsing works, schema validation enforces correct inputs, idempotency is protected at DB level.

---

## Phase 3: User Story 1 — Purchase Credits via Razorpay (Priority: P1) 🎯 MVP

**Goal**: End-to-end credit purchase flow works from package selection through checkout to balance update, integrated into Credits page and Blueprint wizard 402 flow.

**Independent Test**: Navigate to Credits page, select Starter package, complete Razorpay test checkout, verify balance increases by 50 credits. Also verify Blueprint wizard shows CreditPurchaseModal on 402 and allows retry after purchase.

### Implementation for User Story 1

- [x] T008 [P] [US1] Add schema validation to `discovery-engine-backend/src/controllers/paymentController.ts` `createOrder` handler: call `validateCreateOrderBody()` before processing, return 400 with clear message for invalid `packageId`
- [x] T009 [P] [US1] Add schema validation to `discovery-engine-backend/src/controllers/paymentController.ts` `verifyPayment` handler: call `validateVerifyPaymentBody()` before processing, return 400 for missing fields
- [x] T010 [US1] Harden `discovery-engine-backend/src/controllers/paymentController.ts` `verifyPayment` handler: check for existing `paymentId` in DB before adding credits; if already `paid`, return 409 with duplicate message; if `failed`/`cancelled`, log warning and return 400
- [x] T011 [US1] Fix frontend cost breakdown in `app/src/pages/Credits.tsx`: Add missing "Curriculum Generation" item with 10 credits cost to match backend cost schedule
- [x] T012 [US1] Verify `app/src/lib/api.ts` payment functions (`getCreditPackages`, `createOrder`, `verifyPayment`) correctly map to backend endpoints and handle 400/402/409/503 errors with toast notifications
- [x] T013 [US1] Verify `app/src/components/CreditPurchaseModal.tsx` loads Razorpay Checkout.js dynamically, passes correct `orderId`, `keyId`, `amount`, `currency`, and `name` to the checkout config
- [x] T014 [US1] Verify `app/src/components/CreditPurchaseModal.tsx` `onSuccess` callback calls `verifyPayment()` API with `orderId`, `paymentId`, `signature`, then refreshes user credits via `useUser()` context and shows success toast
- [x] T015 [US1] End-to-end test: Run frontend (`npm run dev` in app/) and backend (`npm run dev` in discovery-engine-backend/), complete a test payment with card `5267 3181 8797 5449`, verify credits increase and transaction history updates

**Checkpoint**: User Story 1 is fully functional — credit purchase works from both Credits page and Blueprint wizard 402 modal.

---

## Phase 4: User Story 2 — Safe Testing with Razorpay Test Mode (Priority: P2)

**Goal**: Developers and testers can safely validate the payment flow using Razorpay test keys and test cards without processing real money. Payment failures are handled gracefully.

**Independent Test**: Configure backend with test keys (`rzp_test_*`), complete payment with test card, verify no real funds moved. Simulate failure with test failure card and verify error state.

### Implementation for User Story 2

- [x] T016 [US2] Add Razorpay mode detection to `discovery-engine-backend/src/config/index.ts`: expose `isTestMode` boolean derived from `RAZORPAY_KEY_ID` prefix (`rzp_test_` = test mode)
- [x] T017 [US2] Add startup log in `discovery-engine-backend/src/index.ts` that prints whether Razorpay is in TEST or LIVE mode (warn if LIVE during development)
- [x] T018 [US2] Handle payment failure in `app/src/components/CreditPurchaseModal.tsx`: Add `modal.ondismiss` callback that shows "Payment cancelled" toast; Add Razorpay `payment.failed` handler that shows error toast with retry option
- [x] T019 [US2] Add `POST /api/payments/fail` endpoint in `discovery-engine-backend/src/routes/payments.ts` and `paymentController.ts`: Accepts `{ orderId, paymentId, reason }`, updates `payment_transactions` status to `failed` if record exists in `created` state
- [x] T020 [US2] Update `app/src/components/CreditPurchaseModal.tsx` to call `/api/payments/fail` when Razorpay reports `payment.failed`, passing the failure reason
- [x] T021 [US2] Test failure scenario: Use Razorpay test failure card (`4000 0000 0000 0002` for generic decline), verify payment status becomes `failed`, no credits added, user sees retry option

**Checkpoint**: User Story 2 is fully functional — test mode is detectable, failures are tracked, and users can retry.

---

## Phase 5: User Story 3 — Reliable Webhook-Driven Credit Delivery (Priority: P2)

**Goal**: Razorpay webhooks are reliably processed with correct signature verification on raw body, and credits are delivered idempotently even if the frontend verify callback is missed.

**Independent Test**: Complete a payment, verify webhook handler processes it correctly. Simulate duplicate webhook and verify no double credits. Send invalid signature and verify rejection.

### Implementation for User Story 3

- [x] T022 [US3] Fix `discovery-engine-backend/src/controllers/paymentController.ts` `handleWebhook` handler: Use `req.body` as raw Buffer (from `express.raw()` middleware) instead of `JSON.stringify(req.body)` when calling `verifyWebhookSignature()`
- [x] T023 [US3] Harden `discovery-engine-backend/src/controllers/paymentController.ts` `handleWebhook` handler: Extract `payment.entity.id`, `payment.entity.order_id`, `payment.entity.amount` from raw JSON payload using `JSON.parse()` only AFTER signature verification passes
- [x] T024 [US3] Add idempotency logic to webhook handler in `discovery-engine-backend/src/controllers/paymentController.ts`: Check DB for existing `razorpay_payment_id`; if status is `paid`, return 200 immediately; if status is `failed`/`cancelled`, log and return 200 to stop retries
- [x] T025 [US3] Add credit delivery logic to webhook handler: If payment is new and valid, look up the order in `payment_transactions` by `razorpay_order_id`, determine credits from `credits_added` field, call `creditService.addCredits()`, update status to `paid`
- [x] T026 [US3] Ensure webhook handler always returns 200 for successfully processed webhooks (including duplicates) to prevent Razorpay retry loops; only return 400 for invalid signature
- [x] T027 [US3] Test webhook with ngrok: Expose local backend via ngrok, configure webhook URL in Razorpay Dashboard (Test Mode), complete test payment, verify backend logs show `[Payment] Webhook received` and credits added
- [x] T028 [US3] Test webhook idempotency: Send same webhook payload twice (simulate retry), verify second request returns 200 but does not add duplicate credits
- [x] T029 [US3] Test invalid webhook signature: Send webhook with tampered signature, verify backend returns 400 and does not modify credit balance

**Checkpoint**: User Story 3 is fully functional — webhooks verify signatures correctly, deliver credits idempotently, and handle all edge cases.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements that affect reliability, observability, and user experience across all stories.

- [x] T030 [P] Update startup banner in `discovery-engine-backend/src/index.ts` to list payment endpoints (`/api/payments/packages`, `/api/payments/create-order`, `/api/payments/verify`, `/api/payments/webhook`) alongside existing routes
- [x] T031 [P] Add `[Payment]` prefix to all console.log statements in `paymentController.ts` for consistent namespaced logging
- [x] T032 Add type alignment check between `app/src/types/index.ts` and `discovery-engine-backend/src/types/index.ts`: Ensure `PaymentTransaction`, `CreditPackage`, and `CreditTransaction` types match on both sides
- [x] T033 Add `RAZORPAY_WEBHOOK_SECRET` support to `discovery-engine-backend/src/config/index.ts`: If present, use it for webhook signature verification; fall back to `RAZORPAY_KEY_SECRET` for backward compatibility
- [x] T034 Validate quickstart.md: Walk through all 8 steps in `specs/012-live-razorpay-payments/quickstart.md` and confirm each works as documented
- [x] T035 Run TypeScript compilation in both directories: `cd discovery-engine-backend && npm run typecheck` and `cd app && npm run build` — fix any type errors introduced

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — verify existing infrastructure
- **Phase 2 (Foundational)**: Depends on Setup — BLOCKS all user stories
  - T004 (schema validation) and T005 (raw body parsing) are the two critical blocking tasks
- **Phase 3 (US1)**: Depends on Phase 2 — the MVP core flow
- **Phase 4 (US2)**: Depends on Phase 2 — can run in parallel with US1 and US3 if team capacity allows
- **Phase 5 (US3)**: Depends on Phase 2 and US1 (verify flow should work first) — webhook is the backup delivery path
- **Phase 6 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Must complete first. All other stories extend or harden this core flow.
- **User Story 2 (P2)**: Independent of US1 and US3 after Phase 2. Adds test mode awareness and failure handling.
- **User Story 3 (P2)**: Depends on US1's verify flow working (to understand the correct credit delivery logic). Webhook is the fallback path.

### Within Each User Story

- Schema validation before controller changes
- Backend fixes before frontend verification
- Core implementation before end-to-end testing

### Parallel Opportunities

- T008 and T009 (schema validation for create-order and verify) can run in parallel
- T016, T017, T031 (config/logging improvements) can run in parallel
- T022, T023, T024 (webhook handler fixes) must be sequential but are independent of frontend work
- US2 and US3 can be developed in parallel after Phase 2 completes

---

## Parallel Example: User Story 1

```bash
# Launch schema validation tasks together:
Task: "T008 [P] [US1] Add schema validation to paymentController.ts createOrder handler"
Task: "T009 [P] [US1] Add schema validation to paymentController.ts verifyPayment handler"

# Launch frontend verification tasks together:
Task: "T011 [P] [US1] Fix frontend cost breakdown in Credits.tsx"
Task: "T012 [P] [US1] Verify app/src/lib/api.ts payment functions"
Task: "T013 [P] [US1] Verify CreditPurchaseModal.tsx checkout config"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — T004 schema validation + T005 raw body parsing)
3. Complete Phase 3: User Story 1 (core credit purchase flow)
4. **STOP and VALIDATE**: Test end-to-end payment with test card
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test credit purchase end-to-end → Deploy/Demo (MVP!)
3. Add User Story 2 → Test test mode and failure handling → Deploy/Demo
4. Add User Story 3 → Test webhook delivery and idempotency → Deploy/Demo
5. Complete Phase 6: Polish → Full production readiness

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 2 (Foundational) together
2. Once Foundational is done:
   - Developer A: User Story 1 (core flow fixes)
   - Developer B: User Story 2 (test mode + failure handling)
   - Developer C: User Story 3 (webhook fixes)
3. Stories complete and integrate independently
4. Team converges on Phase 6 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Most tasks are FIXES to existing code, not new implementations
- The critical path is: T005 (raw body) → T004 (validation) → T008/T009/T010 (harden verify) → T015 (end-to-end test)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
