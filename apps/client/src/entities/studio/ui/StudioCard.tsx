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
      <div className={styles.media} aria-hidden="true" />
      <div className={styles.content}>
        <h3>{studio.title}</h3>
        <p>{studio.address}</p>
        <p>{studio.openLabel}</p>
        <LinkButton fullWidth to={appRoutes.booking()}>
          Записаться в филиал
        </LinkButton>
      </div>
    </article>
  );
}
