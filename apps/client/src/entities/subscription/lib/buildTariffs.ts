import { formatServiceCount } from '@/shared/lib/text/formatServiceCount';
import type { PlanMeta, SubscriptionPlanDto, TariffItem } from '../model/types';
import { getSubscriptionPlanSortIndex, getSubscriptionPlanTitle } from './getSubscriptionPlanTitle';

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
  const includedDescription = normalizeIncludedDescription(plan.includedDescription?.trim());
  const periodDays = getDisplayedPeriodDays(plan.periodDays);

  return {
    title: getSubscriptionPlanTitle(plan.code, plan.name),
    subtitle: `${plan.monthlyPriceRub.toLocaleString('ru-RU')} ₽ за ${periodDays} дней`,
    features: [
      includedDescription || `Включено ${formatServiceCount(plan.includedCredits)}`,
      `Услуги дешевле на ${plan.discountPercent}%`,
      `Сертификаты дешевле на ${plan.certificateDiscountPercent}%`,
      plan.freezeCountPerYear > 0
        ? `Заморозка: ${plan.freezeCountPerYear} раз(а) до ${plan.freezeDays} дней`
        : 'Без заморозки',
      plan.familyMembersLimit > 1 ? `До ${plan.familyMembersLimit} участников` : 'Для одного участника',
    ],
  };
}

export function buildTariffs(plans: SubscriptionPlanDto[]): TariffItem[] {
  return [...plans]
    .sort((left, right) => getSubscriptionPlanSortIndex(left.code) - getSubscriptionPlanSortIndex(right.code))
    .map((plan) => ({
      id: plan.id,
      code: plan.code,
      title: getSubscriptionPlanTitle(plan.code, plan.name),
      priceRub: plan.monthlyPriceRub,
      periodDays: getDisplayedPeriodDays(plan.periodDays),
      isFeatured: plan.discountPercent >= 30,
      segment: getSegment(plan.code),
      planMeta: createPlanMeta(plan),
    }));
}

function getDisplayedPeriodDays(periodDays?: number) {
  return periodDays && periodDays > 0 ? Math.min(periodDays, 30) : 30;
}

function normalizeIncludedDescription(description?: string) {
  return description?.replace(/фирменная процедура ухода за лицом/gi, 'процедура ухода за лицом');
}
