import { Link } from 'react-router-dom';
import { appRoutes } from '@/shared/routes';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import type { ServiceCardModel } from '../model/types';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
  service: ServiceCardModel;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const detailsPath = appRoutes.serviceDetails(service.id);

  return (
    <article className={styles.card} data-tone={service.tone}>
      <Link className={styles.link} to={detailsPath}>
        <div className={styles.media}>
          <span className={styles.timeBadge}>{service.badgeText}</span>
        </div>
        <div className={styles.body}>
          <span className={styles.category}>{service.categoryLabel}</span>
          <h3>{service.title}</h3>
          <p className={styles.duration}>{service.durationMinutes} мин</p>
          <div className={styles.priceRow}>
            <div>
              <span>{formatPrice(service.oldPriceRub)}</span>
              <strong>{formatPrice(service.priceRub)}</strong>
            </div>
            <em>{service.clubLabel}</em>
          </div>
        </div>
      </Link>
    </article>
  );
}
