import type { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { reachGoal } from '@/shared/lib/analytics/yandexMetrika';
import { appRoutes } from '@/shared/routes';
import { Button } from '@/shared/ui';
import styles from './ChooseSubscriptionButton.module.css';

interface ChooseSubscriptionButtonProps {
  planId: string;
}

export function ChooseSubscriptionButton({ planId }: ChooseSubscriptionButtonProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    reachGoal('tariff_select', { planId });

    if (!user) {
      navigate(appRoutes.login(), {
        state: {
          action: 'subscription',
          backgroundLocation: location,
          from: appRoutes.subscriptionPurchase(planId),
          planId,
        },
      });
      return;
    }

    navigate(appRoutes.subscriptionPurchase(planId));
  };

  return (
    <div className={styles.root}>
      <Button data-plan-id={planId} fullWidth onClick={handleClick}>
        Выбрать
      </Button>
    </div>
  );
}
