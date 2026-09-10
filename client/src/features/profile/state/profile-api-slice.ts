import { apiSlice } from '@/state/api-slice';
import type {
  GetPublicProfileResponse,
  UpdatePrivacyRequest,
  UpdatePrivacyResponse,
} from '../profile.dto';

export const profileApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublicProfile: builder.query<
      GetPublicProfileResponse,
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/user/public/${userId}`,
        method: 'GET',
      }),
      providesTags: ['PublicProfile'],
    }),
    updatePrivacy: builder.mutation<
      UpdatePrivacyResponse,
      UpdatePrivacyRequest
    >({
      query: (body) => ({
        url: '/user/privacy',
        method: 'PUT',
        body,
      }),
      // 'User' too: the settings page reads the same account through
      // getPersonalDetails, and the switch has to survive a tab change.
      invalidatesTags: ['PublicProfile', 'User'],
    }),
  }),
});

export const { useGetPublicProfileQuery, useUpdatePrivacyMutation } =
  profileApiSlice;
