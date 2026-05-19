import { FormEvent, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { appRoutes } from '@/shared/routes';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './LoginPage.module.css';

interface AuthLocationState {
  action?: 'book' | 'cart';
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
  const [error, setError] = useState(state?.denied ? 'Нет доступа к выбранному разделу. Войдите под аккаунтом с нужной ролью.' : '');
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
    <PageShell title="Вход" description="Войдите в личный кабинет по почте или номеру телефона.">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field}>
          <span>Почта или телефон</span>
          <input
            className={styles.input}
            type="text"
            placeholder="user@test.ru или +7 999 111-22-33"
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value);
              setError('');
            }}
          />
        </label>
        <label className={styles.field}>
          <span>Пароль</span>
          <input
            className={styles.input}
            type="password"
            placeholder="user123"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError('');
            }}
          />
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button className={styles.button} type="submit" disabled={isLoading}>
          {isLoading ? 'Входим...' : 'Войти'}
        </button>

        <div className={styles.quickActions}>
          <button type="button" onClick={() => void submitLogin('user@test.ru', 'user123')} disabled={isLoading}>
            Войти как пользователь
          </button>
          <button type="button" onClick={() => void submitLogin('admin@test.ru', 'admin123')} disabled={isLoading}>
            Войти как администратор
          </button>
        </div>

        <p className={styles.note}>
          Нет аккаунта? <Link to={appRoutes.register()} state={state}>Зарегистрироваться</Link>
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
