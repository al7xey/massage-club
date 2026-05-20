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
  denied?: boolean;
  from?: string;
  serviceId?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const state = location.state as AuthLocationState | null;
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    state?.denied ? 'Нет доступа к выбранному разделу. Войдите под аккаунтом с нужной ролью.' : '',
  );
  const [isLoading, setIsLoading] = useState(false);
  const successPath = useMemo(() => resolvePostAuthPath(state), [state]);

  const submitLogin = async (nextIdentifier: string, nextPassword: string) => {
    setIsLoading(true);

    try {
      await login(nextIdentifier, nextPassword);
      navigate(successPath, { replace: true });
    } catch (loginError) {
      setError(getApiErrorMessage(loginError, 'Не удалось войти'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      setError('Введите почту или телефон и пароль');
      return;
    }

    await submitLogin(identifier.trim(), password);
  };

  return (
    <AuthModal
      description="Войдите в личный кабинет по почте или номеру телефона."
      mode="login"
      title="Вход"
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          autoComplete="username"
          label="Почта или телефон"
          placeholder="user@test.ru или +7 999 111-22-33"
          type="text"
          value={identifier}
          onChange={(event) => {
            setIdentifier(event.target.value);
            setError('');
          }}
        />
        <TextField
          autoComplete="current-password"
          label="Пароль"
          placeholder="user123"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError('');
          }}
        />

        {error ? <p className={styles.error}>{error}</p> : null}

        <Button fullWidth isLoading={isLoading} loadingText="Входим..." type="submit">
          Войти
        </Button>

        <div className={styles.quickActions}>
          <Button
            disabled={isLoading}
            variant="secondary"
            onClick={() => void submitLogin('user@test.ru', 'user123')}
          >
            Войти как пользователь
          </Button>
          <Button
            disabled={isLoading}
            variant="secondary"
            onClick={() => void submitLogin('admin@test.ru', 'admin123')}
          >
            Войти как администратор
          </Button>
        </div>

        <p className={styles.note}>
          Нет аккаунта? <Link state={state} to={appRoutes.register()}>Зарегистрироваться</Link>
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
