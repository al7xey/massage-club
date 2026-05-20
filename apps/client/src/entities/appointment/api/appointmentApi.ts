import { baseApi } from '@/shared/api/baseApi';
import type { MasterDto } from '@/entities/master';
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
    getServiceSlots: builder.query<string[], { serviceId: string; studioId: string; date: string }>({
      query: ({ date, serviceId, studioId }) => ({
        url: '/appointments/service-slots',
        params: { serviceId, studioId, date },
      }),
    }),
    getAvailableMasters: builder.query<MasterDto[], { serviceId: string; studioId: string; startsAt: string }>({
      query: ({ serviceId, startsAt, studioId }) => ({
        url: '/appointments/available-masters',
        params: { serviceId, studioId, startsAt },
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
  useGetAvailableMastersQuery,
  useCreateAppointmentMutation,
  useGetAppointmentSlotsQuery,
  useGetMyAppointmentsQuery,
  useGetServiceSlotsQuery,
  useUpdateAppointmentStatusMutation,
} = appointmentApi;
