# Tasks: Better Auth Migration

**Feature Branch**: `001-better-auth-migration`  
**Status**: Ready for Implementation  
**Input**: Complete design artifacts from planning phase  
**Total Tasks**: 123 tasks across 10 implementation phases

---

## Task Format Reference

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

- **[TaskID]**: Sequential identifier (T001, T002, etc.) in execution order
- **[P]**: Parallelizable (can run in parallel with other [P] tasks)
- **[Story]**: User story label for story-specific tasks (US1, US2, etc.)
- **Description**: Clear action with specific file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project, verify dependencies, create feature branch  
**Effort**: ~4 hours  
**Blocking**: All subsequent phases

- [ ] T001 Verify npm dependencies: install `better-auth`, `@better-auth/drizzle`, `@better-auth/react` in root package.json and build workspaces
- [ ] T002 Create `.env.example` in server/ with BETTER_AUTH_SECRET, GOOGLE_OAUTH_ID, GOOGLE_OAUTH_SECRET, GITHUB_OAUTH_ID, GITHUB_OAUTH_SECRET placeholders
- [ ] T003 [P] Initialize Drizzle migration generation with `npx drizzle-kit generate:pg` (empty migration files created but not run)

---

## Phase 2: Foundational (Database & Core Infrastructure)

**Purpose**: Set up database schema, Better Auth configuration, shared utilities  
**Effort**: ~8 hours  
**Blocking**: All user story work
**Checkpoint**: Foundation ready - auth endpoints ready for testing

### Database Schema & Migrations

- [ ] T004 Update `server/src/db/schema.ts`: Add Better Auth core tables (user, account, session) with full column definitions and indexes per data-model.md
- [ ] T005 [P] Update `server/src/db/schema.ts`: Add custom tables (userProfile with userId FK, update userRole type to match user.id UUID type)
- [ ] T006 [P] Update `server/src/db/relations.ts`: Define relationships (user ↔ userProfile one-to-one, user ↔ account one-to-many, user ↔ session one-to-many, user ↔ userRole many-to-many)
- [ ] T007 Generate Drizzle migrations for schema changes: `npx drizzle-kit generate:pg` creates migration files in `server/drizzle/`
- [ ] T008 Run migration in development: `npx drizzle-kit push:pg` applies schema to PostgreSQL database
- [ ] T009 [P] Create `server/src/db/seed-auth.ts`: Add seed data (test user with profile, test roles) for development/testing

### Better Auth Configuration

- [ ] T010 Create `server/src/lib/auth.ts`: Initialize Better Auth with Drizzle PostgreSQL adapter, session config (24h access, 7d refresh), PBKDF2 password hashing, database hooks for user creation lifecycle
- [ ] T011 [P] Create `server/src/lib/device-tracker.ts`: Utility to extract IP address from request headers (X-Forwarded-For, CF-Connecting-IP) and generate device fingerprint from User-Agent
- [ ] T012 [P] Create `server/src/lib/profile-builder.ts`: Utility function for atomic user+profile creation using `db.transaction()` - creates user in auth layer, then userProfile with matching userId
- [ ] T013 [P] Create `server/src/features/auth/lib/auth-hooks.ts`: Better Auth database hooks (onCreate, onUpdate) to dispatch custom logic (profile creation, role assignment, logging)

### Middleware & Integration

- [ ] T014 Update `server/src/middleware/auth.middleware.ts`: Replace JWT verification with Better Auth session verification using `auth.api.getSession()`, extract user + profile + roles into `res.locals.user`
- [ ] T015 [P] Update `server/src/app.ts`: Register Better Auth handler at `app.use('/api/auth', auth.handler)` before other routes
- [ ] T016 [P] Update `server/src/lib/catch-async.ts`: Ensure async error wrapper works with Better Auth session errors
- [ ] T017 [P] Create `server/src/lib/validators.ts`: Validation schemas for register input (email, password, profile fields using Zod or joi)

### Frontend Auth Client Setup

- [ ] T018 Create `client/src/lib/auth-client.ts`: Initialize `@better-auth/react` client with server API URL, session config, auth hooks
- [ ] T019 [P] Update `client/src/lib/api.ts`: Remove manual JWT injection from axios interceptors; rely on cookies for session persistence
- [ ] T020 [P] Create `client/src/hooks/use-auth.ts`: Custom hook wrapping Better Auth `useSession()` for session data retrieval
- [ ] T021 [P] Create `client/src/types/auth.types.ts`: TypeScript types for User, Profile, Session, OAuth response shapes

**Checkpoint**: Database schema defined, Better Auth configured, session storage working. API can now receive authenticated requests.

---

## Phase 3: User Story 1 & 2 - Email Registration & Login (Priority: P1)

**Goal**: Users can register with email/password/profile data and login  
**Independent Test**: Register new user, verify user+profile created, login with credentials, verify session established  
**Effort**: ~16 hours (3 days)  
**Dependencies**: Phase 2 complete

### Story 1 & 2: Backend Implementation

- [ ] T022 [US1] [US2] Create `server/src/features/auth/auth.controller.ts`: 
  - `register` controller: Accept email, password, profile fields; call profile-builder for atomic creation; return user+profile+session
  - `login` controller: Accept email, password; validate via Better Auth; return user+profile+session on success
  - `logout` controller: Destroy session via Better Auth
- [ ] T023 [P] [US1] [US2] Create `server/src/features/auth/auth.route.ts`: 
  - POST `/api/auth/register` → register controller with validation middleware
  - POST `/api/auth/login` → login controller with validation middleware
  - POST `/api/auth/logout` → logout controller with auth middleware
  - GET `/api/auth/session` → return current session (test endpoint)
- [ ] T024 [P] [US2] Create `server/src/features/user/user.model.ts`: 
  - `createUserWithProfile()` - atomic transaction wrapper (already defined in profile-builder)
  - `getUserById(id)` - query user with joined profile + roles
  - `getUserByEmail(email)` - query user by email for login validation
  - `getUserProfile(userId)` - fetch userProfile by userId
  - Update existing queries to use new schema (user.id instead of uid, join userProfile on userId)
- [ ] T025 [P] [US1] [US2] Update `server/src/features/auth/lib/profile-builder.ts`: 
  - Implement atomic user+profile creation within transaction
  - Assign default role (USER) via userRole junction
  - Handle profile validation errors with specific error messages per field
  - Return fully hydrated user object with profile

### Story 1 & 2: Frontend Implementation

- [ ] T026 [US1] [US2] Create `client/src/features/auth/api-slices/register-api-slice.ts`: 
  - RTK Query endpoint for POST `/api/auth/register`
  - Accept RegisterPayload (email, password, profile fields)
  - Return UserResponse (user, profile, session)
  - Error handling for duplicate email, validation errors
- [ ] T027 [P] [US1] [US2] Create `client/src/features/auth/api-slices/login-api-slice.ts`: 
  - RTK Query endpoint for POST `/api/auth/login`
  - Accept LoginPayload (email, password)
  - Return UserResponse (user, profile, session)
  - Error handling for invalid credentials
- [ ] T028 [P] [US1] [US2] Create `client/src/features/auth/api-slices/logout-api-slice.ts`:
  - RTK Query endpoint for POST `/api/auth/logout`
  - Clear session on client (Redux, cookies)
  - Return success message
- [ ] T029 [P] [US1] [US2] Update `client/src/features/auth/state/auth-slice.ts`:
  - Replace JWT token state with Better Auth session state
  - Actions: setSession, clearSession, setUser, setProfile
  - Selectors: selectSession, selectUser, selectProfile, selectIsAuthenticated
  - Initialize from server session on app load
- [ ] T030 [P] [US2] Create `client/src/features/auth/components/register-form.tsx`:
  - Form with email, password, password confirm, firstName, lastName, course, iChat, studentClass, adminNumber
  - React Hook Form with Zod validation
  - Call registerApiSlice on submit
  - On success, redirect to login or dashboard (configurable)
  - Display validation errors per field
- [ ] T031 [P] [US1] Create `client/src/features/auth/components/login-form.tsx`:
  - Form with email, password
  - React Hook Form with Zod validation
  - Call loginApiSlice on submit
  - On success, redirect to dashboard and populate Redux session
  - Display "Invalid credentials" error on failure
- [ ] T032 [P] [US1] [US2] Update `client/src/features/auth/routes/login.tsx`:
  - Render LoginForm and RegisterForm tabs (or separate pages)
  - Redirect to dashboard if already authenticated
  - Display loading state during submission
- [ ] T033 [P] [US1] [US2] Update `client/src/features/auth/routes/register.tsx`:
  - Render RegisterForm
  - Redirect to login on success or if already authenticated
  - Display form validation errors and API errors

### Story 1 & 2: Integration

- [ ] T034 [US1] [US2] Update `server/src/features/user/user.controller.ts` (admin endpoints):
  - Update createUser to use profile-builder (atomic creation)
  - Update getUser, updateUser to handle new profile relationship (joins)
  - All existing admin user endpoints now work with new schema
- [ ] T035 [P] [US1] [US2] Create `server/src/features/auth/lib/password-validator.ts`:
  - Validate password strength (Better Auth defaults acceptable)
  - Provide user-friendly error messages
- [ ] T036 [P] [US1] [US2] Create `client/src/lib/auth-validation.ts`:
  - Shared Zod schemas for register form validation
  - Email format, password requirements, profile field lengths
  - Match server-side validation

**Checkpoint**: Login/register complete. User sessions established. User & profile data persisted. Ready for session management enhancements.

---

## Phase 4: User Story 3 - Session Management & Token Refresh (Priority: P1)

**Goal**: Sessions refresh transparently; expired sessions redirect to login  
**Independent Test**: Login, wait/force token expiry, verify auto-refresh without re-auth, verify expired session redirects to login  
**Effort**: ~8 hours  
**Dependencies**: Phase 3 complete

### Backend: Session Refresh

- [ ] T037 [US3] Update `server/src/lib/auth.ts`: Configure Better Auth session refresh behavior
  - Access token: 15-minute expiry (short-lived)
  - Refresh token: 7-day expiry (long-lived)
  - Refresh endpoint: Allow client to refresh session without re-login
- [ ] T038 [P] [US3] Create `server/src/features/auth/auth.controller.ts` (extend with refresh):
  - `refreshSession` controller: Accept refresh token; call Better Auth to issue new access token; return updated session
- [ ] T039 [P] [US3] Update `server/src/features/auth/auth.route.ts`:
  - POST `/api/auth/refresh` → refreshSession controller
- [ ] T040 [P] [US3] Update `server/src/middleware/auth.middleware.ts`:
  - Catch expired session errors
  - Attempt auto-refresh via refresh token
  - If refresh fails, return 401 Unauthorized (force re-login on client)

### Frontend: Auto-Refresh & Session Continuity

- [ ] T041 [US3] Create `client/src/features/auth/state/session-middleware.ts`:
  - Redux listener middleware monitoring session state
  - Trigger auto-refresh when access token expiry is near (within 5 min)
  - Call refreshSession endpoint
  - Update Redux session on success; redirect to login on failure
- [ ] T042 [P] [US3] Update `client/src/features/auth/components/protected-route.tsx`:
  - Wrap protected routes; check session existence
  - Redirect to login if no session
  - Display loading state while session is being verified/refreshed
- [ ] T043 [P] [US3] Update `client/src/lib/api.ts` (axios interceptors):
  - Add response interceptor for 401 Unauthorized
  - Attempt auto-refresh via refreshSession endpoint
  - Retry original request with new token
  - Redirect to login if refresh fails
- [ ] T044 [P] [US3] Create `client/src/features/auth/hooks/use-session-refresh.ts`:
  - Custom hook for monitoring session expiry
  - Trigger refresh before expiry
  - Handle refresh errors gracefully
- [ ] T045 [P] [US3] Update `client/src/features/auth/state/auth-slice.ts`:
  - Add sessionExpiryTime state field
  - Selectors: selectSessionExpiresAt, selectIsSessionExpiring
  - Actions: updateSessionExpiry, setRefreshError

### Integration & Validation

- [ ] T046 [US3] Create test scenario documentation `specs/001-better-auth-migration/test-scenarios-session.md`:
  - Test case: Login, verify session established
  - Test case: Wait 15 min, verify auto-refresh occurs without user action
  - Test case: Manually expire token, verify 401 triggers refresh
  - Test case: Logout after refresh, verify session destroyed
- [ ] T047 [P] [US3] Update error handling `server/src/middleware/errors.middleware.ts`:
  - Return 401 for expired sessions (not 403)
  - Return 500 for session lookup errors
  - Include actionable error messages

**Checkpoint**: Sessions auto-refresh transparently. Expired sessions redirect to login. User experience maintains continuity during navigation.

---

## Phase 5: User Story 4 - Role-Based Access Control (Priority: P1)

**Goal**: Users assigned roles controls feature/endpoint access  
**Independent Test**: Login as ADMIN user, verify admin endpoints accessible; login as USER, verify admin endpoints return 403  
**Effort**: ~6 hours  
**Dependencies**: Phase 3 complete (login working)

### Backend: RBAC Middleware

- [ ] T048 [US4] Create `server/src/middleware/rbac.middleware.ts`:
  - `verifyRole([roles])` middleware factory
  - Extract roles from `res.locals.user.roles` (populated by auth middleware)
  - Return 403 Forbidden if user lacks required role
  - Support multiple role requirements (AND logic)
- [ ] T049 [P] [US4] Update `server/src/features/auth/lib/auth-hooks.ts`:
  - Database hook: On user creation, assign default USER role via userRole junction
  - Support role assignment during registration
- [ ] T050 [P] [US4] Update `server/src/middleware/auth.middleware.ts`:
  - Fetch user roles from userRole junction + role table
  - Populate `res.locals.user.roles` with role objects
  - Include role names for authorization checks

### Backend: Protected Routes

- [ ] T051 [US4] Update admin routes `server/src/features/user/user.route.ts`:
  - Apply `verifyRole([Roles.ADMIN])` middleware to all admin endpoints
  - GET `/api/users` (list users) - requires ADMIN
  - GET `/api/users/:id` (view user) - requires ADMIN
  - POST `/api/users` (create user) - requires ADMIN
  - PUT `/api/users/:id` (update user) - requires ADMIN
- [ ] T052 [P] [US4] Update `server/src/features/events/events.route.ts`:
  - Apply role-based access to event creation (if event creation restricted to ADMIN)
  - Example: POST `/api/events` - requires ADMIN or EVENT_MANAGER

### Frontend: RBAC Enforcement

- [ ] T053 [US4] Update `client/src/features/auth/state/auth-slice.ts`:
  - Add `roles` field to session state
  - Selector: `selectUserRoles`
  - Helper: `selectHasRole(roleName)`
- [ ] T054 [P] [US4] Create `client/src/features/auth/components/require-role.tsx`:
  - Wrapper component checking user role
  - Redirect to unauthorized page if role missing
  - Render children if role present
- [ ] T055 [P] [US4] Create `client/src/features/admin/routes/admin-layout.tsx`:
  - Apply RequireRole([Roles.ADMIN]) wrapper
  - Display admin-only UI elements
  - Redirect unauthorized users to dashboard

### Validation

- [ ] T056 [US4] Create test scenario `specs/001-better-auth-migration/test-scenarios-rbac.md`:
  - Test: ADMIN user can access `/api/users` endpoint
  - Test: USER user cannot access `/api/users` (403)
  - Test: USER redirected from /admin page
  - Test: SUPERADMIN bypasses all role checks

**Checkpoint**: RBAC enforced across backend and frontend. Existing admin functionality preserved. No unauthorized access possible.

---

## Phase 6: User Story 5 - User Profile Data Accessibility (Priority: P2)

**Goal**: Profile data (firstName, lastName, etc.) accessible in auth context during all authenticated requests  
**Independent Test**: Login, fetch protected endpoint, verify profile fields in response/state  
**Effort**: ~6 hours  
**Dependencies**: Phase 3 complete

### Backend: Profile in Auth Context

- [ ] T057 [US5] Update `server/src/middleware/auth.middleware.ts`:
  - Include `res.locals.user.profile` populated from userProfile table join
  - All profile fields accessible: firstName, lastName, course, iChat, studentClass, adminNumber
- [ ] T058 [P] [US5] Create `server/src/features/user/profile.controller.ts`:
  - `getCurrentUserProfile()` - return profile of authenticated user from `res.locals.user.profile`
  - `updateUserProfile()` - update userProfile fields (firstName, lastName, etc.)
  - `getUserProfile(userId)` - get profile by userId (admin endpoint)
- [ ] T059 [P] [US5] Create `server/src/features/user/profile.route.ts`:
  - GET `/api/profile` → getCurrentUserProfile (requires auth)
  - PUT `/api/profile` → updateUserProfile (requires auth)
  - GET `/api/users/:userId/profile` → getUserProfile (requires ADMIN)

### Frontend: Profile in Redux State

- [ ] T060 [US5] Update `client/src/features/auth/state/auth-slice.ts`:
  - Extend session state with `profile` object containing all userProfile fields
  - Selectors: `selectProfile`, `selectProfileField(fieldName)`
  - Actions: `updateProfile(newProfileData)`
- [ ] T061 [P] [US5] Create `client/src/features/user/state/profile-api-slice.ts`:
  - RTK Query endpoint GET `/api/profile` - fetch current user profile
  - RTK Query endpoint PUT `/api/profile` - update profile data
  - Invalidate on successful update
- [ ] T062 [P] [US5] Create `client/src/features/user/components/profile-form.tsx`:
  - Form with editable profile fields (firstName, lastName, course, iChat, studentClass, adminNumber)
  - React Hook Form with Zod validation
  - Call profileApiSlice PUT on submit
  - Display success/error notifications
- [ ] T063 [P] [US5] Create `client/src/features/user/components/profile-display.tsx`:
  - Read-only display of profile fields from Redux state
  - Link to edit profile page

### Initialization & Persistence

- [ ] T064 [US5] Update app initialization `client/src/app/root.tsx`:
  - On app load, fetch current session + profile
  - Populate Redux state with session + profile
  - Make profile available to all components via Redux selectors
- [ ] T065 [P] [US5] Create invalidation strategy in `client/src/state/api-slice.ts`:
  - Profile data invalidated on logout
  - Profile data refreshed after successful auth (login/register)

**Checkpoint**: Profile data accessible throughout authenticated session. Profile edits reflected immediately. All components can consume profile via Redux or direct context.

---

## Phase 7: User Story 6 - Admin User Management (Priority: P2)

**Goal**: Admins can view, create, manage users with profiles  
**Independent Test**: Admin creates new user, verify both user + profile created; admin updates user, verify changes persist  
**Effort**: ~8 hours  
**Dependencies**: Phase 3 (user creation) + Phase 4 (RBAC)

### Backend: User Management Endpoints

- [ ] T066 [US6] Update `server/src/features/user/user.controller.ts`:
  - Ensure existing CRUD endpoints (createUser, getUser, updateUser, deleteUser) work with new schema
  - Update `createUser` to accept profile fields in same request
  - Update `getUser` to return profile alongside user data
  - Add field-level validation (course code valid, adminNumber format)
- [ ] T067 [P] [US6] Create `server/src/features/user/user.route.ts` (if not exists):
  - GET `/api/users` → listUsers (requires ADMIN) - paginated, filterable
  - GET `/api/users/:id` → getUser (requires ADMIN)
  - POST `/api/users` → createUser (requires ADMIN) - accepts email, password, profile fields
  - PUT `/api/users/:id` → updateUser (requires ADMIN) - update any user field including profile
  - DELETE `/api/users/:id` → deleteUser (requires ADMIN)
  - POST `/api/users/:id/roles` → assignRole (requires ADMIN)
  - DELETE `/api/users/:id/roles/:roleId` → removeRole (requires ADMIN)
- [ ] T068 [P] [US6] Create `server/src/features/user/user.model.ts` (extend):
  - `listUsers(filter, pagination)` - query with profile join, apply filters (name, course, status)
  - `updateUser(id, updates)` - atomic update of user + profile if profile fields included
  - `deleteUser(id)` - cascade delete user (profile, accounts, sessions destroyed)
  - `assignRole(userId, roleId)` - insert into userRole junction
  - `removeRole(userId, roleId)` - delete from userRole junction

### Frontend: Admin User Management UI

- [ ] T069 [US6] Create `client/src/features/admin/pages/users-page.tsx`:
  - Display list of all users with profiles (paginated table)
  - Columns: email, firstName, lastName, course, iChat, adminNumber, roles, actions
  - Search/filter by name, email, course
  - Link to user detail page and edit page
- [ ] T070 [P] [US6] Create `client/src/features/admin/pages/user-detail-page.tsx`:
  - Display user information (email, profile fields, roles, created/updated timestamps)
  - Render roles as badges
  - Link to edit page and delete user
  - Show all accounts (email, Google, GitHub) if linked
- [ ] T071 [P] [US6] Create `client/src/features/admin/pages/user-edit-page.tsx`:
  - Form to edit user fields (email, firstName, lastName, course, iChat, studentClass, adminNumber)
  - Form to manage roles (add/remove roles)
  - Call updateUser endpoint on submit
  - Show success/error notifications
  - Note: Password reset deferred to post-MVP (requires email service integration)
- [ ] T072 [P] [US6] Create `client/src/features/admin/pages/create-user-page.tsx`:
  - Form to create new user (email, password, profile fields)
  - Form to assign initial roles
  - Call createUser endpoint
  - Redirect to user detail page on success
- [ ] T073 [P] [US6] Create `client/src/features/admin/state/users-api-slice.ts`:
  - RTK Query endpoints for all user CRUD operations
  - GET `/api/users` - list users (with pagination, filters)
  - GET `/api/users/:id` - get single user
  - POST `/api/users` - create user
  - PUT `/api/users/:id` - update user
  - DELETE `/api/users/:id` - delete user
  - POST `/api/users/:id/roles` - assign role
  - DELETE `/api/users/:id/roles/:roleId` - remove role

### Validation & Error Handling

- [ ] T074 [US6] Add validation for user creation/update:
  - Email uniqueness check (server-side)
  - adminNumber uniqueness check (server-side)
  - iChat uniqueness check (server-side)
  - Password strength (if password reset included)
  - Role existence validation

**Checkpoint**: Admin users can perform full CRUD on user accounts + profiles + roles. Validation prevents data integrity issues. List/detail/edit/create pages complete.

---

## Phase 8: User Story 7 - OAuth Sign-In (Google & GitHub) (Priority: P2)

**Goal**: Users can login/signup via Google & GitHub; account linking works  
**Independent Test**: Click "Sign in with Google", OAuth flow completes, session established, profile auto-populated  
**Effort**: ~12 hours (2 days)  
**Dependencies**: Phase 2 (Better Auth config) + Phase 3 (login/register flow)

### Backend: OAuth Configuration

- [ ] T075 [US7] Update `server/src/lib/auth.ts`: Configure OAuth providers in Better Auth
  - Google OAuth provider (clientId, clientSecret from .env)
  - GitHub OAuth provider (clientId, clientSecret from .env)
  - Callback URLs: `/api/auth/callback/google`, `/api/auth/callback/github`
- [ ] T076 [P] [US7] Create `server/src/features/auth/lib/oauth-callbacks.ts`:
  - `onGoogleSignIn` callback: Extract email, name from OAuth response; auto-populate userProfile (firstName, lastName from OAuth name); assign default USER role
  - `onGithubSignIn` callback: Extract email, login from OAuth; auto-populate userProfile (use github login as iChat if available); assign default USER role
  - Handle existing user accounts (account linking)
  - Handle profile creation for new OAuth users
- [ ] T077 [P] [US7] Update `server/src/lib/auth.ts` (extend with hooks):
  - Database hooks: On OAuth account creation, auto-populate userProfile if new user
  - Hook: `onAccountLink` - triggered when adding OAuth to existing email/password account (no profile changes)
  - Hook: `onFirstOAuthSignIn` - create profile if not exists

### Backend: OAuth Endpoints

- [ ] T078 [US7] Update `server/src/features/auth/auth.route.ts`:
  - GET `/api/auth/google` → Redirect to Google OAuth consent screen (Better Auth handles)
  - GET `/api/auth/callback/google` → OAuth callback, create/link account, establish session
  - GET `/api/auth/github` → Redirect to GitHub OAuth authorization
  - GET `/api/auth/callback/github` → OAuth callback, create/link account, establish session
  - POST `/api/auth/link-account/:provider` → Link OAuth to existing email/password account (requires auth)
- [ ] T079 [P] [US7] Create `server/src/features/auth/auth.controller.ts` (extend):
  - `linkAccount(provider)` controller - attach OAuth account to authenticated user

### Frontend: OAuth UI Components

- [ ] T080 [US7] Create `client/src/features/auth/components/oauth-buttons.tsx`:
  - "Sign in with Google" button → redirects to `/api/auth/google`
  - "Sign in with GitHub" button → redirects to `/api/auth/github`
  - Buttons only shown on login page if not authenticated
- [ ] T081 [P] [US7] Update `client/src/features/auth/components/login-form.tsx`:
  - Add OAuth buttons above/below email/password form
  - Display "Or continue with Google/GitHub" text
- [ ] T082 [P] [US7] Create `client/src/features/user/components/account-linking.tsx`:
  - Show linked accounts (email, Google, GitHub) with badges
  - "Link" buttons for unlinked providers (triggers OAuth flow for linking)
  - "Unlink" buttons for linked accounts (POST `/api/auth/unlink/:provider`)
  - Show warning: "Cannot unlink last account method"
- [ ] T083 [P] [US7] Create `client/src/features/user/pages/account-settings-page.tsx`:
  - Display current account info (email, OAuth accounts)
  - Render AccountLinking component
  - Link to password management (if email/password auth, allow password reset)

### OAuth Session Handling

- [ ] T084 [US7] Update OAuth callback handling:
  - Better Auth handles OAuth callback automatically via `/api/auth/callback/:provider`
  - Client-side: On OAuth callback redirect, fetch session and populate Redux auth state
  - If OAuth creates new user, profile auto-populated by backend hook
  - If OAuth links to existing user, no profile changes
- [ ] T085 [P] [US7] Create `client/src/features/auth/hooks/use-oauth-flow.ts`:
  - Utility hook for managing OAuth redirect + session sync
  - On app load, check if OAuth callback query params present
  - Fetch session and update Redux state
  - Redirect to dashboard on success
- [ ] T086 [P] [US7] Update `client/src/app/root.tsx`:
  - Handle OAuth callback on app mount
  - Detect `?code=...` query params (Google/GitHub OAuth callback)
  - Call useOAuthFlow hook to sync session

### Unlink Account Feature

- [ ] T087 [US7] Create `server/src/features/auth/auth.controller.ts` (extend):
  - `unlinkAccount(provider)` controller - remove OAuth account from authenticated user
  - Verify user has at least one remaining auth method (email/password or another OAuth)
  - Return error if trying to unlink last auth method
- [ ] T088 [P] [US7] Update `server/src/features/auth/auth.route.ts`:
  - POST `/api/auth/unlink/:provider` → unlinkAccount (requires auth)
- [ ] T089 [P] [US7] Update `client/src/features/user/state/account-api-slice.ts`:
  - RTK Query endpoint POST `/api/auth/unlink/:provider`
  - Invalidate accounts list on success, refresh session

### Validation & Error Handling

- [ ] T090 [US7] Add OAuth callback error handling:
  - Server: Handle OAuth provider errors (network, consent denied, etc.)
  - Server: Return friendly error message (redirect to login with error param)
  - Client: Display "Google sign-in failed, please try again" or similar
  - Client: Redirect to login (not error page) if OAuth fails
- [ ] T091 [P] [US7] Create test scenario `specs/001-better-auth-migration/test-scenarios-oauth.md`:
  - Test: First-time Google sign-in creates user + profile
  - Test: GitHub sign-in auto-populates iChat from GitHub login
  - Test: Email/password user links Google account
  - Test: OAuth user cannot unlink only auth method
  - Test: Linked accounts show in account settings

**Checkpoint**: OAuth (Google & GitHub) fully functional. Account linking works. OAuth users have same RBAC/profile access as email/password users. Test scenarios documented.

---

## Phase 9: Testing & Validation (CRITICAL - Constitutional Requirement)

**Purpose**: Comprehensive test suite ensuring >80% code coverage for auth modules  
**Effort**: ~12 hours (2 days)  
**Status**: REQUIRED before PR merge

### Unit Tests: Backend Auth Controllers

- [ ] T092 [TEST] Create `server/tests/unit/features/auth/auth.controller.test.ts`:
  - Test `register` with valid input → user + profile created
  - Test `register` with duplicate email → error response
  - Test `register` with invalid password → validation error
  - Test `register` with incomplete profile → validation error per field
  - Test `login` with valid credentials → session returned
  - Test `login` with invalid password → error response
  - Test `login` with nonexistent email → error response (don't leak email existence)
  - Test `logout` destroys session
  - Test `refreshSession` extends token expiry
  - Test `refreshSession` with invalid token → error
- [ ] T093 [P] [TEST] Create `server/tests/unit/features/auth/profile-builder.test.ts`:
  - Test atomic creation: user + profile in same transaction
  - Test rollback if profile creation fails (user also rolled back)
  - Test default role assignment (USER)
  - Test profile field validation
  - Test userId link correctness

### Unit Tests: Frontend Auth Components

- [ ] T094 [TEST] Create `client/tests/unit/features/auth/login-form.test.tsx`:
  - Test render with email/password inputs
  - Test form submission calls loginApiSlice
  - Test error display on API error
  - Test success redirect to dashboard
  - Test validation error display (invalid email format)
- [ ] T095 [P] [TEST] Create `client/tests/unit/features/auth/register-form.test.tsx`:
  - Test render with all profile fields
  - Test form submission calls registerApiSlice
  - Test validation errors (missing fields, duplicate email)
  - Test success message or redirect
- [ ] T096 [P] [TEST] Create `client/tests/unit/features/auth/state/auth-slice.test.ts`:
  - Test setSession updates Redux state
  - Test clearSession removes session data
  - Test selectIsAuthenticated selector
  - Test selectProfile selector

### Integration Tests: Auth Flows

- [ ] T097 [TEST] Create `server/tests/integration/auth-flow.test.ts`:
  - Test complete registration flow: POST /api/auth/register → verify user + profile in DB
  - Test complete login flow: POST /api/auth/login → verify session + user + profile in response
  - Test session persistence: login → protected endpoint → profile accessible
  - Test session expiry: manual expiry → auto-refresh → token updated
  - Test logout: POST /api/auth/logout → session destroyed
  - Test RBAC: login as USER → admin endpoint returns 403; login as ADMIN → endpoint succeeds
- [ ] T098 [P] [TEST] Create `server/tests/integration/oauth-flow.test.ts`:
  - Test Google OAuth sign-in: mock OAuth response → user + profile created
  - Test GitHub OAuth sign-in: mock OAuth response → user + profile created  
  - Test account linking: email user + add Google → both auth methods work
  - Test OAuth user RBAC: OAuth user assigned USER role, RBAC enforced
  - Test OAuth callback error: denied consent → error response
- [ ] T099 [P] [TEST] Create `server/tests/integration/profile-access.test.ts`:
  - Test profile fetch: authenticated → profile data in res.locals.user
  - Test profile update: alter firstName → subsequent requests show new value
  - Test profile visibility: USER can access own; USER cannot access other's profile (403)
  - Test ADMIN can access any user's profile

### E2E Tests: User Journeys

- [ ] T100 [TEST] Create `client/tests/e2e/auth-journey.test.ts` (using Playwright/Cypress):
  - Journey: Register → verify email/password form → submit → redirected to dashboard → profile visible
  - Journey: Logout → protected route → redirected to login → login → redirected to dashboard
  - Journey: Session timeout → wait expiry → auto-refresh → continue using app
  - Journey: OAuth sign-in → Google consent → redirected to dashboard → profile auto-populated
- [ ] T101 [P] [TEST] Create `client/tests/e2e/admin-journey.test.ts`:
  - Journey: Login as ADMIN → navigate to users page → create new user → verify in list
  - Journey: View user detail → edit profile → verify changes persist
  - Journey: Assign role to user → logout user → re-login → verify new role enforced

### Test Infrastructure

- [ ] T102 [TEST] Create test database setup script `server/tests/setup.ts`:
  - Spin up isolated PostgreSQL test DB
  - Run migrations
  - Seed test data (test users, roles)
  - Teardown after tests
- [ ] T103 [P] [TEST] Create mock Better Auth client for unit tests `server/tests/mocks/auth.mock.ts`:
  - Mock session creation/validation
  - Mock password hashing
  - Allow test control of session state
- [ ] T104 [P] [TEST] Create mock OAuth provider utilities `server/tests/mocks/oauth.mock.ts`:
  - Mock Google OAuth responses
  - Mock GitHub OAuth responses
  - Controllable success/failure scenarios

### Coverage & Validation

- [ ] T105 [TEST] Run coverage report: `npm run test -- --coverage` in server/
  - **Target: >=80% coverage for all auth modules**
  - Auth controllers: 90%+
  - Auth middleware: 85%+
  - Profile builder: 85%+
  - Fail if coverage falls below 80%
- [ ] T106 [P] [TEST] Run frontend test suite: `npm run test` in client/ 
  - Test all auth components
  - Test auth-slice Redux logic
  - Target: >=80% coverage for auth features
- [ ] T107 [P] [TEST] Run integration test suite: `npm run test:integration` in server/
  - Verify all user story flows pass
  - Verify no regressions in existing endpoints
  - Document any known limitations

**Checkpoint**: >80% test coverage for auth modules. All user story flows tested. No regression in existing functionality. Ready for PR and code review.

---

## Phase 10: Polish & Documentation (Final)

**Purpose**: Clean up temporary code, update docs, prepare deployment  
**Effort**: ~6 hours  
**Prerequisite**: Phase 9 tests passing

### Code Cleanup

- [ ] T108 Remove old JWT code: Delete `server/src/lib/generate-tokens.ts` (no longer used)
- [ ] T109 [P] Remove old password utilities: Clean up bcrypt-specific code from `server/src/features/auth/lib/` (Better Auth handles)
- [ ] T110 [P] Remove old auth middleware: Delete unused JWT verification code paths from `server/src/middleware/auth.middleware.ts`
- [ ] T111 [P] Update `.env.example`: Remove JWT_SECRET, JWT_REFRESH_SECRET; add BETTER_AUTH_SECRET, GOOGLE_OAUTH_ID, GITHUB_OAUTH_ID placeholders

### Documentation Updates

- [ ] T112 Update `server/README.md`: Document new auth system
  - Explain Better Auth session flow (no JWT)
  - Document OAuth setup (Google/GitHub credentials)
  - Document API endpoints (register, login, logout, refresh, OAuth callbacks)
  - Example requests/responses
- [ ] T113 [P] Update `client/README.md`: Document auth on frontend
  - Explain Better Auth React client usage
  - Document Redux auth state shape
  - Document useAuth hook and useSession hook
  - Example component integration
- [ ] T114 [P] Create `specs/001-better-auth-migration/INTEGRATION_GUIDE.md`:
  - Step-by-step: Add Better Auth to existing Express.js app
  - Setup Google/GitHub OAuth apps (with screenshots/links)
  - Initialize Better Auth config
  - Create schema migrations
  - Run migrations and seed data
  - Start dev servers and test flows
  - Troubleshooting common issues
- [ ] T115 [P] Create `specs/001-better-auth-migration/SECURITY_CHECKLIST.md`:
  - Verify refresh tokens in HTTP-only cookies (not localStorage)
  - Verify access tokens not exposed to JavaScript
  - Verify HTTPS enforced in production (Better Auth guideline)
  - Verify CSRF protection enabled
  - Verify password hashing properly configured
  - Verify session expiry times reasonable
  - Verify OAuth secrets not logged/leaked
  - Verify role-based access working on all protected endpoints

### Configuration & Deployment

- [ ] T116 Update `.env.example` with all required Better Auth variables:
  - BETTER_AUTH_SECRET (session signing key)
  - GOOGLE_OAUTH_ID, GOOGLE_OAUTH_SECRET
  - GITHUB_OAUTH_ID, GITHUB_OAUTH_SECRET
  - DATABASE_URL remains same
  - Remove JWT_SECRET, JWT_REFRESH_SECRET (legacy)
- [ ] T117 [P] Create deployment guide `specs/001-better-auth-migration/DEPLOYMENT.md`:
  - Instructions for production environment setup
  - Required environment variables
  - Database migration steps (production)
  - Secret management (store secrets in vault, not .env)
  - Monitoring/logging recommendations
  - Rollback plan if issues arise

### Final Validation

- [ ] T118 Smoke test on fresh clone:
  - Clone repo on clean machine
  - Follow INTEGRATION_GUIDE to set up
  - Run dev servers (client + server)
  - Register new user → verify success
  - Login → verify session → logout
  - Login with Google → verify account created
  - Verify admin features work
  - Verify no errors in console/server logs
- [ ] T119 [P] Performance validation:
  - Measure login response time (should be <200ms)
  - Measure session refresh time (<100ms)
  - Measure protected endpoint access time (session lookup should not add >50ms)
  - Document baseline metrics in performance report
- [ ] T120 [P] Security audit checklist:
  - Review SECURITY_CHECKLIST.md point by point
  - Verify all checks pass
  - Document any exceptions or planned follow-ups

### Merge & Completion

- [ ] T121 Create PR summary document listing:
  - Files changed (brief overview by directory)
  - Breaking changes (none - backward compatible)
  - New capabilities unlocked (OAuth, device tracking)
  - Test coverage summary (>80% coverage achieved)
  - Known limitations or future work
- [ ] T122 [P] Tag release: Create git tag for `better-auth-migration-complete`
- [ ] T123 [P] Update project README.md: Reference new auth system in architecture section

**Checkpoint**: Feature complete. All documentation updated. Tests passing, coverage >80%. Deployment ready. PR approved and merged to main.

---

## Task Dependencies & Parallel Execution

### Dependency Chain
```
Phase 1 (Setup)
    ↓
Phase 2 (Database & Core Auth) [BLOCKING]
    ↓
Phase 3 (Login/Register P1) [US1, US2]
    ├─→ Phase 4 (Session Management P1) [US3]
    │   ├─→ Phase 5 (RBAC P1) [US4]
    │   └─→ Phase 6 (Profile Accessibility P2) [US5]
    ├─→ Phase 7 (Admin Management P2) [US6]
    └─→ Phase 8 (OAuth P2) [US7] (can start in parallel with Phase 4, shares Phase 2)
    
Phase 9 (Testing - CRITICAL) [Depends on all above]
    ↓
Phase 10 (Documentation & Deployment) [Final polish]
```

### Critical Path (Minimum Duration)
1. Phase 1: ~4 hours (setup dependencies)
2. Phase 2: ~8 hours (database + auth config) [BLOCKING]
3. Phase 3: ~16 hours (login/register essential)
4. Phase 4: ~8 hours (session management)
5. Phase 5: ~6 hours (RBAC validation)
6. Phase 9: ~12 hours (testing - REQUIRED)
7. Phase 10: ~6 hours (documentation)

**Total Critical Path**: ~60 hours (7.5 days for 1 developer, ~4 days for 2 developers)

### Parallel Opportunities
- **Phase 2**: Many database + middleware tasks can run in parallel (T004-T021 have [P] markers)
- **Phase 3**: Frontend forms can be built in parallel with backend controllers (T022-T035)
- **Phase 8**: OAuth can start after Phase 2 is done (doesn't depend on Phase 3)
- **Phase 9**: Test writing can begin as soon as code is written (test-first approach)
- **Phase 10**: Documentation can begin once Phase 9 tests stabilize

### Recommended Team Assignment (if 2 developers)
- **Dev 1 (Backend Focus)**:
  - Phase 1: Setup (T001-T003)
  - Phase 2: Database + auth lib (T004-T021)
  - Phase 3: Backend controllers (T022-T025)
  - Phase 4: Backend session (T037-T040)
  - Phase 5: Backend RBAC (T048-T052)
  - Phase 6: Backend profile (T057-T059)
  - Phase 7: Backend admin (T066-T068)
  - Phase 8: Backend OAuth (T075-T091)
  - Phase 9: Backend tests (T092-T107)

- **Dev 2 (Frontend Focus)**:
  - Phase 1: Parallel setup (T001-T003)
  - Phase 2: Frontend client (T018-T021)
  - Phase 3: Frontend forms (T026-T036)
  - Phase 4: Frontend session (T041-T047)
  - Phase 5: Frontend RBAC (T053-T055)
  - Phase 6: Frontend profile (T060-T065)
  - Phase 7: Frontend admin UI (T069-T074)
  - Phase 8: Frontend OAuth UI (T080-T091)
  - Phase 9: Frontend tests (T094-T107)
  - Phase 10: Documentation (T108-T123)

---

## Success Criteria & Acceptance

### Must Have (MVP - Phases 1-5)
- ✅ Users can register with email/password/profile (US1, US2)
- ✅ Users can login (US1)
- ✅ Sessions auto-refresh transparently (US3)
- ✅ Role-based access control enforced (US4)
- ✅ Profile data accessible in auth context (US5)
- ✅ >80% test coverage for auth modules (REQUIRED by constitution)
- ✅ No breaking changes to existing API

### Should Have (Phases 6-8)
- ✅ Admins can manage users (US6)
- ✅ OAuth sign-in works (Google, GitHub) (US7)
- ✅ Account linking functional (OAuth + email)

### Nice to Have (Post-Launch)
- Device/IP tracking displays in account settings
- Email verification flow (currently mocked)
- Password reset flow
- 2FA via Better Auth plugins
- Additional OAuth providers (Slack, Discord)

---

## Total Task Summary

- **Total Tasks**: 123 tasks
- **Setup & Infrastructure**: 3 tasks
- **Database & Core Auth**: 18 tasks
- **Auth Flows (US1-US2)**: 12 tasks
- **Session Management (US3)**: 9 tasks
- **RBAC (US4)**: 9 tasks
- **Profile Accessibility (US5)**: 9 tasks
- **Admin Management (US6)**: 9 tasks
- **OAuth (US7)**: 17 tasks
- **Testing & Validation**: 15 tasks
- **Documentation & Polish**: 16 tasks

---

## Notes & Known Considerations

1. **Constitutional Compliance**: Phase 9 (Testing) is NON-NEGOTIABLE per project constitution. No PR merge without >80% auth test coverage.

2. **Better Auth Version**: Minimum v0.17.0 recommended; verify @better-auth/drizzle compatibility at time of implementation.

3. **OAuth Secret Management**: Store GOOGLE_OAUTH_SECRET, GITHUB_OAUTH_SECRET in secure vault (not .env in production). Use environment variable injection.

4. **Database Migrations**: Better Auth will generate initial tables. Custom userProfile schema must be added via separate migration.

5. **Email Service**: MVP uses console.log for email notifications. Integrate Resend/SendGrid later when email backlog prioritized.

6. **Session Token Format**: Better Auth uses opaque session tokens (not JWT). Token value stored in HTTP-only cookie; never exposed to client-side JS.

7. **Password Reset**: Deferred to Phase 11 (not in scope). Current system has no reset; users are created by admins or OAuth.

8. **Device/IP Tracking**: Captured at login, stored in session metadata. Security audit logs can be queried for suspicious patterns (future security module).

9. **Rollback Plan**: If major issues found:
   - Old JWT code is not deleted until Phase 10
   - Can revert to JWT if critical bugs in Better Auth integration
   - Test gate ensures this won't be necessary

10. **Framework Updates**: React Router v7 supports SSR; ensure Better Auth session sync on server-side rendering (if SSR enabled in future).

---

*Generated for feature specification: Better Auth Migration*  
*Review dates: After Phase 5 (RBAC), before Phase 9 (Testing), before merge*
