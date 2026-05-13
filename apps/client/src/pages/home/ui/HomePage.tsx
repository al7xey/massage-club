import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { mockReviews } from '@/entities/review';
import { buildTariffs, useGetSubscriptionPlansQuery } from '@/entities/subscription';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { PlansCarousel } from '@/widgets/plans-carousel';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';

export function HomePage() {
  const { data: services = [] } = useGetServicesQuery();
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: studios = [] } = useGetStudiosQuery();

  const popularServices = services
    .slice(0, 4)
    .map((service, index) => createServiceCardModel(service, index));
  const popularStudios = studios.slice(0, 2).map(createStudioCardModel);
  const tariffs = buildTariffs(plans);

  return (
    <main className="page home-page">
      <section className="hero-split home-hero">
        <div className="home-hero__content">
          <p className="home-hero__kicker">wellness-клуб по подписке</p>
          <h1>
            Время для себя
            <br />
            <span>каждый месяц</span>
          </h1>
          <p>
            Позаботьтесь о своем теле и ментальном здоровье в атмосфере
            абсолютного спокойствия. Массаж, SPA и уход по единой подписке.
          </p>
          <div className="hero-actions">
            <button className="ui-btn ui-btn-primary" type="button">
              Записаться
            </button>
            <button className="ui-btn ui-btn-outline" type="button">
              Выбрать подписку
            </button>
          </div>
          <div className="home-hero__facts">
            <span>15 000+ довольных клиентов</span>
            <span>Рейтинг 4.9</span>
            <span>2 студии в городе</span>
          </div>
        </div>
        <div className="hero-media home-hero__media">
          <div className="hero-media__image" />
          <div className="hero-media__badge">15 000+ довольных клиентов</div>
        </div>
      </section>

      <PlansCarousel
        title="Тарифы"
        subtitle="Подписка — это не только выгода, но и дисциплина любви к себе."
        items={tariffs}
        sectionClassName="section home-section"
        carouselClassName="plans-carousel home-plans-carousel"
        dotIdPrefix="home-plans-page"
      />

      <section className="gift-banner home-gift-banner">
        <div>
          <h2>Подарите время для себя своим близким</h2>
          <p>Электронные и бумажные сертификаты на любую сумму или услугу.</p>
          <button className="ui-btn ui-btn-primary" type="button">
            Оформить сертификат
          </button>
        </div>
        <div className="gift-banner__icon" aria-hidden>
          🎁
        </div>
      </section>

      <ServiceShowcase
        title="Популярные услуги"
        actionLabel="Смотреть все"
        services={popularServices}
        sectionClassName="section home-section"
        gridClassName="services-grid home-services-grid"
      />
      <StudioShowcase
        title="Наши студии"
        actionLabel="Посмотреть на карте"
        studios={popularStudios}
        sectionClassName="section home-section"
        listClassName="studios-list home-studios-list"
      />
      <ReviewsShowcase
        title="Отзывы наших гостей"
        subtitle="Честные мнения тех, кто уже попробовал"
        actionLabel="Смотреть все"
        reviews={mockReviews}
        sectionClassName="section home-section"
        gridClassName="reviews-grid home-reviews-grid"
      />

      <section className="cta-band home-cta">
        <h2>Начните свой путь к гармонии сегодня</h2>
        <button className="ui-btn ui-btn-white" type="button">
          Записаться онлайн
        </button>
      </section>
    </main>
  );
}
