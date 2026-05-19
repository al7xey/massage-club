import { resolveSubscriptionPurchaseMode } from '@massage/shared/lib/subscription-benefits';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGetMySubscriptionQuery, useGetSubscriptionPlansQuery } from '@/entities/subscription';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { appRoutes } from '@/shared/routes';
import { useCreateSubscriptionMutation } from '../api/chooseSubscriptionApi';
import styles from './ChooseSubscriptionButton.module.css';

interface ChooseSubscriptionButtonProps {
  planId: string;
}

export function ChooseSubscriptionButton({ planId }: ChooseSubscriptionButtonProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: activeSubscription } = useGetMySubscriptionQuery(undefined, { skip: !user });
  const [createSubscription, { isLoading }] = useCreateSubscriptionMutation();
  const [message, setMessage] = useState('');

  const handleClick = async () => {
    if (!user) {
      navigate(appRoutes.login(), { state: { from: appRoutes.subscriptions() } });
      return;
    }

    const plan = plans.find((item) => item.id === planId);
    if (!plan) {
      setMessage('Тариф не найден');
      return;
    }

    const purchaseMode = resolveSubscriptionPurchaseMode(activeSubscription?.plan.id, planId);
    const confirmText = purchaseMode === 'EXTEND'
      ? `Продлить тариф ${plan.name} ещё на 30 дней за ${plan.monthlyPriceRub.toLocaleString('ru-RU')} ₽?`
      : purchaseMode === 'SWITCH'
        ? `Заменить текущую подписку тарифом ${plan.name} за ${plan.monthlyPriceRub.toLocaleString('ru-RU')} ₽?`
        : `Подтвердить покупку тарифа ${plan.name} за ${plan.monthlyPriceRub.toLocaleString('ru-RU')} ₽?`;

    if (!window.confirm(confirmText)) {
      return;
    }

    try {
      const subscription = await createSubscription({ planId }).unwrap();
      const remainingCredits = subscription.credits.reduce((sum, credit) => sum + credit.remainingCredits, 0);
      setMessage(`Тариф ${subscription.plan.name} активен. Доступных визитов: ${remainingCredits}.`);
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Не удалось купить тариф'));
    }
  };

  return (
    <div className={styles.root}>
      <button className={styles.button} type="button" data-plan-id={planId} onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Оформляем...' : 'Выбрать тариф'}
      </button>
      {message ? <span className={styles.message}>{message}</span> : null}
    </div>
  );
}
