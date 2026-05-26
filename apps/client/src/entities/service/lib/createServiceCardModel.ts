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

  return toReadableCategory(service.category?.name ?? 'Услуга');
}

function toReadableCategory(value: string) {
  return value
    .toLocaleLowerCase('ru-RU')
    .replace(/(^|\s|-)./gu, (match) => match.toLocaleUpperCase('ru-RU'));
}

export function createServiceCardModel(service: ServiceDto): ServiceCardModel {
  return {
    ...service,
    categoryLabel: getCategoryLabel(service),
    badgeText: `${service.durationMinutes} мин`,
  };
}
