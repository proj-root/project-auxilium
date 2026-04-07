# API Contracts: Auth Endpoints

**Phase**: 1 (Design)  
**Type**: API Contract  
**Last Updated**: April 5, 2026

---

## Overview

All auth endpoints return a consistent response structure. Errors are handled via APIError with appropriate HTTP status codes. Session management is automatic via HTTP-only cookies.

---

## Response Format (Standard)

### Success Response

```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2026-04-05T10:00:00Z"
    },
    "profile": {
      "profileId": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "course": "CS101",
      "iChat": "johndoe",
      "studentClass": "2026",
      "adminNumber": "1234567"
    }
  }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Email already registered",
  "data": null
}
```

**HTTP Status Codes**:
- `200 OK` — Successful request
- `201 Created` — User created
- `400 Bad Request` — Validation error or bad input
- `401 Unauthorized` — Invalid credentials or missing session
- `403 Forbidden` — Insufficient permissions (role-based)
- `409 Conflict` — Duplicate email or resource
- `500 Internal Server Error` — Server error

---

## Email/Password Endpoints

### POST /api/auth/register

**Purpose**: Create a new user account with profile information

**Request**:
```typescript
{
  email: string               // email@example.com (required, must be unique)
  password: string            // min 8 chars (Better Auth default)
  firstName: string           // (required)
  lastName: string            // (required)
  course?: string             // CS101, etc. (optional, must exist in course table)
  iChat: string               // messaging handle (required, unique)
  studentClass: string        // "2026", "2025", etc. (required)
  adminNumber: string         // "1234567" (required, unique)
}
```

**Response (201 Created)**:
```typescript
{
  status: "success",
  message: "User registered successfully",
  data: {
    user: {
      id: string              // UUID
      email: string
      name: string            // auto-derived from firstName + lastName
      createdAt: string       // ISO 8601
    },
    profile: {
      profileId: string
      firstName: string
      lastName: string
      course: string | null
      iChat: string
      studentClass: string
      adminNumber: string
    }
  }
}
```

**Error Cases**:
- `400` — Missing required fields: `{ message: "firstName, lastName, iChat, studentClass, adminNumber required" }`
- `400` — Password too short: `{ message: "Password must be at least 8 characters" }`
- `400` — Invalid email: `{ message: "Invalid email format" }`
- `409` — Duplicate email: `{ message: "Email already registered" }`
- `409` — Duplicate iChat: `{ message: "iChat already in use" }`
- `409` — Duplicate adminNumber: `{ message: "Admin number already registered" }`

**Side Effects**:
- User created in `user` table
- Profile created in `userProfile` table (atomically with user)
- Default USER role assigned via `userRole` table
- Session created and returned in HTTP-only cookie
- Client receives sessionToken (no JavaScript access due to httpOnly flag)

---

### POST /api/auth/login

**Purpose**: Authenticate with email and password

**Request**:
```typescript
{
  email: string
  password: string
}
```

**Response (200 OK)**:
```typescript
{
  status: "success",
  message: "User logged in successfully",
  data: {
    user: {
      id: string
      email: string
      name: string
      createdAt: string
    },
    profile: {
      profileId: string
      firstName: string
      lastName: string
      course: string | null
      iChat: string
      studentClass: string
      adminNumber: string
    }
  }
}
```

**Sets Cookie**:
```
Set-Cookie: sessionToken=<token>; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```
(Max-Age = 7 days in seconds)

**Error Cases**:
- `400` — Missing email or password: `{ message: "Email and password required" }`
- `401` — Invalid credentials: `{ message: "Invalid credentials provided" }`

**Side Effects**:
- Session created (7-day expiry)
- Device fingerprint and IP address captured from request
- Cookie set in response (automatic via Better Auth middleware)

---

### POST /api/auth/logout

**Purpose**: Destroy user session and clear cookies

**Request**: None (authenticated request required)

**Response (204 No Content)**: Empty body

**Sets Cookie**:
```
Set-Cookie: sessionToken=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```
(Clears the cookie)

**Side Effects**:
- Session deleted from `session` table
- All future requests without valid sessionToken rejected with 401

---

### GET /api/auth/session

**Purpose**: Get current user session and profile data (check auth status)

**Request**: Authenticated (cookie must contain valid sessionToken)

**Response (200 OK)**:
```typescript
{
  status: "success",
  message: "Session retrieved",
  data: {
    user: {
      id: string
      email: string
      name: string
      createdAt: string
    },
    profile: {
      profileId: string
      firstName: string
      lastName: string
      course: string | null
      iChat: string
      studentClass: string
      adminNumber: string
    },
    roles: ["USER"] | ["ADMIN", "USER"] // Array of role names for this user
  }
}
```

**Error Cases**:
- `401` — Missing or invalid session: `{ message: "Unauthorized" }`
- `401` — Session expired: `{ message: "Session expired, please login again" }`

**Side Effects**: None (read-only)

---

## OAuth Endpoints

### GET /api/auth/signin/google

**Purpose**: Redirect to Google OAuth consent screen

**Query Parameters**:
```typescript
{
  callbackURL?: string  // Optional: where to redirect after consent
}
```

**Response**: HTTP 302 Redirect to `https://accounts.google.com/o/oauth2/v2/auth?client_id=...`

**Side Effects**: None (client-side redirect)

---

### GET /api/auth/callback/google

**Purpose**: Google OAuth callback handler (called by Google after user consent)

**Query Parameters** (provided by Google):
```typescript
{
  code: string          // Authorization code
  state: string         // CSRF protection token
}
```

**Response (200 OK)**:
```typescript
{
  status: "success",
  message: "Signed in with Google",
  data: {
    user: {
      id: string
      email: string
      name: string
      image?: string    // OAuth profile picture
      createdAt: string
    },
    profile: {
      profileId: string
      firstName: string  // Auto-populated from OAuth name
      lastName: string   // Auto-populated from OAuth name
      course: null       // Not provided by OAuth; user fills in later
      iChat: null        // Required; user must provide
      studentClass: null // Required; user must provide
      adminNumber: null  // Required; user must provide
    }
  }
}
```

**Sets Cookie**: `sessionToken` (same as login)

**Error Cases**:
- `401` — Authorization code invalid: `{ message: "Google authorization failed" }`
- `400` — CSRF token mismatch: `{ message: "Invalid state parameter" }`
- `400` — Missing code: `{ message: "Authorization code required" }`

**Side Effects**:
- If email exists: existing user's account is linked (account record created)
- If new user: user created with profile auto-populated from OAuth name
- Session created with device fingerprint and IP
- Redirect to frontend (usually `/auth/complete-profile` if profile incomplete)

---

### GET /api/auth/callback/github

**Purpose**: GitHub OAuth callback handler (identical to Google except provider="github")

**Query Parameters**:
```typescript
{
  code: string
  state: string
}
```

**Response**: Same as Google callback

**Error Cases**: Same as Google callback

---

### POST /api/auth/account/link

**Purpose**: Link an OAuth account to existing email/password user (account linking)

**Request**:
```typescript
{
  provider: "google" | "github"
  code: string        // OAuth authorization code
  state: string       // CSRF token
}
```

**Response (200 OK)**:
```typescript
{
  status: "success",
  message: "Account linked successfully",
  data: {
    user: {
      id: string
      email: string
      name: string
      createdAt: string
    },
    accounts: [
      { provider: "email", id: "..." },
      { provider: "google", id: "..." }
    ]
  }
}
```

**Error Cases**:
- `400` — Invalid provider: `{ message: "Provider must be 'google' or 'github'" }`
- `401` — Not authenticated: `{ message: "Must be logged in to link account" }`
- `409` — Account already linked: `{ message: "This Google account is already linked to a user" }`

**Side Effects**:
- Account record created linking OAuth identity to current user
- User can now login via both email/password and Google/GitHub

---

### POST /api/auth/account/unlink

**Purpose**: Unlink an OAuth account from user (optional; not in MVP)

**Request**:
```typescript
{
  provider: "google" | "github"
}
```

**Response (200 OK)**:
```typescript
{
  status: "success",
  message: "Account unlinked",
  data: { accounts: [...] }
}
```

**Error Cases**:
- `401` — Not authenticated
- `400` — Cannot unlink last auth method

---

## Session Cookie Details

### Cookie Format

| Property | Value | Notes |
|----------|-------|-------|
| **Name** | `sessionToken` | |
| **Value** | Cryptographically random string | ~32 characters, hex-encoded |
| **HttpOnly** | true | Prevents JavaScript access (XSS safe) |
| **Secure** | true (prod) / false (dev) | Only sent over HTTPS in production |
| **SameSite** | Strict (prod) / Lax (dev) | CSRF protection |
| **Path** | `/` | Available to all routes |
| **Max-Age** | 604800 (7 days) | Session expiration in seconds |
| **Domain** | (implicit) | Same domain only |

### Session Lifecycle

```
1. [CLIENT] POST /api/auth/register → [SERVER] Create user + profile + session
2. [SERVER] Set-Cookie: sessionToken=<...>
3. [BROWSER] Store sessionToken in cookie jar
4. [CLIENT] GET /api/protected → [BROWSER] Auto-attach Cookie header
5. [SERVER] Validate sessionToken; attach user to req.locals
6. [SERVER] Check session.expiresAt; if approaching, refresh (new sessionToken)
7. [BROWSER] If Set-Cookie received, update cookie
8. [CLIENT] ... navigations continue with valid session ...
9. [CLIENT] POST /api/auth/logout → [SERVER] Delete session, Set-Cookie max-age=0
10. [BROWSER] Remove sessionToken from cookie jar
```

### Automatic Refresh

- If remaining session lifetime < 1 hour: server issues new sessionToken during request processing
- Client receives new Set-Cookie header automatically
- Browser updates cookie; user unaffected
- Old session token invalidated

---

## Authentication Middleware

### Backend Middleware: verifyJWT → verifySession (UPDATED)

```typescript
// OLD (JWT)
const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  const decoded = jwt.verify(token, secret)
  res.locals.user = decoded
  next()
}

// NEW (Better Auth)
const verifySession = async (req, res, next) => {
  const sessionToken = req.cookies.sessionToken
  if (!sessionToken) return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  
  const session = await db.query.session.findFirst({
    where: eq(sessionTable.sessionToken, sessionToken),
    with: { user: { with: { profile: true, roles: true } } }
  })
  
  if (!session || session.expiresAt < new Date()) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  
  res.locals.user = {
    id: session.user.id,
    email: session.user.email,
    profile: session.user.profile,
    roles: session.user.roles.map(r => r.role.name)
  }
  next()
}
```

### Frontend: Auto-Attach & Refresh

```typescript
// axios instance: automatically attaches cookies
axios.defaults.withCredentials = true

// Interceptor: handle 401 gracefully
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Refresh from /api/auth/session
      dispatch(refreshSession())
    }
    return Promise.reject(error)
  }
)
```

---

## Rate Limiting (Out of Scope for MVP, Recommended Future)

Endpoint-specific limits:
- `/api/auth/login`: 5 attempts / 15 minutes per IP → 429 Too Many Requests
- `/api/auth/register`: 3 registrations / hour per IP
- `/api/auth/callback/*`: No limit (already CSRF-protected)

---

## CORS Configuration

| Setting | Value | Reason |
|---------|-------|--------|
| **Allowed Origins** | `http://localhost:5173` (dev), `https://app.example.com` (prod) | Same-origin; credentials required |
| **Allowed Methods** | GET, POST, PUT, DELETE, OPTIONS | Standard REST ops |
| **Allowed Headers** | Content-Type, Authorization | Standard headers |
| **Credentials** | true | Cookies must be sent |
| **Max Age** | 86400 (1 day) | Preflight caching |

---

## Testing Scenarios

### Scenario 1: New User Email Registration
```
1. POST /api/auth/register { email, password, firstName, ... } → 201
2. GET /api/auth/session (with auto-attached cookie) → 200 + user data
3. POST /api/auth/logout → 204
4. GET /api/auth/session → 401 (no valid session)
✅ PASS
```

### Scenario 2: Google Sign-In Flow
```
1. Client clicks "Sign in with Google"
2. GET /api/auth/signin/google → 302 Redirect to Google
3. User consents, Google redirects to /api/auth/callback/google?code=...&state=...
4. Server exchanges code for Google tokens, creates/links user
5. GET /api/auth/session → 200 + user data + roles
✅ PASS
```

### Scenario 3: Duplicate Email
```
1. POST /api/auth/register { email: "john@example.com", password, ... } → 201
2. POST /api/auth/register { email: "john@example.com", password, ... } → 409 Conflict
✅ PASS
```

### Scenario 4: Invalid Credentials
```
1. POST /api/auth/login { email: "john@example.com", password: "wrong" } → 401
✅ PASS
```

### Scenario 5: Account Linking
```
1. POST /api/auth/login { email, password } → 200
2. GET /api/auth/session → user.accounts = [{ provider: "email", ... }]
3. POST /api/auth/account/link { provider: "google", code, state } → 200
4. GET /api/auth/session → user.accounts = [{ provider: "email" }, { provider: "google" }]
5. POST /api/auth/logout → 204
6. GET /api/auth/signin/google → redirect → callback → 200 (logs in with Google)
✅ PASS
```

---

## Summary

- **Exact API contract** with request/response shapes
- **Consistent error handling** (status, message, null data)
- **Automatic session management** via HTTP-only cookies
- **OAuth account linking** enables multi-method authentication
- **Device/IP tracking** in session for security auditing
- **Testing scenarios** document happy path and error cases
