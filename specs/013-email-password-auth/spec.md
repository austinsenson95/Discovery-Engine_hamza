# Feature Specification: Email & Password Authentication with Password Recovery

**Feature Branch**: `[013-email-password-auth]`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "add user login using email and password functionality where a new user can sign up to the app also old users should be able to login with their mail id and password, also add a password recovery functionality where they can reset password using their email, make the backend and database changes to this as well"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User Sign-Up (Priority: P1)

A prospective coach or consultant visits the Discovery Engine platform for the first time and wants to create an account so they can start building their coaching blueprint. They provide their name, email address, and a secure password. After successful registration, they are automatically logged in and can begin using the platform.

**Why this priority**: User registration is the entry point to the entire platform. Without the ability to create accounts, new users cannot access any blueprint, payment, or progress-tracking features. This is the foundational gate for user acquisition.

**Independent Test**: Can be fully tested by attempting to register with a new email address and verifying the user can immediately access protected pages (dashboard, blueprint wizard) without manual intervention.

**Acceptance Scenarios**:

1. **Given** a visitor is on the sign-up page, **When** they enter a valid name, unique email, and password that meets security requirements, **Then** their account is created and they are authenticated and redirected to the dashboard.
2. **Given** a visitor tries to register with an email that already exists, **When** they submit the form, **Then** they receive a clear error message and are prompted to log in instead.
3. **Given** a visitor enters incomplete or invalid information (e.g., malformed email, weak password), **When** they submit the form, **Then** they see specific validation messages and the form is not submitted.

---

### User Story 2 - Existing User Log-In (Priority: P1)

A returning user who has previously registered wants to access their account, view their blueprint progress, and continue working. They enter their registered email and password on the login page and gain access to all their data.

**Why this priority**: Login is essential for returning users to access their persisted data, credits, blueprints, and payment history. Without it, every visit would feel like starting from scratch, destroying user trust.

**Independent Test**: Can be fully tested by registering a user, logging out, then logging back in with the same credentials and confirming all previously created data (blueprints, credits, profile) is intact.

**Acceptance Scenarios**:

1. **Given** a registered user is on the login page, **When** they enter their correct email and password, **Then** they are authenticated and redirected to the dashboard with full access to their data.
2. **Given** a user enters an email that does not exist, **When** they submit the login form, **Then** they receive a generic authentication-failure message that does not reveal whether the email exists.
3. **Given** a user enters a correct email but wrong password, **When** they submit the login form, **Then** they receive the same generic authentication-failure message.
4. **Given** an authenticated user is browsing the platform, **When** they click "Log Out", **Then** their session is terminated and they are redirected to the login page.

---

### User Story 3 - Password Recovery via Email (Priority: P2)

A registered user has forgotten their password and cannot log in. They request a password reset by entering their email address. They receive a secure, time-limited link via email that allows them to set a new password. After resetting, they can log in with the new password.

**Why this priority**: Password recovery reduces support burden and prevents user churn. Users forget passwords frequently; without a self-service reset flow, they would abandon the platform. This is a standard expectation for any account-based system.

**Independent Test**: Can be fully tested by registering a user, triggering a password reset, receiving the email (or simulating the token), setting a new password, and successfully logging in with the new password while the old password no longer works.

**Acceptance Scenarios**:

1. **Given** a registered user is on the "Forgot Password" page, **When** they enter their registered email address, **Then** they receive a confirmation message (even if the email is not registered, for privacy) and, if registered, an email with a secure reset link.
2. **Given** a user clicks a valid password-reset link from their email, **When** they enter and confirm a new password that meets security requirements, **Then** their password is updated and they receive confirmation that they can now log in.
3. **Given** a user clicks an expired or invalid reset link, **When** they attempt to set a new password, **Then** they receive an error message and are instructed to request a new reset link.
4. **Given** a user resets their password, **When** they try to log in with their old password, **Then** access is denied; logging in with the new password succeeds.

---

### Edge Cases

- What happens when a user attempts to register with a password that does not meet minimum security requirements (e.g., too short, no complexity)?
- How does the system handle repeated failed login attempts to prevent brute-force attacks?
- What happens if a user requests multiple password-reset emails in quick succession?
- How does the system behave if a user tries to use a password-reset link after they have already successfully reset their password?
- What happens when an authenticated user's session expires while they are actively using the platform?
- How are users with existing in-memory accounts migrated when persistent storage is introduced?
- What happens if the email delivery service is temporarily unavailable when a user requests a password reset?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow new users to create an account using their full name, a unique email address, and a password.
- **FR-002**: The system MUST enforce minimum password security requirements (minimum length and complexity) during registration and password reset.
- **FR-003**: The system MUST validate that the email address is properly formatted and unique before allowing registration.
- **FR-004**: The system MUST allow registered users to authenticate using their email address and password.
- **FR-005**: The system MUST maintain an authenticated session so users can access protected pages without re-entering credentials on every request.
- **FR-006**: The system MUST allow users to terminate their session (log out) from any page.
- **FR-007**: The system MUST provide a "Forgot Password" flow that accepts an email address and sends a secure, time-limited reset link.
- **FR-008**: The system MUST verify that a password-reset token is valid and not expired before allowing a password change.
- **FR-009**: The system MUST update the user's password immediately after a successful reset and invalidate all existing sessions for that user.
- **FR-010**: The system MUST store user account data persistently so that accounts, credentials, and profiles survive application restarts.
- **FR-011**: The system MUST protect all authenticated routes so that unauthenticated users are redirected to the login page.
- **FR-012**: The system MUST return generic, non-revealing error messages for authentication failures to prevent user enumeration attacks.

### Key Entities *(include if feature involves data)*

- **User Account**: Represents a registered person on the platform. Contains profile information (name, email, avatar), authentication credentials, credit balance, language preference, and timestamps for creation and last update.
- **Password Reset Token**: A temporary, single-use credential tied to a user account. Has a defined expiration time and is invalidated once used or superseded by a newer request.
- **Session**: An authenticated state tied to a user account. Has a defined lifetime and is terminated on explicit logout or password change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New users can complete registration in under 90 seconds from landing on the sign-up page to viewing the dashboard.
- **SC-002**: Returning users can log in and reach their dashboard in under 30 seconds.
- **SC-003**: Password-reset emails are delivered to users within 2 minutes of request.
- **SC-004**: 95% of users successfully complete their first login or registration attempt without needing support.
- **SC-005**: Zero account data is lost when the application restarts or is redeployed.
- **SC-006**: All authenticated pages are inaccessible to unauthenticated users, with seamless redirection to login.

## Assumptions

- Users have access to a valid email inbox and can receive messages from the platform.
- Users understand basic password security and can create passwords meeting minimum requirements.
- Existing users created before this feature (in-memory mock accounts) may need to re-register or be manually migrated.
- Mobile browser support is required for all auth flows, but native mobile apps are out of scope.
- The platform operates under standard data-privacy practices; GDPR/CCPA compliance specifics are handled as a separate future concern.
- An external email-delivery service will be available for sending password-reset emails.
