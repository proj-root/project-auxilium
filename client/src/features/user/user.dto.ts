import type { BaseResponseDTO } from '@/types/dto.types';

export interface UserProfileDTO {
  profileId: string;
  firstName: string;
  lastName: string;
  course: string;
  ichat: string;
  studentClass: string;
  adminNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDTO {
  userId: string;
  statusId: string;
  email: string;
  userProfile: UserProfileDTO;
  status: {
    statusId: string;
    name: string;
  };
  role: {
    roleId: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type GetPersonalDetailsResponse = BaseResponseDTO<UserDTO>;
