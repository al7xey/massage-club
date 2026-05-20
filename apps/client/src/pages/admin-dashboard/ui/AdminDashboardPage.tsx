import { Link } from 'react-router-dom';
import { useGetAdminSummaryQuery } from '@/features/admin';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { appRoutes } from '@/shared/routes';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './AdminDashboardPage.module.css';

export function AdminDashboardPage() {
  const { data: summary, isLoading } = useGetAdminSummaryQuery();

  return (
    <PageShell title="Админ-панель" description="Операционное управление сетью, записями, клиентами и сертификатами.">
      <div className={styles.metrics}>
        <Metric title="Пользователи" value={isLoading ? '...' : String(summary?.users ?? 0)} />
        <Metric title="Активные подписки" value={isLoading ? '...' : String(summary?.activeSubscriptions ?? 0)} />
        <Metric title="Записи" value={isLoading ? '...' : String(summary?.appointments ?? 0)} />
        <Metric title="Продажи" value={isLoading ? '...' : formatPrice(summary?.paymentsRub ?? 0)} />
      </div>

      <div className={styles.grid}>
        <Link className={styles.card} to={appRoutes.adminSection('users')}>Пользователи</Link>
        <Link className={styles.card} to={appRoutes.adminSection('services')}>Услуги</Link>
        <Link className={styles.card} to={appRoutes.adminSection('subscriptions')}>Подписки</Link>
        <Link className={styles.card} to={appRoutes.adminSection('appointments')}>Записи</Link>
        <Link className={styles.card} to={appRoutes.adminSection('certificates')}>Сертификаты</Link>
      </div>
    </PageShell>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className={styles.metric}>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}
