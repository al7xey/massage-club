import { useState } from 'react';
import { useCancelAppointmentMutation, useGetMyAppointmentsQuery } from '@/entities/appointment';
import { formatUserDisplayName } from '@/shared/lib/auth/formatUserDisplayName';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { Button, ConfirmModal, EmptyState, StatusBadge, type StatusBadgeTone } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './MyAppointmentsPage.module.css';

export function MyAppointmentsPage() {
  const { data: appointments = [], isLoading, error } = useGetMyAppointmentsQuery();
  const [cancelAppointment, { isLoading: isCancelling }] = useCancelAppointmentMutation();
  const [message, setMessage] = useState('');
  const [pendingCancelAppointmentId, setPendingCancelAppointmentId] = useState<string | null>(null);

  const requestCancel = (appointmentId: string) => {
    setMessage('');
    setPendingCancelAppointmentId(appointmentId);
  };

  const confirmCancel = async () => {
    if (!pendingCancelAppointmentId) {
      return;
    }

    try {
      await cancelAppointment(pendingCancelAppointmentId).unwrap();
      setPendingCancelAppointmentId(null);
    } catch (cancelError) {
      setMessage(getApiErrorMessage(cancelError, 'Не удалось отменить запись'));
    }
  };

  return (
    <PageShell title="Мои записи" description="История и будущие процедуры клиента.">
      <div className={styles.card}>
        {isLoading ? <p className={styles.empty}>Загружаем записи...</p> : null}
        {error ? <p className={styles.error}>{getApiErrorMessage(error, 'Не удалось загрузить записи')}</p> : null}
        {message ? <p className={styles.error}>{message}</p> : null}
        {!isLoading && !error && appointments.length === 0 ? (
          <EmptyState title="Записей пока нет" description="Выберите услугу и удобное время, чтобы первая запись появилась здесь." />
        ) : null}

        <div className={styles.list}>
          {appointments.map((appointment) => (
            <div className={styles.item} key={appointment.id}>
              <div className={styles.meta}>
                <strong>{appointment.service.title}</strong>
                <p>{formatDateTime(appointment.startsAt)} · {formatUserDisplayName(appointment.master)}</p>
                <span>{appointment.studio.name}</span>
              </div>
              <div className={styles.side}>
                <StatusBadge tone={getAppointmentStatusTone(appointment.status)}>
                  {formatAppointmentStatus(appointment.status)}
                </StatusBadge>
                <strong>{appointment.paidBySubscriptionCredit ? 'По подписке' : formatPrice(appointment.priceRub)}</strong>
                {appointment.status === 'SCHEDULED' ? (
                  <Button size="sm" variant="danger" onClick={() => requestCancel(appointment.id)} disabled={isCancelling}>
                    Отменить
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
      <ConfirmModal
        confirmLabel="Отменить запись"
        description="Мы отменим запись и освободим время в расписании."
        isLoading={isCancelling}
        isOpen={Boolean(pendingCancelAppointmentId)}
        title="Отменить запись?"
        onClose={() => setPendingCancelAppointmentId(null)}
        onConfirm={() => void confirmCancel()}
      />
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

function getAppointmentStatusTone(status: string): StatusBadgeTone {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === 'CANCELLED') {
    return 'danger';
  }

  if (normalizedStatus === 'COMPLETED') {
    return 'neutral';
  }

  return 'success';
}
