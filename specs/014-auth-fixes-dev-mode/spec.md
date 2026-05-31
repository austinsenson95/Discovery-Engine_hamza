# Feature Specification: Auth Bug Fixes & Developer Login Mode

**Feature Branch**: `[014-auth-fixes-dev-mode]`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "the login is not working, also make a developer login mode where the email input is dev and password is password, also if logged in as dev, always add 999 credits to each session the dev logs in"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fix Login Not Working (Priority: P1)

A user tries to log in to the Discovery Engine app with valid credentials, but the login fails due to a CORS configuration mismatch between the frontend dev server port and the backend allowed origins.

**Why this priority**: The login flow is completely broken. No user can access the platform.

**Independent Test**: Start both frontend and backend dev servers, open the login page, enter valid credentials, and verify successful login with dashboard redirect.

**Acceptance Scenarios**:

1. **Given** the frontend dev server runs on any localhost port, **When** a user opens the login page and submits valid credentials, **Then** the login API call succeeds and the user is redirected to the dashboard.
2. **Given** an unauthenticated user visits any protected route, **When** the page loads, **Then** the auth context should not make unnecessary API calls that fail with CORS errors before login.

---

### User Story 2 - Developer Login Mode (Priority: P1)

A developer needs quick access to the platform without creating a real account. They can log in using email "dev" and password "password". A dev account is automatically created if it does not exist. Every time the dev logs in, their credit balance is reset to 999.

**Why this priority**: Essential for development and testing. The dev mode eliminates friction for developers testing credit-consuming features.

**Independent Test**: Log in with "dev"/"password", verify the account exists, verify 999 credits, log out, log in again, and verify credits are still 999.

**Acceptance Scenarios**:

1. **Given** no dev account exists, **When** a developer logs in with email "dev" and password "password", **Then** a dev user is created automatically and the developer is authenticated with 999 credits.
2. **Given** a dev account exists with less than 999 credits, **When** the developer logs in again, **Then** their credits are updated to 999 and they are authenticated.
3. **Given** a regular user account, **When** they log in, **Then** their credits are not modified from their actual balance.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The backend CORS configuration MUST allow all localhost origins in development mode so the frontend dev server works regardless of which port it binds to.
- **FR-002**: The frontend auth context MUST not make authenticated API calls on public pages (login, signup, forgot-password) before the user has logged in.
- **FR-003**: The backend login endpoint MUST support a special developer login with email "dev" and password "password".
- **FR-004**: If the dev user does not exist, the system MUST create it automatically on the first dev login attempt.
- **FR-005**: On every successful dev login, the system MUST set the dev user's credits to 999.
- **FR-006**: The dev login flow MUST use the same JWT token mechanism as regular users.
- **FR-007**: The dev user MUST be visually distinguishable in the UI (e.g., a "DEV MODE" badge).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Login works on the first attempt from a fresh browser session with zero console errors.
- **SC-002**: Dev login completes in under 2 seconds from form submit to dashboard.
- **SC-003**: Dev user always has exactly 999 credits visible in the UI after login.

## Assumptions

- The dev login is intended for local development only; it does not need production hardening.
- The frontend dev server may bind to any available port (5173, 5174, etc.).
