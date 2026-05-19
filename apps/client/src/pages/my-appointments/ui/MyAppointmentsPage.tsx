import { useCancelAppointmentMutation, useGetMyAppointmentsQuery } from '@/entities/appointment';
import { formatUserDisplayName } from '@/shared/lib/auth/formatUserDisplayName';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './MyAppointmentsPage.module.css';

export function MyAppointmentsPage() {
  const { data: appointments = [], isLoading, error } = useGetMyAppointmentsQuery();
  const [cancelAppointment, { isLoading: isCancelling }] = useCancelAppointmentMutation();

  const handleCancel = async (appointmentId: string) => {
    if (!window.confirm('Отменить запись?')) {
      return;
    }

    await cancelAppointment(appointmentId).unwrap();
  };

  return (
    <PageShell title="Мои записи" description="История и будущие процедуры клиента.">
      <div className={styles.card}>
        {isLoading ? <p className={styles.empty}>Загружаем записи...</p> : null}
        {error ? <p className={styles.error}>{getApiErrorMessage(error, 'Не удалось загрузить записи')}</p> : null}
        {!isLoading && !error && appointments.length === 0 ? <p className={styles.empty}>У вас пока нет записей.</p> : null}

        <div className={styles.list}>
          {appointments.map((appointment) => (
            <div className={styles.item} key={appointment.id}>
              <div className={styles.meta}>
                <strong>{appointment.service.title}</strong>
                <p>{formatDateTime(appointment.startsAt)} · {formatUserDisplayName(appointment.master)}</p>
                <span>{appointment.studio.name}</span>
              </div>
              <div className={styles.side}>
                <em className={styles.status}>{formatAppointmentStatus(appointment.status)}</em>
                <strong>{appointment.paidBySubscriptionCredit ? 'По подписке' : formatPrice(appointment.priceRub)}</strong>
                {appointment.status === 'SCHEDULED' ? (
                  <button type="button" onClick={() => void handleCancel(appointment.id)} disabled={isCancelling}>
                    Отменить
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
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
