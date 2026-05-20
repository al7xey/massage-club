import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { mockReviews } from '@/entities/review';
import { buildTariffs, useGetSubscriptionPlansQuery } from '@/entities/subscription';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { repeatToLength } from '@/shared/lib/collection/repeatToLength';
import { PlansCarousel } from '@/widgets/plans-carousel';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';
import styles from './SubscriptionPlansPage.module.css';

export function SubscriptionPlansPage() {
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: services = [] } = useGetServicesQuery();
  const { data: studios = [] } = useGetStudiosQuery();

  const tariffs = buildTariffs(plans);
  const popularServices = repeatToLength(services, 4).map((service, index) => createServiceCardModel(service, index));
  const popularStudios = studios.slice(0, 2).map(createStudioCardModel);

  return (
    <PageShell
      title="Тарифы"
      description="Выберите формат регулярного ухода и экономьте на процедурах при каждом посещении."
    >
      <PlansCarousel title="Клубные подписки" items={tariffs} dotIdPrefix="plans-page" />

      <section className={styles.promo}>
        <span aria-hidden="true">□</span>
        <div>
          <strong>Акция «Легкий старт»</strong>
          <p>Вступительный взнос 1200 ₽ 0 ₽ при покупке первой подписки!</p>
        </div>
      </section>

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
