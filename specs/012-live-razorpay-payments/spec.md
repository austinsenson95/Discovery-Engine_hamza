# Feature Specification: Live Razorpay Payment Integration

**Feature Branch**: `012-live-razorpay-payments`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "i have added my razorpay key and secret in the .env, now check everything with the correct schema. I want a fully working payment system integrated into the project and where the credit system is live where I can pay for testing and the money will come back to my razorpay wallet"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Purchase Credits via Razorpay (Priority: P1)

A coach using the Discovery Engine platform runs out of credits while building their blueprint. They navigate to the Credits page, select a credit package, complete payment through Razorpay's secure checkout, and immediately see their credit balance updated. They can then continue using AI-powered blueprint features without interruption.

**Why this priority**: This is the core revenue and utility flow. Without working payments, users cannot replenish credits, and the platform cannot generate revenue. Every other paid feature depends on this working end-to-end.

**Independent Test**: Can be fully tested by initiating a credit purchase from the Credits page or the Credit Purchase Modal, completing the Razorpay checkout flow, and verifying the user's credit balance increases by the purchased amount.

**Acceptance Scenarios**:

1. **Given** a user with 10 remaining credits on the Credits page, **When** they select the "Growth" package (100 credits / ₹199) and complete Razorpay checkout successfully, **Then** their credit balance updates to 110 credits and a success confirmation is displayed.
2. **Given** a user in the Blueprint wizard who receives an insufficient-credits error (402), **When** they click "Buy Credits" in the modal, select a package, and pay successfully, **Then** the modal closes, credits are added, and they can retry the AI step without losing their wizard progress.
3. **Given** a user on the Credits page, **When** they view their transaction history, **Then** they see all credit purchases and AI step deductions listed with timestamps and descriptions.

---

### User Story 2 - Safe Testing with Razorpay Test Mode (Priority: P2)

The platform owner wants to test the full payment flow end-to-end without processing real money, ensuring the integration is correct before accepting live customer payments. They can switch to Razorpay test mode and use test card numbers to simulate successful and failed payments.

**Why this priority**: Testing with real money is risky and impractical. A proper test mode enables safe validation of the entire payment lifecycle, including edge cases like failed payments and webhook handling, without financial risk.

**Independent Test**: Can be fully tested by configuring the system to use Razorpay test keys, initiating a payment with a Razorpay test card (e.g., 5267 3181 8797 5449), and verifying that credits are added while no real money is transferred.

**Acceptance Scenarios**:

1. **Given** the system is configured with Razorpay test keys, **When** a user completes checkout using a Razorpay test card, **Then** the payment is recorded as successful, credits are added, and no real funds are debited.
2. **Given** the system is configured with Razorpay test keys, **When** a user uses a test card that simulates payment failure, **Then** the transaction is recorded as failed, no credits are added, and the user sees a clear error message with an option to retry.
3. **Given** the system is in test mode, **When** a payment is completed, **Then** the Razorpay dashboard shows the test transaction in test mode, allowing the owner to verify webhook delivery and settlement simulation.

---

### User Story 3 - Reliable Webhook-Driven Credit Delivery (Priority: P2)

When a user completes a Razorpay payment, the platform reliably processes Razorpay's server-side webhook notification to confirm payment success and deliver credits. This ensures credits are added even if the user's browser closes before the frontend verification callback completes.

**Why this priority**: Webhooks provide the source of truth for payment status. Without reliable webhook handling, payments could be lost if the user closes their browser or loses network connectivity during checkout. This is essential for payment integrity and trust.

**Independent Test**: Can be fully tested by completing a payment, simulating a frontend network failure (so the verify API is not called), and verifying that the webhook still correctly adds credits to the user's account.

**Acceptance Scenarios**:

1. **Given** a user completes a Razorpay payment, **When** Razorpay sends a `payment.captured` webhook to the platform, **Then** the webhook signature is verified, the payment transaction status updates to "paid", and the corresponding credits are added to the user's balance exactly once.
2. **Given** a duplicate webhook is sent for the same payment, **When** the platform receives the second webhook, **Then** it recognizes the duplicate payment ID, skips credit addition, and responds with success to avoid Razorpay retry loops.
3. **Given** a webhook with an invalid signature, **When** the platform receives it, **Then** it rejects the webhook with a 400 error and does not modify the user's credit balance.

---

### Edge Cases

- What happens when a user initiates payment but abandons the Razorpay checkout modal? The transaction should remain in "created" status and no credits should be added.
- How does the system handle network failures between Razorpay and the webhook endpoint? Razorpay will retry; the system must handle retries idempotently.
- What happens if the Razorpay API is temporarily unavailable when creating an order? The system should return a clear service-unavailable error to the frontend.
- How does the system prevent credit double-addition if both the frontend verify callback and the webhook process the same payment? Payment transaction records must enforce idempotency via unique `razorpay_payment_id`.
- What happens if a user has insufficient credits for an AI step? The system returns a 402 status, triggering the credit purchase modal in the frontend.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to purchase credit packages via Razorpay checkout in three tiers: Starter (50 credits / ₹49), Growth (100 credits / ₹199), and Pro (150 credits / ₹299).
- **FR-002**: The system MUST create a Razorpay order for the selected package amount before opening the checkout modal.
- **FR-003**: The system MUST verify the Razorpay payment signature on the frontend callback before adding credits.
- **FR-004**: The system MUST process Razorpay `payment.captured` webhooks to add credits when the frontend callback fails or is bypassed.
- **FR-005**: The system MUST verify webhook signatures using the raw request body to ensure integrity.
- **FR-006**: The system MUST prevent duplicate credit additions for the same payment via idempotent payment transaction records.
- **FR-007**: The system MUST deduct credits for each AI blueprint step according to the published cost schedule (niche: 10, audience: 10, program name: 5, pricing: 5, problems: 5, curriculum: 10, roadmap: 15, quiz: 5).
- **FR-008**: The system MUST return HTTP 402 when a user has insufficient credits for an AI step, triggering the credit purchase flow.
- **FR-009**: The system MUST display a complete transaction history showing all credit purchases and deductions with timestamps.
- **FR-010**: The system MUST support Razorpay test mode for safe end-to-end testing without real financial transactions.
- **FR-011**: The system MUST record payment transactions with statuses (created, paid, failed, cancelled) and expose this data for auditing.
- **FR-012**: The system MUST validate all payment-related request data against a strict schema before processing.

### Key Entities *(include if feature involves data)*

- **Credit Package**: A purchasable tier defining a credit quantity and price in INR. Attributes: name, credits, priceInRupees, priceInPaise.
- **Payment Transaction**: A record of a Razorpay payment attempt. Attributes: id, userId, razorpayOrderId, razorpayPaymentId, status, amount, creditsAdded, createdAt. Enforces unique razorpayPaymentId for idempotency.
- **Credit Transaction**: A ledger entry for credit changes. Attributes: id, userId, blueprintId, action, amount (positive for purchases, negative for deductions), balanceAfter, description, createdAt.
- **User Credit Balance**: The current available credits for a user, stored on the user record and updated atomically with each credit transaction.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a credit purchase end-to-end in under 60 seconds from package selection to balance update.
- **SC-002**: 100% of successful Razorpay payments result in accurate credit delivery within 5 seconds of payment confirmation.
- **SC-003**: Zero duplicate credit additions occur for the same payment, verified by unique payment ID constraints and idempotent processing.
- **SC-004**: All webhook requests with valid signatures are processed successfully; all webhook requests with invalid signatures are rejected without side effects.
- **SC-005**: Users can view their complete credit transaction history with all purchases and deductions visible in chronological order.
- **SC-006**: The payment flow supports testing in Razorpay test mode without processing real money, enabling safe pre-launch validation.
- **SC-007**: When a user has insufficient credits, the credit purchase modal appears within 1 second of the 402 response, allowing seamless flow continuation.

## Assumptions

- The user has valid Razorpay API credentials (key ID and secret) configured in the environment.
- Razorpay test mode keys can be used interchangeably with live keys for safe testing; the integration logic is identical.
- The platform currently uses a single dummy user for authentication; real user isolation is out of scope for this feature but the schema supports multi-user.
- Credit packages and their pricing are fixed and defined in the backend configuration.
- Razorpay's webhook delivery is reliable with automatic retries on non-2xx responses.
- SQLite is sufficient for payment transaction persistence in the current deployment model.
