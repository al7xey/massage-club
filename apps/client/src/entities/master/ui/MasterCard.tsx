import { Button, LinkButton } from '@/shared/ui';
import { appRoutes } from '@/shared/routes';
import type { MasterCardModel } from '../model/types';
import styles from './MasterCard.module.css';

interface MasterCardProps {
  master: MasterCardModel;
}

export function MasterCard({ master }: MasterCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <span className={styles.badge}>{master.experienceLabel}</span>
      </div>
      <div className={styles.body}>
        <h3>{master.fullName}</h3>
        <p className={styles.role}>{master.roleLabel}</p>
        <p className={styles.rating}>★★★★★ <strong>{master.rating}</strong> ({master.reviewsCount} отзывов)</p>
        <p className={styles.summary}>{master.summary}</p>
        <div className={styles.actions}>
          <Button size="sm" variant="secondary">Подробнее</Button>
          <LinkButton size="sm" to={appRoutes.booking()}>Записаться</LinkButton>
        </div>
      </div>
    </article>
  );
}
