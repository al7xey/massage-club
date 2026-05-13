import { baseApi } from '@/shared/api/baseApi';
import type { ServiceDto } from '../model/types';
import { getMockServiceById, mockServices } from '../model/mock';

export const serviceApi = baseApi.injectEndpoints({
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
      providesTags: (_result, _error, id) => [{ type: 'Service', id }],
    }),
  }),
});

export const { useGetServiceQuery, useGetServicesQuery } = serviceApi;
