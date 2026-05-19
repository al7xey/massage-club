import type { Payment, PaymentType } from '@/types';
import { createId, ensureSeedData, mockKeys, readJson, writeJson } from './storageService';

export const paymentService = {
  createPayment(userId: string, type: PaymentType, title: string, amountRub: number): Payment {
    ensureSeedData();
    const payments = readJson<Payment[]>(mockKeys.payments, []);
    const payment: Payment = {
      id: createId('pay'),
      userId,
      type,
      title,
      amountRub,
      status: 'paid',
      createdAt: new Date().toISOString(),
    };

    writeJson(mockKeys.payments, [payment, ...payments]);
    return payment;
  },

  getUserPayments(userId: string): Payment[] {
    ensureSeedData();
    return readJson<Payment[]>(mockKeys.payments, []).filter((payment) => payment.userId === userId);
  },

  getAllPayments(): Payment[] {
    ensureSeedData();
    return readJson<Payment[]>(mockKeys.payments, []);
  },
};
