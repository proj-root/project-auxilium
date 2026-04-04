# Architecture & Feature Implementation Flow

## Three-Layer Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (React/Vite)                         │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP Requests
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER                                │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   ROUTE LAYER                              │  │
│  │  - Define endpoints                                        │  │
│  │  - Mount middleware (JWT, roles)                           │  │
│  │  - Delegate to controller                                  │  │
│  │                                                             │  │
│  │  POST   /api/events          -> controller.createEvent     │  │
│  │  GET    /api/events          -> controller.getAllEvents    │  │
│  │  GET    /api/events/:id      -> controller.getEventById    │  │
│  │  PUT    /api/events/:id      -> controller.updateEvent     │  │
│  │  DELETE /api/events/:id      -> controller.deleteEvent     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                               │                                   │
│                               ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                CONTROLLER LAYER                            │  │
│  │  - Validate input                                          │  │
│  │  - Extract authentication info                            │  │
│  │  - Call model layer                                        │  │
│  │  - Format response                                         │  │
│  │  - Handle errors (via catchAsync)                          │  │
│  │                                                             │  │
│  │  createEvent() {                                           │  │
│  │    - Extract & validate req.body                          │  │
│  │    - Get userId from res.locals.user                      │  │
│  │    - Call EventModel.createEvent()                        │  │
│  │    - Return 201 with formatted response                   │  │
│  │  }                                                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                               │                                   │
│                               ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  MODEL LAYER                               │  │
│  │  - Database queries (Drizzle ORM)                          │  │
│  │  - Business logic                                          │  │
│  │  - Data transformation                                     │  │
│  │  - Relationships & eager loading                           │  │
│  │                                                             │  │
│  │  createEvent(args) {                                       │  │
│  │    - db.insert(eventTable).values(args).returning()      │  │
│  │    - Return created record                                │  │
│  │  }                                                          │  │
│  │                                                             │  │
│  │  getAllEvents(filters) {                                   │  │
│  │    - Apply pagination, search, filtering                  │  │
│  │    - Load related data                                     │  │
│  │    - Return sorted list                                    │  │
│  │  }                                                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                               │                                   │
│        ┌──────────────────────┼──────────────────────┐            │
│        │                      │                      │            │
│        ▼                      ▼                      ▼            │
│  ┌─────────────────┐   ┌─────────────────┐   ┌──────────────┐   │
│  │ lib/ (Complex   │   │ Error Handling  │   │ TypeScript   │   │
│  │  Business       │   │ (catchAsync,    │   │ Types &      │   │
│  │  Logic)         │   │  APIError)      │   │ Interfaces   │   │
│  │                 │   │                 │   │              │   │
│  │ verification-   │   │ Error thrown in │   │ CreateEvent  │   │
│  │ engine.ts       │   │ model/controller│   │ Args         │   │
│  │                 │   │ caught by       │   │              │   │
│  │ calculations.ts │   │ catchAsync and  │   │ Pagination   │   │
│  │                 │   │ formatted as    │   │ Options      │   │
│  │ integrations.ts │   │ APIError        │   │              │   │
│  └─────────────────┘   └─────────────────┘   └──────────────┘   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│         POSTGRESQL DATABASE                                      │
│                                                                   │
│  Tables with standard schema:                                    │
│  - event (eventId, name, description, ..., statusId, timestamps) │
│  - user_profile (profileId, firstName, lastName, ...)            │
│  - event_participation (participationId, profileId, attended, ...)│
│  - status (statusId, name) - Reference: ACTIVE, DELETED         │
│  - event_type (eventTypeId, name) - Reference                   │
│                                                                   │
│  All tables include: createdAt, updatedAt timestamps             │
│  All main entities use UUID primary keys                         │
│  Soft deletes via statusId (not actual deletion)                 │
└──────────────────────────────────────────────────────────────────┘
```

## Feature Implementation Workflow

```
1. CREATE ROUTE FILE ({feature}.route.ts)
   │
   ├─ Import controller, middleware
   ├─ Create router instance
   ├─ Mount verifyJWT middleware
   ├─ Mount verifyIsRole middleware
   ├─ Define endpoints with comments
   └─ Export router

2. CREATE CONTROLLER FILE ({feature}.controller.ts)
   │
   └─ For each endpoint:
      ├─ Use catchAsync wrapper
      ├─ Extract & validate input (req.body, req.params, req.query)
      ├─ Verify authentication (res.locals.user)
      ├─ Call model layer
      ├─ Format response (status, message, data)
      ├─ Use correct HTTP status (201 for POST, 200 for others)
      └─ Handle errors via APIError

3. CREATE MODEL FILE ({feature}.model.ts)
   │
   ├─ Define TypeScript interfaces for arguments
   │   ├─ CreateEventArgs
   │   ├─ UpdateEventArgs
   │   └─ GetPaginatedEventsArgs
   │
   └─ For each operation:
      ├─ Use db.insert/update/delete/query
      ├─ Include .returning() for mutations
      ├─ Load relations with .with()
      ├─ Exclude sensitive fields
      ├─ Support pagination & filtering
      └─ Implement soft deletes (statusId)

4. CREATE LIBRARY/HELPERS (lib/{utility}.ts)
   │
   └─ Complex business logic (if needed)
      ├─ Verification engines
      ├─ Calculations
      └─ External API integrations

5. QUALITY ASSURANCE
   │
   ├─ Run Biome formatter: `npm run biome:check --write`
   ├─ Run Biome formatter: `npm run biome:format`
   └─ Verify all error cases throw APIError
```

## Data Flow Example: Create Event

```
CLIENT SIDE:
POST /api/events
{
  "name": "Summer Workshop",
  "eventTypeId": 1,
  "description": "...",
  "startDate": "2026-06-01",
  "endDate": "2026-06-30"
}
Header: Authorization: Bearer JWT_TOKEN

│
▼

ROUTE LAYER (events.route.ts):
1. verifyJWT middleware validates JWT → extracts userId → sets res.locals.user
2. verifyIsRole([ADMIN, SUPERADMIN]) checks user role
3. Passes to controller.createEvent()

│
▼

CONTROLLER LAYER (events.controller.ts):
1. Extract fields from req.body
2. Validate: !name || !eventTypeId || !description → throw APIError(400)
3. Extract userId from res.locals.user.userId
4. Validate authenticated: !userId → throw APIError(401)
5. Call EventModel.createEvent({name, eventTypeId, description, startDate, endDate, createdBy: userId})

│
▼

MODEL LAYER (events.model.ts):
1. Type-check arguments against CreateEventArgs interface
2. Execute: db.insert(eventTable).values({...}).returning()
3. Get created event record from database
4. Return event object

│
▼

CONTROLLER LAYER (response):
1. Receive created event from model
2. Format response:
   {
     "status": "success",
     "message": "Event created successfully",
     "data": { "event": {...} }
   }
3. res.status(201).json(response)

│
▼

CLIENT SIDE:
Receives 201 with event details
```

## Database Schema Pattern

```typescript
export const event = pgTable('event', {
  // Primary Key (UUID for entities)
  eventId: uuid('event_id').primaryKey().defaultRandom(),

  // Core Fields
  name: varchar({ length: 100 }).notNull(),
  eventTypeId: integer('event_type_id')
    .notNull()
    .references(() => eventType.eventTypeId, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
  description: text(),
  startDate: timestamp('start_date', { withTimezone: true, mode: 'date' }),
  endDate: timestamp('end_date', { withTimezone: true, mode: 'date' }),
  platform: varchar({ length: 20 }),

  // URLs/External References
  signupUrl: varchar('signup_url', { length: 255 }),
  feedbackUrl: varchar('feedback_url', { length: 255 }),
  helpersUrl: varchar('helpers_url', { length: 255 }),

  // Audit Fields
  createdBy: uuid('created_by').references(() => user.userId, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),

  // Soft Delete
  statusId: integer('status_id')
    .notNull()
    .default(StatusConfig.ACTIVE)
    .references(() => status.statusId, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),

  // Timestamps (from helper)
  ...timestamps,  // createdAt, updatedAt
});
```

## Middleware Stack Order

```
Request
  │
  ▼
Global Middleware (app.ts)
  ├─ cookieParser()
  ├─ cors()
  ├─ morgan() - logging
  ├─ express.json()
  └─ express.urlencoded()

  │
  ▼
Feature Router (events.route.ts)
  ├─ verifyJWT - Validates token, sets res.locals.user
  ├─ verifyIsRole([Roles.ADMIN]) - Checks user role
  └─ Route Handler (controller)

  │
  ▼
ERROR MIDDLEWARE
  ├─ APIError instances formatted with { status, message, statusCode }
  └─ Uncaught errors caught by catchAsync wrapper

Response
```

## Pagination Response Pattern

```typescript
// Request
GET /api/events?page=2&pageSize=5&sortBy=createdAt&sortOrder=desc&search=workshop

// Response
{
  "status": "success",
  "message": "Events retrieved successfully",
  "data": {
    "pageCount": 10,          // Total pages: ceil(total / pageSize)
    "events": [
      {
        "eventId": "uuid-1",
        "name": "Workshop 1",
        ...
      },
      ...5 items...
    ]
  }
}
```

## Error Response Pattern

```typescript
// Success Response
{
  "status": "success",
  "message": "Event created successfully",
  "data": { "event": {...} }
}

// Error Response (from APIError)
HTTP 400
{
  "status": "error",
  "message": "Missing required fields: name, eventTypeId",
  "statusCode": 400
}

// Error Response (Unauthorized)
HTTP 401
{
  "status": "error",
  "message": "Unauthorized; missing user information",
  "statusCode": 401
}
```
