# Project Auxilium - GitHub Copilot Instructions

## Project Overview

**Project Auxilium** (SEED G.A.R.D.E.N.) is a full-stack monorepo application for managing student events, attendance, and points tracking. Built with React Router v7, Express.js, PostgreSQL, and Drizzle ORM.

## Build, Test, and Lint Commands

### Root-level
- **Lint**: `biome check .` (server only, see below)
- **Lint + Fix**: `biome check --write .`
- **Format**: `biome format --write .`
- **CI**: `biome ci .`

### Client (`client/`)
- **Dev Server**: `npm run dev` (React Router dev server with HMR)
- **Build**: `npm run build` (production build)
- **Start**: `npm run start` (serve production build)
- **Type Check**: `npm run typecheck` (generates types then runs tsc)

### Server (`server/`)
- **Dev Server**: `npm run dev` (tsx with watch mode)
- **Dev (Clear)**: `npm run dev:clear` (clears console on restart)
- **Dev (Safe)**: `npm run dev:safe` (runs type check before starting)
- **Seed DB**: `npm run seed` (populate with test data)
- **Seed DB (Reset)**: `npm run seed:reset` (drop all and recreate)
- **Lint**: `npm run biome:check`
- **Lint + Fix**: `npm run biome:fix`
- **Format**: `npm run biome:format`
- **Lint Only**: `npm run biome:lint`
- **CI**: `npm run biome:ci`

### Shared Packages (`packages/configs/`, `packages/types/`)
- **Build**: `npm run build` (compiles TypeScript)
- **Watch**: `npm run watch` (watch mode)
- **Clean**: `npm run clean`

**Note**: There are no automated tests configured yet (`test` script exits with error).

## Architecture

### Monorepo Structure
This is a **npm workspaces** monorepo with three main areas:
- `client/` - React Router v7 (SSR-enabled) frontend
- `server/` - Express.js backend API
- `packages/` - Shared workspace packages:
  - `@auxilium/configs` - Shared configuration (roles, status enums)
  - `@auxilium/types` - Shared types (errors, pagination)

### Backend (Server)

**Stack**: Express.js + Drizzle ORM + PostgreSQL

**Architecture Pattern**: Feature-based organization with controller-model-route separation.

```
server/src/
├── app.ts              # Main Express app entry point
├── config/             # Configuration files (auth, Google API, system)
├── db/                 # Database layer
│   ├── schema.ts       # Drizzle schema definitions
│   ├── relations.ts    # Drizzle relations
│   ├── seed.ts         # Database seeding script
│   └── index.ts        # Database connection
├── features/           # Feature modules
│   ├── auth/           # Authentication feature
│   │   ├── auth.controller.ts
│   │   ├── auth.route.ts
│   │   └── lib/        # Feature-specific utilities
│   ├── events/         # Events management feature
│   └── user/           # User management feature
├── lib/                # Shared utilities
│   ├── catch-async.ts  # Async error wrapper
│   ├── logger.ts       # Winston logger
│   └── formatters.ts   # Data formatting utilities
└── middleware/         # Express middleware
    ├── auth.middleware.ts
    ├── errors.middleware.ts
    └── logger.middleware.ts
```

**Key Patterns**:
- **Controllers**: Wrap all async route handlers with `catchAsync()` utility (from `@/lib/catch-async`)
  - Example: `export const createEvent = catchAsync(async (req: Request, res: Response) => { ... })`
- **Models**: Database operations using Drizzle ORM queries
- **Routes**: Express routers that combine controllers with middleware
- **Error Handling**: Throw `APIError` from `@auxilium/types/errors` for consistent error responses
- **Authentication**: JWT-based with access tokens (short-lived) and refresh tokens (HTTP-only cookie)
  - Middleware: `verifyJWT` and `verifyIsRole([Roles.ADMIN])`
- **Path Aliases**: Use `@/` for imports (resolves to `src/`)

### Frontend (Client)

**Stack**: React Router v7 + Redux Toolkit + RTK Query + shadcn/ui + Tailwind CSS

**Architecture Pattern**: Feature-based organization with Redux state management.

```
client/src/
├── app/                # React Router routes
│   ├── root.tsx        # Root layout with providers
│   └── routes/         # File-based routing
├── components/         # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── misc/           # Other shared components
├── config/             # Frontend configuration
├── context/            # React context providers
├── features/           # Feature modules
│   ├── auth/           # Authentication feature
│   │   ├── components/ # Feature-specific components
│   │   ├── state/      # Redux slices and API slices
│   │   └── auth.dto.ts # Data transfer objects
│   ├── events/         # Events management feature
│   └── user/           # User management feature
├── hooks/              # Custom React hooks
├── lib/                # Shared utilities
│   ├── api.ts          # Axios instance
│   └── utils.ts        # Utility functions
├── state/              # Redux store configuration
│   ├── store.ts        # Store setup
│   ├── api-slice.ts    # Base RTK Query API slice
│   └── listener-middleware.ts
└── types/              # TypeScript types
```

**Key Patterns**:
- **State Management**: Redux Toolkit with RTK Query for API calls
  - Central API slice in `state/api-slice.ts` with custom axios base query
  - Feature-specific API slices inject endpoints: `apiSlice.injectEndpoints({ ... })`
  - Example: `auth-api-slice.ts`, `events-api-slice.ts`, `user-api-slice.ts`
- **Authentication**: JWT stored in Redux state, automatic token refresh via interceptors
- **Routing**: File-based routing with React Router v7 (SSR enabled)
  - Routes in `app/routes/`, layouts with `layout.tsx`
- **Styling**: Tailwind CSS v4 with shadcn/ui components (New York style)
- **Forms**: React Hook Form + Zod validation
- **Path Aliases**: Use `@/` for imports (resolves to `src/`)

### Shared Packages

**`@auxilium/configs`**: Configuration constants shared between client and server
- `roles.ts` - User role enum (ADMIN, SUPERADMIN, etc.)
- `status.ts` - Status configuration

**`@auxilium/types`**: TypeScript types shared between client and server
- `errors.ts` - `APIError` class for error handling
- `pagination.ts` - `PaginationOptions` type

## Conventions

### Code Style
- **Formatter**: Prettier (not Biome formatter - disabled in `biome.json`)
  - Single quotes, 80 char width, 2 space indent, trailing commas
  - Tailwind plugin enabled (sorts classes)
- **Linter**: Biome with recommended rules
  - `useBlockStatements`: off (allows single-line if statements)
  - `noExplicitAny`: warn
  - `noUnusedVariables`: warn
- **TypeScript**: Strict mode enabled, ES2024 target
  - `noUncheckedIndexedAccess`: true (forces index access safety)

### Server Conventions
- **Module System**: CommonJS (`"type": "commonjs"`)
- **Error Handling**: Always wrap async controllers with `catchAsync()`
- **Custom Errors**: Use `APIError(message, statusCode)` from `@auxilium/types`
- **Response Format**: Consistent JSON structure:
  ```typescript
  {
    status: 'success' | 'error',
    message: string,
    data?: { ... }
  }
  ```
- **Authentication**: 
  - Access user via `res.locals.user` (set by `verifyJWT` middleware)
  - Protect routes with `verifyJWT` and `verifyIsRole([...roles])`
- **Database**: Drizzle ORM with PostgreSQL
  - Schema in `db/schema.ts` with timestamp helpers
  - Run migrations with Drizzle Kit

### Client Conventions
- **Module System**: ES Modules (`"type": "module"`)
- **API Calls**: Use RTK Query endpoints, not direct axios calls
  - Define endpoints in feature-specific API slices
  - Inject into main `apiSlice` for automatic caching and invalidation
- **Component Structure**: Feature-based with co-located state and components
- **Styling**: Use Tailwind classes with `cn()` utility for conditional classes
- **Forms**: React Hook Form with Zod schema validation
- **Theming**: `next-themes` for dark/light mode (default: dark)

### Import Conventions
- Use `@/` path alias for all internal imports
- Import from workspace packages: `@auxilium/configs`, `@auxilium/types`
- Never use relative imports that traverse up more than one level

### Naming Conventions
- **Files**: kebab-case (e.g., `auth.controller.ts`, `events-api-slice.ts`)
- **Components**: PascalCase files for components (e.g., `RequireAuth.tsx`)
- **Types/Interfaces**: PascalCase
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE or camelCase depending on context

### Feature Organization
Both client and server follow a **feature-first** structure where each feature contains:
- Controllers/Components
- Models/State
- Routes (server) or API slices (client)
- Feature-specific utilities in `lib/` subdirectory

## Environment Setup

### Required Environment Variables

**Server** (`.env` in `server/`):
```
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CLIENT_URL=http://localhost:5173
```

**Client** (`.env` in `client/`):
```
VITE_API_BASE_URL=http://localhost:3000
```

### Database Setup
1. Ensure PostgreSQL is running
2. Create database
3. Run migrations: `drizzle-kit push` (from `server/`)
4. Seed data: `npm run seed` (from `server/`)

## Tips

- **Starting Development**: Run `npm run dev` in both `client/` and `server/` directories
- **Database Changes**: Update `schema.ts`, then use Drizzle Kit to generate and push migrations
- **Adding Shared Code**: Create exports in workspace packages (`@auxilium/configs`, `@auxilium/types`)
- **New Features**: Follow the existing feature structure with controller-model-route (server) or component-state-api (client)
- **Google Sheets Integration**: Server has Google Sheets API integration for event data export (see `credentials.json`)

## Speckit Reference Documents

This project uses Speckit for feature planning and implementation tracking. Detailed reference documents are available in `.specify/memory/`:

- **[constitution.md](.specify/memory/constitution.md)**: Core project principles, governance model, and quality gates
  - Foundational constraints: TypeScript mandatory, test-first development, type safety, observability
  - Pull request workflow and development quality standards
  
- **[CODING_CONVENTIONS.md](.specify/memory/CODING_CONVENTIONS.md)**: Comprehensive coding standards and patterns
  - Architecture patterns, naming conventions, database design guidelines
  - API design standards, error handling, type safety requirements
  - Response format standards, middleware & authentication patterns
  
- **[ARCHITECTURE_DIAGRAM.md](.specify/memory/ARCHITECTURE_DIAGRAM.md)**: Visual and detailed architecture overview
  - Client-Server interaction flow
  - Three-layer architecture (route, controller, model)
  - Feature implementation workflows
  
- **[IMPLEMENTATION_CHECKLIST.md](.specify/memory/IMPLEMENTATION_CHECKLIST.md)**: Step-by-step checklist for implementing new features
  - Pre-implementation planning
  - Database schema requirements
  - Backend controller and route patterns
  - Frontend component and state management patterns
  - Testing and validation requirements

When implementing features, verify compliance with the constitution and use the implementation checklist as guidance.
