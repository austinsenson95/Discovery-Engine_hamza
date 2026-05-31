# Data Model: Credits Dashboard & Razorpay Integration

**Date**: 2026-05-30

## New Entities

### CreditPackage

Static configuration entity. Defined server-side in `dummyData.ts`.

```typescript
interface CreditPackage {
  id: string;           // e.g., 'pkg_50'
  name: string;         // e.g., 'Starter Pack'
  credits: number;      // e.g., 50
  priceInPaise: number; // e.g., 49900 (₹499)
  priceDisplay: string; // e.g., '₹499'
}
```

### PaymentTransaction

Records every payment attempt (success or failure).

```sql
CREATE TABLE payment_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('created', 'paid', 'failed', 'cancelled')),
  amount INTEGER NOT NULL,        -- in paise
  credits_added INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Constraints**:
- `razorpay_payment_id` is `UNIQUE` — enforces idempotency for webhooks.
- `status` enum: `created` (order created), `paid` (verification passed), `failed` (verification failed), `cancelled` (user closed modal).

## Existing Entity Changes

### CreditTransaction (existing table)

The existing `credit_transactions` table already supports top-ups:

```sql
CREATE TABLE credit_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  blueprint_id TEXT,
  action TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**New usage for top-ups**:
- `action`: `'add'` (new value, distinct from existing `'deduct'`)
- `blueprint_id`: `NULL` (top-ups are not tied to a blueprint)
- `description`: `'Purchased Starter Pack — 50 credits'`
- `amount`: positive number (credits added)

### User (existing table)

No schema changes. The `credits` column is updated via `creditRepository.updateBalance()`.

## State Transitions

### Payment Flow

```
[User selects package]
        |
        v
POST /api/payments/create-order
        |
        v
[Razorpay order created: status='created']
[PaymentTransaction row inserted]
        |
        v
[Frontend opens Razorpay Checkout modal]
    |--- User closes modal ---> status='cancelled'
    |--- Payment fails --------> status='failed'
    |
    Success
    |
    v
[Frontend calls POST /api/payments/verify]
    |
    |--- Signature invalid ---> 400 Bad Request
    |--- Duplicate payment ---> 200 OK (idempotent)
    |
    Valid signature
    |
    v
[Status updated to 'paid']
[Credits added to user balance]
[CreditTransaction row inserted (type='add')]
[200 OK returned to frontend]
        |
        v
[Frontend calls refreshCredits()]
```

### Webhook Flow (redundant path)

```
[Razorpay sends webhook]
        |
        v
POST /api/payments/webhook
        |
        v
[Check if razorpay_payment_id exists]
    |--- Yes ---> 200 OK (already processed)
    |
    No
    |
    v
[Verify signature]
    |
    |--- Invalid ---> 400 Bad Request
    |
    Valid
    |
    v
[Insert PaymentTransaction]
[Add credits]
[Insert CreditTransaction]
[200 OK]
```

## Validation Rules

1. **Package existence**: The selected package ID must exist in the server-side config. Return 400 if invalid.
2. **Order ownership**: The Razorpay order must belong to the authenticated user. Return 403 if mismatched.
3. **Signature verification**: The Razorpay signature must match. Return 400 if invalid.
4. **Duplicate prevention**: `razorpay_payment_id` must be unique. Return 200 with existing data if already processed.
5. **Amount integrity**: The order amount must match the package price. Return 400 if tampered.
