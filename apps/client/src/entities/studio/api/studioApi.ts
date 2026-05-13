import { baseApi } from '@/shared/api/baseApi';
import type { StudioDto } from '../model/types';
import { mockStudios } from '../model/mock';

export const studioApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const { useGetStudiosQuery } = studioApi;
