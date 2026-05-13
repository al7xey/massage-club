import { FormEvent, useState } from 'react';
import { tokenStorage } from '@/shared/lib/storage/tokenStorage';
import { useLoginMutation } from '../api/authByEmailApi';

export function AuthByEmailForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      return;
    }

    try {
      const response = await login({ email, password }).unwrap();
      tokenStorage.setAccessToken(response.accessToken);
    } catch {
      // The page currently has no dedicated auth UX; keep failure silent for now.
    }
  };

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <input
        className="input"
        type="email"
        placeholder="email@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        className="input"
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <button className="button" type="submit" disabled={isLoading}>
        {isLoading ? 'Входим...' : 'Войти'}
      </button>
    </form>
  );
}
