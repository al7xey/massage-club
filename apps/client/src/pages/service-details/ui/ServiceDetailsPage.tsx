import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HomeBreadcrumb } from '@/shared/ui/breadcrumbs/HomeBreadcrumb';
import { formatPrice } from '@/shared/lib/currency/formatPrice';
import { repeatToLength } from '@/shared/lib/collection/repeatToLength';
import { mockReviews } from '@/entities/review';
import { createServiceCardModel, useGetServiceQuery, useGetServicesQuery } from '@/entities/service';
import { createStudioCardModel, useGetStudiosQuery } from '@/entities/studio';
import { ReviewsShowcase } from '@/widgets/reviews-showcase';
import { ServiceShowcase } from '@/widgets/service-showcase';
import { StudioShowcase } from '@/widgets/studio-showcase';

export function ServiceDetailsPage() {
  const { id = '' } = useParams();
  const { data: service } = useGetServiceQuery(id, { skip: !id });
  const { data: services = [] } = useGetServicesQuery();
  const { data: studios = [] } = useGetStudiosQuery();

  const selected = service ?? services[0];
  const similar = repeatToLength(services, 4).map((item, index) =>
    createServiceCardModel(item, index),
  );
  const selectedPrice = selected?.priceRub ?? 3500;
  const studioCards = studios.slice(0, 2).map(createStudioCardModel);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  return (
    <main className="page">
      <HomeBreadcrumb />

      <section className="service-details-top">
        <div>
          <div className="service-hero-image">
            <span className="service-hero-image__badge">Массаж</span>
            <button className="service-hero-image__fav" type="button" aria-label="Добавить в избранное">
              ♡
            </button>
          </div>
          <div className="service-thumbs">
            <div className="service-thumb service-thumb--1" />
            <div className="service-thumb service-thumb--2" />
            <div className="service-thumb service-thumb--3" />
            <div className="service-thumb service-thumb--4" />
          </div>
        </div>

        <aside className="service-side-card">
          <h1>{selected?.title ?? 'Лимфодренажный массаж тела'}</h1>
          <p className="service-side-card__meta">
            <span>◷ {selected?.durationMinutes ?? 60} минут</span>
            <span>☆ 4.9 (48 отзывов)</span>
          </p>
          <div className="service-prices">
            <div>
              <div>
                <span>Обычная запись</span>
                <small>Без преимуществ клуба</small>
              </div>
              <strong>{formatPrice(selectedPrice)}</strong>
            </div>
            <div>
              <div>
                <span>
                  С подпиской <em>-20%</em>
                </span>
                <small>Для резидентов клуба</small>
              </div>
              <strong>{formatPrice(Math.round(selectedPrice * 0.8))}</strong>
            </div>
            <div>
              <div>
                <span>
                  С SUPER подпиской <em>-30%</em>
                </span>
                <small>Максимальная выгода</small>
              </div>
              <strong>{formatPrice(Math.round(selectedPrice * 0.7))}</strong>
            </div>
          </div>
          <button className="ui-btn ui-btn-primary ui-btn-block" type="button">
            Записаться на сеанс
          </button>
          <button className="ui-btn ui-btn-outline ui-btn-block" type="button">
            Получить выгоду с подпиской
          </button>
          <p className="service-side-card__note">Подписка позволяет экономить до 15 000 ₽ в месяц.</p>
        </aside>
      </section>

      <section className="service-description">
        <div>
          <h2>Об услуге</h2>
          <p>
            {selected?.description ??
              'Глубокая проработка тканей, направленная на стимуляцию движения лимфы. ' +
                'Процедура помогает вывести лишнюю жидкость, восстановить тонус и снизить отечность.'}
          </p>
          <ul className="benefits-list">
            <li>Снимает мышечное напряжение</li>
            <li>Улучшает лимфодренаж</li>
            <li>Нормализует сон</li>
            <li>Повышает упругость кожи</li>
          </ul>
        </div>
        <aside className="info-panel">
          <h3>Полезно знать</h3>
          <ol>
            <li>Рекомендуем не принимать пищу за 1.5 часа до сеанса.</li>
            <li>Приходите за 10-15 минут, чтобы настроиться на процедуру.</li>
            <li>После массажа пейте больше чистой воды для лучшего детокса.</li>
          </ol>
        </aside>
      </section>

      <section className="gift-banner gift-banner--compact">
        <div>
          <h2>Подарочные сертификаты</h2>
          <p>Подарите заботу близким — от 2 000 ₽</p>
          <button className="ui-btn ui-btn-primary" type="button">
            Оформить сертификат
          </button>
        </div>
        <div className="gift-banner__icon" aria-hidden>
          🎁
        </div>
      </section>

      <ServiceShowcase title="Популярные услуги" actionLabel="Смотреть все" services={similar} />
      <StudioShowcase title="Где пройти процедуру" studios={studioCards} />
      <ReviewsShowcase
        title="Отзывы наших гостей"
        subtitle="Честные мнения тех, кто уже попробовал"
        actionLabel="Смотреть все"
        reviews={mockReviews}
      />
    </main>
  );
}
