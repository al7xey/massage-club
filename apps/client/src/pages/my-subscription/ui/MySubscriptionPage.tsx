import { Link } from 'react-router-dom';
import { useGetMySubscriptionQuery } from '@/entities/subscription';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { appRoutes } from '@/shared/routes';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './MySubscriptionPage.module.css';

export function MySubscriptionPage() {
  const { data: subscription, isLoading, error } = useGetMySubscriptionQuery();
  const remainingCredits = subscription?.credits.reduce((sum, credit) => sum + credit.remainingCredits, 0) ?? 0;

  return (
    <PageShell title="Моя подписка" description="Состояние подписки, включённые посещения и срок действия.">
      <div className={styles.card}>
        {isLoading ? <p className={styles.empty}>Загружаем подписку...</p> : null}
        {error ? <p className={styles.error}>{getApiErrorMessage(error, 'Не удалось загрузить подписку')}</p> : null}

        {!isLoading && !error && subscription ? (
          <div className={styles.statList}>
            <h2>{subscription.plan.name}</h2>
            <p><span>Статус</span><strong>{subscription.status}</strong></p>
            <p><span>Осталось посещений</span><strong>{remainingCredits}</strong></p>
            <p><span>Действует до</span><strong>{new Intl.DateTimeFormat('ru-RU').format(new Date(subscription.endsAt))}</strong></p>
            <div className={styles.actions}>
              <Link to={appRoutes.booking()}>Записаться по подписке</Link>
            </div>
          </div>
        ) : null}

        {!isLoading && !error && !subscription ? (
          <>
            <h2>Подписка не активна</h2>
            <p className={styles.empty}>Выберите тариф, чтобы получать скидки и включённые посещения.</p>
            <div className={styles.actions}>
              <Link to={appRoutes.subscriptions()}>Выбрать тариф</Link>
            </div>
          </>
        ) : null}
      </div>
    </PageShell>
  );
}
