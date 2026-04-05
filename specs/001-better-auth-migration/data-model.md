# Data Model: Better Auth Migration

**Phase**: 1 (Design)  
**Date**: April 5, 2026  
**Status**: Complete  

---

## Entity Relationship Diagram

```
┌─────────────────────────┐
│        user             │   (Better Auth core)
├─────────────────────────┤
│ id (uuid) [PK]          │
│ email (varchar) [UNIQUE]│
│ emailVerified (boolean) │
│ name (varchar)          │
│ image (varchar)         │
│ createdAt (timestamp)   │
│ updatedAt (timestamp)   │
└──────────┬──────────────┘
           │
           ├─────────────────────────┬──────────────────────────┐
           │                         │                          │
   ┌───────▼─────────┐      ┌───────▼──────────┐      ┌────────▼────────┐
   │  userProfile    │      │    account       │      │   session       │
   │  (NEW LINK)     │      │ (Better Auth)    │      │ (Better Auth)   │
   ├─────────────────┤      ├──────────────────┤      ├─────────────────┤
   │ profileId [PK]  │      │ id (uuid) [PK]   │      │ id (uuid) [PK]  │
   │ userId [FK→U]   │      │ userId [FK→U]    │      │ userId [FK→U]   │
   │ firstName       │      │ provider         │      │ sessionToken    │
   │ lastName        │      │ providerAccount  │      │ expiresAt       │
   │ course          │      │ name (OAuth name)│      │ ipAddress (NEW) │
   │ iChat           │      │ email            │      │ device (NEW)    │
   │ studentClass    │      │ createdAt        │      │ createdAt       │
   │ adminNumber     │      │ updatedAt        │      │ updatedAt       │
   │ createdAt       │      └──────────────────┘      └─────────────────┘
   │ updatedAt       │
   └─────────────────┘

┌──────────────────────────────┐
│        userRole              │  (Existing, unchanged)
├──────────────────────────────┤
│ userId [FK→user.id]          │
│ roleId [FK→role.roleId]      │
│ PRIMARY KEY (userId, roleId) │
└──────────────────────────────┘

┌──────────────────────────────┐
│          role                │  (Existing, unchanged)
├──────────────────────────────┤
│ roleId [PK]                  │
│ name (ADMIN, USER, etc.)     │
│ createdAt                    │
│ updatedAt                    │
└──────────────────────────────┘
```

---

## Core Tables (Better Auth)

### user

**Purpose**: Authentication identity and core user record (Better Auth managed)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK, DEFAULT random() | Better Auth generates |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Immutable primary login |
| `emailVerified` | BOOLEAN | DEFAULT false | Email verification flag |
| `name` | VARCHAR(255) | | From registration or OAuth |
| `image` | VARCHAR(255) | | OAuth profile picture |
| `createdAt` | TIMESTAMP | DEFAULT now() | Account creation time |
| `updatedAt` | TIMESTAMP | DEFAULT now() | Last update time |

**Relationships**:
- 1→1 to `userProfile` (via `userProfile.userId`)
- 1→* to `account` (multiple OAuth accounts)
- 1→* to `session` (multiple device sessions)
- 1→* to `userRole` (multiple roles via junction)

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`email`)

---

### account

**Purpose**: OAuth provider connections and account linking (Better Auth managed)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK, DEFAULT random() | Better Auth generates |
| `userId` | UUID | NOT NULL, FK→user.id | Linked user |
| `provider` | VARCHAR(50) | NOT NULL | e.g., "google", "github" |
| `providerAccountId` | VARCHAR(255) | NOT NULL | OAuth sub/id from provider |
| `name` | VARCHAR(255) | | OAuth display name (optional) |
| `email` | VARCHAR(255) | | OAuth email (if provided) |
| `createdAt` | TIMESTAMP | DEFAULT now() | |
| `updatedAt` | TIMESTAMP | DEFAULT now() | |

**Constraints**:
- UNIQUE (`userId`, `provider`) — one account per provider per user
- FK `userId` → `user.id` ON DELETE CASCADE

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`userId`, `provider`)
- INDEX on `provider`

**Example Rows**:
```
id=uuid1, userId=user1, provider="google", providerAccountId="118...@accounts.google.com"
id=uuid2, userId=user1, provider="github", providerAccountId="12345"
```

This enables account linking: one user can login via email/password, Google, and GitHub.

---

### session

**Purpose**: Server-managed user sessions with device tracking (Better Auth managed + custom fields)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK, DEFAULT random() | Better Auth generates |
| `sessionToken` | VARCHAR(255) | UNIQUE, NOT NULL | Cryptographically secure token |
| `userId` | UUID | NOT NULL, FK→user.id | Authenticated user |
| `expiresAt` | TIMESTAMP | NOT NULL | Session expiration (7 days default) |
| `ipAddress` | VARCHAR(45) | | IPv4 or IPv6 address of client |
| `deviceFingerprint` | VARCHAR(255) | | Browser fingerprint (sent from client) |
| `createdAt` | TIMESTAMP | DEFAULT now() | |
| `updatedAt` | TIMESTAMP | DEFAULT now() | |

**Constraints**:
- PK `id`
- UNIQUE `sessionToken`
- FK `userId` → `user.id` ON DELETE CASCADE

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`sessionToken`)
- INDEX on `userId` (for user session lookup)
- INDEX on `expiresAt` (for cleanup/expiry queries)

**Usage**:
- Session stored in HTTP-only cookie with token
- Server looks up session by token
- `ipAddress` + `deviceFingerprint` used for concurrent session tracking & security alerts
- Cleanup: periodic DELETE WHERE `expiresAt` < now()

---

## Custom Tables (Project-Specific)

### userProfile

**Purpose**: Personal/demographic data linked to user (separate table, NOT custom fields)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `profileId` | UUID | PK, DEFAULT random() | Primary key |
| `userId` | UUID | NOT NULL, FK→user.id | Link to Better Auth user |
| `firstName` | VARCHAR(100) | NOT NULL | |
| `lastName` | VARCHAR(100) | NOT NULL | |
| `course` | VARCHAR(10) | FK→course.code | Educational course |
| `iChat` | VARCHAR(100) | UNIQUE, NOT NULL | Messaging handle |
| `studentClass` | VARCHAR(20) | NOT NULL | Year/class level |
| `adminNumber` | VARCHAR(7) | UNIQUE, NOT NULL | Student ID |
| `createdAt` | TIMESTAMP | DEFAULT now() | |
| `updatedAt` | TIMESTAMP | DEFAULT now() | |

**Constraints**:
- PK `profileId`
- UNIQUE `userId` — exactly one profile per user
- UNIQUE `iChat`
- UNIQUE `adminNumber`
- FK `userId` → `user.id` ON DELETE CASCADE
- FK `course` → `course.code` ON DELETE SET NULL

**Indexes**:
- PRIMARY KEY (`profileId`)
- UNIQUE (`userId`)
- INDEX on `iChat`
- INDEX on `adminNumber`

**Design Rationale**:
- Separate from `user` table to keep auth concerns isolated
- All profile fields required (NOT NULL)
- Atomic creation: user + profile created in single transaction via `db.transaction()`

---

### userRole (Unchanged)

**Purpose**: RBAC junction between users and roles (existing, preserved as-is)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `userId` | UUID | FK→user.id | User reference |
| `roleId` | INTEGER | FK→role.roleId | Role reference |

**Constraints**:
- PRIMARY KEY (`userId`, `roleId`)
- FK `userId` → `user.id` ON DELETE CASCADE
- FK `roleId` → `role.roleId` ON DELETE CASCADE

**Changes**: Change `userId` type from `uuid('user_id')` to match Better Auth's user.id (UUID)

---

## Drizzle Schema Definition

### Simplified Drizzle Schema Overview

```typescript
// Better Auth tables (auto-generated or imported)
export const user = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: boolean('email_verified').default(false),
  name: varchar('name', { length: 255 }),
  image: varchar('image', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const account = pgTable('account', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ([
  uniqueIndex('account_user_provider_unique').on(table.userId, table.provider),
]))

export const session = pgTable('session', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: varchar('session_token', { length: 255 }).unique().notNull(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }), // NEW
  deviceFingerprint: varchar('device_fingerprint', { length: 255 }), // NEW
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ([
  uniqueIndex('session_token_unique').on(table.sessionToken),
  index('session_user_id_idx').on(table.userId),
  index('session_expires_at_idx').on(table.expiresAt),
]))

// Project-specific (existing structure, updated FK)
export const userProfile = pgTable('user_profile', {
  profileId: uuid('profile_id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique()
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  course: varchar('course', { length: 10 }).references(() => course.code, { onDelete: 'set null' }),
  iChat: varchar('ichat', { length: 100 }).notNull().unique(),
  studentClass: varchar('student_class', { length: 20 }).notNull(),
  adminNumber: varchar('admin_number', { length: 7 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ([
  uniqueIndex('user_profile_user_id_unique').on(table.userId),
]))

export const userRole = pgTable('user_role', {
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => role.roleId, { onDelete: 'cascade' }),
}, (table) => ([
  primaryKey({ columns: [table.userId, table.roleId] }),
]))

// Existing (unchanged)
export const role = pgTable('role', {...})
export const course = pgTable('course', {...})
// ... other existing tables
```

---

## Data Flow During Authentication

### Email/Password Registration

```
1. Client POSTs /api/auth/register with { email, password, firstName, lastName, course, ... }
2. Better Auth validates email/password, hashes password (PBKDF2)
3. Server transaction (atomic):
   a. Insert into `user` { email, name, ... }
   b. Insert into `userProfile` { userId, firstName, lastName, ... }
   c. Insert into `userRole` { userId, roleId: USER }
4. Better Auth creates session, returns sessionToken in HTTP-only cookie
5. Client receives { status: 'success', message: '...', data: { user, profile } }
```

### OAuth Sign-In (Google/GitHub)

```
1. Client clicks "Sign in with Google"
2. Redirects to Google consent, returns authorization code
3. Client POST /api/auth/callback/google with code
4. Better Auth exchanges code for OAuth tokens
5. If user exists (by email):
   a. Create `account` link { userId, provider: "google", ... }
   b. Reuse existing session
6. If user is new:
   a. Insert into `user` { email, name, image }
   b. Auto-insert into `userProfile` { userId, firstName (from OAuth name), ... }
   c. Insert into `userRole` { userId, roleId: USER }
   d. Create `account` link
   e. Create session
7. Server returns sessionToken in cookie
```

### Session Validation & Device Tracking

```
1. Client makes authenticated request with session cookie
2. Server extracts sessionToken from cookie
3. Lookup session by token:
   SELECT * FROM session WHERE sessionToken = ?
4. Validate not expired (expiresAt > now)
5. Attach user + profile + roles to `res.locals.user`
6. On login: capture req.ip (IP address) + client-sent deviceFingerprint
   UPDATE session SET ipAddress = ?, deviceFingerprint = ? WHERE id = ?
7. Response includes user context + profile data
```

---

## Migration Strategy

### Phase 1 (Schema Generation)

```bash
# Generate Better Auth schema for Drizzle
npx @better-auth/cli@latest generate --drizzle
# Output: schema file with user, account, session, verification tables

# Merge with existing schema.ts and add userProfile customization
```

### Phase 2 (Migrations)

```bash
# Generate migration
npm run db:generate

# Output: drizzle/000X_add_better_auth.sql with:
# - CREATE TABLE user { id, email, emailVerified, name, image, ... }
# - CREATE TABLE account { id, userId, provider, providerAccountId, ... }
# - CREATE TABLE session { id, sessionToken, userId, expiresAt, ipAddress, deviceFingerprint, ... }
# - ALTER TABLE userProfile ADD userId (FK), ADD UNIQUE(userId)
# - ALTER TABLE userRole CHANGE userId to UUID type

# Run migration
npm run db:push
```

### Phase 3 (Validation)

```bash
# Verify schema
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('user', 'account', 'session', 'user_profile')

# Verify relationships
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'user_profile' AND constraint_type = 'FOREIGN KEY'
```

---

## Assumptions & Constraints

- **No data migration**: No existing users to migrate; userProfile auto-populated from oath or registration form
- **Atomic transactions**: User + profile must be created together; rollback if either fails
- **Device fingerprint**: Sent from client via `@better-auth/react`; computed using browser fingerprinting library
- **IP address**: Captured from `req.ip` or `X-Forwarded-For` header (if behind proxy)
- **Session cleanup**: Implement periodic cron job to delete expired sessions (not in MVP, can be added later)
- **Concurrent sessions**: Allowed unlimited; device tracking enables identification
- **Cascade delete**: Deleting user cascades to userProfile, sessions, accounts, roles (cleanup automatic)

---

## Success Metrics

| Metric | Target | Verification |
|--------|--------|--------------|
| Schema compiles | 100% | `npm run db:push` succeeds |
| All FKs valid | 100% | `pg_stat_user_tables` shows expected constraints |
| User creation atomic | 100% | Test: delete middle table; transaction rolls back all |
| Session lookup <5ms | 95% | Database profiling query latency |
| Device tracking captures | 100% | Query session; ipAddress and deviceFingerprint populated |
| OAuth account links | 100% | User can login via 2+ methods; both resolve to same user |
| Role inheritance | 100% | User role query JOINs userRole table; returns roles |
