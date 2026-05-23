import type { MasterDto } from '@/entities/master';
import type { ServiceDto } from '@/entities/service';
import type { StudioDto } from '@/entities/studio';
import type { PublicUserDto } from '@massage/shared';

export interface AppointmentDto {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  priceRub: number;
  basePriceRub: number;
  discountPercent: number;
  paidBySubscriptionCredit: boolean;
  note?: string | null;
  createdAt: string;
  user?: PublicUserDto;
  service: ServiceDto;
  studio: StudioDto;
  master: MasterDto;
}

export interface CreateAppointmentRequest {
  serviceId: string;
  studioId: string;
  masterId: string;
  startsAt: string;
  note?: string;
  useSubscriptionCredit?: boolean;
}
