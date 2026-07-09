import { apiSlice } from '@/state/api-slice';
import type {
  CreateTaskRequest,
  CreateTaskResponse,
  DeleteTaskResponse,
  GetAllTasksRequest,
  GetAllTasksResponse,
  GetTaskByIdRequest,
  GetTaskByIdResponnse,
  UpdateTaskRequest,
  UpdateTaskResponse,
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
    getTaskById: builder.query<GetTaskByIdResponnse, GetTaskByIdRequest>({
      query: ({ taskId }) => ({
        url: `/events/tasks/${taskId}`,
        method: 'GET',
      }),
      providesTags: ['Tasks'],
    }),
    updateTask: builder.mutation<UpdateTaskResponse, UpdateTaskRequest>({
      query: ({ taskId, ...data }) => ({
        url: `/events/tasks/${taskId}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Tasks'],
    }),
    deleteTask: builder.mutation<DeleteTaskResponse, { taskId: string; }>({
      query: ({ taskId }) => ({
        url: `/events/tasks/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tasks'],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useGetAllTasksQuery,
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation
} = tasksApiSlice;
