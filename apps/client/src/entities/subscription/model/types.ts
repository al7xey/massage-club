export interface SubscriptionPlanDto {
  id: string;
  code: string;
  name: string;
  monthlyPriceRub: number;
  discountPercent: number;
  includedCredits: number;
}

export interface PlanMeta {
  title: string;
  subtitle: string;
  features: string[];
}

export interface TariffItem {
  id: string;
  title: string;
  priceRub: number;
  planMeta: PlanMeta;
}

export interface MySubscriptionDto {
  id: string;
  status: string;
  planName: string;
  nextBillingDate?: string;
}
