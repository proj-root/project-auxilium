import * as schema from '@/db/schema';
import { PaginationOptions } from "@auxilium/types/pagination";

// User DTO
export type UserDTO = typeof schema.user.$inferSelect;
export type UserProfileDTO = typeof schema.userProfile.$inferSelect;

export type GetAllUsersQueryDTO = PaginationOptions & {
  sortBy?: 'name' | 'createdAt';
  statusId?: number;
  roleId?: number;
}

export type GetAllUserProfilesQueryDTO = PaginationOptions & {
  sortBy?: 'name' | 'createdAt';
  statusId?: number;
}