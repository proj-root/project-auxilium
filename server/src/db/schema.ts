import { index, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './column.helpers';
import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { RolesConfig } from '@auxilium/configs/roles';
import { primaryKey } from 'drizzle-orm/pg-core';
import { StatusConfig } from '@auxilium/configs/status';
import { pgEnum } from 'drizzle-orm/pg-core';
import { text } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { boolean } from 'drizzle-orm/pg-core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { EventRoles } from '@/config/system.config';

// export const eventRole = pgEnum('event_role', [
//   'ORGANIZER',
//   'HELPER',
//   'PARTICIPANT',
// ]);

export const eventPointsType = pgEnum('event_points_type', [
  'LEADERSHIP',
  'PARTICIPATION',
  'SERVICE',
  'COMMUNITY SERVICE',
]);

// Status Table
export const status = pgTable('status', {
  statusId: integer('status_id').primaryKey().unique(),
  name: varchar({ length: 50 }).notNull().unique(),
});

// Course Table
export const course = pgTable('course', {
  code: varchar({ length: 10 }).primaryKey().unique(),
  name: varchar({ length: 100 }).notNull(),
  ...timestamps,
});

// Event Type Table
export const eventType = pgTable('event_type', {
  eventTypeId: integer('event_type_id').primaryKey().unique(),
  name: varchar({ length: 100 }).notNull().unique(),
});

export const eventRole = pgTable('event_role', {
  eventRoleId: integer('event_role_id').primaryKey().unique(),
  name: varchar('name', { length: 20 }).unique(),
  pointsType: eventPointsType('points_type').notNull(),
  pointsAwarded: integer('points_awarded').notNull(),
});

export const user = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  ...timestamps,
});

export const userProfile = pgTable('user_profile', {
  profileId: uuid('profile_id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .unique()
    .references((): AnyPgColumn => user.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
  firstName: varchar({ length: 100 }).notNull(),
  lastName: varchar({ length: 100 }).notNull(),
  course: varchar({ length: 10 }).references(() => course.code, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  ichat: varchar({ length: 100 }).notNull().unique(),
  studentClass: varchar('student_class', { length: 20 }).notNull(),
  adminNumber: varchar('admin_number', { length: 7 }).notNull().unique(),
  ...timestamps,
});

// Event Table
export const event = pgTable('event', {
  eventId: uuid('event_id').primaryKey().defaultRandom().unique(),
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
  signupUrl: varchar('signup_url', { length: 255 }),
  feedbackUrl: varchar('feedback_url', { length: 255 }),
  helpersUrl: varchar('helpers_url', { length: 255 }),
  createdBy: uuid('created_by').references(() => user.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  statusId: integer('status_id')
    .notNull()
    .default(StatusConfig.ACTIVE)
    .references(() => status.statusId, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  ...timestamps,
});

// Event Participation Table
export const eventParticipation = pgTable('event_participation', {
  participationId: uuid('participation_id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => userProfile.profileId, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  eventReportId: uuid('event_report_id')
    .notNull()
    .references(() => eventReport.eventReportId, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  attended: boolean().default(false),
  eventRoleId: integer('event_role_id')
    .references(() => eventRole.eventRoleId, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    })
    .default(EventRoles.PARTICIPANT),
  ...timestamps,
});

// Event Helper Table
export const userEventRole = pgTable('user_event_role', {
  userEventRoleId: uuid('user_event_role_id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => event.eventId, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  eventRoleId: integer('event_role_id')
    .notNull()
    .references(() => eventRole.eventRoleId, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
  ...timestamps,
});

// Event Points Report Table
export const eventReport = pgTable('event_report', {
  eventReportId: uuid('event_report_id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .unique()
    .notNull()
    .references(() => event.eventId, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  signupCount: integer('signup_count'),
  feedbackCount: integer('feedback_count'),
  createdBy: uuid('created_by').references(() => user.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  ...timestamps,
});

export const session = pgTable(
  'session',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (table) => [index('session_userId_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    ...timestamps,
  },
  (table) => [index('account_userId_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    ...timestamps,
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

export const role = pgTable('role', {
  roleId: integer('role_id').primaryKey().unique(),
  name: varchar({ length: 50 }).notNull().unique(),
  ...timestamps,
});

export const userRole = pgTable(
  'user_role',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    roleId: integer('role_id')
      .notNull()
      .default(RolesConfig.USER)
      .references(() => role.roleId, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.roleId],
    }),
  ],
);

export const department = pgTable('department', {
  departmentId: integer('department_id').primaryKey().unique(),
  name: varchar({ length: 50 }).notNull().unique(),
  ...timestamps,
});

export const userDepartment = pgTable(
  'user_department',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    departmentId: integer('department_id')
      .notNull()
      .references(() => department.departmentId, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    ...timestamps,
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.departmentId],
    }),
  ],
);
