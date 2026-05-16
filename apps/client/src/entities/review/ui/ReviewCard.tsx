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
  return (
    <article className={styles.card}>
      <p className={styles.author}>{review.author}</p>
      <p className={styles.stars}>{stars(review.rating)}</p>
      <p className={styles.text}>"{review.text}"</p>
      <p className={styles.meta}>{review.role}</p>
      <p className={styles.meta}>{review.date}</p>
    </article>
  );
}
