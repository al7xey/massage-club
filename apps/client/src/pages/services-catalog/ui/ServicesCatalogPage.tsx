import { type CSSProperties, useMemo, useState } from 'react';
import { repeatToLength } from '@/shared/lib/collection/repeatToLength';
import { Button, EmptyState, SelectField, TextField } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { BookableServiceCard } from '@/features/service-card-actions';
import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import styles from './ServicesCatalogPage.module.css';

const priceMin = 2000;
const priceMax = 8000;
const priceStep = 500;
const durationMin = 30;
const durationMax = 150;
const durationStep = 15;

const sortOptions = [
  ['popular', 'По популярности'],
  ['priceAsc', 'Сначала дешевле'],
  ['priceDesc', 'Сначала дороже'],
  ['durationAsc', 'Сначала короче'],
  ['durationDesc', 'Сначала длиннее'],
] as const;

type SortOption = (typeof sortOptions)[number][0];

export function ServicesCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(priceMin);
  const [maxPrice, setMaxPrice] = useState(priceMax);
  const [minDuration, setMinDuration] = useState(durationMin);
  const [maxDuration, setMaxDuration] = useState(durationMax);
  const { data = [], isLoading } = useGetServicesQuery();

  const cards = useMemo(
    () => repeatToLength(data, 6).map((service, index) => createServiceCardModel(service, index)),
    [data],
  );

  const categoryOptions = useMemo(() => uniqueSorted(cards.map((service) => service.categoryLabel)), [cards]);

  const visibleCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = cards.filter((service) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(service.categoryLabel);
      const matchesPrice = service.priceRub >= minPrice && service.priceRub <= maxPrice;
      const matchesDuration = service.durationMinutes >= minDuration && service.durationMinutes <= maxDuration;
      const matchesSearch = [service.title, service.categoryLabel, service.description]
        .join(' ')
        .toLowerCase()
        .includes(query);

      return matchesCategory && matchesPrice && matchesDuration && (query.length === 0 || matchesSearch);
    });

    return [...filtered].sort((first, second) => {
      if (sortBy === 'priceAsc') return first.priceRub - second.priceRub;
      if (sortBy === 'priceDesc') return second.priceRub - first.priceRub;
      if (sortBy === 'durationAsc') return first.durationMinutes - second.durationMinutes;
      if (sortBy === 'durationDesc') return second.durationMinutes - first.durationMinutes;
      return second.reviewCount - first.reviewCount;
    });
  }, [cards, maxDuration, maxPrice, minDuration, minPrice, searchQuery, selectedCategories, sortBy]);

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    minPrice > priceMin ||
    maxPrice < priceMax ||
    minDuration > durationMin ||
    maxDuration < durationMax;

  const priceRangeStyle = getRangeStyle(minPrice, maxPrice, priceMin, priceMax);
  const durationRangeStyle = getRangeStyle(minDuration, maxDuration, durationMin, durationMax);

  const resetFilters = () => {
    setSelectedCategories([]);
    setMinPrice(priceMin);
    setMaxPrice(priceMax);
    setMinDuration(durationMin);
    setMaxDuration(durationMax);
  };

  return (
    <PageShell
      title="Наши услуги"
      description="Профессиональные массажи, SPA-ритуалы и эстетическая косметология для спокойного восстановления и регулярной заботы о себе."
    >
      <section className={styles.catalog}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <TextField
              label="Поиск"
              placeholder="Поиск по услуге"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <Button
            className={styles.filterButton}
            variant="secondary"
            aria-expanded={isFiltersOpen}
            onClick={() => setIsFiltersOpen((value) => !value)}
          >
            Фильтры{hasActiveFilters ? ` (${activeFiltersCount({
              maxDuration,
              maxPrice,
              minDuration,
              minPrice,
              selectedCategories,
            })})` : ''}
          </Button>
          <div className={styles.toolbarMeta}>
            <p>Найдено: <strong>{visibleCards.length}</strong></p>
            <SelectField
              label="Сортировать"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
            >
              {sortOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
          </div>
        </div>

        <div className={styles.body}>
          {isFiltersOpen ? (
            <aside className={styles.filters}>
              <div className={styles.filtersHeader}>
                <strong>Фильтры</strong>
                <Button size="sm" variant="ghost" onClick={resetFilters} disabled={!hasActiveFilters}>
                  Сбросить
                </Button>
              </div>

              <FilterGroup
                title="Услуги"
                values={categoryOptions}
                selected={selectedCategories}
                onToggle={toggleString(setSelectedCategories)}
              />

              <div className={styles.filterGroup}>
                <h3>Стоимость</h3>
                <div className={styles.rangeWrap} style={priceRangeStyle}>
                  <input
                    className={`${styles.range} ${styles.rangeMin}`}
                    aria-label="Минимальная стоимость"
                    type="range"
                    min={priceMin}
                    max={priceMax}
                    step={priceStep}
                    value={minPrice}
                    onChange={(event) => setMinPrice(Math.min(Number(event.target.value), maxPrice - priceStep))}
                  />
                  <input
                    className={`${styles.range} ${styles.rangeMax}`}
                    aria-label="Максимальная стоимость"
                    type="range"
                    min={priceMin}
                    max={priceMax}
                    step={priceStep}
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(Math.max(Number(event.target.value), minPrice + priceStep))}
                  />
                </div>
                <div className={styles.rangeFields}>
                  <span>от {minPrice.toLocaleString('ru-RU')} ₽</span>
                  <span>до {maxPrice.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              <div className={styles.filterGroup}>
                <h3>Длительность</h3>
                <div className={styles.rangeWrap} style={durationRangeStyle}>
                  <input
                    className={`${styles.range} ${styles.rangeMin}`}
                    aria-label="Минимальная длительность"
                    type="range"
                    min={durationMin}
                    max={durationMax}
                    step={durationStep}
                    value={minDuration}
                    onChange={(event) => setMinDuration(Math.min(Number(event.target.value), maxDuration - durationStep))}
                  />
                  <input
                    className={`${styles.range} ${styles.rangeMax}`}
                    aria-label="Максимальная длительность"
                    type="range"
                    min={durationMin}
                    max={durationMax}
                    step={durationStep}
                    value={maxDuration}
                    onChange={(event) => setMaxDuration(Math.max(Number(event.target.value), minDuration + durationStep))}
                  />
                </div>
                <div className={styles.rangeFields}>
                  <span>от {minDuration} мин</span>
                  <span>до {maxDuration} мин</span>
                </div>
              </div>
            </aside>
          ) : null}

          <div className={styles.results}>
            {isLoading ? <p className={styles.state}>Загрузка услуг...</p> : null}
            {visibleCards.length === 0 && !isLoading ? (
              <EmptyState
                title="Услуги не найдены"
                description="Попробуйте изменить поиск или сбросить активные фильтры."
              />
            ) : null}

            <div className={styles.grid}>
              {visibleCards.map((service, index) => (
                <BookableServiceCard key={`${service.id}-${index}`} service={service} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function getRangeStyle(currentMin: number, currentMax: number, min: number, max: number) {
  return {
    '--range-start': `${((currentMin - min) / (max - min)) * 100}%`,
    '--range-end': `${100 - ((currentMax - min) / (max - min)) * 100}%`,
  } as CSSProperties;
}

function toggleString<T extends string>(setter: (value: (current: T[]) => T[]) => void) {
  return (value: T) => {
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  };
}

function activeFiltersCount({
  maxDuration,
  maxPrice,
  minDuration,
  minPrice,
  selectedCategories,
}: {
  maxDuration: number;
  maxPrice: number;
  minDuration: number;
  minPrice: number;
  selectedCategories: string[];
}) {
  return (
    selectedCategories.length +
    (minPrice > priceMin || maxPrice < priceMax ? 1 : 0) +
    (minDuration > durationMin || maxDuration < durationMax ? 1 : 0)
  );
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((first, second) => first.localeCompare(second, 'ru'));
}

function FilterGroup({
  onToggle,
  selected = [],
  title,
  values,
}: {
  onToggle?: (value: string) => void;
  selected?: string[];
  title: string;
  values: string[];
}) {
  return (
    <div className={styles.filterGroup}>
      <h3>{title}</h3>
      {values.map((value) => (
        <label className={styles.checkRow} key={value}>
          <input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle?.(value)} />
          <span>{value}</span>
        </label>
      ))}
    </div>
  );
}
