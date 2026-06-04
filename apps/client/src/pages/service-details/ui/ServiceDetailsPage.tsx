import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { pendingCartStorage, useAddCartItemMutation, useGetCartQuery, useRemoveCartItemMutation } from '@/entities/cart';
import { createReviewCardModel, useGetReviewsQuery } from '@/entities/review';
import { createServiceCardModel, type ServiceDto, useGetServiceQuery, useGetServicesQuery } from '@/entities/service';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { buildTariffs, useGetSubscriptionPlansQuery } from '@/entities/subscription';
import { useAuth } from '@/features/auth';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { getFallbackImage } from '@/shared/lib/fallbackImages';
import { resolveMediaUrl } from '@/shared/lib/media';
import { appRoutes } from '@/shared/routes';
import { Button, EmptyState, LinkButton } from '@/shared/ui';
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
  const { data: cartItems = [] } = useGetCartQuery(undefined, { skip: !user });
  const [addCartItem, { isLoading: isAddingToCart }] = useAddCartItemMutation();
  const [removeCartItem, { isLoading: isRemovingFromCart }] = useRemoveCartItemMutation();
  const { data: service, isLoading: isLoadingService } = useGetServiceQuery(id, { skip: !id });
  const { data: servicesPage } = useGetServicesQuery({ limit: 5, sort: 'popular' });
  const { data: studios = [] } = useGetStudiosQuery();
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: reviews = [] } = useGetReviewsQuery();

  const selected = service;
  const selectedPrice = selected?.priceRub ?? 0;
  const regularSubscriptionPrice = selected?.subscriptionPriceRub ?? Math.round(selectedPrice * 0.8);
  const superSubscriptionPrice = selected?.superSubscriptionPriceRub ?? Math.round(selectedPrice * 0.7);
  const similar = (servicesPage?.items ?? [])
    .filter((item) => item.id !== selected?.id)
    .slice(0, 4)
    .map((item) => createServiceCardModel(item));
  const studioCards = studios.slice(0, 2).map(createStudioCardModel);
  const serviceTariffs = buildTariffs(plans).slice(0, 4);
  const reviewCards = reviews.slice(0, 3).map(createReviewCardModel);
  const title = selected?.title ?? 'Услуга';
  const description = selected?.description ?? 'Описание услуги загружается из базы данных.';
  const photoItems = useMemo(() => getServiceGallery(selected), [selected]);
  const activePhoto = photoItems[activePhotoIndex] ?? photoItems[0];
  const cartItemsForService = useMemo(
    () => cartItems.filter((item) => item.service.id === selected?.id),
    [cartItems, selected?.id],
  );
  const selectedCountInCart = cartItemsForService.length;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setActivePhotoIndex(0);
  }, [id]);

  const navigateToAuth = (action: 'cart') => {
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
      pendingCartStorage.set(selected.id);
      navigateToAuth('cart');
      return;
    }

    await addCartItem({ serviceId: selected.id }).unwrap();
  };

  const handleRemoveOneFromCart = async () => {
    const lastItem = cartItemsForService.at(-1);
    if (!lastItem) return;

    await removeCartItem(lastItem.id).unwrap();
  };

  if (isLoadingService) {
    return (
      <PageShell title="Услуга">
        <p>Загружаем услугу...</p>
      </PageShell>
    );
  }

  if (!selected) {
    return (
      <PageShell title="Услуга">
        <EmptyState
          title="Услуга не найдена"
          description="Проверьте ссылку или вернитесь в каталог услуг."
          actions={<LinkButton to={appRoutes.services()}>Все услуги</LinkButton>}
        />
      </PageShell>
    );
  }

  return (
    <PageShell title={title} beforeTitle={<BackButton onClick={() => navigate(-1)} />}>
      <section className={styles.top}>
        <div className={styles.visual}>
          <div
            className={styles.servicePhoto}
            role="img"
            aria-label={`Фото услуги ${title}`}
            style={activePhoto?.url ? { backgroundImage: `url("${activePhoto.url}")` } : undefined}
          />
        </div>

        <aside className={styles.bookingCard}>
          <h2>Стоимость</h2>
          <div className={styles.priceList}>
            <PriceRow title="Разовый визит" note="Цена без клубного тарифа" price={selectedPrice} />
            <PriceRow title="С тарифом" note="Активный тариф даёт скидку 20%" price={regularSubscriptionPrice} badge="-20%" />
            <PriceRow title="С SUPER-тарифом" note="Максимальная клубная скидка 30%" price={superSubscriptionPrice} badge="-30%" featured />
          </div>
          <div className={styles.actions}>
            <LinkButton fullWidth to={`${appRoutes.booking()}?serviceId=${selected.id}`}>
              Записаться
            </LinkButton>
            {selectedCountInCart > 0 ? (
              <div className={styles.cartCounter} aria-label={`В корзине: ${selectedCountInCart}`}>
                <Button variant="secondary" disabled={isRemovingFromCart} onClick={() => void handleRemoveOneFromCart()}>
                  -
                </Button>
                <strong>{selectedCountInCart}</strong>
                <Button variant="secondary" disabled={isAddingToCart} onClick={() => void handleAddToCart()}>
                  +
                </Button>
              </div>
            ) : (
              <Button fullWidth variant="secondary" isLoading={isAddingToCart} onClick={() => void handleAddToCart()}>
                В корзину
              </Button>
            )}
          </div>
          <p className={styles.note}>В карточке услуги показана разовая цена. Скидка применяется после покупки тарифа.</p>
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
      <ReviewsShowcase title="Отзывы гостей" subtitle="Мнения гостей клуба" actionLabel="Смотреть все" reviews={reviewCards} />
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
  const urls = uniqueUrls([service?.imageUrl, ...(service?.galleryUrls ?? [])]);
  const items = urls.length > 0 ? urls : [getFallbackImage('services', service?.category?.slug ?? service?.title ?? 'service')];

  return items.map((url, index) => ({
    label: `Фото ${index + 1}`,
    url: resolveMediaUrl(url),
  }));
}

function uniqueUrls(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((url) => url?.trim()).filter(Boolean))) as string[];
}
