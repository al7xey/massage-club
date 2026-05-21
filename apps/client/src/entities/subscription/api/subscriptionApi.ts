import { baseApi } from '@/shared/api/baseApi';
import type { MembershipEntryFeeSettingDto, MySubscriptionDto, SubscriptionPlanDto } from '../model/types';
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
    getMembershipEntryFee: builder.query<MembershipEntryFeeSettingDto, void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery('/settings/membership-entry-fee');
        if (result.error) {
          return { data: { entryFeeEnabled: false, entryFeeRub: 1200 } };
        }

        return { data: result.data as MembershipEntryFeeSettingDto };
      },
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
