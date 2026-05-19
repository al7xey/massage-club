import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAddCartItemMutation } from '@/entities/cart';
import { appRoutes } from '@/shared/routes';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import type { ServiceCardModel } from '../model/types';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
  service: ServiceCardModel;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addCartItem] = useAddCartItemMutation();
  const detailsPath = appRoutes.serviceDetails(service.id);

  const navigateToAuth = (action: 'book' | 'cart') => {
    navigate(appRoutes.login(), {
      state: {
        action,
        from: detailsPath,
        serviceId: service.id,
      },
    });
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigateToAuth('cart');
      return;
    }

    await addCartItem({ serviceId: service.id }).unwrap();
    navigate(appRoutes.cart());
  };

  const handleBook = async () => {
    if (!user) {
      navigateToAuth('book');
      return;
    }

    await addCartItem({ serviceId: service.id }).unwrap();
    navigate(`${appRoutes.booking()}?serviceId=${service.id}`);
  };

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
          <button className={styles.secondaryButton} type="button" onClick={() => void handleAddToCart()}>
            В корзину
          </button>
          <button className={styles.bookButton} type="button" onClick={() => void handleBook()}>
            Записаться
          </button>
        </div>
      </div>
    </article>
  );
}
