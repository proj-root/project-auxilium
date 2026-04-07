# Research & Findings: Better Auth Migration

**Phase**: 0 (Research)  
**Date**: April 5, 2026  
**Status**: Complete  

---

## Executive Summary

Better Auth is a production-grade modern authentication framework for TypeScript/JavaScript applications. It provides:
- Database-managed sessions with secure HTTP-only cookies (vs. JWT stateless tokens)
- Multi-provider account linking (email/password + OAuth)
- Built-in PBKDF2/scrypt password hashing (more secure than bcrypt)
- Better developer experience with auto-generated migration schema
- Extensible via plugins for future 2FA, passkeys, etc.

**Decision**: Migrate from custom JWT-based auth to Better Auth. Feasible and beneficial.

---

## Better Auth Conventions & Best Practices

### Core Architecture

**Session Model** (vs. JWT):
- ✅ Better for security: server-managed sessions with revocation capability
- ✅ Better for UX: refresh handled transparently via cookies, no token exposure
- ❌ Requires database persistence (acceptable per assumptions)

**Database Adapter**:
- ✅ Drizzle ORM adapter available: `better-auth/adapters/drizzle`
- ✅ Automatically generates PostgreSQL schema (can be customized)
- ✅ Works with existing Drizzle migrations via Drizzle Kit

**User Model**:
- Core fields: `id`, `email`, `emailVerified`, `name`, `image`, `createdAt`, `updatedAt`
- ✅ Extensible via `additionalFields` option for custom fields (e.g., custom profile columns)
- ⚠️  **Key Design Decision**: Project chose separate `userProfile` table linked via userId foreign key, not custom fields. Better Auth's user table will be minimal.

**Account Linking**:
- ✅ `account` table (Better Auth-managed) links multiple auth methods to single user
- ✅ Enables: email + Google, email + GitHub, all combinations
- ✅ Supports custom account fields for OAuth metadata

**Session Metadata**:
- ✅ `session` table includes `sessionToken`, `userId`, `expiresAt`
- ✅ Can extend with custom fields for device fingerprint, IP address, lastActivity
- ✅ Cookie cache strategies: `compact`, `jwt`, `jwe` (default: compact)

### Configuration Patterns

**Env Variables** (standard Better Auth):
```
BETTER_AUTH_SECRET          # 32+ char encryption key
BETTER_AUTH_URL             # Base URL for auth (e.g., https://example.com)
```

**Email/Password Config**:
```typescript
emailAndPassword: {
  enabled: true,
  passwordMinLength: 8,      // Defaults enforced
  // sendVerificationEmail, sendResetPassword: define for email flow
}
```

**OAuth Providers**:
```typescript
socialProviders: {
  google: { clientId, clientSecret },
  github: { clientId, clientSecret },
}
```

**Account Linking**:
```typescript
account: {
  accountLinking: { enabled: true }  // Allows multiple auth per user
}
```

**Session Management**:
```typescript
session: {
  expiresIn: 7 * 24 * 60 * 60,    // 7 days default
  updateAge: 60 * 60,              // Refresh cookie every 1 hour
  storeSessionInDatabase: true,
  cookieCache: { 
    maxAge: ...,
    version: 1  // Change to invalidate all sessions
  }
}
```

### Key Library Imports

```typescript
// Server config
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

// Client usage
import { createAuthClient } from "better-auth/client"
import { useSession } from "@better-auth/react"
```

---

## PostgreSQL + Drizzle Compatibility

### Migration Path

1. **Schema Generation**: `npx @better-auth/cli@latest generate --drizzle`
   - Generates Drizzle schema file with all Better Auth tables
   - Can be merged with existing schema.ts

2. **Custom Tables**: Link `userProfile` table:
   ```typescript
   export const userProfile = pgTable('user_profile', {
     profileId: uuid('profile_id').primaryKey().defaultRandom(),
     userId: uuid('user_id').notNull()
       .references(() => user.id, { onDelete: 'cascade' }),
     firstName: varchar({ length: 100 }).notNull(),
     // ...
   })
   ```

3. **Migrations**: Drizzle Kit auto-generates migration files post-schema update
   - No manual SQL writing needed for Better Auth tables

### Verify Drizzle Adapter Works

- ✅ Confirmed: `better-auth` exports `drizzleAdapter` for PostgreSQL
- ✅ Works with Drizzle `PgDatabase` type
- ✅ No special Drizzle version needed (current project uses drizzle-kit ^0.31.9)

---

## Current Auth System Strengths & Gaps

### Strengths to Preserve
- ✅ Atomic user + profile creation (transaction pattern)
- ✅ JWT-based stateless deserialization (fast, works offline)
- ✅ Custom profile fields (firstName, lastName, course, iChat, etc.)

### Gaps Better Auth Solves
- ❌ No built-in account linking (requires custom code for OAuth, currently unsupported)
- ❌ Manual password hashing/comparison in controllers (verbose)
- ❌ Manual refresh token generation (error-prone cookie handling)
- ❌ No email verification/reset flows (custom implementation required)
- ❌ Poor session revocation (JWTs can't be invalidated until expiry)

---

## Design Decisions for Better Auth Integration

### 1. ✅ UserProfile as Separate Table
**Decision**: Keep `userProfile` table separate, linked via userId FK (not custom fields)  
**Rationale**: Preserves current schema structure; familiar to developers; allows userProfile to grow independently  
**Implementation**: `userProfile.userId` FK → `user.id`, unique constraint on userId

### 2. ✅ Database-Managed Sessions
**Decision**: Store sessions in DB via Better Auth adapter (not stateless cookies)  
**Rationale**: Enables session revocation, device tracking, concurrent session management  
**Trade-off**: Slight performance cost for ~5ms session lookup (acceptable per <200ms goal)

### 3. ✅ Account Linking for OAuth
**Decision**: Enable `account.accountLinking: true` for multi-method auth  
**Rationale**: Allows email + Google + GitHub on same account; better UX; matches web standards

### 4. ✅ Device/IP Tracking via Custom Session Fields
**Decision**: Extend `session` table with `deviceFingerprint` and `ipAddress` columns  
**Rationale**: Enables security auditing and concurrent device identification without separate table

### 5. ⚠️  No Email Verification in MVP
**Decision**: Mock email sending until real provider (Resend, SendGrid) configured  
**Rationale**: Deferred complexity; focus on auth core first; not blocking

### 6. ✅ RBAC via Existing Role Tables
**Decision**: Pre-fetch user roles on session creation; attach to `session.user` context  
**Rationale**: Minimal overhead; maintains current RBAC logic; no changes to role/userRole tables

---

## Technology Stack Confirmation

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Auth Framework** | Better Auth | Superior to custom JWT; extensible; active maintenance |
| **DB Adapter** | Drizzle ORM | Already in use; supported by Better Auth |
| **Password Hashing** | PBKDF2/scrypt (Better Auth default) | More secure than bcrypt; configurable iterations |
| **Session Storage** | PostgreSQL (database) | Persistent, allows revocation |
| **OAuth Providers** | Google, GitHub | Standard, high adoption; expandable later |
| **Frontend Client** | @better-auth/react | Native React support; hooks-based |
| **Email Service** | Resend (future) / Mock (MVP) | Resend async-first; mock sufficient for dev |

---

## Risk Assessment & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Drizzle adapter breaking changes | Low | Medium | Pin Better Auth version; test migrations early |
| Session table scaling | Low | Low | Prepare cleanup script for expired sessions; add cron job later |
| OAuth callback mismatch | Medium | Medium | Test with real OAuth console apps; document callback URLs |
| Password hash incompatibility with existing bcrypt | N/A | N/A | No users to migrate (greenfield) |
| Test infrastructure missing | High | High | Allocate Phase 5+ for test implementation; block merge without tests |

---

## Recommendations

1. **Generate Better Auth Schema Early**: Run `npx @better-auth/cli@latest generate --drizzle` in Phase 1 to confirm schema layout before writing code.

2. **Test OAuth in Development**: Create Google/GitHub development apps early to test callback URLs and device tracking.

3. **Implement Test Suite**: Per constitution, allocate dedicated tasks for unit & integration tests in Phase 5. No code ships without tests.

4. **Device Fingerprint Strategy**: Use browser-based fingerprinting library (e.g., `fingerprintjs2`) client-side; send to server on login. Pair with IP address from request headers.

5. **Migration Script** (Future): Even though no users currently exist, prepare a script to rehash passwords IF old JWT system runs in parallel temporarily.

---

## Conclusion

**All unknowns resolved. Ready to proceed to Phase 1 (Design & Contracts).**

Better Auth is the right choice for Project Auxilium. Design can proceed with confidence in:
- Drizzle adapter compatibility ✅
- userProfile table linkage ✅
- OAuth provider support ✅
- Device tracking extensibility ✅
- Session revocation capability ✅
