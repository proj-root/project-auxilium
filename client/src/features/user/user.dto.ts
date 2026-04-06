import type { BaseResponseDTO } from '@/types/dto.types';

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
  roleId: string;
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
