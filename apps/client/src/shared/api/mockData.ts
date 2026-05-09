import type { MasterDto, ServiceDto, StudioDto, SubscriptionPlanDto } from '../types/domain';

export const mockServices: ServiceDto[] = [
  {
    id: 'svc-relax-classic',
    title: 'Классический расслабляющий массаж',
    slug: 'klassicheskii-rasslablyayushchii-massazh',
    description: 'Мягкая техника для снятия напряжения, восстановления сна и общего тонуса.',
    durationMinutes: 60,
    priceRub: 3500,
  },
  {
    id: 'svc-sport-back',
    title: 'Спортивный массаж спины',
    slug: 'sportivnyi-massazh-spiny',
    description: 'Интенсивная проработка мышц спины и шейно-воротниковой зоны после нагрузок.',
    durationMinutes: 50,
    priceRub: 3900,
  },
  {
    id: 'svc-lymph-drain',
    title: 'Лимфодренажный массаж',
    slug: 'limfodrenazhnyi-massazh',
    description: 'Техника для уменьшения отечности, улучшения микроциркуляции и легкости в теле.',
    durationMinutes: 75,
    priceRub: 4200,
  },
  {
    id: 'svc-spa-ritual',
    title: 'SPA-ритуал антистресс',
    slug: 'spa-ritual-antistress',
    description: 'Комплекс с аромамаслами и уходом для глубокого расслабления и восстановления.',
    durationMinutes: 90,
    priceRub: 5100,
  },
];

export const mockStudios: StudioDto[] = [
  {
    id: 'studio-center',
    name: 'Massage Club Центр',
    address: 'Астрахань, ул. Советская, 10',
    city: 'Астрахань',
    phone: '+7 (812) 44-10-10',
  },
  {
    id: 'studio-park',
    name: 'Massage Club Парк',
    address: 'Астрахань, ул. Набережная, 23',
    city: 'Астрахань',
    phone: '+7 (812) 38-11-20',
  },
];

export const mockMasters: MasterDto[] = [
  {
    id: 'master-elena',
    firstName: 'Елена',
    lastName: 'Смирнова',
    bio: 'Специалист по лимфодренажным и восстановительным техникам.',
    studio: mockStudios[0],
    services: [mockServices[0], mockServices[2]],
    isActive: true,
  },
  {
    id: 'master-roman',
    firstName: 'Роман',
    lastName: 'Петров',
    bio: 'Специалист по спортивному массажу и восстановлению после тренировок.',
    studio: mockStudios[1],
    services: [mockServices[1], mockServices[3]],
    isActive: true,
  },
  {
    id: 'master-irina',
    firstName: 'Ирина',
    lastName: 'Климова',
    bio: 'Массажист-эстетист, работает с антистресс и SPA-программами.',
    studio: mockStudios[0],
    services: [mockServices[0], mockServices[3]],
    isActive: true,
  },
];

export const mockSubscriptionPlans: SubscriptionPlanDto[] = [
  {
    id: 'plan-basic',
    code: 'BASIC',
    name: 'Lady',
    monthlyPriceRub: 5900,
    discountPercent: 10,
    includedCredits: 2,
  },
  {
    id: 'plan-plus',
    code: 'PLUS',
    name: 'Lady Super',
    monthlyPriceRub: 8900,
    discountPercent: 20,
    includedCredits: 4,
  },
  {
    id: 'plan-family',
    code: 'FAMILY',
    name: 'Семейный Super',
    monthlyPriceRub: 12900,
    discountPercent: 30,
    includedCredits: 6,
  },
];

export function getMockServiceById(id: string): ServiceDto | undefined {
  return mockServices.find((service) => service.id === id || service.slug === id);
}
