import type { SubscriptionPlanDto } from './types';

export const mockSubscriptionPlans: SubscriptionPlanDto[] = [
  {
    id: 'plan-basic',
    code: 'BASIC',
    name: 'Lady',
    description: 'Базовый тариф для регулярного ухода.',
    monthlyPriceRub: 5900,
    discountPercent: 10,
    includedCredits: 2,
    familyMembersLimit: 1,
  },
  {
    id: 'plan-plus',
    code: 'PLUS',
    name: 'Lady Super',
    description: 'Расширенный тариф с большим пакетом визитов.',
    monthlyPriceRub: 8900,
    discountPercent: 20,
    includedCredits: 4,
    familyMembersLimit: 1,
  },
  {
    id: 'plan-family',
    code: 'FAMILY',
    name: 'Семейный Super',
    description: 'Семейный формат с увеличенным лимитом участников.',
    monthlyPriceRub: 12900,
    discountPercent: 30,
    includedCredits: 6,
    familyMembersLimit: 4,
  },
];
