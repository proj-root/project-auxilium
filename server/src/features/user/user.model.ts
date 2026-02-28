import db from '@/db';
import bcrypt from 'bcrypt';
import { userProfile, userRole, user as userTable } from '@/db/schema';
import { Roles } from '@auxilium/configs/roles';
import { APIError } from '@auxilium/types/errors';
import { eq } from 'drizzle-orm';
import { AuthConfig } from '@/config/auth.config';

interface CreateUserProps {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  course: string;
  ichat: string;
  adminNumber: string;
}

export const createUser = async ({
  email,
  password,
  firstName,
  lastName,
  course,
  ichat,
  adminNumber,
}: CreateUserProps) => {
  const createdUser = await db.transaction(async (tx) => {
    // Generate user profile first
    const [newProfile] = await tx
      .insert(userProfile)
      .values({
        firstName,
        lastName,
        course,
        ichat,
        adminNumber,
      })
      .returning();

    if (!newProfile) {
      tx.rollback();
      throw new APIError('Failed to create user profile', 500);
    }

    // Create the user with the profileId
    const hashedPassword = bcrypt.hashSync(password, AuthConfig.saltRounds);
    const [newUser] = await tx
      .insert(userTable)
      .values({
        email,
        password: hashedPassword,
        profileId: newProfile.profileId,
      })
      .returning();

    if (!newUser) {
      tx.rollback();
      throw new APIError('Failed to create user', 500);
    }

    // Assign the user role
    await tx.insert(userRole).values({
      userId: newUser.userId,
      roleId: Roles.USER,
    });

    return newUser;
  });

  if (!createdUser) throw new APIError('Failed to create user', 500);

  return createdUser;
};

export const getUserByEmail = async ({ email }: { email: string }) => {
  const [result] = await db
    .selectDistinct()
    .from(userTable)
    .leftJoin(userRole, eq(userRole.userId, userTable.userId))
    .where(eq(userTable.email, email))
    .limit(1);

  if (!result || !result.user || !result.user_role) return null;

  return {
    ...result.user,
    roleId: result.user_role.roleId,
  };
};

export const getUserById = async ({ userId }: { userId: string }) => {
  const [result] = await db
    .selectDistinct()
    .from(userTable)
    .leftJoin(userRole, eq(userRole.userId, userTable.userId))
    .where(eq(userTable.userId, userId))
    .limit(1);

  if (!result || !result.user || !result.user_role) return null;

  return {
    ...result.user,
    roleId: result.user_role.roleId,
  };
};
