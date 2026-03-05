import { apiSlice } from '@/state/api-slice';
import type {
  CreateEventRequest,
  CreateEventResponse,
  GetAllEventsRequest,
  GetAllEventsResponse,
  GetAllEventTypesResponse,
  GetEventByIdResponse,
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
  }),
});

export const {
  useCreateEventMutation,
  useGetEventByIdQuery,
  useGetAllEventsQuery,
  useGetAllEventTypesQuery,
} = eventsApiSlice;
