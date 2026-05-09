import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createUiServiceCard, createUiStudioMeta, formatPrice, landingContent, repeatToLength } from '@/shared/config/publicContent';
import { useGetServiceQuery, useGetServicesQuery, useGetStudiosQuery } from '@/shared/api/servicesApi';
import { HomeCrumb, InfoPanel, ReviewCard, SectionHeader, ServiceCard, StudioCard } from '@/shared/ui/public/PublicBlocks';

export function ServiceDetailsPage() {
  const { id = '' } = useParams();
  const { data: service } = useGetServiceQuery(id, { skip: !id });
  const { data: services = [] } = useGetServicesQuery();
  const { data: studios = [] } = useGetStudiosQuery();

  const selected = service ?? services[0];
  const similar = repeatToLength(services, 4).map((item, index) => createUiServiceCard(item, index));
  const selectedPrice = selected?.priceRub ?? 3500;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  return (
    <main className="page">
      <HomeCrumb />

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
              'Глубокая проработка тканей, направленная на стимуляцию движения лимфы. Процедура помогает вывести лишнюю жидкость, восстановить тонус и снизить отечность.'}
          </p>
          <ul className="benefits-list">
            <li>Снимает мышечное напряжение</li>
            <li>Улучшает лимфодренаж</li>
            <li>Нормализует сон</li>
            <li>Повышает упругость кожи</li>
          </ul>
        </div>
        <InfoPanel title="Полезно знать">
          <ol>
            <li>Рекомендуем не принимать пищу за 1.5 часа до сеанса.</li>
            <li>Приходите за 10-15 минут, чтобы настроиться на процедуру.</li>
            <li>После массажа пейте больше чистой воды для лучшего детокса.</li>
          </ol>
        </InfoPanel>
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

      <section className="section">
        <SectionHeader title="Популярные услуги" actionLabel="Смотреть все" />
        <div className="services-grid">
          {similar.map((item, index) => (
            <ServiceCard key={`${item.id}-${index}`} service={item} />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader title="Где пройти процедуру" />
        <div className="studios-list">
          {studios.slice(0, 2).map((studio) => (
            <StudioCard key={studio.id} title={studio.name} address={studio.address} meta={createUiStudioMeta(studio)} />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader title="Отзывы наших гостей" subtitle="Честные мнения тех, кто уже попробовал" actionLabel="Смотреть все" />
        <div className="reviews-grid">
          {landingContent.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>
    </main>
  );
}
