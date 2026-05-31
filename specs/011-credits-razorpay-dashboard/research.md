# Research: Credits Dashboard & Razorpay Integration

**Date**: 2026-05-30

## Unknowns Resolved

### 1. How should Razorpay be integrated on the backend?

**Decision**: Use the official `razorpay` npm package (`npm install razorpay`). Implement a three-step flow:
1. **Create Order**: `POST /api/payments/create-order` — backend creates a Razorpay Order via `razorpay.orders.create({ amount, currency, receipt })`.
2. **Verify Payment**: `POST /api/payments/verify` — frontend sends `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`; backend verifies the signature using `crypto.createHmac` with the Razorpay secret.
3. **Webhook**: `POST /api/payments/webhook` — handles async payment events for redundancy.

**Rationale**: This is the standard Razorpay integration pattern. The `razorpay` package provides a clean Node.js SDK for order creation.

**Alternatives considered**:
- Raw HTTP calls to Razorpay API — rejected; the SDK handles auth, retries, and error formatting.
- Stripe instead of Razorpay — rejected; the user explicitly requested Razorpay, and Razorpay is dominant in the Indian market.

### 2. How should Razorpay Checkout.js be loaded in the frontend?

**Decision**: Load Razorpay Checkout.js dynamically via a script tag injected into the DOM when the purchase modal opens. The frontend does not need a React wrapper library.

```typescript
const loadRazorpay = (): Promise<any> => new Promise((resolve) => {
  if ((window as any).Razorpay) return resolve((window as any).Razorpay);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve((window as any).Razorpay);
  document.body.appendChild(script);
});
```

**Rationale**: The Checkout.js SDK is a simple JavaScript library. Loading it on-demand avoids an extra dependency and keeps bundle size small.

**Alternatives considered**:
- `react-razorpay` npm package — rejected; adds unnecessary abstraction and may be outdated. The raw SDK is well-documented and stable.
- npm install `razorpay` in frontend — rejected; the SDK is designed to be loaded via CDN script.

### 3. Where should credit packages be configured?

**Decision**: Define credit packages as a static array in `discovery-engine-backend/src/data/dummyData.ts` and expose them via `GET /api/payments/packages`. The frontend fetches this list.

```typescript
export const creditPackages = [
  { id: 'pkg_50', name: 'Starter Pack', credits: 50, priceInPaise: 49900, priceDisplay: '₹499' },
  { id: 'pkg_100', name: 'Growth Pack', credits: 100, priceInPaise: 89900, priceDisplay: '₹899' },
  { id: 'pkg_250', name: 'Pro Pack', credits: 250, priceInPaise: 199900, priceDisplay: '₹1,999' },
];
```

**Rationale**: Packages are static business rules. Storing them server-side ensures consistency and allows easy changes without frontend redeployments.

**Alternatives considered**:
- Hard-code in frontend — rejected; harder to change and inconsistent.
- Store in database — rejected; overkill for static config; no need for admin UI to manage packages in v1.

### 4. How should the 402 purchase modal work?

**Decision**: Create a reusable `CreditPurchaseModal` component that accepts:
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: () => void` (called after credits are added, used by Blueprint to retry the AI step)

The modal loads Razorpay, shows packages, handles payment, calls `onSuccess`, and the parent (Blueprint.tsx) retries the failed API call.

**Rationale**: The modal is needed in both the Blueprint wizard (on 402) and the Credits Dashboard (voluntary purchase). A reusable component avoids duplication.

**Alternatives considered**:
- Inline panel instead of modal — rejected; modal is more prominent and branded, matching the shadcn/ui Dialog pattern.
- Redirect to Credits page on 402 — rejected; would lose wizard context and feel disruptive.

### 5. How should webhook idempotency work?

**Decision**: Store a `payment_transactions` table with `razorpay_payment_id` as a unique key. When a webhook arrives, check if the payment ID already exists. If yes, return 200 without adding credits.

```sql
CREATE TABLE payment_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  amount INTEGER NOT NULL,
  credits_added INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Rationale**: Razorpay webhooks may be retried on failure. A unique constraint on `razorpay_payment_id` guarantees idempotency at the database level.

## Research Findings

### Razorpay Signature Verification

```typescript
import crypto from 'crypto';

function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return expectedSignature === signature;
}
```

### Razorpay Order Creation

```typescript
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpayKeySecret,
});

const order = await razorpay.orders.create({
  amount: package.priceInPaise,
  currency: 'INR',
  receipt: `receipt_${userId}_${Date.now()}`,
});
```

### Frontend Razorpay Checkout

```typescript
const Razorpay = await loadRazorpay();
const rzp = new Razorpay({
  key: RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: order.currency,
  name: 'Discovery Engine',
  description: `${package.name} — ${package.credits} credits`,
  order_id: order.id,
  handler: async (response) => {
    // Verify payment on backend
    await verifyPayment(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
    onSuccess();
  },
  modal: { ondismiss: () => onClose() },
});
rzp.open();
```

### Existing Frontend Credit State

The `UserContext` already exposes `refreshCredits()`. After a successful payment, calling `refreshCredits()` updates the Navbar badge and all credit displays.
