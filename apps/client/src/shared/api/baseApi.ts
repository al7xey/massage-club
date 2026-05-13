import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config/env';
import { tokenStorage } from '../lib/storage/tokenStorage';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = tokenStorage.getAccessToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: [
    'Admin',
    'Appointments',
    'CurrentUser',
    'GiftCertificates',
    'Masters',
    'Service',
    'Services',
    'Studios',
    'SubscriptionPlans',
    'MySubscription',
  ],
  endpoints: () => ({}),
});
