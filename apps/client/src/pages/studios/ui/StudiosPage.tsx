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
    </PageShell>
  );
}
