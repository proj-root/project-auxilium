import { uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './column.helpers';
import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { Roles } from '@auxilium/configs/roles';
import { primaryKey } from 'drizzle-orm/pg-core';
import { StatusConfig } from '@auxilium/configs/status';
import { pgEnum } from 'drizzle-orm/pg-core';
import { text } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { boolean } from 'drizzle-orm/pg-core';

export const eventRole = pgEnum('event_role', [
  'ORGANIZER',
  'HELPER',
  'PARTICIPANT',
]);

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

// User Profile Table - linked to Better Auth user via userId
export const userProfile = pgTable('user_profile', {
  profileId: uuid('profile_id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => user.id, {
      onDelete: 'cascade',
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
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
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
  createdBy: uuid('created_by').references(() => user.userId, {
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
  eventRole: eventRole('event_role').default('PARTICIPANT'),
  pointsType: eventPointsType('points_type').default('PARTICIPATION'),
  pointsAwarded: integer('points_awarded').default(0),
  ...timestamps,
});

// Event Points Report Table
export const eventReport = pgTable('event_report', {
  eventReportId: uuid('event_report_id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => event.eventId, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  signupCount: integer('signup_count'),
  feedbackCount: integer('feedback_count'),
  createdBy: uuid('created_by').references(() => user.userId, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  ...timestamps,
});

export const user = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  name: varchar({ length: 255 }),
  image: varchar({ length: 255 }),
  profileId: uuid('profile_id').references(() => userProfile.profileId, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  statusId: integer('status_id')
    .default(StatusConfig.ACTIVE)
    .references(() => status.statusId, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Better Auth account table (OAuth linking)
export const account = pgTable('account', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  provider: varchar({ length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  name: varchar({ length: 255 }),
  email: varchar({ length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Better Auth session table with device tracking
export const session = pgTable('session', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  deviceFingerprint: varchar('device_fingerprint', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

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
      .default(Roles.USER)
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
