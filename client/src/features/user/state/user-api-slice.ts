import { apiSlice } from '@/state/api-slice';
import type {
  GetAllUserProfilesResponse,
  GetAllUsersRequest,
  GetAllUsersResponse,
  GetPersonalDetailsResponse,
  GetSingleUserRequest,
  GetSingleUserResponse,
} from '../user.dto';
import type { PaginationOptions } from '@auxilium/types/pagination';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPersonalDetails: builder.query<GetPersonalDetailsResponse, void>({
      query: () => ({
        url: '/user',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    getSingleUser: builder.query<GetSingleUserResponse, GetSingleUserRequest>({
      query: ({ userProfileId }) => ({
        url: `/user/profile/${userProfileId}`,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    getAllUsers: builder.query<GetAllUsersResponse, GetAllUsersRequest>({
      query: (params) => ({
        url: '/user/all',
        method: 'GET',
        params,
      }),
      providesTags: ['User-Pagination'],
    }),
    getAllUserProfiles: builder.query<
      GetAllUserProfilesResponse,
      PaginationOptions
    >({
      query: (params) => ({
        url: '/user/profile/all',
        method: 'GET',
        params,
      }),
      providesTags: ['User-Profile-Pagination'],
    }),
  }),
});

export const {
  useGetPersonalDetailsQuery,
  useGetAllUsersQuery,
  useGetAllUserProfilesQuery,
  useGetSingleUserQuery,
} = userApiSlice;
