import { appRoutes } from '@/shared/routes';
import { Button, LinkButton } from '@/shared/ui';
import { useState } from 'react';
import type { MasterCardModel } from '../model/types';
import styles from './MasterCard.module.css';

interface MasterCardProps {
  master: MasterCardModel;
}

export function MasterCard({ master }: MasterCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const openDetails = () => setIsDetailsOpen(true);

  return (
    <article
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDetails();
        }
      }}
    >
      <div className={styles.media} aria-label={master.fullName} role="img" />
      <div className={styles.meta}>
        <h3>{master.fullName}</h3>
        <p>
          <span className={styles.stars}>★★★★★</span> <strong>{master.rating}</strong> ({master.reviewsCount} отзывов)
        </p>
      </div>
      <div className={styles.actions} onClick={(event) => event.stopPropagation()}>
        <Button size="sm" variant="secondary" onClick={openDetails}>
          Подробнее
        </Button>
        <LinkButton size="sm" to={appRoutes.booking()}>
          Записаться
        </LinkButton>
      </div>

      {isDetailsOpen ? (
        <div className={styles.modalRoot} role="presentation" onClick={(event) => event.stopPropagation()}>
          <button className={styles.overlay} type="button" aria-label="Закрыть" onClick={() => setIsDetailsOpen(false)} />
          <section className={styles.modal} role="dialog" aria-modal="true" aria-label={master.fullName}>
            <button className={styles.closeButton} type="button" aria-label="Закрыть" onClick={() => setIsDetailsOpen(false)}>
              +
            </button>
            <div className={styles.modalMedia} aria-hidden="true" />
            <div className={styles.modalBody}>
              <span>{master.roleLabel}</span>
              <h2>{master.fullName}</h2>
              <p className={styles.ratingLine}>
                <span className={styles.stars}>★★★★★</span> <strong>{master.rating}</strong> ({master.reviewsCount} отзывов)
              </p>
              <p>{master.summary}</p>
              <div className={styles.modalActions}>
                <LinkButton to={appRoutes.booking()}>Записаться</LinkButton>
                <Button variant="secondary" onClick={() => setIsDetailsOpen(false)}>
                  Закрыть
                </Button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </article>
  );
}
