import { baseApi } from '@/shared/api/baseApi';
import type { GiftCertificateDto } from '@/entities/certificate';

export interface CreateGiftCertificateRequest {
  recipientName: string;
  amountRub: number;
}

export const issueCertificateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createGiftCertificate: builder.mutation<GiftCertificateDto, CreateGiftCertificateRequest>({
      query: (body) => ({ url: '/gift-certificates', method: 'POST', body }),
      invalidatesTags: ['GiftCertificates'],
    }),
  }),
});

export const { useCreateGiftCertificateMutation } = issueCertificateApi;
