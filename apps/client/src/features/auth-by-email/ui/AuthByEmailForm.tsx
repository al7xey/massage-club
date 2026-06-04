import { FormEvent, useState } from 'react';
import { tokenStorage } from '@/shared/lib/storage/tokenStorage';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { Button, TextField } from '@/shared/ui';
import { useLoginMutation } from '../api/authByEmailApi';
import styles from './AuthByEmailForm.module.css';

export function AuthByEmailForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      setError('Введите почту или телефон и пароль');
      return;
    }

    try {
      const response = await login({ identifier, password }).unwrap();
      tokenStorage.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      setError('');
    } catch (submitError) {
      setError(mapLoginErrorMessage(getApiErrorMessage(submitError, 'Не удалось войти. Проверьте данные и попробуйте позже.')));
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="Почта или телефон"
        type="text"
        placeholder="email@example.com или +7..."
        value={identifier}
        onChange={(event) => {
          setIdentifier(event.target.value);
          setError('');
        }}
      />
      <TextField
        label="Пароль"
        type={isPasswordVisible ? 'text' : 'password'}
        placeholder="Пароль"
        value={password}
        endAdornment={
          <PasswordToggle
            isVisible={isPasswordVisible}
            onClick={() => setIsPasswordVisible((value) => !value)}
          />
        }
        onChange={(event) => {
          setPassword(event.target.value);
          setError('');
        }}
      />
      {error ? <p className={styles.error}>{error}</p> : null}
      <Button fullWidth isLoading={isLoading} loadingText="Входим..." type="submit">
        Войти
      </Button>
    </form>
  );
}

function mapLoginErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes('аккаунт с такими данными не найден') ||
    normalized.includes('account not found') ||
    normalized.includes('user not found')
  ) {
    return 'Аккаунт с такими данными не найден';
  }

  if (normalized.includes('неверный пароль') || normalized.includes('invalid password')) {
    return 'Неверный пароль';
  }

  if (normalized.includes('invalid credentials') || normalized.includes('unauthorized')) {
    return 'Неверная почта, телефон или пароль';
  }

  if (normalized.includes('network') || normalized.includes('failed to fetch')) {
    return 'Ошибка сети. Проверьте интернет-соединение и попробуйте снова';
  }

  return message;
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
