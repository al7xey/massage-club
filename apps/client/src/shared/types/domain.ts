export type Id = string;

export interface ServiceDto {
  id: Id;
  title: string;
  slug?: string;
  description: string;
  durationMinutes: number;
  priceRub: number;
}

export interface StudioDto {
  id: Id;
  name: string;
  address: string;
  city: string;
  phone?: string;
}

export interface SubscriptionPlanDto {
  id: Id;
  code: string;
  name: string;
  monthlyPriceRub: number;
  discountPercent: number;
  includedCredits: number;
}

export interface MasterDto {
  id: Id;
  firstName: string;
  lastName: string;
  bio?: string;
  studio?: StudioDto;
  services: ServiceDto[];
  isActive: boolean;
}
