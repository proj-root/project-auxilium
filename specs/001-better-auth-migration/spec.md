# Feature Specification: Better Auth Migration

**Feature Branch**: `001-better-auth-migration`  
**Created**: April 5, 2026  
**Status**: In Clarification  
**Input**: Upgrade authentication system to use Better Auth while preserving current user profile functionality and research Better Auth conventions

---

## Clarifications

### Session April 5, 2026

- Q: User profile storage approach? → A: Separate `userProfile` table linked via userId to user entity (preserve current schema structure)
- Q: Existing user migration needed? → A: No migration required (no existing users). Update current implementations to align with Better Auth schema.
- Q: Email service, 2FA, and OAuth scope? → A: Email service deferred (mock acceptable). 2FA not in scope. **OAuth (Google, GitHub, etc.) IS in scope.**
- Q: Password strength policy? → A: Use Better Auth defaults (PBKDF2/scrypt)
- Q: Session device tracking? → A: Track both browser/device fingerprints AND IP addresses for security auditing

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Login with Email & Password (Priority: P1)

Existing users can log in using their email address and password, exactly as they do in the current system. The user provides credentials, system validates them, and returns a session. All subsequent requests include the session information.

**Why this priority**: Core functionality that must not break. All other features depend on this working identically to the current system.

**Independent Test**: Can be fully tested by attempting login with valid credentials and verifying session is established. Delivers immediate business value—login/logout capability.

**Acceptance Scenarios**:

1. **Given** a user with email "student@school.edu" and correct password, **When** they submit login form, **Then** the system responds with a valid session and user data
2. **Given** a user submitting incorrect password, **When** they attempt login, **Then** the system responds with "Invalid credentials" error  
3. **Given** a user entering non-existent email, **When** they attempt login, **Then** the system responds with "Invalid credentials" error
4. **Given** an active user session, **When** they navigate to protected pages, **Then** pages load with user data (no re-authentication required)
5. **Given** a logged-in user, **When** they click logout, **Then** session is destroyed and protected pages redirect to login

---

### User Story 2 - User Registration with Profile Data (Priority: P1)

New users can register via email/password along with their profile information (first name, last name, course, iChat, student class, admin number). The system creates both a user account and linked profile in a single atomic transaction.

**Why this priority**: Critical for on-boarding. The user profile linkage is a core concept in the current system that must be preserved. Without this, data integrity breaks.

**Independent Test**: Can be tested by registering a new user with full profile data and verifying both user account and profile records exist, linked correctly. Delivers complete registration workflow.

**Acceptance Scenarios**:

1. **Given** valid email and profile data, **When** user registers, **Then** user account and profile are created and linked
2. **Given** duplicate email, **When** user attempts registration, **Then** system rejects with "Email already registered" error
3. **Given** incomplete profile data, **When** user attempts registration, **Then** system validates and shows specific missing field errors
4. **Given** successful registration, **When** user immediately logs in, **Then** session includes both user and profile data

---

### User Story 3 - Session Management & Token Refresh (Priority: P1)

The system automatically manages session state. Short-lived access tokens are refreshed in the background using secure refresh tokens, preventing users from being logged out during active use. Expired/invalid sessions are handled gracefully.

**Why this priority**: Essential for security and user experience. Session management is the backbone of authentication. Must work exactly as current JWT system but via Better Auth's session model.

**Independent Test**: Can be tested by starting a session, waiting for/triggering token expiration, and verifying automatic refresh works without user intervention. Delivers transparent, secure session handling.

**Acceptance Scenarios**:

1. **Given** an active user session with a short-lived access token, **When** the token approaches expiration, **Then** the system automatically refreshes it without user action
2. **Given** an expired/revoked session, **When** user attempts a protected action, **Then** user is redirected to login
3. **Given** multiple concurrent sessions for same user, **When** user logs out from one, **Then** other sessions remain active
4. **Given** refresh token stored in secure HTTP-only cookie, **When** session is checked, **Then** refresh token is never exposed to JavaScript

---

### User Story 4 - Role-Based Access Control (Priority: P1)

Users have assigned roles (e.g., ADMIN, SUPERADMIN, USER) that control access to protected routes and features. The system respects existing role structure and maintains the same access control behavior.

**Why this priority**: Security-critical. Existing authorization logic must not break. Applications and admin pages depend on this.

**Independent Test**: Can be tested by checking that users with specific roles can/cannot access role-restricted features. Delivers access control enforcement.

**Acceptance Scenarios**:

1. **Given** a user with ADMIN role, **When** accessing admin dashboard, **Then** access is granted
2. **Given** a user with USER role, **When** accessing admin dashboard, **Then** access is denied with 403 error
3. **Given** admin role requirement on endpoint, **When** request includes session with admin user, **Then** endpoint processes request normally
4. **Given** role-restricted feature, **When** user session is checked, **Then** role information is available for authorization checks

---

### User Story 5 - User Profile Data Accessibility (Priority: P2)

During authenticated requests, user profile data (firstName, lastName, course, iChat, studentClass, adminNumber, timestamps) is available to both backend and frontend. Profile updates reflect immediately in subsequent requests without re-login.

**Why this priority**: Important for feature development. Many features depend on profile data. Can be developed independently after core auth works.

**Independent Test**: Can be tested by fetching user profile during active session and verifying all fields are present and match registration. Delivers profile data availability.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** accessing protected endpoint, **Then** profile data is available (e.g., in `res.locals.user` on server or Redux state on client)
2. **Given** user profile with all fields populated, **When** making authenticated request, **Then** all profile fields are accessible
3. **Given** user updates profile data (e.g., course), **When** next request is made, **Then** updated profile is reflected

---

### User Story 6 - Admin User Management (Priority: P2)

Admins can view, create, and manage user accounts. This includes creating new users with profile data, and modifying user status/roles. Current admin features continue to work. Note: Password reset is deferred to post-MVP phase (requires email service integration, which is also deferred).

**Why this priority**: Important for operations but can be developed after core auth is stable. Depends on core user/profile functionality.

**Independent Test**: Can be tested by admin performing CRUD operations on users and verifying data persists correctly. Delivers admin management capabilities.

**Acceptance Scenarios**:

1. **Given** admin credentials, **When** accessing user management, **Then** list of users is displayed
2. **Given** admin creating new user via form, **When** submitting with profile data, **Then** user is created with profile attached
3. **Given** admin viewing user details, **When** page loads, **Then** all user and profile fields are visible
4. **Given** admin editing a user, **When** modifying any user/profile field, **Then** changes persist and are reflected in subsequent requests

---

### User Story 7 - OAuth Sign-In (Google & GitHub) (Priority: P2)

Users can sign in using their Google or GitHub accounts. First-time OAuth users have their basic profile auto-populated. Existing email/password users can link OAuth accounts.

**Why this priority**: Important for user convenience and future extensibility. Can be developed after email/password core is stable.

**Independent Test**: Can be tested by attempting OAuth sign-in with test Google/GitHub accounts and verifying session and profile creation. Delivers alternative sign-in convenience.

**Acceptance Scenarios**:

1. **Given** user on login page with OAuth buttons, **When** they click "Sign in with Google", **Then** redirected to Google consent screen and back to app with session
2. **Given** first-time OAuth user, **When** OAuth sign-in completes, **Then** user profile is auto-created with email and name from OAuth provider
3. **Given** existing email/password user, **When** user links OAuth account, **Then** both auth methods work for same user account
4. **Given** OAuth user attempting login, **When** session is established, **Then** role-based access is enforced same as email/password users

---

### Edge Cases

- What happens when a user's profile data is incomplete during migration (no linked profile for existing user)?  
- What happens when password reset is requested but email sending fails?  
- How does the system handle concurrent login attempts from same user on multiple devices?  
- What happens when a user is deleted—should profile be orphaned, deleted, or retained for records?
- What happens when OAuth provider returns limited profile info (no lastName, for example)?
- How does the system handle duplicate accounts (email registered, user tries OAuth with same email)?


## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register with email, password, and profile information in a single atomic operation
- **FR-002**: System MUST allow users to login using email and password  
- **FR-003**: System MUST validate user credentials securely using industry-standard hashing (PBKDF2 or scrypt per Better Auth defaults)
- **FR-004**: System MUST manage sessions with short-lived access tokens and long-lived refresh tokens
- **FR-005**: System MUST automatically refresh access tokens without user intervention when they approach expiration
- **FR-006**: System MUST store refresh tokens in HTTP-only, secure cookies to prevent XSS extraction
- **FR-007**: System MUST enforce role-based access control using existing roles (ADMIN, SUPERADMIN, USER, etc.)
- **FR-008**: System MUST maintain user profile relationships—each user must have exactly one linked profile
- **FR-009**: System MUST preserve all existing user profile fields (firstName, lastName, course, iChat, studentClass, adminNumber)
- **FR-010**: System MUST provide profile data during authenticated requests to both backend and frontend
- **FR-011**: System MUST logout users by destroying their session/refresh token
- **FR-012**: System MUST handle concurrent sessions (same user can have multiple active sessions from different devices)
- **FR-013**: System MUST validate all user input (email format, password strength, profile field completion)
- **FR-014**: System MUST track timestamps (createdAt, updatedAt) for users and profiles as in current system
- **FR-015**: System MUST maintain backward compatibility—no breaking changes to existing API contract
- **FR-016**: System MUST support OAuth sign-in via Google and GitHub providers
- **FR-017**: System MUST auto-populate user profile from OAuth provider data (email, name) on first OAuth sign-in
- **FR-018**: System MUST allow users to link multiple authentication methods to same account (email + Google, email + GitHub, etc.)
- **FR-019**: System MUST track session metadata including device/browser fingerprint and IP address for security auditing
- **FR-020**: System MUST return the same role-based authorization behavior for OAuth users as email/password users
- **FR-021**: System MUST support future extensibility for additional OAuth providers without requiring core refactors

### Key Entities

- **User**: Represents authentication credentials and identity (email, passwordHash, status). OAuth accounts linked via `account` table. Can have multiple authentication methods (email+password, Google OAuth, GitHub OAuth). Primary key: userId.
  
- **UserProfile**: Personal/demographic data (firstName, lastName, course, iChat, studentClass, adminNumber). Linked to User via userId foreign key. Each User has exactly one Profile.

- **Account**: Better Auth's account linking entity. Represents OAuth connections (Google, GitHub) to users. Enables multiple auth methods per user.

- **User-Role Relationship**: Maps users to roles for RBAC. Supports multiple roles per user. Maintains existing role hierarchy (ADMIN, SUPERADMIN, USER, etc.).

- **Session**: Managed by Better Auth. Contains session token, associated userId, expiresAt timestamp. **Includes device/browser fingerprint AND IP address for security tracking.**

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Existing user implementations (current auth code) updated to align with Better Auth schema
- **SC-002**: New user registration completes successfully with email, password, and all profile fields populated
- **SC-003**: User sessions persist across page navigations without re-authentication (session continuity)
- **SC-004**: Access tokens refresh automatically—session does not expire during active use within 30-minute window (15-min token expiry + 5-min auto-refresh trigger = transparent continuity before re-login required)
- **SC-005**: Role-based access control works identically to previous system (same authorization decisions)
- **SC-006**: Profile data is accessible in backend authorization context and frontend Redux store during active sessions
- **SC-007**: 100% of existing authentication tests pass with Better Auth implementation (no auth regressions)
- **SC-008**: Session security verified: refresh tokens only in HTTP-only cookies, access tokens not stored in localStorage as plain text
- **SC-009**: Login/logout response times maintain within 200ms (performance parity with existing system)
- **SC-010**: OAuth sign-in (Google, GitHub) completes successfully and creates session + linked account
- **SC-011**: OAuth users automatically assigned default role (USER) with same RBAC behavior as email/password users
- **SC-012**: Account linking works—same email can authenticate via email+password AND Google OAuth
- **SC-013**: Session metadata (device fingerprint, IP address) captured and auditable for security
- **SC-014**: All edge cases documented and handled with appropriate error messages

## Assumptions

- **No existing user migration needed**: Project has no existing users. Focus is on updating current authentication implementation to Better Auth, not migrating data.

- **UserProfile remains separate**: `userProfile` table will remain as a separate entity linked to Better Auth's `user` table via userId foreign key (not custom fields). This preserves current schema structure.

- **Database schema compatibility**: Better Auth's standard tables will coexist with current `userProfile`, `role`, and `userRole` tables. Drizzle ORM continues as the database layer.

- **Express.js route handler**: Better Auth will be integrated as middleware/route handler in Express.js (server-side), maintaining current server structure.

- **Frontend client library**: React frontend will use `@better-auth/react` client library integrated with Redux state management for consuming session/user data.

- **Email provider deferred**: Email verification and password reset will use mock/console logging in MVP. Real email service (Resend, SendGrid) configured separately later.

- **Session storage in database**: Sessions stored in database primarily (via Better Auth adapter) to match current persistence model.

- **Password hashing**: Use Better Auth's default password hashing (PBKDF2/scrypt). No custom policy enforcement beyond Better Auth defaults.

- **Role model preserved**: Existing `role` and `userRole` tables unchanged. Better Auth session context enriched with role data via auth middleware.

- **OAuth providers in scope**: Google and GitHub OAuth providers will be configured. Account linking enabled (one user can have email + Google + GitHub).

- **Device/IP tracking**: Session metadata will capture browser fingerprint AND IP address for security auditing and concurrent session management.

- **No 2FA in MVP**: Two-factor authentication explicitly out of scope for this migration. Can be added later via Better Auth plugins.

- **No breaking API changes**: Existing API endpoints return same contract (status, message, data structure). Session/auth middleware behavior transparent to route handlers.

---

## Implementation Plan Overview

This section is **not part of the formal specification** but is provided for planning discussion.

### Phase 1: Research & Setup (1-2 days)
- [ ] Verify Better Auth database adapter for PostgreSQL + Drizzle ORM
- [ ] Set up Better Auth in a development branch (install, configure, generate schema)
- [ ] Configure Google & GitHub OAuth apps (get credentials)
- [ ] Design userProfile FOREIGN KEY relationship to Better Auth user table
- [ ] Plan session metadata schema (device fingerprint, IP tracking)

### Phase 2: Backend Integration (3-4 days)
- [ ] Create `server/src/lib/auth.ts` with Better Auth config (database, email/password, OAuth providers)
- [ ] Set up Express route handler for Better Auth (`/api/auth/[...all]/route` pattern or similar)
- [ ] Create/update Drizzle migrations to align with Better Auth schema + userProfile linkage
- [ ] Create route handlers for login, register, logout, refresh endpoints
- [ ] Add session metadata capture (device fingerprint, IP address)
- [ ] Integrate role-based middleware to work with Better Auth sessions
- [ ] Set up account linking for OAuth providers

### Phase 3: Frontend Integration (2-3 days)
- [ ] Create `client/src/lib/auth-client.ts` with Better Auth React client setup (with OAuth providers)
- [ ] Update Redux slices to consume Better Auth session (useSession, getSession)
- [ ] Update login/register/logout components to call Better Auth methods instead of direct API
- [ ] Add OAuth sign-in buttons (Google, GitHub) with callback handlers
- [ ] Integrate token refresh logic (Better Auth handles this, verify it works)
- [ ] Update protected route components to work with new session context
- [ ] Update API interceptor (axios) to not manually inject JWT; let Better Auth handle cookies

### Phase 4: User Profile Integration (1-2 days)
- [ ] Update user registration endpoint to create user + userProfile in one transaction
- [ ] Update user model queries to JOIN with userProfile
- [ ] Ensure profile data available in session context
- [ ] Test OAuth sign-in auto-populates profile from provider (name, email)
- [ ] Test profile updates reflect in subsequent requests

### Phase 5: Testing & Validation (2 days)
- [ ] Test email/password login and logout
- [ ] Test new user registration with profile data
- [ ] Test OAuth sign-in (Google, GitHub)
- [ ] Test account linking (same user, multiple auth methods)
- [ ] Test role-based access control
- [ ] Test concurrent sessions with device tracking
- [ ] Test session refresh under various conditions
- [ ] Test session metadata auditing (device, IP captured)
- [ ] Run full auth test suite
- [ ] Manual testing of user flows

### Phase 6: Cleanup & Documentation (1 day)
- [ ] Remove old JWT token generation/validation logic
- [ ] Remove old auth middleware that's no longer needed
- [ ] Verify no dead code paths
- [ ] Document new auth structure and OAuth setup for maintainers
- [ ] Create OAuth app setup guide (credentials, callback URLs)
- [ ] Document session metadata schema and auditing

---

## Next Steps

This specification has been **clarified and validated**. All critical design decisions are locked in:

✅ Separate userProfile table linked via userId  
✅ No user migration (no existing users)  
✅ OAuth (Google, GitHub) IS in scope  
✅ Email service deferred (mock acceptable)  
✅ 2FA not in scope  
✅ Better Auth password defaults  
✅ Device/IP tracking enabled  

**Ready to proceed to planning phase**: Use `/speckit.plan` to generate detailed design artifacts and task breakdown.
