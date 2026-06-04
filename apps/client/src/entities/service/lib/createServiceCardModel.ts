import type { ServiceCardModel, ServiceDto } from '../model/types';

function getCategoryLabel(service: ServiceDto): string {
  const slug = service.category?.slug;

  if (slug === 'body-correction-wraps') {
    return 'Коррекция фигуры';
  }

  if (slug === 'massage') {
    return 'Массаж для женщин';
  }

  if (slug === 'massage-men') {
    return 'Массаж для мужчин';
  }

  if (slug === 'spa-programs') {
    return 'СПА программа';
  }

  if (slug === 'face-care') {
    return 'Уход за лицом';
  }

  if (slug === 'laser-hair-removal') {
    return 'Лазерная эпиляция';
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
