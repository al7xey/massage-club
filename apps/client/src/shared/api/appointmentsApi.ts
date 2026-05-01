import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export interface CreateAppointmentRequest {
  serviceId: string;
  studioId: string;
  masterId: string;
  startsAt: string;
  note?: string;
}

export const appointmentsApi = createApi({
  reducerPath: 'appointmentsApi',
  baseQuery,
  tagTypes: ['Appointments'],
  endpoints: (builder) => ({
    createAppointment: builder.mutation<unknown, CreateAppointmentRequest>({
      query: (body) => ({ url: '/appointments', method: 'POST', body }),
      invalidatesTags: ['Appointments'],
    }),
    getMyAppointments: builder.query<unknown[], void>({
      query: () => '/appointments/my',
      providesTags: ['Appointments'],
    }),
    cancelAppointment: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/appointments/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: ['Appointments'],
    }),
  }),
});

export const { useCreateAppointmentMutation, useGetMyAppointmentsQuery, useCancelAppointmentMutation } = appointmentsApi;
