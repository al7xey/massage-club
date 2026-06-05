import { useMemo } from 'react';
import { createMasterCardModel, MasterCard, useGetMastersQuery } from '@/entities/master';
import { EmptyState } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './MastersPage.module.css';

export function MastersPage() {
  const { data = [], isLoading } = useGetMastersQuery();
  const cards = useMemo(() => data.map((master) => createMasterCardModel(master)), [data]);

  return (
    <PageShell title="Наши мастера">
      {isLoading ? <p className={styles.state}>Загрузка мастеров...</p> : null}
      {cards.length === 0 && !isLoading ? (
        <EmptyState title="Мастера не найдены" description="Список мастеров обновится после синхронизации базы." />
      ) : null}

      <section className={styles.grid}>
        {cards.map((master) => (
          <MasterCard key={master.id} master={master} />
        ))}
      </section>
    </PageShell>
  );
}
