import { Link } from 'react-router-dom';
import { appRoutes } from '@/shared/routes';
import type { StudioCardModel } from '../model/types';
import styles from './StudioCard.module.css';

interface StudioCardProps {
  studio: StudioCardModel;
}

export function StudioCard({ studio }: StudioCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.media} aria-hidden />
      <div className={styles.content}>
        <h3>{studio.title}</h3>
        <p>{studio.address}</p>
        <p>{studio.openLabel}</p>
      </div>
      <Link className={styles.button} to={appRoutes.booking()}>
        Записаться
      </Link>
    </article>
  );
}
