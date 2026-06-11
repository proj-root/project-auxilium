import type { BaseResponseDTO } from '@/types/dto.types';
import type { PaginationOptions } from '@auxilium/types/pagination';

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

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  emailVerified: string;
  image: string;
  userProfile: UserProfileDTO;
  role: RoleDTO;
  createdAt: string;
  updatedAt: string;
}

export type GetPersonalDetailsResponse = BaseResponseDTO<UserDTO>;

export interface GetAllUsersRequest extends PaginationOptions {
  roleId: string;
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
