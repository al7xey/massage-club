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
  const [firstName, ...lastNameParts] = master.fullName.trim().split(/\s+/);
  const lastName = lastNameParts.join(' ');
  const initials = getInitials(master.fullName);

  return (
    <article className={styles.card}>
      <Link className={styles.cardLink} to={appRoutes.masterDetails(master.id)}>
        <div className={styles.media} aria-label={master.fullName} role="img">
          {photoUrl ? <img src={photoUrl} alt="" loading="lazy" /> : <div className={styles.mediaPlaceholder}>{initials}</div>}
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
          {master.specialization ? <p>{master.specialization}</p> : null}
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

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function ActionArrow() {
  return (
    <svg className={styles.detailsArrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
