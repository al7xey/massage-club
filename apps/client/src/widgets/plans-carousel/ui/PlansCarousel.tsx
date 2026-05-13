import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { PricingCard, type TariffItem } from '@/entities/subscription';
import { ChooseSubscriptionButton } from '@/features/choose-subscription';

interface PlansCarouselProps {
  title: string;
  subtitle?: string;
  items: TariffItem[];
  breadcrumb?: ReactNode;
  sectionClassName?: string;
  carouselClassName?: string;
  dotIdPrefix: string;
}

export function PlansCarousel({
  title,
  subtitle,
  items,
  breadcrumb,
  sectionClassName = 'section',
  carouselClassName,
  dotIdPrefix,
}: PlansCarouselProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);

  const getStepMetrics = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return null;
    }

    const track = viewport.querySelector<HTMLElement>('.plans-carousel__track');
    const firstSlide = viewport.querySelector<HTMLElement>('.plans-carousel__slide');
    if (!track || !firstSlide) {
      return null;
    }

    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.columnGap || trackStyles.gap || '0');
    const step = firstSlide.getBoundingClientRect().width + gap;

    if (!Number.isFinite(step) || step <= 0) {
      return null;
    }

    const visibleCount = Math.max(1, Math.floor((viewport.clientWidth + gap) / step));
    const nextMaxIndex = Math.max(0, items.length - visibleCount);

    return { step, nextMaxIndex };
  }, [items.length]);

  const syncPagination = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

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
    if (!viewport) {
      return;
    }

    const handleScroll = () => syncPagination();

    syncPagination();
    viewport.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', syncPagination);

    return () => {
      viewport.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', syncPagination);
    };
  }, [syncPagination, items.length]);

  const scrollToIndex = (index: number) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const metrics = getStepMetrics();
    if (!metrics) {
      return;
    }

    const safeIndex = Math.min(metrics.nextMaxIndex, Math.max(0, index));
    viewport.scrollTo({ left: safeIndex * metrics.step, behavior: 'smooth' });
  };

  return (
    <section className={sectionClassName}>
      {breadcrumb}
      <div className="plans-section-top">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="plans-section-subtitle">{subtitle}</p> : null}
        </div>
        <div className="plans-carousel-actions" aria-label="Навигация тарифов">
          <button
            className="plans-carousel-arrow plans-carousel-arrow--prev"
            type="button"
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex <= 0}
            aria-label="Прокрутить тарифы влево"
          />
          <button
            className="plans-carousel-arrow plans-carousel-arrow--next"
            type="button"
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex >= maxIndex}
            aria-label="Прокрутить тарифы вправо"
          />
        </div>
      </div>

      <div className={carouselClassName ?? 'plans-carousel'}>
        <div className="plans-carousel__viewport" ref={viewportRef}>
          <div className="plans-carousel__track">
            {items.map((item) => (
              <div className="plans-carousel__slide" key={item.id}>
                <PricingCard item={item} actionSlot={<ChooseSubscriptionButton planId={item.id} />} />
              </div>
            ))}
          </div>
        </div>

        <div className="plans-carousel__dots" role="tablist" aria-label="Страницы тарифов">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={`${dotIdPrefix}-${index}`}
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
  );
}
