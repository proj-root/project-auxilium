import type { BaseResponseDTO } from "@/types/dto.types";

export interface UserDTO {
  userId: string;
  statusId: string;
  email: string;
  userProfile: {
    profileId: string;
    firstName: string;
    lastName: string;
    course: string;
    ichat: string;
    studentClass: string;
    adminNumber: string;
    createdAt: Date;
    updatedAt: Date;
  };
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