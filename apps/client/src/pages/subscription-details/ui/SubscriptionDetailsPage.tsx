import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubscriptionPlanTitle, useGetSubscriptionPlansQuery } from '@/entities/subscription';
import { ChooseSubscriptionButton } from '@/features/choose-subscription';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { appRoutes } from '@/shared/routes';
import { EmptyState, LinkButton } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './SubscriptionDetailsPage.module.css';

export function SubscriptionDetailsPage() {
  const { planId = '' } = useParams();
  const navigate = useNavigate();
  const { data: plans = [], isLoading } = useGetSubscriptionPlansQuery();
  const plan = useMemo(() => plans.find((item) => item.id === planId), [planId, plans]);
  const title = plan ? getSubscriptionPlanTitle(plan.code, plan.name) : 'Тариф';

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

  const audience = getAudienceText(plan.code);
  const visitWord = getVisitWord(plan.includedCredits);
  const periodDays = plan.periodDays > 0 ? plan.periodDays : 30;
  const details = [
    {
      title: `${plan.includedCredits} ${visitWord} в месяц`,
      text: 'Визиты можно использовать для подходящих услуг клуба. Один визит списывается при оформлении записи',
    },
    {
      title: `Скидка ${plan.discountPercent}% на все услуги`,
      text: 'После подключения тарифа скидка применяется к услугам клуба автоматически',
    },
    {
      title: `Сертификаты дешевле на ${plan.certificateDiscountPercent}%`,
      text: 'Скидка действует на оформление электронных и бумажных сертификатов',
    },
    {
      title: plan.freezeCountPerYear > 0 ? `Заморозка ${plan.freezeCountPerYear} раз в год` : 'Без заморозки',
      text:
        plan.freezeCountPerYear > 0
          ? `Можно поставить тариф на паузу до ${plan.freezeDays} ${getDayWord(plan.freezeDays)}`
          : 'Тариф работает без временной паузы',
    },
  ];

  return (
    <PageShell title={title} beforeTitle={<BackButton onClick={() => navigate(-1)} />}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>{audience}</span>
          <h2>{title}</h2>
          <p>
            Единая подписка на регулярный уход: включенные визиты, скидка на услуги и понятные условия на месяц
          </p>
        </div>
        <div className={styles.summary}>
          <strong>{formatPrice(plan.monthlyPriceRub)}</strong>
          <span>/ месяц</span>
          <ChooseSubscriptionButton planId={plan.id} />
        </div>
      </section>

      <section className={styles.infoGrid} aria-label="Условия тарифа">
        {details.map((item) => (
          <article className={styles.infoCard} key={item.title}>
            <span aria-hidden="true" />
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.explainer}>
        <div>
          <h2>Как это работает</h2>
          <p>
            Вы подключаете тариф на {periodDays} {getDayWord(periodDays)}. В начале периода доступны включенные визиты.
            При записи на услугу подходящий визит списывается первым, а если визиты закончились, применяется скидка тарифа.
          </p>
        </div>
        <div className={styles.note}>
          <strong>Прозрачно по цене</strong>
          <p>
            На карточках услуг показана разовая цена. В корзине и при записи система учитывает активный тариф:
            включенный визит или скидку {plan.discountPercent}% на все услуги.
          </p>
        </div>
      </section>
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

function getAudienceText(code: string) {
  if (code.startsWith('LADY')) {
    return 'Для женщин';
  }

  if (code.startsWith('MISTER')) {
    return 'Для мужчин';
  }

  return 'Для семьи';
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
