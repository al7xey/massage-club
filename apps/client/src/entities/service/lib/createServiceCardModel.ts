import type { ServiceCardModel, ServiceDto } from '../model/types';

function getCategoryLabel(service: ServiceDto): string {
  const slug = service.category?.slug;

  if (slug === 'body-correction-wraps') {
    return 'КОРРЕКЦИЯ ФИГУРЫ';
  }

  return service.category?.name ?? 'Услуга';
}

export function createServiceCardModel(service: ServiceDto): ServiceCardModel {
  return {
    ...service,
    categoryLabel: getCategoryLabel(service),
    badgeText: `${service.durationMinutes} мин`,
  };
}
