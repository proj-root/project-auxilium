import { apiSlice } from '@/state/api-slice';
import type { GetPersonalDetailsResponse } from '../user.dto';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPersonalDetails: builder.query<GetPersonalDetailsResponse, void>({
      query: () => ({
        url: '/user',
        method: 'GET',
      }),
      providesTags: ['User'],
    })
  }),
});

export const { useGetPersonalDetailsQuery } =
  userApiSlice;
