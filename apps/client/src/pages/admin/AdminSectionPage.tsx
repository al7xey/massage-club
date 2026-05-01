import { useParams } from 'react-router-dom';
import { Page } from '@/shared/ui/Page';

const titles: Record<string, string> = {
  services: 'Админ: услуги',
  plans: 'Админ: тарифы',
  studios: 'Админ: студии',
  masters: 'Админ: мастера',
  schedule: 'Админ: расписание',
  appointments: 'Админ: записи',
  clients: 'Админ: клиенты',
  certificates: 'Админ: сертификаты',
  analytics: 'Админ: аналитика',
};

export function AdminSectionPage() {
  const { section = 'dashboard' } = useParams();
  const title = titles[section] ?? 'Админ-раздел';

  return (
    <Page title={title} description="CRUD-интерфейс будет подключен к REST API на следующем этапе.">
      <div className="card">Раздел: {section}</div>
    </Page>
  );
}
