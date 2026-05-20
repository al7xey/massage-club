import { useMemo, useState } from 'react';
import { EmptyState, TextField } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { createMasterCardModel, MasterCard, useGetMastersQuery } from '@/entities/master';
import styles from './MastersPage.module.css';

export function MastersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data = [], isLoading } = useGetMastersQuery();
  const cards = useMemo(() => data.map((master, index) => createMasterCardModel(master, index)), [data]);
  const visibleCards = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return cards;

    return cards.filter(
      (master) =>
        master.fullName.toLowerCase().includes(normalizedQuery) ||
        master.roleLabel.toLowerCase().includes(normalizedQuery) ||
        master.summary.toLowerCase().includes(normalizedQuery),
    );
  }, [cards, searchQuery]);

  return (
    <PageShell
      title="Наши мастера"
      description="Стартовая команда мастеров массажа и SPA. Все мастера привязаны к полному каталогу услуг."
    >
      <section className={styles.toolbar}>
        <TextField
          label="Поиск"
          placeholder="Найти мастера"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <span>{visibleCards.length} мастера</span>
      </section>

      {isLoading ? <p className={styles.state}>Загрузка мастеров...</p> : null}
      {visibleCards.length === 0 && !isLoading ? (
        <EmptyState title="Мастера не найдены" description="Попробуйте ввести другое имя или направление." />
      ) : null}

      <section className={styles.grid}>
        {visibleCards.map((master) => (
          <MasterCard key={master.id} master={master} />
        ))}
      </section>
    </PageShell>
  );
}
