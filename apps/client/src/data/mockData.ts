import { mockMasters } from '@/entities/master/model/mock';
import { mockServices } from '@/entities/service/model/mock';
import { mockStudios } from '@/entities/studio/model/mock';
import type { Master, Service, Studio, SubscriptionPlan, User } from '@/types';

export const demoUsers: Array<User & { password: string }> = [
  {
    id: 'user-demo',
    name: 'Тестовый пользователь',
    email: 'user@test.ru',
    phone: '+7 (999) 111-22-33',
    role: 'client',
    password: 'user123',
    createdAt: '2026-05-01T09:00:00.000Z',
  },
  {
    id: 'admin-demo',
    name: 'Администратор клуба',
    email: 'admin@test.ru',
    phone: '+7 (999) 555-77-99',
    role: 'admin',
    password: 'admin123',
    createdAt: '2026-05-01T09:05:00.000Z',
  },
];

export const demoServices = mockServices as Service[];
export const demoStudios = mockStudios as Studio[];
export const demoMasters = mockMasters as Master[];

export const demoSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-basic',
    code: 'BASIC',
    name: 'Lady',
    priceRub: 5900,
    periodDays: 30,
    includedVisits: 2,
    discountPercent: 10,
    description: 'Базовая клубная подписка для регулярного ухода.',
    type: 'individual',
  },
  {
    id: 'plan-plus',
    code: 'PLUS',
    name: 'Lady Super',
    priceRub: 8900,
    periodDays: 30,
    includedVisits: 4,
    discountPercent: 20,
    description: 'Оптимальный формат для еженедельных процедур.',
    type: 'individual',
  },
  {
    id: 'plan-family',
    code: 'FAMILY',
    name: 'Семейный Super',
    priceRub: 12900,
    periodDays: 30,
    includedVisits: 6,
    discountPercent: 30,
    description: 'Семейный тариф с общим балансом посещений.',
    type: 'family',
  },
  {
    id: 'mister',
    code: 'MISTER',
    name: 'Mister',
    priceRub: 6100,
    periodDays: 30,
    includedVisits: 2,
    discountPercent: 10,
    description: 'Индивидуальный тариф для восстановления после нагрузок.',
    type: 'individual',
  },
  {
    id: 'mister-super',
    code: 'MISTER_SUPER',
    name: 'Mister Super',
    priceRub: 9200,
    periodDays: 30,
    includedVisits: 4,
    discountPercent: 20,
    description: 'Расширенная подписка с повышенной выгодой.',
    type: 'individual',
  },
];

export const demoTimeSlots = ['10:00', '11:30', '13:00', '15:00', '16:30', '18:00', '19:30'];
