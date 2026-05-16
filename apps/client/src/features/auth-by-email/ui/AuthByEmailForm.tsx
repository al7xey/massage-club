import { FormEvent, useState } from 'react';
import { tokenStorage } from '@/shared/lib/storage/tokenStorage';
import { useLoginMutation } from '../api/authByEmailApi';
import styles from './AuthByEmailForm.module.css';

export function AuthByEmailForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Введите email и пароль');
      return;
    }

    if (!email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    try {
      const response = await login({ email, password }).unwrap();
      tokenStorage.setAccessToken(response.accessToken);
      setError('');
    } catch {
      setError('Не удалось войти. Проверьте данные или попробуйте позже.');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <input
        className={styles.input}
        type="email"
        placeholder="email@example.com"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
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
