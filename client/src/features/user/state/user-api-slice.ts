import { apiSlice } from '@/state/api-slice';
import type {
  DeleteUserByIdRequest,
  DeleteUserProfileByIdRequest,
  GetAllCoursesResponse,
  GetAllDepartmentsResponse,
  GetAllRolesResponse,
  GetAllUserProfilesResponse,
  GetAllUsersRequest,
  GetAllUsersResponse,
  GetPersonalDetailsResponse,
  GetSingleUserRequest,
  GetSingleUserResponse,
  UpdateUserByIdRequest,
  UpdateUserProfileByIdRequest,
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
    updateUserProfileById: builder.mutation<void, UpdateUserProfileByIdRequest>({
      query: ({ profileId, ...data }) => ({
        url: `/user/profile/${profileId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User', 'User-Pagination', 'User-Profile-Pagination'],
    }),
    deleteSelf: builder.mutation<void, void>({
      query: () => ({
        url: `/user`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User-Pagination', 'User'],
    }),
    deleteUserById: builder.mutation<void, DeleteUserByIdRequest>({
      query: ({ userId }) => ({
        url: `/user/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User-Pagination', 'User'],
    }),
    deleteUserProfileById: builder.mutation<void, DeleteUserProfileByIdRequest>(
      {
        query: ({ profileId }) => ({
          url: `/user/profile/${profileId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['User-Pagination', 'User'],
      },
    ),
    getAllRoles: builder.query<GetAllRolesResponse, void>({
      query: () => ({
        url: `/user/roles`,
        method: 'GET',
      }),
      providesTags: ['Roles'],
    }),
    getAllDepartments: builder.query<GetAllDepartmentsResponse, void>({
      query: () => ({
        url: `/user/departments`,
        method: 'GET',
      }),
      providesTags: ['Departments'],
    }),
    getAllCourses: builder.query<GetAllCoursesResponse, void>({
      query: () => ({
        url: `/user/courses`,
        method: 'GET',
      }),
      providesTags: ['Courses'],
    }),
  }),
});

export const {
  useGetPersonalDetailsQuery,
  useGetAllUsersQuery,
  useGetAllUserProfilesQuery,
  useGetSingleUserQuery,
  useUpdateUserByIdMutation,
  useUpdateUserProfileByIdMutation,
  useGetAllRolesQuery,
  useGetAllDepartmentsQuery,
  useDeleteSelfMutation,
  useDeleteUserByIdMutation,
  useDeleteUserProfileByIdMutation,
  useGetAllCoursesQuery,
} = userApiSlice;
