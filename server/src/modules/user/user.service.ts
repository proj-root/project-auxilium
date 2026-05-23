import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import db from '@/db';
import { userProfile } from '@/db/schema';
import { APIError } from '@auxilium/types/errors';
import { eq } from 'drizzle-orm';

export interface CreateUserProfileInput {
  firstName: string;
  lastName: string;
  course: string;
  ichat: string;
  studentClass: string;
  adminNumber: string;
}

export interface UpdateUserProfileInput {
  profileId: string;
  firstName?: string;
  lastName?: string;
  course?: string;
  ichat?: string;
  studentClass?: string;
  adminNumber?: string;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async getProfileByAdminNumber({ adminNumber }: { adminNumber: string }) {
    try {
      const profile = await db.query.userProfile.findFirst({
        where: {
          adminNumber,
        },
      });

      return profile;
    } catch (error) {
      this.logger.error(
        `Error fetching profile by admin number ${adminNumber}:`,
        error,
      );
      throw new APIError('Failed to fetch user profile', 500);
    }
  }

  async getUserById({ userId }: { userId: string }) {
    try {
      const user = await db.query.user.findFirst({
        where: {
          id: userId,
        },
        with: {
          userProfile: true,
          userRole: {
            with: {
              role: true,
            },
          },
        },
      });

      // Clear sensitive data and format data
      return {
        ...user,
        password: undefined,
        userRole: undefined,
        role: {
          roleId: user?.userRole?.roleId,
          name: user?.userRole?.role?.name,
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching user by ID ${userId}:`, error);
      throw new APIError('Failed to fetch user by ID', 500);
    }
  }

  async createUserProfile(args: CreateUserProfileInput) {
    try {
      const [newProfile] = await db
        .insert(userProfile)
        .values(args)
        .returning();

      if (!newProfile) {
        throw new APIError('Failed to create user profile', 500);
      }

      this.logger.debug(
        `Created user profile for admin number: ${args.adminNumber}`,
      );
      return newProfile;
    } catch (error) {
      this.logger.error('Error creating user profile:', error);
      throw new APIError('Failed to create user profile', 500);
    }
  }

  async updateUserProfile({
    profileId,
    ...updateData
  }: UpdateUserProfileInput) {
    try {
      const [updatedProfile] = await db
        .update(userProfile)
        .set(updateData)
        .where(eq(userProfile.profileId, profileId))
        .returning();

      if (!updatedProfile) {
        throw new NotFoundException(
          `User profile with ID ${profileId} not found`,
        );
      }

      this.logger.debug(`Updated user profile: ${profileId}`);
      return updatedProfile;
    } catch (error) {
      this.logger.error('Error updating user profile:', error);
      throw new APIError('Failed to update user profile', 500);
    }
  }
}
