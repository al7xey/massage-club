import { baseApi } from '@/shared/api/baseApi';
import type { MasterDto } from '../model/types';

export const masterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMasters: builder.query<MasterDto[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery('/masters');
        if (result.error) {
          return { error: result.error };
        }

        return { data: (result.data as MasterDto[]) ?? [] };
      },
      providesTags: ['Masters'],
    }),
    getMaster: builder.query<MasterDto | null, string>({
      async queryFn(id, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery(`/masters/${id}`);
        if (result.error) {
          return { error: result.error };
        }

        return { data: (result.data as MasterDto | null) ?? null };
      },
      providesTags: ['Masters'],
    }),
  }),
});

export const { useGetMasterQuery, useGetMastersQuery } = masterApi;
