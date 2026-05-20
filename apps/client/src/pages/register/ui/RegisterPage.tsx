import { FormEvent, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { appRoutes } from '@/shared/routes';
import { AuthModal, Button, TextField } from '@/shared/ui';
import styles from '@/shared/ui/auth-form/AuthForm.module.css';

interface AuthLocationState {
  action?: 'book' | 'cart';
  backgroundLocation?: unknown;
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
    confirmPassword: '',
    email: '',
    fullName: '',
    password: '',
    phone: '',
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
        email: values.email.trim() || undefined,
        fullName: values.fullName.trim(),
        password: values.password,
        phone: values.phone.trim() || undefined,
      });
      navigate(successPath, { replace: true });
    } catch (registerError) {
      setError(getApiErrorMessage(registerError, 'Не удалось зарегистрироваться'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthModal
      description="Создайте аккаунт для записи, покупок и оформления сертификатов."
      mode="register"
      title="Регистрация"
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          autoComplete="name"
          label="Имя и фамилия"
          value={values.fullName}
          onChange={(event) => updateField('fullName', event.target.value)}
        />
        <TextField
          autoComplete="tel"
          label="Телефон"
          value={values.phone}
          onChange={(event) => updateField('phone', event.target.value)}
        />
        <TextField
          autoComplete="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={(event) => updateField('email', event.target.value)}
        />
        <TextField
          autoComplete="new-password"
          label="Пароль"
          type="password"
          value={values.password}
          onChange={(event) => updateField('password', event.target.value)}
        />
        <TextField
          autoComplete="new-password"
          label="Подтверждение пароля"
          type="password"
          value={values.confirmPassword}
          onChange={(event) => updateField('confirmPassword', event.target.value)}
        />

        {error ? <p className={styles.error}>{error}</p> : null}

        <Button fullWidth isLoading={isLoading} loadingText="Создаем..." type="submit">
          Зарегистрироваться
        </Button>

        <p className={styles.note}>
          Уже есть аккаунт? <Link state={state} to={appRoutes.login()}>Войти</Link>
        </p>
      </form>
    </AuthModal>
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
