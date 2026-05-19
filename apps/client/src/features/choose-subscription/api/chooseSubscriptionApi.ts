import { baseApi } from '@/shared/api/baseApi';

export interface CreateSubscriptionRequest {
  planId: string;
}

export interface CreateSubscriptionResponse {
  id: string;
  status: string;
  startsAt: string;
  endsAt: string;
  plan: {
    id: string;
    name: string;
    includedCredits: number;
  };
  credits: {
    id: string;
    totalCredits: number;
    remainingCredits: number;
  };
}

export const chooseSubscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSubscription: builder.mutation<CreateSubscriptionResponse, CreateSubscriptionRequest>({
      query: (body) => ({ url: '/subscriptions', method: 'POST', body }),
      invalidatesTags: ['MySubscription', 'Payments', 'Admin'],
    }),
  }),
});

export const { useCreateSubscriptionMutation } = chooseSubscriptionApi;
