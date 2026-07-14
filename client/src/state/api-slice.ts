// This file contains the main API slice for managing API calls and state in the application.
// The purpose is to ensure easier tag invalidation to refresh data when new data comes in, to prevent unnecessary re-renders and subscriptions.

import {
  type BaseQueryFn,
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: 'include',
  }),
  endpoints: () => ({}),
  // Edit tags here as needed
  tagTypes: [
    'User',
    'User-Pagination',
    'User-Profile-Pagination',
    'Roles',
    'Departments',
    'Events',
    'EventReports',
    'EventTypes',
    'Tasks',
  ],
});
