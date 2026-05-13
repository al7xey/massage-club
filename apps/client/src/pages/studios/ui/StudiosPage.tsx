import { HomeBreadcrumb } from '@/shared/ui/breadcrumbs/HomeBreadcrumb';
import { repeatToLength } from '@/shared/lib/collection/repeatToLength';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';

export function StudiosPage() {
  const { data = [] } = useGetStudiosQuery();
  const list = repeatToLength(data, 2).map(createStudioCardModel);

  return (
    <main className="page">
      <HomeBreadcrumb />

      <section className="studios-map-layout">
        <aside className="studios-sidebar">
          <h1>Наши студии</h1>
          <p>Выберите ближайший филиал для записи</p>
          <input className="input" placeholder="Поиск по адресу или названию" />
          <span className="city-pill">Астрахань</span>

          <div className="studios-sidebar-list">
            {list.map((studio, index) => (
              <article key={`${studio.id}-${index}`} className="studio-spot-card">
                <div className={`studio-spot-card__image studio-spot-card__image--${index % 2 === 0 ? 'a' : 'b'}`} />
                <div className="studio-spot-card__body">
                  <h2>{studio.title}</h2>
                  <p>{studio.address}</p>
                  <p>{studio.openLabel}</p>
                  <p>{studio.phone}</p>
                  <button className="ui-btn ui-btn-primary ui-btn-block" type="button">
                    Записаться
                  </button>
                </div>
              </article>
            ))}
          </div>
        </aside>

        <div className="map-area">
          <div className="map-tools">
            <button type="button">+</button>
            <button type="button">−</button>
            <button type="button">⌖</button>
          </div>
          <div className="map-circle">
            <div className="map-pin map-pin--1">Центральный филиал</div>
            <div className="map-pin map-pin--2">Отель «Виктория Палас»</div>
          </div>
          <div className="map-floating-card">
            <div className="map-floating-card__thumb" />
            <div>
              <h3>Центральный филиал</h3>
              <p>Астрахань, ул. Советская, 10</p>
            </div>
            <button className="ui-btn ui-btn-primary" type="button">
              Записаться
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
