import type { AuthResponseDto } from '@massage/shared';
import { baseApi } from '@/shared/api/baseApi';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  firstName: string;
  lastName: string;
  phone?: string;
}

export const authByEmailApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponseDto, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['CurrentUser'],
    }),
    register: builder.mutation<AuthResponseDto, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      invalidatesTags: ['CurrentUser'],
    }),
    refresh: builder.mutation<AuthResponseDto, { refreshToken: string }>({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', body }),
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['CurrentUser'],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useRefreshMutation, useRegisterMutation } = authByEmailApi;
