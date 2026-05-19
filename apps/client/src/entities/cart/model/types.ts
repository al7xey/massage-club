import type { AppointmentDto } from '@/entities/appointment';
import type { PaymentDto } from '@/entities/payment/model/types';
import type { ServiceDto } from '@/entities/service';

export interface CartItemDto {
  id: string;
  service: ServiceDto;
  createdAt: string;
}

export interface CheckoutCartItemRequest {
  cartItemId: string;
  masterId: string;
  startsAt: string;
  useSubscriptionCredit?: boolean;
}

export interface CheckoutCartRequest {
  studioId: string;
  date: string;
  items: CheckoutCartItemRequest[];
}

export interface CartCheckoutResponseDto {
  appointments: AppointmentDto[];
  payments: PaymentDto[];
  totalAmountRub: number;
  subscriptionCreditsUsed: number;
}
