import type { ServiceCardModel, ServiceDto, ServiceTone } from '../model/types';

const serviceTones: ServiceTone[] = ['massage', 'care', 'spa', 'neutral'];
const serviceLabels = ['Массаж', 'Уход за лицом', 'SPA-программы', 'Коррекция фигуры'];
const serviceGoals = ['Расслабление', 'Для спины', 'Восстановление', 'Антистресс'];
const serviceStudios = ['Центральный филиал', 'Виктория Палас', 'На Набережной'];
const serviceBenefits = [
  'Снимает напряжение и помогает быстро восстановиться.',
  'Прорабатывает спину, плечи и шейно-воротниковую зону.',
  'Улучшает легкость тела и снижает ощущение усталости.',
  'Подходит для спокойного отдыха после плотного дня.',
];

export function createServiceCardModel(service: ServiceDto, index: number): ServiceCardModel {
  const tone = serviceTones[index % serviceTones.length];
  const categoryLabel = serviceLabels[index % serviceLabels.length];
  const rating = index % 3 === 0 ? 5 : 4.8 + (index % 2) * 0.1;

  return {
    ...service,
    tone,
    categoryLabel,
    goalLabel: serviceGoals[index % serviceGoals.length],
    studioLabel: serviceStudios[index % serviceStudios.length],
    rating,
    reviewCount: 38 + index * 17,
    isAvailableToday: index % 2 === 0,
    clubLabel: 'Клуб',
    benefit: serviceBenefits[index % serviceBenefits.length],
    oldPriceRub: Math.round(service.priceRub * 1.25),
    badgeText: `${service.durationMinutes} мин`,
  };
}
