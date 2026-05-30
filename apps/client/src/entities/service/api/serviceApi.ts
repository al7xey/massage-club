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
      async queryFn(params, _api, _extraOptions, fetchWithBaseQuery) {
        const normalizedParams = params ?? {};
        const result = await fetchWithBaseQuery({ url: '/services', params: cleanParams(normalizedParams) });

        if (result.error) {
          return { error: result.error };
        }

        const response = result.data as ServicesPageDto | ServiceDto[] | undefined;
        return {
          data: Array.isArray(response)
            ? { ...defaultServicesPage, items: response, total: response.length, hasMore: false }
            : response ?? { ...defaultServicesPage, page: normalizedParams.page ?? defaultServicesPage.page, limit: normalizedParams.limit ?? defaultServicesPage.limit },
        };
      },
      providesTags: ['Services'],
    }),
    getService: builder.query<ServiceDto, string>({
      async queryFn(id, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery(`/services/${id}`);
        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as ServiceDto };
      },
      providesTags: (_result, _error, id) => [{ type: 'Service', id }],
    }),
    getServiceCategories: builder.query<ServiceCategoryDto[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery('/services/categories');
        if (result.error) {
          return { error: result.error };
        }

        return { data: (result.data as ServiceCategoryDto[]) ?? [] };
      },
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
