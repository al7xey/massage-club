import { mockReviews } from '@/entities/review';
import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { buildTariffs, type TariffItem, useGetSubscriptionPlansQuery } from '@/entities/subscription';
import { appRoutes } from '@/shared/routes';
import { LinkButton } from '@/shared/ui';
import { PlansCarousel } from '@/widgets/plans-carousel';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';
import styles from './HomePage.module.css';

export function HomePage() {
  const { data: servicesPage } = useGetServicesQuery({ limit: 4, sort: 'popular' });
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: studios = [] } = useGetStudiosQuery();

  const popularServices = (servicesPage?.items ?? []).map((service) => createServiceCardModel(service));
  const popularStudios = studios.slice(0, 2).map(createStudioCardModel);
  const tariffs = buildTariffs(plans);
  const homeTariffs = pickTariffs(tariffs, ['LADY', 'LADY_SUPER', 'FAMILY', 'FAMILY_SUPER']).map((tariff) =>
    tariff.code === 'LADY_SUPER' ? renameTariff(tariff, 'Супер') : renameFamilyAsRussian(tariff),
  );

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Время для себя каждый месяц</h1>
          <p>Позаботьтесь о своем теле и ментальном здоровье в атмосфере спокойствия. Массаж, SPA и уход по единой подписке.</p>
          <div className={styles.heroActions}>
            <LinkButton to={appRoutes.subscriptions()}>Выбрать тариф</LinkButton>
            <LinkButton to={appRoutes.masters()} variant="secondary">
              Посмотреть мастеров
            </LinkButton>
          </div>
        </div>
        <div className={styles.heroMedia}>
          <div className={styles.heroBadge}>
            <span>★★★★★</span>
            <strong>15 000+ довольных клиентов</strong>
          </div>
        </div>
      </section>

      {homeTariffs.length > 0 ? (
        <PlansCarousel
          title="Тарифы клуба"
          items={homeTariffs}
          dotIdPrefix="home-plans"
          topAction={
            <LinkButton size="sm" to={appRoutes.subscriptions()} variant="secondary">
              Подробнее
            </LinkButton>
          }
        />
      ) : null}

      <section className={styles.giftBanner}>
        <div>
          <h2>Подарите время для себя своим близким</h2>
          <p>Электронные и бумажные сертификаты на любую сумму или конкретную услугу.</p>
          <LinkButton to={appRoutes.certificates()}>Оформить сертификат</LinkButton>
        </div>
      </section>

      <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={popularServices} />
      <StudioShowcase title="Наши студии" actionLabel="Подробнее" studios={popularStudios} />
      <ReviewsShowcase
        title="Отзывы наших гостей"
        subtitle="Честные мнения тех, кто уже попробовал"
        actionLabel="Смотреть все"
        reviews={mockReviews}
      />

      <section className={styles.cta}>
        <h2>Начните свой путь к гармонии сегодня</h2>
        <LinkButton className={styles.whiteButton} to={appRoutes.subscriptions()} variant="secondary">
          Выбрать тариф
        </LinkButton>
      </section>
    </main>
  );
}

function pickTariffs(tariffs: TariffItem[], codes: string[]) {
  const byCode = new Map(tariffs.map((tariff) => [tariff.code, tariff]));
  return codes.map((code) => byCode.get(code)).filter((tariff): tariff is TariffItem => Boolean(tariff));
}

function renameTariff(tariff: TariffItem, title: string): TariffItem {
  return { ...tariff, title, planMeta: { ...tariff.planMeta, title } };
}

function renameFamilyAsRussian(tariff: TariffItem): TariffItem {
  if (tariff.code === 'FAMILY') return renameTariff(tariff, 'Семейный');
  if (tariff.code === 'FAMILY_SUPER') return renameTariff(tariff, 'Семейный Супер');
  return tariff;
}
