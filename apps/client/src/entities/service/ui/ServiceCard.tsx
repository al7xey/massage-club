import { Link } from 'react-router-dom';
import { appRoutes } from '@/shared/routes';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { resolveMediaUrl } from '@/shared/lib/media';
import { Button } from '@/shared/ui';
import type { ServiceCardModel } from '../model/types';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
  cartCount?: number;
  isActionDisabled?: boolean;
  onAddToCart?: (service: ServiceCardModel) => Promise<void> | void;
  onBook?: (service: ServiceCardModel) => Promise<void> | void;
  service: ServiceCardModel;
}

export function ServiceCard({ cartCount = 0, isActionDisabled = false, onAddToCart, onBook, service }: ServiceCardProps) {
  const detailsPath = appRoutes.serviceDetails(service.id);
  const imageUrl = resolveMediaUrl(service.imageUrl ?? service.galleryUrls?.[0]);
  const isInCart = cartCount > 0;

  return (
    <article className={styles.card}>
      <Link className={styles.link} to={detailsPath}>
        <div className={styles.media} aria-hidden="true">
          {imageUrl ? <img src={imageUrl} alt="" loading="lazy" /> : <div className={styles.mediaPlaceholder}>{service.categoryLabel}</div>}
          <span className={styles.timeBadge}>{service.badgeText}</span>
        </div>
        <div className={styles.body}>
          <span className={styles.category}>{service.categoryLabel}</span>
          <h3>{service.title}</h3>
          <div className={styles.priceRow}>
            <strong>{formatPrice(service.priceRub)}</strong>
          </div>
        </div>
      </Link>
      <div className={styles.actionWrap}>
        <div className={styles.actionButtons}>
          <Button
            className={`${styles.cartAction} ${isInCart ? styles.cartActionActive : ''}`}
            size="sm"
            variant={isInCart ? 'primary' : 'secondary'}
            disabled={isActionDisabled || !onAddToCart}
            aria-label={isInCart ? `В корзине: ${cartCount}` : 'Добавить в корзину'}
            onClick={() => void onAddToCart?.(service)}
          >
            <CartIcon />
            {isInCart ? <strong className={styles.cartCountBadge}>{cartCount}</strong> : null}
            <span className={styles.actionLabel}>В корзину</span>
          </Button>
          <Button className={styles.bookAction} size="sm" disabled={isActionDisabled || !onBook} onClick={() => void onBook?.(service)}>
            Записаться
          </Button>
        </div>
      </div>
    </article>
  );
}

function CartIcon() {
  return (
    <svg className={styles.cartIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 7h13l-1.4 7.5H8L6.8 4.5H4" />
      <path d="M9 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM17 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </svg>
  );
}
