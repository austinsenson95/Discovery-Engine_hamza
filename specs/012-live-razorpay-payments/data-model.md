# Data Model: Live Razorpay Payment Integration

**Feature**: Live Razorpay Payment Integration  
**Date**: 2026-05-31

---

## Entity Relationship Diagram

```
┌─────────────────────┐       ┌──────────────────────────┐
│        User         │       │   Payment Transaction    │
├─────────────────────┤       ├──────────────────────────┤
│ id (PK)             │◄──────┤ user_id (FK)             │
│ name                │       │ id (PK)                  │
│ email               │       │ razorpay_order_id        │
│ credits             │       │ razorpay_payment_id (UQ) │
│ ...                 │       │ status                   │
└─────────────────────┘       │ amount                   │
                              │ credits_added            │
┌──────────────────────────┐  │ created_at               │
│    Credit Transaction    │  └──────────────────────────┘
├──────────────────────────┤
│ id (PK, AUTOINCREMENT)   │
│ user_id (FK)             │
│ blueprint_id (FK, opt)   │
│ action                   │
│ amount                   │
│ balance_after            │
│ description              │
│ created_at               │
└──────────────────────────┘
```

---

## Entity Definitions

### User

The platform user (coach/consultant). Stores current credit balance.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID v4 |
| name | TEXT | NOT NULL | Display name |
| email | TEXT | NOT NULL | Contact email |
| avatar | TEXT | | Avatar image URL |
| language | TEXT | NOT NULL DEFAULT 'english' | UI language preference |
| credits | INTEGER | NOT NULL DEFAULT 100 | Current credit balance |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |
| updated_at | TEXT | NOT NULL | ISO 8601 timestamp |

**State Transitions**: `credits` is updated atomically via `creditRepository.addCredits()` and `creditRepository.deductCredits()`.

---

### Payment Transaction

Records every Razorpay payment attempt. Provides idempotency and audit trail.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID v4 (platform-generated) |
| user_id | TEXT | NOT NULL, FK → users.id | Who made the payment |
| razorpay_order_id | TEXT | NOT NULL | Razorpay order ID |
| razorpay_payment_id | TEXT | NOT NULL, UNIQUE | Razorpay payment ID |
| status | TEXT | NOT NULL CHECK (status IN ('created', 'paid', 'failed', 'cancelled')) | Payment lifecycle status |
| amount | INTEGER | NOT NULL | Amount in paise (₹49900 = ₹499) |
| credits_added | INTEGER | NOT NULL | Number of credits purchased |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | When the record was created |

**State Transitions**:
```
created ──► paid        (on successful payment verification/webhook)
created ──► cancelled   (on user abandoning checkout)
created ──► failed      (on payment failure from Razorpay)
```

**Idempotency Rule**: `razorpay_payment_id` is UNIQUE. A second attempt to process the same payment ID will fail at the DB level, preventing duplicate credit additions.

---

### Credit Transaction

Immutable ledger of all credit changes. Every addition or deduction creates a record.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Sequential ID |
| user_id | TEXT | NOT NULL, FK → users.id | Whose credits changed |
| blueprint_id | TEXT | | Optional link to a blueprint context |
| action | TEXT | NOT NULL | Reason code: 'purchase', 'niche', 'audience', 'program-name', 'pricing', 'problems', 'curriculum', 'roadmap', 'quiz' |
| amount | INTEGER | NOT NULL | Positive for purchases, negative for deductions |
| balance_after | INTEGER | NOT NULL | User's credit balance after this transaction |
| description | TEXT | | Human-readable description |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Invariants**:
- `balance_after` must equal `previous_balance + amount`.
- `amount` is positive for `action = 'purchase'`, negative for all other actions.
- Records are never updated or deleted (append-only ledger).

---

## Credit Package (Configuration)

Not a database entity — defined in code/configuration.

| Package | Credits | Price (₹) | Price (Paise) | ID |
|---------|---------|-----------|---------------|-----|
| Starter | 50 | ₹49 | 4900 | `starter` |
| Growth | 100 | ₹199 | 19900 | `growth` |
| Pro | 150 | ₹299 | 29900 | `pro` |

**Validation**: `packageId` must match one of the three IDs above. Price-to-credits mapping is fixed.

---

## Indexes

```sql
-- Credit transactions: fast lookup by user, ordered by time
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

-- Payment transactions: fast lookup by user and payment ID
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_payment_id ON payment_transactions(razorpay_payment_id);
```

## Data Integrity Rules

1. **Atomic credit updates**: Credit addition/deduction and credit_transaction INSERT must occur in the same DB transaction.
2. **Payment status monotonicity**: A `paid` transaction must never revert to `created`, `failed`, or `cancelled`.
3. **Credit balance non-negative**: The creditService must reject deductions that would result in a negative balance (returns 402).
4. **Package price immutability**: Credit package prices are fixed; changing them requires a code deployment, not a DB migration.
