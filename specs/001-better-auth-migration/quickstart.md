# Quickstart: Better Auth Integration

**Phase**: 1 (Design)  
**Type**: Integration Guide  
**Last Updated**: April 5, 2026

---

## Overview

This guide provides a high-level walkthrough of how Better Auth integrates into Project Auxilium's authentication system. For detailed API contracts, see [auth-endpoints.md](auth-endpoints.md). For data model, see [data-model.md](../data-model.md).

---

## Core Concepts

### 1. Better Auth Handles Session Management

**Old way (JWT)**:
```typescript
// Generate token
const token = jwt. sign({ userId, roleId }, SECRET, { expiresIn: '15m' })
// Return to client
res.json({ accessToken: token })
// Client stores in localStorage
// Client sends in Authorization header
```

**New way (Better Auth)**:
```typescript
// Better Auth creates session automatically
// Returns sessionToken in HTTP-only cookie (server sets it)
// Browser auto-attaches cookie to every request
// No JavaScript access = XSS safe
```

**Benefit**: Automatic, secure, 3 lines vs. 10+ custom code

---

### 2. Separate UserProfile is Preserved

Better Auth's `user` table is minimal:
```typescript
{
  id, email, emailVerified, name, image, createdAt, updatedAt
}
```

Project Auxilium's `userProfile` table remains separate:
```typescript
{
  profileId, userId, firstName, lastName, course, iChat, 
  studentClass, adminNumber, createdAt, updatedAt
}
```

**Why separate?**
- Keeps auth logic (email, password hash) isolated
- Profile data is searchable independently (iChat, adminNumber indexes)
- Aligns with existing schema and developer familiarity

**Relationship**: `userProfile.userId` → `user.id` (1:1, FK, cascading delete)

---

### 3. OAuth Accounts Are Linked via `account` Table

**Multiple auth methods on one user**:
```
User john@example.com can login via:
1. Email + password (stored in user table)
2. Google OAuth (account record with provider="google")
3. GitHub OAuth (account record with provider="github")
```

**Same email check**: If Google/GitHub email matches existing user email, link to existing account. No duplicate users.

---

### 4. Device Tracking for Security

Each session now captures:
- `ipAddress` — Client's IP (from request headers)
- `deviceFingerprint` — Browser fingerprint (sent from client)

**Use cases**: 
- Concurrent session tracking: show user "logged in from 2 devices"
- Security alerts: "login from new location"
- Revoke device: "logout all other sessions"

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│                                                                  │
│  @better-auth/react library provides:                           │
│  - useSession() hook (get current user)                         │
│  - signUp(), signIn(), signOut() methods                        │
│  - OAuth buttons (Google, GitHub)                              │
│                                                                  │
│  Redux store: auth-slice (session, user, profile, roles)       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP requests with cookies
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Express.js)                          │
│                                                                  │
│  Better Auth route handler: /api/auth/[...all]                 │
│  - Validates sessionToken from cookie                          │
│  - Manages user, account, session tables                       │
│  - Hashes passwords (PBKDF2/scrypt)                            │
│  - OAuth provider exchange (Google, GitHub)                    │
│                                                                  │
│  Custom middleware: verifySession (updated from verifyJWT)     │
│  - Looks up session by token                                   │
│  - Attaches user, profile, roles to res.locals                │
│  - Enforces RBAC via roles                                     │
│                                                                  │
│  Existing routes: /api/events, /api/users, etc.                │
│  - Protected by verifySession + verifyIsRole()                 │
│  - Behavior unchanged                                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PostgreSQL + Drizzle ORM                       │
│                                                                  │
│  Tables:                                                         │
│  ┌── user (Better Auth)          ┌── session (Better Auth)      │
│  │ id, email, emailVerified      │ id, sessionToken, userId    │
│  │ name, image, ...              │ expiresAt, ipAddress,       │
│  └── account (Better Auth)        │ deviceFingerprint, ...      │
│  │ id, userId, provider,         └────────────────────────────  │
│  │ providerAccountId, ...                                       │
│                                   ┌── userProfile (Project)     │
│                                   │ profileId, userId (FK)      │
│                                   │ firstName, lastName, iChat  │
│                                   │ course, studentClass, ...   │
│                                   └────────────────────────────  │
│                                                                  │
│  ┌── userRole (existing) ┌── role (existing)                   │
│  │ userId, roleId (PK)   │ roleId, name, createdAt, ...        │
│  └─────────────────────  └────────────────────────────────────  │
│                                                                  │
│  (Other existing tables: courses, events, etc. — unchanged)    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Typical User Flows

### Flow 1: Email/Password Registration

```
Client                    Server                    Database
│                         │                         │
├─ POST /register ──────> │                         │
│  (email, password,      │                         │
│   firstName, lastName)  │                         │
│                         │                         │
│                         ├─ Hash password (PBKDF2)│
│                         │                         │
│                         ├─ START TRANSACTION ────>│
│                         ├─ INSERT user ─────────>│
│                         │ id, email, name, ...   │
│                         │                         │
│                         ├─ INSERT userProfile ──>│
│                         │ userId (FK), firstName │
│                         │ lastName, iChat, ...   │
│                         │                         │
│                         ├─ INSERT userRole ─────>│
│                         │ userId, roleId=USER    │
│                         │                         │
│                         ├─ INSERT session ──────>│
│                         │ sessionToken, userId,  │
│                         │ expiresAt (7 days)     │
│                         │                         │
│                         ├─ COMMIT ───────────────│
│                         │                         │
│<─ 201 + sessionToken ───│                         │
│ + user + profile        │                         │
│ (Set-Cookie header)     │                         │
│                         │                         │
├─ Store cookie ─────────>│ (browser auto-stores) │
│ (auto by browser)       │                         │
```

### Flow 2: Google OAuth Sign-In

```
Client                    Google            Server              Database
│                         │                 │                   │
├─ Click "Sign in..." ───>│                 │                   │
│ (redirectUrl)           │                 │                   │
│                         │                 │                   │
├────────────────────────────>│             │                   │
│ (Google consent flow)        │<─ consent ─│                   │
│                         │                 │                   │
│ (user approves)         │                 │                   │
│                         │                 │                   │
├────────────────────────────>│             │                   │
│ (authorization code)        │             │                   │
│                         │                 │                   │
│             callback: /api/auth/callback/google?code=...&state=...
│                         │                 │                   │
│<────────── redirect ────│─────────────────│                   │
│                         │                 │                   │
│                         │    ┌─ Exchange code ─────────────>│
│                         │    │ for tokens  │                   │
│                         │    │ Get user profile              │
│                         │    │                               │
│                         │    │  User exists by email?        │
│                         │    │    ├─ YES: Link account      │
│                         │    │    └─ NO: Create user + profile
│                         │    │                               │
│                         │    ├─ INSERT/UPDATE account ──────>│
│                         │    │ userId, provider="google",   │
│                         │    │ providerAccountId            │
│                         │    │                               │
│                         │    ├─ INSERT session ────────────>│
│                         │    │ sessionToken, userId, ...    │
│                         │    │                               │
│<────────────────────────┴────┤ 200 + Set-Cookie             │
│ (with sessionToken cookie)   │                               │
│                              │                               │
├─ Redirect to /dashboard ────>│ (with cookie)                │
```

### Flow 3: Protected Route Access

```
Client                    Server                  Database
│                         │                       │
├─ GET /api/events ─────>│ (cookie: sessionToken) │
│ (with cookie)           │                       │
│                         ├─ verifySession() ────>│
│                         │ Query session by     │
│                         │ sessionToken         │
│                         │                       │
│                         │<─ session found ──┐  │
│                         │ has user, profile │  │
│                         │ roles              │  │
│                         │                       │
│                         ├─ Check expiresAt     │
│                         │ Still valid? YES    │
│                         │                       │
│                         ├─ Check roles        │
│                         │ USER can access    │
│                         │ /api/events?       │
│                         │ YES                 │
│                         │                       │
│                         ├─ Attach to          │
│                         │ res.locals.user    │
│                         │ { id, email,       │
│                         │   profile, roles } │
│                         │                       │
│                         ├─ Call route handler  │
│                         │ (e.g., getEvents()) │
│                         │ Uses res.locals      │
│                         │ for filtering/auth  │
│                         │                       │
│<─ 200 + events data ────│                       │
│ (filtered by roles)     │                       │
```

---

## Code Changes Summary

### Backend (TypeScript/Node.js)

**New files**:
- `server/src/lib/auth.ts` — Better Auth config + initialization
- `server/src/lib/device-tracker.ts` — Capture device fingerprint + IP
- `server/src/features/auth/lib/oauth-callbacks.ts` — Google/GitHub handlers
- `server/src/features/auth/lib/profile-builder.ts` — Atomic user+profile creation

**Modified files**:
- `server/src/db/schema.ts` — Add user, account, session tables + device fields
- `server/src/db/relations.ts` — Add user ↔ userProfile, user ↔ account, user ↔ session
- `server/src/features/auth/auth.controller.ts` — Replace JWT logic with Better Auth calls
- `server/src/features/auth/auth.route.ts` — Register Better Auth handler + OAuth handlers
- `server/src/middleware/auth.middleware.ts` — Replace verifyJWT with verifySession
- `server/src/features/user/user.model.ts` — Update queries to JOIN with userProfile

**Removed**:
- `lib/generate-tokens.ts` (JW token generation)
- `lib/catch-async.ts` refactored into authError handler (keep for other features)
- Bcrypt password hashing in controllers (Better Auth handles)

### Frontend (React/TypeScript)

**New files**:
- `client/src/lib/auth-client.ts` — Better Auth React client setup
- `client/src/features/auth/components/oauth-buttons.tsx` — Google/GitHub sign-in buttons
- `client/src/features/auth/components/account-linking.tsx` — Link OAuth to email account

**Modified files**:
- `client/src/features/auth/state/auth-slice.ts` — Consume Better Auth session state
- `client/src/features/auth/state/auth-api-slice.ts` — Update endpoints for new API
- `client/src/features/auth/components/login-form.tsx` — Use Better Auth client
- `client/src/features/auth/components/register-form.tsx` — Include profile fields
- `client/src/lib/api.ts` — Remove JWT injection; rely on cookies

---

## Configuration Roadmap

### Step 1: Setup & Initialization
```bash
npm install better-auth
npm install @better-auth/cli --save-dev
export BETTER_AUTH_SECRET=$(openssl rand -base64 32)
export BETTER_AUTH_URL=http://localhost:3000
```

### Step 2: Generate Schema
```bash
npx better-auth generate --drizzle
# Output: Auth tables (user, account, session, verification)
```

### Step 3: Integrate with Drizzle
- Merge generated schema into `server/src/db/schema.ts`
- Update userProfile to reference user.id via FK

### Step 4: Create Migrations
```bash
npm run db:generate
npm run db:push
```

### Step 5: Configure OAuth Providers
- Create Google OAuth app (credentials.json setup)
- Create GitHub OAuth app (get credentials)
- Add BETTER_AUTH_GOOGLE_CLIENT_ID, BETTER_AUTH_GOOGLE_CLIENT_SECRET to .env
- Add BETTER_AUTH_GITHUB_CLIENT_ID, BETTER_AUTH_GITHUB_CLIENT_SECRET to .env

### Step 6: Implement Core Auth
- `auth.ts` config file with Better Auth + Drizzle adapter
- Route handler at `/api/auth/[...all]`
- Middleware: verifySession, verifyIsRole
- Controllers: register, login, logout, OAuth callbacks

### Step 7: Frontend Integration
- `auth-client.ts` with @better-auth/react
- OAuth buttons + account linking UI
- Redux state management for session/user/roles
- Protected routes + automatic refresh

### Step 8: Testing
- Unit tests: auth controllers, validators
- Integration tests: full auth flows (register, login, OAuth, RBAC)
- Device tracking verification
- Session lifecycle tests

---

## Key Differences from Old System

| Aspect | Old (JWT) | New (Better Auth) |
|--------|-----------|------------------|
| **Token Type** | JWT (stateless) | Session token (stateful) |
| **Storage** | JWT in localStorage (JS accessible) | Session cookie (HTTP-only, secure) |
| **Refresh** | Manual: request token endpoint | Automatic: done server-side |
| **Password Hash** | Bcrypt | PBKDF2/scrypt (Better Auth default) |
| **Account Linking** | Not supported | Built-in (multiple OAuth per user) |
| **Session Revocation** | Can't revoke (until expiry) | Immediate (delete session) |
| **Device Tracking** | Not supported | Built-in (IP + fingerprint) |
| **Complexity** | Custom implementation (10+ files) | Better Auth framework (1-2 files) |
| **Security** | Good (bcrypt, JWTs) | Better (PBKDF2, HTTP-only, revocation) |

---

## What Doesn't Change

These features are **unaffected** by the auth migration:
- ✅ Role-based access control (RBAC) — verifyIsRole() still works
- ✅ Event management API — requires verifySession, behavior same
- ✅ User profile display — same profile fields, newly linked via userId
- ✅ Course management — course table relationship unchanged
- ✅ Admin dashboard — uses updated verifySession middleware
- ✅ Frontend components — Redux store, routes, styling mostly unchanged
- ✅ Database other tables — events, courses, etc. untouched

---

## Deployment Checklist

- [ ] Environment variables set (BETTER_AUTH_SECRET, BETTER_AUTH_URL, OAuth credentials)
- [ ] Database migrations applied (user, account, session, userProfile updated)
- [ ] Better Auth config file created (auth.ts)
- [ ] OAuth apps created (Google & GitHub with correct callback URLs)
- [ ] Drizzle relations updated
- [ ] Auth middleware updated (verifySession replaces verifyJWT)
- [ ] Backend controllers updated (Better Auth API calls)
- [ ] Frontend client setup (@better-auth/react)
- [ ] Redux store updated (useSession hook)
- [ ] OAuth buttons added to login page
- [ ] Device tracking implemented
- [ ] Test suite complete (unit + integration)
- [ ] Manual testing: all auth flows
- [ ] Code review approved
- [ ] Staging environment verified
- [ ] Rollback plan documented
- [ ] Production deployment

---

## Next Steps

1. **Review** this quickstart with team
2. **Verify** schema design in [data-model.md](../data-model.md)
3. **Review** API contracts in [auth-endpoints.md](auth-endpoints.md)
4. **Begin Phase 2**: Tasks generation (`/speckit.tasks`)
5. **Assign** development tasks to team members based on priority
6. **Start** with Phase 1: Backend auth.ts + schema (blocks other work)
