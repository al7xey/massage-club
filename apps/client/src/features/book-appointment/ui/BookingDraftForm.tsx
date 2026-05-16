import { FormEvent, useState, type ReactNode } from 'react';
import styles from './BookingDraftForm.module.css';

const initialValues = {
  service: '',
  studio: '',
  master: '',
  dateTime: '',
};

export function BookingDraftForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof initialValues, string>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = (field: keyof typeof initialValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setIsSubmitted(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof typeof initialValues, string>> = {};

    if (!values.service.trim()) nextErrors.service = 'Укажите услугу';
    if (!values.studio.trim()) nextErrors.studio = 'Укажите студию';
    if (!values.master.trim()) nextErrors.master = 'Укажите мастера';
    if (!values.dateTime) nextErrors.dateTime = 'Выберите дату и время';

    setErrors(nextErrors);
    setIsSubmitted(Object.keys(nextErrors).length === 0);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Field error={errors.service}>
        <input
          className={styles.input}
          placeholder="Услуга"
          value={values.service}
          onChange={(event) => updateField('service', event.target.value)}
        />
      </Field>
      <Field error={errors.studio}>
        <input
          className={styles.input}
          placeholder="Студия"
          value={values.studio}
          onChange={(event) => updateField('studio', event.target.value)}
        />
      </Field>
      <Field error={errors.master}>
        <input
          className={styles.input}
          placeholder="Мастер"
          value={values.master}
          onChange={(event) => updateField('master', event.target.value)}
        />
      </Field>
      <Field error={errors.dateTime}>
        <input
          className={styles.input}
          type="datetime-local"
          value={values.dateTime}
          onChange={(event) => updateField('dateTime', event.target.value)}
        />
      </Field>
      <button className={styles.button} type="submit">
        Подготовить запись
      </button>
      {isSubmitted ? <p className={styles.success}>Черновик записи готов на фронтенде.</p> : null}
    </form>
  );
}

function Field({ children, error }: { children: ReactNode; error?: string }) {
  return (
    <label className={styles.field}>
      {children}
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
}
