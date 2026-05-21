import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { mockReviews } from '@/entities/review';
import { createServiceCardModel } from '@/entities/service';
import { createStudioCardModel } from '@/entities/studio';
import { useGetMasterQuery } from '@/entities/master';
import { appRoutes } from '@/shared/routes';
import { LinkButton, EmptyState } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';
import styles from './MasterDetailsPage.module.css';

export function MasterDetailsPage() {
  const { id = '' } = useParams();
  const { data: master, isLoading } = useGetMasterQuery(id, { skip: !id });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  const services = master?.services ?? [];
  const fullName = master ? `${master.firstName} ${master.lastName}` : 'Мастер';
  const studioCards = master?.studio ? [createStudioCardModel(master.studio)] : [];
  const serviceCards = useMemo(
    () => services.map((service) => createServiceCardModel(service)),
    [services],
  );
  const primaryService = services[0] ?? null;
  const totalServices = services.length;
  const summary =
    master?.bio?.trim() ||
    (totalServices > 0
      ? `Специалист работает с ${totalServices} направлениями RelaxUp и помогает подобрать комфортный формат восстановления.`
      : 'Профиль мастера загружается.');

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
    <PageShell title={fullName} description={summary}>
      <section className={styles.top}>
        <div className={styles.profilePanel}>
          <div className={styles.heroImage} aria-label={fullName} role="img">
            <span>{master.studio?.name ?? 'RelaxUp'}</span>
          </div>
          <div className={styles.thumbs}>
            {[`Услуг: ${totalServices}`, primaryService ? `${primaryService.durationMinutes} мин` : 'SPA и массаж', master.isActive ? 'Активен' : 'Неактивен', 'RelaxUp'].map(
              (label, index) => (
                <div className={styles.thumbItem} key={`${label}-${index}`} data-active={index === 0 ? 'true' : undefined}>
                  <span>{label}</span>
                </div>
              ),
            )}
          </div>
        </div>

        <aside className={styles.sideCard}>
          <span className={styles.roleLabel}>Мастер массажа и SPA</span>
          <h2>{fullName}</h2>
          <p className={styles.meta}>
            <span>{master.studio?.name ?? 'Студия RelaxUp'}</span>
            <span>{totalServices} услуг в профиле</span>
          </p>
          <div className={styles.facts}>
            <div>
              <span>Специализация</span>
              <strong>{primaryService?.title ?? 'Персональный подбор ухода'}</strong>
            </div>
            <div>
              <span>Студия</span>
              <strong>{master.studio?.city ?? 'Астрахань'}</strong>
            </div>
          </div>
          <LinkButton className={styles.ctaButton} fullWidth to={appRoutes.booking()}>
            Записаться к мастеру
          </LinkButton>
          <LinkButton className={styles.ctaButton} fullWidth to={appRoutes.masters()} variant="secondary">
            Все мастера
          </LinkButton>
          <p className={styles.note}>Подберите услугу в каталоге или перейдите к записи, чтобы выбрать удобный слот и подтвердить визит.</p>
        </aside>
      </section>

      <section className={styles.description}>
        <div>
          <h2>О мастере</h2>
          <p>{summary}</p>
          {services.length > 0 ? (
            <>
              <h3>Направления работы</h3>
              <ul className={styles.benefits}>
                {services.map((service) => (
                  <li key={service.id}>
                    <strong>{service.title}</strong>
                    <span>
                      {service.durationMinutes} мин · {service.priceRub.toLocaleString('ru-RU')} ₽
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
        <aside className={styles.infoPanel}>
          <h3>Как проходит запись</h3>
          <ol>
            <li>Выберите услугу, подходящую по цели и длительности.</li>
            <li>Перейдите к записи и укажите удобные студию, дату и время.</li>
            <li>На этапе выбора мастера можно подтвердить именно этого специалиста, если слот доступен.</li>
          </ol>
        </aside>
      </section>

      {serviceCards.length > 0 ? <ServiceShowcase title="Услуги мастера" actionLabel="Смотреть каталог" services={serviceCards} /> : null}
      {studioCards.length > 0 ? <StudioShowcase title="Где принимает мастер" actionLabel="Посмотреть студию" studios={studioCards} /> : null}
      <ReviewsShowcase title="Отзывы гостей" subtitle="Впечатления клиентов клуба" actionLabel="Смотреть все" reviews={mockReviews} />
    </PageShell>
  );
}
