import { Page } from '@/shared/ui/Page';

export function AuthPage() {
  return (
    <Page title="Вход и регистрация" description="Базовая страница авторизации клиента и администратора.">
      <form className="card form-grid">
        <input className="input" type="email" placeholder="email@example.com" />
        <input className="input" type="password" placeholder="Пароль" />
        <button className="button" type="button">Войти</button>
      </form>
    </Page>
  );
}
