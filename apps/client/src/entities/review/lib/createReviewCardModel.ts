import type { ReviewCardModel, ReviewDto } from '../model/types';

export function createReviewCardModel(review: ReviewDto): ReviewCardModel {
  return {
    id: review.id,
    author: review.user?.fullName || 'Гость RelaxUp',
    role: review.service?.title ?? 'Гость клуба',
    text: review.comment || 'Спасибо за заботу и внимательный сервис.',
    date: new Intl.DateTimeFormat('ru-RU').format(new Date(review.createdAt)),
    rating: review.rating,
  };
}
