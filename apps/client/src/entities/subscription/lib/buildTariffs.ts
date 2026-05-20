import type { PlanMeta, SubscriptionPlanDto, TariffItem } from '../model/types';

function createPlanMeta(plan: SubscriptionPlanDto): PlanMeta {
  return {
    title: plan.name,
    subtitle: plan.code.replace(/_/g, ' '),
    features: [
      `${plan.includedCredits} визита включено`,
      `Скидка ${plan.discountPercent}% на все услуги вне пакета`,
      plan.familyMembersLimit > 1 ? `До ${plan.familyMembersLimit} членов семьи` : 'Для одного участника',
      plan.description?.trim() || 'Подходит для регулярных визитов и автоматического применения выгод.',
    ],
  };
}

export function buildTariffs(plans: SubscriptionPlanDto[]): TariffItem[] {
  return plans.map((plan) => ({
    id: plan.id,
    title: plan.name,
    priceRub: plan.monthlyPriceRub,
    isFeatured: plan.discountPercent >= 30 || plan.includedCredits >= 5,
    planMeta: createPlanMeta(plan),
  }));
}
