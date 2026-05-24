import { mockReviews } from '@/entities/review';
import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { buildTariffs, useGetSubscriptionPlansQuery } from '@/entities/subscription';
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
  const womenTariffs = tariffs.filter((tariff) => tariff.segment === 'women');
  const menTariffs = tariffs.filter((tariff) => tariff.segment === 'men');
  const heroTitle = 'Время для себя каждый месяц';
  const heroSubtitle = 'Позаботьтесь о своем теле и ментальном здоровье в атмосфере абсолютного спокойствия. Массаж, SPA и уход по единой подписке.';
  const heroPrimaryButton = 'Выбрать тариф';
  const heroSecondaryButton = 'Посмотреть мастеров';

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>{heroTitle}</h1>
          <p>{heroSubtitle}</p>
          <div className={styles.heroActions}>
            <LinkButton to={appRoutes.subscriptions()}>{heroPrimaryButton}</LinkButton>
            <LinkButton to={appRoutes.masters()} variant="secondary">
              {heroSecondaryButton}
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

      {womenTariffs.length > 0 ? (
        <PlansCarousel
          title="Тарифы для женщин"
          items={womenTariffs}
          dotIdPrefix="home-plans-women"
          topAction={
            <LinkButton size="sm" to={appRoutes.subscriptions()} variant="secondary">
              Все тарифы
            </LinkButton>
          }
        />
      ) : null}

      {menTariffs.length > 0 ? (
        <PlansCarousel
          title="Тарифы для мужчин"
          items={menTariffs}
          dotIdPrefix="home-plans-men"
          topAction={
            <LinkButton size="sm" to={appRoutes.subscriptions()} variant="secondary">
              Все тарифы
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
