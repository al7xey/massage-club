import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { useGetMySubscriptionQuery } from '@/entities/subscription';

export function MySubscriptionPage() {
  useGetMySubscriptionQuery();

  return (
    <PageShell title="Моя подписка" description="Состояние подписки, включенные услуги и заморозка.">
      <div className="card">Данные подписки будут загружаться из `/api/subscriptions/me`.</div>
    </PageShell>
  );
}
