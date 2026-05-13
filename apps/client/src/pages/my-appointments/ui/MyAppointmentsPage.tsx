import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { useGetMyAppointmentsQuery } from '@/entities/appointment';

export function MyAppointmentsPage() {
  useGetMyAppointmentsQuery();

  return (
    <PageShell title="Мои записи" description="История и будущие процедуры клиента.">
      <div className="card">Данные будут загружаться из `/api/appointments/my`.</div>
    </PageShell>
  );
}
