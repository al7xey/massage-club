import { Link } from 'react-router-dom';
import { appRoutes } from '@/shared/routes';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import type { ServiceCardModel } from '../model/types';

interface ServiceCardProps {
  service: ServiceCardModel;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const detailsPath = appRoutes.serviceDetails(service.id);

  return (
    <article className="service-card">
      <Link className="service-card__link" to={detailsPath}>
        <div className={`service-card__image service-card__image--${service.tone}`}>
          {service.badgeText ? <span className="service-card__badge">{service.badgeText}</span> : null}
        </div>
        <div className="service-card__body">
          <p className="service-card__category">{service.categoryLabel}</p>
          <h3>{service.title}</h3>
          <p className="service-card__meta">{service.durationMinutes} мин</p>
          {service.oldPriceRub ? <p className="service-card__old-price">{formatPrice(service.oldPriceRub)}</p> : null}
          <div className="service-card__price-row">
            <strong>{formatPrice(service.priceRub)}</strong>
            <span className="ui-chip">Клуб</span>
          </div>
        </div>
      </Link>
      <div className="service-card__actions">
        <Link className="ui-btn ui-btn-primary ui-btn-block service-card__book-btn" to={detailsPath}>
          Записаться
        </Link>
      </div>
    </article>
  );
}
