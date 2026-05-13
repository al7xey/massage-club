import { baseApi } from '@/shared/api/baseApi';

export const adminDashboardApi = baseApi.injectEndpoints({
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

export const { useGetAdminAppointmentsQuery, useGetAdminSummaryQuery, useGetAdminUsersQuery } = adminDashboardApi;
