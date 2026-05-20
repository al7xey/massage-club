import { useParams } from 'react-router-dom';
import { useUpdateAppointmentStatusMutation } from '@/entities/appointment';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { formatUserDisplayName } from '@/shared/lib/auth/formatUserDisplayName';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import {
  useGetAdminAppointmentsQuery,
  useGetAdminGiftCertificatesQuery,
  useGetAdminServicesQuery,
  useGetAdminSubscriptionsQuery,
  useGetAdminUsersQuery,
} from '@/features/admin';
import styles from './AdminSectionPage.module.css';

const titles: Record<string, string> = {
  users: 'Админ: пользователи',
  services: 'Админ: услуги',
  subscriptions: 'Админ: подписки',
  appointments: 'Админ: записи',
  certificates: 'Админ: сертификаты',
};

export function AdminSectionPage() {
  const { section = 'users' } = useParams();
  const { data: users = [], isLoading: isUsersLoading, error: usersError } = useGetAdminUsersQuery(undefined, { skip: section !== 'users' });
  const { data: services = [], isLoading: isServicesLoading, error: servicesError } = useGetAdminServicesQuery(undefined, { skip: section !== 'services' });
  const { data: subscriptions = [], isLoading: isSubscriptionsLoading, error: subscriptionsError } = useGetAdminSubscriptionsQuery(undefined, { skip: section !== 'subscriptions' });
  const { data: appointments = [], isLoading: isAppointmentsLoading, error: appointmentsError } = useGetAdminAppointmentsQuery(undefined, { skip: section !== 'appointments' });
  const { data: certificates = [], isLoading: isCertificatesLoading, error: certificatesError } = useGetAdminGiftCertificatesQuery(undefined, { skip: section !== 'certificates' });
  const [updateAppointmentStatus] = useUpdateAppointmentStatusMutation();
  const title = titles[section] ?? 'Админ-раздел';

  const updateAppointment = async (appointmentId: string, status: string) => {
    await updateAppointmentStatus({ id: appointmentId, status }).unwrap();
  };

  const errorMessage = usersError || servicesError || subscriptionsError || appointmentsError || certificatesError;
  const isLoading = isUsersLoading || isServicesLoading || isSubscriptionsLoading || isAppointmentsLoading || isCertificatesLoading;

  return (
    <PageShell title={title} description="Просмотр данных и базовые действия администратора.">
      <div className={styles.card}>
        {isLoading ? <p>Загружаем данные...</p> : null}
        {errorMessage ? <p>{getApiErrorMessage(errorMessage, 'Не удалось загрузить раздел')}</p> : null}

        {!isLoading && !errorMessage && section === 'users' ? (
          <Table
            headers={['Имя', 'Email', 'Телефон', 'Роль']}
            rows={users.map((user) => [formatUserDisplayName(user), user.email ?? '—', user.phone ?? '—', user.role])}
          />
        ) : null}

        {!isLoading && !errorMessage && section === 'services' ? (
          <Table
            headers={['Услуга', 'Длительность', 'Цена']}
            rows={services.map((service) => [service.title, `${service.durationMinutes} мин`, `${service.priceRub} ₽`])}
          />
        ) : null}

        {!isLoading && !errorMessage && section === 'subscriptions' ? (
          <Table
            headers={['Клиент', 'Тариф', 'Статус', 'Начало', 'До']}
            rows={subscriptions.map((subscription) => [
              formatUserDisplayName(subscription.user),
              subscription.plan.name,
              subscription.status,
              new Intl.DateTimeFormat('ru-RU').format(new Date(subscription.startsAt)),
              new Intl.DateTimeFormat('ru-RU').format(new Date(subscription.endsAt)),
            ])}
          />
        ) : null}

        {!isLoading && !errorMessage && section === 'appointments' ? (
          <div className={styles.list}>
            {appointments.length === 0 ? <p>Записей пока нет.</p> : null}
            {appointments.map((appointment) => (
              <div className={styles.row} key={appointment.id}>
                <div>
                  <strong>{appointment.service.title}</strong>
                  <span>
                    {new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(appointment.startsAt))},
                    {' '}{formatUserDisplayName(appointment.master)}
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
              `${certificate.amountRub} ₽`,
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
          <tr>
            {headers.map((header) => <th key={header}>{header}</th>)}
          </tr>
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
