import { FormEvent, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCancelAppointmentMutation, useGetMyAppointmentsQuery } from '@/entities/appointment';
import { useGetMySubscriptionQuery } from '@/entities/subscription';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { formatUserDisplayName } from '@/shared/lib/auth/formatUserDisplayName';
import { appRoutes } from '@/shared/routes';
import styles from './AccountPage.module.css';

export function AccountPage() {
  const navigate = useNavigate();
  const profileRef = useRef<HTMLElement | null>(null);
  const { logout, updateProfile, user } = useAuth();
  const { data: subscription } = useGetMySubscriptionQuery();
  const { data: appointments = [] } = useGetMyAppointmentsQuery();
  const [cancelAppointment, { isLoading: isCancellingAppointment }] = useCancelAppointmentMutation();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName ?? '');
    setEmail(user?.email ?? '');
    setPhone(user?.phone ?? '');
  }, [user]);

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
  const daysLeft = subscription ? Math.max(0, Math.ceil((new Date(subscription.endsAt).getTime() - Date.now()) / 86400000)) : 0;
  const ringProgress = subscription ? Math.max(8, Math.min(100, Math.round((daysLeft / 30) * 100))) : 0;

  useEffect(() => {
    if (isSettingsOpen) {
      profileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isSettingsOpen]);

  if (!user) {
    return null;
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setMessage('Укажите имя и фамилию');
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setMessage('Нужен хотя бы один контакт: email или телефон');
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setMessage('Профиль обновлён');
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Не удалось сохранить профиль'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(appRoutes.home());
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm('Отменить будущую запись?')) {
      return;
    }

    try {
      await cancelAppointment(appointmentId).unwrap();
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Не удалось отменить запись'));
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.topbar}>
        <div className={styles.profileBadge}>
          <div className={styles.avatar}>{accountInitial}</div>
          <div className={styles.profileIdentity}>
            <span className={styles.overline}>Профиль клиента</span>
            <h1>{userDisplayName}</h1>
          </div>
        </div>

        <button
          type="button"
          className={styles.settingsButton}
          onClick={() => setIsSettingsOpen((current) => !current)}
        >
          Настройки
        </button>
      </section>

      <section className={styles.subscriptionPanel}>
        <div className={styles.subscriptionBlock}>
          <div className={styles.sectionLead}>
            <span className={styles.sectionLabel}>Подписка</span>
            <Link to={appRoutes.accountSubscription()}>Подробнее</Link>
          </div>

          {subscription ? (
            <div className={styles.subscriptionContent}>
              <div className={styles.subscriptionCopy}>
                <h2>{subscription.plan.name}</h2>
                <p>Активна до {formatDate(subscription.endsAt)}. Следите за остатком посещений и бронируйте удобные слоты заранее.</p>
                <div className={styles.subscriptionMeta}>
                  <InfoPill label="Посещений" value={String(remainingCredits)} />
                  <InfoPill label="Скидка" value={`${subscription.plan.discountPercent}%`} />
                </div>
                <div className={styles.subscriptionActions}>
                  <Link className={styles.primaryButton} to={appRoutes.booking()}>
                    Записаться
                  </Link>
                  <Link className={styles.secondaryButton} to={appRoutes.subscriptions()}>
                    Тарифы клуба
                  </Link>
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
                  <Link className={styles.primaryButton} to={appRoutes.subscriptions()}>
                    Выбрать подписку
                  </Link>
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
          title="Записаться на услугу"
          description="Выберите процедуру, мастера и время в новом потоке записи."
          to={appRoutes.booking()}
          tone="accent"
          size="wide"
        />
        <QuickTile
          title="Мои записи"
          description={nextAppointment ? nextAppointment.service.title : 'Все предстоящие и прошедшие визиты'}
          to={appRoutes.accountAppointments()}
          tone="soft"
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
          title="Подобрать тариф"
          description="Сравните доступные планы и скидки клуба."
          to={appRoutes.subscriptions()}
          tone="light"
          size="standard"
        />
      </section>

      <section className={`${styles.lowerGrid} ${!isSettingsOpen ? styles.lowerGridSingle : ''}`}>
        {isSettingsOpen ? (
          <section ref={profileRef} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.sectionLabel}>Настройки</span>
                <h3>Личные данные</h3>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsSettingsOpen(false)}
              >
                Закрыть
              </button>
            </div>

            <form className={styles.profileForm} onSubmit={handleSave}>
              <div className={styles.profileGrid}>
                <label className={styles.field}>
                  <span>Имя и фамилия</span>
                  <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>Email</span>
                  <input value={email} onChange={(event) => setEmail(event.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>Телефон</span>
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} />
                </label>
              </div>

              {message ? <p className={styles.message}>{message}</p> : null}

              <div className={styles.formActions}>
                <button className={styles.primaryButton} type="submit" disabled={isSaving}>
                  {isSaving ? 'Сохраняем...' : 'Сохранить'}
                </button>
                <button className={styles.secondaryButton} type="button" onClick={handleLogout}>
                  Выйти
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.sectionLabel}>Услуги</span>
              <h3>Ваши визиты</h3>
            </div>
            <Link to={appRoutes.accountAppointments()}>Открыть все</Link>
          </div>

          {nextAppointment ? (
            <div className={styles.highlightVisit}>
              <strong>{nextAppointment.service.title}</strong>
              <p>{formatDateTime(nextAppointment.startsAt)}</p>
              <span>
                {formatUserDisplayName(nextAppointment.master)} · {nextAppointment.studio.name}
              </span>
              <div className={styles.inlineActions}>
                <Link className={styles.secondaryButton} to={appRoutes.booking()}>
                  Новая запись
                </Link>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => void handleCancelAppointment(nextAppointment.id)}
                  disabled={isCancellingAppointment}
                >
                  Отменить
                </button>
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
