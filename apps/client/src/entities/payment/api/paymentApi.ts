import { baseApi } from '@/shared/api/baseApi';
import type { PaymentDto } from '../model/types';

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyPayments: builder.query<PaymentDto[], void>({
      query: () => '/payments/my',
      providesTags: ['Payments'],
    }),
  }),
});

export const { useGetMyPaymentsQuery } = paymentApi;
