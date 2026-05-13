import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { BookingDraftForm } from '@/features/book-appointment';

export function BookingPage() {
  return (
    <PageShell
      title="Запись на процедуру"
      description="Здесь будет собственный модуль онлайн-записи без внешних CRM и YCLIENTS."
    >
      <BookingDraftForm />
    </PageShell>
  );
}
