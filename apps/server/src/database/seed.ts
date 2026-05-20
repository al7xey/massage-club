import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { UserRole } from '@massage/shared';
import { hash } from 'bcryptjs';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { normalizePhone } from '../common/utils/normalize-contact.util';
import { SystemSetting } from '../modules/admin/entities/system-setting.entity';
import { GiftCertificate } from '../modules/gift-certificates/entities/gift-certificate.entity';
import { MasterShift } from '../modules/masters/entities/master-shift.entity';
import { Master } from '../modules/masters/entities/master.entity';
import { Payment, PaymentStatus } from '../modules/payments/entities/payment.entity';
import { ServiceCategory } from '../modules/services/entities/service-category.entity';
import { Service } from '../modules/services/entities/service.entity';
import { Studio } from '../modules/studios/entities/studio.entity';
import { SubscriptionPlan } from '../modules/subscription-plans/entities/subscription-plan.entity';
import { SubscriptionCredit } from '../modules/subscriptions/entities/subscription-credit.entity';
import { Subscription, SubscriptionStatus } from '../modules/subscriptions/entities/subscription.entity';
import { User } from '../modules/users/entities/user.entity';

interface ServiceSeed {
  categorySlug: string;
  title: string;
  priceRub: number;
  durationLabel: string;
  durationMinutes: number;
  composition?: string;
}

async function findOrCreate<T extends { id: string }>(
  repository: Repository<T>,
  where: Partial<T>,
  factory: () => Partial<T>,
): Promise<T> {
  const existing = await repository.findOne({ where: where as never });
  if (existing) {
    Object.assign(existing, factory());
    return repository.save(existing);
  }
  const entity = repository.create(factory() as never) as unknown as T;
  return (await repository.save(entity as never)) as unknown as T;
}

const categorySeeds = [
  ['spa-programs', 'СПА ПРОГРАММЫ', 'SPA-ритуалы и комплексные программы ухода.'],
  ['massage', 'МАССАЖ', 'Классические, расслабляющие и восстановительные массажи.'],
  ['massage-men', 'МАССАЖ ДЛЯ МУЖЧИН', 'Массажные услуги для мужчин.'],
  ['body-correction-wraps', 'КОРРЕКЦИЯ ФИГУРЫ/ОБЕРТЫВАНИЯ', 'Коррекция фигуры и обертывания.'],
  ['face-care', 'УХОДЫ ЗА ЛИЦОМ', 'Уходовые процедуры и массажи лица.'],
  ['laser-hair-removal', 'ЛАЗЕРНАЯ ЭПИЛЯЦИЯ', 'Лазерная эпиляция по зонам.'],
] as const;

const serviceSeeds: ServiceSeed[] = [
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Новогодний эксклюзив"',
    priceRub: 10000,
    durationLabel: '20; 10; 30; 10...',
    durationMinutes: 70,
    composition: 'кедровая фитосауна; теплый душ; солевое скрабирование с маслом манго; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Зимняя сказка"',
    priceRub: 8000,
    durationLabel: '20; 10; 60; 60...',
    durationMinutes: 150,
    composition: 'кедровая фитосауна; теплый душ; классический массаж всего тела; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Отдохни!"',
    priceRub: 3400,
    durationLabel: '60; 20; 10/ 90',
    durationMinutes: 90,
    composition: 'массаж всего тела; массаж головы; фиточай',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Я люблю тебя мама!"',
    priceRub: 6000,
    durationLabel: '20; 10; 60; 60...',
    durationMinutes: 150,
    composition: 'кедровая фитосауна; теплый душ; классический массаж всего тела; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Энергия моря"',
    priceRub: 3400,
    durationLabel: '60; 10; 20; 10/ 100',
    durationMinutes: 100,
    composition: 'солевое скрабирование с экстрактом манго; теплый душ; расслабляющий массаж головы; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "НОВАЯ Я!"',
    priceRub: 4300,
    durationLabel: '20; 10; 60; 20...',
    durationMinutes: 110,
    composition: 'кедровая фитосауна; теплый душ; классический массаж всего тела; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Расцветай!"',
    priceRub: 5900,
    durationLabel: '20; 10; 60; 60...',
    durationMinutes: 150,
    composition: 'кедровая фитосауна; теплый душ; расслабляющий массаж всего тела; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Кедровый релакс"',
    priceRub: 4300,
    durationLabel: '20; 10; 60; 20...',
    durationMinutes: 110,
    composition: 'кедровая фитосауна; теплый душ; расслабляющий массаж всего тела; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Relax Beauty"',
    priceRub: 5000,
    durationLabel: '60; 60; 20/ 140',
    durationMinutes: 140,
    composition: 'классический массаж всего тела; пластический и букальный массаж лица + лифтинговая маска для лица Levissime; фиточай',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Антистресс"',
    priceRub: 2200,
    durationLabel: '20; 10; 30; 10/ 70',
    durationMinutes: 70,
    composition: 'кедровая фитосауна; теплый душ; массаж спины; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Шоколадное наслаждение"',
    priceRub: 5400,
    durationLabel: '20; 10; 30; 10...',
    durationMinutes: 70,
    composition: 'кедровая фитосауна; теплый душ; кофейно-шоколадное скрабирование всего тела; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Апельсиновый джаз"',
    priceRub: 7200,
    durationLabel: '20; 10; 60; 60...',
    durationMinutes: 150,
    composition: 'кедровая фитосауна; теплый душ; расслабляющий массаж всего тела; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Для самой прекрасной"',
    priceRub: 6000,
    durationLabel: '20; 10; 60; 60...',
    durationMinutes: 150,
    composition: 'кедровая фитосауна; теплый душ; расслабляющий массаж всего тела; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Экспресс-восстановление"',
    priceRub: 3400,
    durationLabel: '20; 20; 10; 30...',
    durationMinutes: 80,
    composition: 'седативный массаж головы; кедровая фитосауна; теплый душ; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Сияй!"',
    priceRub: 10000,
    durationLabel: '20; 10; 30; 10...',
    durationMinutes: 70,
    composition: 'кедровая фитосауна; теплый душ; солевое скрабирование с маслом манго; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Совершенство"',
    priceRub: 4700,
    durationLabel: '20; 10; 60; 60...',
    durationMinutes: 150,
    composition: 'кедровая фитосауна; теплый душ; лимфодренажный массаж всего тела; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "NEW BODY"',
    priceRub: 3400,
    durationLabel: '20; 10; 60; 10/ 100',
    durationMinutes: 100,
    composition: 'кедровая фитосауна; теплый душ; солевое скрабирование с маслом манго; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Пробуждение"',
    priceRub: 5200,
    durationLabel: '60; 60; 20/ 140',
    durationMinutes: 140,
    composition: 'оздоровительный массаж всего тела; программа экспресс-омоложения лица, декольте и шеи "Энергия витамина С"; фиточай',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Зимнее СПА"',
    priceRub: 7200,
    durationLabel: '20; 10; 60; 60...',
    durationMinutes: 150,
    composition: 'кедровая фитосауна; теплый душ; расслабляющий массаж всего тела; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Преображение"',
    priceRub: 6800,
    durationLabel: '20; 10; 60; 60...',
    durationMinutes: 150,
    composition: 'кедровая фитосауна; теплый душ; классический массаж всего тела; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Сила кедра"',
    priceRub: 3400,
    durationLabel: '20; 10; 60; 10/ 100',
    durationMinutes: 100,
    composition: 'кедровая фитосауна; теплый душ; оздоравливающий массаж всего тела; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Антистресс" для мужчин',
    priceRub: 2500,
    durationLabel: '20; 10; 30; 10/ 70',
    durationMinutes: 70,
    composition: 'кедровая фитосауна; теплый душ; массаж спины; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Отдохни!" для мужчин',
    priceRub: 4000,
    durationLabel: '60; 20; 10/ 90',
    durationMinutes: 90,
    composition: 'массаж всего тела; массаж головы; фиточай',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Кедровый релакс" для мужчин',
    priceRub: 4900,
    durationLabel: '20; 10; 60; 20...',
    durationMinutes: 110,
    composition: 'кедровая фитосауна; теплый душ; расслабляющий массаж всего тела; ...',
  },
  {
    categorySlug: 'spa-programs',
    title: 'СПА-программа "Сила кедра" для мужчин',
    priceRub: 3900,
    durationLabel: '20; 10; 60; 10/ 100',
    durationMinutes: 100,
    composition: 'кедровая фитосауна; теплый душ; оздоравливающий массаж всего тела; ...',
  },
  ...[
    ['Классический', 2500, 60],
    ['Лимфодреннажный', 2500, 60],
    ['Антицеллюлитный', 2500, 60],
    ['Расслабляющий', 2500, 60],
    ['Солевой', 2500, 60],
    ['Бразильский', 2500, 60],
    ['Миофасциальный', 2500, 60],
    ['Power (силовой)', 2500, 60],
    ['Медовый', 2500, 60],
    ['Массаж спины', 1300, 30],
    ['Оздоровительный массаж спины и шейно-воротниковой зоны', 2500, 60],
    ['Массаж головы', 900, 20],
    ['Массаж стоп', 900, 20],
    ['Интегрированная система мануальной коррекции тела "Лепка"', 3700, 90],
    ['Седативный массаж головы', 1200, 20],
  ].map(([title, priceRub, durationMinutes]) => ({
    categorySlug: 'massage',
    title: String(title),
    priceRub: Number(priceRub),
    durationLabel: String(durationMinutes),
    durationMinutes: Number(durationMinutes),
  })),
  ...[
    ['Классический, 60 мин', 3000, 60],
    ['Классический, 90 мин', 4500, 90],
    ['Power (силовой)', 3000, 60],
    ['Расслабляющий', 3000, 60],
    ['Оздоровительный массаж спины и ШВЗ, 30 мин', 1600, 30],
    ['Оздоровительный массаж спины и ШВЗ, 60 мин', 3000, 60],
    ['Массаж головы', 1000, 20],
    ['Массаж стоп', 1000, 20],
  ].map(([title, priceRub, durationMinutes]) => ({
    categorySlug: 'massage-men',
    title: String(title),
    priceRub: Number(priceRub),
    durationLabel: String(durationMinutes),
    durationMinutes: Number(durationMinutes),
  })),
  {
    categorySlug: 'body-correction-wraps',
    title: 'Виски пеленание (всё тело)',
    priceRub: 3800,
    durationLabel: '60; 60; 10/ 130',
    durationMinutes: 130,
    composition: 'классический массаж всего тела; виски-пеленание Styx с лосьоном Neroli; фиточай',
  },
  {
    categorySlug: 'body-correction-wraps',
    title: 'Обертывание STYX в эластичном костюме',
    priceRub: 3800,
    durationLabel: '60; 60; 10/ 130',
    durationMinutes: 130,
    composition: 'классический массаж всего тела; виски-пеленание Styx с лосьоном Neroli; фиточай',
  },
  {
    categorySlug: 'body-correction-wraps',
    title: 'Cello-gel обертывание (всё тело)',
    priceRub: 3800,
    durationLabel: '60; 60; 10/ 130',
    durationMinutes: 130,
    composition: 'классический массаж всего тела; Cello-gel обертывание; фиточай',
  },
  ...[
    ['Массаж лица', 2500, 60],
    ['Пластический (букальный) массаж лица', 2500, 60],
    ['Пилинг лица всесезонный на косметике ELDERMAFILL', 2600, 60],
    ['Комбинированная чистка лица на косметике LEVISSIME', 2600, 120],
    ['Пиллинг BTX', 2700, 60],
    ['Экстренное омоложение лица "Энергия витамина С"', 2700, 60],
  ].map(([title, priceRub, durationMinutes]) => ({
    categorySlug: 'face-care',
    title: String(title),
    priceRub: Number(priceRub),
    durationLabel: String(durationMinutes),
    durationMinutes: Number(durationMinutes),
  })),
  {
    categorySlug: 'laser-hair-removal',
    title: 'Бикини: Глубокое',
    priceRub: 1500,
    durationLabel: '20',
    durationMinutes: 20,
    composition: 'Лазерная эпиляция: глубокое бикини.',
  },
  {
    categorySlug: 'laser-hair-removal',
    title: 'Бикини: Классическое',
    priceRub: 1000,
    durationLabel: '15',
    durationMinutes: 15,
    composition: 'Лазерная эпиляция: классическое бикини.',
  },
  {
    categorySlug: 'laser-hair-removal',
    title: 'Бикини: Межъягодичная зона',
    priceRub: 800,
    durationLabel: '10',
    durationMinutes: 10,
    composition: 'Лазерная эпиляция: межъягодичная зона.',
  },
  {
    categorySlug: 'laser-hair-removal',
    title: 'Все тело',
    priceRub: 5500,
    durationLabel: '60',
    durationMinutes: 60,
    composition: 'Лазерная эпиляция: ноги полностью, глубокое бикини, подмышки, малая зона.',
  },
  {
    categorySlug: 'laser-hair-removal',
    title: 'Все тело + руки',
    priceRub: 6000,
    durationLabel: '60',
    durationMinutes: 60,
    composition: 'Лазерная эпиляция: руки полностью, ноги полностью, глубокое бикини, подмышки, малая зона.',
  },
  {
    categorySlug: 'laser-hair-removal',
    title: 'Лицо и шея: Лицо полностью',
    priceRub: 2500,
    durationLabel: '30',
    durationMinutes: 30,
    composition: 'Лазерная эпиляция: лицо полностью.',
  },
  {
    categorySlug: 'laser-hair-removal',
    title: 'Лицо и шея: Малая зона',
    priceRub: 900,
    durationLabel: '10',
    durationMinutes: 10,
    composition: 'Лазерная эпиляция: верхняя губа или подбородок.',
  },
  {
    categorySlug: 'laser-hair-removal',
    title: 'Лицо и шея: Шея',
    priceRub: 1100,
    durationLabel: '20',
    durationMinutes: 20,
    composition: 'Лазерная эпиляция: передняя или задняя поверхность шеи.',
  },
  {
    categorySlug: 'laser-hair-removal',
    title: 'Ноги: Бедра полностью',
    priceRub: 2000,
    durationLabel: '30',
    durationMinutes: 30,
    composition: 'Лазерная эпиляция: бедра полностью.',
  },
  {
    categorySlug: 'laser-hair-removal',
    title: 'Ноги: Голени с коленями',
    priceRub: 1900,
    durationLabel: '30',
    durationMinutes: 30,
    composition: 'Лазерная эпиляция: голени с коленями.',
  },
  {
    categorySlug: 'laser-hair-removal',
    title: 'Ноги: Полностью',
    priceRub: 3500,
    durationLabel: '45',
    durationMinutes: 45,
    composition: 'Лазерная эпиляция: ноги полностью.',
  },
  {
    categorySlug: 'laser-hair-removal',
    title: 'Руки: Кисти рук',
    priceRub: 900,
    durationLabel: '15',
    durationMinutes: 15,
    composition: 'Лазерная эпиляция: кисти рук.',
  },
  {
    categorySlug: 'laser-hair-removal',
    title: 'Руки: Подмышки',
    priceRub: 1000,
    durationLabel: '15',
    durationMinutes: 15,
    composition: 'Лазерная эпиляция: подмышки.',
  },
  {
    categorySlug: 'laser-hair-removal',
    title: 'Туловище: Ареолы',
    priceRub: 480,
    durationLabel: '10',
    durationMinutes: 10,
    composition: 'Лазерная эпиляция: ареолы.',
  },
  {
    categorySlug: 'laser-hair-removal',
    title: 'Туловище: Живот полностью',
    priceRub: 1080,
    durationLabel: '20',
    durationMinutes: 20,
    composition: 'Лазерная эпиляция: живот полностью.',
  },
];

const planSeeds = [
  {
    code: 'LADY',
    name: 'ЛЕДИ',
    monthlyPriceRub: 2490,
    discountPercent: 20,
    certificateDiscountPercent: 10,
    includedCredits: 1,
    includedDescription: '1 любой массаж 60 мин или 1 фирменная процедура ухода за лицом',
    freezeCountPerYear: 1,
    freezeDays: 30,
    familyMembersLimit: 1,
  },
  {
    code: 'LADY_SUPER',
    name: 'ЛЕДИ СУПЕР',
    monthlyPriceRub: 4490,
    discountPercent: 30,
    certificateDiscountPercent: 20,
    includedCredits: 2,
    includedDescription: '2 услуги на выбор: массажи 60 мин или уход за лицом',
    freezeCountPerYear: 2,
    freezeDays: 30,
    familyMembersLimit: 1,
  },
  {
    code: 'MISTER',
    name: 'МИСТЕР',
    monthlyPriceRub: 2990,
    discountPercent: 20,
    certificateDiscountPercent: 10,
    includedCredits: 1,
    includedDescription: '1 любой массаж для мужчин 60 мин',
    freezeCountPerYear: 1,
    freezeDays: 30,
    familyMembersLimit: 1,
  },
  {
    code: 'MISTER_SUPER',
    name: 'МИСТЕР СУПЕР',
    monthlyPriceRub: 5390,
    discountPercent: 30,
    certificateDiscountPercent: 20,
    includedCredits: 2,
    includedDescription: '2 любых массажа для мужчин по 60 мин',
    freezeCountPerYear: 2,
    freezeDays: 30,
    familyMembersLimit: 1,
  },
  {
    code: 'FAMILY',
    name: 'СЕМЕЙНЫЙ',
    monthlyPriceRub: 4700,
    discountPercent: 20,
    certificateDiscountPercent: 10,
    includedCredits: 2,
    includedDescription: '2 участника: по 1 услуге каждому',
    freezeCountPerYear: 1,
    freezeDays: 30,
    familyMembersLimit: 2,
  },
  {
    code: 'FAMILY_SUPER',
    name: 'СЕМЕЙНЫЙ СУПЕР',
    monthlyPriceRub: 8400,
    discountPercent: 30,
    certificateDiscountPercent: 20,
    includedCredits: 4,
    includedDescription: '4 участника: по 1 услуге каждому',
    freezeCountPerYear: 2,
    freezeDays: 30,
    familyMembersLimit: 4,
  },
] as const;

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const dataSource = app.get(DataSource);

  const users = dataSource.getRepository(User);
  const studios = dataSource.getRepository(Studio);
  const categories = dataSource.getRepository(ServiceCategory);
  const services = dataSource.getRepository(Service);
  const masters = dataSource.getRepository(Master);
  const shifts = dataSource.getRepository(MasterShift);
  const plans = dataSource.getRepository(SubscriptionPlan);
  const subscriptions = dataSource.getRepository(Subscription);
  const subscriptionCredits = dataSource.getRepository(SubscriptionCredit);
  const certificates = dataSource.getRepository(GiftCertificate);
  const payments = dataSource.getRepository(Payment);
  const settings = dataSource.getRepository(SystemSetting);

  const passwordHash = await hash('password123', 10);
  const userTestPasswordHash = await hash('user123', 10);
  const adminTestPasswordHash = await hash('admin123', 10);

  await findOrCreate(users, { email: 'client@example.com' } as Partial<User>, () => ({
    email: 'client@example.com',
    passwordHash,
    fullName: 'Анна Клиентова',
    phone: normalizePhone('+79990000001'),
    role: UserRole.CLIENT,
    isActive: true,
  }));

  await findOrCreate(users, { email: 'user@test.ru' } as Partial<User>, () => ({
    email: 'user@test.ru',
    passwordHash: userTestPasswordHash,
    fullName: 'Тестовый Пользователь',
    phone: normalizePhone('+79991112233'),
    role: UserRole.CLIENT,
    isActive: true,
  }));

  await findOrCreate(users, { email: 'admin@example.com' } as Partial<User>, () => ({
    email: 'admin@example.com',
    passwordHash,
    fullName: 'Ольга Администратор',
    phone: normalizePhone('+79990000002'),
    role: UserRole.ADMIN,
    isActive: true,
  }));

  await findOrCreate(users, { email: 'admin@test.ru' } as Partial<User>, () => ({
    email: 'admin@test.ru',
    passwordHash: adminTestPasswordHash,
    fullName: 'Тестовый Администратор',
    phone: normalizePhone('+79995557799'),
    role: UserRole.ADMIN,
    isActive: true,
  }));

  await findOrCreate(users, { email: 'superadmin@example.com' } as Partial<User>, () => ({
    email: 'superadmin@example.com',
    passwordHash,
    fullName: 'Ирина Супервайзер',
    phone: normalizePhone('+79990000003'),
    role: UserRole.SUPER_ADMIN,
    isActive: true,
  }));

  const studioCenter = await findOrCreate(studios, { name: 'Massage Club Центр' } as Partial<Studio>, () => ({
    name: 'Massage Club Центр',
    city: 'Москва',
    address: 'Тверская улица, 12',
    phone: '+74950000001',
    isActive: true,
  }));

  await findOrCreate(studios, { name: 'Massage Club Парк' } as Partial<Studio>, () => ({
    name: 'Massage Club Парк',
    city: 'Москва',
    address: 'Ленинский проспект, 45',
    phone: '+74950000002',
    isActive: true,
  }));

  const categoriesBySlug = new Map<string, ServiceCategory>();
  for (const [slug, name, description] of categorySeeds) {
    const category = await findOrCreate(categories, { slug } as Partial<ServiceCategory>, () => ({
      name,
      slug,
      description,
    }));
    categoriesBySlug.set(slug, category);
  }

  const savedServices: Service[] = [];
  const activeServiceSlugs: string[] = [];
  for (const [index, item] of serviceSeeds.entries()) {
    const category = categoriesBySlug.get(item.categorySlug);
    if (!category) {
      throw new Error(`Category not found for ${item.title}`);
    }

    const slug = `${item.categorySlug}-${slugify(item.title)}-${index + 1}`;
    activeServiceSlugs.push(slug);
    const service = await findOrCreate(services, { slug } as Partial<Service>, () => ({
      title: item.title,
      slug,
      description: item.composition || item.title,
      durationMinutes: item.durationMinutes,
      durationLabel: item.durationLabel,
      composition: item.composition,
      priceRub: item.priceRub,
      category,
      externalSource: 'seed',
      externalId: `${item.categorySlug}-${index + 1}`,
      isActive: true,
    }));
    savedServices.push(service);
  }

  await services
    .createQueryBuilder()
    .update(Service)
    .set({ isActive: false })
    .where('slug NOT IN (:...activeServiceSlugs)', { activeServiceSlugs })
    .execute();

  await masters.createQueryBuilder().update(Master).set({ isActive: false }).execute();

  for (const masterSeed of [
    ['Екатерина', 'Реснянская'],
    ['Фадиля', 'Каримова'],
    ['Ирина', 'Строкова', 'Александровна'],
    ['Анастасия', 'Афонина', 'Олеговна'],
  ] as const) {
    const [firstName, lastName, patronymic] = masterSeed;
    await findOrCreate(masters, { firstName, lastName } as Partial<Master>, () => ({
      firstName,
      lastName,
      bio: `${[firstName, patronymic, lastName].filter(Boolean).join(' ')}. Мастер массажа и SPA.`,
      studio: studioCenter,
      services: savedServices,
      isActive: true,
    }));
  }

  const firstMaster = await masters.findOneByOrFail({ firstName: 'Екатерина', lastName: 'Реснянская' });
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(18, 0, 0, 0);

  if ((await shifts.count()) === 0) {
    await shifts.save([
      shifts.create({ master: firstMaster, studio: studioCenter, startsAt: tomorrow, endsAt: tomorrowEnd, isAvailable: true }),
    ]);
  }

  for (const planSeed of planSeeds) {
    await findOrCreate(plans, { code: planSeed.code } as Partial<SubscriptionPlan>, () => ({
      ...planSeed,
      periodDays: 30,
      description: `Тариф ${planSeed.name}: ${planSeed.includedDescription}.`,
      isActive: true,
    }));
  }

  await findOrCreate(settings, { key: 'membershipEntryFee' } as Partial<SystemSetting>, () => ({
    key: 'membershipEntryFee',
    value: {
      entryFeeRub: 1200,
      entryFeeEnabled: false,
    },
  }));

  const demoPlan = await plans.findOneByOrFail({ code: 'LADY_SUPER' });
  const demoUser = await users.findOneByOrFail({ email: 'user@test.ru' });
  const activeStartsAt = new Date();
  activeStartsAt.setDate(activeStartsAt.getDate() - 3);
  const activeEndsAt = new Date(activeStartsAt);
  activeEndsAt.setDate(activeEndsAt.getDate() + demoPlan.periodDays);

  let demoSubscription = await subscriptions.findOne({
    where: {
      user: { id: demoUser.id },
      status: SubscriptionStatus.ACTIVE,
    },
    order: { createdAt: 'DESC' },
  });

  if (!demoSubscription) {
    demoSubscription = await subscriptions.save(
      subscriptions.create({
        user: demoUser,
        plan: demoPlan,
        status: SubscriptionStatus.ACTIVE,
        startsAt: activeStartsAt,
        endsAt: activeEndsAt,
        autoRenewalEnabled: true,
      }),
    );
  } else {
    demoSubscription.plan = demoPlan;
    demoSubscription.status = SubscriptionStatus.ACTIVE;
    demoSubscription.startsAt = activeStartsAt;
    demoSubscription.endsAt = activeEndsAt;
    demoSubscription.frozenUntil = undefined;
    demoSubscription.autoRenewalEnabled = true;
    demoSubscription.gracePeriodEndsAt = undefined;
    demoSubscription.nextPaymentRetryAt = undefined;
    demoSubscription = await subscriptions.save(demoSubscription);
  }

  const targetRemainingCredits = Math.max(1, demoPlan.includedCredits - 1);
  const existingCredit = await subscriptionCredits.findOne({
    where: { subscription: { id: demoSubscription.id } },
  });

  if (!existingCredit) {
    await subscriptionCredits.save(
      subscriptionCredits.create({
        subscription: demoSubscription,
        totalCredits: demoPlan.includedCredits,
        remainingCredits: targetRemainingCredits,
      }),
    );
  } else {
    existingCredit.totalCredits = demoPlan.includedCredits;
    existingCredit.remainingCredits = targetRemainingCredits;
    await subscriptionCredits.save(existingCredit);
  }

  const existingSubscriptionPayment = await payments.findOne({
    where: {
      user: { id: demoUser.id },
      purpose: `SUBSCRIPTION:${demoPlan.name}`,
      relatedEntityId: demoSubscription.id,
    },
  });

  if (!existingSubscriptionPayment) {
    await payments.save(
      payments.create({
        user: demoUser,
        amountRub: demoPlan.monthlyPriceRub,
        purpose: `SUBSCRIPTION:${demoPlan.name}`,
        relatedEntityId: demoSubscription.id,
        provider: 'mock',
        status: PaymentStatus.PAID,
      }),
    );
  }

  if (!(await certificates.findOne({ where: { code: 'GIFT-DEMO01' } }))) {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    await certificates.save(
      certificates.create({
        code: 'GIFT-DEMO01',
        recipientName: 'Демо Получатель',
        recipientContact: 'demo@example.com',
        amountRub: 5000,
        expiresAt,
      }),
    );
  }

  await app.close();
  console.log('Seed data created successfully. Demo logins: user@test.ru/user123, admin@test.ru/admin123.');
}

function slugify(value: string) {
  const dictionary: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ы: 'y',
    э: 'e',
    ю: 'yu',
    я: 'ya',
  };

  return value
    .toLowerCase()
    .replace(/[ъь]/g, '')
    .split('')
    .map((char) => dictionary[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
