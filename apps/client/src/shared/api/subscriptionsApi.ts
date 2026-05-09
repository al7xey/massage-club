import { createApi } from '@reduxjs/toolkit/query/react';
import type { SubscriptionPlanDto } from '../types/domain';
import { baseQuery } from './baseApi';
import { mockSubscriptionPlans } from './mockData';

export const subscriptionsApi = createApi({
  reducerPath: 'subscriptionsApi',
  baseQuery,
  tagTypes: ['SubscriptionPlans', 'MySubscription'],
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
    createSubscription: builder.mutation<unknown, { planId: string }>({
      query: (body) => ({ url: '/subscriptions', method: 'POST', body }),
      invalidatesTags: ['MySubscription'],
    }),
    getMySubscription: builder.query<unknown, void>({
      query: () => '/subscriptions/me',
      providesTags: ['MySubscription'],
    }),
  }),
});

export const { useGetSubscriptionPlansQuery, useCreateSubscriptionMutation, useGetMySubscriptionQuery } = subscriptionsApi;
