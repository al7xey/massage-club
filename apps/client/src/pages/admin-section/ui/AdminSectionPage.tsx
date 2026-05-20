import { useParams } from 'react-router-dom';
import { useUpdateAppointmentStatusMutation } from '@/entities/appointment';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { formatUserDisplayName } from '@/shared/lib/auth/formatUserDisplayName';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { Button } from '@/shared/ui';
import {
  useGetAdminAppointmentsQuery,
  useGetAdminGiftCertificatesQuery,
  useGetAdminMembershipEntryFeeQuery,
  useGetAdminServicesQuery,
  useGetAdminSubscriptionPlansQuery,
  useGetAdminSubscriptionsQuery,
  useGetAdminUsersQuery,
  useUpdateAdminMembershipEntryFeeMutation,
} from '@/features/admin';
import styles from './AdminSectionPage.module.css';

const titles: Record<string, string> = {
  users: 'Админ: пользователи',
  services: 'Админ: услуги',
  subscriptions: 'Админ: подписки',
  appointments: 'Админ: записи',
  certificates: 'Админ: сертификаты',
  settings: 'Админ: тарифы и настройки',
};

export function AdminSectionPage() {
  const { section = 'users' } = useParams();
  const { data: users = [], isLoading: isUsersLoading, error: usersError } = useGetAdminUsersQuery(undefined, { skip: section !== 'users' });
  const { data: services = [], isLoading: isServicesLoading, error: servicesError } = useGetAdminServicesQuery(undefined, { skip: section !== 'services' });
  const { data: subscriptions = [], isLoading: isSubscriptionsLoading, error: subscriptionsError } = useGetAdminSubscriptionsQuery(undefined, { skip: section !== 'subscriptions' });
  const { data: appointments = [], isLoading: isAppointmentsLoading, error: appointmentsError } = useGetAdminAppointmentsQuery(undefined, { skip: section !== 'appointments' });
  const { data: certificates = [], isLoading: isCertificatesLoading, error: certificatesError } = useGetAdminGiftCertificatesQuery(undefined, { skip: section !== 'certificates' });
  const { data: plans = [], isLoading: isPlansLoading, error: plansError } = useGetAdminSubscriptionPlansQuery(undefined, { skip: section !== 'settings' });
  const { data: entryFee, isLoading: isEntryFeeLoading, error: entryFeeError } = useGetAdminMembershipEntryFeeQuery(undefined, { skip: section !== 'settings' });
  const [updateEntryFee, updateEntryFeeState] = useUpdateAdminMembershipEntryFeeMutation();
  const [updateAppointmentStatus] = useUpdateAppointmentStatusMutation();
  const title = titles[section] ?? 'Админ-раздел';

  const errorMessage = usersError || servicesError || subscriptionsError || appointmentsError || certificatesError || plansError || entryFeeError;
  const isLoading =
    isUsersLoading ||
    isServicesLoading ||
    isSubscriptionsLoading ||
    isAppointmentsLoading ||
    isCertificatesLoading ||
    isPlansLoading ||
    isEntryFeeLoading;

  const updateAppointment = async (appointmentId: string, status: string) => {
    await updateAppointmentStatus({ id: appointmentId, status }).unwrap();
  };

  return (
    <PageShell title={title} description="Просмотр данных и базовые действия администратора.">
      <div className={styles.card}>
        {isLoading ? <p>Загружаем данные...</p> : null}
        {errorMessage ? <p>{getApiErrorMessage(errorMessage, 'Не удалось загрузить раздел')}</p> : null}

        {!isLoading && !errorMessage && section === 'users' ? (
          <Table headers={['Имя', 'Email', 'Телефон', 'Роль']} rows={users.map((user) => [formatUserDisplayName(user), user.email ?? '—', user.phone ?? '—', user.role])} />
        ) : null}

        {!isLoading && !errorMessage && section === 'services' ? (
          <Table
            headers={['Услуга', 'Категория', 'Длительность', 'Цена']}
            rows={services.map((service) => [
              service.title,
              service.category?.name ?? '—',
              service.durationLabel ?? `${service.durationMinutes} мин`,
              `${service.priceRub.toLocaleString('ru-RU')} ₽`,
            ])}
          />
        ) : null}

        {!isLoading && !errorMessage && section === 'subscriptions' ? (
          <Table
            headers={['Клиент', 'Тариф', 'Статус', 'Начало', 'До']}
            rows={subscriptions.map((subscription) => [
              formatUserDisplayName(subscription.user),
              subscription.plan.name,
              subscription.status,
              formatDate(subscription.startsAt),
              formatDate(subscription.endsAt),
            ])}
          />
        ) : null}

        {!isLoading && !errorMessage && section === 'settings' ? (
          <div className={styles.list}>
            <div className={styles.row}>
              <div>
                <strong>Вступительный взнос</strong>
                <span>{entryFee?.entryFeeRub.toLocaleString('ru-RU') ?? '1 200'} ₽, сейчас {entryFee?.entryFeeEnabled ? 'включен' : 'акция 0 ₽'}</span>
              </div>
              <Button
                variant="secondary"
                isLoading={updateEntryFeeState.isLoading}
                onClick={() => void updateEntryFee({ entryFeeEnabled: !entryFee?.entryFeeEnabled })}
              >
                {entryFee?.entryFeeEnabled ? 'Выключить' : 'Включить'}
              </Button>
            </div>
            <Table
              headers={['Тариф', 'Цена', 'Включено', 'Услуги', 'Сертификаты', 'Заморозка']}
              rows={plans.map((plan) => [
                plan.name,
                `${plan.monthlyPriceRub.toLocaleString('ru-RU')} ₽ / ${plan.periodDays} дней`,
                plan.includedDescription ?? '—',
                `${plan.discountPercent}%`,
                `${plan.certificateDiscountPercent}%`,
                `${plan.freezeCountPerYear} раз(а) по ${plan.freezeDays} дней`,
              ])}
            />
          </div>
        ) : null}

        {!isLoading && !errorMessage && section === 'appointments' ? (
          <div className={styles.list}>
            {appointments.length === 0 ? <p>Записей пока нет.</p> : null}
            {appointments.map((appointment) => (
              <div className={styles.row} key={appointment.id}>
                <div>
                  <strong>{appointment.service.title}</strong>
                  <span>
                    {new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(appointment.startsAt))},{' '}
                    {formatUserDisplayName(appointment.master)}
                  </span>
                  <small>{appointment.studio.name}</small>
                </div>
                <select value={appointment.status} onChange={(event) => void updateAppointment(appointment.id, event.target.value)}>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && !errorMessage && section === 'certificates' ? (
          <Table
            headers={['Код', 'Номинал', 'Получатель', 'Статус']}
            rows={certificates.map((certificate) => [
              certificate.code,
              `${certificate.amountRub.toLocaleString('ru-RU')} ₽`,
              certificate.recipientName,
              certificate.status,
            ])}
          />
        ) : null}
      </div>
    </PageShell>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  if (rows.length === 0) {
    return <p>Данных пока нет.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('-')}>
              {row.map((cell, index) => <td key={`${cell}-${index}`}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(value));
}
