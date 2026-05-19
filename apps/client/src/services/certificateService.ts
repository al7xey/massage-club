import type { GiftCertificate, GiftCertificateFormat } from '@/types';
import { addDays, createId, ensureSeedData, mockKeys, readJson, writeJson } from './storageService';
import { paymentService } from './paymentService';

export interface PurchaseCertificateInput {
  userId: string;
  nominalRub: number;
  format: GiftCertificateFormat;
  recipientName: string;
  recipientContact: string;
  message: string;
}

export const certificateService = {
  purchaseCertificate(input: PurchaseCertificateInput): GiftCertificate {
    ensureSeedData();
    const now = new Date();
    const certificate: GiftCertificate = {
      id: createId('cert'),
      userId: input.userId,
      code: `MC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      nominalRub: input.nominalRub,
      format: input.format,
      recipientName: input.recipientName.trim(),
      recipientContact: input.recipientContact.trim(),
      message: input.message.trim(),
      purchasedAt: now.toISOString(),
      expiresAt: addDays(now, 365).toISOString(),
      status: 'active',
    };

    writeJson(mockKeys.certificates, [certificate, ...readJson<GiftCertificate[]>(mockKeys.certificates, [])]);
    paymentService.createPayment(input.userId, 'certificate', `Сертификат ${certificate.code}`, input.nominalRub);
    return certificate;
  },

  getUserCertificates(userId: string): GiftCertificate[] {
    ensureSeedData();
    return readJson<GiftCertificate[]>(mockKeys.certificates, []).filter((certificate) => certificate.userId === userId);
  },

  getAllCertificates(): GiftCertificate[] {
    ensureSeedData();
    return readJson<GiftCertificate[]>(mockKeys.certificates, []);
  },
};
