import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createReviewCardModel, useGetReviewsQuery } from '@/entities/review';
import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import {
  getSubscriptionPlanSlug,
  getSubscriptionPlanTitle,
  normalizeSubscriptionPlanSlug,
  useGetSubscriptionPlansQuery,
} from '@/entities/subscription';
import { ChooseSubscriptionButton } from '@/features/choose-subscription';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { appRoutes } from '@/shared/routes';
import { EmptyState, LinkButton } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';
import styles from './SubscriptionDetailsPage.module.css';

export function SubscriptionDetailsPage() {
  const { planId = '' } = useParams();
  const navigate = useNavigate();
  const normalizedSlug = normalizeSubscriptionPlanSlug(planId);
  const { data: plans = [], isLoading } = useGetSubscriptionPlansQuery();
  const { data: servicesPage } = useGetServicesQuery({ limit: 4, sort: 'popular' });
  const { data: studios = [] } = useGetStudiosQuery();
  const { data: reviews = [] } = useGetReviewsQuery();

  const plan = useMemo(
    () => plans.find((item) => item.id === planId || getSubscriptionPlanSlug(item.code) === normalizedSlug),
    [normalizedSlug, planId, plans],
  );
  const title = plan ? getSubscriptionPlanTitle(plan.code, plan.name) : 'Тариф';
  const popularServices = (servicesPage?.items ?? []).map((service) => createServiceCardModel(service));
  const studioCards = studios.slice(0, 2).map(createStudioCardModel);
  const reviewCards = reviews.slice(0, 3).map(createReviewCardModel);

  if (isLoading) {
    return (
      <PageShell title="Тарифы" beforeTitle={<BackButton onClick={() => navigate(-1)} />}>
        <p className={styles.state}>Загружаем условия тарифа...</p>
      </PageShell>
    );
  }

  if (!plan) {
    return (
      <PageShell title="Тарифы" beforeTitle={<BackButton onClick={() => navigate(-1)} />}>
        <EmptyState
          title="Тариф не найден"
          description="Проверьте ссылку или вернитесь к списку тарифов"
          actions={<LinkButton to={appRoutes.subscriptions()}>Все тарифы</LinkButton>}
        />
      </PageShell>
    );
  }

  const conditions = getPlanConditions(plan);
  const periodDays = plan.periodDays > 0 ? plan.periodDays : 30;

  return (
    <PageShell title={title} hideTitle beforeTitle={<BackButton onClick={() => navigate(-1)} />}>
      <section className={styles.detailsCard}>
        <div className={styles.heading}>
          <h2>{title}</h2>
          <p>{getIntroText(plan.code)}</p>
        </div>

        <div className={styles.conditionList}>
          {conditions.map((condition) => (
            <section className={styles.conditionRow} key={condition.title}>
              <span className={styles.checkIcon} aria-hidden="true" />
              <div>
                <h3>{condition.title}</h3>
                <p>{condition.text}</p>
              </div>
            </section>
          ))}
        </div>

        <section className={styles.howItWorks}>
          <h3>Как работает тариф</h3>
          <p>
            Тариф подключается на {periodDays} {getDayWord(periodDays)}. В начале периода доступны включенные визиты:
            они списываются при записи на подходящую услугу. Если включенные визиты закончились, на остальные услуги
            применяется скидка {plan.discountPercent}%.
          </p>
          <p>
            Неиспользованный включенный визит можно перенести на следующий месяц, но не дольше чем на 2 месяца. Если
            нужен перерыв, тариф можно поставить на паузу по условиям заморозки.
          </p>
        </section>

        <div className={styles.purchaseBar}>
          <div className={styles.priceBlock}>
            <strong>{formatPrice(plan.monthlyPriceRub)}</strong>
            <span>/ месяц</span>
          </div>
          <ChooseSubscriptionButton planId={plan.id} />
        </div>
      </section>

      {popularServices.length > 0 ? <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={popularServices} /> : null}
      <StudioShowcase title="Где пройти процедуру" actionLabel="Подробнее" studios={studioCards} />
      <ReviewsShowcase title="Отзывы гостей" subtitle="Мнения гостей клуба" actionLabel="Смотреть все" reviews={reviewCards} />
    </PageShell>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.backButton} type="button" aria-label="Назад" onClick={onClick}>
      <svg className={styles.backIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M19 12H5" />
        <path d="m11 6-6 6 6 6" />
      </svg>
    </button>
  );
}

function getIntroText(code: string) {
  if (code.startsWith('LADY')) {
    return 'Регулярный уход для восстановления, расслабления и поддержки тела каждый месяц';
  }

  if (code.startsWith('MISTER')) {
    return 'Регулярный массаж и восстановление для мужского формата услуг клуба';
  }

  return 'Подписка для нескольких участников с включенными визитами и клубной скидкой';
}

function getPlanConditions(plan: {
  certificateDiscountPercent: number;
  code: string;
  discountPercent: number;
  familyMembersLimit: number;
  freezeCountPerYear: number;
  freezeDays: number;
  includedCredits: number;
}) {
  const isSuper = plan.code.endsWith('_SUPER');
  const isMister = plan.code.startsWith('MISTER');
  const isFamily = plan.code.startsWith('FAMILY');
  const visitTitle = isFamily
    ? `${plan.includedCredits} ${getVisitWord(plan.includedCredits)} для участников`
    : `${plan.includedCredits} ${getVisitWord(plan.includedCredits)} в месяц`;
  const visitText = getVisitText(plan.includedCredits, isMister, isFamily);
  const freezeText =
    plan.freezeCountPerYear > 0
      ? `${plan.freezeCountPerYear} ${getFreezeWord(plan.freezeCountPerYear)} в год. Каждая пауза может длиться до ${plan.freezeDays} ${getDayWord(plan.freezeDays)}`
      : 'Тариф работает без временной паузы';

  return [
    {
      title: visitTitle,
      text: visitText,
    },
    {
      title: `Скидка ${plan.discountPercent}% на все услуги`,
      text: isMister
        ? 'Скидка действует на мужские массажи, SPA, уходы за лицом, фито-сауну и другие подходящие услуги клуба'
        : 'Скидка действует на массажи, SPA, уходы за лицом, фито-сауну, коррекцию фигуры, косметологию и другие услуги клуба',
    },
    {
      title: `Скидка ${plan.certificateDiscountPercent}% на сертификаты`,
      text: 'Можно оформить электронный или бумажный подарочный сертификат любого номинала дешевле',
    },
    {
      title: 'Перенос визитов',
      text: 'Неиспользованный включенный визит можно перенести на следующий месяц. Максимальный срок переноса — до 2 месяцев',
    },
    {
      title: isSuper ? 'Заморозка два раза в год' : 'Заморозка один раз в год',
      text: freezeText,
    },
    {
      title: 'Бонус за друга',
      text: isSuper
        ? 'За подключение друга можно получить бесплатный сеанс: массаж спины и ШВЗ 30 минут или массаж 60 минут при SUPER-подписке'
        : 'За подключение друга можно получить бесплатный сеанс массажа спины и ШВЗ продолжительностью 30 минут',
    },
  ];
}

function getVisitText(count: number, isMister: boolean, isFamily: boolean) {
  if (isFamily) {
    return count >= 4
      ? 'По одной услуге для каждого из четырех участников: массаж 60 минут или фирменная процедура ухода за лицом'
      : 'По одной услуге для каждого из двух участников: массаж 60 минут или фирменная процедура ухода за лицом';
  }

  if (count >= 2) {
    return isMister
      ? 'Два любых мужских массажа продолжительностью по 60 минут'
      : 'Две услуги на выбор: любой массаж 60 минут или фирменная процедура ухода за лицом';
  }

  return isMister
    ? 'Один любой мужской массаж продолжительностью 60 минут'
    : 'Один любой массаж продолжительностью 60 минут или одна фирменная процедура ухода за лицом на выбор';
}

function getVisitWord(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'визит';
  }

  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'визита';
  }

  return 'визитов';
}

function getDayWord(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'день';
  }

  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'дня';
  }

  return 'дней';
}

function getFreezeWord(count: number) {
  if (count === 1) {
    return 'раз';
  }

  return 'раза';
}
