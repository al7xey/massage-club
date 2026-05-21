import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { API_BASE_URL } from '../config/env';
import { tokenStorage } from '../lib/storage/tokenStorage';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: 2500,
  prepareHeaders: (headers) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) {
    return result;
  }

  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    tokenStorage.removeTokens();
    return result;
  }

  const refreshResult = await rawBaseQuery(
    {
      url: '/auth/refresh',
      method: 'POST',
      body: { refreshToken },
    },
    api,
    extraOptions,
  );

  if (!refreshResult.data || typeof refreshResult.data !== 'object') {
    tokenStorage.removeTokens();
    return result;
  }

  const authResponse = refreshResult.data as { accessToken?: string; refreshToken?: string };

  if (!authResponse.accessToken || !authResponse.refreshToken) {
    tokenStorage.removeTokens();
    return result;
  }

  tokenStorage.setTokens({
    accessToken: authResponse.accessToken,
    refreshToken: authResponse.refreshToken,
  });

  result = await rawBaseQuery(args, api, extraOptions);
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Admin',
    'Appointments',
    'Cart',
    'CurrentUser',
    'GiftCertificateLookup',
    'GiftCertificates',
    'Masters',
    'Payments',
    'Reviews',
    'Service',
    'Services',
    'Settings',
    'Studios',
    'SubscriptionPlans',
    'MySubscription',
    'SupportTickets',
  ],
  endpoints: () => ({}),
});
