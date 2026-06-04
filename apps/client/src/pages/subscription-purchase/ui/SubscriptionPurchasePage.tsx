import { resolveSubscriptionPurchaseMode } from '@massage/shared/lib/subscription-benefits';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getSubscriptionPlanTitle,
  useGetMySubscriptionQuery,
  useGetSubscriptionPlansQuery,
  type SubscriptionPurchaseDto,
} from '@/entities/subscription';
import { useCreateSubscriptionMutation } from '@/features/choose-subscription';
import { reachGoal } from '@/shared/lib/analytics/yandexMetrika';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { appRoutes } from '@/shared/routes';
import { Button, EmptyState, LinkButton } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './SubscriptionPurchasePage.module.css';

const purchaseModeMeta = {
  ACTIVATE: {
    description: 'Тариф начнет действовать сразу после подтверждения покупки.',
    label: 'Новый тариф',
    submitLabel: 'Купить тариф',
  },
  EXTEND: {
    description: 'Срок действия текущего тарифа продлится без потери оставшихся визитов.',
    label: 'Продление',
    submitLabel: 'Продлить тариф',
  },
  SWITCH: {
    description: 'Текущий тариф будет заменен новым, а доступ и скидки переключатся сразу.',
    label: 'Смена тарифа',
    submitLabel: 'Перейти на тариф',
  },
} as const;

export function SubscriptionPurchasePage() {
  const { planId } = useParams<{ planId: string }>();
  const { data: plans = [], error: plansError, isLoading: isLoadingPlans } = useGetSubscriptionPlansQuery();
  const { data: activeSubscription } = useGetMySubscriptionQuery();
  const [createSubscription, { isLoading: isSubmitting }] = useCreateSubscriptionMutation();
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState<SubscriptionPurchaseDto | null>(null);

  const plan = useMemo(() => plans.find((item) => item.id === planId), [planId, plans]);
  const purchaseMode = plan ? resolveSubscriptionPurchaseMode(activeSubscription?.plan.id, plan.id) : 'ACTIVATE';
  const purchaseMeta = purchaseModeMeta[purchaseMode];
  const remainingCredits = activeSubscription?.credits.reduce((sum, credit) => sum + credit.remainingCredits, 0) ?? 0;
  const planTitle = plan ? getSubscriptionPlanTitle(plan.code, plan.name) : '';
  const displayedPeriodDays = plan ? getDisplayedPeriodDays(plan.periodDays) : 30;

  const features = useMemo(() => {
    if (!plan) {
      return [];
    }

    return [
      plan.includedDescription?.trim() || `${plan.includedCredits} включенных визитов`,
      `Скидка ${plan.discountPercent}% на услуги`,
      `Скидка ${plan.certificateDiscountPercent}% на сертификаты`,
      plan.freezeCountPerYear > 0
        ? `Заморозка до ${plan.freezeCountPerYear} раз(а) в год по ${plan.freezeDays} дней`
        : 'Без заморозки',
      plan.familyMembersLimit > 1 ? `До ${plan.familyMembersLimit} участников` : 'Для одного участника',
    ];
  }, [plan]);

  const handleConfirm = async () => {
    if (!plan) {
      return;
    }

    setErrorMessage('');

    try {
      reachGoal('payment_start', { amountRub: plan.monthlyPriceRub, planCode: plan.code, planId: plan.id });
      const subscription = await createSubscription({ planId: plan.id }).unwrap();
      reachGoal('payment_success', { planId: plan.id, subscriptionId: subscription.id });
      setSuccess(subscription);
    } catch (error) {
      reachGoal('payment_error', { planId: plan.id });
      setErrorMessage(getApiErrorMessage(error, 'Не удалось оформить тариф.'));
    }
  };

  if (success) {
    const availableVisits = success.credits.reduce((sum, credit) => sum + credit.remainingCredits, 0);

    return (
      <PageShell title="Покупка тарифа">
        <section className={styles.root}>
          <article className={styles.successCard}>
            <span className={styles.kicker}>Тариф активирован</span>
            <h2>{getSubscriptionPlanTitle(success.plan.code, success.plan.name)}</h2>
            <p className={styles.successText}>Покупка завершена, подписка уже доступна в личном кабинете.</p>
            <div className={styles.metricGrid}>
              <Metric label="Статус" value={purchaseModeMeta[success.purchaseMode].label} />
              <Metric label="Сумма" value={formatPrice(success.payment.amountRub)} />
              <Metric label="Доступно визитов" value={String(availableVisits)} />
            </div>
            <div className={styles.actions}>
              <LinkButton to={appRoutes.accountSubscription()}>Моя подписка</LinkButton>
              <LinkButton to={appRoutes.subscriptions()} variant="secondary">
                К тарифам
              </LinkButton>
            </div>
          </article>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell title="Покупка тарифа" description="Проверьте условия тарифа и подтвердите оформление подписки.">
      <section className={styles.root}>
        {isLoadingPlans ? <p className={styles.state}>Загружаем тариф...</p> : null}
        {!isLoadingPlans && plansError ? (
          <p className={styles.error}>{getApiErrorMessage(plansError, 'Не удалось загрузить тариф.')}</p>
        ) : null}

        {!isLoadingPlans && !plansError && !plan ? (
          <EmptyState
            title="Тариф не найден"
            description="Вернитесь к списку тарифов и выберите вариант заново."
            actions={<LinkButton to={appRoutes.subscriptions()}>К тарифам</LinkButton>}
          />
        ) : null}

        {plan ? (
          <div className={styles.layout}>
            <div className={styles.stage}>
              <article className={styles.heroCard}>
                <div className={styles.heroHeader}>
                  <span className={styles.kicker}>{purchaseMeta.label}</span>
                  <strong>{formatPrice(plan.monthlyPriceRub)}</strong>
                </div>
                <h2>{planTitle}</h2>
                <p>{purchaseMeta.description}</p>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <span className={styles.kicker}>Что входит</span>
                  <h3>Состав тарифа</h3>
                </div>
                <ul className={styles.featureList}>
                  {features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <span className={styles.kicker}>Текущее состояние</span>
                  <h3>Подписка и скидки</h3>
                </div>
                <div className={styles.infoGrid}>
                  <InfoItem
                    label="Текущий тариф"
                    value={
                      activeSubscription
                        ? getSubscriptionPlanTitle(activeSubscription.plan.code, activeSubscription.plan.name)
                        : 'Нет активного тарифа'
                    }
                  />
                  <InfoItem label="Осталось визитов" value={String(remainingCredits)} />
                  <InfoItem label="Период нового тарифа" value={`${displayedPeriodDays} дней`} />
                  <InfoItem label="Скидка на услуги" value={`${plan.discountPercent}%`} />
                </div>
              </article>

            </div>

            <aside className={styles.sideSummary}>
              <span className={styles.kicker}>Итого</span>
              <strong>{formatPrice(plan.monthlyPriceRub)}</strong>
              <div className={styles.actions}>
                <Button isLoading={isSubmitting} loadingText="Оформляем..." onClick={handleConfirm}>
                  {purchaseMeta.submitLabel}
                </Button>
              </div>
              <p>{displayedPeriodDays} дней доступа и все преимущества тарифа активируются после покупки.</p>
              <dl className={styles.summaryList}>
                <InfoRow label="Тариф" value={planTitle} />
                <InfoRow label="Формат" value={purchaseMeta.label} />
                <InfoRow label="Включено" value={`${plan.includedCredits} визитов`} />
                <InfoRow label="Скидка" value={`${plan.discountPercent}%`} />
              </dl>
            </aside>
          </div>
        ) : null}

        {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
      </section>
    </PageShell>
  );
}

function getDisplayedPeriodDays(periodDays?: number) {
  return periodDays && periodDays > 0 ? Math.min(periodDays, 30) : 30;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.infoCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
