import type { SubscriptionPlanDto } from './types';

export const mockSubscriptionPlans: SubscriptionPlanDto[] = [
  {
    id: 'plan-basic',
    code: 'BASIC',
    name: 'Lady',
    monthlyPriceRub: 5900,
    discountPercent: 10,
    includedCredits: 2,
  },
  {
    id: 'plan-plus',
    code: 'PLUS',
    name: 'Lady Super',
    monthlyPriceRub: 8900,
    discountPercent: 20,
    includedCredits: 4,
  },
  {
    id: 'plan-family',
    code: 'FAMILY',
    name: 'Семейный Super',
    monthlyPriceRub: 12900,
    discountPercent: 30,
    includedCredits: 6,
  },
];
