import { BookingDraftForm } from '@/features/book-appointment';
import { PageShell } from '@/shared/ui/page-shell/PageShell';

export function BookingPage() {
  return (
    <PageShell
      title="Запись на услугу"
      description="Выберите услугу, специалиста, удобное время и подтвердите покупку или запись по подписке."
    >
      <BookingDraftForm />
    </PageShell>
  );
}
