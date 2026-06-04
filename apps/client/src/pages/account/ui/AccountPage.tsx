import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useCancelAppointmentMutation, useGetMyAppointmentsQuery } from '@/entities/appointment';
import { getSubscriptionPlanTitle, useGetMySubscriptionQuery } from '@/entities/subscription';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { formatUserDisplayName } from '@/shared/lib/auth/formatUserDisplayName';
import { resolveMediaUrl } from '@/shared/lib/media';
import { appRoutes } from '@/shared/routes';
import { Button, ConfirmModal, LinkButton } from '@/shared/ui';
import styles from './AccountPage.module.css';

export function AccountPage() {
  const { user } = useAuth();
  const { data: subscription } = useGetMySubscriptionQuery();
  const { data: appointments = [] } = useGetMyAppointmentsQuery();
  const [cancelAppointment, { isLoading: isCancellingAppointment }] = useCancelAppointmentMutation();
  const [message, setMessage] = useState('');
  const [pendingCancelAppointmentId, setPendingCancelAppointmentId] = useState<string | null>(null);

  const remainingCredits = useMemo(
    () => subscription?.credits.reduce((sum, credit) => sum + credit.remainingCredits, 0) ?? 0,
    [subscription],
  );

  const serviceVisits = useMemo(
    () => appointments.filter((appointment) => appointment.status !== 'CANCELLED'),
    [appointments],
  );

  const upcomingAppointments = useMemo(
    () =>
      [...serviceVisits]
        .filter((appointment) => ['SCHEDULED', 'CONFIRMED'].includes(appointment.status))
        .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()),
    [serviceVisits],
  );

  const recentAppointments = useMemo(
    () =>
      [...serviceVisits]
        .sort((left, right) => new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime())
        .slice(0, 4),
    [serviceVisits],
  );

  const nextAppointment = upcomingAppointments[0] ?? null;
  const userDisplayName = user ? formatUserDisplayName(user) : '';
  const accountInitial = (user?.fullName?.trim()?.[0] ?? 'Р').toUpperCase();
  const nextPaymentDate = subscription ? getNextPaymentDate(subscription.startsAt, subscription.endsAt) : null;
  const daysLeft = nextPaymentDate ? Math.max(0, Math.ceil((nextPaymentDate.getTime() - Date.now()) / 86400000)) : 0;
  const ringProgress = subscription ? Math.max(8, Math.min(100, Math.round((daysLeft / 30) * 100))) : 0;

  if (!user) {
    return null;
  }

  const subscriptionDetailsLink = (
    <LinkButton className={styles.actionButton} size="sm" to={appRoutes.accountSubscription()} variant="secondary">
      <span className={styles.actionText}>Подробнее</span>
      <ActionArrow />
    </LinkButton>
  );

  const requestCancelAppointment = (appointmentId: string) => {
    setMessage('');
    setPendingCancelAppointmentId(appointmentId);
  };

  const confirmCancelAppointment = async () => {
    if (!pendingCancelAppointmentId) {
      return;
    }

    try {
      await cancelAppointment(pendingCancelAppointmentId).unwrap();
      setPendingCancelAppointmentId(null);
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Не удалось отменить запись'));
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.topbar}>
        <div className={styles.profileBadge}>
          <Link className={styles.avatar} to={appRoutes.accountSettings()} aria-label="Открыть настройки профиля">
            {user.avatarUrl ? <img src={resolveMediaUrl(user.avatarUrl)} alt={userDisplayName} /> : accountInitial}
          </Link>
          <div className={styles.profileIdentity}>
            <h1>{userDisplayName}</h1>
          </div>
        </div>

        <div className={styles.topbarActions}>
          <LinkButton
            className={`${styles.settingsButton} ${styles.actionButton}`}
            variant="secondary"
            to={appRoutes.accountSettings()}
          >
            Настройки
          </LinkButton>
        </div>
      </section>

      <section className={styles.subscriptionPanel}>
        <div className={styles.subscriptionBlock}>
          <div className={styles.sectionLead}>
            <LinkButton className={styles.actionButton} size="sm" to={appRoutes.accountSubscription()} variant="secondary">
              <span className={styles.actionText}>Подробнее</span>
              <ActionArrow />
            </LinkButton>
          </div>

          {subscription ? (
            <div className={styles.subscriptionContent}>
              <div className={styles.subscriptionCopy}>
                <div className={styles.subscriptionHeading}>
                  <h2>{getSubscriptionPlanTitle(subscription.plan.code, subscription.plan.name)}</h2>
                  {subscriptionDetailsLink}
                </div>
                <p>
                  Активна до {formatDate(subscription.endsAt)}.
                  {nextPaymentDate ? ` Следующий платеж ${formatDate(nextPaymentDate.toISOString())}.` : ''}
                  {' '}Следите за остатком посещений и бронируйте удобные слоты заранее.
                </p>
                <div className={styles.subscriptionMeta}>
                  <InfoPill label="Посещений" value={String(remainingCredits)} />
                  <InfoPill label="Скидка" value={`${subscription.plan.discountPercent}%`} />
                </div>
                <div className={styles.subscriptionActions}>
                  <LinkButton className={styles.actionButton} size="sm" to={appRoutes.booking()} variant="secondary">
                    Записаться
                  </LinkButton>
                  <LinkButton className={styles.actionButton} size="sm" to={appRoutes.subscriptions()} variant="secondary">
                    Тарифы клуба
                  </LinkButton>
                </div>
              </div>

              <div
                className={styles.subscriptionRing}
                style={{ '--ring-progress': `${ringProgress}%` } as CSSProperties}
              >
                <div>
                  <strong>{daysLeft}</strong>
                  <span>дней</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.subscriptionContent}>
              <div className={styles.subscriptionCopy}>
                <h2>Подписка не подключена</h2>
                <p>Выберите клубный тариф, чтобы получить специальные цены и включённые посещения.</p>
                <div className={styles.subscriptionActions}>
                  <LinkButton className={styles.actionButton} size="sm" to={appRoutes.subscriptions()} variant="secondary">
                    Выбрать подписку
                  </LinkButton>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.summaryStrip}>
          <article className={styles.summaryCard}>
            <span>Ближайшие записи</span>
            <strong>{upcomingAppointments.length}</strong>
            <small>{nextAppointment ? formatDateTime(nextAppointment.startsAt) : 'Пока нет ближайшего визита'}</small>
          </article>
          <article className={styles.summaryCard}>
            <span>История услуг</span>
            <strong>{serviceVisits.length}</strong>
            <small>{serviceVisits.length > 0 ? 'Все ваши визиты собраны в одном месте' : 'После первой записи здесь появится история'}</small>
          </article>
        </div>
      </section>

      <section className={styles.tiles}>
        <QuickTile
          title="Мои записи"
          description={nextAppointment ? nextAppointment.service.title : 'Все предстоящие и прошедшие визиты'}
          to={appRoutes.accountAppointments()}
          tone="accent"
          size="standard"
        />
        <QuickTile
          title="Подарочные карты"
          description="Оформление сертификатов для себя и близких."
          to={appRoutes.certificates()}
          tone="light"
          size="standard"
        />
        <QuickTile
          title="История платежей"
          description="Открыть список покупок и оплат в кабинете."
          to={appRoutes.accountPayments()}
          tone="soft"
          size="standard"
        />
        <QuickTile
          title="Мастера"
          description="Выберите специалиста и посмотрите доступные студии."
          to={appRoutes.masters()}
          tone="light"
          size="standard"
        />
      </section>

      {message ? <p className={styles.message}>{message}</p> : null}

      <ConfirmModal
        confirmLabel="Отменить запись"
        description="Запись будет отменена, а время снова станет доступным для расписания."
        isLoading={isCancellingAppointment}
        isOpen={Boolean(pendingCancelAppointmentId)}
        title="Отменить будущую запись?"
        onClose={() => setPendingCancelAppointmentId(null)}
        onConfirm={() => void confirmCancelAppointment()}
      />

      <section className={`${styles.lowerGrid} ${styles.lowerGridSingle}`}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Ваши визиты</h3>
            </div>
            <LinkButton className={styles.actionButton} size="sm" to={appRoutes.accountAppointments()} variant="secondary">
              <span className={styles.actionText}>Открыть все</span>
              <ActionArrow />
            </LinkButton>
          </div>

          {nextAppointment ? (
            <div className={styles.highlightVisit}>
              <strong>{nextAppointment.service.title}</strong>
              <p>{formatDateTime(nextAppointment.startsAt)}</p>
              <span>
                {formatUserDisplayName(nextAppointment.master)} · {nextAppointment.studio.name}
              </span>
              <div className={styles.inlineActions}>
                <LinkButton className={styles.actionButton} to={appRoutes.booking()} variant="secondary">
                  Новая запись
                </LinkButton>
                <Button
                  className={styles.actionButton}
                  variant="secondary"
                  onClick={() => requestCancelAppointment(nextAppointment.id)}
                  disabled={isCancellingAppointment}
                >
                  Отменить
                </Button>
              </div>
            </div>
          ) : (
            <p className={styles.empty}>Ближайших записей пока нет. Можно сразу выбрать новую услугу и удобное время.</p>
          )}

          <div className={styles.visitList}>
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment) => (
                <VisitRow
                  key={appointment.id}
                  meta={`${formatDateTime(appointment.startsAt)} · ${appointment.studio.name}`}
                  status={formatAppointmentStatus(appointment.status)}
                  title={appointment.service.title}
                />
              ))
            ) : (
              <p className={styles.empty}>После первой записи здесь появится история посещений.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function QuickTile({
  description,
  size,
  title,
  to,
  tone,
}: {
  description: string;
  size: 'wide' | 'standard';
  title: string;
  to: string;
  tone: 'accent' | 'soft' | 'light';
}) {
  return (
    <Link className={`${styles.tile} ${styles[`tile${size}`]} ${styles[`tile${tone}`]}`} to={to}>
      <span className={styles.tileMark}>{title.slice(0, 1)}</span>
      <strong>{title}</strong>
      <p>{description}</p>
    </Link>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoPill}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ActionArrow() {
  return (
    <svg className={styles.actionArrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function VisitRow({ meta, status, title }: { meta: string; status: string; title: string }) {
  return (
    <div className={styles.visitRow}>
      <div>
        <strong>{title}</strong>
        <span>{meta}</span>
      </div>
      <em>{status}</em>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(value));
}

function getNextPaymentDate(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const now = new Date();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const next = new Date(start);
  while (next <= now && next < end) {
    next.setDate(next.getDate() + 30);
  }

  return next < end ? next : end;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatAppointmentStatus(status: string) {
  const normalizedStatus = status.toUpperCase();
  const labels: Record<string, string> = {
    SCHEDULED: 'Запланировано',
    CONFIRMED: 'Подтверждено',
    COMPLETED: 'Завершено',
    CANCELLED: 'Отменено',
  };

  return labels[normalizedStatus] ?? status;
}
