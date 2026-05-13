import type { ServiceCardModel, ServiceDto, ServiceTone } from '../model/types';

const serviceTones: ServiceTone[] = ['massage', 'care', 'spa', 'neutral'];
const serviceLabels = ['Массаж', 'Уход', 'SPA', 'Процедура'];

export function createServiceCardModel(service: ServiceDto, index: number): ServiceCardModel {
  const tone = serviceTones[index % serviceTones.length];
  const categoryLabel = serviceLabels[index % serviceLabels.length];

  return {
    ...service,
    tone,
    categoryLabel,
    oldPriceRub: Math.round(service.priceRub * 1.25),
    badgeText: `${service.durationMinutes} мин`,
  };
}
