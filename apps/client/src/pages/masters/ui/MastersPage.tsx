import { useMemo, useState } from 'react';
import { repeatToLength } from '@/shared/lib/collection/repeatToLength';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { createMasterCardModel, MasterCard, useGetMastersQuery } from '@/entities/master';
import styles from './MastersPage.module.css';

export function MastersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data = [], isLoading } = useGetMastersQuery();
  const cards = useMemo(() => repeatToLength(data, 4).map(createMasterCardModel), [data]);
  const visibleCards = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return cards;
    }

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
      description="Специалисты по массажу, SPA-ритуалам и восстановительным практикам для регулярной заботы о теле."
    >
      <section className={styles.toolbar}>
        <input
          className={styles.input}
          placeholder="Найти мастера или специализацию"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <span>{visibleCards.length} мастера</span>
      </section>

      {isLoading ? <p className={styles.state}>Загрузка мастеров...</p> : null}
      {visibleCards.length === 0 && !isLoading ? (
        <div className={styles.empty}>
          <h2>Мастера не найдены</h2>
          <p>Попробуйте ввести другое имя или направление массажа.</p>
        </div>
      ) : null}

      <section className={styles.grid}>
        {visibleCards.map((master, index) => (
          <MasterCard key={`${master.id}-${index}`} master={master} imageVariant={index % 2 === 0 ? 'a' : 'b'} />
        ))}
      </section>
    </PageShell>
  );
}
