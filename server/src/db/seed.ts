import 'dotenv/config';
import db from '@/db';
import bcrypt from 'bcrypt';
import { createUser } from '../features/user/user.model';
import * as schema from './schema';
import { testUsers } from './test-data';
import { Roles } from '@auxilium/configs/roles';
import { StatusConfig } from '@auxilium/configs/status';
import { AuthConfig } from '@/config/auth.config';

async function main() {
  console.log('🌱 Initiating database seeding protocol...');

  // Seed Roles
  console.log('Seeding roles...');
  for (const role in Roles) {
    await db
      .insert(schema.role)
      //@ts-ignore
      .values({ roleId: Roles[role], name: role })
      .onConflictDoUpdate({
        target: schema.role.roleId,
        set: {
          name: role,
        },
      });
  }
  console.log('✅ Seeded roles successfully!');

  // Seed Statuses
  console.log('Seeding statuses...');
  for (const status in StatusConfig) {
    await db
      .insert(schema.status)
      //@ts-ignore
      .values({ statusId: StatusConfig[status], name: status })
      .onConflictDoUpdate({
        target: schema.status.statusId,
        set: {
          name: status,
        },
      });
  }
  console.log('✅ Seeded statuses successfully!');

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
          gender: user.gender,
          dob: user.dob.toISOString(),
        })
        .onConflictDoUpdate({
          target: schema.userProfile.profileId,
          set: {
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            dob: user.dob.toISOString(),
          },
        })
        .returning();

      if (!newProfile) {
        tx.rollback();
        throw new Error('Failed to create user profile');
      }

      // Create the user with the profileId
      const hashedPassword = bcrypt.hashSync(user.password, AuthConfig.saltRounds);
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
      await tx.insert(schema.userRole).values({
        userId: newUser.userId,
        roleId: user.role,
      }).onConflictDoUpdate({
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
