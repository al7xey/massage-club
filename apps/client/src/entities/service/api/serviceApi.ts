import { baseApi } from '@/shared/api/baseApi';
import type { ServiceCategoryDto, ServiceDto, ServicesPageDto, ServicesQuery } from '../model/types';

const defaultServicesPage: ServicesPageDto = {
  items: [],
  page: 1,
  limit: 12,
  total: 0,
  hasMore: false,
};

export const serviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<ServicesPageDto, ServicesQuery | void>({
      query: (params) => ({ url: '/services', params: cleanParams(params ?? {}) }),
      transformResponse: (response: ServicesPageDto | ServiceDto[]) =>
        Array.isArray(response)
          ? { ...defaultServicesPage, items: response, total: response.length, hasMore: false }
          : response,
      providesTags: ['Services'],
    }),
    getService: builder.query<ServiceDto, string>({
      query: (id) => `/services/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Service', id }],
    }),
    getServiceCategories: builder.query<ServiceCategoryDto[], void>({
      query: () => '/services/categories',
      providesTags: ['Services'],
    }),
  }),
});

export const { useGetServiceCategoriesQuery, useGetServiceQuery, useGetServicesQuery } = serviceApi;

function cleanParams(params: ServicesQuery) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}
