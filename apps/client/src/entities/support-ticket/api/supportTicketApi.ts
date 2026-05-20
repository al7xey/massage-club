import { baseApi } from '@/shared/api/baseApi';
import type { CreateSupportTicketRequest, SupportTicketDto } from '../model/types';

export const supportTicketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMySupportTickets: builder.query<SupportTicketDto[], void>({
      query: () => '/support-tickets/my',
      providesTags: ['SupportTickets'],
    }),
    createSupportTicket: builder.mutation<SupportTicketDto, CreateSupportTicketRequest>({
      query: (body) => ({ url: '/support-tickets', method: 'POST', body }),
      invalidatesTags: ['SupportTickets', 'Admin'],
    }),
  }),
});

export const { useCreateSupportTicketMutation, useGetMySupportTicketsQuery } = supportTicketApi;
