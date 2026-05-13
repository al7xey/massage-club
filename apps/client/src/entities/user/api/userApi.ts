import type { PublicUserDto } from '@massage/shared';
import { baseApi } from '@/shared/api/baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<PublicUserDto, void>({
      query: () => '/users/me',
      providesTags: ['CurrentUser'],
    }),
  }),
});

export const { useGetCurrentUserQuery } = userApi;
