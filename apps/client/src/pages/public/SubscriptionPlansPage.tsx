import { useGetSubscriptionPlansQuery } from '@/shared/api/subscriptionsApi';
import { Page } from '@/shared/ui/Page';

export function SubscriptionPlansPage() {
  const { data = [] } = useGetSubscriptionPlansQuery();

  return (
    <Page title="Тарифы подписки" description="ЛЕДИ, МИСТЕР и семейные тарифы с включенными услугами и скидками.">
      <div className="grid">
        {data.map((plan) => (
          <article className="card" key={plan.id}>
            <span className="badge">{plan.discountPercent}% скидка</span>
            <h2>{plan.name}</h2>
            <p>{plan.includedCredits} включенных процедур</p>
            <strong>{plan.monthlyPriceRub} ₽ / месяц</strong>
          </article>
        ))}
      </div>
    </Page>
  );
}
