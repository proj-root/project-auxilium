import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import db from '@/db';
import * as schema from '@/db/schema';
import { APIError } from '@auxilium/types/errors';
import { eq } from 'drizzle-orm';
import {
  CreateUserProfileDTO,
  GetAllUserProfilesQueryDTO,
  GetAllUsersQueryDTO,
  UpdateUserDTO,
} from './user.dto';
import { RolesConfig } from '@auxilium/configs/roles';
import { SystemConfig } from '@/config/system.config';

// export interface CreateUserProfileInput {
//   firstName: string;
//   lastName: string;
//   course: string;
//   ichat: string;
//   studentClass: string;
//   adminNumber: string;
// }

const ICHAT_DOMAIN = 'ichat.sp.edu.sg';

export interface UpdateUserProfileInput {
  userId?: string;
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
          departments: {
            columns: {
              createdAt: false,
              updatedAt: false,
            },
          },
        },
      });

      if (!user) {
        this.logger.warn(`User with ID ${userId} not found`);
        return null;
      }

      // Clear sensitive data and format data
      return {
        ...user,
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

  async getProfileByIchat({ ichat }: { ichat: string }) {
    try {
      const userProfile = await db.query.userProfile.findFirst({
        where: {
          userId: { isNull: true },
          ichat: { ilike: `${ichat.trim()}` },
        },
      });

      if (!userProfile) {
        this.logger.warn(`User profile with ichat ${ichat} not found`);
        return null;
      }

      return userProfile;
    } catch (error) {
      this.logger.error(
        `Error fetching user profile by ichat ${ichat}:`,
        error,
      );
      throw new APIError('Failed to fetch user profile', 500);
    }
  }

  async getUserByProfileId({ userProfileId }: { userProfileId: string }) {
    try {
      const userProfile = await db.query.userProfile.findFirst({
        where: {
          profileId: userProfileId,
        },
        with: {
          user: {
            columns: {
              createdAt: false,
              updatedAt: false,
            },
            with: {
              userRole: {
                with: {
                  role: true,
                },
              },
              departments: {
                columns: {
                  createdAt: false,
                  updatedAt: false,
                },
              },
            },
          },
        },
      });

      if (!userProfile) {
        this.logger.warn(`User profile with ID ${userProfileId} not found`);
        return null;
      }

      // Clear sensitive data and format data
      return {
        ...userProfile,
        ...userProfile.user,
        role: {
          roleId: userProfile?.user?.userRole?.roleId,
          name: userProfile?.user?.userRole?.role?.name,
        },
        userRole: undefined,
        user: undefined,
        id: undefined,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching user profile by ID ${userProfileId}:`,
        error,
      );
      throw new APIError('Failed to fetch user by ID', 500);
    }
  }

  async getUserProfileByUserId({ userId }: { userId: string }) {
    const userProfile = await db.query.userProfile.findFirst({
      where: {
        userId,
      },
    });

    if (!userProfile) {
      this.logger.warn(`User profile for user ID ${userId} not found`);
      return null;
    }

    return userProfile;
  }

  async createUserProfile(args: CreateUserProfileDTO) {
    // ENABLE IN PRODUCTION
    if (
      SystemConfig.isProduction &&
      args.ichat.toLowerCase().split('@')[1] !== ICHAT_DOMAIN
    ) {
      throw new APIError(`Invalid email domain. Must be ${ICHAT_DOMAIN}`, 400);
    }

    if (args.userId) {
      const user = await db.query.user.findFirst({
        where: {
          id: args.userId,
        },
      });

      if (!user)
        throw new NotFoundException(`User with ID ${args.userId} not found.`);
    }

    const [newProfile] = await db
      .insert(schema.userProfile)
      .values({
        ...args,
        ichat: args.ichat.trim().toLowerCase(),
      })
      .returning();

    if (!newProfile) {
      throw new APIError('Failed to create user profile', 500);
    }

    this.logger.debug(
      `Created user profile for admin number: ${args.adminNumber}, name: ${args.firstName} ${args.lastName}`,
    );
    return newProfile;
  }

  async updateUserProfile({
    profileId,
    ...updateData
  }: UpdateUserProfileInput) {
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
  }

  async getAllUsers(args: GetAllUsersQueryDTO) {
    try {
      const {
        page = 1,
        pageSize = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        roleIds,
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

      if (roleIds && Array.isArray(roleIds)) {
        conditions.push({ userRole: { roleId: { in: roleIds } } });
      }

      if (statusId !== undefined) {
        conditions.push({ statusId: { eq: statusId } });
      }

      const count = await db.query.user
        .findMany({
          where: conditions.length > 0 ? { AND: conditions } : undefined,
        })
        .then((users) => users.length);

      const users = await db.query.user.findMany({
        where: conditions.length > 0 ? { AND: conditions } : undefined,
        with: {
          userProfile: true,
          userRole: {
            with: {
              role: true,
            },
          },
          departments: {
            columns: {
              createdAt: false,
              updatedAt: false,
            },
          },
          userEventRoles: true,
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

      const count = await db.query.userProfile
        .findMany({
          where: conditions.length > 0 ? { AND: conditions } : undefined,
        })
        .then((result) => result.length);

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

  async updateUser(args: UpdateUserDTO, adminRoleId?: number) {
    const authorized =
      adminRoleId === RolesConfig.ADMIN ||
      adminRoleId === RolesConfig.SUPERADMIN;

    try {
      const { userId, departmentIds, roleId, ...updateData } = args;

      // Find original profile by User ID
      const originalProfile = await db.query.userProfile.findFirst({
        where: {
          userId,
        },
      });

      if (!originalProfile) {
        throw new NotFoundException(
          `User profile for user ID ${userId} not found`,
        );
      }

      let name: string | undefined = undefined;
      if (updateData.firstName || updateData.lastName) {
        name = `${updateData.firstName ?? originalProfile.firstName} ${updateData.lastName ?? originalProfile.lastName}`;
      }

      const user = await db.transaction(async (tx) => {
        // Update main User account
        let updatedUser;
        if (updateData.email || name) {
          [updatedUser] = await tx
            .update(schema.user)
            .set({
              email: updateData.email,
              name, // Update name if firstName and lastName are provided
              // TODO: Implement profile pic next time
            })
            .where(eq(schema.user.id, userId))
            .returning();

          if (!updatedUser) {
            throw new NotFoundException(`User with ID ${userId} not found`);
          }

          this.logger.debug(`Updated user record for user ID ${userId}`);
        }

        // Update user profile
        if (
          updateData.firstName ||
          updateData.lastName ||
          updateData.course ||
          updateData.ichat ||
          updateData.studentClass ||
          updateData.adminNumber
        ) {
          await tx
            .update(schema.userProfile)
            .set(updateData)
            .where(eq(schema.userProfile.userId, userId))
            .returning();
          this.logger.debug(`Updated user profile for user ID ${userId}`);
        }

        // Update Role if roleId provided and user is authorized
        if (roleId && roleId !== RolesConfig.SUPERADMIN && authorized) {
          await tx
            .update(schema.userRole)
            .set({ roleId })
            .where(eq(schema.userRole.userId, userId));
          this.logger.debug(`Updated user role for user ID ${userId}`);
        }

        const currentUserRole = await tx.query.userRole.findFirst({
          where: {
            userId,
          },
        });

        // Update department if departmentIds provided and user is authorized
        if (
          departmentIds &&
          authorized &&
          currentUserRole?.roleId !== RolesConfig.USER
        ) {
          // Clear all user departments and re-insert
          await tx
            .delete(schema.userDepartment)
            .where(eq(schema.userDepartment.userId, userId));

          for (const departmentId of departmentIds) {
            await tx
              .insert(schema.userDepartment)
              .values({ userId, departmentId });
          }
          this.logger.debug(`Updated user departments for user ID ${userId}`);
        }

        updatedUser =
          updatedUser ||
          (await tx.query.user.findFirst({
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
              departments: true,
            },
          }));

        return updatedUser;
      });

      return user;
    } catch (error) {
      this.logger.error('Error updating user:', error);
      if (!(error instanceof APIError)) {
        throw error;
      }
      throw new APIError('Failed to update user', 500);
    }
  }

  async linkProfileToUser({
    userId,
    ichat,
  }: {
    userId: string;
    ichat: string;
  }) {
    try {
      const [userProfile] = await db
        .update(schema.userProfile)
        .set({ userId })
        .where(eq(schema.userProfile.ichat, ichat))
        .returning();

      if (!userProfile) {
        throw new NotFoundException(
          `User profile with ichat ${ichat} not found`,
        );
      }

      return userProfile;
    } catch (error) {
      this.logger.error('Error linking profile to user:', error);
      throw new APIError('Failed to link profile to user', 500);
    }
  }

  async getAllRoles() {
    try {
      const roles = await db.query.role.findMany();

      return roles
    } catch (error) {
      this.logger.error('Error reading all roles:', error);
      throw new APIError('Failed to fetch all system roles', 500);
    }
  }

  async getAllDepartments() {
    try {
      const departments = await db.query.department.findMany();

      return departments
    } catch (error) {
      this.logger.error('Error reading all departments:', error);
      throw new APIError('Failed to fetch all departments', 500);
    }
  }

  async getAllCourses() {
    try {
      const courses = await db.query.course.findMany();

      return courses
    } catch (error) {
      this.logger.error('Error reading all courses:', error);
      throw new APIError('Failed to fetch all courses', 500);
    }
  }
}
