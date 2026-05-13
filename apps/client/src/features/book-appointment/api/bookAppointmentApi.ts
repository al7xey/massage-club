import { baseApi } from '@/shared/api/baseApi';

export interface CreateAppointmentRequest {
  serviceId: string;
  studioId: string;
  masterId: string;
  startsAt: string;
  note?: string;
}

export const bookAppointmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAppointment: builder.mutation<unknown, CreateAppointmentRequest>({
      query: (body) => ({ url: '/appointments', method: 'POST', body }),
      invalidatesTags: ['Appointments'],
    }),
  }),
});

export const { useCreateAppointmentMutation } = bookAppointmentApi;
