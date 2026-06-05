import { type MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appRoutes } from '@/shared/routes';
import { resolveMediaUrl } from '@/shared/lib/media';
import { LinkButton } from '@/shared/ui';
import type { StudioCardModel } from '../model/types';
import styles from './StudioCard.module.css';

interface StudioCardProps {
  studio: StudioCardModel;
  variant?: 'compact' | 'full';
}

export function StudioCard({ studio, variant = 'full' }: StudioCardProps) {
  const navigate = useNavigate();
  const slides = studio.photoUrls.length > 0 ? studio.photoUrls : studio.photoUrl ? [studio.photoUrl] : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex] ?? slides[0];
  const activePhotoUrl = resolveMediaUrl(activeSlide);
  const isCompact = variant === 'compact';
  const showGalleryControls = !isCompact && slides.length > 1;
  const bookingPath = `${appRoutes.booking()}?studioId=${studio.id}`;
  const goToSlide = (direction: -1 | 1) => {
    if (slides.length === 0) {
      return;
    }

    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  };
  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    if (!window.matchMedia('(max-width: 760px)').matches) {
      return;
    }

    if ((event.target as HTMLElement).closest('a, button')) {
      return;
    }

    navigate(bookingPath);
  };

  return (
    <article className={`${styles.card} ${isCompact ? styles.cardCompact : ''}`} onClick={handleCardClick}>
      <div className={styles.media}>
        {activePhotoUrl ? <img src={activePhotoUrl} alt={`${studio.title}, фото ${activeIndex + 1}`} loading="lazy" /> : <div className={styles.mediaPlaceholder}>{studio.title}</div>}
        {showGalleryControls ? (
          <>
            <button className={styles.navButton} type="button" aria-label="Предыдущее фото" onClick={() => goToSlide(-1)}>
              <ArrowIcon direction="left" />
            </button>
            <button className={`${styles.navButton} ${styles.navNext}`} type="button" aria-label="Следующее фото" onClick={() => goToSlide(1)}>
              <ArrowIcon direction="right" />
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
        {!isCompact && studio.phone ? <p>{studio.phone}</p> : null}
        {studio.openLabel ? <p>{studio.openLabel}</p> : null}
        <LinkButton fullWidth to={bookingPath}>
          Записаться
        </LinkButton>
      </div>
    </article>
  );
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg className={styles.navArrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {direction === 'left' ? (
        <>
          <path d="M19 12H5" />
          <path d="m11 6-6 6 6 6" />
        </>
      ) : (
        <>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </>
      )}
    </svg>
  );
}
