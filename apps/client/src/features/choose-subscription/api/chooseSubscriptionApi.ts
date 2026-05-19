import { baseApi } from '@/shared/api/baseApi';
import type { SubscriptionPurchaseDto } from '@/entities/subscription/model/types';

export interface CreateSubscriptionRequest {
  planId: string;
}

export const chooseSubscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSubscription: builder.mutation<SubscriptionPurchaseDto, CreateSubscriptionRequest>({
      query: (body) => ({ url: '/subscriptions', method: 'POST', body }),
      invalidatesTags: ['MySubscription', 'Payments', 'Admin'],
    }),
  }),
});

export const { useCreateSubscriptionMutation } = chooseSubscriptionApi;
