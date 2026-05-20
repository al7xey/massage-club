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
  const womenTariffs = tariffs.filter((item) => item.segment === 'women' || item.segment === 'family');
  const menTariffs = tariffs.filter((item) => item.segment === 'men' || item.segment === 'family');
  const popularServices = (servicesPage?.items ?? []).map((service) => createServiceCardModel(service));
  const popularStudios = studios.slice(0, 2).map(createStudioCardModel);
  const entryFeeText = entryFee?.entryFeeEnabled
    ? `Вступительный взнос ${entryFee.entryFeeRub.toLocaleString('ru-RU')} ₽ действует при покупке первой подписки.`
    : `Бессрочная акция: первый вступительный взнос ${entryFee?.entryFeeRub.toLocaleString('ru-RU') ?? '1 200'} ₽ сейчас 0 ₽.`;

  return (
    <PageShell
      title="Тарифы"
      description="Выберите формат регулярного ухода: включенные услуги, скидки на каталог и заморозка подписки."
    >
      <PlansCarousel
        title="Для женщин"
        subtitle="Леди-планы для восстановления, ухода и мягкого ритма. Семейные тарифы тоже доступны здесь."
        items={womenTariffs}
        dotIdPrefix="plans-page-women"
      />
      <PlansCarousel
        title="Для мужчин"
        subtitle="Мистер-планы с акцентом на восстановление и силовой массаж. Семейные тарифы тоже доступны здесь."
        items={menTariffs}
        dotIdPrefix="plans-page-men"
      />

      <section className={styles.promo}>
        <span aria-hidden="true">%</span>
        <div>
          <strong>Вступительный взнос</strong>
          <p>{entryFeeText}</p>
        </div>
      </section>

      {popularServices.length > 0 ? <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={popularServices} /> : null}
      <StudioShowcase title="Где пройти процедуру" studios={popularStudios} />
      <ReviewsShowcase title="Отзывы гостей" subtitle="Мнения гостей клуба" reviews={mockReviews} />
    </PageShell>
  );
}
