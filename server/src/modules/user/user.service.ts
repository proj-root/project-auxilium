import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import db from '@/db';
// import { userProfile } from '@/db/schema';
import * as schema from '@/db/schema';
import { APIError } from '@auxilium/types/errors';
import { eq } from 'drizzle-orm';
import { GetAllUserProfilesQueryDTO, GetAllUsersQueryDTO } from './user.dto';

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
        .insert(schema.userProfile)
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
        .update(schema.userProfile)
        .set(updateData)
        .where(eq(schema.userProfile.profileId, profileId))
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

  async getAllUsers(args: GetAllUsersQueryDTO) {
    try {
      const {
        page = 1,
        pageSize = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        statusId,
      } = args;

      // Build AND conditions for all filters
      const conditions: object[] = [];
      if (search && search.trim() !== '') {
        conditions.push({
          OR: [
            { name: { ilike: `%${search.trim()}%` } },
            { email: { ilike: `%${search.trim()}%` } },
          ],
        });
      }

      if (statusId !== undefined) {
        conditions.push({ statusId: { eq: statusId } });
      }

      const count = await db.query.user.findMany({
        where: conditions.length > 0 ? { AND: conditions } : undefined,
      }).then(users => users.length);

      const users = await db.query.user.findMany({
        where: conditions.length > 0 ? { AND: conditions } : undefined,
        with: {
          userProfile: true,
          userRole: {
            with: {
              role: true,
            },
          },
        },
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      // Format users and remove sensitive data
      const formattedUsers = users.map((user) => ({
        ...user,
        password: undefined,
        userRole: undefined,
        role: {
          roleId: user.userRole?.roleId,
          name: user.userRole?.role?.name,
        },
      }));

      return {
        total: count,
        pageCount: Math.ceil(count / pageSize),
        users: formattedUsers,
      };
    } catch (error) {
      this.logger.error('Error fetching all users:', error);
      throw new APIError('Failed to fetch users', 500);
    }
  }

  async getAllUserProfiles(args: GetAllUserProfilesQueryDTO) {
    try {
      const {
        page = 1,
        pageSize = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        statusId,
      } = args;

      // Build AND conditions for all filters
      const conditions: object[] = [];
      if (search && search.trim() !== '') {
        conditions.push({
          OR: [
            { firstName: { ilike: `%${search.trim()}%` } },
            { lastName: { ilike: `%${search.trim()}%` } },
            { adminNumber: { ilike: `${search.trim()}%` } },
          ],
        });
      }

      if (statusId !== undefined) {
        conditions.push({ statusId: { eq: statusId } });
      }

      const count = await db.query.userProfile.findMany({
        where: conditions.length > 0 ? { AND: conditions } : undefined,
      }).then(result => result.length);

      const userProfiles = await db.query.userProfile.findMany({
        where: conditions.length > 0 ? { AND: conditions } : undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      return {
        total: count,
        pageCount: Math.ceil(count / pageSize),
        userProfiles,
      };
    } catch (error) {
      this.logger.error('Error fetching all user profiles:', error);
      throw new APIError('Failed to fetch user profiles', 500);
    }
  }
}
