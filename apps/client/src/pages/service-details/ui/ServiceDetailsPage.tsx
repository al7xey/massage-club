import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useAddCartItemMutation } from '@/entities/cart';
import { mockReviews } from '@/entities/review';
import { createServiceCardModel, type ServiceDto, useGetServiceQuery, useGetServicesQuery } from '@/entities/service';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { buildTariffs, useGetSubscriptionPlansQuery } from '@/entities/subscription';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { appRoutes } from '@/shared/routes';
import { Button, LinkButton } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { PlansCarousel } from '@/widgets/plans-carousel';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';
import styles from './ServiceDetailsPage.module.css';

export function ServiceDetailsPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [addCartItem] = useAddCartItemMutation();
  const { data: service } = useGetServiceQuery(id, { skip: !id });
  const { data: servicesPage } = useGetServicesQuery({ limit: 5, sort: 'popular' });
  const { data: studios = [] } = useGetStudiosQuery();
  const { data: plans = [] } = useGetSubscriptionPlansQuery();

  const selected = service ?? servicesPage?.items[0];
  const selectedPrice = selected?.priceRub ?? 0;
  const similar = (servicesPage?.items ?? [])
    .filter((item) => item.id !== selected?.id)
    .slice(0, 4)
    .map((item) => createServiceCardModel(item));
  const studioCards = studios.slice(0, 2).map(createStudioCardModel);
  const serviceTariffs = buildTariffs(plans).slice(0, 4);
  const title = selected?.title ?? 'Услуга';
  const description = selected?.description ?? 'Описание услуги загружается из базы данных.';
  const durationLabel = selected?.durationLabel?.trim() || `${selected?.durationMinutes ?? 0} мин`;
  const photoItems = useMemo(() => getServiceGallery(selected), [selected]);
  const activePhoto = photoItems[activePhotoIndex] ?? photoItems[0];
  const displayDuration = getDurationDisplay(selected?.durationMinutes, durationLabel);
  const categoryLabel = getServiceCategoryLabel(selected);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setActivePhotoIndex(0);
  }, [id]);

  const showPreviousPhoto = () => {
    setActivePhotoIndex((index) => (index === 0 ? photoItems.length - 1 : index - 1));
  };

  const showNextPhoto = () => {
    setActivePhotoIndex((index) => (index + 1) % photoItems.length);
  };

  const navigateToAuth = (action: 'book' | 'cart') => {
    navigate(appRoutes.login(), {
      state: {
        action,
        backgroundLocation: location,
        from: appRoutes.serviceDetails(id),
        serviceId: selected?.id ?? id,
      },
    });
  };

  const handleAddToCart = async () => {
    if (!selected) return;
    if (!user) {
      navigateToAuth('cart');
      return;
    }

    await addCartItem({ serviceId: selected.id }).unwrap();
    navigate(appRoutes.cart());
  };

  const handleBook = async () => {
    if (!selected) return;
    if (!user) {
      navigateToAuth('book');
      return;
    }

    await addCartItem({ serviceId: selected.id }).unwrap();
    navigate(`${appRoutes.booking()}?serviceId=${selected.id}`);
  };

  return (
    <PageShell title={title}>
      <section className={styles.top}>
        <div className={styles.visual}>
          <div
            className={styles.servicePhoto}
            data-tone={activePhoto?.tone}
            role="img"
            aria-label={`Фото услуги ${title}`}
            style={activePhoto?.url ? { backgroundImage: `url("${activePhoto.url}")` } : undefined}
          />
          <div className={styles.photoBadges}>
            <span>{categoryLabel}</span>
            <span>{displayDuration}</span>
          </div>
          <div className={styles.galleryControls}>
            <button type="button" aria-label="Предыдущее фото" onClick={showPreviousPhoto}>
              ←
            </button>
            <span>
              {activePhotoIndex + 1} / {photoItems.length}
            </span>
            <button type="button" aria-label="Следующее фото" onClick={showNextPhoto}>
              →
            </button>
          </div>
          <div className={styles.galleryDots}>
            {photoItems.map((photo, index) => (
              <button
                key={`${photo.label}-${index}`}
                type="button"
                aria-label={`Показать фото ${index + 1}`}
                aria-pressed={index === activePhotoIndex}
                onClick={() => setActivePhotoIndex(index)}
              />
            ))}
          </div>
        </div>

        <aside className={styles.bookingCard}>
          <h2>Стоимость</h2>
          <div className={styles.priceList}>
            <PriceRow title="Разовый визит" note="Без клубного тарифа" price={selectedPrice} />
            <PriceRow title="Клубная цена" note="Тарифы 20%" price={Math.round(selectedPrice * 0.8)} badge="-20%" />
            <PriceRow title="SUPER-тариф" note="Максимальная выгода" price={Math.round(selectedPrice * 0.7)} badge="-30%" featured />
          </div>
          <div className={styles.actions}>
            <Button fullWidth onClick={() => void handleBook()}>
              Записаться
            </Button>
            <Button fullWidth variant="secondary" onClick={() => void handleAddToCart()}>
              В корзину
            </Button>
          </div>
          <p className={styles.note}>Клубная цена применяется по активному тарифу.</p>
        </aside>
      </section>

      <section className={styles.description}>
        <div>
          <h2>Об услуге</h2>
          <p>{description}</p>
          {selected?.composition ? (
            <>
              <h3>Состав / этапы</h3>
              <ul className={styles.composition}>
                {selected.composition
                  .split(';')
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .map((item) => (
                    <li key={item}>{item}</li>
                  ))}
              </ul>
            </>
          ) : null}
        </div>
      </section>

      {serviceTariffs.length > 0 ? (
        <PlansCarousel
          title="Тарифы клуба"
          items={serviceTariffs}
          dotIdPrefix="service-details-plans"
          topAction={
            <LinkButton size="sm" to={appRoutes.subscriptions()} variant="secondary">
              Смотреть все
            </LinkButton>
          }
        />
      ) : null}

      {similar.length > 0 ? <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={similar} /> : null}
      <StudioShowcase title="Где пройти процедуру" actionLabel="Подробнее" studios={studioCards} />
      <ReviewsShowcase title="Отзывы гостей" subtitle="Мнения гостей клуба" actionLabel="Смотреть все" reviews={mockReviews} />
    </PageShell>
  );
}

function PriceRow({
  badge,
  featured = false,
  note,
  price,
  title,
}: {
  badge?: string;
  featured?: boolean;
  note: string;
  price: number;
  title: string;
}) {
  return (
    <div className={styles.priceRow} data-featured={featured ? 'true' : undefined}>
      <div className={styles.priceCopy}>
        <span>
          {title}
          {badge ? <em>{badge}</em> : null}
        </span>
        <small>{note}</small>
      </div>
      <strong className={styles.priceValue}>{formatPrice(price)}</strong>
    </div>
  );
}

function getServiceGallery(service: ServiceDto | undefined) {
  const source = service as (ServiceDto & { photoUrl?: string; photoUrls?: string[] }) | undefined;
  const urls = source?.photoUrls?.length ? source.photoUrls : [source?.photoUrl].filter(Boolean);

  return [0, 1, 2].map((index) => ({
    label: `Фото ${index + 1}`,
    tone: index,
    url: urls[index],
  }));
}

function getDurationDisplay(durationMinutes?: number, fallback = '') {
  if (durationMinutes) {
    return `${durationMinutes} минут`;
  }

  const match = fallback.match(/\d+/);
  return match ? `${match[0]} минут` : fallback;
}

function getServiceCategoryLabel(service: ServiceDto | undefined) {
  return service?.category?.name ?? 'Массаж для женщин';
}
