# SEED GARDEN

> Modern problems require modern solutions

Event, membership, and task management for a student organisation — internally deployed as **SEED GARDEN Terminal**.

Committee members run events end to end: create an event, assign helpers to per-event roles, cross-reference Google Sheets signup and feedback exports to verify who actually turned up, and generate points/attendance reports. Admins manage user profiles, departments, courses, and roles; task boards are scoped per event.

## Stack

| Layer | Tech |
| --- | --- |
| API | NestJS 11, Drizzle ORM, PostgreSQL, Redis |
| Auth | Better Auth (email/password + GitHub OAuth) |
| Web | React Router 7 (SSR), Redux Toolkit + RTK Query, Tailwind CSS 4, shadcn/ui |
| Integrations | Google Sheets API, Nodemailer |
| Infra | Docker Compose, nginx, GitHub Actions → GHCR |

## Repository layout

npm workspaces monorepo:

```
client/             React Router SSR frontend
server/             NestJS API
packages/configs/   @auxilium/configs — shared role & status IDs
packages/types/     @auxilium/types   — shared error & pagination types
```

## Getting started

Requires Node 20+, PostgreSQL, and Redis (or Docker for the latter).

```bash
npm install

# Shared packages resolve to dist/ — build them before anything else
npm run build -w @auxilium/configs -w @auxilium/types

# Configure the server
cp server/.env.example server/.env   # then fill in, see below

# Apply migrations and seed reference data
cd server && npx drizzle-kit migrate && npm run seed && cd ..
```

Run both sides in separate terminals:

```bash
npm run start:dev -w server   # http://localhost:5175
npm run dev -w client         # http://localhost:5173
```

Or bring up the whole stack, Redis included:

```bash
docker compose up --build     # client :3000, server :5175, redis :6379
```

### Environment

`server/.env.example` is a starting point but is out of date — the code reads these names:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET`, `AUTH_BASE_URL` | Better Auth |
| `CLIENT_URL`, `APP_NAME`, `PORT`, `NODE_ENV` | |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | OAuth provider |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `TEMP_SHEET_ID` | Sheets verification engine |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_SECURE` | Transactional email |
| `REDIS_HOST`, `REDIS_PASSWORD` | `REDIS_PASSWORD` is also read from the root `.env` by Docker Compose |

`client/.env` needs `VITE_API_BASE_URL` (and optionally `PORT`). It is baked in at build time, so Docker images are environment-specific.

## Common commands

```bash
npm run lint                 # ESLint across the monorepo
npm run format               # Prettier

npm test -w server           # Jest
npm run test:cov -w server
npm run typecheck -w client  # react-router typegen && tsc

npx drizzle-kit generate     # from server/ — create a migration from src/db/schema.ts
npm run db:deploy -w server  # apply migrations
npm run seed:reset -w server # wipe all tables, then reseed
```

## Deployment

Pushing to `main` builds `garden-server` and `garden-client` images, publishes them to GHCR, and redeploys the VPS via `docker-compose.prod.yml` behind nginx with Let's Encrypt TLS. Migrations run on server container start.

## Documentation

- `CLAUDE.md` — architecture notes and conventions for contributors and AI agents
- `documentation/entity-diagram.drawio` — database entity diagram

## License

Apache-2.0. See [LICENSE](./LICENSE).
