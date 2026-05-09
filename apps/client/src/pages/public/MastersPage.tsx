import { createUiMasterMeta, repeatToLength } from '@/shared/config/publicContent';
import { useGetMastersQuery } from '@/shared/api/servicesApi';
import { HomeCrumb } from '@/shared/ui/public/PublicBlocks';

export function MastersPage() {
  const { data = [], isLoading } = useGetMastersQuery();
  const cards = repeatToLength(data, 4);

  return (
    <main className="page">
      <section className="page-heading">
        <HomeCrumb />
        <h1>Наши мастера</h1>
        <p>
          Откройте для себя мир осознанного ухода. Профессиональные массажи, SPA-ритуалы и эстетическая косметология для вашей
          гармонии.
        </p>
      </section>

      {isLoading ? <p className="state-line">Загрузка мастеров...</p> : null}

      <section className="masters-grid">
        {cards.map((master, index) => {
          const fullName = `${master.firstName} ${master.lastName}`;
          const meta = createUiMasterMeta(master);
          return (
            <article className="master-card" key={`${master.id}-${index}`}>
              <div className={`master-card__image master-card__image--${index % 2 === 0 ? 'a' : 'b'}`}>
                <span className="master-card__badge">{meta.experienceLabel}</span>
              </div>
              <div className="master-card__body">
                <h3>{fullName}</h3>
                <p>{meta.roleLabel}</p>
                <p>
                  ★ {meta.rating} ({meta.reviewsCount} отзывов)
                </p>
                <div className="master-card__slots">
                  {meta.nextSlots.map((slot) => (
                    <span key={slot}>{slot}</span>
                  ))}
                </div>
                <div className="master-card__actions">
                  <button className="ui-btn ui-btn-outline" type="button">
                    Подробнее
                  </button>
                  <button className="ui-btn ui-btn-primary" type="button">
                    Записаться
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
