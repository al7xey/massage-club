export interface PaymentDto {
  id: string;
  amountRub: number;
  status: string;
  provider: string;
  purpose: string;
  relatedEntityId?: string | null;
  createdAt: string;
}
