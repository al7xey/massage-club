import { resolveSubscriptionPurchaseMode } from '@massage/shared/lib/subscription-benefits';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useGetMySubscriptionQuery, useGetSubscriptionPlansQuery } from '@/entities/subscription';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { reachGoal } from '@/shared/lib/analytics/yandexMetrika';
import { appRoutes } from '@/shared/routes';
import { Button } from '@/shared/ui';
import { useCreateSubscriptionMutation } from '../api/chooseSubscriptionApi';
import styles from './ChooseSubscriptionButton.module.css';

interface ChooseSubscriptionButtonProps {
  planId: string;
}

export function ChooseSubscriptionButton({ planId }: ChooseSubscriptionButtonProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: activeSubscription } = useGetMySubscriptionQuery(undefined, { skip: !user });
  const [createSubscription, { isLoading }] = useCreateSubscriptionMutation();
  const [message, setMessage] = useState('');

  const handleClick = async () => {
    if (!user) {
      navigate(appRoutes.login(), {
        state: {
          action: 'subscription',
          backgroundLocation: location,
          from: `${appRoutes.subscriptions()}?purchasePlanId=${encodeURIComponent(planId)}`,
          planId,
        },
      });
      return;
    }

    const plan = plans.find((item) => item.id === planId);
    if (!plan) {
      setMessage('Тариф не найден');
      return;
    }

    const purchaseMode = resolveSubscriptionPurchaseMode(activeSubscription?.plan.id, planId);
    const confirmText =
      purchaseMode === 'EXTEND'
        ? `Покупка тарифа\n\nПродлить тариф ${plan.name} еще на ${plan.periodDays} дней за ${plan.monthlyPriceRub.toLocaleString('ru-RU')} ₽?`
        : purchaseMode === 'SWITCH'
          ? `Покупка тарифа\n\nЗаменить текущую подписку тарифом ${plan.name} за ${plan.monthlyPriceRub.toLocaleString('ru-RU')} ₽?`
          : `Покупка тарифа\n\nПодтвердить покупку тарифа ${plan.name} за ${plan.monthlyPriceRub.toLocaleString('ru-RU')} ₽?`;

    if (!window.confirm(confirmText)) {
      return;
    }

    try {
      reachGoal('tariff_select', { planId, planCode: plan.code });
      reachGoal('payment_start', { planId, amountRub: plan.monthlyPriceRub });
      const subscription = await createSubscription({ planId }).unwrap();
      const remainingCredits = subscription.credits.reduce((sum, credit) => sum + credit.remainingCredits, 0);
      reachGoal('payment_success', { planId, subscriptionId: subscription.id });
      setMessage(`Тариф ${subscription.plan.name} активен. Доступных визитов: ${remainingCredits}.`);
    } catch (error) {
      reachGoal('payment_error', { planId });
      setMessage(getApiErrorMessage(error, 'Не удалось купить тариф'));
    }
  };

  return (
    <div className={styles.root}>
      <Button data-plan-id={planId} fullWidth isLoading={isLoading} loadingText="Оформляем..." onClick={handleClick}>
        Выбрать тариф
      </Button>
      {message ? <span className={styles.message}>{message}</span> : null}
    </div>
  );
}
