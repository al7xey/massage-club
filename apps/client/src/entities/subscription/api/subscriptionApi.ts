import { baseApi } from '@/shared/api/baseApi';
import type { MembershipEntryFeeSettingDto, MySubscriptionDto, SubscriptionPlanDto } from '../model/types';

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<SubscriptionPlanDto[], void>({
      query: () => '/subscription-plans',
      providesTags: ['SubscriptionPlans'],
    }),
    getMySubscription: builder.query<MySubscriptionDto | null, void>({
      query: () => '/subscriptions/me/active',
      providesTags: ['MySubscription'],
    }),
    getMembershipEntryFee: builder.query<MembershipEntryFeeSettingDto, void>({
      query: () => '/settings/membership-entry-fee',
      providesTags: ['Settings'],
    }),
    freezeMySubscription: builder.mutation<MySubscriptionDto, string>({
      query: (id) => ({ url: `/subscriptions/${id}/freeze`, method: 'PATCH', body: {} }),
      invalidatesTags: ['MySubscription', 'Admin'],
    }),
    cancelAutoRenewal: builder.mutation<MySubscriptionDto, string>({
      query: (id) => ({ url: `/subscriptions/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: ['MySubscription', 'Admin'],
    }),
    renewNow: builder.mutation<MySubscriptionDto, string>({
      query: (id) => ({ url: `/subscriptions/${id}/renew-now`, method: 'PATCH' }),
      invalidatesTags: ['MySubscription', 'Payments', 'Admin'],
    }),
    replaceCard: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({ url: `/subscriptions/${id}/replace-card`, method: 'PATCH' }),
      invalidatesTags: ['MySubscription'],
    }),
  }),
});

export const {
  useCancelAutoRenewalMutation,
  useFreezeMySubscriptionMutation,
  useGetMembershipEntryFeeQuery,
  useGetMySubscriptionQuery,
  useGetSubscriptionPlansQuery,
  useRenewNowMutation,
  useReplaceCardMutation,
} = subscriptionApi;
