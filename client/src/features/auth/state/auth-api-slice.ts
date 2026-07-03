import { apiSlice } from '@/state/api-slice';
import type {
  LoginRequestDTO,
  LoginResponseDTO,
  RefreshResponseDTO,
  VerifyIdentityRequestDTO,
  VerifyIdentityResponseDTO,
  CompleteProfileLinkRequestDTO,
  CompleteProfileLinkResponseDTO,
} from '../auth.dto';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    verifyIdentity: builder.mutation<VerifyIdentityResponseDTO, VerifyIdentityRequestDTO>({
      query: (data) => ({
        url: '/user/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    completeProfileLink: builder.mutation<CompleteProfileLinkResponseDTO, CompleteProfileLinkRequestDTO>({
      query: ({ otp, ...data }) => ({
        url: `/user/verify/${otp}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useVerifyIdentityMutation, useCompleteProfileLinkMutation } =
  authApiSlice;
