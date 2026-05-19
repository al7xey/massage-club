import { baseApi } from '@/shared/api/baseApi';
import type { AppointmentDto, CreateAppointmentRequest } from '../model/types';

export const appointmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyAppointments: builder.query<AppointmentDto[], void>({
      query: () => '/appointments/my',
      providesTags: ['Appointments'],
    }),
    getAppointmentSlots: builder.query<string[], { masterId: string; date: string; durationMinutes?: number }>({
      query: ({ date, durationMinutes, masterId }) => ({
        url: '/appointments/slots',
        params: { masterId, date, durationMinutes },
      }),
    }),
    createAppointment: builder.mutation<AppointmentDto, CreateAppointmentRequest>({
      query: (body) => ({ url: '/appointments', method: 'POST', body }),
      invalidatesTags: ['Appointments', 'Payments', 'MySubscription', 'Admin'],
    }),
    cancelAppointment: builder.mutation<AppointmentDto, string>({
      query: (id) => ({ url: `/appointments/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: ['Appointments', 'Admin'],
    }),
    updateAppointmentStatus: builder.mutation<AppointmentDto, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/appointments/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Appointments', 'Admin'],
    }),
  }),
});

export const {
  useCancelAppointmentMutation,
  useCreateAppointmentMutation,
  useGetAppointmentSlotsQuery,
  useGetMyAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
} = appointmentApi;
