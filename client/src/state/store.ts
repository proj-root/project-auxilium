import {
  configureStore,
  type Action,
  type ThunkAction,
} from '@reduxjs/toolkit';
import { listenerMiddleware } from './listener-middleware';
import { apiSlice } from './api-slice';
import eventReportPaginationSlice from '@/features/events/state/event-report-pagination-slice';
import userPaginationSlice from '@/features/user/components/user-pagination-table/user-pagination-slice';
import userProfilePaginationSlice from '@/features/user/components/user-profile-pagination-table/user-profile-pagination-slice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      eventReportPaginationSlice,
      userPaginationSlice,
      userProfilePaginationSlice,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(listenerMiddleware.middleware)
        .concat(apiSlice.middleware),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
