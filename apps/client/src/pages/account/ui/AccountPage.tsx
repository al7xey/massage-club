import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { appRoutes } from '@/shared/routes';

export function AccountPage() {
  return (
    <PageShell title="Личный кабинет" description="Профиль клиента, активная подписка, записи и обращения.">
      <div className="grid">
        <a className="card" href={appRoutes.accountSubscription()}>
          Моя подписка
        </a>
        <a className="card" href={appRoutes.accountAppointments()}>
          Мои записи
        </a>
        <a className="card" href={appRoutes.accountPayments()}>
          Мои платежи
        </a>
        <a className="card" href={appRoutes.accountSupport()}>
          Поддержка
        </a>
      </div>
    </PageShell>
  );
}
