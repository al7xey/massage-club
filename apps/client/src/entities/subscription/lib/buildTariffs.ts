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
  return {
    title: getSubscriptionPlanTitle(plan.code, plan.name),
    subtitle: `${plan.monthlyPriceRub.toLocaleString('ru-RU')} ₽ / месяц`,
    features: [
      `${plan.includedCredits} ${getVisitWord(plan.includedCredits)} в месяц`,
      `Скидка ${plan.discountPercent}%`,
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

function getVisitWord(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'визит';
  }

  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'визита';
  }

  return 'визитов';
}
