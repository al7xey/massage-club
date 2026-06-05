import type { KeyboardEvent, ReactNode } from 'react';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { Button } from '@/shared/ui';
import type { TariffItem } from '../model/types';
import styles from './PricingCard.module.css';

interface PricingCardProps {
  item: TariffItem;
  actionSlot?: ReactNode;
  onOpen?: () => void;
}

export function PricingCard({ item, actionSlot, onOpen }: PricingCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onOpen || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    onOpen();
  };

  return (
    <article
      className={styles.card}
      data-clickable={onOpen ? 'true' : undefined}
      data-featured={item.isFeatured ? 'true' : undefined}
      role={onOpen ? 'link' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
    >
      <div>
        <p className={styles.title}>{item.title}</p>
      </div>
      <div className={styles.priceRow}>
        <strong>{formatPrice(item.priceRub)}</strong>
        <span>/ месяц</span>
      </div>
      <ul className={styles.features}>
        {item.planMeta.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      {actionSlot ?? <Button fullWidth>Выбрать</Button>}
    </article>
  );
}
