# Implementation Plan: Better Auth Migration

**Branch**: `001-better-auth-migration` | **Date**: April 5, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-better-auth-migration/spec.md`

---

## Summary

Upgrade Project Auxilium's authentication system from JWT-based (access tokens + HTTP-only refresh tokens) to Better Auth's superior session management while preserving the separate `userProfile` concept. Add OAuth support (Google & GitHub) with account linking. No user migration needed (greenfield). Include device/IP tracking for security auditing. Maintain full backward compatibility with existing RBAC and API contracts.

---

## Technical Context

**Language/Version**: TypeScript (Node.js + React), ES2024 target, strict mode enabled  
**Primary Dependencies**: 
  - Backend: Express.js (CJS), Drizzle ORM, PostgreSQL driver, Better Auth
  - Frontend: React Router v7 (SSR), Redux Toolkit, RTK Query, React Hook Form, Zod, TailwindCSS v4, shadcn/ui
**Storage**: PostgreSQL (primary), sessions stored in database via Better Auth adapter  
**Testing**: No automated tests currently in place (test script exits with error); to be implemented per constitution  
**Target Platform**: Full-stack web application (browser + Node.js server)  
**Project Type**: Full-stack monorepo (npm workspaces) with shared packages
**Performance Goals**: Login/logout <200ms response times, session continuity during navigation, automatic token refresh transparent to user  
**Constraints**: 
  - Strict TypeScript mode (noUncheckedIndexedAccess, noImplicitAny warnings)
  - Test-first development per constitution
  - All changes via PR with review
  - Path aliases (@/) for internal imports
**Scale/Scope**: 3 workspaces (client, server, packages), ~5 new core auth endpoints, ~8 OAuth endpoints, 2 feature tables (accounts), device tracking

---

## Constitution Check

**Principles Evaluated**:
1. ✅ **Modular Monorepo**: Auth feature remains isolated in feature directory; shared types in `@auxilium/types`; no hidden cross-workspace dependencies introduced
2. ✅ **Type Safety & Modern Tooling**: TypeScript strict mode enforced; Drizzle ORM for DB access; Prettier & Biome linting required
3. ⚠️  **Test-First Development**: Currently no test infrastructure. **REQUIREMENT: Implement unit tests for auth controllers, client state logic, and integration tests BEFORE merging** (per constitution III, non-negotiable)
4. ✅ **Observability & Logging**: Better Auth provides structured session logging; existing logger middleware continues; error handling via APIError class
5. ✅ **Simplicity & Explicitness**: Better Auth simplifies token management vs. custom JWT; explicit schema via Drizzle; no premature optimization

**Gate Status**: ⚠️  **CONDITIONAL PASS** — Feature may proceed if test implementation is prioritized and added before code merge. No complex patterns or deviations from constitution detected.

**Risk Mitigation**: 
- Allocate dedicated task for auth test suite in Phase 5 (Testing & Validation)
- PR must include >80% code coverage for auth modules before merge
- Integration tests must verify all 7 user stories pass

---

## Project Structure

### Documentation (this feature)

```
specs/001-better-auth-migration/
├── spec.md                            # Feature specification (completed)
├── plan.md                            # This file (implementation plan)
├── research.md                        # Phase 0 output (research findings)
├── data-model.md                      # Phase 1 output (schema design)
├── quickstart.md                      # Phase 1 output (integration summary)
├── contracts/                         # Phase 1 output (API contracts)
│   ├── auth-endpoints.md              # POST /api/auth/register, /api/auth/login, etc.
│   ├── oauth-providers.md             # /api/auth/callback/google, /api/auth/callback/github
│   ├── session-context.md             # Backend session shape, frontend Redux state
│   └── device-tracking.md             # Session metadata schema & IP capture
└── tasks.md                           # Phase 2 output (dependency-ordered tasks)
```

### Source Code (repository)

```
server/
├── src/
│   ├── lib/
│   │   ├── auth.ts                    # Better Auth config & initialization
│   │   ├── auth-hooks.ts              # Database hooks for custom logic
│   │   └── device-tracker.ts          # Capture browser/IP from session
│   ├── features/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts     # Login, register, logout, refresh (updated for Better Auth)
│   │   │   ├── auth.route.ts          # Route handlers
│   │   │   └── lib/
│   │   │       ├── oauth-callbacks.ts # Google/GitHub OAuth handlers
│   │   │       └── profile-builder.ts # Atomic user+profile creation
│   │   ├── user/
│   │   │   ├── user.model.ts          # getUserById, user+profile queries (updated)
│   │   │   └── user.controller.ts     # Admin user CRUD (updated for new schema)
│   │   └── [existing features remain unchanged]
│   ├── middleware/
│   │   ├── auth.middleware.ts         # Updated to work with Better Auth sessions
│   │   └── [other middleware unchanged]
│   ├── db/
│   │   ├── schema.ts                  # UPDATED: Add Better Auth tables + device tracking
│   │   ├── relations.ts               # UPDATED: Add userProfile → user relationship
│   │   └── migrations/                # NEW: Drizzle migrations for Better Auth
│   └── app.ts                         # Register Better Auth route handler
│
client/
├── src/
│   ├── lib/
│   │   ├── auth-client.ts             # Better Auth React client setup (NEW)
│   │   └── api.ts                     # Updated axios config (remove JWT injection)
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx     # Updated for Better Auth client
│   │   │   │   ├── register-form.tsx  # Updated with profile fields
│   │   │   │   ├── oauth-buttons.tsx  # NEW: Google & GitHub buttons
│   │   │   │   └── account-linking.tsx # NEW: Link OAuth to email account
│   │   │   ├── state/
│   │   │   │   ├── auth-slice.ts      # Updated to consume Better Auth session
│   │   │   │   └── auth-api-slice.ts  # Updated endpoints for Better Auth contract
│   │   │   └── auth.dto.ts            # (types remain compatible)
│   │   └── [existing features remain unchanged]
│   ├── hooks/
│   │   └── [new hook: useAuthSession for Better Auth integration]
│   └── [other files unchanged]
```

**Structure Decision**: Standard monorepo layout with feature-based organization. Auth feature expands to include OAuth and device tracking modules. No new top-level directory needed. All changes scoped to `auth/` and `user/` features with minimal impact on other features.

---

## Complexity Tracking

(No constitution violations requiring justification; feature is well-scoped and follows established patterns)
