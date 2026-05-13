import { baseApi } from '@/shared/api/baseApi';

export const chooseSubscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSubscription: builder.mutation<unknown, { planId: string }>({
      query: (body) => ({ url: '/subscriptions', method: 'POST', body }),
      invalidatesTags: ['MySubscription'],
    }),
  }),
});

export const { useCreateSubscriptionMutation } = chooseSubscriptionApi;
