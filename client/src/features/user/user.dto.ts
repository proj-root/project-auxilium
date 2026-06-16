import type { BaseResponseDTO } from '@/types/dto.types';
import type { PaginationOptions } from '@auxilium/types/pagination';
import type { EventRole } from '../events/events.dto';

export interface UserProfileDTO {
  profileId: string;
  userId: string;
  firstName: string;
  lastName: string;
  course: string;
  ichat: string;
  studentClass: string;
  adminNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleDTO {
  roleId: string | number;
  name: string;
}

export interface DepartmentDTO {
  departmentId: string | number;
  name: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  emailVerified: string;
  image: string;
  userProfile: UserProfileDTO;
  role: RoleDTO;
  departments: DepartmentDTO[];
  eventRoles: EventRole[];
  createdAt: string;
  updatedAt: string;
}

export type GetPersonalDetailsResponse = BaseResponseDTO<UserDTO>;

export interface GetAllUsersRequest extends PaginationOptions {
  roleIds?: number[];
};

export type GetAllUsersResponse = BaseResponseDTO<{
  total: number;
  pageCount: number;
  users: UserDTO[];
}>;

// export interface GetAllUserProfilesRequest extends PaginationOptions {

// };

export type GetAllUserProfilesResponse = BaseResponseDTO<{
  total: number;
  pageCount: number;
  userProfiles: UserProfileDTO[];
}>;

export type GetSingleUserResponse = BaseResponseDTO<UserProfileDTO & {
  email: string;
  emailVerified: string;
  image: string;
  role: RoleDTO;
  departments: DepartmentDTO[];
}>;

export interface GetSingleUserRequest {
  userProfileId: string;
}