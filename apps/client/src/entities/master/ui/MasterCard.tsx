import { Link } from 'react-router-dom';
import { appRoutes } from '@/shared/routes';
import { getFallbackImage } from '@/shared/lib/fallbackImages';
import { resolveMediaUrl } from '@/shared/lib/media';
import { LinkButton } from '@/shared/ui';
import type { MasterCardModel } from '../model/types';
import styles from './MasterCard.module.css';

interface MasterCardProps {
  master: MasterCardModel;
}

export function MasterCard({ master }: MasterCardProps) {
  const photoUrl = resolveMediaUrl(master.photoUrl) || getFallbackImage('masters', master.id);
  const [firstName, ...lastNameParts] = master.fullName.trim().split(/\s+/);
  const lastName = lastNameParts.join(' ');

  return (
    <article className={styles.card}>
      <Link className={styles.cardLink} to={appRoutes.masterDetails(master.id)}>
        <div className={styles.media} aria-label={master.fullName} role="img">
          <img src={photoUrl} alt="" loading="lazy" />
        </div>
        <div className={styles.meta}>
          <h3>
            <span className={styles.firstName}>{firstName}</span>
            {lastName ? (
              <>
                {' '}
                <span className={styles.lastName}>{lastName}</span>
              </>
            ) : null}
          </h3>
          <p>
            <strong>{master.rating}</strong> <span className={styles.stars}>★★★★★</span> ({master.reviewsCount} отзывов)
          </p>
        </div>
      </Link>
      <div className={styles.actions}>
        <LinkButton className={styles.detailsAction} size="sm" variant="secondary" to={appRoutes.masterDetails(master.id)} aria-label={`Подробнее о мастере ${master.fullName}`}>
          <span className={styles.detailsText}>Подробнее</span>
          <ActionArrow />
        </LinkButton>
        <LinkButton size="sm" to={`${appRoutes.booking()}?masterId=${master.id}`}>
          Записаться
        </LinkButton>
      </div>
    </article>
  );
}

function ActionArrow() {
  return (
    <svg className={styles.detailsArrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
