import { baseApi } from '@/shared/api/baseApi';
import type { MySubscriptionDto, SubscriptionPlanDto } from '../model/types';
import { mockSubscriptionPlans } from '../model/mock';

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<SubscriptionPlanDto[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery('/subscription-plans');
        if (result.error) {
          return { data: mockSubscriptionPlans };
        }

        return { data: (result.data as SubscriptionPlanDto[]) ?? mockSubscriptionPlans };
      },
      providesTags: ['SubscriptionPlans'],
    }),
    getMySubscription: builder.query<MySubscriptionDto | null, void>({
      query: () => '/subscriptions/me/active',
      providesTags: ['MySubscription'],
    }),
  }),
});

export const { useGetMySubscriptionQuery, useGetSubscriptionPlansQuery } = subscriptionApi;
