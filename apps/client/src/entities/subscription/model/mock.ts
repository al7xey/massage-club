import type { SubscriptionPlanDto } from './types';

export const mockSubscriptionPlans: SubscriptionPlanDto[] = [
  {
    id: 'plan-lady',
    code: 'LADY',
    name: 'ЛЕДИ',
    description: 'Fallback only for isolated component tests.',
    monthlyPriceRub: 2490,
    periodDays: 30,
    discountPercent: 20,
    certificateDiscountPercent: 10,
    includedCredits: 1,
    includedDescription: '1 любой массаж 60 мин или 1 фирменная процедура ухода за лицом',
    freezeCountPerYear: 1,
    freezeDays: 30,
    familyMembersLimit: 1,
  },
];
