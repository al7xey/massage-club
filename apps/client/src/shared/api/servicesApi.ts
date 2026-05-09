import { createApi } from '@reduxjs/toolkit/query/react';
import type { MasterDto, ServiceDto, StudioDto } from '../types/domain';
import { baseQuery } from './baseApi';
import { getMockServiceById, mockMasters, mockServices, mockStudios } from './mockData';

export const servicesApi = createApi({
  reducerPath: 'servicesApi',
  baseQuery,
  tagTypes: ['Services', 'Studios', 'Masters'],
  endpoints: (builder) => ({
    getServices: builder.query<ServiceDto[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery('/services');
        if (result.error) {
          return { data: mockServices };
        }
        return { data: (result.data as ServiceDto[]) ?? mockServices };
      },
      providesTags: ['Services'],
    }),
    getService: builder.query<ServiceDto, string>({
      async queryFn(id, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery(`/services/${id}`);
        if (result.error) {
          return { data: getMockServiceById(id) ?? mockServices[0] };
        }
        return { data: (result.data as ServiceDto) ?? (getMockServiceById(id) ?? mockServices[0]) };
      },
    }),
    getStudios: builder.query<StudioDto[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery('/studios');
        if (result.error) {
          return { data: mockStudios };
        }
        return { data: (result.data as StudioDto[]) ?? mockStudios };
      },
      providesTags: ['Studios'],
    }),
    getMasters: builder.query<MasterDto[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery('/masters');
        if (result.error) {
          return { data: mockMasters };
        }
        return { data: (result.data as MasterDto[]) ?? mockMasters };
      },
      providesTags: ['Masters'],
    }),
  }),
});

export const { useGetServicesQuery, useGetServiceQuery, useGetStudiosQuery, useGetMastersQuery } = servicesApi;
