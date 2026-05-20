import type { ReviewCardModel } from '../model/types';
import styles from './ReviewCard.module.css';

interface ReviewCardProps {
  review: ReviewCardModel;
}

function stars(rating: number): string {
  const rounded = Math.max(1, Math.min(5, Math.round(rating)));
  return '★'.repeat(rounded);
}

export function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.author
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className={styles.card}>
      <p className={styles.stars}>{stars(review.rating)}</p>
      <p className={styles.text}>"{review.text}"</p>
      <div className={styles.footer}>
        <span className={styles.avatar} aria-hidden="true">{initials}</span>
        <div>
          <p className={styles.author}>{review.author}</p>
          <p className={styles.meta}>{review.role}</p>
        </div>
      </div>
    </article>
  );
}
