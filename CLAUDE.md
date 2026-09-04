# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

**Project Auxilium** — internally branded **SEED G.A.R.D.E.N. Terminal** — is an
event- and CCA-points management platform for a student organisation. Admins
create events, assign helpers to event roles, manage tasks per event, and
generate participation/points reports by cross-referencing Google Forms
response sheets (signup vs. feedback) against linked student profiles.

Current version: `0.4.0-alpha` (client and server `package.json`; also hardcoded
in `client/src/components/misc/version.tsx`).

## Repository layout

npm **workspaces** monorepo (`client`, `server`, `packages/*`). Node 20, ESM
(`"type": "module"` at the root and in the shared packages).

```
.
├── client/                  React Router v7 (SSR) + Redux Toolkit frontend
│   ├── src/app/             appDirectory — root.tsx, routes.ts, routes/, app.css
│   ├── src/components/      Shared UI (ui/ = shadcn, plus decorative/, misc/, navigation/)
│   ├── src/features/        Feature modules: auth, events, tasks, user
│   ├── src/state/           store.ts, api-slice.ts (RTK Query root), listener-middleware.ts
│   ├── src/lib/             api.ts (axios), auth-client.ts (better-auth), utils, formatters
│   ├── src/hooks/           redux-hooks.ts and UI hooks
│   ├── src/config/          nav.config.ts
│   └── src/types/           dto.types.ts (BaseResponseDTO)
├── server/                  NestJS 11 + Drizzle ORM + Postgres + Redis backend
│   ├── src/modules/         events, tasks, user, mail, redis, auth (hooks only)
│   ├── src/common/          guards/, decorators/, zod-validation.pipe.ts
│   ├── src/db/              schema.ts, relations.ts, index.ts, seed.ts, test-data.ts
│   ├── src/lib/             auth.ts (better-auth instance), formatters, otp-generator
│   ├── src/config/          system.config.ts, auth.config.ts, google.config.ts
│   └── drizzle/             Generated SQL migrations + snapshots
├── packages/configs/        @auxilium/configs — roles.ts, status.ts
├── packages/types/          @auxilium/types — errors.ts, pagination.ts
├── documentation/           entity-diagram.drawio (ER diagram)
├── .github/workflows/       deploy.yml (build → GHCR → SSH deploy on push to main)
├── docker-compose.yml       Local/staging stack (server, client, redis)
├── docker-compose.prod.yml  Production stack (nginx, server, client, redis)
└── nginx.conf               TLS termination + reverse proxy for production
```

`.claude/skills/` and `.agents/skills/` are vendored agent skills (better-auth,
shadcn) tracked by `skills-lock.json` — do not hand-edit them.
`.codegraph/` is local tooling state and is gitignored.

## Commands

Run from the repo root unless noted. Workspaces are targeted with `-w`.

```bash
npm install                      # install all workspaces

# Client (React Router)
npm run dev   -w client          # dev server on http://localhost:5173
npm run build -w client
npm run start -w client          # serve the production build (PORT, default 3000)
npm run typecheck -w client      # react-router typegen && tsc

# Server (NestJS)
npm run start:dev -w server      # watch mode
npm run build     -w server
npm run start:prod -w server     # drizzle-kit migrate && node dist/src/main
npm run test      -w server      # jest (*.spec.ts under src/)
npm run test:e2e  -w server      # jest --config ./test/jest-e2e.json

# Shared packages — build these before building client/server in a clean tree
npm run build -w @auxilium/configs -w @auxilium/types

# Database (from server/)
npx drizzle-kit generate -w server   # create a migration from schema.ts
npm run db:deploy  -w server         # apply migrations
npm run seed       -w server         # seed dev data
npm run seed:prod  -w server         # idempotent prod seed (reference tables)
npm run seed:reset -w server         # ⚠ drops all data, then seeds

# Repo-wide quality gates
npm run lint                     # eslint . --ext .js,.jsx,.ts,.tsx
npm run format                   # prettier --write .
```

There is **no root test script** (`npm test` at the root intentionally exits 1).
Tests live in the server workspace only; there is currently no client test setup.

## Tech stack

| Layer      | Choice |
|------------|--------|
| Frontend   | React 19, React Router 7 (framework mode, SSR on), Vite 7 |
| State      | Redux Toolkit + RTK Query; `react-hook-form` + `zod` for forms |
| Styling    | Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui (new-york, neutral, lucide) |
| 3D / motion| `@react-three/fiber` + `drei` + `postprocessing`, `motion` |
| Backend    | NestJS 11 (Express platform) |
| ORM / DB   | Drizzle ORM (v1 beta on the server) + PostgreSQL |
| Auth       | better-auth via `@thallesp/nestjs-better-auth`, Drizzle adapter |
| Cache      | Redis (OTP storage / rate limiting) |
| Email      | nodemailer (SMTP) |
| External   | Google Sheets API via service-account JWT |

## Architecture and data flow

### Request path

```
Browser
  → RTK Query endpoint (client/src/features/<domain>/state/<domain>-api-slice.ts)
      baseUrl = VITE_API_BASE_URL, credentials: 'include'
  → nginx (prod only: / → client:3000, /api/ → server:5175)
  → NestJS controller  (@Controller('api/<domain>'))
      guards:  RoleGuard → EventRoleGuard    (@Roles / @EventRoles metadata)
      body:    new ZodValidationPipe(<Schema>)
  → Service  (server/src/modules/<domain>/<domain>.service.ts)
  → Drizzle  (db.query.* relational API, or db.insert/update with transactions)
  → PostgreSQL
```

Every controller returns the same envelope, which the client types as
`BaseResponseDTO<T>`:

```ts
{ status: 'success' | 'error', message: string, data: T }
```

### Auth flow

- better-auth is configured once in `server/src/lib/auth.ts` and mounted by
  `AuthModule.forRoot({ auth })` in `app.module.ts`. It owns `/api/auth/*`.
- `main.ts` creates the Nest app with **`bodyParser: false`** — this is required
  by better-auth. Don't re-enable it.
- Sessions/accounts/verification tables live in `db/schema.ts` alongside domain
  tables (the Drizzle adapter reads them from there).
- Two `after` hooks in `auth.ts` (implemented in
  `server/src/modules/auth/lib/auth-hooks.ts`):
  - `setupUserDetails` on `/sign-up` — inserts the default `RolesConfig.USER` row
    into `user_role`.
  - `enrichSessionUserDetails` on `/get-session` — attaches
    `user.role = { roleId, role }` to the session. **All role checks depend on
    this enrichment**, both in `RoleGuard` and in the client's `RequireAuth`.
- Client-side, `authClient` (`client/src/lib/auth-client.ts`) points at
  `VITE_API_BASE_URL + '/auth'`; `authClient.useSession()` is the source of
  truth. `RequireAuth` (`features/auth/components/require-auth.tsx`) wraps
  protected layouts and redirects to `/auth/login` or `/unauthorized`.
- In development `disableOriginCheck` and `disableCSRFCheck` are on (for
  Postman). They are off in production — keep it that way.

### Authorisation model

Two independent role dimensions, both defined in `@auxilium/configs/roles`:

- **Global roles** (`RolesConfig`): `USER=1`, `ADMIN=2`, `SUPERADMIN=3`.
  Enforced by `@UseGuards(RoleGuard)` + `@Roles(...)`.
- **Per-event roles** (`EventRolesConfig`): `PARTICIPANT=1`, `COORDINATOR=2`,
  `MENTOR=3`, `FACILITATOR=4`, `POSTER_MAKER=5`, `EMAIL_WRITER=6`,
  `FORM_MAKER=7`. Enforced by `@UseGuards(RoleGuard, EventRoleGuard)` +
  `@EventRoles({ paramKey, roles })`, which reads the event id from
  `request.params[paramKey]` and looks up `user_event_role`. `SUPERADMIN`
  bypasses event-role checks.

`StatusConfig` (`@auxilium/configs/status`): `ACTIVE=1`, `PENDING=2`,
`SUSPENDED=3`, `DELETED=4`. Events are **soft-deleted** by setting
`statusId = DELETED`; `DELETE /api/events/:id/hard` (SUPERADMIN only) is the
only destructive path.

### Profile linking (OTP flow)

Accounts and student profiles are separate. A signed-in user links their profile
through `POST /api/user/verify` → `POST /api/user/verify/:otp`:

1. Look up `user_profile` by `ichat` (institutional email).
2. Generate a numeric OTP, store it in Redis under
   `otp:auth:profile-link:user_<userId>` with `OTPConfig.expiry`
   (300s prod / 180s dev). The presence of that key doubles as rate limiting.
3. Email the OTP via `MailService`.
4. On confirmation, link `user_profile.userId` to the account.

### Event report / verification engine

`POST /api/events/:id/generate` drives `VerificationEngineService`
(`server/src/modules/events/lib/verification-engine.service.ts`):

1. `SheetsService.extractSpreadsheetId()` pulls IDs out of the event's
   `signupUrl` and `feedbackUrl`.
2. Both sheets are read through the Google Sheets API (service-account JWT from
   `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_PRIVATE_KEY`).
3. Signup rows are cross-referenced with feedback rows and matched against
   `user_profile` records to determine attendance.
4. An `event_report` row plus `event_participation` rows are written, and
   results are pushed to the temp sheet (`TEMP_SHEET_ID`) for review.

### Database schema

`server/src/db/schema.ts` is the single source of truth; `relations.ts` declares
the relational query graph via `defineRelations`, and `db/index.ts` wires both
into the Drizzle client. An ER diagram lives at
`documentation/entity-diagram.drawio`.

Core tables: `user`, `user_profile`, `user_role`, `user_department`,
`role`, `department`, `course`, `status`, `event`, `event_type`, `event_role`,
`user_event_role` (composite PK `eventId, userId`), `event_report` (one per
event), `event_participation`, `task`, `task_comment`, and the better-auth
tables `session`, `account`, `verification`.

Enums (`pgEnum`): `event_points_type`, `task_status`, `task_priority`.

## Conventions

### General

- **File names are kebab-case** everywhere (`event-pagination-slice.ts`,
  `single-event-details.tsx`, `role.guard.ts`). Nest files keep their
  `*.controller.ts` / `*.service.ts` / `*.module.ts` / `*.dto.ts` suffixes.
- Prettier (root `.prettierrc`): single quotes, JSX single quotes, semicolons,
  2-space indent, 80-col print width, trailing commas, `proseWrap: always`,
  plus `prettier-plugin-tailwindcss` for class sorting. Run `npm run format`.
- ESLint: root `.eslintrc.cjs` for the monorepo; the server has its own flat
  config (`server/eslint.config.mjs`). `no-explicit-any` and
  `no-non-null-assertion` are **warnings**, and unused args are allowed when
  prefixed with `_`.
- Path alias `@/*` maps to `src/*` in both client and server; shared code is
  imported as `@auxilium/configs/*` and `@auxilium/types/*`. Prefer these over
  deep relative paths.
- Never hardcode role/status numbers — import `RolesConfig`, `EventRolesConfig`,
  `StatusConfig`.
- Commit messages use lowercase prefixes: `feat:`, `fix:`, `chore:`, `minor:`.
  Work happens on `feat/*`, `fix/*`, `devops/*` branches, PR'd into `dev`, then
  merged to `main` (which triggers deployment).

### Server (NestJS)

- One module per domain under `src/modules/<domain>/`, containing
  `<domain>.controller.ts`, `<domain>.service.ts`, `<domain>.module.ts`,
  `<domain>.dto.ts`, and optional `lib/` for supporting services.
- Controllers declare `const ROUTE_NAME = 'api/<domain>';` and use
  `@Controller(ROUTE_NAME)`. Note that `TaskController` deliberately shares the
  `api/events` prefix so task routes nest under events.
- **Route ordering matters**: literal segments (`@Get('types')`,
  `@Get('reports/:reportId')`) must be declared before catch-all params
  (`@Get(':id')`).
- Controllers stay thin — validate, unpack the session, call the service, wrap
  the result in the `{ status, message, data }` envelope. Business logic and all
  DB access belong in services.
- Validation is Zod via `@Body(new ZodValidationPipe(SomeSchema))`. The pipe also
  strips `undefined` values and converts `''` to `null`.
- DTO files export both the Zod schema (`CreateEventSchema`) and the inferred
  type (`CreateEventDTO`), plus `typeof schema.<table>.$inferSelect` aliases for
  row types.
- Each controller/service holds `private readonly logger = new Logger(X.name)`.
  Use it instead of `console.log`.
- Errors: throw Nest HTTP exceptions (`NotFoundException`,
  `BadRequestException`, `ForbiddenException`, `HttpException`) from controllers;
  services may throw `APIError` from `@auxilium/types/errors`.
- Multi-write operations use `db.transaction(async (tx) => { ... })`.
- Reads prefer the Drizzle relational API (`db.query.<table>.findFirst/findMany`
  with `where` / `with` / `columns` / `orderBy`) over manual joins.
- Config is read through the objects in `src/config/`, not scattered
  `process.env` access.

### Client (React Router + Redux)

- Routes are declared explicitly in `client/src/app/routes.ts` (config-based, not
  file-system routing); route modules live under `src/app/routes/`. `appDirectory`
  is `src/app`. SSR is enabled.
- Feature modules under `src/features/<domain>/` hold
  `components/`, `state/` (RTK Query slice + local slices), and `<domain>.dto.ts`.
- **One root RTK Query API** (`src/state/api-slice.ts`). Feature slices extend it
  with `apiSlice.injectEndpoints({ ... })` — never call `createApi` again. Add
  new cache tags to the root `tagTypes` array and use
  `providesTags` / `invalidatesTags` consistently.
- Server-driven pagination state lives in dedicated Redux slices extending
  `PaginationOptions` from `@auxilium/types/pagination`
  (`page`, `pageSize`, `sortBy`, `sortOrder`, `search`), each exporting a
  `select<X>PaginationState` selector.
- Use the typed hooks from `src/hooks/redux-hooks.ts` (`useAppDispatch`,
  `useAppSelector`, `useAppStore`) — never the untyped react-redux hooks.
- New reducers must be registered in `makeStore()` in `src/state/store.ts`.
- Two HTTP paths exist: RTK Query (`fetchBaseQuery`) for normal data, and an
  axios instance (`src/lib/api.ts`, `withCredentials`, qs `arrayFormat: 'repeat'`)
  for anything outside RTK Query. Both rely on cookie auth.
- shadcn/ui components go in `src/components/ui/` and are added with the shadcn
  CLI (`components.json`: new-york style, neutral base, lucide icons). Treat
  them as editable project code.
- Tailwind v4 — no `tailwind.config`; theme tokens are CSS variables in
  `src/app/app.css`. Compose classes with `cn()` from `src/lib/utils.ts`.
- Toasts use `sonner` (`<Toaster>` is mounted in `root.tsx`). Theme handling is
  `next-themes` with `attribute='class'` and a dark default.

## Environment variables

`server/.env.example` is **out of date** — it still lists `BETTER_AUTH_SECRET`,
`GOOGLE_OAUTH_ID/SECRET` and `GITHUB_OAUTH_ID/SECRET`, none of which the code
reads. The variables actually consumed by the server are:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string (also used by drizzle-kit) |
| `PORT` | Nest listen port (5175 in Docker; falls back to 3000) |
| `NODE_ENV`, `LOG_LEVEL` | `SystemConfig` |
| `CLIENT_URL` | Trusted origin + links in emails |
| `APP_NAME`, `AUTH_BASE_URL`, `AUTH_SECRET` | better-auth |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub social sign-in |
| `COOKIE_MAXAGE` | Cookie config |
| `JWT_SECRET`, `JWT_EXPIRY`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRY`, `SALT_ROUNDS` | Legacy `AuthConfig` (kept, but better-auth owns sessions today) |
| `REDIS_HOST`, `REDIS_PASSWORD` | Redis (port is hardcoded to 6379) |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASS` | nodemailer SMTP |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` | Sheets service account |
| `TEMP_SHEET_ID` | Scratch spreadsheet for generated reports |

Client (Vite, must be prefixed `VITE_`): `VITE_API_BASE_URL` — the API origin
including the `/api` path, e.g. `http://localhost:5175/api`. It is baked in at
**build time** (see the `build-args` in the Dockerfile and CI workflow).

Compose files expect `server/.env.staging` (dev stack), `server/.env.production`
(prod stack), `client/.env`, and `REDIS_PASSWORD` in the shell environment.
Never commit real `.env` files or `credentials.json`.

## Deployment

- Push to `main` triggers `.github/workflows/deploy.yml`: build and push
  `ghcr.io/proj-root/garden-server:latest` and `garden-client:latest`, then SSH
  to the VPS, `git pull` in `/var/www/garden`, and
  `docker compose -f docker-compose.prod.yml up -d`.
- Both Dockerfiles build from the **repo root context** and copy `packages/`,
  because the workspaces are required at build time.
- The server image's `docker-entrypoint.sh` runs `db:deploy` (migrations) and
  `seed:prod` before starting — so migrations must always be committed alongside
  schema changes.
- Health check: `GET /api/health` (`AppController`, `@AllowAnonymous`).

## Gotchas

- Do not re-enable Nest's body parser (`bodyParser: false` in `main.ts`) —
  better-auth needs the raw body.
- Custom session fields (`user.role`) are added by an `after` hook, so they are
  typed loosely; existing code uses `as any` / `@ts-expect-error` at those
  boundaries.
- `client/README.md` is still the stock React Router template README and does not
  describe this project.
- `client/src/features/auth/state/auth-slice.ts` exists but is **not registered**
  in `makeStore()`; `selectAuthState` would read `undefined`. Auth state comes
  from `authClient.useSession()`, not Redux. Don't build on the slice without
  wiring it up first.
- The client and server pin different TypeScript majors (server `^5.7`, root
  `^6.0`) and different Drizzle majors (server on `1.0.0-beta`, root on `0.45`).
  Check the workspace you are in before relying on version-specific APIs.
- The app version string in `version.tsx` is hardcoded and must be bumped
  manually alongside the `package.json` versions.
