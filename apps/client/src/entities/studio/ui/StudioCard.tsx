import { appRoutes } from '@/shared/routes';
import { LinkButton } from '@/shared/ui';
import type { StudioCardModel } from '../model/types';
import styles from './StudioCard.module.css';

interface StudioCardProps {
  studio: StudioCardModel;
}

export function StudioCard({ studio }: StudioCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {studio.photoUrl ? <img src={studio.photoUrl} alt={studio.title} loading="lazy" /> : <div aria-hidden="true" className={styles.placeholder} />}
      </div>
      <div className={styles.content}>
        <h3>{studio.title}</h3>
        <p>{studio.address}</p>
        <p>{studio.openLabel}</p>
        <LinkButton fullWidth to={`${appRoutes.studios()}#map`}>
          Посмотреть на карте
        </LinkButton>
      </div>
    </article>
  );
}
