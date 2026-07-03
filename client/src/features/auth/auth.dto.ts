import type { BaseResponseDTO } from "@/types/dto.types";

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export type LoginResponseDTO = BaseResponseDTO<{
  accessToken: string;
}>;

export type RefreshResponseDTO = BaseResponseDTO<{
  accessToken: string;
}>;

export type VerifyIdentityResponseDTO = BaseResponseDTO<{
  profileExists: boolean;
}>;

export interface VerifyIdentityRequestDTO {
  ichat: string;
}

export interface CompleteProfileLinkRequestDTO {
  otp: string;
  firstName?: string;
  lastName?: string;
  course?: string;
  studentClass?: string;
  adminNumber?: string;
}

export type CompleteProfileLinkResponseDTO = BaseResponseDTO<void>;