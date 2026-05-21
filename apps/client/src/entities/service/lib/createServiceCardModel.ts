import type { ServiceCardModel, ServiceDto } from '../model/types';

function getCategoryLabel(service: ServiceDto): string {
  const slug = service.category?.slug;

  if (slug === 'body-correction-wraps') {
    return 'КОРРЕКЦИЯ ФИГУРЫ';
  }

  if (slug === 'massage') {
    return 'МАССАЖ ДЛЯ ЖЕНЩИН';
  }

  if (slug === 'massage-men') {
    return 'МАССАЖ ДЛЯ МУЖЧИН';
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
