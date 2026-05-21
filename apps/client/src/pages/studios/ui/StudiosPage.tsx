import { useMemo } from 'react';
import { createStudioCardModel, StudioCard, useGetStudiosQuery } from '@/entities/studio';
import { EmptyState } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './StudiosPage.module.css';

export function StudiosPage() {
  const { data = [], isLoading } = useGetStudiosQuery();
  const studios = useMemo(() => data.map(createStudioCardModel), [data]);

  return (
    <PageShell title="Наши студии">
      {isLoading ? <p className={styles.state}>Загрузка студий...</p> : null}
      {!isLoading && studios.length === 0 ? (
        <EmptyState title="Студии не найдены" description="Список студий обновится после синхронизации базы." />
      ) : null}

      <section className={styles.grid}>
        {studios.map((studio) => (
          <StudioCard key={studio.id} studio={studio} />
        ))}
      </section>

      {studios.length > 0 ? (
        <section className={styles.mapSection} id="map">
          <div className={styles.mapFrame}>
            <iframe
              title="Карта студий RelaxUp"
              src="https://www.openstreetmap.org/export/embed.html?bbox=37.536%2C55.69%2C37.65%2C55.78&layer=mapnik&marker=55.7603%2C37.6138"
              loading="lazy"
            />
          </div>
          <div className={styles.mapList}>
            {studios.map((studio) => (
              <article key={studio.id}>
                <strong>{studio.title}</strong>
                <span>{studio.address}</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
