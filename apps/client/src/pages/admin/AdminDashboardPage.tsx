import { useGetAdminSummaryQuery } from '@/shared/api/adminApi';
import { Page } from '@/shared/ui/Page';

export function AdminDashboardPage() {
  useGetAdminSummaryQuery();

  return (
    <Page title="Админ-панель" description="Операционное управление сетью, записью, клиентами и сертификатами.">
      <div className="grid">
        <a className="card" href="/admin/services">Услуги</a>
        <a className="card" href="/admin/masters">Мастера</a>
        <a className="card" href="/admin/appointments">Записи</a>
        <a className="card" href="/admin/analytics">Аналитика</a>
      </div>
    </Page>
  );
}
