# Research: Email & Password Authentication

**Date**: 2026-05-31
**Feature**: Email & Password Authentication with Password Recovery

## Decision: Password Hashing Library

**Decision**: Use `bcryptjs` (not `bcrypt`)

**Rationale**:
- `bcryptjs` is pure JavaScript — no native compilation required, works on any platform including macOS ARM, Windows, and Docker without build tools
- `bcrypt` requires `node-gyp` and Python, which frequently breaks in CI/CD and on developer machines
- Performance difference is negligible for a coaching platform with moderate traffic (hashing ~100ms vs ~50ms)
- The Constitution already lists `bcryptjs` as the approved choice in the Security Stance section

**Alternatives considered**:
- `bcrypt` — faster but requires native compilation; rejected for deployability
- `argon2` — modern, memory-hard; rejected because it requires native bindings and is overkill for current threat model
- `scrypt` — built into Node.js crypto; rejected because bcrypt is the industry standard and better battle-tested

## Decision: JWT Library

**Decision**: Use `jsonwebtoken`

**Rationale**:
- Most widely used JWT library for Node.js, 20M+ weekly downloads
- Supports HS256 (symmetric) which is sufficient for a single-backend deployment
- Easy token expiry handling with `expiresIn`
- Well-documented error types (`TokenExpiredError`, `JsonWebTokenError`)

**Alternatives considered**:
- `jose` — modern, Web Crypto API based; rejected because `jsonwebtoken` is already familiar to the team and sufficient
- Custom JWT implementation — rejected (never roll your own crypto)

## Decision: Email Transport

**Decision**: Use `nodemailer` with SMTP transport

**Rationale**:
- Universal abstraction over any SMTP provider (SendGrid, Resend, AWS SES, Gmail)
- Development mode: Ethereal.email captures emails without real delivery
- Production mode: Configure any SMTP provider via environment variables
- Zero cost for development/testing

**Alternatives considered**:
- SendGrid SDK directly — rejected because it locks into one provider
- Resend SDK directly — same lock-in concern
- AWS SES SDK — overkill for current scale, requires AWS setup

## Decision: Token Storage for Password Reset

**Decision**: Store SHA-256 hash of reset token in database, send raw token to user

**Rationale**:
- Raw token is a 32-byte random string (hex encoded = 64 chars)
- Database stores `SHA256(token)` so a DB breach does not expose usable reset links
- Token is single-use and time-limited (1 hour expiry)
- Pattern matches OWASP best practices for password reset tokens

**Alternatives considered**:
- Store raw token in DB — rejected (DB breach = all reset links compromised)
- JWT for reset token — rejected (JWTs are self-validating; we need server-side invalidation for single-use)

## Decision: Frontend Auth State Management

**Decision**: React Context + `localStorage` (no Redux/Zustand)

**Rationale**:
- The Constitution forbids new state management libraries
- Auth state is simple: `{ user, token, isLoading, login, logout, register }`
- React Context is sufficient for an app of this size
- `localStorage` is simple and works across page reloads

**Alternatives considered**:
- Zustand — rejected by Constitution constraint
- Redux — rejected by Constitution constraint
- Cookies (httpOnly) — better security but requires backend changes for CSRF and cookie parsing; deferred to future hardening phase

## Decision: Route Protection Strategy

**Decision**: `AuthGuard` component + public route list in `App.tsx`

**Rationale**:
- React Router v7 has no built-in route guards; wrapper component is the idiomatic pattern
- `AuthGuard` checks `localStorage` token + fetches `/user/me` to validate session
- Public routes: `/login`, `/signup`, `/forgot-password`
- All other routes redirect to `/login` when unauthenticated

## Decision: Database Migration for password_hash

**Decision**: SQLite "create-new, copy, drop-old" migration pattern

**Rationale**:
- SQLite does not support `DROP COLUMN` or `ADD CONSTRAINT` in `ALTER TABLE`
- The existing `users` table has no `password_hash` column and `email` is not `UNIQUE`
- Migration: rename table → create new schema → copy data → drop old
- This is safe because the production DB is file-based and the app controls access

**Migration steps**:
1. Rename `users` → `users_old`
2. Create new `users` with `password_hash TEXT` and `email TEXT UNIQUE`
3. Copy all rows from `users_old`
4. Drop `users_old`
5. Create `password_resets` table

## Decision: Zod vs Manual Validation

**Decision**: Zod for all new auth validation (replacing manual validators)

**Rationale**:
- Constitution explicitly lists Zod as #3 hardening priority
- Type-safe validation with automatic TypeScript inference
- Reusable schemas for frontend and backend
- Cleaner error messages than manual if-statements

**Alternatives considered**:
- Continue manual validation — rejected, violates Constitution hardening roadmap
- Joi — larger bundle, no native TS inference
- Yup — good but Zod is more TypeScript-native
