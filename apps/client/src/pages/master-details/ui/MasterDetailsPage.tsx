import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetMasterQuery } from '@/entities/master';
import { createReviewCardModel, useGetReviewsQuery } from '@/entities/review';
import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { resolveMediaUrl } from '@/shared/lib/media';
import { appRoutes } from '@/shared/routes';
import { EmptyState, LinkButton } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';
import styles from './MasterDetailsPage.module.css';

export function MasterDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: master, isLoading } = useGetMasterQuery(id, { skip: !id });
  const { data: servicesPage } = useGetServicesQuery({ limit: 4, sort: 'popular' });
  const { data: studios = [] } = useGetStudiosQuery();
  const { data: reviews = [] } = useGetReviewsQuery();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  const fullName = master ? `${master.firstName} ${master.lastName}` : 'Мастер';
  const summary = master?.bio?.trim() || 'Информация о мастере скоро появится.';
  const popularServices = (servicesPage?.items ?? []).map((service) => createServiceCardModel(service));
  const studioCards = studios.slice(0, 2).map(createStudioCardModel);
  const reviewCards = reviews.slice(0, 3).map(createReviewCardModel);
  const photos = useMemo(
    () => {
      const urls = uniqueUrls([master?.photoUrl, ...(master?.photoUrls ?? [])]);
      return urls.map(resolveMediaUrl);
    },
    [master],
  );
  const activePhoto = photos[activePhotoIndex];
  const initials = getInitials(fullName);

  useEffect(() => {
    setActivePhotoIndex(0);
  }, [id, photos.length]);

  if (isLoading) {
    return (
      <PageShell title="Наши мастера">
        <p className={styles.state}>Загружаем профиль мастера...</p>
      </PageShell>
    );
  }

  if (!master) {
    return (
      <PageShell title="Наши мастера">
        <EmptyState
          title="Мастер не найден"
          description="Проверьте ссылку или вернитесь к списку специалистов."
          actions={<LinkButton to={appRoutes.masters()}>Все мастера</LinkButton>}
        />
      </PageShell>
    );
  }

  return (
    <PageShell title={fullName} beforeTitle={<BackButton onClick={() => navigate(-1)} />}>
      <section className={styles.hero}>
        <div
          className={styles.portrait}
          aria-label={`Фото мастера ${fullName}`}
          role="img"
          style={activePhoto ? { backgroundImage: `url("${activePhoto}")` } : undefined}
        >
          {activePhoto ? null : <div className={styles.portraitPlaceholder}>{initials}</div>}
          {photos.length > 1 ? (
            <div className={styles.galleryControls}>
              <button type="button" aria-label="Предыдущее фото" onClick={() => setActivePhotoIndex((index) => (index === 0 ? photos.length - 1 : index - 1))}>
                <ArrowIcon direction="left" />
              </button>
              <span>
                {activePhotoIndex + 1} / {photos.length}
              </span>
              <button type="button" aria-label="Следующее фото" onClick={() => setActivePhotoIndex((index) => (index + 1) % photos.length)}>
                <ArrowIcon direction="right" />
              </button>
            </div>
          ) : null}
        </div>

        <div className={styles.profile}>
          {master.specialization ? <span className={styles.roleLabel}>{master.specialization}</span> : null}
          <p className={styles.lead}>{summary}</p>

          {master.services?.length || master.studio?.name ? (
            <div className={styles.stats}>
              {master.services?.length ? (
                <div>
                  <span>Услуги</span>
                  <strong>{master.services.length}</strong>
                </div>
              ) : null}
              {master.studio?.name ? (
                <div>
                  <span>Студия</span>
                  <strong>{master.studio.name}</strong>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className={styles.actions}>
            <LinkButton fullWidth to={appRoutes.booking()}>
              Записаться к мастеру
            </LinkButton>
            <LinkButton fullWidth to={appRoutes.masters()} variant="secondary">
              Все мастера
            </LinkButton>
          </div>
        </div>

      </section>

      <ReviewsShowcase title="Отзывы гостей" actionLabel="Смотреть все" reviews={reviewCards} />

      {popularServices.length > 0 ? <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={popularServices} /> : null}
      <StudioShowcase title="Наши студии" actionLabel="Подробнее" studios={studioCards} />
    </PageShell>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.backButton} type="button" aria-label="Назад" onClick={onClick}>
      <svg className={styles.backIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M19 12H5" />
        <path d="m11 6-6 6 6 6" />
      </svg>
    </button>
  );
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg className={styles.arrowIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {direction === 'left' ? (
        <>
          <path d="M19 12H5" />
          <path d="m11 6-6 6 6 6" />
        </>
      ) : (
        <>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </>
      )}
    </svg>
  );
}

function uniqueUrls(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((url) => url?.trim()).filter(Boolean))) as string[];
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
