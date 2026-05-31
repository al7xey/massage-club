import { useMemo, useState } from 'react';
import { createReviewCardModel, useGetReviewsQuery } from '@/entities/review';
import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { buildTariffs, useGetSubscriptionPlansQuery } from '@/entities/subscription';
import { fallbackImages } from '@/shared/lib/fallbackImages';
import { resolveMediaUrl } from '@/shared/lib/media';
import { appRoutes } from '@/shared/routes';
import { EmptyState, LinkButton } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { PlansCarousel } from '@/widgets/plans-carousel';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import styles from './StudiosPage.module.css';

export function StudiosPage() {
  const { data = [], isLoading } = useGetStudiosQuery();
  const { data: servicesPage } = useGetServicesQuery({ limit: 4, sort: 'popular' });
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: reviews = [] } = useGetReviewsQuery();

  const studios = useMemo(() => data.map((studio, index) => createStudioCardModel(studio, index)), [data]);
  const mapSrc = useMemo(() => buildYandexMapSrc(studios), [studios]);
  const popularServices = (servicesPage?.items ?? []).map((service) => createServiceCardModel(service));
  const studioTariffs = buildTariffs(plans).slice(0, 4);
  const reviewCards = reviews.slice(0, 3).map(createReviewCardModel);

  return (
    <PageShell title="Наши студии">
      {isLoading ? <p className={styles.state}>Загрузка студий...</p> : null}
      {!isLoading && studios.length === 0 ? (
        <EmptyState title="Студии не найдены" description="Список студий обновится после синхронизации базы." />
      ) : null}

      <section className={styles.studiosList} aria-label="Список студий">
        {studios.map((studio, index) => (
          <article className={styles.studioSection} key={studio.id}>
            <StudioGallery photos={getStudioGallery(studio, index)} studioTitle={studio.title} />

            <div className={styles.studioInfo}>
              <h2>{studio.title}</h2>
              <p>{getStudioAddress(studio)}</p>
              <dl>
                <div>
                  <dt>График</dt>
                  <dd>{studio.openLabel}</dd>
                </div>
                <div>
                  <dt>Телефон</dt>
                  <dd>{studio.phone}</dd>
                </div>
              </dl>
              <LinkButton className={styles.bookButton} to={`${appRoutes.booking()}?studioId=${studio.id}`}>
                Записаться
              </LinkButton>
            </div>
          </article>
        ))}
      </section>

      {popularServices.length > 0 ? <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={popularServices} /> : null}

      {studioTariffs.length > 0 ? (
        <PlansCarousel
          title="Тарифы клуба"
          items={studioTariffs}
          dotIdPrefix="studios-plans-page"
          topAction={
            <LinkButton size="sm" to={appRoutes.subscriptions()} variant="secondary">
              Смотреть все
            </LinkButton>
          }
        />
      ) : null}

      <ReviewsShowcase title="Отзывы гостей" subtitle="Мнения гостей клуба" actionLabel="Смотреть все" reviews={reviewCards} />

      {studios.length > 0 ? (
        <section className={styles.mapSection} id="map">
          <div className={styles.mapFrame}>
            <iframe title="Карта студий RelaxUp" src={mapSrc} loading="lazy" />
          </div>
          <div className={styles.mapList}>
            <h2>Адреса на карте</h2>
            {studios.map((studio) => (
              <article key={studio.id}>
                <strong>{studio.title}</strong>
                <span>{studio.address}</span>
                <a className={styles.mapLink} href={buildYandexRouteUrl(studio.coordinates.lat, studio.coordinates.lon)} target="_blank" rel="noreferrer">
                  Открыть маршрут
                </a>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}

function buildYandexMapSrc(studios: Array<ReturnType<typeof createStudioCardModel>>) {
  const center = getMapCenter(studios);
  const points = studios.map((studio) => `${studio.coordinates.lon},${studio.coordinates.lat},pm2rdm`).join('~');
  const params = new URLSearchParams({
    l: 'map',
    ll: `${center.lon},${center.lat}`,
    pt: points,
    z: '13',
  });

  return `https://yandex.ru/map-widget/v1/?${params.toString()}`;
}

function buildYandexRouteUrl(lat: number, lon: number) {
  return `https://yandex.ru/maps/?rtext=~${lat},${lon}&rtt=auto`;
}

function getMapCenter(studios: Array<ReturnType<typeof createStudioCardModel>>) {
  if (studios.length === 0) {
    return { lat: 46.3492, lon: 48.0409 };
  }

  const total = studios.reduce(
    (sum, studio) => ({
      lat: sum.lat + studio.coordinates.lat,
      lon: sum.lon + studio.coordinates.lon,
    }),
    { lat: 0, lon: 0 },
  );

  return {
    lat: total.lat / studios.length,
    lon: total.lon / studios.length,
  };
}

function getStudioGallery(studio: ReturnType<typeof createStudioCardModel>, index: number) {
  const photos = uniqueUrls(studio.photoUrls.length > 0 ? studio.photoUrls : [studio.photoUrl]);
  const items = photos.length > 0 ? photos : fallbackImages.studios;

  return items.map((item, photoIndex) => ({
    label: `Фото ${photoIndex + 1}`,
    url: resolveMediaUrl(item),
  }));
}

function uniqueUrls(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((url) => url?.trim()).filter(Boolean))) as string[];
}

function StudioGallery({
  photos,
  studioTitle,
}: {
  photos: ReturnType<typeof getStudioGallery>;
  studioTitle: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePhoto = photos[activeIndex] ?? photos[0];

  const showPrevious = () => {
    setActiveIndex((index) => (index === 0 ? photos.length - 1 : index - 1));
  };

  const showNext = () => {
    setActiveIndex((index) => (index + 1) % photos.length);
  };

  return (
    <div className={styles.gallery} aria-label={`Фото студии ${studioTitle}`}>
      <div
        className={styles.photo}
        role="img"
        aria-label={`${studioTitle}, фото ${activeIndex + 1}`}
        style={activePhoto?.url ? { backgroundImage: `url("${activePhoto.url}")` } : undefined}
      />
      <div className={styles.galleryControls}>
        <button type="button" aria-label="Предыдущее фото" onClick={showPrevious}>
          ←
        </button>
        <span>
          {activeIndex + 1} / {photos.length}
        </span>
        <button type="button" aria-label="Следующее фото" onClick={showNext}>
          →
        </button>
      </div>
      <div className={styles.galleryDots}>
        {photos.map((photo, index) => (
          <button
            key={`${photo.label}-${index}`}
            type="button"
            aria-label={`Показать фото ${index + 1}`}
            aria-pressed={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

function getStudioAddress(studio: ReturnType<typeof createStudioCardModel>) {
  if (!studio.cityChip || studio.address.toLowerCase().includes(studio.cityChip.toLowerCase())) {
    return studio.address;
  }

  return `${studio.cityChip}, ${studio.address}`;
}
