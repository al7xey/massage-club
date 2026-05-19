import { useGetMyPaymentsQuery } from '@/entities/payment';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './MyPaymentsPage.module.css';

export function MyPaymentsPage() {
  const { data: payments = [], isLoading, error } = useGetMyPaymentsQuery();

  return (
    <PageShell title="Мои платежи" description="История оплат, сертификатов и подписок.">
      <div className={styles.card}>
        {isLoading ? <p className={styles.empty}>Загружаем платежи...</p> : null}
        {error ? <p className={styles.error}>{getApiErrorMessage(error, 'Не удалось загрузить платежи')}</p> : null}
        {!isLoading && !error && payments.length === 0 ? <p className={styles.empty}>Покупок пока нет.</p> : null}

        <div className={styles.list}>
          {payments.map((payment) => (
            <div className={styles.item} key={payment.id}>
              <div className={styles.meta}>
                <strong>{payment.purpose}</strong>
                <p>{new Intl.DateTimeFormat('ru-RU').format(new Date(payment.createdAt))}</p>
                <span>{formatPaymentStatus(payment.status)}</span>
              </div>
              <strong className={styles.amount}>{formatPrice(payment.amountRub)}</strong>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function formatPaymentStatus(status: string) {
  const normalizedStatus = status.toUpperCase();
  const labels: Record<string, string> = {
    PAID: 'Оплачено',
    PENDING: 'Ожидает оплаты',
    FAILED: 'Не оплачено',
    REFUNDED: 'Возврат',
  };

  return labels[normalizedStatus] ?? status;
}
