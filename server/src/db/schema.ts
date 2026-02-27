import { uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './column.helpers';
import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { Roles } from '@auxilium/configs/roles';
import { primaryKey } from 'drizzle-orm/pg-core';
import { date } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  userId: uuid('user_id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => userProfile.profileId, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 100 }).notNull(),
  ...timestamps,
});

export const role = pgTable('role', {
  roleId: integer('role_id').primaryKey(),
  name: varchar({ length: 50 }).notNull().unique(),
  ...timestamps,
});

export const userRole = pgTable(
  'user_role',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => user.userId, {
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
    ...timestamps,
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.roleId],
    }),
  ],
);

export const userProfile = pgTable('user_profile', {
  profileId: uuid('profile_id').primaryKey().defaultRandom(),
  firstName: varchar({ length: 100 }).notNull(),
  lastName: varchar({ length: 100 }).notNull(),
  gender: varchar({ length: 20 }),
  dob: date(),
  ...timestamps,
});
