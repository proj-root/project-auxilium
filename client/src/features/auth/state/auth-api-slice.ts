import { apiSlice } from '@/state/api-slice';
import type {
  LoginRequestDTO,
  LoginResponseDTO,
  RefreshResponseDTO,
} from '../auth.dto';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseDTO, LoginRequestDTO>({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        data: data,
      }),
      invalidatesTags: ['User'],
    }),
    refresh: builder.mutation<RefreshResponseDTO, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useRefreshMutation, useLoginMutation, useLogoutMutation } =
  authApiSlice;
