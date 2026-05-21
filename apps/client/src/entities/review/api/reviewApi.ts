import { baseApi } from '@/shared/api/baseApi';
import type { CreateReviewPayload, ReviewDto } from '../model/types';

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query<ReviewDto[], void>({
      query: () => '/reviews',
      providesTags: ['Reviews'],
    }),
    createReview: builder.mutation<ReviewDto, CreateReviewPayload>({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: ['Reviews'],
    }),
  }),
});

export const { useCreateReviewMutation, useGetReviewsQuery } = reviewApi;
