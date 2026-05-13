export interface CertificatePreset {
  value: number;
  label: string;
}

export interface GiftCertificateDto {
  code: string;
  recipientName: string;
  amountRub: number;
}
