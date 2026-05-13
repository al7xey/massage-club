import type { StudioCardModel } from '../model/types';

interface StudioCardProps {
  studio: StudioCardModel;
}

export function StudioCard({ studio }: StudioCardProps) {
  return (
    <article className="studio-card">
      <div className="studio-card__icon" aria-hidden>
        •
      </div>
      <div className="studio-card__content">
        <h3>{studio.title}</h3>
        <p>{studio.address}</p>
        <p>{studio.openLabel}</p>
      </div>
      <button className="ui-btn ui-btn-outline" type="button">
        Записаться
      </button>
    </article>
  );
}
