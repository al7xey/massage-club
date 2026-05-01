import { GiftCertificateStatus } from '../entities/gift-certificate.entity';

export interface GiftCertificateLookup {
  code: string;
  amountRub: number;
  status: GiftCertificateStatus;
}
