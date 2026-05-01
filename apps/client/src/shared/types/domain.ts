export type Id = string;

export interface ServiceDto {
  id: Id;
  title: string;
  description: string;
  durationMinutes: number;
  priceRub: number;
}

export interface StudioDto {
  id: Id;
  name: string;
  address: string;
  city: string;
}

export interface SubscriptionPlanDto {
  id: Id;
  code: string;
  name: string;
  monthlyPriceRub: number;
  discountPercent: number;
  includedCredits: number;
}
