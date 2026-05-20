export interface SubscriptionPlanDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  monthlyPriceRub: number;
  periodDays: number;
  discountPercent: number;
  certificateDiscountPercent: number;
  includedCredits: number;
  includedDescription?: string;
  freezeCountPerYear: number;
  freezeDays: number;
  familyMembersLimit: number;
}

export interface SubscriptionCreditDto {
  id: string;
  totalCredits: number;
  remainingCredits: number;
}

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'FROZEN'
  | 'AUTO_RENEWAL_DISABLED'
  | 'PAYMENT_ISSUE'
  | 'EXPIRED';

export interface MySubscriptionDto {
  id: string;
  status: SubscriptionStatus;
  startsAt: string;
  endsAt: string;
  frozenUntil?: string | null;
  autoRenewalEnabled: boolean;
  gracePeriodEndsAt?: string | null;
  paymentIssueNotifiedAt?: string | null;
  nextPaymentRetryAt?: string | null;
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

export interface MembershipEntryFeeSettingDto {
  entryFeeRub: number;
  entryFeeEnabled: boolean;
}

export interface PlanMeta {
  title: string;
  subtitle?: string;
  features: string[];
}

export interface TariffItem {
  id: string;
  code: string;
  title: string;
  priceRub: number;
  periodDays: number;
  isFeatured: boolean;
  segment: 'women' | 'men' | 'family';
  planMeta: PlanMeta;
}
