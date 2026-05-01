import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { UserRole } from '@massage/shared';
import { hash } from 'bcryptjs';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { GiftCertificate } from '../modules/gift-certificates/entities/gift-certificate.entity';
import { MasterShift } from '../modules/masters/entities/master-shift.entity';
import { Master } from '../modules/masters/entities/master.entity';
import { ServiceCategory } from '../modules/services/entities/service-category.entity';
import { Service } from '../modules/services/entities/service.entity';
import { Studio } from '../modules/studios/entities/studio.entity';
import { SubscriptionPlan } from '../modules/subscription-plans/entities/subscription-plan.entity';
import { User } from '../modules/users/entities/user.entity';

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
  const certificates = dataSource.getRepository(GiftCertificate);

  const passwordHash = await hash('password123', 10);

  await findOrCreate(users, { email: 'client@example.com' } as Partial<User>, () => ({
    email: 'client@example.com',
    passwordHash,
    firstName: 'Анна',
    lastName: 'Клиентова',
    phone: '+79990000001',
    role: UserRole.CLIENT,
    isActive: true,
  }));

  await findOrCreate(users, { email: 'admin@example.com' } as Partial<User>, () => ({
    email: 'admin@example.com',
    passwordHash,
    firstName: 'Ольга',
    lastName: 'Администратор',
    phone: '+79990000002',
    role: UserRole.ADMIN,
    isActive: true,
  }));

  await findOrCreate(users, { email: 'superadmin@example.com' } as Partial<User>, () => ({
    email: 'superadmin@example.com',
    passwordHash,
    firstName: 'Ирина',
    lastName: 'Супервайзер',
    phone: '+79990000003',
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

  const studioPark = await findOrCreate(studios, { name: 'Massage Club Парк' } as Partial<Studio>, () => ({
    name: 'Massage Club Парк',
    city: 'Москва',
    address: 'Ленинский проспект, 45',
    phone: '+74950000002',
    isActive: true,
  }));

  const massageCategory = await findOrCreate(categories, { slug: 'massage' } as Partial<ServiceCategory>, () => ({
    name: 'Массаж',
    slug: 'massage',
    description: 'Классические и восстановительные массажные процедуры.',
  }));

  const careCategory = await findOrCreate(categories, { slug: 'care' } as Partial<ServiceCategory>, () => ({
    name: 'Уход',
    slug: 'care',
    description: 'Уходовые и релакс-программы.',
  }));

  const classicMassage = await findOrCreate(services, { slug: 'classic-massage' } as Partial<Service>, () => ({
    title: 'Классический массаж',
    slug: 'classic-massage',
    description: 'Базовая процедура для снятия напряжения и восстановления тонуса.',
    durationMinutes: 60,
    priceRub: 4500,
    category: massageCategory,
    isActive: true,
  }));

  const sportMassage = await findOrCreate(services, { slug: 'sport-massage' } as Partial<Service>, () => ({
    title: 'Спортивный массаж',
    slug: 'sport-massage',
    description: 'Глубокая работа с мышцами после нагрузок и тренировок.',
    durationMinutes: 75,
    priceRub: 5900,
    category: massageCategory,
    isActive: true,
  }));

  const spaCare = await findOrCreate(services, { slug: 'spa-care' } as Partial<Service>, () => ({
    title: 'SPA-уход',
    slug: 'spa-care',
    description: 'Расслабляющая процедура с уходовыми средствами.',
    durationMinutes: 90,
    priceRub: 7200,
    category: careCategory,
    isActive: true,
  }));

  const masterElena = await findOrCreate(masters, { firstName: 'Елена', lastName: 'Смирнова' } as Partial<Master>, () => ({
    firstName: 'Елена',
    lastName: 'Смирнова',
    bio: 'Мастер восстановительного массажа, опыт 8 лет.',
    studio: studioCenter,
    services: [classicMassage, spaCare],
    isActive: true,
  }));

  const masterRoman = await findOrCreate(masters, { firstName: 'Роман', lastName: 'Петров' } as Partial<Master>, () => ({
    firstName: 'Роман',
    lastName: 'Петров',
    bio: 'Специалист по спортивному массажу и реабилитации.',
    studio: studioPark,
    services: [classicMassage, sportMassage],
    isActive: true,
  }));

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(18, 0, 0, 0);

  const dayAfter = new Date(now);
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(11, 0, 0, 0);
  const dayAfterEnd = new Date(dayAfter);
  dayAfterEnd.setHours(19, 0, 0, 0);

  if ((await shifts.count()) === 0) {
    await shifts.save([
      shifts.create({ master: masterElena, studio: studioCenter, startsAt: tomorrow, endsAt: tomorrowEnd, isAvailable: true }),
      shifts.create({ master: masterRoman, studio: studioPark, startsAt: dayAfter, endsAt: dayAfterEnd, isAvailable: true }),
    ]);
  }

  const planSeeds = [
    ['LADY', 'ЛЕДИ', 9900, 20, 3, 1],
    ['LADY_SUPER', 'ЛЕДИ СУПЕР', 14900, 30, 5, 1],
    ['MISTER', 'МИСТЕР', 10900, 20, 3, 1],
    ['MISTER_SUPER', 'МИСТЕР СУПЕР', 15900, 30, 5, 1],
    ['FAMILY', 'СЕМЕЙНЫЙ', 19900, 20, 6, 4],
    ['FAMILY_SUPER', 'СЕМЕЙНЫЙ СУПЕР', 27900, 30, 10, 6],
  ] as const;

  for (const [code, name, monthlyPriceRub, discountPercent, includedCredits, familyMembersLimit] of planSeeds) {
    await findOrCreate(plans, { code } as Partial<SubscriptionPlan>, () => ({
      code,
      name,
      monthlyPriceRub,
      discountPercent,
      includedCredits,
      familyMembersLimit,
      description: `Тариф ${name}: ${includedCredits} процедур и скидка ${discountPercent}%.`,
      isActive: true,
    }));
  }

  if (!(await certificates.findOne({ where: { code: 'GIFT-DEMO01' } }))) {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    await certificates.save(
      certificates.create({
        code: 'GIFT-DEMO01',
        recipientName: 'Демо Получатель',
        amountRub: 5000,
        expiresAt,
      }),
    );
  }

  await app.close();
  console.log('Seed data created successfully. Test password for all accounts: password123');
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
