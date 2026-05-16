import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent,
} from 'react';
import { PricingCard, type TariffItem } from '@/entities/subscription';
import { ChooseSubscriptionButton } from '@/features/choose-subscription';
import styles from './PlansCarousel.module.css';

interface PlansCarouselProps {
  title: string;
  subtitle?: string;
  items: TariffItem[];
  breadcrumb?: ReactNode;
  dotIdPrefix: string;
  titleLevel?: 'h1' | 'h2';
}

export function PlansCarousel({
  title,
  subtitle,
  items,
  breadcrumb,
  dotIdPrefix,
  titleLevel = 'h2',
}: PlansCarouselProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({ left: 0, startX: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [maxIndex, setMaxIndex] = useState(0);

  const getStepMetrics = useCallback(() => {
    const viewport = viewportRef.current;
    const firstSlide = viewport?.querySelector<HTMLElement>(`.${styles.slide}`);

    if (!viewport || !firstSlide) {
      return null;
    }

    const track = viewport.querySelector<HTMLElement>(`.${styles.track}`);
    const gap = track ? parseFloat(window.getComputedStyle(track).gap || '0') : 0;
    const step = firstSlide.getBoundingClientRect().width + gap;

    if (!Number.isFinite(step) || step <= 0) {
      return null;
    }

    const visibleCount = Math.max(1, Math.floor((viewport.clientWidth + gap) / step));
    return { step, nextMaxIndex: Math.max(0, items.length - visibleCount) };
  }, [items.length]);

  const syncPagination = useCallback(() => {
    const viewport = viewportRef.current;
    const metrics = getStepMetrics();

    if (!viewport || !metrics) {
      setActiveIndex(0);
      setMaxIndex(0);
      return;
    }

    setMaxIndex(metrics.nextMaxIndex);
    setActiveIndex(Math.min(metrics.nextMaxIndex, Math.max(0, Math.round(viewport.scrollLeft / metrics.step))));
  }, [getStepMetrics]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    syncPagination();
    viewport.addEventListener('scroll', syncPagination, { passive: true });
    window.addEventListener('resize', syncPagination);

    return () => {
      viewport.removeEventListener('scroll', syncPagination);
      window.removeEventListener('resize', syncPagination);
    };
  }, [syncPagination, items.length]);

  const scrollToIndex = (index: number) => {
    const viewport = viewportRef.current;
    const metrics = getStepMetrics();

    if (!viewport || !metrics) {
      return;
    }

    const safeIndex = Math.min(metrics.nextMaxIndex, Math.max(0, index));
    viewport.scrollTo({ left: safeIndex * metrics.step, behavior: 'smooth' });
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

    if (delta === 0) {
      return;
    }

    event.preventDefault();
    viewport.scrollLeft += delta;
    syncPagination();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    dragStateRef.current = { left: viewport.scrollLeft, startX: event.clientX };
    setIsDragging(true);
    viewport.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;

    if (!viewport || !isDragging) {
      return;
    }

    viewport.scrollLeft = dragStateRef.current.left - (event.clientX - dragStateRef.current.startX);
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;

    if (viewport?.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);
    syncPagination();
  };

  const TitleTag = titleLevel;

  return (
    <section className={styles.section}>
      {breadcrumb}
      <div className={styles.top}>
        <div>
          <TitleTag className={titleLevel === 'h1' ? styles.titlePage : styles.title}>{title}</TitleTag>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        <div className={styles.actions} aria-label="Навигация тарифов">
          <button
            className={`${styles.arrow} ${styles.prev}`}
            type="button"
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex <= 0}
            aria-label="Прокрутить тарифы влево"
          />
          <button
            className={`${styles.arrow} ${styles.next}`}
            type="button"
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex >= maxIndex}
            aria-label="Прокрутить тарифы вправо"
          />
        </div>
      </div>

      <div>
        <div
          className={`${styles.viewport} ${isDragging ? styles.dragging : ''}`}
          ref={viewportRef}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <div className={styles.track}>
            {items.map((item) => (
              <div className={styles.slide} key={item.id}>
                <PricingCard item={item} actionSlot={<ChooseSubscriptionButton planId={item.id} />} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dots} role="tablist" aria-label="Страницы тарифов">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={`${dotIdPrefix}-${index}`}
              className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
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
