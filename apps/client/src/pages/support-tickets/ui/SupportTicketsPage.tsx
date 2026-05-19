import { FormEvent, useState } from 'react';
import { useCreateSupportTicketMutation, useGetMySupportTicketsQuery } from '@/entities/support-ticket';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './SupportTicketsPage.module.css';

export function SupportTicketsPage() {
  const { data: tickets = [], isLoading, error } = useGetMySupportTicketsQuery();
  const [createTicket, { isLoading: isCreating }] = useCreateSupportTicketMutation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'error' | 'success' | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (subject.trim().length < 4) {
      setFeedbackType('error');
      setFeedback('Укажите тему обращения подробнее');
      return;
    }

    if (message.trim().length < 10) {
      setFeedbackType('error');
      setFeedback('Опишите ситуацию хотя бы в нескольких предложениях');
      return;
    }

    try {
      await createTicket({
        subject: subject.trim(),
        message: message.trim(),
      }).unwrap();
      setSubject('');
      setMessage('');
      setFeedbackType('success');
      setFeedback('Обращение отправлено. Мы свяжемся с вами в ближайшее время.');
    } catch (submitError) {
      setFeedbackType('error');
      setFeedback(getApiErrorMessage(submitError, 'Не удалось отправить обращение'));
    }
  };

  return (
    <PageShell title="Обращения в поддержку" description="История ваших обращений и быстрая форма связи с администратором клуба.">
      <section className={styles.layout}>
        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          <h2>Новое обращение</h2>
          <label className={styles.field}>
            <span>Тема</span>
            <input
              className={styles.input}
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setFeedback('');
                setFeedbackType(null);
              }}
              placeholder="Например: не вижу запись в кабинете"
            />
          </label>
          <label className={styles.field}>
            <span>Сообщение</span>
            <textarea
              className={styles.textarea}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setFeedback('');
                setFeedbackType(null);
              }}
              placeholder="Опишите, что произошло и какую помощь вы ожидаете"
              rows={6}
            />
          </label>
          {feedback ? <p className={feedbackType === 'error' ? styles.error : styles.success}>{feedback}</p> : null}
          <button className={styles.button} type="submit" disabled={isCreating}>
            {isCreating ? 'Отправляем...' : 'Отправить'}
          </button>
        </form>

        <div className={styles.card}>
          <h2>Мои обращения</h2>
          {isLoading ? <p className={styles.empty}>Загружаем обращения...</p> : null}
          {error ? <p className={styles.error}>{getApiErrorMessage(error, 'Не удалось загрузить обращения')}</p> : null}
          {!isLoading && !error && tickets.length === 0 ? <p className={styles.empty}>У вас пока нет обращений.</p> : null}

          <div className={styles.list}>
            {tickets.map((ticket) => (
              <article className={styles.ticket} key={ticket.id}>
                <div className={styles.ticketMeta}>
                  <strong>{ticket.subject}</strong>
                  <span>{formatTicketStatus(ticket.status)}</span>
                </div>
                <p>{ticket.message}</p>
                <small>{new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ticket.createdAt))}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function formatTicketStatus(status: string) {
  const normalizedStatus = status.toUpperCase();
  const labels: Record<string, string> = {
    OPEN: 'Открыто',
    IN_PROGRESS: 'В работе',
    CLOSED: 'Закрыто',
  };

  return labels[normalizedStatus] ?? status;
}
