import type { MasterCardModel } from '../model/types';

interface MasterCardProps {
  master: MasterCardModel;
  imageVariant: 'a' | 'b';
}

export function MasterCard({ master, imageVariant }: MasterCardProps) {
  return (
    <article className="master-card">
      <div className={`master-card__image master-card__image--${imageVariant}`}>
        <span className="master-card__badge">{master.experienceLabel}</span>
      </div>
      <div className="master-card__body">
        <h3>{master.fullName}</h3>
        <p>{master.roleLabel}</p>
        <p>
          ★ {master.rating} ({master.reviewsCount} отзывов)
        </p>
        <div className="master-card__slots">
          {master.nextSlots.map((slot) => (
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
}
