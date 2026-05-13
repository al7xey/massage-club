import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { appRoutes } from '@/shared/routes';
import { useGetAdminSummaryQuery } from '../api/adminDashboardApi';

export function AdminDashboardPage() {
  useGetAdminSummaryQuery();

  return (
    <PageShell title="Админ-панель" description="Операционное управление сетью, записью, клиентами и сертификатами.">
      <div className="grid">
        <a className="card" href={appRoutes.adminSection('services')}>
          Услуги
        </a>
        <a className="card" href={appRoutes.adminSection('masters')}>
          Мастера
        </a>
        <a className="card" href={appRoutes.adminSection('appointments')}>
          Записи
        </a>
        <a className="card" href={appRoutes.adminSection('analytics')}>
          Аналитика
        </a>
      </div>
    </PageShell>
  );
}
