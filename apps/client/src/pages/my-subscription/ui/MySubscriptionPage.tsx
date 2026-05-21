import {
  useCancelAutoRenewalMutation,
  useFreezeMySubscriptionMutation,
  useGetMySubscriptionQuery,
  useRenewNowMutation,
  useReplaceCardMutation,
  type SubscriptionStatus,
} from '@/entities/subscription';
import { reachGoal } from '@/shared/lib/analytics/yandexMetrika';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { appRoutes } from '@/shared/routes';
import { Button, LinkButton } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './MySubscriptionPage.module.css';

const statusLabels: Record<SubscriptionStatus, string> = {
  ACTIVE: 'Активна',
  FROZEN: 'Заморожена',
  AUTO_RENEWAL_DISABLED: 'Отключено автопродление',
  PAYMENT_ISSUE: 'Проблема с оплатой',
  EXPIRED: 'Завершена',
};

export function MySubscriptionPage() {
  const { data: subscription, error, isLoading } = useGetMySubscriptionQuery();
  const [freezeSubscription, freezeState] = useFreezeMySubscriptionMutation();
  const [cancelAutoRenewal, cancelState] = useCancelAutoRenewalMutation();
  const [renewNow, renewState] = useRenewNowMutation();
  const [replaceCard, replaceCardState] = useReplaceCardMutation();

  const remainingCredits = subscription?.credits.reduce((sum, credit) => sum + credit.remainingCredits, 0) ?? 0;
  const graceDaysLeft = subscription?.gracePeriodEndsAt
    ? Math.max(0, Math.ceil((new Date(subscription.gracePeriodEndsAt).getTime() - Date.now()) / 86400000))
    : 0;

  const isActionLoading =
    freezeState.isLoading || cancelState.isLoading || renewState.isLoading || replaceCardState.isLoading;

  return (
    <PageShell
      title="Моя подписка"
      description="Статус подписки, включенные посещения, автопродление и платежные действия."
    >
      <div className={styles.card}>
        {isLoading ? <p className={styles.empty}>Загружаем подписку...</p> : null}
        {error ? <p className={styles.error}>{getApiErrorMessage(error, 'Не удалось загрузить подписку')}</p> : null}

        {!isLoading && !error && subscription ? (
          <div className={styles.statList}>
            <h2>{subscription.plan.name}</h2>

            {subscription.status === 'PAYMENT_ISSUE' ? (
              <p className={styles.warning}>
                Не удалось продлить подписку, проверьте карту или выберите другой способ оплаты.
                {graceDaysLeft > 0 ? ` Grace period: ${graceDaysLeft} дн.` : ' Grace period завершен.'}
              </p>
            ) : null}

            {subscription.status === 'FROZEN' && subscription.frozenUntil ? (
              <p className={styles.warning}>
                Подписка заморожена до {formatDate(subscription.frozenUntil)}. Дата списания сдвинута.
              </p>
            ) : null}

            {subscription.status === 'AUTO_RENEWAL_DISABLED' ? (
              <p className={styles.warning}>
                Оплаченный период действует до {formatDate(subscription.endsAt)}, следующее списание отключено.
              </p>
            ) : null}

            <p>
              <span>Статус</span>
              <strong>{statusLabels[subscription.status]}</strong>
            </p>
            <p>
              <span>Осталось посещений</span>
              <strong>{remainingCredits}</strong>
            </p>
            <p>
              <span>Действует до</span>
              <strong>{formatDate(subscription.endsAt)}</strong>
            </p>
            <p>
              <span>Автопродление</span>
              <strong>{subscription.autoRenewalEnabled ? 'Включено' : 'Отключено'}</strong>
            </p>
            <p>
              <span>Скидка на услуги</span>
              <strong>{subscription.plan.discountPercent}%</strong>
            </p>
            <p>
              <span>Скидка на сертификаты</span>
              <strong>{subscription.plan.certificateDiscountPercent}%</strong>
            </p>

            <div className={styles.actions}>
              <LinkButton className={styles.actionButton} size="sm" to={appRoutes.booking()} variant="secondary">
                Записаться по подписке
              </LinkButton>
              <Button className={styles.actionButton} variant="secondary" disabled={isActionLoading} size="sm" onClick={() => void renewNow(subscription.id)}>
                Продлить сейчас
              </Button>
              <Button
                className={styles.actionButton}
                variant="secondary"
                size="sm"
                disabled={isActionLoading}
                onClick={() => void replaceCard(subscription.id)}
              >
                Заменить карту
              </Button>
              <Button
                className={styles.actionButton}
                variant="secondary"
                size="sm"
                disabled={isActionLoading || subscription.status === 'AUTO_RENEWAL_DISABLED'}
                onClick={() => {
                  reachGoal('subscription_cancel', { subscriptionId: subscription.id });
                  void cancelAutoRenewal(subscription.id);
                }}
              >
                Отключить автопродление
              </Button>
              <Button
                className={styles.actionButton}
                variant="secondary"
                size="sm"
                disabled={isActionLoading || subscription.status === 'FROZEN'}
                onClick={() => {
                  reachGoal('subscription_freeze', { subscriptionId: subscription.id });
                  void freezeSubscription(subscription.id);
                }}
              >
                Заморозить на 30 дней
              </Button>
            </div>
          </div>
        ) : null}

        {!isLoading && !error && !subscription ? (
          <>
            <h2>Подписка не активна</h2>
            <p className={styles.empty}>Выберите тариф, чтобы получать скидки и включенные посещения.</p>
            <div className={styles.actions}>
              <LinkButton className={styles.actionButton} size="sm" to={appRoutes.subscriptions()} variant="secondary">
                Выбрать тариф
              </LinkButton>
            </div>
          </>
        ) : null}
      </div>
    </PageShell>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(value));
}
