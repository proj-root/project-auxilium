// This file contains the main API slice for managing API calls and state in the application.
// The purpose is to ensure easier tag invalidation to refresh data when new data comes in, to prevent unnecessary re-renders and subscriptions.

import { setAccessToken } from '@/features/auth/state/auth-slice';
import api from '@/lib/api';
import { type BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react';
import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { RootState } from '@/state/store';
import type { InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios';

const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Create custom axios query
const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' },
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig['method'];
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
      headers?: AxiosRequestConfig['headers'];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, headers }, baseQueryApi) => {
    const accessToken = (baseQueryApi.getState() as RootState).authSlice
      .accessToken;
    const dispatch = baseQueryApi.dispatch;

    const requestInterceptor = api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (accessToken && !config.headers?.['Authorization']) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error: unknown) => Promise.reject(error),
    );

    const responseInterceptor = api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean | undefined;
        };
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          console.log('Access token missing/expired. Refreshing token...');
          try {
            const { data: responseData } =
              await refreshApi.post('/auth/refresh');
            dispatch(setAccessToken(responseData.data.accessToken));
            if (!originalRequest.headers) {
              originalRequest.headers = {} as AxiosRequestHeaders;
            }
            originalRequest.headers['Authorization'] =
              `Bearer ${responseData.data.accessToken}`;
            return api(originalRequest as AxiosRequestConfig);
          } catch (error: unknown) {
            if (error instanceof AxiosError) {
              console.log(
                'Refresh token failed',
                error.response?.data?.message,
              );
            } else {
              console.log('Refresh token failed', error);
            }
          }
        }
        return Promise.reject(error);
      },
    );

    try {
      const response = await api({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
        responseType: headers?.Accept === 'application/zip' ? 'blob' : 'json',
      });

      // If ZIP → return blob directly
      if (headers?.Accept === 'application/zip') {
        return { data: response.data as Blob };
      }

      return { data: response.data };
    } catch (error) {
      let message: string = 'Internal Server Error';
      let statusCode: number = 500;
      if (error instanceof AxiosError) {
        message = error.response?.data?.message || error.response?.data;
        statusCode = error.response?.status || 500;
      }
      return {
        error: {
          status: statusCode,
          data: { message },
        },
      };
    } finally {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    }
  };

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({ baseUrl: '' }),
  endpoints: () => ({}),
  // Edit tags here as needed
  tagTypes: ['User', 'Events'],
});
