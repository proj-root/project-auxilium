import {
  configureStore,
  type Action,
  type ThunkAction,
} from '@reduxjs/toolkit';
import { listenerMiddleware } from './listener-middleware';
import { apiSlice } from './api-slice';
import authSlice from '@/features/auth/state/auth-slice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      authSlice,
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
