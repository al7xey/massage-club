import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { repeatToLength } from '@/shared/lib/collection/repeatToLength';
import { appRoutes } from '@/shared/routes';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import styles from './StudiosPage.module.css';

const mapUrl =
  'https://yandex.ru/map-widget/v1/?ll=48.040900%2C46.349200&mode=search&oid=0&ol=biz&pt=48.040900%2C46.349200%2Cpm2grm&text=%D0%90%D1%81%D1%82%D1%80%D0%B0%D1%85%D0%B0%D0%BD%D1%8C%20%D0%BC%D0%B0%D1%81%D1%81%D0%B0%D0%B6&z=13';

export function StudiosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudioId, setSelectedStudioId] = useState<string | null>(null);
  const { data = [] } = useGetStudiosQuery();
  const list = useMemo(() => repeatToLength(data, 2).map(createStudioCardModel), [data]);
  const visibleStudios = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return list;
    }

    return list.filter(
      (studio) =>
        studio.title.toLowerCase().includes(normalizedQuery) ||
        studio.address.toLowerCase().includes(normalizedQuery) ||
        studio.openLabel.toLowerCase().includes(normalizedQuery),
    );
  }, [list, searchQuery]);
  const selectedStudio = visibleStudios.find((studio) => studio.id === selectedStudioId) ?? visibleStudios[0];

  return (
    <PageShell title="Наши студии" description="Выберите ближайший филиал для записи и регулярного посещения клуба.">
      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <h2>Филиалы</h2>
          <p>Поиск по названию, району или адресу</p>
          <input
            className={styles.input}
            placeholder="Поиск по адресу или названию"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <span className={styles.city}>Астрахань</span>

          <div className={styles.list}>
            {visibleStudios.map((studio, index) => {
              const isSelected = selectedStudio?.id === studio.id;

              return (
                <article key={`${studio.id}-${index}`} className={`${styles.card} ${isSelected ? styles.selected : ''}`}>
                  <h2>{studio.title}</h2>
                  <p>{studio.address}</p>
                  <p>{studio.openLabel}</p>
                  <p>{studio.phone}</p>
                  <button className={styles.primaryButton} type="button" onClick={() => setSelectedStudioId(studio.id)}>
                    {isSelected ? 'Выбрана' : 'Выбрать студию'}
                  </button>
                </article>
              );
            })}
          </div>
        </aside>

        <div className={styles.mapArea}>
          <iframe
            className={styles.mapFrame}
            title="Карта студий Massage Club"
            src={mapUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          {selectedStudio ? (
            <div className={styles.floatingCard}>
              <div>
                <h3>{selectedStudio.title}</h3>
                <p>{selectedStudio.address}</p>
                <p>{selectedStudio.openLabel}</p>
              </div>
              <Link className={styles.primaryButton} to={appRoutes.booking()}>
                Записаться
              </Link>
            </div>
          ) : (
            <div className={styles.empty}>
              <h2>Студии не найдены</h2>
              <p>Попробуйте изменить запрос.</p>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
