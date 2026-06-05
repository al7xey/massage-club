import { createReviewCardModel, useGetReviewsQuery } from '@/entities/review';
import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { buildTariffs, useGetSubscriptionPlansQuery } from '@/entities/subscription';
import { fallbackImages } from '@/shared/lib/fallbackImages';
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
  const { data: reviews = [] } = useGetReviewsQuery();

  const popularServices = (servicesPage?.items ?? []).map((service) => createServiceCardModel(service));
  const popularStudios = studios.slice(0, 2).map(createStudioCardModel);
  const homeTariffs = buildTariffs(plans).slice(0, 4);
  const reviewCards = reviews.slice(0, 3).map(createReviewCardModel);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>
            <span className={styles.heroTitleLine}>Время для себя</span>
            <span className={styles.heroTitleLine}>каждый месяц</span>
          </h1>
          <p>Массажи и скидки на услуги по единой подписке</p>
          <div className={styles.heroActions}>
            <LinkButton to={appRoutes.subscriptions()}>Выбрать тариф</LinkButton>
            <LinkButton to={appRoutes.services()} variant="secondary">
              Посмотреть услуги
            </LinkButton>
          </div>
        </div>
        <div className={styles.heroMedia} style={{ backgroundImage: `url("${fallbackImages.hero}")` }}>
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
          <h2>Подарите больше, чем просто подарок</h2>
          <p>Электронные и бумажные сертификаты на любую сумму или услугу для отдыха, восстановления и заботе о ваших близких</p>
          <LinkButton to={appRoutes.certificates()}>Оформить сертификат</LinkButton>
        </div>
        <div className={styles.giftArt} aria-hidden="true">
          <span />
          <span />
        </div>
      </section>

      <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={popularServices} />
      <StudioShowcase title="Наши студии" actionLabel="Подробнее" studios={popularStudios} />
      <ReviewsShowcase
        title="Отзывы наших гостей"
        subtitle="Честные мнения тех, кто уже попробовал"
        actionLabel="Смотреть все"
        reviews={reviewCards}
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
