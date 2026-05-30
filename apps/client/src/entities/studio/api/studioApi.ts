import { baseApi } from '@/shared/api/baseApi';
import type { StudioDto } from '../model/types';

export const studioApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudios: builder.query<StudioDto[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery('/studios');
        if (result.error) {
          return { error: result.error };
        }

        return { data: (result.data as StudioDto[]) ?? [] };
      },
      providesTags: ['Studios'],
    }),
  }),
});

export const { useGetStudiosQuery } = studioApi;
