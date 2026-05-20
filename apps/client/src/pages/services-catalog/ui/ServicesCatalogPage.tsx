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
const durationMin = 15;
const durationMax = 150;
const durationStep = 15;
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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(priceMax);
  const [maxDuration, setMaxDuration] = useState(durationMax);
  const [page, setPage] = useState(1);
  const [loadedServices, setLoadedServices] = useState<ServiceDto[]>([]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filterKey = `${searchQuery.trim()}|${selectedCategory}|${maxPrice}|${maxDuration}|${sortBy}`;
  const queryArgs = useMemo(
    () => ({
      page,
      limit: pageLimit,
      search: searchQuery.trim() || undefined,
      category: selectedCategory || undefined,
      duration: maxDuration < durationMax ? maxDuration : undefined,
      maxPrice: maxPrice < priceMax ? maxPrice : undefined,
      sort: sortBy,
    }),
    [maxDuration, maxPrice, page, searchQuery, selectedCategory, sortBy],
  );

  const { data, error, isFetching, isLoading } = useGetServicesQuery(queryArgs);
  const { data: categories = [] } = useGetServiceCategoriesQuery();

  useEffect(() => {
    setPage(1);
    setLoadedServices([]);
  }, [filterKey]);

  useEffect(() => {
    if (!data) return;

    setLoadedServices((current) => {
      if (data.page === 1) return data.items;

      const existingIds = new Set(current.map((service) => service.id));
      return [...current, ...data.items.filter((service) => !existingIds.has(service.id))];
    });
  }, [data]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !data?.hasMore) return;

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
  const hasActiveFilters = selectedCategory || maxPrice < priceMax || maxDuration < durationMax || searchQuery.trim();
  const priceRangeStyle = getRangeStyle(priceMin, maxPrice, priceMin, priceMax);
  const durationRangeStyle = getRangeStyle(durationMin, maxDuration, durationMin, durationMax);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMaxPrice(priceMax);
    setMaxDuration(durationMax);
    setSortBy('popular');
  };

  const loadMore = () => {
    if (!isFetching && data?.hasMore) {
      setPage((current) => current + 1);
    }
  };

  return (
    <PageShell
      title="Наши услуги"
      description="Каталог массажей, SPA-программ, уходов и лазерной эпиляции из базы RelaxUp."
    >
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
            aria-expanded={isFiltersOpen}
            onClick={() => setIsFiltersOpen((value) => !value)}
          >
            Фильтры{hasActiveFilters ? ' включены' : ''}
          </Button>
          <div className={styles.toolbarMeta}>
            <p>
              Найдено: <strong>{data?.total ?? cards.length}</strong>
            </p>
            <SelectField label="Сортировать" value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
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

              <div className={styles.filterGroup}>
                <SelectField label="Категория" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                  <option value="">Все категории</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className={styles.filterGroup}>
                <h3>Стоимость до</h3>
                <div className={styles.rangeWrap} style={priceRangeStyle}>
                  <input
                    className={`${styles.range} ${styles.rangeMax}`}
                    aria-label="Максимальная стоимость"
                    type="range"
                    min={priceMin}
                    max={priceMax}
                    step={priceStep}
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(Number(event.target.value))}
                  />
                </div>
                <div className={styles.rangeFields}>
                  <span>до {maxPrice.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              <div className={styles.filterGroup}>
                <h3>Длительность до</h3>
                <div className={styles.rangeWrap} style={durationRangeStyle}>
                  <input
                    className={`${styles.range} ${styles.rangeMax}`}
                    aria-label="Максимальная длительность"
                    type="range"
                    min={durationMin}
                    max={durationMax}
                    step={durationStep}
                    value={maxDuration}
                    onChange={(event) => setMaxDuration(Number(event.target.value))}
                  />
                </div>
                <div className={styles.rangeFields}>
                  <span>до {maxDuration} мин</span>
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
            {data?.hasMore ? (
              <div className={styles.moreWrap}>
                <Button variant="secondary" isLoading={isFetching} loadingText="Загружаем..." onClick={loadMore}>
                  Показать еще
                </Button>
              </div>
            ) : null}
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
