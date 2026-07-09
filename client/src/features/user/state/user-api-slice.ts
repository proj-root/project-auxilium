import { apiSlice } from '@/state/api-slice';
import type {
  GetAllDepartmentsResponse,
  GetAllRolesResponse,
  GetAllUserProfilesResponse,
  GetAllUsersRequest,
  GetAllUsersResponse,
  GetPersonalDetailsResponse,
  GetSingleUserRequest,
  GetSingleUserResponse,
  UpdateUserByIdRequest,
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
    updateUserById: builder.mutation<void, UpdateUserByIdRequest>({
      query: ({ userId, ...data }) => ({
        url: `/user/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User', 'User-Pagination', 'User-Profile-Pagination'],
    }),
    getAllRoles: builder.query<GetAllRolesResponse, void>({
      query: () => ({
        url: `/user/roles`,
        method: 'GET',
      }),
      providesTags: ['Roles']
    }),
    getAllDepartments: builder.query<GetAllDepartmentsResponse, void>({
      query: () => ({
        url: `/user/departments`,
        method: 'GET',
      }),
      providesTags: ['Departments']
    })
  }),
});

export const {
  useGetPersonalDetailsQuery,
  useGetAllUsersQuery,
  useGetAllUserProfilesQuery,
  useGetSingleUserQuery,
  useUpdateUserByIdMutation,
  useGetAllRolesQuery,
  useGetAllDepartmentsQuery
} = userApiSlice;
