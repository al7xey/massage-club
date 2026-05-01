import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery,
  tagTypes: ['Admin'],
  endpoints: (builder) => ({
    getAdminSummary: builder.query<unknown, void>({
      query: () => '/admin/analytics/summary',
      providesTags: ['Admin'],
    }),
    getAdminAppointments: builder.query<unknown[], void>({
      query: () => '/admin/appointments',
    }),
    getAdminUsers: builder.query<unknown[], void>({
      query: () => '/admin/users',
    }),
  }),
});

export const { useGetAdminSummaryQuery, useGetAdminAppointmentsQuery, useGetAdminUsersQuery } = adminApi;
