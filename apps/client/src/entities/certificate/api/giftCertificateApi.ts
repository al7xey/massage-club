import { baseApi } from '@/shared/api/baseApi';
import type { GiftCertificateDto, GiftCertificateLookupDto } from '../model/types';

export interface CreateGiftCertificateRequest {
  recipientName: string;
  recipientContact: string;
  amountRub: number;
  format: 'EMAIL' | 'PAPER';
  message?: string;
}

export const giftCertificateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createGiftCertificate: builder.mutation<GiftCertificateDto, CreateGiftCertificateRequest>({
      query: (body) => ({ url: '/gift-certificates', method: 'POST', body }),
      invalidatesTags: ['GiftCertificates', 'Payments', 'Admin'],
    }),
    getMyGiftCertificates: builder.query<GiftCertificateDto[], void>({
      query: () => '/gift-certificates/my',
      providesTags: ['GiftCertificates'],
    }),
    lookupGiftCertificate: builder.query<GiftCertificateLookupDto, string>({
      query: (code) => `/gift-certificates/${code}`,
      providesTags: (_result, _error, code) => [{ type: 'GiftCertificateLookup', id: code }],
    }),
  }),
});

export const { useCreateGiftCertificateMutation, useGetMyGiftCertificatesQuery, useLookupGiftCertificateQuery } = giftCertificateApi;
