import type { ReactNode } from 'react';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import type { TariffItem } from '../model/types';
import styles from './PricingCard.module.css';

interface PricingCardProps {
  item: TariffItem;
  actionSlot?: ReactNode;
}

export function PricingCard({ item, actionSlot }: PricingCardProps) {
  const isFeatured = item.title.toLowerCase().includes('super') && !item.title.toLowerCase().includes('family');

  return (
    <article className={styles.card} data-featured={isFeatured ? 'true' : undefined}>
      <div>
        <p className={styles.title}>{item.title}</p>
        <p className={styles.subtitle}>{item.planMeta.subtitle}</p>
      </div>
      <div className={styles.priceRow}>
        <strong>{formatPrice(item.priceRub)}</strong>
        <span>/ 30 дней</span>
      </div>
      <ul className={styles.features}>
        {item.planMeta.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      {actionSlot ?? (
        <button className={styles.button} type="button">
          Выбрать тариф
        </button>
      )}
    </article>
  );
}
