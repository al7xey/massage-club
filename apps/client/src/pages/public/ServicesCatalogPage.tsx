import { createUiServiceCard, repeatToLength } from '@/shared/config/publicContent';
import { useGetServicesQuery } from '@/shared/api/servicesApi';
import { HomeCrumb, ServiceCard } from '@/shared/ui/public/PublicBlocks';

const filterCategories = [
  ['Массаж', 12],
  ['Уход за лицом', 8],
  ['SPA-программы', 5],
  ['Коррекция фигуры', 6],
];

const filterStudios = ['Центральный филиал', 'Виктория Палас', 'На Набережной'];

export function ServicesCatalogPage() {
  const { data = [], isLoading } = useGetServicesQuery();
  const cards = repeatToLength(data, 6).map((service, index) => createUiServiceCard(service, index));

  return (
    <main className="page">
      <section className="page-heading">
        <HomeCrumb />
        <h1>Наши услуги</h1>
        <p>Откройте для себя мир осознанного ухода. Профессиональные массажи, SPA-ритуалы и эстетическая косметология.</p>
      </section>

      <section className="catalog-layout">
        <aside className="filters-panel">
          <div className="filters-panel__header">
            <strong>ФИЛЬТРЫ</strong>
            <button className="text-btn" type="button">
              Сбросить
            </button>
          </div>

          <div className="filter-group">
            <h3>Категории</h3>
            {filterCategories.map(([label, count]) => (
              <label key={label} className="check-row">
                <input type="checkbox" />
                <span>{label}</span>
                <span>{count}</span>
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h3>Студии</h3>
            {filterStudios.map((studio) => (
              <label key={studio} className="check-row">
                <input type="checkbox" />
                <span>{studio}</span>
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h3>Стоимость</h3>
            <input type="range" min={2000} max={8000} defaultValue={4600} />
            <div className="price-range">
              <span>от 2000 ₽</span>
              <span>до 8000 ₽</span>
            </div>
          </div>
        </aside>

        <div>
          <div className="catalog-toolbar">
            <p>
              Найдено: <strong>{Math.max(cards.length, data.length)} услуги</strong>
            </p>
            <p>Сортировать: По популярности</p>
          </div>
          {isLoading ? <p className="state-line">Загрузка услуг...</p> : null}
          <div className="catalog-grid">
            {cards.map((service, index) => (
              <ServiceCard key={`${service.id}-${index}`} service={service} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
