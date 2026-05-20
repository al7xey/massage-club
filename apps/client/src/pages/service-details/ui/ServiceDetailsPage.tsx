import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useAddCartItemMutation } from '@/entities/cart';
import { mockReviews } from '@/entities/review';
import { createServiceCardModel, useGetServiceQuery, useGetServicesQuery } from '@/entities/service';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { appRoutes } from '@/shared/routes';
import { Button, LinkButton } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';
import styles from './ServiceDetailsPage.module.css';

export function ServiceDetailsPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [addCartItem] = useAddCartItemMutation();
  const { data: service } = useGetServiceQuery(id, { skip: !id });
  const { data: servicesPage } = useGetServicesQuery({ limit: 4, sort: 'popular' });
  const { data: studios = [] } = useGetStudiosQuery();

  const selected = service ?? servicesPage?.items[0];
  const selectedPrice = selected?.priceRub ?? 0;
  const similar = (servicesPage?.items ?? []).filter((item) => item.id !== selected?.id).map((item) => createServiceCardModel(item));
  const studioCards = studios.slice(0, 2).map(createStudioCardModel);
  const title = selected?.title ?? 'Услуга';
  const description = selected?.description ?? 'Описание услуги загружается из базы данных.';
  const durationLabel = selected?.durationLabel?.trim() || `${selected?.durationMinutes ?? 0} мин`;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

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
    <PageShell title={title} description={description}>
      <section className={styles.top}>
        <div className={styles.gallery}>
          <div className={styles.heroImage}>
            <span>{selected?.category?.name ?? 'Услуга'}</span>
            <Button
              className={styles.favoriteButton}
              size="sm"
              variant="ghost"
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
              onClick={() => setIsFavorite((value) => !value)}
            >
              {isFavorite ? '♥' : '♡'}
            </Button>
          </div>
          <div className={styles.thumbs}>
            {[selected?.category?.name ?? 'Категория', durationLabel, formatPrice(selectedPrice), 'RelaxUp'].map((label, index) => (
              <div className={styles.thumbButton} key={`${label}-${index}`} data-active={index === 0 ? 'true' : undefined}>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className={styles.sideCard}>
          <h2>Стоимость и запись</h2>
          <p className={styles.meta}>
            <span>{durationLabel}</span>
            <span>{selected?.category?.name ?? 'Каталог RelaxUp'}</span>
          </p>
          <div className={styles.prices}>
            <PriceRow tone="base" title="Обычная запись" note="Без преимуществ клуба" price={selectedPrice} />
            <PriceRow tone="club" title="С тарифом 20%" note="ЛЕДИ, МИСТЕР или СЕМЕЙНЫЙ" price={Math.round(selectedPrice * 0.8)} badge="-20%" />
            <PriceRow tone="super" title="С тарифом 30%" note="SUPER-тарифы" price={Math.round(selectedPrice * 0.7)} badge="-30%" />
          </div>
          <Button fullWidth onClick={() => void handleBook()}>
            Записаться
          </Button>
          <Button fullWidth variant="secondary" onClick={() => void handleAddToCart()}>
            В корзину
          </Button>
          <p className={styles.note}>Клубная скидка применяется по активному тарифу. Включенные услуги списываются из подписки.</p>
        </aside>
      </section>

      <section className={styles.description}>
        <div>
          <h2>Об услуге</h2>
          <p>{description}</p>
          {selected?.composition ? (
            <>
              <h3>Состав / этапы</h3>
              <ul className={styles.benefits}>
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
        <aside className={styles.infoPanel}>
          <h3>Важно</h3>
          <ol>
            <li>Формулировки по противопоказаниям и эстетическим процедурам требуют юридической проверки.</li>
            <li>Приходите за 10-15 минут до начала процедуры.</li>
            <li>Итоговая длительность для SPA-программ показана как в исходном прайсе.</li>
          </ol>
        </aside>
      </section>

      <section className={styles.giftBanner}>
        <div>
          <h2>Подарочные сертификаты</h2>
          <p>Скидка на сертификаты зависит от тарифа: 10% или 20%.</p>
          <LinkButton to={appRoutes.certificates()}>Оформить сертификат</LinkButton>
        </div>
      </section>

      {similar.length > 0 ? <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={similar} /> : null}
      <StudioShowcase title="Где пройти процедуру" studios={studioCards} />
      <ReviewsShowcase title="Отзывы гостей" subtitle="Мнения гостей клуба" reviews={mockReviews} />
    </PageShell>
  );
}

function PriceRow({
  badge,
  note,
  price,
  title,
  tone,
}: {
  badge?: string;
  note: string;
  price: number;
  title: string;
  tone: 'base' | 'club' | 'super';
}) {
  return (
    <div data-tone={tone}>
      <div>
        <span>{title} {badge ? <em>{badge}</em> : null}</span>
        <small>{note}</small>
      </div>
      <strong>{formatPrice(price)}</strong>
    </div>
  );
}
