import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetMasterQuery } from '@/entities/master';
import { mockReviews } from '@/entities/review';
import { createServiceCardModel, useGetServicesQuery } from '@/entities/service';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { appRoutes } from '@/shared/routes';
import { EmptyState, LinkButton } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';
import styles from './MasterDetailsPage.module.css';

export function MasterDetailsPage() {
  const { id = '' } = useParams();
  const { data: master, isLoading } = useGetMasterQuery(id, { skip: !id });
  const { data: servicesPage } = useGetServicesQuery({ limit: 4, sort: 'popular' });
  const { data: studios = [] } = useGetStudiosQuery();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  const fullName = master ? `${master.firstName} ${master.lastName}` : 'Мастер';
  const summary = master?.bio?.trim() || 'Мастер массажа и SPA, который подбирает темп, давление и формат процедуры под состояние гостя.';
  const stats = getMasterStats(id);
  const popularServices = (servicesPage?.items ?? []).map((service) => createServiceCardModel(service));
  const studioCards = studios.slice(0, 2).map(createStudioCardModel);

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
    <PageShell title={fullName}>
      <section className={styles.hero}>
        <div className={styles.portrait} aria-label={`Фото мастера ${fullName}`} role="img">
          <span>{master.studio?.name ?? 'Massage Club'}</span>
        </div>

        <div className={styles.profile}>
          <span className={styles.roleLabel}>Мастер массажа и SPA</span>
          <p className={styles.lead}>{summary}</p>

          <div className={styles.stats}>
            <div>
              <span>Стаж</span>
              <strong>{stats.experience}</strong>
            </div>
            <div>
              <span>Отзывы</span>
              <strong>{stats.rating} · {stats.reviewsCount} отзывов</strong>
            </div>
            <div>
              <span>Студия</span>
              <strong>{master.studio?.name ?? 'Massage Club'}</strong>
            </div>
          </div>

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

      <ReviewsShowcase title="Отзывы гостей" actionLabel="Смотреть все" reviews={mockReviews} />

      {popularServices.length > 0 ? <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={popularServices} /> : null}
      <StudioShowcase title="Наши студии" actionLabel="Подробнее" studios={studioCards} />
    </PageShell>
  );
}

function getMasterStats(id: string) {
  const seed = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const experience = 5 + (seed % 4);
  const reviewsCount = 42 + (seed % 30);
  const rating = seed % 3 === 0 ? '5.0' : '4.9';

  return {
    experience: `Стаж ${experience}+ лет`,
    rating,
    reviewsCount,
  };
}
