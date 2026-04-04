# New Feature Implementation Checklist

Use this checklist when implementing a new feature to ensure compliance with Project Auxilium coding conventions.

---

## Pre-Implementation

- [ ] Understand the feature requirements
- [ ] Identify database entities/tables needed
- [ ] Review existing similar features for patterns
- [ ] Plan API endpoints (REST conventions)
- [ ] Check shared types: `@auxilium/types`, `@auxilium/configs`

---

## Database Schema

- [ ] Create table in `server/src/db/schema.ts`
- [ ] Use UUID for entity primary keys: `uuid('column').primaryKey().defaultRandom()`
- [ ] Use integers for reference tables: `integer('column').primaryKey().unique()`
- [ ] Add `...timestamps` (createdAt, updatedAt) helper
- [ ] Add `statusId` field for soft deletes (reference status table)
- [ ] Include `createdBy` field when relevant
- [ ] Configure foreign keys with `onDelete`/`onUpdate` cascade rules
- [ ] Use PostgreSQL `pgEnum` for fixed value sets
- [ ] Update relationships in `server/src/db/relations.ts` if needed
- [ ] Add column names in snake_case format

---

## Route File: `{feature}.route.ts`

- [ ] File path: `server/src/features/{feature}/{feature}.route.ts`
- [ ] Import Express, controller, middleware
- [ ] Import `verifyJWT` and `verifyIsRole` from auth middleware
- [ ] Import `Roles` from `@auxilium/configs/roles`
- [ ] Create router: `const {Feature}Router = express.Router()`
- [ ] Mount `verifyJWT` globally to router
- [ ] Mount `verifyIsRole` with appropriate roles
- [ ] Define all endpoints with comments separating groups
- [ ] Use RESTful naming: `/resource`, `/resource/:id`, `/resource/:id/{action}`
- [ ] Export router as default export

**Endpoint Structure:**
```
// POST - Create
POST /api/{resources}

// GET - List all
GET /api/{resources}

// GET - Retrieve one
GET /api/{resources}/:id

// PUT - Update
PUT /api/{resources}/:id

// DELETE - Soft delete
DELETE /api/{resources}/:id

// DELETE - Hard delete (if needed)
DELETE /api/{resources}/:id/hard

// Special actions
POST /api/{resources}/:id/{action}
```

---

## Controller File: `{feature}.controller.ts`

### File Structure
- [ ] File path: `server/src/features/{feature}/{feature}.controller.ts`
- [ ] Imports: Express types, catchAsync, model, APIError
- [ ] All functions exported as named exports (not default)
- [ ] Follow naming: `create{Feature}`, `getAll{Features}`, `get{Feature}ById`, `update{Feature}`, `delete{Feature}`

### For Each Endpoint Function
- [ ] Wrap with `catchAsync()` for automatic error handling
- [ ] Extract input from `req.body`, `req.params`, `req.query`
- [ ] Type cast params: `param as string` or convert: `Number(pageSize)`
- [ ] Validate required fields:
  ```typescript
  if (!required || !fields) {
    throw new APIError('Missing required fields: required, fields', 400);
  }
  ```
- [ ] Extract authenticated user:
  ```typescript
  const userId = res.locals.user.userId;
  if (!userId) {
    throw new APIError('Unauthorized; missing user information', 401);
  }
  ```
- [ ] Call model layer with typed arguments
- [ ] Handle "not found" cases:
  ```typescript
  if (!resource) {
    throw new APIError('{Feature} not found', 404);
  }
  ```
- [ ] Return standardized response:
  - Status 201 for POST (create)
  - Status 200 for GET, PUT, DELETE
  - Response format: `{status: 'success', message: '...', data: {...}}`

### Response Examples

**Create (POST):**
```typescript
res.status(201).json({
  status: 'success',
  message: 'Event created successfully',
  data: { event: result },
});
```

**Read Single (GET):**
```typescript
res.status(200).json({
  status: 'success',
  message: 'Event retrieved successfully',
  data: result,
});
```

**Read Multiple (GET):**
```typescript
res.status(200).json({
  status: 'success',
  message: 'Events retrieved successfully',
  data: results, // {pageCount, events}
});
```

**Update (PUT):**
```typescript
res.status(200).json({
  status: 'success',
  message: 'Event updated successfully',
});
```

**Delete (DELETE):**
```typescript
res.status(200).json({
  status: 'success',
  message: 'Event deleted successfully',
});
```

---

## Model File: `{feature}.model.ts`

### File Structure
- [ ] File path: `server/src/features/{feature}/{feature}.model.ts`
- [ ] Imports: db, schema tables, configs, types, errors, Drizzle operators
- [ ] All functions exported as named exports (not default)
- [ ] Define TypeScript interfaces for ALL function arguments

### Interface Definitions
- [ ] `Create{Feature}Args` with required & optional fields
- [ ] `Update{Feature}Args` with optional fields (all fields optional except ID)
- [ ] `Get{Features}Args` extends `PaginationOptions` if list endpoint
  ```typescript
  interface Create{Feature}Args {
    field1: string;
    field2: number;
    optionalField?: string;
    createdBy: string;
  }
  
  interface Update{Feature}Args {
    id: string;
    field1?: string;
    field2?: number;
  }
  ```

### Create Operation
- [ ] Use `db.insert(table).values(args).returning()`
- [ ] Return first element: `return [created] = db.insert(...).returning()`
- [ ] Throw APIError if creation fails

### Read Single Operation
- [ ] Use `db.query.{table}.findFirst()`
- [ ] Include `with: {...}` for related data
- [ ] Exclude sensitive fields: `{ columns: {password: false} }`
- [ ] Return `event | undefined`

### Read Multiple Operation
- [ ] Extend `PaginationOptions`
- [ ] Use `db.query.{table}.findMany()`
- [ ] Apply filters with `where: or(...)` if needed
- [ ] Support text search with `ilike()`
- [ ] Apply sorting with `orderBy`
- [ ] Apply pagination with `limit` and `offset`
- [ ] Load relations with `with: {...}`
- [ ] Return array of results (if pagination needed, return `{pageCount, items}`)

### Update Operation
- [ ] Use `db.update(table).set(args).where(...).returning()`
- [ ] Return updated record: `return [updated] = db.update(...)`

### Delete Operations
- [ ] **Soft delete**: Update `statusId` to `StatusConfig.DELETED`
  ```typescript
  export const delete{Feature}ById = async ({id}: {id: string}) => {
    const [deleted] = await db
      .update(table)
      .set({ statusId: StatusConfig.DELETED })
      .where(eq(table.id, id))
      .returning();
    return deleted;
  };
  ```
- [ ] **Hard delete**: Use `db.delete(table).where(...).returning()`
- [ ] **Restore**: Set `statusId` back to `StatusConfig.ACTIVE`

### Pagination Support
- [ ] Accept `page`, `pageSize`, `sortBy`, `sortOrder`, `search` parameters
- [ ] Default values: `page=1`, `pageSize=10`, `sortOrder='desc'`
- [ ] Use `ilike()` for search: `ilike(table.field, `%${search.trim()}%`)`
- [ ] Return `{pageCount: Math.ceil(count/pageSize), items: [...]}`

---

## Library/Helpers: `lib/{utility}.ts` (If Needed)

- [ ] File path: `server/src/features/{feature}/lib/{utility}.ts`
- [ ] Export named functions (not default)
- [ ] Complex business logic separated from model layer
- [ ] Clear interfaces for arguments and return types
- [ ] Handle errors explicitly or let them propagate to controller

**When to create:**
- External API integrations
- Complex calculations
- Verification logic
- Data transformations
- Service abstractions

---

## Code Quality

- [ ] Apply consistent naming conventions throughout
- [ ] Use TypeScript strict mode (no `any` types)
- [ ] All functions have explicit return types
- [ ] All parameters are typed
- [ ] Comments placed above endpoint groups in routes
- [ ] Include TODO comments for incomplete work
- [ ] Run Biome formatter: `npm run biome:check --write`
- [ ] Run Biome format: `npm run biome:format`
- [ ] No console.log() statements (use logger)
- [ ] No magic numbers/strings (use constants)

---

## Testing

- [ ] Test create with valid data → 201 response
- [ ] Test create with missing fields → 400 error
- [ ] Test create without auth → 401 error
- [ ] Test create with wrong role → 403 error
- [ ] Test get by id with valid id → 200 success
- [ ] Test get by id with invalid id → 404 not found
- [ ] Test get all with pagination
- [ ] Test search filtering
- [ ] Test sorting (asc/desc)
- [ ] Test update with valid data → 200 success
- [ ] Test update with invalid id → 404 not found
- [ ] Test soft delete → statusId changed, data still in DB
- [ ] Test hard delete (if implemented) → data removed from DB
- [ ] Test restore soft-deleted record

---

## Integration with Routes

- [ ] Register router in `server/src/app.ts`
- [ ] Use path like: `app.use('/api/events', EventsRouter)`
- [ ] Verify route path doesn't conflict with others
- [ ] Test full endpoint paths work correctly

---

## Documentation

- [ ] Add inline comments explaining complex logic
- [ ] Endpoint group comments in routes file
- [ ] Update API documentation (if maintained separately)
- [ ] Update feature reference (if maintained separately)

---

## Final Checklist Before Commit

- [ ] All TypeScript types are explicit (no `any`)
- [ ] All functions have explicit return types
- [ ] All APIErrors have appropriate status codes
- [ ] Biome check passes: `npm run biome:ci`
- [ ] All tests pass (if test suite exists)
- [ ] No console.log() in production code
- [ ] No sensitive data in responses
- [ ] Database migrations applied (if schema changed)
- [ ] Environment variables documented (if added)
- [ ] Feature works as expected manually tested

---

## Example: Full Feature Implementation

Reference the `events` feature for a complete example:
- Route: `server/src/features/events/events.route.ts`
- Controller: `server/src/features/events/events.controller.ts`
- Model: `server/src/features/events/events.model.ts`
- Library: `server/src/features/events/lib/verification-engine.ts`
- Schema: `server/src/db/schema.ts` (search for `eventTable`, `eventParticipation`)

---

## Quick Reference: HTTP Status Codes

| Code | Scenario | When |
|------|----------|------|
| 201 | Resource created | POST successful |
| 200 | Success | GET, PUT, DELETE successful |
| 400 | Bad request | Validation error, missing fields |
| 401 | Unauthorized | No JWT or invalid JWT |
| 403 | Forbidden | User lacks required role |
| 404 | Not found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 500 | Server error | Unhandled exception |

---

## Quick Reference: APIError Usage

```typescript
// Missing fields validation
throw new APIError('Missing required fields: name, eventTypeId', 400);

// Authentication error
throw new APIError('Unauthorized; missing user information', 401);

// Authorization error
throw new APIError('Insufficient permissions for this action', 403);

// Not found
throw new APIError('Event not found', 404);

// Conflict/duplicate
throw new APIError('Event with this name already exists', 409);
```

---

## Quick Reference: Response Format

```typescript
// Success
{
  "status": "success",
  "message": "Descriptive message",
  "data": {
    "event": {...} // or "events": [...]
  }
}

// Error (handled by middleware)
{
  "status": "error",
  "message": "Human-readable error",
  "statusCode": 400
}
```
