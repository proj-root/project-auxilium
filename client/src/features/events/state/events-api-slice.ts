import { apiSlice } from '@/state/api-slice';
import type {
  CreateEventRequest,
  CreateEventResponse,
  GenerateEventReportResponse,
  GetAllEventsRequest,
  GetAllEventsResponse,
  GetAllEventTypesResponse,
  GetEventByIdResponse,
  GetEventReportByIdResponse,
  GetParticipationsByReportIdRequest,
  GetParticipationsByReportIdResponse,
} from '../events.dto';

export const eventsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createEvent: builder.mutation<CreateEventResponse, CreateEventRequest>({
      query: (data) => ({
        url: '/events',
        method: 'POST',
        data,
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
      invalidatesTags: ['EventReports'],
    }),
    getEventReportById: builder.query<
      GetEventReportByIdResponse,
      { eventReportId: string }
    >({
      query: (params) => ({
        url: `/events/reports/${params.eventReportId}`,
        method: 'GET',
      }),
      providesTags: ['EventReports'],
    }),
    getParticipationsByReportId: builder.query<
      GetParticipationsByReportIdResponse,
      GetParticipationsByReportIdRequest
    >({
      query: (params) => ({
        url: `/events/reports/${params.eventReportId}/participations`,
        method: 'GET',
        params: {
          ...params,
          eventReportId: undefined,
        },
      }),
      providesTags: ['EventReports'],
    }),
  }),
});

export const {
  useCreateEventMutation,
  useGetEventByIdQuery,
  useGetAllEventsQuery,
  useGetAllEventTypesQuery,
  useGenerateEventReportMutation,
  useGetEventReportByIdQuery,
  useGetParticipationsByReportIdQuery,
} = eventsApiSlice;
