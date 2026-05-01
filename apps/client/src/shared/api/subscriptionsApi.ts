import { createApi } from '@reduxjs/toolkit/query/react';
import type { SubscriptionPlanDto } from '../types/domain';
import { baseQuery } from './baseApi';

export const subscriptionsApi = createApi({
  reducerPath: 'subscriptionsApi',
  baseQuery,
  tagTypes: ['SubscriptionPlans', 'MySubscription'],
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<SubscriptionPlanDto[], void>({
      query: () => '/subscription-plans',
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
