import { baseApi } from '@/shared/api/baseApi';
import type { AppointmentDto } from '../model/types';

export const appointmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyAppointments: builder.query<AppointmentDto[], void>({
      query: () => '/appointments/my',
      providesTags: ['Appointments'],
    }),
  }),
});

export const { useGetMyAppointmentsQuery } = appointmentApi;
