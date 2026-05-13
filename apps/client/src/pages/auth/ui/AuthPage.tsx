import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { AuthByEmailForm } from '@/features/auth-by-email';

export function AuthPage() {
  return (
    <PageShell title="Вход и регистрация" description="Базовая страница авторизации клиента и администратора.">
      <AuthByEmailForm />
    </PageShell>
  );
}
