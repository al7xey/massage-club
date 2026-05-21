import { baseApi } from '@/shared/api/baseApi';
import type { MasterDto } from '../model/types';
import { mockMasters } from '../model/mock';

export const masterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
    getMaster: builder.query<MasterDto | null, string>({
      async queryFn(id, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery(`/masters/${id}`);
        if (result.error) {
          const fallback = mockMasters.find((master) => master.id === id) ?? null;
          return { data: fallback };
        }

        return { data: (result.data as MasterDto | null) ?? null };
      },
      providesTags: ['Masters'],
    }),
  }),
});

export const { useGetMasterQuery, useGetMastersQuery } = masterApi;
