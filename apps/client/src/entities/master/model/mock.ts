import type { ServiceDto } from '@/entities/service/@x/master';
import type { StudioDto } from '@/entities/studio/@x/master';
import type { MasterDto } from './types';

const centerStudio: StudioDto = {
  id: 'studio-center',
  name: 'Massage Club Центр',
  address: 'Астрахань, ул. Советская, 10',
  city: 'Астрахань',
  phone: '+7 (812) 44-10-10',
};

const parkStudio: StudioDto = {
  id: 'studio-park',
  name: 'Massage Club Парк',
  address: 'Астрахань, ул. Набережная, 23',
  city: 'Астрахань',
  phone: '+7 (812) 38-11-20',
};

const relaxMassage: ServiceDto = {
  id: 'svc-relax-classic',
  title: 'Классический расслабляющий массаж',
  slug: 'klassicheskii-rasslablyayushchii-massazh',
  description: 'Мягкая техника для снятия напряжения, восстановления сна и общего тонуса.',
  durationMinutes: 60,
  priceRub: 3500,
};

const sportMassage: ServiceDto = {
  id: 'svc-sport-back',
  title: 'Спортивный массаж спины',
  slug: 'sportivnyi-massazh-spiny',
  description: 'Интенсивная проработка мышц спины и шейно-воротниковой зоны после нагрузок.',
  durationMinutes: 50,
  priceRub: 3900,
};

const lymphDrainMassage: ServiceDto = {
  id: 'svc-lymph-drain',
  title: 'Лимфодренажный массаж',
  slug: 'limfodrenazhnyi-massazh',
  description: 'Техника для уменьшения отечности, улучшения микроциркуляции и легкости в теле.',
  durationMinutes: 75,
  priceRub: 4200,
};

const spaRitual: ServiceDto = {
  id: 'svc-spa-ritual',
  title: 'SPA-ритуал антистресс',
  slug: 'spa-ritual-antistress',
  description: 'Комплекс с аромамаслами и уходом для глубокого расслабления и восстановления.',
  durationMinutes: 90,
  priceRub: 5100,
};

export const mockMasters: MasterDto[] = [
  {
    id: 'master-elena',
    firstName: 'Елена',
    lastName: 'Смирнова',
    bio: 'Специалист по лимфодренажным и восстановительным техникам.',
    studio: centerStudio,
    services: [relaxMassage, lymphDrainMassage],
    isActive: true,
  },
  {
    id: 'master-roman',
    firstName: 'Роман',
    lastName: 'Петров',
    bio: 'Специалист по спортивному массажу и восстановлению после тренировок.',
    studio: parkStudio,
    services: [sportMassage, spaRitual],
    isActive: true,
  },
  {
    id: 'master-irina',
    firstName: 'Ирина',
    lastName: 'Климова',
    bio: 'Массажист-эстетист, работает с антистресс и SPA-программами.',
    studio: centerStudio,
    services: [relaxMassage, spaRitual],
    isActive: true,
  },
];
