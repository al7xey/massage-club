import { Link } from 'react-router-dom';
import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { mockReviews } from '@/entities/review';
import { buildTariffs, useGetSubscriptionPlansQuery } from '@/entities/subscription';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { appRoutes } from '@/shared/routes';
import { PlansCarousel } from '@/widgets/plans-carousel';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';
import styles from './HomePage.module.css';

export function HomePage() {
  const { data: services = [] } = useGetServicesQuery();
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: studios = [] } = useGetStudiosQuery();

  const popularServices = services.slice(0, 3).map((service, index) => createServiceCardModel(service, index));
  const popularStudios = studios.slice(0, 2).map(createStudioCardModel);
  const tariffs = buildTariffs(plans);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>
            Время для себя
            <br />
            <span>каждый месяц</span>
          </h1>
          <p>
            Позаботьтесь о своем теле и ментальном здоровье в атмосфере абсолютного спокойствия.
            Массаж, SPA и уход по единой подписке.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} to={appRoutes.booking()}>
              Записаться
            </Link>
            <Link className={styles.outlineButton} to={appRoutes.subscriptions()}>
              Выбрать подписку
            </Link>
          </div>
        </div>
        <div className={styles.heroMedia}>
          <div className={styles.heroBadge}>
            <span>★★★★★</span>
            <strong>15 000+ довольных клиентов</strong>
          </div>
        </div>
      </section>

      <PlansCarousel
        title="Стань членом клуба"
        subtitle="Подписка — это не только выгода, но и дисциплина любви к себе."
        items={tariffs}
        dotIdPrefix="home-plans-page"
      />

      <section className={styles.giftBanner}>
        <div>
          <h2>Подарите время для себя своим близким</h2>
          <p>Электронные и бумажные сертификаты на любую сумму или конкретную услугу.</p>
          <Link className={styles.primaryButton} to={appRoutes.certificates()}>
            Оформить сертификат
          </Link>
        </div>
      </section>

      <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={popularServices} />
      <StudioShowcase title="Наши студии" actionLabel="Посмотреть на карте" studios={popularStudios} />
      <ReviewsShowcase
        title="Отзывы наших гостей"
        subtitle="Честные мнения тех, кто уже попробовал"
        reviews={mockReviews}
      />

      <section className={styles.cta}>
        <h2>Начните свой путь к гармонии сегодня</h2>
        <Link className={styles.whiteButton} to={appRoutes.booking()}>
          Записаться
        </Link>
      </section>
    </main>
  );
}
