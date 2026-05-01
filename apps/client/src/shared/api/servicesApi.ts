import { createApi } from '@reduxjs/toolkit/query/react';
import type { ServiceDto, StudioDto } from '../types/domain';
import { baseQuery } from './baseApi';

export const servicesApi = createApi({
  reducerPath: 'servicesApi',
  baseQuery,
  tagTypes: ['Services', 'Studios', 'Masters'],
  endpoints: (builder) => ({
    getServices: builder.query<ServiceDto[], void>({
      query: () => '/services',
      providesTags: ['Services'],
    }),
    getService: builder.query<ServiceDto, string>({
      query: (id) => `/services/${id}`,
    }),
    getStudios: builder.query<StudioDto[], void>({
      query: () => '/studios',
      providesTags: ['Studios'],
    }),
    getMasters: builder.query<unknown[], void>({
      query: () => '/masters',
      providesTags: ['Masters'],
    }),
  }),
});

export const { useGetServicesQuery, useGetServiceQuery, useGetStudiosQuery, useGetMastersQuery } = servicesApi;
