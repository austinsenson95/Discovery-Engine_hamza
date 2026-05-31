# Feature Specification: Credits Dashboard & Razorpay Integration

**Feature Branch**: `011-credits-razorpay-dashboard`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "add a credits management dashboard and a way for users to top up their credits. also wire up the backend for razorpay integration. work on the UX as well"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Buy Credits via Razorpay (Priority: P1)

As a coach who has run out of credits mid-wizard, I want to purchase more credits through a secure, familiar Indian payment gateway (Razorpay) so that I can continue building my Blueprint without leaving the platform.

**Why this priority**: This is the core monetization flow. Without it, users hit a dead end when credits run out. The existing "Purchase Credits" button on the Profile page is disabled with a "Coming Soon" label, indicating this is a known gap.

**Independent Test**: Navigate to the Credits Dashboard, select a credit package (e.g., 50 credits for ₹499), complete Razorpay checkout, and verify credits are added to the balance immediately. The transaction must appear in credit history.

**Acceptance Scenarios**:

1. **Given** a user has 0 credits, **When** they attempt an AI generation step in the Blueprint wizard, **Then** they see an inline "Buy Credits" CTA (not just a toast) that opens the credits purchase flow without losing wizard progress.
2. **Given** a user selects a credit package on the Credits Dashboard, **When** Razorpay checkout completes successfully, **Then** the user's credit balance increases by the purchased amount, a success toast appears, and the transaction is recorded in credit history.
3. **Given** a Razorpay payment fails or is cancelled, **When** the user returns to the app, **Then** no credits are added, an appropriate message is shown, and no duplicate transaction is created.

---

### User Story 2 - Credits Management Dashboard (Priority: P1)

As a coach, I want a dedicated Credits Dashboard where I can see my current balance, credit usage history, AI step costs, and available packages, so that I can understand and manage my credit spending.

**Why this priority**: The Profile page already shows credit history, but it's cramped. A dedicated dashboard provides a focused, professional experience for credit management and creates a clear space for the purchase flow.

**Independent Test**: Navigate to the Credits Dashboard. Verify: balance is displayed prominently, a usage history table shows all deductions/additions with dates, AI step costs are listed, and purchase packages are visible.

**Acceptance Scenarios**:

1. **Given** a user navigates to the Credits Dashboard, **When** the page loads, **Then** they see their current balance, a visual breakdown of credit costs per wizard step, and a list of available purchase packages.
2. **Given** a user views their credit history, **When** they scroll through transactions, **Then** each entry shows the date, action (e.g., "Niche Discovery"), amount deducted or added, and running balance.
3. **Given** a user is on the Credits Dashboard, **When** they look at the cost breakdown, **Then** each AI step shows its credit cost with a visual indicator (e.g., progress bar or icon) showing how many times they've used it.

---

### User Story 3 - Improved 402 / Out-of-Credits UX (Priority: P2)

As a coach who hits the credit limit during the Blueprint wizard, I want a smooth, non-disruptive path to buy more credits that preserves my wizard progress, so that I don't lose motivation or context.

**Why this priority**: The current 402 handling is just a generic error toast. Users must manually navigate away, figure out how to buy credits, and return. This friction kills conversion.

**Independent Test**: Start the Blueprint wizard, deliberately exhaust credits, trigger an AI step. Instead of a toast, a modal or inline panel should appear offering credit purchase options. After purchase, the user returns to the exact same wizard step.

**Acceptance Scenarios**:

1. **Given** a user triggers an AI generation step with insufficient credits, **When** the 402 response arrives, **Then** a branded modal appears offering credit packages with a "Buy & Continue" action, rather than a plain error toast.
2. **Given** the credit purchase modal is open, **When** the user completes payment, **Then** the modal closes, the wizard step auto-retries the AI generation, and the user sees the generated result without re-clicking.
3. **Given** a user dismisses the credit purchase modal without buying, **When** they close it, **Then** they return to the wizard step with their previous selections intact, and a subtle reminder about low credits is shown.

---

### Edge Cases

- What happens if a user refreshes the page mid-Razorpay checkout?
- How does the system handle Razorpay webhook retries (duplicate payment notifications)?
- What happens if the user's credit balance goes negative due to a race condition?
- How does the frontend handle network failure during the Razorpay checkout flow?
- What happens if Razorpay keys are missing or invalid?
- How does the system handle refunds or chargebacks?
- What happens if a user purchases credits while the wizard is open in another tab?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a dedicated Credits Dashboard page at `/credits` (or `/dashboard/credits`) with balance, history, cost breakdown, and purchase packages.
- **FR-002**: The Credits Dashboard MUST display the user's current credit balance prominently with a visual indicator (e.g., large number, progress bar toward next purchase threshold).
- **FR-003**: The Credits Dashboard MUST display a scrollable credit transaction history with date, action, amount, and running balance.
- **FR-004**: The Credits Dashboard MUST display credit costs for each AI generation step in a clear grid or list.
- **FR-005**: The system MUST expose a `POST /api/payments/create-order` endpoint that creates a Razorpay order for a selected credit package.
- **FR-006**: The system MUST expose a `POST /api/payments/verify` endpoint that verifies the Razorpay payment signature and adds credits to the user's balance.
- **FR-007**: The system MUST expose a `POST /api/payments/webhook` endpoint to handle Razorpay payment webhooks for async verification.
- **FR-008**: The frontend MUST integrate the Razorpay Checkout.js SDK to open the payment modal.
- **FR-009**: Credit packages MUST be configurable (e.g., 50 credits for ₹499, 100 for ₹899, 250 for ₹1,999) via a config file or environment variables.
- **FR-010**: On 402 insufficient-credits responses during the Blueprint wizard, the frontend MUST display a branded purchase modal instead of a plain error toast.
- **FR-011**: The purchase modal MUST preserve the current wizard step and auto-retry the AI generation after successful payment.
- **FR-012**: All credit top-up transactions MUST be recorded in the `credit_transactions` table with type `'add'` and a clear description.
- **FR-013**: The system MUST handle idempotency for Razorpay webhooks to prevent duplicate credit additions.
- **FR-014**: The Navbar credit badge MUST update in real-time after a successful purchase.

### Key Entities *(include if feature involves data)*

- **CreditPackage**: A purchasable bundle of credits. Fields: `id`, `name`, `credits`, `priceInPaise`, `priceDisplay` (e.g., "₹499").
- **RazorpayOrder**: A Razorpay order object. Fields: `id`, `amount`, `currency`, `receipt`.
- **PaymentTransaction**: A record of a payment attempt. Fields: `id`, `userId`, `razorpayOrderId`, `razorpayPaymentId`, `status`, `amount`, `creditsAdded`, `createdAt`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can purchase credits and see the balance update within 5 seconds of successful payment.
- **SC-002**: 100% of successful Razorpay payments result in the correct number of credits being added (no over-crediting or under-crediting).
- **SC-003**: 0% of duplicate Razorpay webhooks result in duplicate credit additions (idempotency works).
- **SC-004**: Users who encounter a 402 during the wizard can purchase credits and resume without losing progress in under 30 seconds.
- **SC-005**: The Credits Dashboard loads and displays all data (balance, history, packages) in under 2 seconds.

## Assumptions

- Razorpay test keys will be used for development; production keys will be swapped via environment variables.
- Credit packages are static (not dynamically generated by AI) and configured server-side.
- The frontend already has React Router set up to support a new `/credits` route.
- The existing `credit_transactions` SQLite table schema is sufficient for storing top-up transactions (type: 'add').
- Users have a stable internet connection during payment; offline handling is out of scope.
- Razorpay Checkout.js SDK will be loaded via CDN or npm package.
