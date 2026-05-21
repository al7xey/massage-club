import { baseApi } from '@/shared/api/baseApi';
import type { ServiceCategoryDto, ServiceDto, ServicesPageDto, ServicesQuery } from '../model/types';
import { getMockServiceById, mockServices } from '../model/mock';

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
          return { data: getMockServicesPage(normalizedParams) };
        }

        const response = result.data as ServicesPageDto | ServiceDto[] | undefined;
        return {
          data: Array.isArray(response)
            ? { ...defaultServicesPage, items: response, total: response.length, hasMore: false }
            : response ?? getMockServicesPage(normalizedParams),
        };
      },
      providesTags: ['Services'],
    }),
    getService: builder.query<ServiceDto, string>({
      async queryFn(id, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery(`/services/${id}`);
        if (result.error) {
          const fallback = getMockServiceById(id) ?? mockServices[0];
          return fallback ? { data: fallback } : { error: result.error };
        }

        return { data: result.data as ServiceDto };
      },
      providesTags: (_result, _error, id) => [{ type: 'Service', id }],
    }),
    getServiceCategories: builder.query<ServiceCategoryDto[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery('/services/categories');
        if (result.error) {
          return { data: getMockCategories() };
        }

        return { data: (result.data as ServiceCategoryDto[]) ?? getMockCategories() };
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

function getMockServicesPage(params: ServicesQuery): ServicesPageDto {
  const limit = params.limit ?? defaultServicesPage.limit;
  const page = params.page ?? 1;
  const search = params.search?.trim().toLowerCase();
  const categories = (params.categories ?? params.category ?? '')
    .split(',')
    .map((category) => category.trim())
    .filter(Boolean);

  const filtered = mockServices.filter((service) => {
    if (search && !`${service.title} ${service.description} ${service.composition ?? ''}`.toLowerCase().includes(search)) {
      return false;
    }

    if (categories.length > 0 && (!service.category?.slug || !categories.includes(service.category.slug))) {
      return false;
    }

    if (params.minPrice !== undefined && service.priceRub < params.minPrice) {
      return false;
    }

    if (params.maxPrice !== undefined && service.priceRub > params.maxPrice) {
      return false;
    }

    if (params.minDuration !== undefined && service.durationMinutes < params.minDuration) {
      return false;
    }

    if (params.maxDuration !== undefined && service.durationMinutes > params.maxDuration) {
      return false;
    }

    return true;
  });

  const sorted = [...filtered].sort((left, right) => {
    switch (params.sort) {
      case 'priceAsc':
        return left.priceRub - right.priceRub;
      case 'priceDesc':
        return right.priceRub - left.priceRub;
      case 'durationAsc':
        return left.durationMinutes - right.durationMinutes;
      case 'durationDesc':
        return right.durationMinutes - left.durationMinutes;
      case 'titleAsc':
        return left.title.localeCompare(right.title, 'ru');
      default:
        return 0;
    }
  });

  const start = (page - 1) * limit;
  const items = sorted.slice(start, start + limit);

  return {
    items,
    page,
    limit,
    total: sorted.length,
    hasMore: start + limit < sorted.length,
  };
}

function getMockCategories(): ServiceCategoryDto[] {
  const categories = new Map<string, ServiceCategoryDto>();

  for (const service of mockServices) {
    if (service.category) {
      categories.set(service.category.slug, service.category);
    }
  }

  return [...categories.values()];
}
