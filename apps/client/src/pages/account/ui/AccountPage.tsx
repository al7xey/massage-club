import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { appRoutes } from '@/shared/routes';
import styles from './AccountPage.module.css';

export function AccountPage() {
  return (
    <PageShell title="Личный кабинет" description="Профиль клиента, активная подписка, записи и обращения.">
      <div className={styles.grid}>
        <a className={styles.card} href={appRoutes.accountSubscription()}>
          Моя подписка
        </a>
        <a className={styles.card} href={appRoutes.accountAppointments()}>
          Мои записи
        </a>
        <a className={styles.card} href={appRoutes.accountPayments()}>
          Мои платежи
        </a>
        <a className={styles.card} href={appRoutes.accountSupport()}>
          Поддержка
        </a>
      </div>
    </PageShell>
  );
}
