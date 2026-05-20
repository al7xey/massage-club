import type { PlanMeta, SubscriptionPlanDto, TariffItem } from '../model/types';

const tariffOrder: Record<SubscriptionPlanDto['code'], number> = {
  LADY: 0,
  LADY_SUPER: 1,
  MISTER: 2,
  MISTER_SUPER: 3,
  FAMILY: 4,
  FAMILY_SUPER: 5,
};

function getSegment(code: string): TariffItem['segment'] {
  if (code.startsWith('MISTER')) {
    return 'men';
  }

  if (code.startsWith('FAMILY')) {
    return 'family';
  }

  return 'women';
}

function createPlanMeta(plan: SubscriptionPlanDto): PlanMeta {
  return {
    title: plan.name,
    subtitle: `${plan.monthlyPriceRub.toLocaleString('ru-RU')} ₽ / ${plan.periodDays} дней`,
    features: [
      plan.includedDescription?.trim() || `${plan.includedCredits} включенных услуги`,
      `Скидка ${plan.discountPercent}% на услуги вне пакета`,
      `Скидка ${plan.certificateDiscountPercent}% на сертификаты`,
      plan.freezeCountPerYear > 0
        ? `Заморозка ${plan.freezeCountPerYear} раз(а) в год до ${plan.freezeDays} дней`
        : 'Без заморозки',
      plan.familyMembersLimit > 1 ? `До ${plan.familyMembersLimit} участников` : 'Для одного участника',
    ],
  };
}

export function buildTariffs(plans: SubscriptionPlanDto[]): TariffItem[] {
  return [...plans]
    .sort((left, right) => (tariffOrder[left.code] ?? Number.MAX_SAFE_INTEGER) - (tariffOrder[right.code] ?? Number.MAX_SAFE_INTEGER))
    .map((plan) => ({
      id: plan.id,
      code: plan.code,
      title: plan.name,
      priceRub: plan.monthlyPriceRub,
      periodDays: plan.periodDays,
      isFeatured: plan.discountPercent >= 30,
      segment: getSegment(plan.code),
      planMeta: createPlanMeta(plan),
    }));
}
