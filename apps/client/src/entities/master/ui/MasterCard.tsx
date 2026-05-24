import { Link } from 'react-router-dom';
import { appRoutes } from '@/shared/routes';
import { resolveMediaUrl } from '@/shared/lib/media';
import { LinkButton } from '@/shared/ui';
import type { MasterCardModel } from '../model/types';
import styles from './MasterCard.module.css';

interface MasterCardProps {
  master: MasterCardModel;
}

export function MasterCard({ master }: MasterCardProps) {
  const photoUrl = resolveMediaUrl(master.photoUrl);

  return (
    <article className={styles.card}>
      <Link className={styles.cardLink} to={appRoutes.masterDetails(master.id)}>
        <div className={styles.media} aria-label={master.fullName} role="img">
          {photoUrl ? <img src={photoUrl} alt="" loading="lazy" /> : null}
        </div>
        <div className={styles.meta}>
          <span className={styles.role}>{master.roleLabel}</span>
          <h3>{master.fullName}</h3>
          <p>{master.experienceLabel}</p>
          <p>
            <span className={styles.stars}>★★★★★</span> <strong>{master.rating}</strong> ({master.reviewsCount} отзывов)
          </p>
        </div>
      </Link>
      <div className={styles.actions}>
        <LinkButton className={styles.detailsAction} size="sm" variant="secondary" to={appRoutes.masterDetails(master.id)} aria-label={`Подробнее о мастере ${master.fullName}`}>
          <span className={styles.detailsText}>Подробнее</span>
          <span className={styles.detailsArrow} aria-hidden="true">→</span>
        </LinkButton>
        <LinkButton size="sm" to={`${appRoutes.booking()}?masterId=${master.id}`}>
          Записаться к мастеру
        </LinkButton>
      </div>
    </article>
  );
}
