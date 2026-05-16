import { useMemo, useState } from 'react';
import { repeatToLength } from '@/shared/lib/collection/repeatToLength';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { createServiceCardModel, ServiceCard, useGetServicesQuery } from '@/entities/service';
import styles from './ServicesCatalogPage.module.css';

const categories = ['Массаж', 'Уход за лицом', 'SPA-программы', 'Коррекция фигуры'];
const studios = ['Центральный филиал', 'Виктория Палас', 'На Набережной'];
const membershipOptions = ['Любая подписка', 'Lady', 'Master', 'Семейная'];
const durationOptions = [
  ['short', 'До 60 минут'],
  ['medium', '60-90 минут'],
  ['long', 'Больше 90 минут'],
] as const;

type DurationFilter = (typeof durationOptions)[number][0];

export function ServicesCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStudios, setSelectedStudios] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<DurationFilter[]>([]);
  const [selectedMemberships, setSelectedMemberships] = useState<string[]>([]);
  const [availableTodayOnly, setAvailableTodayOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(8000);
  const { data = [], isLoading } = useGetServicesQuery();

  const cards = useMemo(
    () => repeatToLength(data, 6).map((service, index) => createServiceCardModel(service, index)),
    [data],
  );

  const catalogItems = useMemo(
    () =>
      cards.map((service, index) => ({
        service,
        membershipLabel: membershipOptions[(index % (membershipOptions.length - 1)) + 1],
        durationBand: getDurationBand(service.durationMinutes),
      })),
    [cards],
  );

  const visibleCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = catalogItems.filter(({ durationBand, membershipLabel, service }) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(service.categoryLabel);
      const matchesStudio = selectedStudios.length === 0 || selectedStudios.includes(service.studioLabel);
      const matchesDuration = selectedDurations.length === 0 || selectedDurations.includes(durationBand);
      const matchesMembership =
        selectedMemberships.length === 0 ||
        selectedMemberships.includes('Любая подписка') ||
        selectedMemberships.includes(membershipLabel);
      const matchesPrice = service.priceRub <= maxPrice;
      const matchesAvailable = !availableTodayOnly || service.isAvailableToday;
      const matchesSearch = [service.title, service.categoryLabel, service.description].join(' ').toLowerCase().includes(query);

      return (
        matchesCategory &&
        matchesStudio &&
        matchesDuration &&
        matchesMembership &&
        matchesPrice &&
        matchesAvailable &&
        (query.length === 0 || matchesSearch)
      );
    });

    return [...filtered].sort((first, second) => {
      if (sortBy === 'price') return first.service.priceRub - second.service.priceRub;
      if (sortBy === 'duration') return first.service.durationMinutes - second.service.durationMinutes;
      return second.service.reviewCount - first.service.reviewCount;
    });
  }, [
    availableTodayOnly,
    catalogItems,
    maxPrice,
    searchQuery,
    selectedCategories,
    selectedDurations,
    selectedMemberships,
    selectedStudios,
    sortBy,
  ]);

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedStudios.length > 0 ||
    selectedDurations.length > 0 ||
    selectedMemberships.length > 0 ||
    availableTodayOnly ||
    maxPrice < 8000;

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedStudios([]);
    setSelectedDurations([]);
    setSelectedMemberships([]);
    setAvailableTodayOnly(false);
    setMaxPrice(8000);
  };

  return (
    <PageShell
      title="Наши услуги"
      description="Профессиональные массажи, SPA-ритуалы и эстетическая косметология для спокойного восстановления и регулярной заботы о себе."
    >
      <section className={styles.catalog}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <input
              className={styles.search}
              placeholder="Поиск по услуге"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <button
            className={styles.filterButton}
            type="button"
            aria-expanded={isFiltersOpen}
            onClick={() => setIsFiltersOpen((value) => !value)}
          >
            Фильтры{hasActiveFilters ? ` (${activeFiltersCount({
              availableTodayOnly,
              maxPrice,
              selectedCategories,
              selectedDurations,
              selectedMemberships,
              selectedStudios,
            })})` : ''}
          </button>
          <div className={styles.toolbarMeta}>
            <p>Найдено: <strong>{visibleCards.length}</strong></p>
            <label>
              <span>Сортировать:</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="popular">По популярности</option>
                <option value="price">Сначала дешевле</option>
                <option value="duration">По длительности</option>
              </select>
            </label>
          </div>
        </div>

        <div className={`${styles.body} ${isFiltersOpen ? styles.withFilters : ''}`}>
          {isFiltersOpen ? (
            <aside className={styles.filters}>
              <div className={styles.filtersHeader}>
                <strong>Фильтры</strong>
                <button type="button" onClick={resetFilters} disabled={!hasActiveFilters}>
                  Сбросить
                </button>
              </div>
              <FilterGroup title="Категории" values={categories} selected={selectedCategories} onToggle={toggleString(setSelectedCategories)} />
              <FilterGroup title="Студии" values={studios} selected={selectedStudios} onToggle={toggleString(setSelectedStudios)} />
              <FilterGroup title="Подписка" values={membershipOptions} selected={selectedMemberships} onToggle={toggleString(setSelectedMemberships)} />
              <div className={styles.filterGroup}>
                <h3>Стоимость</h3>
                <input
                  className={styles.range}
                  type="range"
                  min="2000"
                  max="8000"
                  step="500"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(Number(event.target.value))}
                />
                <div className={styles.priceFields}>
                  <span>до {maxPrice.toLocaleString('ru-RU')} ₽</span>
                  <span>8 000 ₽</span>
                </div>
              </div>
              <FilterGroup
                title="Длительность"
                values={durationOptions.map(([, label]) => label)}
                selected={durationOptions.filter(([key]) => selectedDurations.includes(key)).map(([, label]) => label)}
                onToggle={(label) => {
                  const key = durationOptions.find(([, value]) => value === label)?.[0];
                  if (key) toggleString(setSelectedDurations)(key);
                }}
              />
              <label className={styles.switchRow}>
                <input
                  type="checkbox"
                  checked={availableTodayOnly}
                  onChange={(event) => setAvailableTodayOnly(event.target.checked)}
                />
                <span>Доступно сегодня</span>
              </label>
            </aside>
          ) : null}

          <div className={styles.results}>
            {isLoading ? <p className={styles.state}>Загрузка услуг...</p> : null}
            {visibleCards.length === 0 && !isLoading ? <p className={styles.state}>Услуги не найдены.</p> : null}

            <div className={styles.grid}>
              {visibleCards.map(({ service }, index) => (
                <ServiceCard key={`${service.id}-${index}`} service={service} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function getDurationBand(minutes: number): DurationFilter {
  if (minutes < 60) return 'short';
  if (minutes <= 90) return 'medium';
  return 'long';
}

function toggleString<T extends string>(setter: (value: (current: T[]) => T[]) => void) {
  return (value: T) => {
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  };
}

function activeFiltersCount({
  availableTodayOnly,
  maxPrice,
  selectedCategories,
  selectedDurations,
  selectedMemberships,
  selectedStudios,
}: {
  availableTodayOnly: boolean;
  maxPrice: number;
  selectedCategories: string[];
  selectedDurations: string[];
  selectedMemberships: string[];
  selectedStudios: string[];
}) {
  return (
    selectedCategories.length +
    selectedDurations.length +
    selectedMemberships.length +
    selectedStudios.length +
    (availableTodayOnly ? 1 : 0) +
    (maxPrice < 8000 ? 1 : 0)
  );
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
      {values.map((value, index) => (
        <label className={styles.checkRow} key={value}>
          <input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle?.(value)} />
          <span>{value}</span>
        </label>
      ))}
    </div>
  );
}
