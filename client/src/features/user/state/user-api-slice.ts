import { apiSlice } from '@/state/api-slice';
import type {
  GetAllUsersRequest,
  GetAllUsersResponse,
  GetPersonalDetailsResponse,
} from '../user.dto';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPersonalDetails: builder.query<GetPersonalDetailsResponse, void>({
      query: () => ({
        url: '/user',
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
  }),
});

export const { useGetPersonalDetailsQuery, useGetAllUsersQuery } = userApiSlice;
