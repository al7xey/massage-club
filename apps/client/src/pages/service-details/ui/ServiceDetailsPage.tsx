import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { repeatToLength } from '@/shared/lib/collection/repeatToLength';
import { appRoutes } from '@/shared/routes';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import { mockReviews } from '@/entities/review';
import { createServiceCardModel, useGetServiceQuery, useGetServicesQuery } from '@/entities/service';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';
import styles from './ServiceDetailsPage.module.css';

export function ServiceDetailsPage() {
  const { id = '' } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const { data: service } = useGetServiceQuery(id, { skip: !id });
  const { data: services = [] } = useGetServicesQuery();
  const { data: studios = [] } = useGetStudiosQuery();

  const selected = service ?? services[0];
  const similar = repeatToLength(services, 4).map((item, index) => createServiceCardModel(item, index));
  const selectedPrice = selected?.priceRub ?? 3500;
  const studioCards = studios.slice(0, 2).map(createStudioCardModel);
  const title = selected?.title ?? 'Лимфодренажный массаж тела';
  const description =
    selected?.description ??
    'Глубокая проработка тканей, направленная на стимуляцию движения лимфы, восстановление тонуса и снижение отечности.';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  return (
    <PageShell title={title} description={description}>
      <section className={styles.top}>
        <div className={styles.gallery}>
          <div className={styles.heroImage}>
            <span>Массаж</span>
            <button type="button" aria-pressed={isFavorite} aria-label="Добавить в избранное" onClick={() => setIsFavorite((value) => !value)}>
              {isFavorite ? '♥' : '♡'}
            </button>
          </div>
          <div className={styles.thumbs}>
            <span /><span /><span /><span />
          </div>
        </div>

        <aside className={styles.sideCard}>
          <h2>Стоимость и запись</h2>
          <p className={styles.meta}>
            <span>{selected?.durationMinutes ?? 60} минут</span>
            <span>4.9 (48 отзывов)</span>
          </p>
          <div className={styles.prices}>
            <PriceRow tone="base" title="Обычная запись" note="Без преимуществ клуба" price={selectedPrice} />
            <PriceRow tone="club" title="С подпиской" note="Для резидентов клуба" price={Math.round(selectedPrice * 0.8)} badge="-20%" />
            <PriceRow tone="super" title="С SUPER подпиской" note="Максимальная выгода" price={Math.round(selectedPrice * 0.7)} badge="-30%" />
          </div>
          <Link className={styles.primaryButton} to={appRoutes.booking()}>Записаться на сеанс</Link>
          <Link className={styles.outlineButton} to={appRoutes.subscriptions()}>Получить выгоду с подпиской</Link>
          <p className={styles.note}>Подписка позволяет экономить до 15 000 ₽ в месяц при регулярных посещениях.</p>
        </aside>
      </section>

      <section className={styles.description}>
        <div>
          <h2>Об услуге</h2>
          <p>{description}</p>
          <ul className={styles.benefits}>
            <li>Снимает мышечное напряжение</li>
            <li>Улучшает лимфодренаж</li>
            <li>Нормализует сон</li>
            <li>Повышает упругость кожи</li>
          </ul>
        </div>
        <aside className={styles.infoPanel}>
          <h3>Полезно знать</h3>
          <ol>
            <li>Рекомендуем не принимать пищу за 1.5 часа до начала сеанса.</li>
            <li>Приходите за 10-15 минут, чтобы настроиться на процедуру.</li>
            <li>После массажа пейте больше чистой воды для лучшего детокса.</li>
          </ol>
        </aside>
      </section>

      <section className={styles.giftBanner}>
        <div>
          <h2>Подарочные сертификаты</h2>
          <p>Подарите заботу близким — от 2 000 ₽</p>
          <Link className={styles.primaryButton} to={appRoutes.certificates()}>Оформить сертификат</Link>
        </div>
      </section>

      <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={similar} />
      <StudioShowcase title="Где пройти процедуру" studios={studioCards} />
      <ReviewsShowcase
        title="Отзывы наших гостей"
        subtitle="Честные мнения тех, кто уже попробовал"
        reviews={mockReviews}
      />
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
