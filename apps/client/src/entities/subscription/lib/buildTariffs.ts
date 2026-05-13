import type { PlanMeta, SubscriptionPlanDto, TariffItem } from '../model/types';

const planTitles = ['Lady', 'Lady Super', 'Family Super'];

function createPlanMeta(plan: SubscriptionPlanDto, index: number): PlanMeta {
  const title = planTitles[index] ?? plan.name;

  return {
    title,
    subtitle: `до ${plan.discountPercent}% на услуги`,
    features: [
      `${plan.includedCredits} посещения`,
      `Скидка ${plan.discountPercent}% на услуги`,
      'Скидка 20% на сертификаты',
    ],
  };
}

const fallbackTariffs: TariffItem[] = [
  {
    id: 'lady',
    title: 'Lady',
    priceRub: 2490,
    planMeta: {
      title: 'Lady',
      subtitle: 'до 20% на услуги',
      features: ['1 посещение', 'Скидка 20% на услуги', 'Скидка 10% на сертификаты'],
    },
  },
  {
    id: 'lady-super',
    title: 'Lady Super',
    priceRub: 4490,
    planMeta: {
      title: 'Lady Super',
      subtitle: 'до 30% на услуги',
      features: ['2 посещения', 'Скидка 30% на услуги', 'Скидка 20% на сертификаты'],
    },
  },
  {
    id: 'family-super',
    title: 'Family Super',
    priceRub: 8400,
    planMeta: {
      title: 'Family Super',
      subtitle: 'до 30% на услуги',
      features: ['4 посещения', 'Скидка 30% на услуги', 'Скидка 20% на сертификаты'],
    },
  },
];

export function buildTariffs(plans: SubscriptionPlanDto[]): TariffItem[] {
  const base = (plans.length > 0 ? plans.slice(0, 3) : fallbackTariffs).map((plan, index) => {
    if ('planMeta' in plan) {
      return plan;
    }

    const planMeta = createPlanMeta(plan, index);
    return {
      id: plan.id,
      title: planMeta.title,
      priceRub: plan.monthlyPriceRub,
      planMeta,
    };
  });

  const misterBase = base[0] ?? fallbackTariffs[0];
  const misterSuperBase = base[1] ?? fallbackTariffs[1];

  return [
    ...base,
    {
      id: 'mister',
      title: 'Mister',
      priceRub: Math.round(misterBase.priceRub * 1.04),
      planMeta: {
        title: 'Mister',
        subtitle: 'до 20% на услуги',
        features: ['1 посещение', 'Скидка 20% на услуги', 'Скидка 10% на сертификаты'],
      },
    },
    {
      id: 'mister-super',
      title: 'Mister Super',
      priceRub: Math.round(misterSuperBase.priceRub * 1.03),
      planMeta: {
        title: 'Mister Super',
        subtitle: 'до 30% на услуги',
        features: ['2 посещения', 'Скидка 30% на услуги', 'Скидка 20% на сертификаты'],
      },
    },
  ];
}
