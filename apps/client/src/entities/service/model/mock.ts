import type { ServiceDto } from './types';

const massageCategory = {
  id: 'cat-massage',
  name: 'Массаж',
  slug: 'massage',
};

const spaCategory = {
  id: 'cat-spa',
  name: 'SPA-программы',
  slug: 'spa-programs',
};

export const mockServices: ServiceDto[] = [
  {
    id: 'svc-relax-classic',
    title: 'Классический расслабляющий массаж',
    slug: 'klassicheskii-rasslablyayushchii-massazh',
    description: 'Мягкая техника для снятия напряжения, восстановления сна и общего тонуса.',
    durationMinutes: 60,
    priceRub: 3500,
    category: massageCategory,
  },
  {
    id: 'svc-sport-back',
    title: 'Спортивный массаж спины',
    slug: 'sportivnyi-massazh-spiny',
    description: 'Интенсивная проработка мышц спины и шейно-воротниковой зоны после нагрузок.',
    durationMinutes: 50,
    priceRub: 3900,
    category: massageCategory,
  },
  {
    id: 'svc-lymph-drain',
    title: 'Лимфодренажный массаж',
    slug: 'limfodrenazhnyi-massazh',
    description: 'Техника для уменьшения отечности, улучшения микроциркуляции и легкости в теле.',
    durationMinutes: 75,
    priceRub: 4200,
    category: massageCategory,
  },
  {
    id: 'svc-spa-ritual',
    title: 'SPA-ритуал антистресс',
    slug: 'spa-ritual-antistress',
    description: 'Комплекс с аромамаслами и уходом для глубокого расслабления и восстановления.',
    durationMinutes: 90,
    priceRub: 5100,
    category: spaCategory,
  },
];

export function getMockServiceById(id: string): ServiceDto | undefined {
  return mockServices.find((service) => service.id === id || service.slug === id);
}
