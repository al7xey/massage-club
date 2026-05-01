import { useGetMyAppointmentsQuery } from '@/shared/api/appointmentsApi';
import { Page } from '@/shared/ui/Page';

export function MyAppointmentsPage() {
  useGetMyAppointmentsQuery();

  return (
    <Page title="Мои записи" description="История и будущие процедуры клиента.">
      <div className="card">Данные будут загружаться из `/api/appointments/my`.</div>
    </Page>
  );
}
