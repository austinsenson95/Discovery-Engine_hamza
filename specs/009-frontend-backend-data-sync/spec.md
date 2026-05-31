# Feature Specification: Frontend Real-Time Data Sync

**Feature Branch**: `009-frontend-backend-data-sync`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "Fix all mock data issues by making them real-time. The My Journey section always shows static data so does the credits display at the top bar. Check through the front end like the settings bar dark/light mode toggle is not working along with a lot of other features."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Credits and User Info Display (Priority: P1)

As a logged-in user, when I navigate to any page in the Discovery Engine app, I want to see my actual credit balance and my real name/avatar in the navbar, sidebar, dashboard, and profile pages so that I always have accurate information about my account.

**Why this priority**: Credits are the core currency of the platform. Users making blueprint decisions need to know their real balance. Showing static "100 credits" when the user has fewer leads to confusion and failed API calls.

**Independent Test**: Load the dashboard and verify the credit badge in the navbar matches the value returned by `/api/user/credits`. Verify the sidebar shows the user's actual name from `/api/user/me`.

**Acceptance Scenarios**:

1. **Given** a user with 85 credits, **When** they open the dashboard, **Then** the navbar shows "85 credits" and the sidebar shows their real name
2. **Given** a user updates their profile name, **When** they save changes, **Then** the sidebar and navbar reflect the new name without a page refresh
3. **Given** a user completes a blueprint step that deducts credits, **When** the step finishes, **Then** the credit display updates to the new balance

---

### User Story 2 - Dynamic My Journey Page (Priority: P1)

As a user who has started or completed blueprint steps, I want the My Journey page to show my actual progress timeline, real achievements based on my blueprint state, and recent activity pulled from the backend so that the page reflects my real work instead of generic placeholder data.

**Why this priority**: The Journey page is a key engagement surface. Static data makes users feel the platform is broken or not personalized, reducing trust and completion rates.

**Independent Test**: Navigate to My Journey after completing Niche Discovery. The timeline should show Niche Discovery as completed, Audience Mapping as in-progress, and the activity feed should include the real niche discovery event.

**Acceptance Scenarios**:

1. **Given** a user has completed Niche Discovery and Audience Mapping, **When** they visit My Journey, **Then** the timeline shows steps 1-2 as completed, step 3 as in-progress, with real dates
2. **Given** a user downloads their first PDF blueprint, **When** they visit My Journey, **Then** the "PDF Pro" achievement appears as earned
3. **Given** a user has blueprint activity in the database, **When** they view the Recent Activity section, **Then** it displays actual events with human-readable relative times (e.g., "2 hours ago")

---

### User Story 3 - Working Dark/Light Mode Toggle (Priority: P2)

As a user viewing the app, I want the theme toggle in my profile settings to actually switch the entire application between light and dark modes so that I can use the app comfortably in different lighting conditions.

**Why this priority**: Accessibility and user comfort. A non-functional toggle is a broken feature that degrades perceived quality.

**Independent Test**: Go to Profile settings, click the Dark mode button, and verify the entire app background switches to dark with appropriate text contrast.

**Acceptance Scenarios**:

1. **Given** the app is in light mode, **When** the user clicks the Dark theme button in Profile settings, **Then** the app switches to dark mode with dark backgrounds and light text
2. **Given** the user selected dark mode, **When** they reload the page, **Then** the dark mode preference is persisted and restored
3. **Given** the app is in dark mode, **When** the user clicks the Light theme button, **Then** the app switches back to light mode

---

### User Story 4 - Real-Time Dashboard Data (Priority: P2)

As a user on the Dashboard home page, I want to see my real blueprint progress, actual credit usage, and real recent activity instead of hardcoded mock data so that the dashboard is actually useful.

**Why this priority**: The dashboard is the first screen users see. It must be personalized and accurate to build trust and guide users to their next step.

**Independent Test**: Open the dashboard after completing some blueprint steps. The progress ring, current step card, and activity list should all reflect real data.

**Acceptance Scenarios**:

1. **Given** a user has a blueprint at 35% progress, **When** they view the dashboard, **Then** the progress ring shows 35% and the current step card shows "Audience Mapping"
2. **Given** a user has used 20 credits, **When** they view the dashboard, **Then** the credits used card shows "20 / 100" with the correct progress bar
3. **Given** a user has recent blueprint activity, **When** they view the Recent Activity section, **Then** it shows real events instead of the static placeholder list

---

### User Story 5 - Profile Page with Real Data and Credit History (Priority: P2)

As a user viewing my Profile page, I want to see my actual profile information, real credit balance, real blueprint count, and a credit transaction history pulled from the backend so that I can track my usage.

**Why this priority**: Users need transparency into their credit usage and account details. Fake data makes the platform feel untrustworthy.

**Independent Test**: Open the Profile page and verify the name, email, credits, and blueprint count match the API responses.

**Acceptance Scenarios**:

1. **Given** a user has a profile with name "Alice Smith", **When** they visit the Profile page, **Then** the account section shows "Alice Smith" and the real email
2. **Given** a user has used credits on niche discovery and audience mapping, **When** they view the Credit History table, **Then** it shows the actual deductions with dates and running balance
3. **Given** a user has created 2 blueprints, **When** they view the Profile quick stats, **Then** the blueprint count shows 2

---

### Edge Cases

- What happens when the user has no blueprints yet? Dashboard and Journey should show empty/zero states, not crash or show stale data.
- What happens when the API is unreachable? All pages should gracefully fall back to empty states with appropriate messaging, not show old mock data.
- How does the system handle a brand new user with no activity? The activity feed should be empty with a friendly message.
- What happens when a blueprint step is in-progress but not completed? Timeline should show it as in-progress with a spinner icon.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The frontend MUST fetch the current user's profile from `/api/user/me` on app load and cache it for use across Navbar, Sidebar, Dashboard, and Profile pages
- **FR-002**: The frontend MUST fetch the current credit balance from `/api/user/credits` and display it in the Navbar credit badge, updating after any credit-deducting action
- **FR-003**: The backend MUST expose a new `GET /api/user/activity` endpoint that returns the user's recent activity items from the database, ordered by most recent
- **FR-004**: The backend MUST expose a new `GET /api/user/achievements` endpoint that computes achievement status based on the user's actual blueprint data
- **FR-005**: The backend MUST expose a new `GET /api/user/credit-history` endpoint that returns a chronological list of credit deductions with dates, actions, and running balances
- **FR-006**: The My Journey page MUST derive timeline step status from the user's blueprint `currentStep` and `progress` fields instead of a hardcoded array
- **FR-007**: The My Journey page MUST fetch achievements from `/api/user/achievements` and display earned/unlocked states dynamically
- **FR-008**: The My Journey page MUST fetch recent activity from `/api/user/activity` and render it with human-readable relative timestamps
- **FR-009**: The Dashboard MUST use the real user profile for the welcome message and real blueprint data for progress, stats, and activity sections
- **FR-010**: The Profile page MUST use real user data for the account card, real credits for the balance display, and real credit history for the transactions table
- **FR-011**: The theme toggle in Profile settings MUST apply a dark mode class to the document root and persist the preference in `localStorage`
- **FR-012**: The theme toggle MUST restore the persisted preference on app initialization
- **FR-013**: All data-fetching components MUST handle loading states with appropriate skeletons or spinners
- **FR-014**: All data-fetching components MUST handle API errors gracefully, showing empty states or error messages rather than crashing

### Key Entities *(include if feature involves data)*

- **UserProfile**: The authenticated user's profile (name, email, avatar, language, credits, createdAt). Sourced from `/api/user/me`.
- **CreditBalance**: The user's current credit balance and deduction costs. Sourced from `/api/user/credits`.
- **CreditTransaction**: A single credit usage event (date, action description, credit delta, running balance). Sourced from `/api/user/credit-history`.
- **Achievement**: A user milestone (id, title, description, icon, earned status, earnedAt). Computed server-side from blueprint state.
- **TimelineStep**: A wizard step in the user's journey (id, title, status, detail, timestamp). Derived from blueprint `currentStep`.
- **ActivityItem**: A recent event in the user's history (id, title, description, type, createdAt). Sourced from `/api/user/activity`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The credit badge in the navbar always shows the real balance within 2 seconds of page load and updates within 1 second after any credit-deducting action
- **SC-002**: The My Journey page shows real timeline progress derived from blueprint state, with 100% of steps matching the user's actual `currentStep`
- **SC-003**: The Dashboard welcome message displays the user's real name, and all stats cards show real data from API responses
- **SC-004**: The theme toggle switches the entire app between light and dark modes within 500ms, and the preference persists across page reloads
- **SC-005**: Zero hardcoded mock data remains in Navbar, Home, Journey, Profile, or Sidebar components — all user-facing data comes from API endpoints
- **SC-006**: All new API endpoints respond in under 200ms for typical user data sizes (under 100 activities, under 50 transactions)

## Assumptions

- The existing SQLite database schema for blueprints and activities is sufficient; only new API endpoints and frontend data fetching are needed
- The `next-themes` package mentioned in the project stack will be used for theme management
- The mock auth system (dummy user) on the backend is acceptable for this feature; real JWT auth is out of scope
- Credit transactions will be computed from existing activity records and credit deductions; a dedicated transactions table is not required for v1
- Human-readable relative timestamps (e.g., "2 hours ago") will be computed on the frontend using a utility like `date-fns`
- Loading and error states will use existing shadcn/ui components (Skeleton, Alert) where available
