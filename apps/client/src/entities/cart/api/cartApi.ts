import { baseApi } from '@/shared/api/baseApi';
import type { CartCheckoutResponseDto, CartItemDto, CheckoutCartRequest } from '../model/types';

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<CartItemDto[], void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addCartItem: builder.mutation<CartItemDto, { serviceId: string }>({
      query: (body) => ({ url: '/cart/items', method: 'POST', body }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({ url: `/cart/items/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation<{ cleared: boolean }, void>({
      query: () => ({ url: '/cart', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
    checkoutCart: builder.mutation<CartCheckoutResponseDto, CheckoutCartRequest>({
      query: (body) => ({ url: '/cart/checkout', method: 'POST', body }),
      invalidatesTags: ['Cart', 'Appointments', 'Payments', 'MySubscription', 'Admin'],
    }),
  }),
});

export const {
  useAddCartItemMutation,
  useCheckoutCartMutation,
  useClearCartMutation,
  useGetCartQuery,
  useRemoveCartItemMutation,
} = cartApi;
