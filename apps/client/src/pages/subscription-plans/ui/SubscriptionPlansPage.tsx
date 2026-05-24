import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { mockReviews } from '@/entities/review';
import { buildTariffs, type TariffItem, useGetMembershipEntryFeeQuery, useGetSubscriptionPlansQuery } from '@/entities/subscription';
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
  const womenTariffs = pickTariffs(tariffs, ['LADY', 'LADY_SUPER', 'FAMILY', 'FAMILY_SUPER']);
  const menTariffs = pickTariffs(tariffs, ['MISTER', 'MISTER_SUPER', 'FAMILY', 'FAMILY_SUPER']).map(renameFamilyAsRussian);
  const popularServices = (servicesPage?.items ?? []).map((service) => createServiceCardModel(service));
  const popularStudios = studios.slice(0, 2).map(createStudioCardModel);
  const entryFeeText = entryFee?.entryFeeEnabled
    ? `Вступление в клуб ${entryFee.entryFeeRub.toLocaleString('ru-RU')} ₽ при покупке первой подписки.`
    : `Акция: первое вступление в клуб 0 ₽ вместо ${entryFee?.entryFeeRub.toLocaleString('ru-RU') ?? '1 200'} ₽.`;

  return (
    <PageShell title="Тарифы">
      {womenTariffs.length > 0 ? <PlansCarousel title="Для женщин" items={womenTariffs} dotIdPrefix="plans-page-women" /> : null}
      {menTariffs.length > 0 ? <PlansCarousel title="Для мужчин" items={menTariffs} dotIdPrefix="plans-page-men" /> : null}

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

function pickTariffs(tariffs: TariffItem[], codes: string[]) {
  const byCode = new Map(tariffs.map((tariff) => [tariff.code, tariff]));
  return codes.map((code) => byCode.get(code)).filter((tariff): tariff is TariffItem => Boolean(tariff));
}

function renameTariff(tariff: TariffItem, title: string): TariffItem {
  return { ...tariff, title, planMeta: { ...tariff.planMeta, title } };
}

function renameFamilyAsRussian(tariff: TariffItem): TariffItem {
  if (tariff.code === 'FAMILY') return renameTariff(tariff, 'Семейный');
  if (tariff.code === 'FAMILY_SUPER') return renameTariff(tariff, 'Семейный Супер');
  return tariff;
}
