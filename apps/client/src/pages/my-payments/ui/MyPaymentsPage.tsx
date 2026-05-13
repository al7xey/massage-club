import { PageShell } from '@/shared/ui/page-shell/PageShell';

export function MyPaymentsPage() {
  return (
    <PageShell title="Мои платежи" description="История mock-payment операций.">
      <div className="card">Платежи будут связаны с `/api/payments/:id` и mock checkout.</div>
    </PageShell>
  );
}
