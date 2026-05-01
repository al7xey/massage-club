import { useParams } from 'react-router-dom';
import { useGetServiceQuery } from '@/shared/api/servicesApi';
import { Page } from '@/shared/ui/Page';

export function ServiceDetailsPage() {
  const { id = '' } = useParams();
  const { data } = useGetServiceQuery(id, { skip: !id });

  return (
    <Page title={data?.title ?? 'Страница услуги'} description="Детальная информация о процедуре и записи.">
      <div className="card">
        <p>{data?.description ?? 'Здесь будет описание выбранной услуги.'}</p>
      </div>
    </Page>
  );
}
