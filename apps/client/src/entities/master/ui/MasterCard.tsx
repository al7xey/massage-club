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
      <div className={styles.media} aria-label={master.fullName} role="img" />
      <div className={styles.meta}>
        <h3>{master.fullName}</h3>
        <p>
          ★★★★★ <strong>{master.rating}</strong> ({master.reviewsCount} отзывов)
        </p>
      </div>
      <div className={styles.actions}>
        <Button size="sm" variant="secondary">
          Подробнее
        </Button>
        <LinkButton size="sm" to={appRoutes.booking()}>
          Записаться
        </LinkButton>
      </div>
    </article>
  );
}
