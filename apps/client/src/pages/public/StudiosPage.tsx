import { useGetStudiosQuery } from '@/shared/api/servicesApi';
import { Page } from '@/shared/ui/Page';

export function StudiosPage() {
  const { data = [] } = useGetStudiosQuery();

  return (
    <Page title="Студии" description="Филиалы сети, где ведется собственное расписание мастеров.">
      <div className="grid">
        {data.map((studio) => (
          <article className="card" key={studio.id}>
            <h2>{studio.name}</h2>
            <p>{studio.city}</p>
            <p>{studio.address}</p>
          </article>
        ))}
      </div>
    </Page>
  );
}
