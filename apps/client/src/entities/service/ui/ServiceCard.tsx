import { Link } from 'react-router-dom';
import { appRoutes } from '@/shared/routes';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { Button } from '@/shared/ui';
import type { ServiceCardModel } from '../model/types';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
  isActionDisabled?: boolean;
  onAddToCart?: (service: ServiceCardModel) => Promise<void> | void;
  onBook?: (service: ServiceCardModel) => Promise<void> | void;
  service: ServiceCardModel;
}

export function ServiceCard({ isActionDisabled = false, onAddToCart, onBook, service }: ServiceCardProps) {
  const detailsPath = appRoutes.serviceDetails(service.id);

  return (
    <article className={styles.card}>
      <Link className={styles.link} to={detailsPath}>
        <div className={styles.media} aria-hidden="true">
          <span className={styles.timeBadge}>{service.badgeText}</span>
        </div>
        <div className={styles.body}>
          <span className={styles.category}>{service.categoryLabel}</span>
          <h3>{service.title}</h3>
          <div className={styles.priceRow}>
            <div>
              <span>{formatPrice(service.oldPriceRub)}</span>
              <strong>{formatPrice(service.priceRub)}</strong>
            </div>
            <em>{service.clubLabel}</em>
          </div>
        </div>
      </Link>
      <div className={styles.actionWrap}>
        <div className={styles.actionButtons}>
          <Button size="sm" variant="secondary" disabled={isActionDisabled || !onAddToCart} onClick={() => void onAddToCart?.(service)}>
            В корзину
          </Button>
          <Button size="sm" disabled={isActionDisabled || !onBook} onClick={() => void onBook?.(service)}>
            Записаться
          </Button>
        </div>
      </div>
    </article>
  );
}
