import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { createReviewCardModel, useGetReviewsQuery } from '@/entities/review';
import {
  buildTariffs,
  type TariffItem,
  useGetMembershipEntryFeeQuery,
  useGetMySubscriptionQuery,
  useGetSubscriptionPlansQuery,
} from '@/entities/subscription';
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
  const { data: activeSubscription } = useGetMySubscriptionQuery(undefined, { skip: !user });
  const { data: entryFee } = useGetMembershipEntryFeeQuery();
  const { data: servicesPage } = useGetServicesQuery({ limit: 4, sort: 'popular' });
  const { data: studios = [] } = useGetStudiosQuery();
  const { data: reviews = [] } = useGetReviewsQuery();

  const tariffs = buildTariffs(plans);
  const userTariffs = user ? pickTariffs(tariffs, getAvailableTariffCodes(user.gender, activeSubscription?.plan.code)) : [];
  const womenTariffs = pickTariffs(tariffs, ['LADY', 'LADY_SUPER', 'FAMILY', 'FAMILY_SUPER']);
  const menTariffs = pickTariffs(tariffs, ['MISTER', 'MISTER_SUPER', 'FAMILY', 'FAMILY_SUPER']);
  const popularServices = (servicesPage?.items ?? []).map((service) => createServiceCardModel(service));
  const popularStudios = studios.slice(0, 2).map(createStudioCardModel);
  const reviewCards = reviews.slice(0, 3).map(createReviewCardModel);
  const entryFeeText = entryFee
    ? entryFee.entryFeeEnabled
      ? `Разовый вступительный платёж: ${entryFee.entryFeeRub.toLocaleString('ru-RU')} ₽.`
      : `Сейчас вступление бесплатно вместо ${entryFee.entryFeeRub.toLocaleString('ru-RU')} ₽.`
    : 'Условия вступления загружаются.';

  return (
    <PageShell title="Тарифы">
      <section className={styles.tariffIntro} aria-label="Как работают тарифы">
        <div>
          <strong>Что входит в визит</strong>
          <p>Включенный визит — это массаж 60 минут или фирменный уход за лицом. В SUPER-тарифах таких визита два</p>
        </div>
        <div>
          <strong>Скидка на все услуги</strong>
          <p>После подключения тарифа действует скидка 20% или 30% на массажи, SPA, уходы, фито-сауну и другие услуги клуба</p>
        </div>
        <div>
          <strong>Перенос и пауза</strong>
          <p>Неиспользованные визиты можно перенести до 2 месяцев, а подписку поставить на паузу по условиям тарифа</p>
        </div>
      </section>

      {user ? (
        userTariffs.length > 0 ? (
          <PlansCarousel title="Рекомендуемые тарифы" items={userTariffs} dotIdPrefix="plans-page-recommended" />
        ) : (
          <section className={styles.promo}>
            <span aria-hidden="true">✓</span>
            <div>
              <strong>Ваш тариф уже активен</strong>
              <p>Все доступные преимущества уже подключены.</p>
            </div>
          </section>
        )
      ) : (
        <>
          {womenTariffs.length > 0 ? <PlansCarousel title="Для женщин" items={womenTariffs} dotIdPrefix="plans-page-women" /> : null}
          {menTariffs.length > 0 ? <PlansCarousel title="Для мужчин" items={menTariffs} dotIdPrefix="plans-page-men" /> : null}
        </>
      )}

      <section className={styles.promo}>
        <span aria-hidden="true">%</span>
        <div>
          <strong>Вступление в клуб</strong>
          <p>{entryFeeText}</p>
        </div>
      </section>

      {popularServices.length > 0 ? <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={popularServices} /> : null}
      <StudioShowcase title="Где пройти процедуру" actionLabel="Подробнее" studios={popularStudios} />
      <ReviewsShowcase title="Отзывы гостей" subtitle="Мнения гостей клуба" actionLabel="Смотреть все" reviews={reviewCards} />
    </PageShell>
  );
}

function pickTariffs(tariffs: TariffItem[], codes: string[]) {
  const byCode = new Map(tariffs.map((tariff) => [tariff.code, tariff]));
  return codes.map((code) => byCode.get(code)).filter((tariff): tariff is TariffItem => Boolean(tariff));
}

function getAvailableTariffCodes(gender: string, activeCode?: string) {
  if (activeCode?.startsWith('FAMILY')) {
    return activeCode === 'FAMILY' ? ['FAMILY_SUPER'] : [];
  }

  const personalCodes = gender === 'MALE' ? ['MISTER', 'MISTER_SUPER'] : ['LADY', 'LADY_SUPER'];

  if (!activeCode) {
    return [...personalCodes, 'FAMILY', 'FAMILY_SUPER'];
  }

  const upgradeCodes = activeCode.endsWith('_SUPER') ? [] : [personalCodes[1]];
  return [...upgradeCodes, 'FAMILY', 'FAMILY_SUPER'].filter((code) => code !== activeCode);
}
