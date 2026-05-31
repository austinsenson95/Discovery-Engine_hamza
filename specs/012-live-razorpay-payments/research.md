# Research: Live Razorpay Payment Integration

**Feature**: Live Razorpay Payment Integration  
**Date**: 2026-05-31

---

## Decision 1: Webhook Raw Body Parsing

**Decision**: Use `express.raw({ type: 'application/json' })` as route-specific middleware for the `/api/payments/webhook` endpoint, applied before the global `express.json()` middleware.

**Rationale**: Razorpay computes the webhook signature on the exact raw request body bytes. Express's `express.json()` parses the body into a JavaScript object, and `JSON.stringify(req.body)` does not guarantee byte-perfect reconstruction (key ordering, whitespace, number formatting). The only reliable approach is to capture the raw body before JSON parsing.

**Implementation approach**:
- In `index.ts`, place the webhook route BEFORE the global `express.json()` middleware.
- Alternatively, use `express.raw({ type: 'application/json' })` specifically on the webhook route.
- Pass the raw Buffer to `verifyWebhookSignature()`.

**Alternatives considered**:
- *Double-body parser*: Use a middleware that stores both raw and parsed body. Rejected because it adds complexity and memory overhead for all requests.
- *JSON.stringify with sorted keys*: Rejected because Razorpay may use different serialization rules; byte-perfect match is the only safe approach.

---

## Decision 2: Schema Validation for Payment Endpoints

**Decision**: Use manual validation functions (extending existing `validateRequest.ts` pattern) for payment request bodies, augmented with strict TypeScript types.

**Rationale**: The backend currently uses manual validation in `validateRequest.ts` (Zod-like checks). Adding a full Zod dependency to the backend would be a new dependency. The existing pattern is sufficient for the simple payment schemas: `packageId` (string enum), `orderId` (string), `paymentId` (string), `signature` (string).

**Validation rules**:
- `POST /api/payments/create-order`: `packageId` must be one of `starter`, `growth`, `pro`.
- `POST /api/payments/verify`: `orderId`, `paymentId`, `signature` are required non-empty strings.
- `POST /api/payments/webhook`: Body is raw JSON; validation happens after signature verification.

**Alternatives considered**:
- *Zod schemas*: Would be ideal for type safety but requires adding a new backend dependency. Considered for a future refactor but out of scope for this fix-focused feature.

---

## Decision 3: Razorpay Test Mode Strategy

**Decision**: Document and validate that Razorpay test keys work identically to live keys. No code changes needed for test mode support — it is already supported by the Razorpay SDK.

**Rationale**: Razorpay test mode is controlled entirely by the API keys. Test keys start with `rzp_test_`; live keys start with `rzp_live_`. The SDK behavior, order creation, signature verification, and webhook format are identical. The only difference is that test payments use test cards and appear in the Razorpay dashboard's "Test Mode" section.

**Test card for India**: 5267 3181 8797 5449 (Mastercard), any future expiry, any CVV, any OTP (e.g., 123456).

**Validation approach**:
- Add a startup log that prints whether test or live keys are detected.
- Add a `/api/payments/mode` endpoint (optional) that returns `test` or `live` so the frontend can show a test mode banner.

**Alternatives considered**:
- *Mock Razorpay service for local dev*: Rejected because Razorpay test mode is free and safer than a mock that could diverge from real behavior.

---

## Decision 4: Payment Failure and Cancellation Handling

**Decision**: Update the frontend `CreditPurchaseModal` to handle Razorpay's `modal.ondismiss` and payment failure callbacks by displaying clear error messages. Update the backend to record `failed` and `cancelled` statuses when applicable.

**Rationale**: Currently, `ondismiss` just resets loading state. Razorpay's checkout provides `payment.failed` and modal dismiss events that should be captured. The `payment_transactions` table already has `failed` and `cancelled` statuses but they are never set.

**Implementation approach**:
- Frontend: On Razorpay `payment.failed` event, call a new `/api/payments/fail` endpoint or handle client-side.
- Frontend: On modal dismiss, show a "Payment cancelled" toast.
- Backend: Add `POST /api/payments/fail` to record failed payment attempts (optional; can also be handled client-side with retry).

**Simpler alternative**: For this fix-focused feature, handle failure states client-side in the modal without a new backend endpoint. Record `cancelled` status only for explicit webhook failures (which Razorpay sends for some payment methods).

---

## Decision 5: Idempotency and Duplicate Prevention

**Decision**: Rely on the existing SQLite UNIQUE constraint on `payment_transactions.razorpay_payment_id` and explicit status checks in the controller.

**Rationale**: The schema already enforces uniqueness. The controller already checks for existing transactions before adding credits. This is sufficient for the current single-user, low-volume deployment.

**Edge case handling**:
- If a webhook arrives for a payment already marked `paid`: Return 200 immediately (idempotent success).
- If a webhook arrives for a payment marked `failed`: Log a warning and return 200 to stop retries.
- If the frontend verify and webhook race: The first one to execute the DB INSERT wins; the second hits the UNIQUE constraint and skips credit addition.
