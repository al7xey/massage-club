import type { PublicUserDto } from '@massage/shared';
import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { appRoutes } from '@/shared/routes';
import { AuthModal, Button, TextField } from '@/shared/ui';
import styles from '@/shared/ui/auth-form/AuthForm.module.css';

interface AuthLocationState {
  action?: 'book' | 'cart' | 'subscription';
  backgroundLocation?: unknown;
  denied?: boolean;
  from?: string;
  planId?: string;
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
  const submitLogin = async (nextIdentifier: string, nextPassword: string) => {
    setIsLoading(true);

    try {
      const authenticatedUser = await login(nextIdentifier, nextPassword);
      navigate(resolvePostAuthPath(state, authenticatedUser.role), { replace: true });
    } catch (loginError) {
      const apiMessage = getApiErrorMessage(loginError, 'Не удалось войти');
      setError(mapLoginErrorMessage(apiMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateLoginInput(identifier, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    await submitLogin(identifier.trim(), password);
  };

  return (
    <AuthModal title="Вход">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          autoComplete="username"
          label="Почта или телефон"
          placeholder="Введите почту или телефон"
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
          placeholder="Введите пароль"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError('');
          }}
        />

        {error ? <p className={styles.error}>{error}</p> : null}

        <Button className={styles.primarySubmit} fullWidth isLoading={isLoading} loadingText="Входим..." type="submit">
          Войти
        </Button>

        <p className={styles.note}>
          Нет аккаунта? <Link state={state} to={appRoutes.register()}>Зарегистрироваться</Link>
        </p>
      </form>
    </AuthModal>
  );
}

function validateLoginInput(identifier: string, password: string) {
  const trimmedIdentifier = identifier.trim();

  if (!trimmedIdentifier || !password.trim()) {
    return 'Введите почту или телефон и пароль';
  }

  if (trimmedIdentifier.includes('@')) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedIdentifier)) {
      return 'Введите корректный email';
    }
  } else {
    const digits = trimmedIdentifier.replace(/\D/g, '');
    if (digits.length < 10) {
      return 'Введите корректный номер телефона';
    }
  }

  if (password.trim().length < 6) {
    return 'Пароль должен быть не короче 6 символов';
  }

  return null;
}

function mapLoginErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('account not found') || normalized.includes('user not found')) {
    return 'Аккаунт не найден. Проверьте данные или зарегистрируйтесь.';
  }

  if (normalized.includes('invalid password')) {
    return 'Неверный пароль.';
  }

  if (normalized.includes('unauthorized') || normalized.includes('forbidden')) {
    return 'Неверная почта/телефон или пароль.';
  }

  if (normalized.includes('invalid phone/email or password')) {
    return 'Неверные данные для входа.';
  }

  if (normalized.includes('network') || normalized.includes('failed to fetch')) {
    return 'Ошибка сети. Проверьте интернет-соединение и попробуйте снова.';
  }

  return message;
}

function resolvePostAuthPath(state: AuthLocationState | null, role: PublicUserDto['role']) {
  if (role === 'ADMIN') {
    return appRoutes.admin();
  }

  if (role === 'SUPER_ADMIN') {
    return appRoutes.superAdmin();
  }

  if (!state) {
    return appRoutes.account();
  }

  if (state.action === 'cart' && state.serviceId) {
    return `${appRoutes.cart()}?addServiceId=${encodeURIComponent(state.serviceId)}`;
  }

  if (state.action === 'book' && state.serviceId) {
    return `${appRoutes.booking()}?serviceId=${encodeURIComponent(state.serviceId)}`;
  }

  if (state.from && !state.from.startsWith('/admin') && !state.from.startsWith('/super-admin')) {
    return state.from;
  }

  return appRoutes.account();
}
