# Tasks: Email & Password Authentication with Password Recovery

**Input**: Design documents from `/specs/013-email-password-auth/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted. Add tests later via `/speckit-checklist` or TDD request.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure environment

- [x] T001 Install backend auth dependencies: `cd discovery-engine-backend && npm install bcryptjs jsonwebtoken nodemailer zod`
- [x] T002 Install backend dev type definitions: `cd discovery-engine-backend && npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/nodemailer`
- [x] T003 [P] Add auth environment variables to `discovery-engine-backend/.env`: `JWT_SECRET`, `JWT_EXPIRES_IN`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL`, `FRONTEND_URL`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, utilities, middleware, and email service that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Migrate `users` table to v2 in `discovery-engine-backend/src/db/index.ts`: add `password_hash TEXT NOT NULL`, add `UNIQUE` on `email`, handle existing users with default/random hash
- [x] T005 [P] Create `password_resets` table in `discovery-engine-backend/src/db/index.ts` with `id`, `user_id`, `token_hash`, `expires_at`, `used_at`, `created_at` + indexes
- [x] T006 Create `discovery-engine-backend/src/db/passwordResetRepository.ts`: `createResetToken`, `findValidToken`, `markTokenUsed`, `cleanupExpiredTokens`
- [x] T007 Update `discovery-engine-backend/src/db/userRepository.ts`: add `getUserByEmail`, `updatePasswordHash`, include `password_hash` in `rowToUser` (but strip from API responses)
- [x] T008 [P] Create `discovery-engine-backend/src/services/emailService.ts`: SMTP transport setup, `sendPasswordResetEmail(email, resetUrl)` with HTML + plain-text templates
- [x] T009 [P] Create `discovery-engine-backend/src/config/auth.ts`: `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_ROUNDS` constants from env with validation
- [x] T010 [P] Create `discovery-engine-backend/src/lib/auth.ts`: `hashPassword(password)`, `comparePassword(password, hash)`, `generateToken(user)`, `verifyToken(token)` utilities
- [x] T011 Update `discovery-engine-backend/src/middleware/validateRequest.ts`: add Zod schemas `registerSchema`, `loginSchema`, `forgotPasswordSchema`, `resetPasswordSchema`
- [x] T012 Update `discovery-engine-backend/src/middleware/auth.ts`: replace mock auth with real JWT verification using `verifyToken`, attach `req.user` from decoded payload, return 401 for invalid/missing tokens
- [x] T013 Update `discovery-engine-backend/src/types/index.ts`: add `passwordHash?: string` to `User` interface (backend-only, never serialized)

**Checkpoint**: Foundation ready — database has password storage, JWT verification works, email service configured, validation schemas defined

---

## Phase 3: User Story 1 — New User Sign-Up (Priority: P1) 🎯 MVP

**Goal**: Visitors can create an account with name, email, and password. Account is persisted in SQLite with bcrypt-hashed password. User receives JWT and is redirected to dashboard.

**Independent Test**: Register via `POST /api/auth/register` with a new email, verify 201 response with user + token, then call `GET /api/user/me` with Bearer token and confirm profile returned.

### Implementation for User Story 1

- [x] T014 [US1] Rewrite `discovery-engine-backend/src/controllers/authController.ts` `register` function: validate with Zod, check email uniqueness via `getUserByEmail`, hash password with bcrypt, create user in DB with `password_hash`, generate JWT, return `{ user, token }` (strip passwordHash from response)
- [x] T015 [US1] Create `app/src/context/AuthContext.tsx`: React Context with `{ user, token, isLoading, isAuthenticated, login, logout, register }`, persists token in `localStorage`, fetches `/user/me` on mount to validate session
- [x] T016 [US1] Create `app/src/pages/Signup.tsx`: form with name, email, password, confirm-password fields, real-time validation, call `register()` from AuthContext, redirect to `/` on success, display errors from API
- [x] T017 [US1] Update `app/src/lib/api.ts`: add `registerUser` endpoint, ensure `fetchJson` reads token from `localStorage` and sends `Authorization: Bearer <token>` header on all requests
- [x] T018 [US1] Update `app/src/types/index.ts`: mirror backend `User` type changes if needed (no passwordHash in frontend types)

**Checkpoint**: User Story 1 complete — registration works end-to-end, new users can sign up and access protected pages

---

## Phase 4: User Story 2 — Existing User Log-In (Priority: P1)

**Goal**: Registered users can log in with email and password. Session is maintained via JWT. Users can log out. All authenticated routes are protected.

**Independent Test**: Register a user (US1), then log in via `POST /api/auth/login` with correct credentials — verify token and user returned. Log in with wrong password — verify generic 401. Access `/api/user/me` without token — verify 401.

### Implementation for User Story 2

- [x] T019 [US2] Rewrite `discovery-engine-backend/src/controllers/authController.ts` `login` function: validate with Zod, find user by email, compare password with bcrypt, generate JWT, return `{ user, token }` (generic 401 for any failure)
- [x] T020 [US2] Update `discovery-engine-backend/src/controllers/userController.ts` `getMe`: use real `req.user` from JWT middleware instead of dummy user, return 401 if not authenticated
- [x] T021 [US2] Create `app/src/pages/Login.tsx`: form with email and password, call `login()` from AuthContext, redirect to `/` on success, display generic error on failure, link to "Forgot password?" and "Sign up"
- [x] T022 [US2] Create `app/src/components/AuthGuard.tsx`: wrapper component that checks `isAuthenticated` from AuthContext, shows loading state while validating, redirects to `/login` if unauthenticated
- [x] T023 [US2] Update `app/src/App.tsx`: add `/login` and `/signup` public routes, wrap existing protected routes (`/`, `/blueprint`, `/journey`, `/profile`, `/credits`) with `AuthGuard`, redirect root `/` to `/login` when unauthenticated
- [x] T024 [US2] Update `app/src/lib/api.ts`: add `loginUser` endpoint, add `fetchCurrentUser` for `GET /user/me`
- [x] T025 [US2] Update `app/src/components/Navbar.tsx`: add logout button that calls `logout()` from AuthContext, conditionally show user avatar/name

**Checkpoint**: User Story 2 complete — login, logout, route protection all working, authenticated users see their data

---

## Phase 5: User Story 3 — Password Recovery via Email (Priority: P2)

**Goal**: Users who forgot their password can request a reset via email. They receive a secure, time-limited link to set a new password. Old password no longer works after reset.

**Independent Test**: Register a user, trigger forgot-password with their email, verify token created in DB, simulate clicking reset link with valid token, set new password, confirm login with new password succeeds and old password fails.

### Implementation for User Story 3

- [x] T026 [US3] Add `forgotPassword` function to `discovery-engine-backend/src/controllers/authController.ts`: validate email with Zod, find user by email (silent fail if not found), generate 32-byte random token, store SHA-256 hash in `password_resets`, send email via emailService with frontend reset URL
- [x] T027 [US3] Add `resetPassword` function to `discovery-engine-backend/src/controllers/authController.ts`: validate token + password with Zod, find valid token by SHA-256 hash, check expiry, hash new password with bcrypt, update user's `password_hash`, mark token as used, return success
- [x] T028 [US3] Update `discovery-engine-backend/src/routes/auth.ts`: add `POST /forgot-password` and `POST /reset-password` routes with Zod validators
- [x] T029 [US3] Create `app/src/pages/ForgotPassword.tsx`: email input form, call `POST /api/auth/forgot-password`, show success message regardless of email existence, link back to login
- [x] T030 [US3] Create `app/src/pages/ResetPassword.tsx`: read `?token=` from URL query params, password + confirm-password form, call `POST /api/auth/reset-password`, show success/error states, redirect to `/login` on success
- [x] T031 [US3] Update `app/src/App.tsx`: add `/forgot-password` and `/reset-password` as public routes
- [x] T032 [US3] Update `app/src/lib/api.ts`: add `requestPasswordReset(email)` and `resetPassword(token, password)` API functions

**Checkpoint**: User Story 3 complete — full password recovery flow works from request to reset

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and documentation updates

- [x] T033 [P] Run `npm run typecheck` in `discovery-engine-backend/` — fix all TypeScript errors (unused vars, missing types)
- [x] T034 [P] Run `npm run lint` in both `app/` and `discovery-engine-backend/` — fix all lint errors
- [x] T035 [P] Run `npm run build` in both `app/` and `discovery-engine-backend/` — verify production builds succeed
- [x] T036 [P] Update `AGENTS.md`: refresh auth section — replace "mock auth" references with real auth summary, document new env vars, update security stance checklist
- [x] T037 [P] Verify all API responses strip `passwordHash` — audit `authController.ts`, `userController.ts`, any serialization helpers
- [x] T038 Seed dummy user migration: ensure `dummyUser` in `discovery-engine-backend/src/data/dummyData.ts` gets a proper `password_hash` on DB init so existing flows don't break
- [x] T039 End-to-end smoke test: register → login → access dashboard → logout → try access dashboard (should redirect) → forgot password → reset → login with new password

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 — can start once DB + middleware ready
- **Phase 4 (US2)**: Depends on Phase 2 + US1 (shares login UI patterns, but backend is independent)
- **Phase 5 (US3)**: Depends on Phase 2 + US1/US2 (requires working user lookup and email service)
- **Phase 6 (Polish)**: Depends on all user stories

### User Story Dependencies

- **US1 (Sign-Up)**: Independent after Phase 2. Backend registration + frontend signup page.
- **US2 (Log-In)**: Independent after Phase 2. Backend login + AuthGuard + route protection.
- **US3 (Password Recovery)**: Depends on US1 (needs registered users) and US2 (needs login flow to verify reset). Can be built after US1+US2 complete.

### Parallel Opportunities

- Within Phase 1: T001, T002, T003 are parallel (different concerns)
- Within Phase 2: T004, T005, T008, T009, T010, T011 are parallel (different files, no cross-deps until T006/T007/T012)
- US1 frontend (T015, T016) and US1 backend (T014, T017) can be parallel
- US2 frontend (T021, T022, T023, T025) and US2 backend (T019, T020, T024) can be parallel
- Phase 6 tasks are all parallel

---

## Parallel Example: User Story 1

```bash
# Backend and frontend can be developed in parallel:
Task: "Rewrite register controller in discovery-engine-backend/src/controllers/authController.ts"
Task: "Create AuthContext in app/src/context/AuthContext.tsx"
Task: "Create Signup page in app/src/pages/Signup.tsx"

# API layer update bridges them:
Task: "Update api.ts with registerUser and Bearer token in app/src/lib/api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Sign-Up)
4. **STOP and VALIDATE**: Register a new user, verify token works, access `/user/me`
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Sign-Up) → Test registration → Demo
3. US2 (Log-In) → Test login/logout/route protection → Demo
4. US3 (Password Recovery) → Test full reset flow → Demo
5. Polish → TypeScript/lint/build clean → Final validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 + Phase 2 together
2. Once Foundational is done:
   - Developer A: US1 (Sign-Up) — backend + frontend
   - Developer B: US2 (Log-In) — backend + frontend + AuthGuard
3. Both merge, then together:
   - Developer A: US3 (Password Recovery) — backend email flow
   - Developer B: US3 (Password Recovery) — frontend reset pages
4. Together: Phase 6 polish and validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- No `passwordHash` should ever reach the frontend — audit all serialization
- The `dummyUser` seed must be updated with a valid bcrypt hash or registration/login flows will fail for pre-seeded accounts
- Zod validation replaces manual validation in `validateRequest.ts` — remove old manual validators for auth routes
- Email service defaults to Ethereal in development — check console for preview URL
