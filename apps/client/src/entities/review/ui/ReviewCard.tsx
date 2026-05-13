import type { ReviewCardModel } from '../model/types';

interface ReviewCardProps {
  review: ReviewCardModel;
}

function stars(rating: number): string {
  const rounded = Math.max(1, Math.min(5, Math.round(rating)));
  return '★'.repeat(rounded);
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="review-card">
      <p className="review-card__author">{review.author}</p>
      <p className="review-card__stars">{stars(review.rating)}</p>
      <p className="review-card__text">"{review.text}"</p>
      <p className="review-card__meta">{review.role}</p>
      <p className="review-card__meta">{review.date}</p>
    </article>
  );
}
