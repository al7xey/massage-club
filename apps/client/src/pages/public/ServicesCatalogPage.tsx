import { useGetServicesQuery } from '@/shared/api/servicesApi';
import { Page } from '@/shared/ui/Page';

export function ServicesCatalogPage() {
  const { data = [], isLoading } = useGetServicesQuery();

  return (
    <Page title="Каталог услуг" description="Массаж, уходовые процедуры и программы восстановления.">
      {isLoading ? <p>Загрузка услуг...</p> : null}
      <div className="grid">
        {data.map((service) => (
          <article className="card" key={service.id}>
            <h2>{service.title}</h2>
            <p>{service.description}</p>
            <strong>{service.durationMinutes} мин · {service.priceRub} ₽</strong>
          </article>
        ))}
      </div>
    </Page>
  );
}
