import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import type { UiPlanMeta, UiReview, UiServiceCard, UiStudioMeta } from '@/shared/types/publicUi';
import { formatPrice } from '@/shared/config/publicContent';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
}

interface ServiceCardProps {
  service: UiServiceCard;
}

interface PricingCardProps {
  title: string;
  priceRub: number;
  planMeta: UiPlanMeta;
}

interface ReviewCardProps {
  review: UiReview;
}

interface StudioCardProps {
  title: string;
  address: string;
  meta: UiStudioMeta;
}

interface InfoPanelProps extends PropsWithChildren {
  title: string;
}

function stars(rating: number): string {
  const rounded = Math.max(1, Math.min(5, Math.round(rating)));
  return '★'.repeat(rounded);
}

export function HomeCrumb() {
  return (
    <p className="home-crumb">
      <Link to="/">Главная</Link>
    </p>
  );
}

export function SectionHeader({ title, subtitle, actionLabel }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actionLabel ? (
        <button className="ui-btn ui-btn-outline" type="button">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function ServiceCard({ service }: ServiceCardProps) {
  const detailsPath = `/services/${service.id}`;

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

export function PricingCard({ title, priceRub, planMeta }: PricingCardProps) {
  return (
    <article className="pricing-card">
      <p className="pricing-card__title">{title}</p>
      <div className="pricing-card__price-row">
        <strong>{formatPrice(priceRub)}</strong>
        <span>/ 30 дней</span>
      </div>
      <ul className="pricing-card__features">
        {planMeta.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <button className="ui-btn ui-btn-primary ui-btn-block" type="button">
        Выбрать тариф
      </button>
    </article>
  );
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="review-card">
      <p className="review-card__author">{review.author}</p>
      <p className="review-card__stars">{stars(review.rating)}</p>
      <p className="review-card__text">"{review.text}"</p>
      <p className="review-card__meta">{review.role}</p>
      <p className="review-card__meta">{review.date}</p>
    </article>
  );
}

export function StudioCard({ title, address, meta }: StudioCardProps) {
  return (
    <article className="studio-card">
      <div className="studio-card__icon" aria-hidden>
        •
      </div>
      <div className="studio-card__content">
        <h3>{title}</h3>
        <p>{address}</p>
        <p>{meta.openLabel}</p>
      </div>
      <button className="ui-btn ui-btn-outline" type="button">
        Записаться
      </button>
    </article>
  );
}

export function InfoPanel({ title, children }: InfoPanelProps) {
  return (
    <aside className="info-panel">
      <h3>{title}</h3>
      {children}
    </aside>
  );
}
