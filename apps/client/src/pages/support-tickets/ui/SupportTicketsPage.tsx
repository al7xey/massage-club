import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './SupportTicketsPage.module.css';

export function SupportTicketsPage() {
  return (
    <PageShell title="Обращения в поддержку" description="Канал связи клиента с администратором сети.">
      <div className={styles.card}>Здесь появится список обращений и форма создания тикета.</div>
    </PageShell>
  );
}
