import { useAuth } from '@/context/AuthContext';
import { mockReviews } from '@/entities/review';
import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { buildTariffs, useGetMySubscriptionQuery, useGetSubscriptionPlansQuery } from '@/entities/subscription';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { PlansCarousel } from '@/widgets/plans-carousel';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';
import styles from './SubscriptionPlansPage.module.css';

export function SubscriptionPlansPage() {
  const { user } = useAuth();
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: services = [] } = useGetServicesQuery();
  const { data: studios = [] } = useGetStudiosQuery();
  const { data: activeSubscription } = useGetMySubscriptionQuery(undefined, { skip: !user });

  const tariffs = buildTariffs(plans);
  const popularServices = services.slice(0, 3).map((service, index) => createServiceCardModel(service, index));
  const popularStudios = studios.slice(0, 2).map(createStudioCardModel);
  const remainingCredits = activeSubscription?.credits.reduce((sum, credit) => sum + credit.remainingCredits, 0) ?? 0;

  return (
    <PageShell
      title="Тарифы"
      description="Выберите формат регулярного ухода и экономьте на процедурах при каждом посещении."
    >
      {activeSubscription ? (
        <div className={styles.activeBanner}>
          Сейчас активен тариф <strong>{activeSubscription.plan.name}</strong>. Осталось посещений: <strong>{remainingCredits}</strong>.
          Новый тариф заменит текущий после подтверждения.
        </div>
      ) : null}

      <PlansCarousel title="Клубные подписки" items={tariffs} dotIdPrefix="plans-page" />
      <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={popularServices} />
      <StudioShowcase title="Где пройти процедуру" studios={popularStudios} />
      <ReviewsShowcase
        title="Отзывы наших гостей"
        subtitle="Честные мнения тех, кто уже попробовал"
        reviews={mockReviews}
      />
    </PageShell>
  );
}
