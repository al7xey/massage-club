import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createUiServiceCard, createUiStudioMeta, landingContent } from '@/shared/config/publicContent';
import { buildTariffs } from '@/shared/config/tariffs';
import { useGetServicesQuery, useGetStudiosQuery } from '@/shared/api/servicesApi';
import { useGetSubscriptionPlansQuery } from '@/shared/api/subscriptionsApi';
import { HomeCrumb, PricingCard, ReviewCard, SectionHeader, ServiceCard, StudioCard } from '@/shared/ui/public/PublicBlocks';

export function SubscriptionPlansPage() {
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: services = [] } = useGetServicesQuery();
  const { data: studios = [] } = useGetStudiosQuery();

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
    <main className="page">
      <section>
        <HomeCrumb />

        <div className="plans-section-top">
          <h2>Тарифы</h2>
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

        <div className="plans-carousel">
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
                key={`plans-page-${index}`}
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

      <section className="promo-line">
        <strong>Акция «Легкий старт»</strong>
        <span>Вступительный взнос 1200 ₽ 0 ₽ при покупке первой подписки!</span>
      </section>

      <section className="section">
        <SectionHeader title="Популярные услуги" actionLabel="Смотреть все" />
        <div className="services-grid">
          {services.slice(0, 4).map((service, index) => (
            <ServiceCard key={service.id} service={createUiServiceCard(service, index)} />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader title="Где пройти процедуру" />
        <div className="studios-list">
          {studios.slice(0, 2).map((studio) => (
            <StudioCard key={studio.id} title={studio.name} address={studio.address} meta={createUiStudioMeta(studio)} />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader title="Отзывы наших гостей" subtitle="Честные мнения тех, кто уже попробовал" actionLabel="Смотреть все" />
        <div className="reviews-grid">
          {landingContent.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>
    </main>
  );
}
