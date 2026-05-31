# Implementation Plan: Email & Password Authentication with Password Recovery

**Branch**: `013-email-password-auth` | **Date**: 2026-05-31 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/013-email-password-auth/spec.md`

## Summary

Replace the current mock authentication system with real email/password authentication including secure password hashing (bcrypt), JWT session management, and a full password-recovery flow via email. Introduce a `password_resets` table for token lifecycle management, enforce email uniqueness on the `users` table, and add `password_hash` storage. Build dedicated Login, Sign-Up, and Forgot-Password pages on the frontend, wire them to the backend via the existing API layer, and protect all authenticated routes with a real auth context.

## Technical Context

**Language/Version**: TypeScript 5.9 (frontend), TypeScript 5.5 (backend), Node.js 18+

**Primary Dependencies**: React 19.2 + React Router v7 (frontend), Express.js 4.19 (backend), better-sqlite3 (database), jsonwebtoken + bcryptjs (auth)

**Storage**: SQLite via better-sqlite3 (`discovery-engine-backend/data/discovery-engine.db`)

**Testing**: Vitest + React Testing Library (frontend, to be installed), Vitest + supertest (backend, to be installed)

**Target Platform**: Web browsers (desktop + mobile), backend runs on Node.js

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Registration and login API responses under 500ms; password-reset email sent within 2 minutes

**Constraints**: Must preserve existing blueprint wizard flow; must work with existing SQLite database; must comply with TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`)

**Scale/Scope**: Single-node deployment, hundreds of concurrent users, file-based SQLite

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| TypeScript Strictness | ✅ Pass | All new code must be TS strict; no `@ts-ignore` |
| 4-Step Wizard Sacred | ✅ Pass | Auth is a prerequisite gate, not a disruption |
| Brand Consistency | ✅ Pass | Auth pages use existing palette, fonts, `cn()` helper |
| Backend-First Persistence | ✅ Pass | Uses existing SQLite + better-sqlite3; no new DB |
| Real AI or Nothing | N/A | No AI involvement in this feature |

**Security Stance alignment**: This feature directly addresses the #1 hardening priority (bcrypt + real JWT) and #3 (Zod validation). No constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/013-email-password-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
discovery-engine-backend/
├── src/
│   ├── db/
│   │   ├── index.ts              # Add password_resets table + password_hash column migration
│   │   └── passwordResetRepository.ts   # NEW: Token CRUD
│   ├── controllers/
│   │   └── authController.ts     # UPDATE: Real bcrypt + JWT, add forgot/reset
│   ├── middleware/
│   │   ├── auth.ts               # UPDATE: Real JWT verification
│   │   └── validateRequest.ts    # UPDATE: Zod schemas for auth bodies
│   ├── routes/
│   │   └── auth.ts               # UPDATE: Add forgot-password, reset-password routes
│   ├── services/
│   │   └── emailService.ts       # NEW: Password-reset email sender
│   └── types/index.ts            # UPDATE: Add passwordHash to User type
│
app/
├── src/
│   ├── pages/
│   │   ├── Login.tsx             # NEW
│   │   ├── Signup.tsx            # NEW
│   │   └── ForgotPassword.tsx    # NEW
│   ├── components/
│   │   └── AuthGuard.tsx         # NEW: Route protection wrapper
│   ├── context/
│   │   └── AuthContext.tsx       # NEW: Global auth state + provider
│   ├── lib/
│   │   └── api.ts                # UPDATE: Add auth endpoints, attach Bearer token
│   ├── types/index.ts            # UPDATE: Add passwordHash to User type
│   └── App.tsx                   # UPDATE: Add /login, /signup, /forgot-password routes
```

**Structure Decision**: Option 2 — Web application with separate `backend/` and `frontend/` (`app/`) directories, matching the existing project layout.

## Complexity Tracking

> No constitution violations. All complexity is justified by the security hardening roadmap.

## Design Decisions

### Auth Pattern: Stateless JWT + bcrypt
- **JWT** for session management (stateless, scales horizontally if needed later)
- **bcryptjs** for password hashing (12 rounds, pure-JS, no native dependencies)
- **Refresh tokens** deferred to future phase; access tokens have 7-day expiry

### Email Service: Nodemailer + SMTP (SendGrid/Resend ready)
- Nodemailer provides transport abstraction
- Configurable via environment variables (SMTP host, port, user, pass)
- Defaults to Ethereal for development (catches emails without real delivery)
- Password-reset email: plain-text + HTML, contains a frontend URL with token

### Password Policy
- Minimum 8 characters
- At least one uppercase, one lowercase, one number
- No complexity beyond that (prevents user abandonment)

### Session Strategy
- Access token stored in `localStorage` on frontend
- Sent as `Authorization: Bearer <token>` header on every API call
- Token contains `{ userId, email, iat, exp }`
- On password change: new token issued, old tokens naturally expire

### Database Migration Strategy
- SQLite has limited `ALTER TABLE`; use "create-new, copy, drop-old" pattern
- `users` table: add `password_hash TEXT` column, add `UNIQUE` constraint on `email`
- New `password_resets` table: `id`, `user_id`, `token_hash`, `expires_at`, `used_at`, `created_at`
