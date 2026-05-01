import { Page } from '@/shared/ui/Page';

export function AccountPage() {
  return (
    <Page title="Личный кабинет" description="Профиль клиента, активная подписка, записи и обращения.">
      <div className="grid">
        <a className="card" href="/account/subscription">Моя подписка</a>
        <a className="card" href="/account/appointments">Мои записи</a>
        <a className="card" href="/account/payments">Мои платежи</a>
        <a className="card" href="/account/support">Поддержка</a>
      </div>
    </Page>
  );
}
