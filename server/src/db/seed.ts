import 'dotenv/config';
import db from '@/db';
import bcrypt from 'bcrypt';
import * as schema from './schema';
import {
  testCourses,
  testEventTypes,
  testRoles,
  testStatuses,
  testUsers,
} from './test-data';
import { AuthConfig } from '@/config/auth.config';
import { reset, seed } from 'drizzle-seed';

async function main() {
  console.log('🌱 Initiating database seeding protocol...');

  // Get CLI arguments
  const args = process.argv.slice(2);
  const shouldReset = args.includes('--reset');

  if (shouldReset) {
    console.log('⚠️  Reset flag detected. Clearing existing data...');
    await reset(db, schema);
  }

  // Seed Roles
  console.log('Seeding roles...');
  // await seed(db, { role: schema.role }).refine((f) => ({
  //   role: {
  //     count: testRoles.length,
  //     columns: {
  //       roleId: f.valuesFromArray({
  //         values: testRoles.map((role) => role.roleId),
  //       }),
  //       name: f.valuesFromArray({
  //         values: testRoles.map((role) => role.name),
  //       }),
  //     },
  //   },
  // }));
  for (const role of testRoles) {
    await db
      .insert(schema.role)
      .values(role)
      .onConflictDoUpdate({
        target: schema.role.roleId,
        set: {
          ...role,
        },
      });
  }
  console.log('✅ Seeded roles successfully!');

  // Seed Statuses
  console.log('Seeding statuses...');
  for (const status of testStatuses) {
    await db
      .insert(schema.status)
      .values(status)
      .onConflictDoUpdate({
        target: schema.status.statusId,
        set: {
          ...status,
        },
      });
  }
  console.log('✅ Seeded statuses successfully!');

  console.log('Seeding courses...');
  for (const course of testCourses) {
    await db
      .insert(schema.course)
      .values(course)
      .onConflictDoUpdate({
        target: schema.course.code,
        set: {
          ...course,
        },
      });
  }
  console.log('✅ Seeded courses successfully!');

  console.log('Seeding event types...');
  for (const eventType of testEventTypes) {
    await db
      .insert(schema.eventType)
      .values(eventType)
      .onConflictDoUpdate({
        target: schema.eventType.eventTypeId,
        set: {
          ...eventType,
        },
      });
  }
  console.log('✅ Seeded event types successfully!');

  // Seed Users
  console.log('Clearing users...');
  await db.delete(schema.user);
  await db.delete(schema.userProfile);
  console.log('✅ Cleared users successfully!');

  console.log('Seeding users...');
  for (const user of testUsers) {
    await db.transaction(async (tx) => {
      // Generate user profile first
      const [newProfile] = await tx
        .insert(schema.userProfile)
        .values({
          firstName: user.firstName,
          lastName: user.lastName,
          course: user.course,
          ichat: user.ichat,
          adminNumber: user.adminNumber,
        })
        .onConflictDoUpdate({
          target: schema.userProfile.profileId,
          set: {
            firstName: user.firstName,
            lastName: user.lastName,
            course: user.course,
            ichat: user.ichat,
            adminNumber: user.adminNumber,
          },
        })
        .returning();

      if (!newProfile) {
        tx.rollback();
        throw new Error('Failed to create user profile');
      }

      // Create the user with the profileId
      const hashedPassword = bcrypt.hashSync(
        user.password,
        AuthConfig.saltRounds,
      );
      const [newUser] = await tx
        .insert(schema.user)
        .values({
          email: user.email,
          password: hashedPassword,
          profileId: newProfile.profileId,
        })
        .onConflictDoUpdate({
          target: schema.user.email,
          set: {
            password: hashedPassword,
            profileId: newProfile.profileId,
          },
        })
        .returning();

      if (!newUser) {
        tx.rollback();
        throw new Error('Failed to create user');
      }

      // Assign the user role
      await tx
        .insert(schema.userRole)
        .values({
          userId: newUser.userId,
          roleId: user.role,
        })
        .onConflictDoUpdate({
          target: [schema.userRole.userId, schema.userRole.roleId],
          set: {
            roleId: user.role,
          },
        });

      return newUser;
    });
  }
  console.log('✅ Seeded users successfully!');

  console.log('🌱 Database seeding completed successfully!');
  process.exit(0);
}

main();
