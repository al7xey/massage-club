import { baseApi } from '@/shared/api/baseApi';
import type { MasterDto } from '../model/types';

export const masterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMasters: builder.query<MasterDto[], void>({
      query: () => '/masters',
      providesTags: ['Masters'],
    }),
  }),
});

export const { useGetMastersQuery } = masterApi;
