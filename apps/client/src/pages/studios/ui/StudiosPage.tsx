import { useMemo, useState } from 'react';
import { appRoutes } from '@/shared/routes';
import { Button, EmptyState, LinkButton, TextField } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import styles from './StudiosPage.module.css';

export function StudiosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudioId, setSelectedStudioId] = useState<string | null>(null);
  const { data = [] } = useGetStudiosQuery();
  const list = useMemo(() => data.map(createStudioCardModel), [data]);
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
  const mapUrl = useMemo(() => buildMapUrl(visibleStudios, selectedStudio?.id), [selectedStudio?.id, visibleStudios]);

  return (
    <PageShell title="Наши студии" description="Выберите ближайший филиал для записи и регулярного посещения клуба.">
      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <h2>Филиалы</h2>
          <p>Поиск по названию, району или адресу</p>
          <TextField
            label="Поиск"
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
                  <Button fullWidth size="sm" onClick={() => setSelectedStudioId(studio.id)}>
                    {isSelected ? 'Выбрана' : 'Выбрать студию'}
                  </Button>
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
              <LinkButton to={appRoutes.booking()}>
                Записаться
              </LinkButton>
            </div>
          ) : (
            <EmptyState title="Студии не найдены" description="Попробуйте изменить запрос." />
          )}
        </div>
      </section>
    </PageShell>
  );
}

function buildMapUrl(studios: ReturnType<typeof createStudioCardModel>[], selectedId?: string) {
  const points = studios
    .map((studio) => {
      const marker = studio.id === selectedId ? 'pm2gnm' : 'pm2grm';
      return `${studio.coordinates.lon},${studio.coordinates.lat},${marker}`;
    })
    .join('~');
  const center = studios[0]?.coordinates ?? { lat: 46.3492, lon: 48.0409 };
  const params = new URLSearchParams({
    ll: `${center.lon},${center.lat}`,
    mode: 'usermaps',
    pt: points,
    z: '13',
  });

  return `https://yandex.ru/map-widget/v1/?${params.toString()}`;
}
