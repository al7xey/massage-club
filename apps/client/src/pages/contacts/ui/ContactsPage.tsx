import { useState, type FormEvent } from 'react';
import { appRoutes } from '@/shared/routes';
import { Button, LinkButton, TextAreaField, TextField } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './ContactsPage.module.css';

const contacts = [
  ['Телефон', '8 (800) 555-35-35'],
  ['Почта', 'hello@dlyasebya.ru'],
  ['Время работы', 'Ежедневно, 10:00-22:00'],
  ['Адрес', 'Астрахань, ул. Советская, 10'],
] as const;

export function ContactsPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess('');

    if (name.trim().length < 2) {
      setError('Укажите имя.');
      return;
    }

    if (!/^\+?[0-9\s()-]{7,}$/.test(phone.trim())) {
      setError('Введите корректный телефон.');
      return;
    }

    setError('');
    setSuccess('Заявка подготовлена. Мы свяжемся с вами в ближайшее время.');
  };

  return (
    <PageShell title="Контакты" description="Поможем выбрать услугу, студию и ближайшее свободное время для записи.">
      <section className={styles.layout}>
        <div className={styles.cards}>
          {contacts.map(([label, value]) => (
            <article className={styles.contactCard} key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
          <LinkButton className={styles.primaryLink} to={appRoutes.booking()}>
            Записаться онлайн
          </LinkButton>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <h2>Перезвонить вам?</h2>
          <TextField label="Имя" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ваше имя" />
          <TextField label="Телефон" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+7 900 000-00-00" />
          <TextAreaField
            label="Комментарий"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Какая услуга или студия интересует"
            rows={4}
          />
          {error ? <p className={styles.error}>{error}</p> : null}
          {success ? <p className={styles.success}>{success}</p> : null}
          <Button type="submit">Отправить</Button>
        </form>
      </section>
    </PageShell>
  );
}
