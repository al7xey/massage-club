import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useGetAdminDashboardQuery } from '@/features/admin';
import { appRoutes } from '@/shared/routes';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './AdminDashboardPage.module.css';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useGetAdminDashboardQuery();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <PageShell title="Админ-панель">
      <div className={styles.metrics}>
        <Metric title="Мастеров" value={isLoading ? '...' : String(dashboard?.masters ?? 0)} />
        <Metric title="Активных студий" value={isLoading ? '...' : String(dashboard?.activeStudios ?? 0)} />
        <Metric title="Записей сегодня" value={isLoading ? '...' : String(dashboard?.todayAppointments ?? 0)} />
        <Metric title="Конфликтов расписания" value={isLoading ? '...' : String(dashboard?.scheduleConflicts ?? 0)} />
      </div>

      <div className={styles.grid}>
        <Link className={styles.card} to={appRoutes.adminSection('masters')}>Мастера</Link>
        <Link className={styles.card} to={appRoutes.adminSection('studios')}>Студии</Link>
        <Link className={styles.card} to={appRoutes.adminSection('schedule')}>Расписание</Link>
        {isSuperAdmin ? <Link className={styles.card} to={appRoutes.superAdminSection('users')}>Пользователи</Link> : null}
        {isSuperAdmin ? <Link className={styles.card} to={appRoutes.superAdminSection('appointments')}>Записи</Link> : null}
        {isSuperAdmin ? <Link className={styles.card} to={appRoutes.superAdminSection('audit-log')}>Журнал действий</Link> : null}
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
