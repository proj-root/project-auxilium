# Project Auxilium - Coding Conventions & Standards

**Last Updated:** April 2026  
**Project:** Project Auxilium (Full-Stack TypeScript Monorepo)

This document establishes the standard conventions for writing code in the Project Auxilium codebase. All new features should follow these patterns for consistency, maintainability, and quality.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Server Architecture](#backend-server-architecture)
3. [Feature Implementation Pattern](#feature-implementation-pattern)
4. [Naming Conventions](#naming-conventions)
5. [Database Design Guidelines](#database-design-guidelines)
6. [API Design Standards](#api-design-standards)
7. [Error Handling](#error-handling)
8. [Type Safety](#type-safety)
9. [Code Organization](#code-organization)
10. [Response Format Standards](#response-format-standards)
11. [Middleware & Authentication](#middleware--authentication)
12. [Testing & Validation](#testing--validation)

---

## Architecture Overview

**Tech Stack:**
- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js with Express framework
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** JWT-based authentication
- **Validation:** express-validator
- **Code Quality:** Biome (formatter + linter)
- **Monorepo Structure:** Workspace with shared packages (`@auxilium/configs`, `@auxilium/types`)

**Monorepo Organization:**
```
project-auxilium/
├── server/              # Express.js backend
├── client/              # React frontend with Vite
├── packages/
│   ├── configs/         # Shared configuration values (roles, statuses)
│   └── types/           # Shared TypeScript types & interfaces
```

---

## Backend Server Architecture

The backend uses a **three-layer architecture pattern** for each feature:

```
Feature (e.g., events)
├── {feature}.controller.ts    # HTTP layer - Request/Response handling
├── {feature}.model.ts         # Data layer - Database operations
├── {feature}.route.ts         # Routing layer - Endpoint definitions
└── lib/                       # Feature-specific utilities & helpers
    └── *.ts                   # Business logic functions
```

### Layer Responsibilities

| Layer | File | Responsibility |
|-------|------|-----------------|
| **Route** | `.route.ts` | Define endpoints, mount middleware, delegate to controller |
| **Controller** | `.controller.ts` | Validate input, call model methods, format response, handle errors |
| **Model** | `.model.ts` | Query database, apply business rules, return structured data |
| **Library** | `lib/*.ts` | Complex business logic, external API calls, calculations |

---

## Feature Implementation Pattern

### Step 1: Create the Route File `{feature}.route.ts`

```typescript
import express from 'express';
import * as {Feature}Controller from './{feature}.controller';
import { verifyIsRole, verifyJWT } from '@/middleware/auth.middleware';
import { Roles } from '@auxilium/configs/roles';

const {Feature}Router = express.Router();

// Apply authentication/authorization middleware
{Feature}Router.use(verifyJWT);
{Feature}Router.use(verifyIsRole([Roles.ADMIN, Roles.SUPERADMIN]));

// Define endpoints with clear comments
// POST - Create resource
{Feature}Router.post('/', {Feature}Controller.create{Feature});

// GET - List resources
{Feature}Router.get('/', {Feature}Controller.getAll{Feature}s);

// GET - Retrieve single resource
{Feature}Router.get('/:id', {Feature}Controller.get{Feature}ById);

// PUT - Update resource
{Feature}Router.put('/:id', {Feature}Controller.update{Feature});

// DELETE - Soft delete resource
{Feature}Router.delete('/:id', {Feature}Controller.delete{Feature});

// DELETE - Hard delete resource
{Feature}Router.delete('/:id/hard', {Feature}Controller.hardDelete{Feature});

export default {Feature}Router;
```

**Route Design Principles:**
- ✅ Mount all middleware before route handlers
- ✅ Use consistent HTTP methods (POST=create, GET=read, PUT=update, DELETE=delete)
- ✅ Include brief comments explaining each endpoint group
- ✅ Use resource naming in URLs (plurals for collections, IDs for specific resources)
- ✅ Destructure specific roles when authorization is needed

### Step 2: Create the Controller File `{feature}.controller.ts`

```typescript
import type { Request, Response } from 'express';
import { catchAsync } from '@/lib/catch-async';
import * as {Feature}Model from './{feature}.model';
import { APIError } from '@auxilium/types/errors';

// Export named functions for each endpoint
export const create{Feature} = catchAsync(async (req: Request, res: Response) => {
  // 1. Extract and validate required fields
  const { field1, field2, field3 } = req.body;

  if (!field1 || !field2) {
    throw new APIError(
      'Missing required fields: field1, field2',
      400,
    );
  }

  // 2. Extract authenticated user info
  const userId = res.locals.user.userId;
  if (!userId) {
    throw new APIError('Unauthorized; missing user information', 401);
  }

  // 3. Call model layer
  const result = await {Feature}Model.create{Feature}({
    field1,
    field2,
    field3,
    createdBy: userId,
  });

  // 4. Return standardized response
  res.status(201).json({
    status: 'success',
    message: '{Feature} created successfully',
    data: {
      {feature}: result,
    },
  });
});

export const getAll{Feature}s = catchAsync(async (req: Request, res: Response) => {
  // Extract pagination and filter params
  const { page, pageSize, sortBy, sortOrder, search, filterId } = req.query;

  // Call model with typed parameters
  const results = await {Feature}Model.getAll{Feature}s({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    sortBy: sortBy as 'field' | 'createdAt',
    sortOrder: sortOrder as 'asc' | 'desc',
    search: search as string,
    filterId: filterId ? Number(filterId) : undefined,
  });

  res.status(200).json({
    status: 'success',
    message: '{Feature}s retrieved successfully',
    data: results,
  });
});

export const get{Feature}ById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await {Feature}Model.get{Feature}ById({ id: id as string });

  if (!result) {
    throw new APIError('{Feature} not found', 404);
  }

  res.status(200).json({
    status: 'success',
    message: '{Feature} retrieved successfully',
    data: result,
  });
});

export const update{Feature} = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { field1, field2 } = req.body;

  await {Feature}Model.update{Feature}ById({
    id: id as string,
    field1,
    field2,
  });

  res.status(200).json({
    status: 'success',
    message: '{Feature} updated successfully',
  });
});

export const delete{Feature} = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await {Feature}Model.delete{Feature}ById({ id: id as string });

  res.status(200).json({
    status: 'success',
    message: '{Feature} deleted successfully',
  });
});

export const hardDelete{Feature} = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await {Feature}Model.hardDelete{Feature}ById({ id: id as string });

  res.status(200).json({
    status: 'success',
    message: '{Feature} permanently deleted successfully',
  });
});
```

**Controller Design Principles:**
- ✅ Use `catchAsync` wrapper to handle errors automatically
- ✅ Validate required fields before DB operations
- ✅ Extract authenticated user from `res.locals.user`
- ✅ Use `APIError` for all error responses
- ✅ Maintain consistent HTTP status codes
- ✅ Return standardized JSON response structure
- ✅ Include brief, user-friendly messages
- ✅ Type params as strings and convert (e.g., `Number(page)`)

### Step 3: Create the Model File `{feature}.model.ts`

```typescript
import db from '@/db';
import {
  {featureTable} as {featureTableName},
  {relatedTable},
} from '@/db/schema';
import { StatusConfig } from '@auxilium/configs/status';
import type { PaginationOptions } from '@auxilium/types/pagination';
import { APIError } from '@auxilium/types/errors';
import { eq, ilike, or } from 'drizzle-orm';

// Define argument interfaces for type safety
interface Create{Feature}Args {
  field1: string;
  field2: string;
  field3?: string;
  createdBy: string;
}

// Named export for creation
export const create{Feature} = async (args: Create{Feature}Args) => {
  const [new{Feature}] = await db
    .insert({featureTableName})
    .values({
      ...args,
    })
    .returning();

  return new{Feature};
};

// Single retrieval with relations
export const get{Feature}ById = async ({ id }: { id: string }) => {
  const result = await db.query.{featureName}.findFirst({
    where: eq({featureTableName}.id, id),
    with: {
      relatedTable: true,
      creator: {
        columns: {
          password: false, // Exclude sensitive fields
        },
      },
    },
  });

  return result;
};

// Paginated list with filtering and sorting
interface GetPaginated{Feature}sArgs extends PaginationOptions {
  sortBy?: 'field1' | 'createdAt';
  filterId?: number;
}

export const getAll{Feature}s = async ({
  page = 1,
  pageSize = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  search,
  filterId = undefined,
}: GetPaginated{Feature}sArgs) => {
  const results = await db.query.{featureName}.findMany({
    where: or(
      search && search.trim() !== ''
        ? ilike({featureTableName}.field1, `%${search.trim()}%`)
        : undefined,
      filterId ? eq({featureTableName}.filterId, filterId) : undefined,
    ),
    with: {
      relatedTable: true,
      creator: {
        columns: {
          password: false,
        },
      },
    },
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: ({featureName}, { desc, asc }) => {
      if (sortBy === 'field1') {
        return sortOrder === 'asc' ? asc({featureName}.field1) : desc({featureName}.field1);
      } else {
        return sortOrder === 'asc'
          ? asc({featureName}.createdAt)
          : desc({featureName}.createdAt);
      }
    },
  });

  return results;
};

// Update interface with optional fields
interface Update{Feature}Args {
  id: string;
  field1?: string;
  field2?: string;
}

export const update{Feature}ById = async (args: Update{Feature}Args) => {
  const [updated] = await db
    .update({featureTableName})
    .set(args)
    .where(eq({featureTableName}.id, args.id))
    .returning();

  return updated;
};

// Soft delete using status
export const delete{Feature}ById = async ({ id }: { id: string }) => {
  const [deleted] = await db
    .update({featureTableName})
    .set({
      statusId: StatusConfig.DELETED,
    })
    .where(eq({featureTableName}.id, id))
    .returning();

  return deleted;
};

// Restore soft-deleted resource
export const restore{Feature}ById = async ({ id }: { id: string }) => {
  const [restored] = await db
    .update({featureTableName})
    .set({
      statusId: StatusConfig.ACTIVE,
    })
    .where(eq({featureTableName}.id, id))
    .returning();

  return restored;
};

// Hard delete from database
export const hardDelete{Feature}ById = async ({ id }: { id: string }) => {
  const deleted = await db
    .delete({featureTableName})
    .where(eq({featureTableName}.id, id))
    .returning();

  return deleted;
};
```

**Model Design Principles:**
- ✅ Create TypeScript interfaces for all function arguments
- ✅ Use named exports (not default exports)
- ✅ Leverage Drizzle ORM `.returning()` to get created/updated records
- ✅ Load related data with `.with()` clause
- ✅ Exclude sensitive fields (e.g., `password: false`)
- ✅ Support pagination with `page`, `pageSize`, `sortBy`, `sortOrder`
- ✅ Support text search with `ilike()` for case-insensitive matching
- ✅ Use soft deletes with status instead of hard deletes by default
- ✅ Provide both soft and hard delete methods
- ✅ Include restore functionality for soft-deleted records
- ✅ Use `PaginationOptions` type from `@auxilium/types`

---

## Naming Conventions

### Files and Directories

| Type | Pattern | Example |
|------|---------|---------|
| Feature directory | `src/features/{featureName}/` | `src/features/events/` |
| Controller file | `{feature}.controller.ts` | `events.controller.ts` |
| Model file | `{feature}.model.ts` | `events.model.ts` |
| Route file | `{feature}.route.ts` | `events.route.ts` |
| Library/Utils | `{feature}.lib.ts` or `lib/{utility}.ts` | `lib/verification-engine.ts` |
| Tests | `{feature}.spec.ts` | `events.spec.ts` |

### Functions and Variables

| Type | Convention | Example |
|------|-----------|---------|
| Function (PascalCase) | `{action}{Resource}` | `createEvent`, `updateUser` |
| Variable (camelCase) | descriptive name | `eventId`, `userName`, `createdBy` |
| Boolean (camelCase) | `is{Property}` or `{property}` | `isActive`, `attended` |
| Constant | `UPPER_SNAKE_CASE` | `MAX_PAGE_SIZE`, `DEFAULT_SORT_ORDER` |
| Interface | `{PascalCase}Args` or `{PascalCase}Options` | `CreateEventArgs`, `PaginationOptions` |
| Database column | `snake_case` | `user_id`, `created_at` |
| Database table | `singular snake_case` | `user_profile`, `event` |
| Enum table | `singular snake_case` | `event_role`, `event_points_type` |

### API Endpoints

```typescript
// Resource collection (plural)
GET    /api/{features}
POST   /api/{features}

// Specific resource
GET    /api/{features}/:id
PUT    /api/{features}/:id
DELETE /api/{features}/:id

// Special actions (on resource)
POST   /api/{features}/:id/{action}
PUT    /api/{features}/:id/{action}

// Related resources
GET    /api/{features}/{id}/{related}
GET    /api/{features}/{id}/{related}/:relatedId

// Hard delete
DELETE /api/{features}/:id/hard
```

---

## Database Design Guidelines

### Table Structure

Every table should follow this standard structure:

```typescript
export const {featureName} = pgTable('{table_name}', {
  // Primary Key (UUID for entities, integer for reference tables)
  {featureName}Id: uuid('{feature_name}_id').primaryKey().defaultRandom().optional(),
  
  // Core fields (required)
  name: varchar({ length: 100 }).notNull(),
  description: text(),
  
  // Foreign Keys
  createdBy: uuid('created_by').references(() => user.userId, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  
  // Status for soft deletes
  statusId: integer('status_id')
    .notNull()
    .default(StatusConfig.ACTIVE)
    .references(() => status.statusId, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  
  // Timestamps (use helper)
  ...timestamps,
});
```

### Column Helpers

Use `timestamps` helper from `@/db/column.helpers`:

```typescript
// Automatically adds:
// - createdAt: timestamp with timezone
// - updatedAt: timestamp with timezone
...timestamps
```

### Primary Keys

- **UUIDs** for main entities (users, events, reports)
  - `uuid('column_name').primaryKey().defaultRandom()`
- **Integers** for reference/configuration tables (statuses, event types, roles)
  - `integer('column_id').primaryKey().unique()`

### Foreign Keys

```typescript
foreignKeyColumn: uuid('fk_column').references(() => otherTable.id, {
  onDelete: 'cascade',      // Delete dependent records
  onUpdate: 'cascade',      // Update dependent records
  // OR onDelete: 'set null' for optional relationships
}),
```

### PostgreSQL Enums

```typescript
export const eventRole = pgEnum('event_role', [
  'ORGANIZER',
  'HELPER',
  'PARTICIPANT',
]);

// Usage in table
export const eventParticipation = pgTable('event_participation', {
  role: eventRole('role'),
  // ...
});
```

### Status-Based Soft Deletes

Always use `statusId` for soft deletes:

```typescript
statusId: integer('status_id')
  .notNull()
  .default(StatusConfig.ACTIVE)
  .references(() => status.statusId, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
```

**Status Values:** (defined in `@auxilium/configs/status`)
- `ACTIVE` (1) - Default state
- `DELETED` (2) - Soft deleted
- `ARCHIVED` (3) - Archived (optional)

---

## API Design Standards

### Response Format

All API responses follow this standard structure:

```typescript
// Success response
{
  "status": "success",
  "message": "Descriptive message about the operation",
  "data": {
    "resourceName": { /* ... */ },
    // or
    "resources": [ /* ... */ ]
  }
}

// Error response (see Error Handling section)
{
  "status": "error",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

### HTTP Status Codes

| Code | Use Case | Example |
|------|----------|---------|
| `200` | GET success, PUT/PATCH success | Resource retrieved/updated |
| `201` | POST success (resource created) | Event created successfully |
| `204` | No content (delete success) | *Alternative to 200 for DELETE* |
| `400` | Bad request (validation error) | Missing required fields |
| `401` | Unauthorized (no valid auth) | Missing or invalid JWT |
| `403` | Forbidden (no permission) | User lacks required role |
| `404` | Not found | Resource doesn't exist |
| `409` | Conflict (duplicate) | Email already exists |
| `500` | Server error | Unhandled exception |

### Pagination

All list endpoints should support pagination:

```typescript
// Query parameters
GET /api/events?page=1&pageSize=10&sortBy=createdAt&sortOrder=desc&search=term&filterId=5

// Response
{
  "status": "success",
  "message": "Events retrieved successfully",
  "data": {
    "pageCount": 5,
    "events": [ /* ... */ ]
  }
}
```

**Pagination Interface:**
```typescript
interface PaginationOptions {
  page?: number;          // Default: 1
  pageSize?: number;      // Default: 10
  sortBy?: string;        // Resource-specific
  sortOrder?: 'asc' | 'desc'; // Default: 'desc'
  search?: string;        // Optional text search
}
```

---

## Error Handling

### APIError Class

Use the `APIError` from `@auxilium/types/errors`:

```typescript
import { APIError } from '@auxilium/types/errors';

// Throw errors in controllers and models
throw new APIError('Human-readable message', statusCode);

// Examples:
throw new APIError('Missing required fields: name, eventTypeId', 400);
throw new APIError('Event not found', 404);
throw new APIError('Unauthorized; missing user information', 401);
throw new APIError('Insufficient permissions', 403);
```

### Error Middleware

All errors are caught and formatted by middleware:

```typescript
// Automatic error handling via catchAsync wrapper
export const createEvent = catchAsync(async (req, res) => {
  // If you throw an APIError, it's automatically caught
  throw new APIError('Something went wrong', 400);
  // Response is automatically sent with proper format
});
```

### Common Error Patterns

```typescript
// Validation error
if (!required || !fields) {
  throw new APIError('Missing required fields: required, fields', 400);
}

// Authentication error
if (!userId) {
  throw new APIError('Unauthorized; missing user information', 401);
}

// Authorization error
if (!hasPermission) {
  throw new APIError('Insufficient permissions for this action', 403);
}

// Not found error
if (!resource) {
  throw new APIError('Resource not found', 404);
}

// Conflict error
if (alreadyExists) {
  throw new APIError('Resource already exists', 409);
}
```

---

## Type Safety

### TypeScript Configuration

- Strict mode enabled in `tsconfig.json`
- All functions must have explicit return types
- All parameters should be typed

### Function Parameter Typing

```typescript
// ❌ Avoid using `any`
export const createEvent = async (args: any) => {}

// ✅ Use interfaces
interface CreateEventArgs {
  name: string;
  eventTypeId: number;
  description: string;
  createdBy: string;
}

export const createEvent = async (args: CreateEventArgs) => {}
```

### Return Types

```typescript
// ❌ Implicit return type
export const getEvent = async (id: string) => {
  return await db.query.event.findFirst({ where: eq(...) });
};

// ✅ Explicit return type
export const getEvent = async (id: string): Promise<Event | undefined> => {
  return await db.query.event.findFirst({ where: eq(...) });
};
```

### Generic Types with Constraints

```typescript
// Type-safe pagination results
interface PaginationResult<T> {
  pageCount: number;
  items: T[];
}

interface ParticipationResult {
  pageCount: number;
  participations: EventParticipation[];
}
```

---

## Code Organization

### Feature Directory Structure

```
src/features/{featureName}/
├── {feature}.controller.ts      # HTTP handlers
├── {feature}.model.ts           # Database operations
├── {feature}.route.ts           # Route definitions
├── {feature}.spec.ts            # Tests
└── lib/
    ├── verification-engine.ts   # Complex business logic
    ├── calculation.ts           # Specific to this feature
    └── integrations.ts          # External API calls
```

### Import Organization

Follow this import order:

```typescript
// 1. External packages
import type { Request, Response } from 'express';
import { catchAsync } from '@/lib/catch-async';

// 2. Internal models/types
import * as EventModel from './events.model';
import { APIError } from '@auxilium/types/errors';

// 3. Local utilities
import { someHelper } from './lib/helper';
```

### File Size Guidelines

- **Controllers:** 150-300 lines per file
- **Models:** 200-400 lines per file
- **Routes:** 50-100 lines per file
- If exceeding limits, split by functionality

---

## Response Format Standards

### Create Operation

```typescript
export const createEvent = catchAsync(async (req, res) => {
  // ... validation ...
  const newEvent = await EventModel.createEvent(args);

  res.status(201).json({
    status: 'success',
    message: 'Event created successfully',
    data: {
      event: newEvent,
    },
  });
});
```

### Read Single Resource

```typescript
export const getEventById = catchAsync(async (req, res) => {
  const event = await EventModel.getEventById({ eventId });

  if (!event) {
    throw new APIError('Event not found', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'Event retrieved successfully',
    data: event,  // or {event: event}
  });
});
```

### Read Multiple Resources (Paginated)

```typescript
export const getAllEvents = catchAsync(async (req, res) => {
  const results = await EventModel.getAllEvents(args);

  res.status(200).json({
    status: 'success',
    message: 'Events retrieved successfully',
    data: results,  // {pageCount, events}
  });
});
```

### Update Operation

```typescript
export const updateEvent = catchAsync(async (req, res) => {
  await EventModel.updateEventById(args);

  res.status(200).json({
    status: 'success',
    message: 'Event updated successfully',
  });
});
```

### Delete Operation

```typescript
export const deleteEvent = catchAsync(async (req, res) => {
  await EventModel.deleteEventById({ eventId });

  res.status(200).json({
    status: 'success',
    message: 'Event deleted successfully',
  });
});
```

---

## Middleware & Authentication

### Route Protection

```typescript
import { verifyIsRole, verifyJWT } from '@/middleware/auth.middleware';
import { Roles } from '@auxilium/configs/roles';

const EventsRouter = express.Router();

// Apply to all routes
EventsRouter.use(verifyJWT);
EventsRouter.use(verifyIsRole([Roles.ADMIN, Roles.SUPERADMIN]));

// OR apply to specific routes
EventsRouter.get('/', verifyJWT, verifyIsRole([Roles.USER]), EventsController.getAll);
```

### Available Roles

```typescript
// From @auxilium/configs/roles
enum Roles {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}
```

### Accessing Authenticated User

```typescript
export const createEvent = catchAsync(async (req, res) => {
  const userId = res.locals.user.userId;  // Set by verifyJWT middleware
  const user = res.locals.user;           // Full user object

  if (!userId) {
    throw new APIError('Unauthorized; missing user information', 401);
  }

  // Use userId in operations...
});
```

---

## Testing & Validation

### Input Validation in Controllers

```typescript
export const createEvent = catchAsync(async (req, res) => {
  let {
    name,
    eventTypeId,
    description,
    startDate,
    endDate,
  } = req.body;

  // Validate required fields
  if (!name || !eventTypeId || !description) {
    throw new APIError(
      'Missing required fields: name, eventTypeId, description',
      400,
    );
  }

  // Validate authenticated user
  const createdBy = res.locals.user.userId;
  if (!createdBy) {
    throw new APIError('Unauthorized; missing user information', 401);
  }

  // Type conversions for optional fields
  const newEvent = await EventModel.createEvent({
    name,
    eventTypeId,
    description,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    createdBy,
  });
});
```

### TODO Comments for Future Work

```typescript
// TODO: Implement pagination to this
export const getAllEvents = catchAsync(async (req, res) => {
  // ...
});

// TODO: add explicit types here to translate from raw sheet data
const verificationResult = await verifyParticipants({...});

// TODO: This should be exporting to excel instead
await insertIntoSheet({...});
```

---

## Code Quality Tools

### Biome Configuration

The project uses **Biome** for formatting and linting:

```bash
# Format code
npm run biome:format

# Check and fix issues
npm run biome:check --write
npm run biome:fix

# Lint code
npm run biome:lint

# CI check (non-fixing)
npm run biome:ci
```

**Always run Biome before committing:**
```bash
npm run biome:check --write
npm run biome:format
```

---

## Common Patterns & Examples

### Soft Delete Pattern

```typescript
// Model layer - soft delete
export const deleteEventById = async ({ eventId }: { eventId: string }) => {
  const [deletedEvent] = await db
    .update(eventTable)
    .set({
      statusId: StatusConfig.DELETED,
    })
    .where(eq(eventTable.eventId, eventId))
    .returning();

  return deletedEvent;
};

// Model layer - hard delete alternative
export const hardDeleteEventById = async ({ eventId }: { eventId: string }) => {
  const deletedEvent = await db
    .delete(eventTable)
    .where(eq(eventTable.eventId, eventId))
    .returning();

  return deletedEvent;
};

// Controller layer
export const deleteEvent = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  await EventModel.deleteEventById({ eventId: eventId as string });

  res.status(200).json({
    status: 'success',
    message: 'Event deleted successfully',
  });
});
```

### Pagination with Search & Filter

```typescript
// Model layer
interface GetPaginatedEventsArgs extends PaginationOptions {
  sortBy?: 'name' | 'startDate' | 'createdAt';
  eventTypeId?: number;
  statusId?: number;
}

export const getAllEvents = async ({
  page = 1,
  pageSize = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  search,
  eventTypeId,
  statusId = StatusConfig.ACTIVE,
}: GetPaginatedEventsArgs) => {
  return await db.query.event.findMany({
    where: or(
      search && search.trim() !== ''
        ? ilike(eventTable.name, `%${search.trim()}%`)
        : undefined,
      eventTypeId ? eq(eventTable.eventTypeId, eventTypeId) : undefined,
      statusId ? eq(eventTable.statusId, statusId) : undefined,
    ),
    // ... with, limit, offset, orderBy ...
  });
};

// Controller layer
export const getAllEvents = catchAsync(async (req, res) => {
  const { page, pageSize, sortBy, sortOrder, search, eventTypeId, statusId } =
    req.query;

  const events = await EventModel.getAllEvents({
    page: Number(page),
    pageSize: Number(pageSize),
    sortBy: (sortBy as 'name' | 'startDate' | 'createdAt') || 'createdAt',
    sortOrder: sortOrder as 'asc' | 'desc',
    search: search as string,
    eventTypeId: eventTypeId ? Number(eventTypeId) : undefined,
    statusId: statusId ? Number(statusId) : undefined,
  });

  res.status(200).json({
    status: 'success',
    message: 'Events retrieved successfully',
    data: events,
  });
});
```

### Complex Business Logic in Library

```typescript
// lib/verification-engine.ts
export interface VerificationResult {
  participants: ParticipantData[];
  summary: {
    total: number;
    attended: number;
    notAttended: number;
  };
}

export const verifyParticipants = async (args: {
  eventId: string;
  userId: string;
  signupUrl: string;
  feedbackUrl: string;
  helpersUrl: string;
}): Promise<VerificationResult> => {
  // Complex verification logic
  // Fetch from sheets, cross-reference, calculate points
  return {
    participants: processedData,
    summary: calculateSummary(processedData),
  };
};
```

---

## Summary Checklist

When implementing a new feature, ensure:

- ✅ Create three files: `.controller.ts`, `.model.ts`, `.route.ts`
- ✅ Follow naming conventions exactly
- ✅ Use `catchAsync` wrapper for all controller methods
- ✅ Validate all inputs in controller
- ✅ Use `APIError` for all errors
- ✅ Return standardized response format
- ✅ Use correct HTTP status codes
- ✅ Implement pagination for list endpoints
- ✅ Create TypeScript interfaces for function arguments
- ✅ Use Drizzle ORM with `.returning()` for mutations
- ✅ Implement soft deletes via status
- ✅ Exclude sensitive fields from responses
- ✅ Add route comments explaining endpoints
- ✅ Use role-based access control
- ✅ Run Biome formatter before committing
- ✅ Include TODO comments for incomplete work

---

## References

- **Express.js:** https://expressjs.com/
- **Drizzle ORM:** https://orm.drizzle.team/
- **TypeScript:** https://www.typescriptlang.org/
- **Biome:** https://biomejs.dev/
- **Shared Configs:** `/packages/configs/`
- **Shared Types:** `/packages/types/`
