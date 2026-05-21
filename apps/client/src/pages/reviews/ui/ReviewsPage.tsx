import { FormEvent, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth';
import { mockReviews, ReviewCard, type ReviewCardModel, useCreateReviewMutation, useGetReviewsQuery } from '@/entities/review';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { Button, EmptyState, TextAreaField } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './ReviewsPage.module.css';

export function ReviewsPage() {
  const { user } = useAuth();
  const { data: reviews = [], isLoading } = useGetReviewsQuery();
  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const reviewCards = useMemo<ReviewCardModel[]>(
    () =>
      reviews.length > 0
        ? reviews.map((review) => ({
            id: review.id,
            author: review.user?.fullName || 'Гость RelaxUp',
            role: review.service?.title ?? 'Гость клуба',
            text: review.comment || 'Спасибо за заботу и внимательный сервис.',
            date: new Intl.DateTimeFormat('ru-RU').format(new Date(review.createdAt)),
            rating: review.rating,
          }))
        : mockReviews,
    [reviews],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!comment.trim()) {
      setMessage('Напишите отзыв перед отправкой.');
      return;
    }

    try {
      await createReview({ comment: comment.trim(), rating }).unwrap();
      setComment('');
      setRating(5);
      setMessage('Спасибо, отзыв отправлен и появится после модерации.');
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Не удалось отправить отзыв'));
    }
  };

  return (
    <PageShell title="Отзывы гостей">
      <section className={styles.layout}>
        <div className={styles.grid}>
          {isLoading ? <p className={styles.state}>Загружаем отзывы...</p> : null}
          {!isLoading && reviewCards.length === 0 ? (
            <EmptyState title="Отзывов пока нет" description="Когда гости поделятся впечатлениями, они появятся здесь." />
          ) : null}
          {reviewCards.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        <aside className={styles.formCard}>
          <h2>Оставить отзыв</h2>
          {user ? (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.ratingRow} role="radiogroup" aria-label="Оценка">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={value <= rating ? styles.starActive : styles.star}
                    aria-pressed={value === rating}
                    onClick={() => setRating(value)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <TextAreaField label="Ваш отзыв" value={comment} onChange={(event) => setComment(event.target.value)} />
              {message ? <p className={styles.message}>{message}</p> : null}
              <Button isLoading={isSubmitting} loadingText="Отправляем..." type="submit">
                Отправить отзыв
              </Button>
            </form>
          ) : (
            <p className={styles.authHint}>Авторизуйтесь, чтобы написать отзыв о визите.</p>
          )}
        </aside>
      </section>
    </PageShell>
  );
}
