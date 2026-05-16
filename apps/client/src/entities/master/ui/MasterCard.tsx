import type { MasterCardModel } from '../model/types';
import styles from './MasterCard.module.css';

interface MasterCardProps {
  master: MasterCardModel;
  imageVariant: 'a' | 'b';
}

export function MasterCard({ master, imageVariant }: MasterCardProps) {
  return (
    <article className={styles.card} data-variant={imageVariant}>
      <div className={styles.media}>
        <span className={styles.badge}>{master.experienceLabel}</span>
      </div>
      <div className={styles.body}>
        <h3>{master.fullName}</h3>
        <p className={styles.role}>{master.roleLabel}</p>
        <p className={styles.rating}>★★★★★ <strong>{master.rating}</strong> ({master.reviewsCount} отзывов)</p>
        <p className={styles.slotTitle}>Ближайшее время</p>
        <div className={styles.slots}>
          {master.nextSlots.slice(0, 3).map((slot) => (
            <span key={slot}>{slot}</span>
          ))}
        </div>
        <p className={styles.summary}>{master.summary}</p>
        <div className={styles.actions}>
          <button className={styles.secondaryButton} type="button">Подробнее</button>
          <button className={styles.primaryButton} type="button">Записаться</button>
        </div>
      </div>
    </article>
  );
}
