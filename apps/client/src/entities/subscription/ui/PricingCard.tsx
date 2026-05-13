import type { ReactNode } from 'react';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import type { TariffItem } from '../model/types';

interface PricingCardProps {
  item: TariffItem;
  actionSlot?: ReactNode;
}

export function PricingCard({ item, actionSlot }: PricingCardProps) {
  return (
    <article className="pricing-card">
      <p className="pricing-card__title">{item.title}</p>
      <div className="pricing-card__price-row">
        <strong>{formatPrice(item.priceRub)}</strong>
        <span>/ 30 дней</span>
      </div>
      <ul className="pricing-card__features">
        {item.planMeta.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      {actionSlot ?? (
        <button className="ui-btn ui-btn-primary ui-btn-block" type="button">
          Выбрать тариф
        </button>
      )}
    </article>
  );
}
