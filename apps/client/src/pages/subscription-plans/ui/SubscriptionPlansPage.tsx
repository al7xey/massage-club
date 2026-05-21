import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { mockReviews } from '@/entities/review';
import { buildTariffs, useGetMembershipEntryFeeQuery, useGetSubscriptionPlansQuery } from '@/entities/subscription';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { useAuth } from '@/features/auth';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { PlansCarousel } from '@/widgets/plans-carousel';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';
import styles from './SubscriptionPlansPage.module.css';

export function SubscriptionPlansPage() {
  const { user } = useAuth();
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: entryFee } = useGetMembershipEntryFeeQuery();
  const { data: servicesPage } = useGetServicesQuery({ limit: 4, sort: 'popular' });
  const { data: studios = [] } = useGetStudiosQuery();

  const tariffs = buildTariffs(plans);
  const womenTariffs = tariffs.filter((item) => item.segment === 'women' || item.segment === 'family');
  const menTariffs = [...tariffs]
    .filter((item) => item.segment === 'men' || item.segment === 'family')
    .sort((left, right) => getMenTariffOrder(left.code) - getMenTariffOrder(right.code));
  const popularServices = (servicesPage?.items ?? []).map((service) => createServiceCardModel(service));
  const popularStudios = studios.slice(0, 2).map(createStudioCardModel);
  const entryFeeText = entryFee?.entryFeeEnabled
    ? `Вступительный взнос ${entryFee.entryFeeRub.toLocaleString('ru-RU')} ₽ действует при покупке первой подписки.`
    : `Бессрочная акция: первый вступительный взнос ${entryFee?.entryFeeRub.toLocaleString('ru-RU') ?? '1 200'} ₽ сейчас 0 ₽.`;

  const isMaleAccount = user?.gender === 'MALE';
  const isFemaleAccount = user?.gender === 'FEMALE';

  return (
    <PageShell title="Тарифы">
      {isMaleAccount ? (
        <PlansCarousel title="Доступные тарифы" items={menTariffs} dotIdPrefix="plans-page-men" />
      ) : null}

      {isFemaleAccount ? (
        <PlansCarousel title="Доступные тарифы" items={womenTariffs} dotIdPrefix="plans-page-women" />
      ) : null}

      {!user ? (
        <>
          <PlansCarousel title="Для женщин" items={womenTariffs} dotIdPrefix="plans-page-women" />
          <PlansCarousel title="Для мужчин" items={menTariffs} dotIdPrefix="plans-page-men" />
        </>
      ) : null}

      <section className={styles.promo}>
        <span aria-hidden="true">%</span>
        <div>
          <strong>Вступительный взнос</strong>
          <p>{entryFeeText}</p>
        </div>
      </section>

      {popularServices.length > 0 ? <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={popularServices} /> : null}
      <StudioShowcase title="Где пройти процедуру" actionLabel="Посмотреть на карте" studios={popularStudios} />
      <ReviewsShowcase title="Отзывы гостей" subtitle="Мнения гостей клуба" actionLabel="Смотреть все" reviews={mockReviews} />
    </PageShell>
  );
}

function getMenTariffOrder(code: string) {
  const order: Record<string, number> = {
    MISTER: 0,
    MISTER_SUPER: 1,
    FAMILY: 2,
    FAMILY_SUPER: 3,
  };

  return order[code] ?? Number.MAX_SAFE_INTEGER;
}
