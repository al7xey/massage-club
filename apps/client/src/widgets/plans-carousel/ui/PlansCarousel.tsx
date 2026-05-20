import { type ReactNode } from 'react';
import { PricingCard, type TariffItem } from '@/entities/subscription';
import { ChooseSubscriptionButton } from '@/features/choose-subscription';
import styles from './PlansCarousel.module.css';

interface PlansCarouselProps {
  title: string;
  subtitle?: string;
  items: TariffItem[];
  breadcrumb?: ReactNode;
  dotIdPrefix?: string;
  titleLevel?: 'h1' | 'h2';
  topAction?: ReactNode;
}

export function PlansCarousel({
  title,
  subtitle,
  items,
  breadcrumb,
  titleLevel = 'h2',
  topAction,
}: PlansCarouselProps) {
  const TitleTag = titleLevel;

  return (
    <section className={styles.section}>
      {breadcrumb}
      <div className={styles.top}>
        <div>
          <TitleTag className={titleLevel === 'h1' ? styles.titlePage : styles.title}>{title}</TitleTag>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        {topAction ? <div className={styles.actions}>{topAction}</div> : null}
      </div>

      <div className={styles.track}>
        {items.map((item) => (
          <div className={styles.slide} key={item.id}>
            <div className={styles.slideInner}>
              <PricingCard item={item} actionSlot={<ChooseSubscriptionButton planId={item.id} />} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
