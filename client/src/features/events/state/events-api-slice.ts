import { apiSlice } from '@/state/api-slice';
import {
  type CheckUserEventRoleResponse,
  type AssignUserToEventRequest,
  type AssignUserToEventResponse,
  type CheckUserEventRoleRequest,
  type CreateEventRequest,
  type CreateEventResponse,
  type GenerateEventReportResponse,
  type GetAllEventRolesResponse,
  type GetAllEventsRequest,
  type GetAllEventsResponse,
  type GetAllEventTypesResponse,
  type GetEventByIdResponse,
  type GetEventReportByIdResponse,
  type GetParticipationsByReportIdRequest,
  type GetParticipationsByReportIdResponse,
  type UpdateEventRequest,
  type UpdateEventResponse,
} from '../events.dto';

export const eventsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createEvent: builder.mutation<CreateEventResponse, CreateEventRequest>({
      query: (data) => ({
        url: '/events',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Events'],
    }),
    updateEvent: builder.mutation<UpdateEventResponse, UpdateEventRequest>({
      query: (data) => ({
        url: `/events/${data.eventId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Events'],
    }),
    getEventById: builder.query<GetEventByIdResponse, { eventId: string }>({
      query: (params) => ({
        url: `/events/${params.eventId}`,
        method: 'GET',
      }),
      providesTags: ['Events'],
    }),
    getAllEvents: builder.query<GetAllEventsResponse, GetAllEventsRequest>({
      query: (params) => ({
        url: '/events',
        method: 'GET',
        params,
      }),
      providesTags: ['Events'],
    }),
    getAllEventTypes: builder.query<GetAllEventTypesResponse, void>({
      query: () => ({
        url: '/events/types',
        method: 'GET',
      }),
      providesTags: ['Events'],
    }),
    generateEventReport: builder.mutation<
      GenerateEventReportResponse,
      { eventId: string }
    >({
      query: (params) => ({
        url: `/events/${params.eventId}/generate`,
        method: 'POST',
      }),
      invalidatesTags: ['Events'],
    }),
    getEventReportById: builder.query<
      GetEventReportByIdResponse,
      { eventReportId: string }
    >({
      query: (params) => ({
        url: `/events/reports/${params.eventReportId}`,
        method: 'GET',
      }),
      providesTags: ['Events'],
    }),
    getParticipationsByReportId: builder.query<
      GetParticipationsByReportIdResponse,
      GetParticipationsByReportIdRequest
    >({
      query: (params) => ({
        url: `/events/reports/${params.eventReportId}/participants`,
        method: 'GET',
        params: {
          ...params,
          eventReportId: undefined,
        },
      }),
      providesTags: ['Events'],
    }),
    getAllEventRoles: builder.query<GetAllEventRolesResponse, void>({
      query: () => ({
        url: '/events/roles',
        method: 'GET',
      }),
      providesTags: ['Events'],
    }),
    deleteEventById: builder.mutation<void, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/events/${eventId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Events']
    }),
    hardDeleteEventById: builder.mutation<void, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/events/${eventId}/hard`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Events']
    }),
    assignUserToEvent: builder.mutation<
      AssignUserToEventResponse,
      AssignUserToEventRequest
    >({
      query: (data) => ({
        url: `/events/${data.eventId}/assign`,
        method: 'POST',
        body: {
          userId: data.userId,
          eventRoleId: data.eventRoleId,
        },
      }),
      invalidatesTags: ['Events', 'User'],
    }),
    unassignUserFromEvent: builder.mutation<
      AssignUserToEventResponse,
      { eventId: string; userId: string }
    >({
      query: (data) => ({
        url: `/events/${data.eventId}/assign`,
        method: 'DELETE',
        body: {
          userId: data.userId,
        },
      }),
      invalidatesTags: ['Events', 'User'],
    }),
    checkUserEventRole: builder.query<CheckUserEventRoleResponse, CheckUserEventRoleRequest>({
      query: ({ eventId }) => ({
        url: `/events/${eventId}/check-eventrole`,
        method: 'GET',
      }),
      providesTags: ['User']
    })
  }),
});

export const {
  useCreateEventMutation,
  useUpdateEventMutation,
  useGetEventByIdQuery,
  useGetAllEventsQuery,
  useGetAllEventTypesQuery,
  useGenerateEventReportMutation,
  useGetEventReportByIdQuery,
  useGetParticipationsByReportIdQuery,
  useAssignUserToEventMutation,
  useGetAllEventRolesQuery,
  useUnassignUserFromEventMutation,
  useDeleteEventByIdMutation,
  useHardDeleteEventByIdMutation,
  useCheckUserEventRoleQuery
} = eventsApiSlice;
