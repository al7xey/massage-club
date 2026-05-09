import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildTariffs } from '@/shared/config/tariffs';
import { createUiServiceCard, createUiStudioMeta, landingContent } from '@/shared/config/publicContent';
import { useGetServicesQuery, useGetStudiosQuery } from '@/shared/api/servicesApi';
import { useGetSubscriptionPlansQuery } from '@/shared/api/subscriptionsApi';
import { PricingCard, ReviewCard, SectionHeader, ServiceCard, StudioCard } from '@/shared/ui/public/PublicBlocks';

export function HomePage() {
  const { data: services = [] } = useGetServicesQuery();
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: studios = [] } = useGetStudiosQuery();

  const popularServices = services.slice(0, 4).map((service, index) => createUiServiceCard(service, index));
  const popularStudios = studios.slice(0, 2);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);

  const tariffs = useMemo(() => buildTariffs(plans), [plans]);

  const getStepMetrics = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return null;

    const track = viewport.querySelector<HTMLElement>('.plans-carousel__track');
    const firstSlide = viewport.querySelector<HTMLElement>('.plans-carousel__slide');
    if (!track || !firstSlide) return null;

    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.columnGap || trackStyles.gap || '0');
    const step = firstSlide.getBoundingClientRect().width + gap;

    if (!Number.isFinite(step) || step <= 0) return null;

    const visibleCount = Math.max(1, Math.floor((viewport.clientWidth + gap) / step));
    const nextMaxIndex = Math.max(0, tariffs.length - visibleCount);

    return { step, nextMaxIndex };
  }, [tariffs.length]);

  const syncPagination = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const metrics = getStepMetrics();
    if (!metrics) {
      setActiveIndex(0);
      setMaxIndex(0);
      return;
    }

    const { step, nextMaxIndex } = metrics;
    const nextActive = Math.min(nextMaxIndex, Math.max(0, Math.round(viewport.scrollLeft / step)));

    setMaxIndex(nextMaxIndex);
    setActiveIndex(nextActive);
  }, [getStepMetrics]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onScroll = () => syncPagination();

    syncPagination();
    viewport.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', syncPagination);

    return () => {
      viewport.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', syncPagination);
    };
  }, [syncPagination, tariffs.length]);

  const scrollToIndex = (index: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const metrics = getStepMetrics();
    if (!metrics) return;

    const safeIndex = Math.min(metrics.nextMaxIndex, Math.max(0, index));

    viewport.scrollTo({
      left: safeIndex * metrics.step,
      behavior: 'smooth',
    });
  };

  const scrollByStep = (direction: -1 | 1) => {
    scrollToIndex(activeIndex + direction);
  };

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
            Позаботьтесь о своем теле и ментальном здоровье в атмосфере абсолютного спокойствия. Массаж, SPA и уход по единой
            подписке.
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

      <section className="section home-section">
        <div className="plans-section-top">
          <div>
            <h2>Тарифы</h2>
            <p className="plans-section-subtitle">Подписка — это не только выгода, но и дисциплина любви к себе.</p>
          </div>
          <div className="plans-carousel-actions" aria-label="Навигация тарифов">
            <button
              className="plans-carousel-arrow plans-carousel-arrow--prev"
              type="button"
              onClick={() => scrollByStep(-1)}
              disabled={activeIndex <= 0}
              aria-label="Прокрутить тарифы влево"
            />
            <button
              className="plans-carousel-arrow plans-carousel-arrow--next"
              type="button"
              onClick={() => scrollByStep(1)}
              disabled={activeIndex >= maxIndex}
              aria-label="Прокрутить тарифы вправо"
            />
          </div>
        </div>

        <div className="plans-carousel home-plans-carousel">
          <div className="plans-carousel__viewport" ref={viewportRef}>
            <div className="plans-carousel__track">
              {tariffs.map((plan) => (
                <div className="plans-carousel__slide" key={plan.id}>
                  <PricingCard title={plan.title} priceRub={plan.priceRub} planMeta={plan.planMeta} />
                </div>
              ))}
            </div>
          </div>

          <div className="plans-carousel__dots" role="tablist" aria-label="Страницы тарифов">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={`home-plans-page-${index}`}
                className={`plans-carousel__dot ${index === activeIndex ? 'plans-carousel__dot--active' : ''}`}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Перейти к странице ${index + 1}`}
                aria-current={index === activeIndex}
              />
            ))}
          </div>
        </div>
      </section>

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

      <section className="section home-section">
        <SectionHeader title="Популярные услуги" actionLabel="Смотреть все" />
        <div className="services-grid home-services-grid">
          {popularServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      <section className="section home-section">
        <SectionHeader title="Наши студии" actionLabel="Посмотреть на карте" />
        <div className="studios-list home-studios-list">
          {popularStudios.map((studio) => (
            <StudioCard key={studio.id} title={studio.name} address={studio.address} meta={createUiStudioMeta(studio)} />
          ))}
        </div>
      </section>

      <section className="section home-section">
        <SectionHeader title="Отзывы наших гостей" subtitle="Честные мнения тех, кто уже попробовал" actionLabel="Смотреть все" />
        <div className="reviews-grid home-reviews-grid">
          {landingContent.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>

      <section className="cta-band home-cta">
        <h2>Начните свой путь к гармонии сегодня</h2>
        <button className="ui-btn ui-btn-white" type="button">
          Записаться онлайн
        </button>
      </section>
    </main>
  );
}
