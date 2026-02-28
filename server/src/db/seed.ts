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
  await seed(db, { role: schema.role }).refine((f) => ({
    role: {
      count: testRoles.length,
      columns: {
        roleId: f.valuesFromArray({
          values: testRoles.map((role) => role.roleId),
        }),
        name: f.valuesFromArray({
          values: testRoles.map((role) => role.name),
        }),
      },
    },
  }));
  console.log('✅ Seeded roles successfully!');

  // Seed Statuses
  console.log('Seeding statuses...');
  await seed(db, { status: schema.status }).refine((f) => ({
    status: {
      count: testStatuses.length,
      columns: {
        statusId: f.valuesFromArray({
          values: testStatuses.map((status) => status.statusId),
        }),
        name: f.valuesFromArray({
          values: testStatuses.map((status) => status.name),
        }),
      },
    },
  }));
  console.log('✅ Seeded statuses successfully!');

  console.log('Seeding courses...');
  await seed(db, { course: schema.course }).refine((f) => ({
    course: {
      count: testCourses.length,
      columns: {
        code: f.valuesFromArray({
          values: testCourses.map((course) => course.code),
        }),
        name: f.valuesFromArray({
          values: testCourses.map((course) => course.name),
        }),
      },
    },
  }));
  console.log('✅ Seeded courses successfully!');

  console.log('Seeding event types...');
  await seed(db, { eventType: schema.eventType }).refine((f) => ({
    eventType: {
      count: testEventTypes.length,
      columns: {
        eventTypeId: f.valuesFromArray({
          values: testEventTypes.map((event) => event.eventTypeId),
        }),
        name: f.valuesFromArray({
          values: testEventTypes.map((event) => event.name),
        }),
      },
    },
  }));
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
