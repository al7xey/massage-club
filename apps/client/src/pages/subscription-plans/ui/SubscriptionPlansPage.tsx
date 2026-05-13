import { HomeBreadcrumb } from '@/shared/ui/breadcrumbs/HomeBreadcrumb';
import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { mockReviews } from '@/entities/review';
import { buildTariffs, useGetSubscriptionPlansQuery } from '@/entities/subscription';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { PlansCarousel } from '@/widgets/plans-carousel';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';

export function SubscriptionPlansPage() {
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: services = [] } = useGetServicesQuery();
  const { data: studios = [] } = useGetStudiosQuery();

  const tariffs = buildTariffs(plans);
  const popularServices = services
    .slice(0, 4)
    .map((service, index) => createServiceCardModel(service, index));
  const popularStudios = studios.slice(0, 2).map(createStudioCardModel);

  return (
    <main className="page">
      <PlansCarousel
        title="Тарифы"
        items={tariffs}
        breadcrumb={<HomeBreadcrumb />}
        dotIdPrefix="plans-page"
      />

      <section className="promo-line">
        <strong>Акция «Легкий старт»</strong>
        <span>Вступительный взнос 1200 ₽ 0 ₽ при покупке первой подписки!</span>
      </section>

      <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={popularServices} />
      <StudioShowcase title="Где пройти процедуру" studios={popularStudios} />
      <ReviewsShowcase
        title="Отзывы наших гостей"
        subtitle="Честные мнения тех, кто уже попробовал"
        actionLabel="Смотреть все"
        reviews={mockReviews}
      />
    </main>
  );
}
