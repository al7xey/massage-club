export interface SubscriptionPlanDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  monthlyPriceRub: number;
  discountPercent: number;
  includedCredits: number;
  familyMembersLimit: number;
}

export interface SubscriptionCreditDto {
  id: string;
  totalCredits: number;
  remainingCredits: number;
}

export interface MySubscriptionDto {
  id: string;
  status: string;
  startsAt: string;
  endsAt: string;
  frozenUntil?: string | null;
  plan: SubscriptionPlanDto;
  credits: SubscriptionCreditDto[];
}

export interface SubscriptionPurchaseDto extends MySubscriptionDto {
  payment: {
    id: string;
    amountRub: number;
    status: string;
    provider: string;
    purpose: string;
    relatedEntityId?: string;
    createdAt: string;
  };
  purchaseMode: 'ACTIVATE' | 'EXTEND' | 'SWITCH';
}

export interface PlanMeta {
  title: string;
  subtitle?: string;
  features: string[];
}

export interface TariffItem {
  id: string;
  title: string;
  priceRub: number;
  isFeatured: boolean;
  planMeta: PlanMeta;
}
