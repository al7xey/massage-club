import { appRoutes } from '@/shared/routes';
import { Button, LinkButton } from '@/shared/ui';
import type { MasterCardModel } from '../model/types';
import styles from './MasterCard.module.css';

interface MasterCardProps {
  master: MasterCardModel;
}

export function MasterCard({ master }: MasterCardProps) {
  return (
    <article className={styles.card}>
      <LinkButton className={styles.cardLink} to={appRoutes.masterDetails(master.id)} variant="ghost">
        <div className={styles.media} aria-label={master.fullName} role="img" />
        <div className={styles.meta}>
          <h3>{master.fullName}</h3>
          <p>
            <span className={styles.stars}>★★★★★</span> <strong>{master.rating}</strong> ({master.reviewsCount} отзывов)
          </p>
        </div>
      </LinkButton>
      <div className={styles.actions}>
        <LinkButton size="sm" variant="secondary" to={appRoutes.masterDetails(master.id)}>
          Подробнее
        </LinkButton>
        <LinkButton size="sm" to={appRoutes.booking()}>
          Записаться
        </LinkButton>
      </div>
    </article>
  );
}
