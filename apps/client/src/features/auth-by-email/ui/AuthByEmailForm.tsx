import { FormEvent, useState } from 'react';
import { tokenStorage } from '@/shared/lib/storage/tokenStorage';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { useLoginMutation } from '../api/authByEmailApi';
import styles from './AuthByEmailForm.module.css';

export function AuthByEmailForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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
      setError(getApiErrorMessage(submitError, 'Не удалось войти. Проверьте данные и попробуйте позже.'));
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <input
        className={styles.input}
        type="text"
        placeholder="email@example.com или +7..."
        value={identifier}
        onChange={(event) => {
          setIdentifier(event.target.value);
          setError('');
        }}
      />
      <input
        className={styles.input}
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          setError('');
        }}
      />
      {error ? <p className={styles.error}>{error}</p> : null}
      <button className={styles.button} type="submit" disabled={isLoading}>
        {isLoading ? 'Входим...' : 'Войти'}
      </button>
    </form>
  );
}
