import { FormEvent, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { appRoutes } from '@/shared/routes';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from '@/pages/login/ui/LoginPage.module.css';

interface AuthLocationState {
  action?: 'book' | 'cart';
  from?: string;
  serviceId?: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const state = location.state as AuthLocationState | null;
  const successPath = useMemo(() => resolvePostAuthPath(state), [state]);
  const [values, setValues] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.fullName.trim() || !values.password.trim()) {
      setError('Заполните имя и фамилию, а также пароль');
      return;
    }

    if (!values.email.trim() && !values.phone.trim()) {
      setError('Укажите телефон или email');
      return;
    }

    if (values.email.trim() && !values.email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    if (values.password.length < 6) {
      setError('Пароль должен быть не короче 6 символов');
      return;
    }

    if (values.password !== values.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        fullName: values.fullName.trim(),
        phone: values.phone.trim() || undefined,
        email: values.email.trim() || undefined,
        password: values.password,
      });
      navigate(successPath, { replace: true });
    } catch (registerError) {
      setError(getApiErrorMessage(registerError, 'Не удалось зарегистрироваться'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell title="Регистрация" description="Создайте аккаунт для записи, покупок и оформления сертификатов.">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field}>
          <span>Имя и фамилия</span>
          <input className={styles.input} value={values.fullName} onChange={(event) => updateField('fullName', event.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Телефон</span>
          <input className={styles.input} value={values.phone} onChange={(event) => updateField('phone', event.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Email</span>
          <input className={styles.input} type="email" value={values.email} onChange={(event) => updateField('email', event.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Пароль</span>
          <input className={styles.input} type="password" value={values.password} onChange={(event) => updateField('password', event.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Подтверждение пароля</span>
          <input
            className={styles.input}
            type="password"
            value={values.confirmPassword}
            onChange={(event) => updateField('confirmPassword', event.target.value)}
          />
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button className={styles.button} type="submit" disabled={isLoading}>
          {isLoading ? 'Создаём...' : 'Зарегистрироваться'}
        </button>
        <p className={styles.note}>
          Уже есть аккаунт? <Link to={appRoutes.login()} state={state}>Войти</Link>
        </p>
      </form>
    </PageShell>
  );
}

function resolvePostAuthPath(state: AuthLocationState | null) {
  if (!state) {
    return appRoutes.account();
  }

  if (state.action === 'cart' && state.serviceId) {
    return `${appRoutes.cart()}?addServiceId=${encodeURIComponent(state.serviceId)}`;
  }

  if (state.action === 'book' && state.serviceId) {
    return `${appRoutes.booking()}?serviceId=${encodeURIComponent(state.serviceId)}`;
  }

  return state.from ?? appRoutes.account();
}
