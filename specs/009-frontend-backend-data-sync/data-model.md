# Data Model: Frontend Real-Time Data Sync

**Date**: 2026-05-30
**Feature**: specs/009-frontend-backend-data-sync

## Existing Schema (unchanged)

### `blueprints` table
| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| user_id | TEXT | NOT NULL |
| title | TEXT | |
| status | TEXT | NOT NULL DEFAULT 'in_progress' |
| current_step | INTEGER | NOT NULL DEFAULT 1 |
| progress | INTEGER | NOT NULL DEFAULT 0 |
| niche | TEXT | JSON |
| audience | TEXT | JSON |
| program | TEXT | JSON |
| roadmap | TEXT | JSON |
| created_at | TEXT | NOT NULL |
| updated_at | TEXT | NOT NULL |

### `activities` table
| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| user_id | TEXT | NOT NULL |
| blueprint_id | TEXT | |
| title | TEXT | NOT NULL |
| description | TEXT | |
| type | TEXT | NOT NULL DEFAULT 'blueprint' |
| created_at | TEXT | NOT NULL |

## New Schema

### `users` table
| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL |
| avatar | TEXT | |
| language | TEXT | NOT NULL DEFAULT 'english' |
| credits | INTEGER | NOT NULL DEFAULT 100 |
| created_at | TEXT | NOT NULL |
| updated_at | TEXT | NOT NULL |

**Rationale**: Replaces the in-memory `userStore` Map. Single source of truth for user profile data. `credits` column is the current balance (not historical).

### `credit_transactions` table
| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| user_id | TEXT | NOT NULL |
| blueprint_id | TEXT | |
| action | TEXT | NOT NULL |
| amount | INTEGER | NOT NULL |
| balance_after | INTEGER | NOT NULL |
| description | TEXT | |
| created_at | TEXT | NOT NULL |

**Rationale**: Immutable ledger of every credit deduction. `amount` is always negative for deductions (e.g., -10). `balance_after` is the running balance after this transaction. Enables `GET /api/user/credit-history` to return chronological history.

**Indexes**:
- `idx_credit_transactions_user_id` on `user_id` (for fast lookup)
- `idx_credit_transactions_created_at` on `created_at` (for chronological ordering)

## Entity Relationships

```
User (1) ──► Blueprint (N)
  │
  ├──► Activity (N)
  │
  └──► CreditTransaction (N)
```

## State Transitions

### Credit Balance
```
[User has balance B] ──deduct(amount)──► [User has balance B - amount]
                              │
                              └── INSERT INTO credit_transactions
```

### User Profile Update
```
[User profile P] ──update(name, language, avatar)──► [User profile P']
```

### Achievement Unlock (computed, not stored)
```
[Blueprint state S] ──compute_achievements()──► [Achievement list A]
```

## Validation Rules

- `users.language` must be either `'english'` or `'hindi'`
- `users.credits` must be >= 0
- `credit_transactions.amount` must be negative for deductions
- `credit_transactions.balance_after` must equal previous balance + amount
- `activities.type` must be one of: `'blueprint'`, `'niche'`, `'audience'`, `'program'`, `'roadmap'`, `'credit'`, `'quiz'`
