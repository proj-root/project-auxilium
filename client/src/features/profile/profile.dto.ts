import type { BaseResponseDTO } from '@/types/dto.types';

export interface ProfileCourse {
  code: string;
  name: string;
}

export interface ProfileDetails {
  course: ProfileCourse | null;
  joinedAt: string;
  postCount: number;
  commentCount: number;
}

/**
 * A user as seen at /users/:userId.
 *
 * `details` is null exactly when the profile is private and you are not its
 * owner — the server withholds the fields rather than the client hiding them,
 * so there is nothing in the payload to dig out.
 */
export interface PublicProfile {
  userId: string;
  name: string;
  image: string | null;
  isPrivate: boolean;
  isSelf: boolean;
  details: ProfileDetails | null;
}

export type GetPublicProfileResponse = BaseResponseDTO<PublicProfile>;

export interface UpdatePrivacyRequest {
  isPrivate: boolean;
}

export type UpdatePrivacyResponse = BaseResponseDTO<{
  userId: string;
  isPrivate: boolean;
}>;
