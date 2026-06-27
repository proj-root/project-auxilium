import { apiSlice } from '@/state/api-slice';
import type {
  CreateTaskRequest,
  CreateTaskResponse,
  GetAllTasksRequest,
  GetAllTasksResponse,
} from '../tasks.dto';

export const tasksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTask: builder.mutation<CreateTaskResponse, CreateTaskRequest>({
      query: ({ eventId, ...data }) => ({
        url: `/events/${eventId}/tasks`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Tasks'],
    }),
    getAllTasks: builder.query<GetAllTasksResponse, GetAllTasksRequest>({
      query: ({ eventId, ...params }) => ({
        url: `/events/${eventId}/tasks`,
        method: 'GET',
        params,
      }),
      providesTags: ['Tasks'],
    }),
  }),
});

export const { useCreateTaskMutation, useGetAllTasksQuery } = tasksApiSlice;
