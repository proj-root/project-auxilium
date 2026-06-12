import * as schema from '@/db/schema';
import { PaginationOptions } from '@auxilium/types/pagination';
import { z } from 'zod';

// User DTO
export type UserDTO = typeof schema.user.$inferSelect;
export type UserProfileDTO = typeof schema.userProfile.$inferSelect;

export type GetAllUsersQueryDTO = PaginationOptions & {
  sortBy?: 'name' | 'createdAt';
  statusId?: number;
  roleId?: number;
};

export type GetAllUserProfilesQueryDTO = PaginationOptions & {
  sortBy?: 'name' | 'createdAt';
  statusId?: number;
};

export const UpdateUserSchema = z
  .object({
    email: z.email().optional(),
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    course: z.string().trim().optional(),
    ichat: z.email().optional(),
    studentClass: z.string().trim().optional(),
    adminNumber: z.string().trim().optional(),
    // Restricted edits
    roleId: z.coerce.number().optional(),
    departmentIds: z.array(z.coerce.number()).optional(),
  })
  .refine(
    (data) =>
      Object.values(data).some((value) => value !== undefined && value !== ''),
    { message: 'At least one field must be provided for update' },
  );

export type UpdateUserDTO = z.infer<typeof UpdateUserSchema> & {
  userId: string;
};
