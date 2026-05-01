import { useGetMySubscriptionQuery } from '@/shared/api/subscriptionsApi';
import { Page } from '@/shared/ui/Page';

export function MySubscriptionPage() {
  useGetMySubscriptionQuery();

  return (
    <Page title="Моя подписка" description="Состояние подписки, включенные услуги и заморозка.">
      <div className="card">Данные подписки будут загружаться из `/api/subscriptions/me`.</div>
    </Page>
  );
}
