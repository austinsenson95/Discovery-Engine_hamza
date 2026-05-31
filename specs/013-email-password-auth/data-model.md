# Data Model: Email & Password Authentication

**Date**: 2026-05-31
**Feature**: Email & Password Authentication with Password Recovery

## Entity: User

Represents a registered coach/consultant on the platform.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | TEXT | PRIMARY KEY | UUID or `usr_${timestamp}` |
| `name` | TEXT | NOT NULL | Full name from registration |
| `email` | TEXT | NOT NULL, UNIQUE | Lowercased on storage |
| `password_hash` | TEXT | NOT NULL | bcrypt hash, never plaintext |
| `avatar` | TEXT | nullable | URL to avatar image |
| `language` | TEXT | NOT NULL DEFAULT 'english' | 'english' or 'hindi' |
| `credits` | INTEGER | NOT NULL DEFAULT 100 | Current credit balance |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

### Validation Rules
- `email`: Must match RFC 5322 simplified pattern (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- `email`: Must be unique across all users (DB-level UNIQUE constraint)
- `name`: Minimum 2 characters, maximum 100 characters
- `password_hash`: Always bcrypt hash, never stored or logged in plaintext

### State Transitions
```
[Unregistered] --register--> [Active]
[Active] --login--> [Authenticated]
[Authenticated] --logout--> [Active]
[Active] --forgot-password--> [Reset Pending]
[Reset Pending] --reset-password--> [Active]
```

## Entity: Password Reset Token

Temporary, single-use credential for password recovery.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Internal ID |
| `user_id` | TEXT | NOT NULL, FOREIGN KEY → users(id) | Owner of the reset |
| `token_hash` | TEXT | NOT NULL, UNIQUE | SHA-256 of the raw token sent to user |
| `expires_at` | TEXT | NOT NULL | ISO 8601 timestamp, 1 hour from creation |
| `used_at` | TEXT | nullable | ISO 8601 timestamp when token was consumed |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

### Validation Rules
- `token_hash`: Must be exactly 64 hex characters (SHA-256 of 32-byte random)
- `expires_at`: Must be in the future at creation time
- `used_at`: Once set, token is permanently invalid

### Lifecycle
```
[Created] --user clicks link + valid--> [Consumed] (used_at set)
[Created] --expires_at reached--> [Expired]
[Created] --newer token created for same user--> [Superseded] (implicit, older token ignored)
```

## Entity: Session (Conceptual, not DB table)

JWT-based session, no server-side storage required.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `userId` | string | JWT payload | From `sub` claim |
| `email` | string | JWT payload | From user record at login time |
| `iat` | number | JWT standard | Issued-at timestamp |
| `exp` | number | JWT standard | Expiry timestamp (7 days) |

### Validation Rules
- Token must be verifiable with `JWT_SECRET`
- `exp` must be in the future
- `userId` must reference an existing user

## Relationships

```
User ||--o{ PasswordResetToken : "requests"
User ||--o{ Blueprint : "creates"
User ||--o{ CreditTransaction : "has"
User ||--o{ PaymentTransaction : "has"
User ||--o{ Activity : "generates"
```

## Migration: users table v1 → v2

### Current Schema (v1)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  language TEXT NOT NULL DEFAULT 'english',
  credits INTEGER NOT NULL DEFAULT 999,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Target Schema (v2)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar TEXT,
  language TEXT NOT NULL DEFAULT 'english',
  credits INTEGER NOT NULL DEFAULT 100,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### New Table: password_resets
```sql
CREATE TABLE password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_token_hash ON password_resets(token_hash);
```

## Data Integrity Notes

1. **Email uniqueness**: Enforced at DB level + checked before INSERT in repository
2. **Password hash never logged**: All logging of User objects must strip `password_hash`
3. **Token hash storage**: Raw tokens exist only in email and URL; DB stores hashes only
4. **Cascading deletes**: `password_resets` rows deleted when user is deleted (ON DELETE CASCADE)
5. **Migration safety**: Existing users without `password_hash` will need to set one on next login (or be seeded with a random hash requiring reset)
