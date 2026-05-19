import type { PublicUserDto } from '@massage/shared';
import { baseApi } from '@/shared/api/baseApi';

export interface UpdateCurrentUserRequest {
  fullName?: string;
  phone?: string;
  email?: string;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<PublicUserDto, void>({
      query: () => '/users/me',
      providesTags: ['CurrentUser'],
    }),
    updateCurrentUser: builder.mutation<PublicUserDto, UpdateCurrentUserRequest>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['CurrentUser', 'Admin'],
    }),
  }),
});

export const { useGetCurrentUserQuery, useUpdateCurrentUserMutation } = userApi;
