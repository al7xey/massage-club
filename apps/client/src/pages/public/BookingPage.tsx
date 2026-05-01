import { Page } from '@/shared/ui/Page';

export function BookingPage() {
  return (
    <Page title="Запись на процедуру" description="Здесь будет собственный модуль онлайн-записи без внешних CRM и YCLIENTS.">
      <form className="card form-grid">
        <input className="input" placeholder="Услуга" />
        <input className="input" placeholder="Студия" />
        <input className="input" placeholder="Мастер" />
        <input className="input" type="datetime-local" />
        <button className="button" type="button">Подготовить запись</button>
      </form>
    </Page>
  );
}
