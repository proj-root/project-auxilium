import * as schema from '@/db/schema';
import { PaginationOptions } from '@auxilium/types/pagination';
import { z } from 'zod';

// User DTO
export type UserDTO = typeof schema.user.$inferSelect;
export type UserProfileDTO = typeof schema.userProfile.$inferSelect;

export const VerifyIdentitySchema = z.object({
  ichat: z.email(),
});

export type VerifyIdentityDTO = z.infer<typeof VerifyIdentitySchema>;

// export const ProfileLinkSchema = z.object({
//   firstName: z.string(),
//   lastName: z.string(),
//   course: z.string(),
//   studentClass: z.string(),
//   adminNumber: z.string(),
// });

// export type ProfileLinkDTO = z.infer<typeof ProfileLinkSchema>;

export const CreateUserProfileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  course: z
    .string()
    .trim()
    .max(6, 'Course can have a maximum of 6 characters only'),
  ichat: z.string(),
  studentClass: z
    .string()
    .trim()
    .max(12, 'Student class can have a maximum of 12 characters only'),
  adminNumber: z
    .string()
    .trim()
    .max(7, 'Admin number can have a maximum of 7 characters only'),
});

export type CreateUserProfileDTO = z.infer<typeof CreateUserProfileSchema> & {
  userId?: string;
};

export type GetAllUsersQueryDTO = PaginationOptions & {
  sortBy?: 'name' | 'createdAt';
  roleIds?: string | (number | string)[];
  statusId?: number;
  eventId?: string;
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
    course: z
      .string()
      .trim()
      .trim()
      .max(6, 'Course can have a maximum of 6 characters only')
      .optional(),
    ichat: z.email().optional(),
    studentClass: z
      .string()
      .trim()
      .max(12, 'Student class can have a maximum of 12 characters only')
      .optional(),
    adminNumber: z
      .string()
      .trim()
      .max(7, 'Admin number can have a maximum of 7 characters only')
      .optional(),
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
