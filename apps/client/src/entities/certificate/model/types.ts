export interface CertificatePreset {
  value: number;
  label: string;
}

export interface GiftCertificateDto {
  id: string;
  code: string;
  recipientName: string;
  recipientContact?: string | null;
  format: string;
  amountRub: number;
  message?: string | null;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface GiftCertificateLookupDto {
  id: string;
  code: string;
  recipientName: string;
  recipientContact?: string | null;
  format: string;
  amountRub: number;
  message?: string | null;
  status: string;
  expiresAt: string;
  createdAt: string;
}
