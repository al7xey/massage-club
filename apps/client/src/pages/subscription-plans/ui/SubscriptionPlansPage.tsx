import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { mockReviews } from '@/entities/review';
import { buildTariffs, useGetMembershipEntryFeeQuery, useGetSubscriptionPlansQuery } from '@/entities/subscription';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { PlansCarousel } from '@/widgets/plans-carousel';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';
import styles from './SubscriptionPlansPage.module.css';

export function SubscriptionPlansPage() {
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: entryFee } = useGetMembershipEntryFeeQuery();
  const { data: servicesPage } = useGetServicesQuery({ limit: 4, sort: 'popular' });
  const { data: studios = [] } = useGetStudiosQuery();

  const tariffs = buildTariffs(plans);
  const popularServices = (servicesPage?.items ?? []).map((service) => createServiceCardModel(service));
  const popularStudios = studios.slice(0, 2).map(createStudioCardModel);
  const entryFeeText = entryFee?.entryFeeEnabled
    ? `Вступление в клуб ${entryFee.entryFeeRub.toLocaleString('ru-RU')} ₽ при покупке первой подписки.`
    : `Акция: первое вступление в клуб 0 ₽ вместо ${entryFee?.entryFeeRub.toLocaleString('ru-RU') ?? '1 200'} ₽.`;

  return (
    <PageShell title="Тарифы">
      {tariffs.length > 0 ? <PlansCarousel title="Тарифы клуба" items={tariffs} dotIdPrefix="plans-page" /> : null}

      <section className={styles.promo}>
        <span aria-hidden="true">%</span>
        <div>
          <strong>Вступление в клуб</strong>
          <p>{entryFeeText}</p>
        </div>
      </section>

      {popularServices.length > 0 ? <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={popularServices} /> : null}
      <StudioShowcase title="Где пройти процедуру" actionLabel="Подробнее" studios={popularStudios} />
      <ReviewsShowcase title="Отзывы гостей" subtitle="Мнения гостей клуба" actionLabel="Смотреть все" reviews={mockReviews} />
    </PageShell>
  );
}
