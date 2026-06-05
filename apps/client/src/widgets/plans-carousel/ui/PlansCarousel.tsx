import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubscriptionPlanSlug, PricingCard, type TariffItem } from '@/entities/subscription';
import { ChooseSubscriptionButton } from '@/features/choose-subscription';
import { appRoutes } from '@/shared/routes';
import { cx } from '@/shared/ui';
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
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      {breadcrumb}
      <div className={styles.top}>
        <div>
          <TitleTag className={titleLevel === 'h1' ? styles.titlePage : styles.title}>{title}</TitleTag>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        {topAction ? <div className={styles.actions}>{renderTopAction(topAction)}</div> : null}
      </div>

      <div className={styles.track}>
        {items.map((item) => (
          <div className={styles.slide} key={item.id}>
            <div className={styles.slideInner}>
              <PricingCard
                item={item}
                actionSlot={<ChooseSubscriptionButton planId={item.id} />}
                onOpen={() => navigate(appRoutes.subscriptionDetails(getSubscriptionPlanSlug(item.code)))}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function renderTopAction(action: ReactNode) {
  if (!isValidElement(action)) {
    return action;
  }

  const element = action as ReactElement<{ className?: string; children?: ReactNode }>;

  return cloneElement(
    element,
    {
      className: cx(element.props.className, styles.compactAction),
    },
    <>
      <span className={styles.actionText}>{element.props.children}</span>
      <ActionArrow />
    </>,
  );
}

function ActionArrow() {
  return (
    <svg className={styles.actionArrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
