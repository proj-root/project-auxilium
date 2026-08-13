# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Project Auxilium ("SEED GARDEN Terminal", deployed as `garden`) is an npm-workspaces monorepo: a NestJS API server, a React Router v7 SSR client, and two shared config/type packages. It manages events, event participation/reporting, users, and tasks for a student organisation, with role-based access at both the global and per-event level.

## Workspace layout

| Path | Package | Purpose |
| --- | --- | --- |
| `server/` | `server` | NestJS 11 API, Drizzle ORM + PostgreSQL, Redis, Better Auth |
| `client/` | `client` | React Router 7 (SSR), Redux Toolkit + RTK Query, Tailwind 4, shadcn/ui |
| `packages/configs/` | `@auxilium/configs` | Role/status ID enums shared by both sides (`./roles`, `./status` subpath exports) |
| `packages/types/` | `@auxilium/types` | `APIError` classes, pagination types (`./errors`, `./pagination`) |

The shared packages are consumed through their `exports` map (e.g. `@auxilium/configs/roles`), which resolves to `dist/`. **They must be built before server/client typecheck or build will resolve them.** Run `npm run build -w @auxilium/configs -w @auxilium/types`, or `npm run watch` inside each package during development.

Both `client` and `server` alias `@/*` to their own `src/*`. Root `tsconfig.json` is a project-references solution file over all four workspaces.

## Commands

Run from the repo root unless noted.

```bash
# Lint / format (root ESLint config covers the whole monorepo)
npm run lint
npm run format

# Server (cd server, or use -w server)
npm run start:dev          # nest start --watch
npm run build              # nest build
npm run start:prod         # drizzle-kit migrate && node dist/src/main
npm run test               # jest, matches *.spec.ts under src/
npm run test -- path/to/file.spec.ts    # single test file
npm run test -- -t "test name"          # single test by name
npm run test:watch
npm run test:cov
npm run test:e2e           # jest --config ./test/jest-e2e.json

# Database (from server/)
npx drizzle-kit generate   # generate migration from src/db/schema.ts
npm run db:deploy          # drizzle-kit migrate
npm run seed               # tsx src/db/seed.ts
npm run seed:reset         # wipes all tables via drizzle-seed reset, then seeds
npm run seed:prod

# Client (cd client, or use -w client)
npm run dev                # react-router dev, port 5173
npm run build
npm run typecheck          # react-router typegen && tsc  — run this, not bare tsc
npm run start              # serve the SSR build

# Local stack (server + client + redis)
docker compose up --build
```

`server/test/` currently holds only the scaffolded e2e spec; there are no unit specs yet.

## Architecture

### Auth (Better Auth, not NestJS Passport)

`server/src/lib/auth.ts` is the single Better Auth instance, mounted at `/api/auth` via `AuthModule.forRoot({ auth })` from `@thallesp/nestjs-better-auth`. Notes that bite:

- `main.ts` creates the Nest app with `bodyParser: false` — required by Better Auth. Do not re-enable it.
- An `after` hook rewrites two responses: `/sign-up` runs `setupUserDetails` (creates the profile/role rows), and `/get-session` calls `enrichSessionUserDetails` and attaches the result as `user.role`. Guards depend on that enrichment, so changing the hook shape breaks authorization.
- `advanced.disableOriginCheck` and `disableCSRFCheck` are on in `NODE_ENV=development` only (for Postman).
- Env names differ from the Better Auth defaults documented in `server/.env.example`: the code reads `AUTH_SECRET`, `AUTH_BASE_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `CLIENT_URL`, `APP_NAME`. Trust the code.
- Client side is `client/src/lib/auth-client.ts` (`better-auth/react`), pointed at `VITE_API_BASE_URL + "/auth"`.

### Authorization: two role layers

Roles are integer IDs, not enums in the DB — defined once in `packages/configs/roles.ts` and referenced everywhere as `RolesConfig.ADMIN` / `EventRolesConfig.COORDINATOR`.

- **Global role** — `@Roles(RolesConfig.ADMIN, ...)` + `@UseGuards(RoleGuard)`. Reads `session.user.role.roleId` from the enriched session.
- **Per-event role** — `@EventRoles({ paramKey: 'eventId', roles: [...] })` + `@UseGuards(EventRoleGuard)`. Looks up `userEventRole` through `EventsService.getUserEventRole`. `RolesConfig.SUPERADMIN` bypasses this check.

Guards attach `session.user` to `request.user` on success.

### Server module shape

Each feature under `server/src/modules/<name>/` is `<name>.controller.ts` / `.service.ts` / `.module.ts` / `.dto.ts`, with heavier collaborators in a `lib/` subfolder. Controllers own the route prefix as `api/<name>` (there is no global prefix). Modules: `events` (plus `lib/verification-engine.service.ts` and `lib/sheets.service.ts`), `user`, `tasks`, `mail` (nodemailer), `redis`, and `auth/lib/auth-hooks.ts`. `AppController` serves the unauthenticated `/api/health` used by the prod healthchecks.

Validation is Zod via `ZodValidationPipe` (`server/src/common/zod-validation.pipe.ts`), applied per-route with `@UsePipes`. The pipe also strips `undefined` keys and coerces `''` to `null` before it reaches Drizzle — relevant when writing DTO schemas.

The **verification engine** (`events/lib/verification-engine.service.ts` + `sheets.service.ts`) cross-references Google Sheets signup/feedback/helper exports against user profiles to compute attendance and turnout stats for event reports. It uses `@googleapis/sheets` with `credentials.json` at the repo root.

### Database

Drizzle over `node-postgres` (`pg`). Schema is one file, `server/src/db/schema.ts`, with relations split into `relations.ts` and shared `createdAt/updatedAt` in `column.helpers.ts`. `db/index.ts` exports the singleton `db`. Better Auth's own tables (`user`, `session`, `account`, `verification`) live in the same schema file alongside the domain tables (`userProfile`, `event`, `eventParticipation`, `userEventRole`, `eventReport`, `role`, `userRole`, `department`, `userDepartment`, `task`, `taskComment`, `course`, `status`, `eventType`, `eventRole`). Lookup tables (`role`, `status`, `eventType`, `eventRole`) use fixed integer IDs matching `@auxilium/configs` — keep the two in sync when adding a value.

Migrations live in `server/drizzle/` and are applied on prod container start via `start:prod`.

### Client

- Routes are declared explicitly in `client/src/app/routes.ts` (React Router config-based routing, `appDirectory: "src/app"`, SSR on). Three trees: public/`layout.tsx`, `admin/*`, and `auth/*`.
- Feature code lives in `client/src/features/<name>/` with `components/`, `state/`, and a `<name>.dto.ts` that duplicates the server DTO shapes. Server and client DTOs are **not** shared — changing a server DTO means hand-updating the client one.
- Data fetching is RTK Query. `client/src/state/api-slice.ts` is the single `createApi` root with the full `tagTypes` list; features add endpoints with `apiSlice.injectEndpoints`. New cache tags must be registered in that root list. `client/src/lib/api.ts` is a separate axios instance (`withCredentials`, `qs` repeat-array serialization) for the non-RTK calls.
- Store is built per-request via `makeStore()` in `client/src/state/store.ts` (SSR-safe), wired through `context/store-provider.tsx`. Pagination table state (events, users, user profiles, event reports) lives in dedicated slices next to the tables.
- UI is shadcn/ui "new-york", Tailwind v4 via `@tailwindcss/vite`, CSS entry `src/app/app.css`, lucide icons. Add components with the shadcn CLI, per `client/components.json`.

## Deployment

`.github/workflows/deploy.yml` runs on push to `main`: builds `ghcr.io/proj-root/garden-{server,client}:latest` (build context is the repo root, Dockerfiles are per-workspace), then SSHes to the VPS and re-ups `docker-compose.prod.yml` at `/var/www/garden`. The client's API base URL is baked in at image build time via the `VITE_API_BASE_URL` build arg — it is not runtime-configurable. nginx terminates TLS and proxies to both containers.

Env files: `server/.env`, `server/.env.staging`, `server/.env.production`, `client/.env`, plus a root `.env` holding `REDIS_PASSWORD` for compose.

## Bundled skills

`.agents/skills/` (symlinked into `.claude/skills/`) vendors third-party skills pinned by `skills-lock.json`: Better Auth best practices, Better Auth security, email-and-password auth, 2FA, and shadcn. Consult them before changing auth configuration or adding UI components. Do not hand-edit these directories.
