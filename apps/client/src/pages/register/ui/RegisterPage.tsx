import { FormEvent, useMemo, useState } from 'react';
import type { UserGender } from '@massage/shared';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { appRoutes } from '@/shared/routes';
import { AuthModal, Button, TextField } from '@/shared/ui';
import styles from '@/shared/ui/auth-form/AuthForm.module.css';

interface AuthLocationState {
  action?: 'book' | 'cart' | 'subscription';
  backgroundLocation?: unknown;
  from?: string;
  planId?: string;
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
    gender: 'FEMALE' as UserGender,
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const updateField = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.fullName.trim() || !values.password.trim()) {
      setError('Заполните имя и пароль.');
      return;
    }

    if (!values.email.trim() && !values.phone.trim()) {
      setError('Укажите телефон или email.');
      return;
    }

    if (values.email.trim() && !values.email.includes('@')) {
      setError('Введите корректный email.');
      return;
    }

    if (values.password.length < 6) {
      setError('Пароль должен быть не короче 6 символов.');
      return;
    }

    if (values.password !== values.confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

    if (values.gender !== 'FEMALE' && values.gender !== 'MALE') {
      setError('Выберите пол.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: values.email.trim() || undefined,
        fullName: values.fullName.trim(),
        gender: values.gender,
        password: values.password,
        phone: values.phone.trim() || undefined,
      });
      navigate(successPath, { replace: true });
    } catch (registerError) {
      setError(getApiErrorMessage(registerError, 'Не удалось зарегистрироваться.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthModal title="Регистрация">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          autoComplete="name"
          label="Имя и фамилия"
          value={values.fullName}
          onChange={(event) => updateField('fullName', event.target.value)}
        />
        <div className={styles.genderField} role="group" aria-label="Выбор пола">
          <span className={styles.genderLabel}>Пол</span>
          <div className={styles.genderRow}>
            <button
              type="button"
              className={`${styles.genderOption} ${values.gender === 'FEMALE' ? styles.genderOptionActive : ''}`}
              aria-pressed={values.gender === 'FEMALE'}
              onClick={() => updateField('gender', 'FEMALE')}
            >
              Женский
            </button>
            <button
              type="button"
              className={`${styles.genderOption} ${values.gender === 'MALE' ? styles.genderOptionActive : ''}`}
              aria-pressed={values.gender === 'MALE'}
              onClick={() => updateField('gender', 'MALE')}
            >
              Мужской
            </button>
          </div>
        </div>
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
          type={isPasswordVisible ? 'text' : 'password'}
          value={values.password}
          endAdornment={
            <PasswordToggle
              isVisible={isPasswordVisible}
              onClick={() => setIsPasswordVisible((value) => !value)}
            />
          }
          onChange={(event) => updateField('password', event.target.value)}
        />
        <TextField
          autoComplete="new-password"
          label="Подтверждение пароля"
          type={isPasswordVisible ? 'text' : 'password'}
          value={values.confirmPassword}
          endAdornment={
            <PasswordToggle
              isVisible={isPasswordVisible}
              onClick={() => setIsPasswordVisible((value) => !value)}
            />
          }
          onChange={(event) => updateField('confirmPassword', event.target.value)}
        />

        {error ? <p className={styles.error}>{error}</p> : null}

        <Button className={styles.primarySubmit} fullWidth isLoading={isLoading} loadingText="Создаем..." type="submit">
          Зарегистрироваться
        </Button>

        <p className={styles.note}>
          Уже есть аккаунт? <Link state={state} to={appRoutes.login()}>Войти</Link>
        </p>
      </form>
    </AuthModal>
  );
}

function PasswordToggle({ isVisible, onClick }: { isVisible: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'} onClick={onClick}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {isVisible ? (
          <>
            <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M10.7 10.7a2 2 0 0 0 2.6 2.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M7.5 7.8C5.8 8.8 4.4 10.2 3.5 12c1.7 3.2 4.8 5.5 8.5 5.5 1.4 0 2.7-.3 3.9-.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.2 6.7c.6-.1 1.2-.2 1.8-.2 3.7 0 6.8 2.3 8.5 5.5-.4.8-1 1.6-1.6 2.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <>
            <path d="M3.5 12c1.7-3.2 4.8-5.5 8.5-5.5s6.8 2.3 8.5 5.5c-1.7 3.2-4.8 5.5-8.5 5.5S5.2 15.2 3.5 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.8" />
          </>
        )}
      </svg>
    </button>
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
