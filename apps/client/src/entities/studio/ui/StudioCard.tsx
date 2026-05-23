import { useState } from 'react';
import { appRoutes } from '@/shared/routes';
import { LinkButton } from '@/shared/ui';
import type { StudioCardModel } from '../model/types';
import styles from './StudioCard.module.css';

interface StudioCardProps {
  studio: StudioCardModel;
  variant?: 'compact' | 'full';
}

export function StudioCard({ studio, variant = 'full' }: StudioCardProps) {
  const fallbackSlides = ['Зал массажа', 'Зона ожидания', 'Кабинет SPA'];
  const slides = studio.photoUrls.length > 0 ? studio.photoUrls : fallbackSlides;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex] ?? slides[0];
  const hasRealPhoto = studio.photoUrls.length > 0;
  const isCompact = variant === 'compact';
  const showGalleryControls = !isCompact && slides.length > 1;
  const goToSlide = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <article className={`${styles.card} ${isCompact ? styles.cardCompact : ''}`}>
      <div className={styles.media}>
        {hasRealPhoto ? (
          <img src={activeSlide} alt={`${studio.title}, фото ${activeIndex + 1}`} loading="lazy" />
        ) : (
          <div aria-hidden="true" className={styles.placeholder} data-slide={activeIndex}>
            <span>{activeSlide}</span>
          </div>
        )}
        {showGalleryControls ? (
          <>
            <button className={styles.navButton} type="button" aria-label="Предыдущее фото" onClick={() => goToSlide(-1)}>
              ‹
            </button>
            <button className={`${styles.navButton} ${styles.navNext}`} type="button" aria-label="Следующее фото" onClick={() => goToSlide(1)}>
              ›
            </button>
            <div className={styles.dots} aria-label={`Фото ${activeIndex + 1} из ${slides.length}`}>
              {slides.map((slide, index) => (
                <button
                  key={`${studio.id}-${slide}-${index}`}
                  className={styles.dot}
                  type="button"
                  aria-label={`Показать фото ${index + 1}`}
                  aria-pressed={index === activeIndex}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
      <div className={styles.content}>
        <h3>{studio.title}</h3>
        <p>{studio.address}</p>
        {!isCompact ? <p>{studio.phone}</p> : null}
        <p>{studio.openLabel}</p>
        <LinkButton fullWidth to={`${appRoutes.booking()}?studioId=${studio.id}`}>
          Записаться
        </LinkButton>
      </div>
    </article>
  );
}
