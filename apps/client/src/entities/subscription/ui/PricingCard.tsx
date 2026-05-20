import type { ReactNode } from 'react';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { Button } from '@/shared/ui';
import type { TariffItem } from '../model/types';
import styles from './PricingCard.module.css';

interface PricingCardProps {
  item: TariffItem;
  actionSlot?: ReactNode;
}

export function PricingCard({ item, actionSlot }: PricingCardProps) {
  return (
    <article className={styles.card}>
      <div>
        <p className={styles.title}>{item.title}</p>
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
        <Button fullWidth>
          Выбрать тариф
        </Button>
      )}
    </article>
  );
}
