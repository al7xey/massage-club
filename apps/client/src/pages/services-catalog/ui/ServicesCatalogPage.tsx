import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { Button, EmptyState, SelectField, TextField } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { BookableServiceCard } from '@/features/service-card-actions';
import {
  createServiceCardModel,
  type ServiceDto,
  useGetServiceCategoriesQuery,
  useGetServicesQuery,
} from '@/entities/service';
import styles from './ServicesCatalogPage.module.css';

const priceMin = 0;
const priceMax = 10000;
const priceStep = 500;
const durationMin = 5;
const durationMax = 150;
const durationStep = 5;
const pageLimit = 12;

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
  const [page, setPage] = useState(1);
  const [loadedServices, setLoadedServices] = useState<ServiceDto[]>([]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filterKey = `${searchQuery.trim()}|${selectedCategories.join(',')}|${minPrice}-${maxPrice}|${minDuration}-${maxDuration}|${sortBy}`;
  const queryArgs = useMemo(
    () => ({
      page,
      limit: pageLimit,
      search: searchQuery.trim() || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
      minDuration: minDuration > durationMin ? minDuration : undefined,
      maxDuration: maxDuration < durationMax ? maxDuration : undefined,
      minPrice: minPrice > priceMin ? minPrice : undefined,
      maxPrice: maxPrice < priceMax ? maxPrice : undefined,
      sort: sortBy,
    }),
    [maxDuration, maxPrice, minDuration, minPrice, page, searchQuery, selectedCategories, sortBy],
  );

  const { data, error, isFetching, isLoading } = useGetServicesQuery(queryArgs);
  const { data: categories = [] } = useGetServiceCategoriesQuery();

  useEffect(() => {
    setPage(1);
    setLoadedServices([]);
  }, [filterKey]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setLoadedServices((current) => {
      if (data.page === 1) {
        return data.items;
      }

      const existingIds = new Set(current.map((service) => service.id));
      return [...current, ...data.items.filter((service) => !existingIds.has(service.id))];
    });
  }, [data]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !data?.hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !isFetching) {
          setPage((current) => current + 1);
        }
      },
      { rootMargin: '220px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [data?.hasMore, isFetching]);

  const cards = useMemo(() => loadedServices.map((service) => createServiceCardModel(service)), [loadedServices]);
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    minPrice > priceMin ||
    maxPrice < priceMax ||
    minDuration > durationMin ||
    maxDuration < durationMax ||
    sortBy !== 'popular' ||
    searchQuery.trim().length > 0;
  const priceRangeStyle = getRangeStyle(minPrice, maxPrice, priceMin, priceMax);
  const durationRangeStyle = getRangeStyle(minDuration, maxDuration, durationMin, durationMax);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setMinPrice(priceMin);
    setMaxPrice(priceMax);
    setMinDuration(durationMin);
    setMaxDuration(durationMax);
    setSortBy('popular');
  };

  const toggleCategory = (slug: string) => {
    setSelectedCategories((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  };

  const updateMinPrice = (value: number) => {
    setMinPrice(clampRangeValue(value, priceMin, maxPrice - priceStep));
  };

  const updateMaxPrice = (value: number) => {
    setMaxPrice(clampRangeValue(value, minPrice + priceStep, priceMax));
  };

  const updateMinDuration = (value: number) => {
    setMinDuration(clampRangeValue(value, durationMin, maxDuration - durationStep));
  };

  const updateMaxDuration = (value: number) => {
    setMaxDuration(clampRangeValue(value, minDuration + durationStep, durationMax));
  };

  return (
    <PageShell title="Наши услуги">
      <section className={styles.catalog}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <TextField
              label="Поиск"
              placeholder="Поиск по услуге или составу"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <Button
            className={styles.filterButton}
            variant="secondary"
            aria-label="Фильтры"
            aria-expanded={isFiltersOpen}
            onClick={() => setIsFiltersOpen((value) => !value)}
          >
            <FilterIcon />
            <span className={styles.filterButtonText}>Фильтры</span>
          </Button>
        </div>

        <div className={styles.body}>
          {isFiltersOpen ? (
            <aside className={styles.filters}>
              <div className={styles.filtersHeader}>
                <strong>Фильтры</strong>
                <Button
                  className={styles.resetButton}
                  size="sm"
                  variant="ghost"
                  aria-label="Сбросить фильтры"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                >
                  <ResetIcon />
                </Button>
              </div>

              <div className={`${styles.filterGroup} ${styles.categoryGroup}`}>
                <h3>Категории</h3>
                <div className={styles.categoryGrid}>
                  {categories.map((category) => (
                    <label className={styles.checkRow} key={category.id}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.slug)}
                        onChange={() => toggleCategory(category.slug)}
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={`${styles.filterGroup} ${styles.sortGroup}`}>
                <h3>Сортировка</h3>
                <SelectField
                  label="Сортировка"
                  className={styles.sortSelect}
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

              <div className={`${styles.filterGroup} ${styles.priceGroup}`}>
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
                    onChange={(event) => updateMinPrice(Number(event.target.value))}
                  />
                  <input
                    className={`${styles.range} ${styles.rangeMax}`}
                    aria-label="Максимальная стоимость"
                    type="range"
                    min={priceMin}
                    max={priceMax}
                    step={priceStep}
                    value={maxPrice}
                    onChange={(event) => updateMaxPrice(Number(event.target.value))}
                  />
                </div>
                <div className={styles.rangeFields}>
                  <label className={styles.rangeField}>
                    <span>от</span>
                    <input
                      aria-label="Стоимость от"
                      inputMode="numeric"
                      min={priceMin}
                      max={priceMax}
                      step={priceStep}
                      type="number"
                      value={minPrice}
                      onChange={(event) => updateMinPrice(Number(event.target.value))}
                    />
                  </label>
                  <label className={styles.rangeField}>
                    <span>до</span>
                    <input
                      aria-label="Стоимость до"
                      inputMode="numeric"
                      min={priceMin}
                      max={priceMax}
                      step={priceStep}
                      type="number"
                      value={maxPrice}
                      onChange={(event) => updateMaxPrice(Number(event.target.value))}
                    />
                  </label>
                </div>
              </div>

              <div className={`${styles.filterGroup} ${styles.durationGroup}`}>
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
                    onChange={(event) => updateMinDuration(Number(event.target.value))}
                  />
                  <input
                    className={`${styles.range} ${styles.rangeMax}`}
                    aria-label="Максимальная длительность"
                    type="range"
                    min={durationMin}
                    max={durationMax}
                    step={durationStep}
                    value={maxDuration}
                    onChange={(event) => updateMaxDuration(Number(event.target.value))}
                  />
                </div>
                <div className={styles.rangeFields}>
                  <label className={styles.rangeField}>
                    <span>от</span>
                    <input
                      aria-label="Длительность от"
                      inputMode="numeric"
                      min={durationMin}
                      max={durationMax}
                      step={durationStep}
                      type="number"
                      value={minDuration}
                      onChange={(event) => updateMinDuration(Number(event.target.value))}
                    />
                    <em>мин</em>
                  </label>
                  <label className={styles.rangeField}>
                    <span>до</span>
                    <input
                      aria-label="Длительность до"
                      inputMode="numeric"
                      min={durationMin}
                      max={durationMax}
                      step={durationStep}
                      type="number"
                      value={maxDuration}
                      onChange={(event) => updateMaxDuration(Number(event.target.value))}
                    />
                    <em>мин</em>
                  </label>
                </div>
              </div>
            </aside>
          ) : null}

          <div className={styles.results}>
            {isLoading ? <p className={styles.state}>Загрузка услуг...</p> : null}
            {error ? <p className={styles.state}>Не удалось загрузить каталог. Проверьте API и попробуйте позже.</p> : null}
            {cards.length === 0 && !isLoading && !error ? (
              <EmptyState
                title="Услуги не найдены"
                description="Попробуйте изменить поиск, категорию или ограничения по цене и длительности."
              />
            ) : null}

            <div className={styles.grid}>
              {cards.map((service) => (
                <BookableServiceCard key={service.id} service={service} />
              ))}
            </div>

            <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
            {data?.hasMore || (isFetching && cards.length > 0) ? (
              <p className={styles.state}>{isFetching ? 'Загружаем еще услуги...' : 'Прокрутите ниже, чтобы увидеть больше услуг.'}</p>
            ) : null}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function FilterIcon() {
  return (
    <svg className={styles.filterIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 7h16" />
      <path d="M7 12h10" />
      <path d="M10 17h4" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg className={styles.resetIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 15h10l1-15" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function getRangeStyle(currentMin: number, currentMax: number, min: number, max: number) {
  return {
    '--range-start': `${((currentMin - min) / (max - min)) * 100}%`,
    '--range-end': `${100 - ((currentMax - min) / (max - min)) * 100}%`,
  } as CSSProperties;
}

function clampRangeValue(value: number, min: number, max: number) {
  const normalizedValue = Number.isFinite(value) ? value : min;
  return Math.min(max, Math.max(min, normalizedValue));
}
