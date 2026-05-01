import { Page } from '@/shared/ui/Page';

export function MyPaymentsPage() {
  return (
    <Page title="Мои платежи" description="История mock-payment операций.">
      <div className="card">Платежи будут связаны с `/api/payments/:id` и mock checkout.</div>
    </Page>
  );
}
